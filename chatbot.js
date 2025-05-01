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
            chatbotContainer.style.width = '600px'; // Set initial width for consistent resize toggle
            isExpanded = false;
            chatbotInput.focus();
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        }, 300);
    });
    
    // Close chatbot
    chatbotClose.addEventListener('click', function() {
        chatbotContainer.classList.remove('active');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    });
    
    // Toggle between default size and expanded size
    // isExpanded is declared above
    chatbotResize.addEventListener('click', function() {
        if (isExpanded) {
            // Collapse to 600px width
            chatbotContainer.style.width = '600px';
            chatbotResize.innerHTML = '<i class="fas fa-expand-alt"></i>';
            chatbotResize.title = 'Expand';
            isExpanded = false;
        } else {
            // Expand to 1000px width
            chatbotContainer.style.width = '1000px';
            chatbotResize.innerHTML = '<i class="fas fa-compress-alt"></i>';
            chatbotResize.title = 'Shrink';
            isExpanded = true;
        }
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
        let lastScrollY = 0;
        // Adjust scroll when keyboard appears
        chatbotInput.addEventListener('focus', function() {
            // Save scroll position and prevent background scroll
            lastScrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${lastScrollY}px`;
            document.body.style.width = '100%';
            // Scroll the messages to bottom when input is focused
            setTimeout(function() {
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
                // On very small devices, change height to account for keyboard
                if (window.innerWidth <= 375) {
                    chatbotContainer.style.height = '60vh';
                }
            }, 300);
        });
        // Reset height and background scroll when keyboard disappears
        chatbotInput.addEventListener('blur', function() {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, lastScrollY);
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
                }, 1000);
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
        
        // Hide starter prompts when user sends any message
        hideStarterPrompts();
        
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
    // Helper to escape HTML
    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, function(tag) {
            const charsToReplace = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return charsToReplace[tag] || tag;
        });
    }
    // Helper to linkify URLs
    function linkify(text) {
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlPattern, function(url) {
            // Escape HTML in URL
            const safeUrl = escapeHTML(url);
            return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`;
        });
    }
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.style.wordBreak = 'normal';
        messageContent.style.whiteSpace = 'normal';
        if (typeof message === 'string') {
            // Split the message by newlines and create paragraph elements
            const paragraphs = message.split('\n').filter(line => line.trim() !== '');
            if (paragraphs.length > 1) {
                paragraphs.forEach((paragraph, index) => {
                    const p = document.createElement('p');
                    p.innerHTML = linkify(escapeHTML(paragraph));
                    messageContent.appendChild(p);
                    if (index < paragraphs.length - 1) {
                        p.style.marginBottom = '8px';
                    }
                });
            } else {
                messageContent.innerHTML = linkify(escapeHTML(message));
            }
        } else {
            messageContent.textContent = String(message);
        }
        messageElement.appendChild(messageContent);
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Function to show typing indicator
    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        typingIndicator.id = 'typing-indicator';

        // Add Lottie animation
        const lottie = document.createElement('dotlottie-player');
        lottie.setAttribute('src', 'https://lottie.host/944deb9d-e345-433a-a9ba-5e79ec1b5a45/S2V4GVLLpG.lottie');
        lottie.setAttribute('background', 'transparent');
        lottie.setAttribute('speed', '1');
        lottie.setAttribute('style', 'width: 120px; height: 120px; margin: 0 auto; display: block; background: none !important;');
        lottie.setAttribute('loop', '');
        lottie.setAttribute('autoplay', '');
        typingIndicator.appendChild(lottie);

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

    // Populate starter prompts dynamically
    const allStarterPrompts = [
      "Which of Samarth's projects best showcase his AI and data engineering expertise?",
      "Could you pull up Samarth’s profile and highlight his main qualifications?",
      "How well does Samarth's profile match this job description?",
      "How well does Samarth fit the Software Development Engineer role at Google based on his profile?",
      "Can you evaluate Samarth’s suitability for an SDE position at Amazon?",
      "Assess how Samarth’s experience aligns with Microsoft's Software Engineer role.",
      "Determine Samarth’s fit for Apple's Machine Learning Engineer position.",
      "Review Samarth’s skills and tell me how he matches a data engineer role at Netflix.",
      // Additional backend-driven prompts
      "Could you pull up Samarth’s full candidate profile from the database?",
      "What are Samarth’s top three technical skills listed in his profile?",
      "Give me an overview of his most recent work experience.",
      "What degrees and certifications does Samarth hold?",
      "Retrieve Samarth’s preferred contact email and phone number.",
      "Can you tell me Samarth’s strengths and soft skills from his profile?",
      "Ask Samarth on Discord if he’s available for a quick call tomorrow.",
      "Is Samarth free next Tuesday at 2 PM? If so, schedule a Jitsi meeting.",
      "Set up a 30-minute Jitsi call with Samarth and me this Friday at 10 AM.",
      "Schedule a team meeting with Samarth and our HR lead on June 5th at 3 PM.",
      "Please query the database for any GitHub or project links he’s shared.",
      "What major achievements are highlighted in Samarth’s profile?",
      "Ask Samarth via Discord to send over his latest portfolio link.",
      "Gather job-fit insights for a DevOps role from his candidate profile.",
      "Can you confirm Samarth’s availability for a follow-up discussion next week?"
    ];
    // Randomly select 3 prompts
    function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }
    const selectedPrompts = shuffle([...allStarterPrompts]).slice(0, 3);
    const starterPromptsContainer = document.getElementById('chatbot-starter-prompts');
    selectedPrompts.forEach(text => {
      const btn = document.createElement('button');
      btn.className = 'chatbot-starter-prompt';
      btn.textContent = text;
      btn.addEventListener('click', handleStarterPromptClick);
      starterPromptsContainer.appendChild(btn);
    });

    // --- Starter Prompts Logic ---
    // Hide starter prompts utility
    function hideStarterPrompts() {
        const starterPrompts = document.getElementById('chatbot-starter-prompts');
        if (starterPrompts) starterPrompts.style.display = 'none';
    }

    function handleStarterPromptClick(e) {
        e.preventDefault();
        e.stopPropagation();
        const now = Date.now();
        if (now - lastPromptClickTime < 300) return;
        lastPromptClickTime = now;
        const prompt = e.currentTarget.textContent;
        if (chatbotInput && prompt) {
            chatbotInput.value = prompt;
            hideStarterPrompts(); // Hide prompts when a sample is clicked
            sendMessage();
        }
    }
    
    // Attach click listeners to starter prompts
    const starterPromptButtons = document.querySelectorAll('.chatbot-starter-prompt');
    starterPromptButtons.forEach(btn => {
        btn.addEventListener('click', handleStarterPromptClick);
    });
});