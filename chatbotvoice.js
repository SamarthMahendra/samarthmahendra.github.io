// chatbotvoice.js
// Voice-only Chatbot UI using WebSocket for audio streaming and tool calling

let ws = null;
let audioContext = null;
let scriptNode = null;
let micStream = null;
let pcm16Chunks = [];
let isRecording = false;

const transcriptDiv = document.createElement('div');
transcriptDiv.id = 'voice-transcript';
document.body.appendChild(transcriptDiv);

const recordBtn = document.createElement('button');
recordBtn.innerText = '🎤 Start Recording';
recordBtn.onclick = toggleRecording;
document.body.appendChild(recordBtn);

const stopBtn = document.createElement('button');
stopBtn.innerText = '⏹️ Stop Recording';
stopBtn.disabled = true;
stopBtn.onclick = stopRecording;
document.body.appendChild(stopBtn);

function setupWebSocket() {
    ws = new WebSocket('ws://' + 'localhost:8002' + '/ws/voicechat');
    ws.onopen = () => {
    transcriptDiv.innerText += '\n[WebSocket connected]';
    console.log('[WebSocket] Connected');
};
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleServerEvent(data);
    };
    ws.onclose = () => {
        transcriptDiv.innerText += '\n[WebSocket closed]';
    };
    ws.onerror = (e) => {
        transcriptDiv.innerText += '\n[WebSocket error]';
    };
}

function toggleRecording() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}
// Global array to store Float32Array audio chunks for streaming
let pcmFloat32Chunks = [];

async function startRecording() {
    try {
        pcmFloat32Chunks = []; // Reset before each recording
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const source = audioContext.createMediaStreamSource(micStream);
        scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
        pcm16Chunks = [];
        source.connect(scriptNode);
        scriptNode.connect(audioContext.destination);
        scriptNode.onaudioprocess = function(audioProcessingEvent) {
            const input = audioProcessingEvent.inputBuffer.getChannelData(0);
            pcmFloat32Chunks.push(new Float32Array(input)); // store a copy
            const pcm16 = new Int16Array(input.length);
            for (let i = 0; i < input.length; i++) {
                let s = Math.max(-1, Math.min(1, input[i]));
                pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            pcm16Chunks.push(pcm16);
        };
        // TODO: Migrate to AudioWorkletNode for future-proofing (see https://bit.ly/audio-worklet)
        isRecording = true;
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        transcriptDiv.innerText += '\n[Recording started]';
        console.log('[Mic] Recording started, capturing PCM16 chunks');
    } catch (err) {
        transcriptDiv.innerText += '\n[Mic error: ' + err + ']';
        console.error('[Mic] Error:', err);
    }
}

function stopRecording() {
    if (scriptNode && isRecording) {
        scriptNode.disconnect();
        if (micStream) micStream.getTracks().forEach(track => track.stop());
        isRecording = false;
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        transcriptDiv.innerText += '\n[Recording stopped]';
        console.log('[Mic] Recording stopped. Sending Float32 chunks...');
        // Send all recorded audio chunks as streaming PCM16
        sendPCM16Chunks(pcmFloat32Chunks); // Pass the array of Float32Array

        // NEW: After commit, trigger model response for this turn
        setTimeout(() => {
            ws.send(JSON.stringify({
                type: "response.create",
                response: { modalities: ["text", "audio"] }
            }));
            console.log('[Audio] Sent response.create for next turn (text + audio)');
        }, 100); // 100ms after commit
    }
}

// Converts Float32Array (16kHz mono) chunks to PCM16, base64, and streams to backend
function sendPCM16Chunks(float32ArrayChunks) {
    for (const chunk of float32ArrayChunks) {
        const base64Chunk = base64EncodeAudio(chunk);
        ws.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: base64Chunk
        }));
        console.log('[Audio] Sent input_audio_buffer.append, chunk length:', chunk.length);
    }
    // Add a small delay before sending commit to avoid race conditions
    setTimeout(() => {
        ws.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
        console.log('[Audio] Sent input_audio_buffer.commit');
        // If VAD is disabled, also send response.create
        // ws.send(JSON.stringify({ type: 'response.create', response: { modalities: ['audio'] } }));
    }, 50);
}



function floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); // little-endian
    }
    return buffer;
}

function base64EncodeAudio(float32Array) {
    const arrayBuffer = floatTo16BitPCM(float32Array);
    const pcm16Bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < pcm16Bytes.length; i++) {
        binary += String.fromCharCode(pcm16Bytes[i]);
    }
    return btoa(binary);
} // Pure function: does NOT send websocket messages

