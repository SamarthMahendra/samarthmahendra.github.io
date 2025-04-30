// Unified voice + text chatbot frontend

let ws = null;
let audioContext = null;
let scriptNode = null;
let micStream = null;
let pcmFloat32Chunks = [];
let isRecording = false;
let audioDeltaChunks = [];

const chatbotContainer = document.getElementById('chatbot-container');
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');
const micButton = document.getElementById('mic-button');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotFullscreen = document.getElementById('chatbot-fullscreen');

function setupWebSocket() {
    const wsUrl = (location.protocol === 'https:' ? 'wss://' : 'ws://') + 'localhost:8002/ws/voicechat';
    ws = new WebSocket(wsUrl);
    ws.onopen = () => console.log('[WebSocket connected]');
    ws.onmessage = (event) => handleServerEvent(JSON.parse(event.data));
    ws.onclose = () => console.log('[WebSocket closed]');
    ws.onerror = (e) => console.error('[WebSocket error]', e);
}

function updateBotMessage(text) {
    let botMessages = chatbotMessages.querySelectorAll('.bot-message');
    if (botMessages.length > 0) {
        botMessages[botMessages.length - 1].textContent = text;
    } else {
        addMessage(text, 'bot');
    }
}

function finalizeBotMessage(text) {
    updateBotMessage(text); // Final text update (optional to separate)
}

setupWebSocket();

chatbotToggle.addEventListener('click', () => {
    chatbotContainer.classList.toggle('active');
});
chatbotClose.addEventListener('click', () => {
    chatbotContainer.classList.remove('active');
});
chatbotSend.addEventListener('click', sendTextMessage);
chatbotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendTextMessage();
    }
});
micButton.addEventListener('click', toggleRecording);
chatbotFullscreen.addEventListener('click', () => {
    chatbotContainer.classList.toggle('fullscreen');
});

function sendTextMessage() {
    const text = chatbotInput.value.trim();
    if (text && ws && ws.readyState === WebSocket.OPEN) {
        addMessage(text, 'user');
        chatbotInput.value = '';
        ws.send(JSON.stringify({
            type: "conversation.item.create",
            item: {
                type: "message",
                role: "user",
                content: [{ type: "input_text", text }]
            }
        }));
        // IMPORTANT: Only text modality for typed messages
        setTimeout(() => {
            ws.send(JSON.stringify({ 
                type: "response.create", 
                response: { modalities: ["text"] } 
            }));
        }, 100);
    }
}

function toggleRecording() {
    isRecording ? stopRecording() : startRecording();
}

async function startRecording() {
    pcmFloat32Chunks = [];
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(micStream);
    scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
    source.connect(scriptNode);
    scriptNode.connect(audioContext.destination);
    scriptNode.onaudioprocess = (e) => {
        pcmFloat32Chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    };
    isRecording = true;
    micButton.innerHTML = '<i class="fas fa-stop"></i>';
}

function stopRecording() {
    if (scriptNode && isRecording) {
        scriptNode.disconnect();
        micStream.getTracks().forEach(track => track.stop());
        isRecording = false;
        micButton.innerHTML = '<i class="fas fa-microphone"></i>';
        sendPCM16Chunks(pcmFloat32Chunks);
        // IMPORTANT: Both text and audio modalities for spoken messages
        setTimeout(() => {
            ws.send(JSON.stringify({ 
                type: 'response.create', 
                response: { modalities: ['text', 'audio'] } 
            }));
        }, 100);
    }
}

function sendPCM16Chunks(float32ArrayChunks) {
    for (const chunk of float32ArrayChunks) {
        const base64Chunk = base64EncodeAudio(chunk);
        ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: base64Chunk }));
    }
    setTimeout(() => ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' })), 50);
}

function base64EncodeAudio(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

let currentBotMessage = "";

// --- Function Calling Support ---
async function handleFunctionCall(output, responseId) {
    // output: { name, arguments (JSON string), call_id }
    const functionName = output.name;
    let args = {};
    try { args = JSON.parse(output.arguments); } catch (e) {}
    let apiUrl = null, apiPayload = null;
    if (functionName === "talk_to_samarth_discord" || functionName === "discord_tool") {
        apiUrl = "/api/discord_tool";
        apiPayload = { message: args.message, wait_user_id: args.wait_user_id };
    } else if (functionName === "query_profile_info" || functionName === "mongo_query_tool") {
        apiUrl = "/api/mongo_tool/query";
        apiPayload = { query: args.query || {} };
    } else if (functionName === "insert_candidate_profile" || functionName === "mongo_insert_tool") {
        apiUrl = "/api/mongo_tool/insert";
        apiPayload = { profile: args.profile };
    } else if (functionName === "schedule_meeting" || functionName === "schedule_interview") {
        apiUrl = "/api/schedule_interview";
        apiPayload = args;
    }
    if (!apiUrl) {
        addMessage(`[Unknown tool: ${functionName}]`, 'bot');
        return;
    }
    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload)
        });
        const result = await res.json();
        // Insert function_call_output into conversation
        const outputStr = JSON.stringify(result);
        ws.send(JSON.stringify({
            type: "conversation.item.create",
            item: {
                type: "function_call_output",
                call_id: output.call_id,
                output: outputStr
            }
        }));
        // Trigger model response
        ws.send(JSON.stringify({ type: "response.create" }));
        addMessage(`[Tool result: ${outputStr}]`, 'bot');
    } catch (err) {
        addMessage(`[Tool error: ${err}]`, 'bot');
    }
}


async function handleServerEvent(data) {
    if (data.type === 'response.audio.delta') {
        console.log(data)
        audioDeltaChunks.push(data.delta);
    } else if (data.type === 'response.done') {
        const output = data.response.output[0];
        if (output && output.type === "function_call") {
            // Show tool call in UI
            addMessage(`[Calling tool: ${output.name}...]`, 'bot');
            await handleFunctionCall(output, data.response.id);
            return;
        }
        else{

        currentBotMessage = data.response.output[0].content[0].text
        if (currentBotMessage) {
            finalizeBotMessage(currentBotMessage); // finalize bot message
            currentBotMessage = "";
        }
        if (audioDeltaChunks.length > 0) {
            const base64 = audioDeltaChunks.join('');
            const pcmBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            playPCM16Audio(pcmBytes, 24000);
            audioDeltaChunks = [];
        }
    }
    } else if (data.type === 'response.audio.done') {
        console.log(data)
    }
}


function playPCM16Audio(pcmBytes, sampleRate) {
    if (window.audioContext && window.audioContext.state !== 'closed') {
        window.audioContext.close();
    }
    window.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate });
    const audioContext = window.audioContext;
    const len = pcmBytes.length / 2;
    const float32Array = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        const lo = pcmBytes[i * 2];
        const hi = pcmBytes[i * 2 + 1];
        let val = (hi << 8) | lo;
        if (val >= 0x8000) val -= 0x10000;
        float32Array[i] = val / 32768;
    }
    const audioBuffer = audioContext.createBuffer(1, float32Array.length, sampleRate);
    audioBuffer.copyToChannel(float32Array, 0);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
}

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + (sender === 'user' ? 'user-message' : 'bot-message');
    msgDiv.textContent = text;
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}
