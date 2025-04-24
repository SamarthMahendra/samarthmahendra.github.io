/**
 * Chatbot functionality for Samarth's portfolio website
 * Connects to Python server for AI-powered responses
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const resizeHandle = document.getElementById('resize-handle');
    const chatbotResize = document.getElementById('chatbot-resize');
    
    // Global variables
    let isExpanded = false;
    let isDragging = false;
    let startHeight, startY;
    const SERVER_URL = 'http://localhost:8001'; // Update this to your server URL

    // Track completed message IDs to avoid re-sending them
    let completedMessageIds = [];

    // Track if the last message was a tool call (for Discord polling logic)
    let lastWasToolCall = false;

    // Default and minimum dimensions
    const DEFAULT_WIDTH = 350;
    const DEFAULT_HEIGHT = 450;
    const MIN_WIDTH = 300;
    const MIN_HEIGHT = 350;
    
    // Save the initial dimensions
    let initialWidth = DEFAULT_WIDTH;
    let initialHeight = DEFAULT_HEIGHT;
    
    // Conversation history
    let conversation = [];
    
    // Get close button
    const chatbotClose = document.getElementById('chatbot-close');
    
    // Toggle chatbot visibility (open)
    chatbotToggle.addEventListener('click', function() {
        chatbotContainer.classList.add('active');
        chatbotInput.focus();
    });
    
    // Close chatbot
    chatbotClose.addEventListener('click', function() {
        chatbotContainer.classList.remove('active');
    });
    
    // Toggle between default size and expanded size
    chatbotResize.addEventListener('click', function() {
        if (chatbotContainer.style.width === '500px') {
            // Return to default size
            chatbotContainer.style.width = `${initialWidth}px`;
            chatbotContainer.style.height = `${initialHeight}px`;
            chatbotResize.innerHTML = '<i class="fas fa-expand-alt"></i>';
            chatbotResize.title = 'Expand';
        } else {
            // Save current dimensions if they're not the expanded ones
            if (chatbotContainer.style.width && chatbotContainer.style.width !== '500px') {
                initialWidth = parseInt(chatbotContainer.style.width);
                initialHeight = parseInt(chatbotContainer.style.height);
            }
            // Expand to larger size
            chatbotContainer.style.width = '500px';
            chatbotContainer.style.height = '600px';
            chatbotResize.innerHTML = '<i class="fas fa-compress-alt"></i>';
            chatbotResize.title = 'Shrink';
        }
        // Scroll to bottom of messages
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    });
    
    // Resize functionality
    let isResizing = false;
    let lastX, lastY;
    
    resizeHandle.addEventListener('mousedown', function(e) {
        isResizing = true;
        lastX = e.clientX;
        lastY = e.clientY;
        
        // Add event listeners for mouse movement and mouse up
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Prevent text selection during resize
        e.preventDefault();
    });
    
    function handleMouseMove(e) {
        if (!isResizing) return;
        
        // Calculate new width and height
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        
        const newWidth = Math.max(MIN_WIDTH, chatbotContainer.offsetWidth + deltaX);
        const newHeight = Math.max(MIN_HEIGHT, chatbotContainer.offsetHeight + deltaY);
        
        // Update container size
        chatbotContainer.style.width = `${newWidth}px`;
        chatbotContainer.style.height = `${newHeight}px`;
        
        // Update last position
        lastX = e.clientX;
        lastY = e.clientY;
    }
    
    function handleMouseUp() {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Update initial dimensions
        initialWidth = parseInt(chatbotContainer.style.width);
        initialHeight = parseInt(chatbotContainer.style.height);
    }
    
    // Send message on button click
    chatbotSend.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Function to check if a message ID has been completed
    function isMessageCompleted(messageId) {
        return completedMessageIds.includes(messageId);
    }
    
    // Function to send message
    function sendMessage() {
        const message = chatbotInput.value.trim();
        
        // Don't send empty messages
        if (!message) return;
        
        // Clear input
        chatbotInput.value = '';
        
        // Add user message to chat
        addMessage(message, 'user');
        
        // Show typing indicator
        showTypingIndicator();
        
        // Generate a unique username for this session if not already set
        if (!window.chatUsername) {
            window.chatUsername = 'user_' + Math.random().toString(36).substring(2, 10);
        }

        // Send to server
        fetch(`${SERVER_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                conversation: conversation,
                username: window.chatUsername,
                // Include the list of completed message IDs to avoid re-processing them
                completedMessageIds: completedMessageIds,
                last_was_tool_call: lastWasToolCall
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Remove typing indicator
            removeTypingIndicator();
            
            // Always update conversation history with everything returned by backend (including tool use/tool call objects)
            conversation = data.conversation || [];
            // Optionally log for debugging
            // console.log('Updated conversation:', conversation);
            
            // Check if we're waiting for a tool call (e.g., Discord message)
            if (data.waiting_for_tool_call) {
                // Always display the output from backend (e.g., 'Using X tool, please wait...')
                addMessage(data.output, 'bot');
                // Start polling for any tool call, not just Discord
                const toolCalls = data.waiting_for_tool_call.tool_calls;
                const messageId = data.waiting_for_tool_call.message_id;
                if (!isMessageCompleted(messageId)) {
                    pollForDiscordResponse(toolCalls, messageId);
                    lastWasToolCall = true;
                } else {
                    lastWasToolCall = false;
                }
            } else {
                // Normal response - add the bot message
                addMessage(data.output, 'bot');
                // Set lastWasToolCall to false after getting a final message
                lastWasToolCall = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
        });
    }
    
    // Function to add message to chat
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        // Format the message with proper line breaks
        if (typeof message === 'string') {
            // Split the message by newlines and create paragraph elements
            const paragraphs = message.split('\n').filter(line => line.trim() !== '');
            
            if (paragraphs.length > 1) {
                // Multiple paragraphs - create a paragraph for each line
                paragraphs.forEach((paragraph, index) => {
                    const p = document.createElement('p');
                    p.textContent = paragraph;
                    messageContent.appendChild(p);
                    
                    // Add a small margin between paragraphs
                    if (index < paragraphs.length - 1) {
                        p.style.marginBottom = '8px';
                    }
                });
            } else {
                // Single paragraph - just set the text content
                messageContent.textContent = message;
            }
        } else {
            // Fallback if message is not a string
            messageContent.textContent = String(message);
        }
        
        messageElement.appendChild(messageContent);
        chatbotMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Function to show typing indicator
    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        typingIndicator.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            typingIndicator.appendChild(dot);
        }
        
        chatbotMessages.appendChild(typingIndicator);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Function to remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Function to check server health
    function checkServerHealth() {
        fetch(`${SERVER_URL}/health`)
            .then(response => {
                if (response.ok) {
                    console.log('Chatbot server is online');
                } else {
                    console.warn('Chatbot server is not responding properly');
                }
            })
            .catch(error => {
                console.error('Chatbot server is offline:', error);
            });
    }
    
    // Function to poll for Discord response
    // Poll for tool response (generic for any tool)
    function pollForDiscordResponse(toolCalls, messageId) {
        // Create a message with a timestamp in the DOM
        const timestampId = `waiting-${messageId}`;
        const waitingElement = document.createElement('div');
        waitingElement.id = timestampId;
        waitingElement.classList.add('waiting-indicator');
        
        // Format current time
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        waitingElement.innerHTML = `<div class="waiting-timestamp">Waiting for response since ${timeString}</div>
                                   <div class="typing-indicator"><span></span><span></span><span></span></div>`;
        
        // Add to messages
        chatbotMessages.appendChild(waitingElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        let pollAttempts = 0;
        const maxPollAttempts = 30; // e.g., poll for up to 30 seconds
        const pollInterval = 2000; // 2 seconds

        function poll() {
            pollAttempts++;
            // Gather tool call messages from conversation
            // Only send toolCalls if they exist in the conversation
            // Use the toolCalls and messageId provided by the backend for polling
            fetch(`${SERVER_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: '', // No new user message, just polling for update
                    conversation: conversation,
                    username: window.chatUsername,
                    completedMessageIds: completedMessageIds,
                    last_was_tool_call: true,
                    message_id: messageId,
                    tool_calls: toolCalls
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Check if we have a final response (status: 'completed')
                if (data.status === 'completed') {
                    // Update conversation history with the latest from backend
                    conversation = data.conversation || conversation;
                    // Remove the waiting indicator
                    const waitingElement = document.getElementById(timestampId);
                    if (waitingElement) waitingElement.remove();
                    addMessage(data.output, 'bot');
                    // Mark this message as completed
                    if (!isMessageCompleted(messageId)) {
                        completedMessageIds.push(messageId);
                    }
                    lastWasToolCall = false;
                    // Clear tool_calls and message_id from state
                    // (Assumes you store these in global or conversation state if needed)
                    // If you use a state management approach, clear here:
                    // e.g. toolCalls = null; messageId = null;
                } else if (data.output && !data.waiting_for_tool_call && !data.status) {
                    // Fallback: handle legacy or non-tool-call output
                    const waitingElement = document.getElementById(timestampId);
                    if (waitingElement) waitingElement.remove();
                    addMessage(data.output, 'bot');
                    lastWasToolCall = false;
                } else {
                    // Still waiting, poll again after interval
                    if (pollAttempts < maxPollAttempts) {
                        setTimeout(poll, pollInterval);
                    } else {
                        // Timeout: remove waiting indicator and show fallback
                        const waitingElement = document.getElementById(timestampId);
                        if (waitingElement) waitingElement.remove();
                        addMessage("Sorry, still waiting for a response from the tool. Please try again later.", 'bot');
                        lastWasToolCall = false;
                    }
                }
            })
            .catch(error => {
                console.error('Error while polling for Discord response:', error);
                const waitingElement = document.getElementById(timestampId);
                if (waitingElement) waitingElement.remove();
                addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
                lastWasToolCall = false;
            });
        }

        // Start polling
        poll();
    }
    
    // Check server health on load
    checkServerHealth();
});