let audioChunksFromModel = [];

// Play PCM16 audio using Web Audio API (16kHz or 24kHz mono)
function playPCM16Audio(pcmBytes, sampleRate) {
    // Always create a fresh AudioContext for playback to avoid browser resampling issues
    if (window.audioContext && window.audioContext.state !== 'closed') {
        window.audioContext.close();
    }
    window.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    const audioContext = window.audioContext;
    // Convert Uint8Array (raw PCM16) to Float32Array
    const len = pcmBytes.length / 2;
    const float32Array = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        // Little-endian
        const lo = pcmBytes[i * 2];
        const hi = pcmBytes[i * 2 + 1];
        let val = (hi << 8) | lo;
        if (val >= 0x8000) val -= 0x10000;
        float32Array[i] = val / 32768;
    }
    const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
    audioBuffer.copyToChannel(float32Array, 0);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
    source.onended = () => {
        window.audioContext.close();
        window.audioContext = null;
        console.log('[Audio] Model audio playback ended');
    };
}

// --- Audio chunk buffer for streaming playback ---
let audioDeltaChunks = [];

// --- Update system instructions for the session ---
function updateSystemInstructions(newInstructions) {
    const event = {
        type: "session.update",
        session: {
            instructions: newInstructions
        }
    };
    ws.send(JSON.stringify(event));
    console.log('[Session] Sent updated instructions:', newInstructions);
}
// Example usage: updateSystemInstructions("Never use the word 'moist' in your responses!");



function handleServerEvent(data) {
    if (data.type === 'response.text.delta') {
        transcriptDiv.innerText += data.text;
    } 
    else if (data.type === 'response.audio.delta') {
        // Buffer base64-encoded PCM16 chunk
        audioDeltaChunks.push(data.delta);
        console.log('[Audio] Received audio.delta chunk, total:', audioDeltaChunks.length);
    } else if (data.type === 'response.audio.done' || data.type === 'response.done') {
        if (audioDeltaChunks.length > 0) {
            const base64 = audioDeltaChunks.join('');
            const pcmBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            playPCM16Audio(pcmBytes, 16000); // 16kHz mono
            audioDeltaChunks = [];
        }
    }
    else if (data.type === 'response.done') {
        transcriptDiv.innerText += '\n[Response done]';
        if (audioChunksFromModel.length > 0) {
            const fullAudio = audioChunksFromModel.join('');
            playAudio(fullAudio);
            audioChunksFromModel = [];
        }
        if (data.response && data.response.function_call) {
            transcriptDiv.innerText += '\n[Function call: ' + JSON.stringify(data.response.function_call) + ']';
        }
    } 
    else if (data.type === 'function_call') {
        transcriptDiv.innerText += '\n[Function call received: ' + JSON.stringify(data) + ']';
    }
}


let lastModelAudio = null;

function playAudio(base64Audio) {
    // Decode base64 PCM16 and play using Web Audio API (no WAV container)
    lastModelAudio = base64Audio;
    const pcm16 = base64ToPCM16Float32Array(base64Audio);
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    const buffer = audioContext.createBuffer(1, pcm16.length, 24000);
    buffer.getChannelData(0).set(pcm16);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
    transcriptDiv.innerText += '\n[🔊 Model audio playing]';
    source.onended = () => {
        transcriptDiv.innerText += '\n[Audio ended]';
    };
    // Add replay button if not present
    if (!document.getElementById('replay-audio-btn')) {
        const btn = document.createElement('button');
        btn.id = 'replay-audio-btn';
        btn.innerText = 'Replay Model Audio';
        btn.onclick = () => playAudio(lastModelAudio);
        document.body.appendChild(btn);
    }
}

function base64ToPCM16Float32Array(base64) {
    // Decode base64 PCM16 to Float32Array for Web Audio API
    const binary = atob(base64);
    const len = binary.length / 2;
    const pcm16 = new Int16Array(len);
    for (let i = 0; i < len; i++) {
        pcm16[i] = (binary.charCodeAt(i * 2 + 1) << 8) | (binary.charCodeAt(i * 2) & 0xff);
    }
    // Convert to Float32 in range [-1, 1]
    const pcmFloat32 = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        pcmFloat32[i] = pcm16[i] / 32768;
    }
    return pcmFloat32;
}



window.onload = setupWebSocket;
