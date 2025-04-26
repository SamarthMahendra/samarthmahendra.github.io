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
    const SERVER_URL = 'https://samarthmahendra-github-io.onrender.com'; // Update this to your server URL

    // Track completed message IDs to avoid re-sending them
    let completedMessageIds = [];

    // Track pending tool calls (for all tools, not just Discord)
    let pendingCalls = [];

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
    // Debounce timestamp for starter prompts
    let lastPromptClickTime = 0;
    
    // Get close button
    const chatbotClose = document.getElementById('chatbot-close');
    // Get fullscreen button
    const chatbotFullscreen = document.getElementById('chatbot-fullscreen');

    // Fullscreen state
    let isFullscreen = false;

    // Toggle fullscreen
    chatbotFullscreen.addEventListener('click', function() {
        isFullscreen = !isFullscreen;
        if (isFullscreen) {
            chatbotContainer.classList.add('fullscreen');
        } else {
            chatbotContainer.classList.remove('fullscreen');
        }
    });
    
    // Toggle chatbot visibility (open)
    chatbotToggle.addEventListener('click', function() {
        // Scroll to top before opening
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Delay chatbot open until scroll starts
        setTimeout(() => {
            chatbotContainer.classList.add('active');
            chatbotInput.focus();
        }, 300);
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
    
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Hide resize handle on mobile devices smaller than 414px
    if (window.innerWidth <= 414 && isMobile) {
        if (resizeHandle) resizeHandle.style.display = 'none';
    }
    
    // Add both mouse and touch events for better cross-device support
    resizeHandle.addEventListener('mousedown', startResize);
    resizeHandle.addEventListener('touchstart', startResize);
    
    function startResize(e) {
        // Don't allow resizing on very small screens
        if (window.innerWidth <= 414 && isMobile) return;
        
        isResizing = true;
        
        // Handle both mouse and touch events
        if (e.type === 'touchstart') {
            lastX = e.touches[0].clientX;
            lastY = e.touches[0].clientY;
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleTouchEnd);
        } else {
            lastX = e.clientX;
            lastY = e.clientY;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        
        // Prevent text selection during resize
        e.preventDefault();
    }
    
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
    
    function handleTouchMove(e) {
        if (!isResizing) return;
        
        // Calculate new width and height
        const deltaX = e.touches[0].clientX - lastX;
        const deltaY = e.touches[0].clientY - lastY;
        
        const newWidth = Math.max(MIN_WIDTH, chatbotContainer.offsetWidth + deltaX);
        const newHeight = Math.max(MIN_HEIGHT, chatbotContainer.offsetHeight + deltaY);
        
        // Update container size
        chatbotContainer.style.width = `${newWidth}px`;
        chatbotContainer.style.height = `${newHeight}px`;
        
        // Update last position
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        
        // Prevent scrolling during resize
        e.preventDefault();
    }
    
    function handleMouseUp() {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Update initial dimensions
        initialWidth = parseInt(chatbotContainer.style.width);
        initialHeight = parseInt(chatbotContainer.style.height);
    }
    
    function handleTouchEnd() {
        isResizing = false;
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        
        // Update initial dimensions
        initialWidth = parseInt(chatbotContainer.style.width);
        initialHeight = parseInt(chatbotContainer.style.height);
    }
    
    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        // A small delay to allow the browser to complete the orientation change
        setTimeout(function() {
            // Adjust chatbot size for new orientation
            if (window.innerWidth <= 414 && isMobile) {
                // Reset to full width on small screens
                chatbotContainer.style.width = '98vw';
                chatbotContainer.style.height = '80vh';
            }
        }, 200);
    });
    
    // Send message on button click
    chatbotSend.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatbotInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
    
    // Mobile-specific input handling
    if (isMobile) {
        // Adjust scroll when keyboard appears
        chatbotInput.addEventListener('focus', function() {
            // Scroll the messages to bottom when input is focused
            setTimeout(function() {
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
                
                // On very small devices, change height to account for keyboard
                if (window.innerWidth <= 375) {
                    chatbotContainer.style.height = '60vh';
                }
            }, 300);
        });
        
        // Reset height when keyboard disappears
        chatbotInput.addEventListener('blur', function() {
            if (window.innerWidth <= 375) {
                setTimeout(function() {
                    chatbotContainer.style.height = '80vh';
                }, 100);
            }
        });
    }

    // Function to handle pending calls loop
    function handlePendingCalls() {
        if (pendingCalls.length === 0) return;
        // Show waiting indicator
        showTypingIndicator();
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
                pending_calls: pendingCalls
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(function handlePendingResponse(data) {
            conversation = data.conversation || conversation;
            pendingCalls = data.pending_calls || [];
            if (data.retry) {
                // No output, just poll again
                setTimeout(function() {
                    fetch(`${SERVER_URL}/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: '',
                            conversation: conversation,
                            username: window.chatUsername,
                            completedMessageIds: completedMessageIds,
                            pending_calls: pendingCalls
                        })
                    })
                    .then(response => response.json())
                    .then(handlePendingResponse)
                    .catch(error => {
                        removeTypingIndicator();
                        addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
                        pendingCalls = [];
                    });
                }, 1000);
            } else if (pendingCalls.length > 0) {
                // Show output, then poll again
                removeTypingIndicator();
                if (data.output) addMessage(data.output, 'bot');
                setTimeout(function() {
                    fetch(`${SERVER_URL}/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: '',
                            conversation: conversation,
                            username: window.chatUsername,
                            completedMessageIds: completedMessageIds,
                            pending_calls: pendingCalls
                        })
                    })
                    .then(response => response.json())
                    .then(handlePendingResponse)
                    .catch(error => {
                        removeTypingIndicator();
                        addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
                        pendingCalls = [];
                    });
                }, 2000);
            } else {
                // No pending calls, normal response
                removeTypingIndicator();
                if (data.output) addMessage(data.output, 'bot');
            }
        })
        .catch(error => {
            removeTypingIndicator();
            addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
            pendingCalls = [];
        });
    }
    
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
        
        // Blur input to hide keyboard on mobile
        if (window.innerWidth <= 768) {
            chatbotInput.blur();
        }
        
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
                completedMessageIds: completedMessageIds,
                pending_calls: pendingCalls
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(function handleResponse(data) {
            conversation = data.conversation || conversation;
            pendingCalls = data.pending_calls || [];
            if (data.retry) {
                // No output, just poll again
                setTimeout(function() {
                    fetch(`${SERVER_URL}/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: '',
                            conversation: conversation,
                            username: window.chatUsername,
                            completedMessageIds: completedMessageIds,
                            pending_calls: pendingCalls
                        })
                    })
                    .then(response => response.json())
                    .then(handleResponse)
                    .catch(error => {
                        removeTypingIndicator();
                        addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
                        pendingCalls = [];
                    });
                }, 1000);
            } else if (pendingCalls.length > 0) {
                // Show output, then poll again
                removeTypingIndicator();
                if (data.output) addMessage(data.output, 'bot');
                setTimeout(function() {
                    fetch(`${SERVER_URL}/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: '',
                            conversation: conversation,
                            username: window.chatUsername,
                            completedMessageIds: completedMessageIds,
                            pending_calls: pendingCalls
                        })
                    })
                    .then(response => response.json())
                    .then(handleResponse)
                    .catch(error => {
                        removeTypingIndicator();
                        addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
                        pendingCalls = [];
                    });
                }, 2000);
            } else {
                // No pending calls, normal response
                removeTypingIndicator();
                if (data.output) addMessage(data.output, 'bot');
            }
        })
        .catch(error => {
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
    
    // Check server health on load
    checkServerHealth();

    // --- Starter Prompts Logic ---
    function handleStarterPromptClick(e) {
        e.preventDefault();
        e.stopPropagation();
        const now = Date.now();
        if (now - lastPromptClickTime < 300) return;
        lastPromptClickTime = now;
        const prompt = e.currentTarget.textContent;
        if (chatbotInput && prompt) {
            chatbotInput.value = prompt;
            // Optionally, you can show it in the chat immediately:
            sendMessage();
        }
    }
    
    // Attach click listeners to starter prompts
    const starterPromptButtons = document.querySelectorAll('.chatbot-starter-prompt');
    starterPromptButtons.forEach(btn => {
        btn.addEventListener('click', handleStarterPromptClick);
    });
});
