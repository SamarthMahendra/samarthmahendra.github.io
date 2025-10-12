// /**
//  * Chatbot functionality for Samarth's portfolio website
//  * Connects to Python server for AI-powered responses
//  */
//
// document.addEventListener('DOMContentLoaded', function() {
//     // DOM elements
//     const chatbotContainer = document.getElementById('chatbot-container');
//     const chatbotToggle = document.getElementById('chatbot-toggle');
//     const chatbotMessages = document.getElementById('chatbot-messages');
//     const chatbotInput = document.getElementById('chatbot-input');
//     const chatbotSend = document.getElementById('chatbot-send');
//     const resizeHandle = document.getElementById('resize-handle');
//     const chatbotResize = document.getElementById('chatbot-resize');
//
//     // Global variables
//     let isExpanded = false;
//     let isDragging = false;
//     let startHeight, startY;
//     const SERVER_URL = 'https://samarthmahendra-github-io.onrender.com'; // Update this to your server URL
//
//     // Track completed message IDs to avoid re-sending them
//     let completedMessageIds = [];
//
//     // Track pending tool calls (for all tools, not just Discord)
//     let pendingCalls = [];
//
//     // Default and minimum dimensions
//     const DEFAULT_WIDTH = 350;
//     const DEFAULT_HEIGHT = 450;
//     const MIN_WIDTH = 300;
//     const MIN_HEIGHT = 350;
//
//     // Save the initial dimensions
//     let initialWidth = DEFAULT_WIDTH;
//     let initialHeight = DEFAULT_HEIGHT;
//
//     // Conversation history
//     let conversation = [];
//     // Debounce timestamp for starter prompts
//     let lastPromptClickTime = 0;
//
//     // Get close button
//     const chatbotClose = document.getElementById('chatbot-close');
//     // Get fullscreen button
//     const chatbotFullscreen = document.getElementById('chatbot-fullscreen');
//
//     // Fullscreen state
//     let isFullscreen = false;
//
//     // Toggle fullscreen
//     chatbotFullscreen.addEventListener('click', function() {
//         isFullscreen = !isFullscreen;
//         if (isFullscreen) {
//             chatbotContainer.classList.add('fullscreen');
//         } else {
//             chatbotContainer.classList.remove('fullscreen');
//         }
//     });
//
//     // Toggle chatbot visibility (open)
//     chatbotToggle.addEventListener('click', function() {
//         // Scroll to top before opening
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//         // Delay chatbot open until scroll starts
//         setTimeout(() => {
//             chatbotContainer.classList.add('active');
//             chatbotContainer.style.width = '600px'; // Set initial width for consistent resize toggle
//             isExpanded = false;
//             chatbotInput.focus();
//             document.body.style.overflow = 'hidden';
//             document.documentElement.style.overflow = 'hidden';
//         }, 300);
//     });
//
//     // Close chatbot
//     chatbotClose.addEventListener('click', function() {
//         chatbotContainer.classList.remove('active');
//         document.body.style.overflow = '';
//         document.documentElement.style.overflow = '';
//     });
//
//     // Toggle between default size and expanded size
//     // isExpanded is declared above
//     chatbotResize.addEventListener('click', function() {
//         if (isExpanded) {
//             // Collapse to 600px width
//             chatbotContainer.style.width = '600px';
//             chatbotResize.innerHTML = '<i class="fas fa-expand-alt"></i>';
//             chatbotResize.title = 'Expand';
//             isExpanded = false;
//         } else {
//             // Expand to 1000px width
//             chatbotContainer.style.width = '1000px';
//             chatbotResize.innerHTML = '<i class="fas fa-compress-alt"></i>';
//             chatbotResize.title = 'Shrink';
//             isExpanded = true;
//         }
//         chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
//     });
//
//     // Resize functionality
//     let isResizing = false;
//     let lastX, lastY;
//
//     // Check if we're on a mobile device
//     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
//
//     // Hide resize handle on mobile devices smaller than 414px
//     if (window.innerWidth <= 414 && isMobile) {
//         if (resizeHandle) resizeHandle.style.display = 'none';
//     }
//
//     // Add both mouse and touch events for better cross-device support
//     resizeHandle.addEventListener('mousedown', startResize);
//     resizeHandle.addEventListener('touchstart', startResize);
//
//     function startResize(e) {
//         // Don't allow resizing on very small screens
//         if (window.innerWidth <= 414 && isMobile) return;
//
//         isResizing = true;
//
//         // Handle both mouse and touch events
//         if (e.type === 'touchstart') {
//             lastX = e.touches[0].clientX;
//             lastY = e.touches[0].clientY;
//             document.addEventListener('touchmove', handleTouchMove);
//             document.addEventListener('touchend', handleTouchEnd);
//         } else {
//             lastX = e.clientX;
//             lastY = e.clientY;
//             document.addEventListener('mousemove', handleMouseMove);
//             document.addEventListener('mouseup', handleMouseUp);
//         }
//
//         // Prevent text selection during resize
//         e.preventDefault();
//     }
//
//     function handleMouseMove(e) {
//         if (!isResizing) return;
//
//         // Calculate new width and height
//         const deltaX = e.clientX - lastX;
//         const deltaY = e.clientY - lastY;
//
//         const newWidth = Math.max(MIN_WIDTH, chatbotContainer.offsetWidth + deltaX);
//         const newHeight = Math.max(MIN_HEIGHT, chatbotContainer.offsetHeight + deltaY);
//
//         // Update container size
//         chatbotContainer.style.width = `${newWidth}px`;
//         chatbotContainer.style.height = `${newHeight}px`;
//
//         // Update last position
//         lastX = e.clientX;
//         lastY = e.clientY;
//     }
//
//     function handleTouchMove(e) {
//         if (!isResizing) return;
//
//         // Calculate new width and height
//         const deltaX = e.touches[0].clientX - lastX;
//         const deltaY = e.touches[0].clientY - lastY;
//
//         const newWidth = Math.max(MIN_WIDTH, chatbotContainer.offsetWidth + deltaX);
//         const newHeight = Math.max(MIN_HEIGHT, chatbotContainer.offsetHeight + deltaY);
//
//         // Update container size
//         chatbotContainer.style.width = `${newWidth}px`;
//         chatbotContainer.style.height = `${newHeight}px`;
//
//         // Update last position
//         lastX = e.touches[0].clientX;
//         lastY = e.touches[0].clientY;
//
//         // Prevent scrolling during resize
//         e.preventDefault();
//     }
//
//     function handleMouseUp() {
//         isResizing = false;
//         document.removeEventListener('mousemove', handleMouseMove);
//         document.removeEventListener('mouseup', handleMouseUp);
//
//         // Update initial dimensions
//         initialWidth = parseInt(chatbotContainer.style.width);
//         initialHeight = parseInt(chatbotContainer.style.height);
//     }
//
//     function handleTouchEnd() {
//         isResizing = false;
//         document.removeEventListener('touchmove', handleTouchMove);
//         document.removeEventListener('touchend', handleTouchEnd);
//
//         // Update initial dimensions
//         initialWidth = parseInt(chatbotContainer.style.width);
//         initialHeight = parseInt(chatbotContainer.style.height);
//     }
//
//     // Handle orientation change
//     window.addEventListener('orientationchange', function() {
//         // A small delay to allow the browser to complete the orientation change
//         setTimeout(function() {
//             // Adjust chatbot size for new orientation
//             if (window.innerWidth <= 414 && isMobile) {
//                 // Reset to full width on small screens
//                 chatbotContainer.style.width = '98vw';
//                 chatbotContainer.style.height = '80vh';
//             }
//         }, 200);
//     });
//
//     // Send message on button click
//     chatbotSend.addEventListener('click', sendMessage);
//
//     // Send message on Enter key
//     chatbotInput.addEventListener('keydown', function(event) {
//         if (event.key === 'Enter' && !event.shiftKey) {
//             event.preventDefault();
//             sendMessage();
//         }
//     });
//
//     // Mobile-specific input handling
//     if (isMobile) {
//         let lastScrollY = 0;
//         // Adjust scroll when keyboard appears
//         chatbotInput.addEventListener('focus', function() {
//             // Save scroll position and prevent background scroll
//             lastScrollY = window.scrollY;
//             document.body.style.position = 'fixed';
//             document.body.style.top = `-${lastScrollY}px`;
//             document.body.style.width = '100%';
//             // Scroll the messages to bottom when input is focused
//             setTimeout(function() {
//                 chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
//                 // On very small devices, change height to account for keyboard
//                 if (window.innerWidth <= 375) {
//                     chatbotContainer.style.height = '60vh';
//                 }
//             }, 300);
//         });
//         // Reset height and background scroll when keyboard disappears
//         chatbotInput.addEventListener('blur', function() {
//             document.body.style.position = '';
//             document.body.style.top = '';
//             document.body.style.width = '';
//             window.scrollTo(0, lastScrollY);
//             if (window.innerWidth <= 375) {
//                 setTimeout(function() {
//                     chatbotContainer.style.height = '80vh';
//                 }, 100);
//             }
//         });
//     }
//
//     // Function to handle pending calls loop
//     function handlePendingCalls() {
//         if (pendingCalls.length === 0) return;
//         // Show waiting indicator
//         showTypingIndicator();
//         fetch(`${SERVER_URL}/chat`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 message: '', // No new user message, just polling for update
//                 conversation: conversation,
//                 username: window.chatUsername,
//                 completedMessageIds: completedMessageIds,
//                 pending_calls: pendingCalls
//             })
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(function handlePendingResponse(data) {
//             conversation = data.conversation || conversation;
//             pendingCalls = data.pending_calls || [];
//             if (data.retry) {
//                 // No output, just poll again
//                 setTimeout(function() {
//                     fetch(`${SERVER_URL}/chat`, {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify({
//                             message: '',
//                             conversation: conversation,
//                             username: window.chatUsername,
//                             completedMessageIds: completedMessageIds,
//                             pending_calls: pendingCalls
//                         })
//                     })
//                     .then(response => response.json())
//                     .then(handlePendingResponse)
//                     .catch(error => {
//                         removeTypingIndicator();
//                         addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
//                         pendingCalls = [];
//                     });
//                 }, 1000);
//             } else if (pendingCalls.length > 0) {
//                 // Show output, then poll again
//                 removeTypingIndicator();
//                 if (data.output) addMessage(data.output, 'bot');
//                 setTimeout(function() {
//                     fetch(`${SERVER_URL}/chat`, {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify({
//                             message: '',
//                             conversation: conversation,
//                             username: window.chatUsername,
//                             completedMessageIds: completedMessageIds,
//                             pending_calls: pendingCalls
//                         })
//                     })
//                     .then(response => response.json())
//                     .then(handlePendingResponse)
//                     .catch(error => {
//                         removeTypingIndicator();
//                         addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
//                         pendingCalls = [];
//                     });
//                 }, 1000);
//             } else {
//                 // No pending calls, normal response
//                 removeTypingIndicator();
//                 if (data.output) addMessage(data.output, 'bot');
//             }
//         })
//         .catch(error => {
//             removeTypingIndicator();
//             addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
//             pendingCalls = [];
//         });
//     }
//
//     // Function to check if a message ID has been completed
//     function isMessageCompleted(messageId) {
//         return completedMessageIds.includes(messageId);
//     }
//
//     // Function to send message
//     function sendMessage() {
//         const message = chatbotInput.value.trim();
//
//         // Don't send empty messages
//         if (!message) return;
//
//         // Hide starter prompts when user sends any message
//         hideStarterPrompts();
//
//         // Clear input
//         chatbotInput.value = '';
//
//         // Blur input to hide keyboard on mobile
//         if (window.innerWidth <= 768) {
//             chatbotInput.blur();
//         }
//
//         // Add user message to chat
//         addMessage(message, 'user');
//
//         // Show typing indicator
//         showTypingIndicator();
//
//         // Generate a unique username for this session if not already set
//         if (!window.chatUsername) {
//             window.chatUsername = 'user_' + Math.random().toString(36).substring(2, 10);
//         }
//
//         // Send to server
//         fetch(`${SERVER_URL}/chat`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 message: message,
//                 conversation: conversation,
//                 username: window.chatUsername,
//                 completedMessageIds: completedMessageIds,
//                 pending_calls: pendingCalls
//             })
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(function handleResponse(data) {
//             conversation = data.conversation || conversation;
//             pendingCalls = data.pending_calls || [];
//             if (data.retry) {
//                 // No output, just poll again
//                 setTimeout(function() {
//                     fetch(`${SERVER_URL}/chat`, {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify({
//                             message: '',
//                             conversation: conversation,
//                             username: window.chatUsername,
//                             completedMessageIds: completedMessageIds,
//                             pending_calls: pendingCalls
//                         })
//                     })
//                     .then(response => response.json())
//                     .then(handleResponse)
//                     .catch(error => {
//                         removeTypingIndicator();
//                         addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
//                         pendingCalls = [];
//                     });
//                 }, 1000);
//             } else if (pendingCalls.length > 0) {
//                 // Show output, then poll again
//                 removeTypingIndicator();
//                 if (data.output) addMessage(data.output, 'bot');
//                 setTimeout(function() {
//                     fetch(`${SERVER_URL}/chat`, {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify({
//                             message: '',
//                             conversation: conversation,
//                             username: window.chatUsername,
//                             completedMessageIds: completedMessageIds,
//                             pending_calls: pendingCalls
//                         })
//                     })
//                     .then(response => response.json())
//                     .then(handleResponse)
//                     .catch(error => {
//                         removeTypingIndicator();
//                         addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
//                         pendingCalls = [];
//                     });
//                 }, 2000);
//             } else {
//                 // No pending calls, normal response
//                 removeTypingIndicator();
//                 if (data.output) addMessage(data.output, 'bot');
//             }
//         })
//         .catch(error => {
//             removeTypingIndicator();
//             addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
//         });
//     }
//
//     // Function to add message to chat
//     // Helper to escape HTML
//     function escapeHTML(str) {
//         return str.replace(/[&<>"']/g, function(tag) {
//             const charsToReplace = {
//                 '&': '&amp;',
//                 '<': '&lt;',
//                 '>': '&gt;',
//                 '"': '&quot;',
//                 "'": '&#39;'
//             };
//             return charsToReplace[tag] || tag;
//         });
//     }
//     // Helper to linkify URLs
//     function linkify(text) {
//         const urlPattern = /(https?:\/\/[^\s]+)/g;
//         return text.replace(urlPattern, function(url) {
//             // Escape HTML in URL
//             const safeUrl = escapeHTML(url);
//             return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`;
//         });
//     }
//     function addMessage(message, sender) {
//         const messageElement = document.createElement('div');
//         messageElement.classList.add('message', `${sender}-message`);
//         const messageContent = document.createElement('div');
//         messageContent.classList.add('message-content');
//         messageContent.style.wordBreak = 'normal';
//         messageContent.style.whiteSpace = 'normal';
//         if (typeof message === 'string') {
//             // Split the message by newlines and create paragraph elements
//             const paragraphs = message.split('\n').filter(line => line.trim() !== '');
//             if (paragraphs.length > 1) {
//                 paragraphs.forEach((paragraph, index) => {
//                     const p = document.createElement('p');
//                     p.innerHTML = linkify(escapeHTML(paragraph));
//                     messageContent.appendChild(p);
//                     if (index < paragraphs.length - 1) {
//                         p.style.marginBottom = '8px';
//                     }
//                 });
//             } else {
//                 messageContent.innerHTML = linkify(escapeHTML(message));
//             }
//         } else {
//             messageContent.textContent = String(message);
//         }
//         messageElement.appendChild(messageContent);
//         chatbotMessages.appendChild(messageElement);
//         chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
//     }
//
//     // Function to show typing indicator
//     function showTypingIndicator() {
//         const typingIndicator = document.createElement('div');
//         typingIndicator.classList.add('typing-indicator');
//         typingIndicator.id = 'typing-indicator';
//
//         // Add Lottie animation
//         const lottie = document.createElement('dotlottie-player');
//         lottie.setAttribute('src', 'https://lottie.host/944deb9d-e345-433a-a9ba-5e79ec1b5a45/S2V4GVLLpG.lottie');
//         lottie.setAttribute('background', 'transparent');
//         lottie.setAttribute('speed', '1');
//         lottie.setAttribute('style', 'width: 120px; height: 120px; margin: 0 auto; display: block; background: none !important;');
//         lottie.setAttribute('loop', '');
//         lottie.setAttribute('autoplay', '');
//         typingIndicator.appendChild(lottie);
//
//         chatbotMessages.appendChild(typingIndicator);
//         chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
//     }
//
//     // Function to remove typing indicator
//     function removeTypingIndicator() {
//         const typingIndicator = document.getElementById('typing-indicator');
//         if (typingIndicator) {
//             typingIndicator.remove();
//         }
//     }
//
//     // Function to check server health
//     function checkServerHealth() {
//         fetch(`${SERVER_URL}/health`)
//             .then(response => {
//                 if (response.ok) {
//                     console.log('Chatbot server is online');
//                 } else {
//                     console.warn('Chatbot server is not responding properly');
//                 }
//             })
//             .catch(error => {
//                 console.error('Chatbot server is offline:', error);
//             });
//     }
//
//     // Check server health on load
//     checkServerHealth();
//
//     // Populate starter prompts dynamically
//     const allStarterPrompts = [
//       "Which of Samarth's projects best showcase his AI and data engineering expertise?",
//       "Could you pull up Samarth’s profile and highlight his main qualifications?",
//       "How well does Samarth's profile match this job description?",
//       "How well does Samarth fit the Software Development Engineer role at Google based on his profile?",
//       "Can you evaluate Samarth’s suitability for an SDE position at Amazon?",
//       "Assess how Samarth’s experience aligns with Microsoft's Software Engineer role.",
//       "Determine Samarth’s fit for Apple's Machine Learning Engineer position.",
//       "Review Samarth’s skills and tell me how he matches a data engineer role at Netflix.",
//       // Additional backend-driven prompts
//       "Could you pull up Samarth’s full candidate profile from the database?",
//       "What are Samarth’s top three technical skills listed in his profile?",
//       "Give me an overview of his most recent work experience.",
//       "What degrees and certifications does Samarth hold?",
//       "Retrieve Samarth’s preferred contact email and phone number.",
//       "Can you tell me Samarth’s strengths and soft skills from his profile?",
//       "Ask Samarth on Discord if he’s available for a quick call tomorrow.",
//       "Is Samarth free next Tuesday at 2 PM? If so, schedule a Jitsi meeting.",
//       "Set up a 30-minute Jitsi call with Samarth and me this Friday at 10 AM.",
//       "Schedule a team meeting with Samarth and our HR lead on June 5th at 3 PM.",
//       "What major achievements are highlighted in Samarth’s profile?",
//       "Gather job-fit insights for a DevOps role from his candidate profile.",
//       "Can you confirm Samarth’s availability for a follow-up discussion next week?",
//       "What recent technologies or frameworks has Samarth worked with?",
//       "Has Samarth demonstrated leadership or mentorship in past roles?",
//       "Can you generate 3 bullet points on why Samarth would be a strong hire?",
//       "Compare Samarth’s resume with the job description for a backend engineer at Meta.",
//       "What types of problems has Samarth solved in previous projects?",
//       "Is there evidence that Samarth works well in distributed or remote teams?",
//       "Show examples of Samarth collaborating cross-functionally in his past projects.",
//       "What was the impact of Samarth’s most recent project on his team or company?",
//       "Does Samarth’s experience suggest he can own end-to-end delivery of features?",
//       "Highlight examples where Samarth improved system performance or efficiency.",
//       "List 3 situations where Samarth demonstrated creative problem-solving.",
//       "What cloud platforms is Samarth experienced with, and to what extent?",
//       "Identify any DevOps, CI/CD, or observability tooling Samarth has used.",
//       "Which of Samarth’s projects show production-grade engineering skills?",
//       "Generate a summary of Samarth's AI voice assistant project for a hiring manager.",
//       "Is Samarth open to relocation or remote-first roles?",
//       "Check if Samarth has experience working in startup or high-growth environments.",
//       "What industries has Samarth worked in, and which ones is he targeting?",
//       "Does Samarth's profile show adaptability to fast-changing tech stacks?",
//       "Evaluate whether Samarth’s skills align with the company's current tech roadmap.",
//       "Can you suggest questions I should ask Samarth based on his profile?",
//       "What sets Samarth apart from other candidates with similar experience?",
//       "How recently has Samarth updated his resume or LinkedIn profile?",
//       "Has Samarth received any awards, honors, or special recognition?",
//       "Create a quick one-slide summary of Samarth for the hiring committee.",
//       "What are Samarth’s long-term career goals based on his stated interests?",
//       "Does Samarth demonstrate readiness for designing backend systems at scale for FAANG?",
//       "What’s Samarth’s fluency with CI/CD, observability (e.g., Datadog, Prometheus), and infra-as-code?",
//       "Assess how Samarth balances speed, resilience, and observability in real-time system architectures.",
//       "How has Samarth collaborated with cross-functional teams to ship production features?",
//       "Give examples of product-minded thinking in Samarth’s contributions to his projects?",
//       "Which of Samarth’s projects show self-initiative and curiosity in unstructured environments?",
//       "Evaluate how Samarth balances shipping velocity with learning advanced topics like distributed DBs.",
//       "How does Samarth’s voice AI assistant illustrate his ability to combine research, product, and engineering?",
//       "Does Samarth’s resume suggest trajectory toward tech leadership or staff+ engineering?",
//       "What leadership traits are evident from Samarth’s backend lead role and hackathon wins?",
//       "“Could Samarth lead a small AI/infra team for an early-stage FAANG initiative?",
//       "How does Samarth’s experience with streaming WebSockets and real-time voice AI demonstrate backend depth?",
//       "Evaluate Samarth’s contributions in distributed systems and scalability from his candidate profile?",
//       "Which of Samarth’s projects showcase mastery in LLM integration with efficient backend orchestration?",
//       "How well does Samarth’s backend experience at Draup translate to Stripe’s payment processing and real-time data workflows?",
//   "Evaluate whether Samarth’s work on dynamic query generation and Elasticsearch aligns with Stripe’s data pipeline design principles.",
//   "How does Samarth’s understanding of distributed systems fit Stripe’s real-time transaction reconciliation systems?",
//   "Which of Samarth’s projects best demonstrate his ability to build idempotent, high-availability APIs similar to Stripe’s architecture?",
//   "Assess Samarth’s experience with Celery and Redis in terms of readiness for Stripe’s asynchronous task orchestration systems.",
//   "Has Samarth built systems that ensure consistency and reliability under high load, similar to Stripe’s financial ledgers?",
//   "Can Samarth’s background in building subscription access control map to Stripe’s billing and invoicing platform?",
//   "Compare Samarth’s query optimization and API migration experience to the scale of Stripe’s financial data services.",
//   "Would Samarth’s observability work with Datadog and Prometheus strengthen Stripe’s production monitoring reliability?",
//   "Based on Samarth’s experience, how would he debug issues in a multi-service Stripe-like architecture with Kafka and Redis?",
//   "How would Samarth approach designing a refund and dispute workflow like Stripe’s, based on his Draup background?",
//   "Evaluate Samarth’s readiness to handle reconciliation tasks similar to Stripe’s clearing file ingestion and settlement pipelines.",
//   "Has Samarth demonstrated the ability to think in terms of financial correctness, auditability, and idempotency in his past roles?",
//   "What aspects of Samarth’s design patterns (Factory, Strategy, Validator) would be valuable in Stripe’s modular service architecture?",
//   "Assess how Samarth’s experience in LLM integrations could help automate internal Stripe tooling for ops or reconciliation.",
//   "How might Samarth apply his skills to Stripe’s data warehouse or transaction analytics layers?",
//   "Could Samarth design a microservice to handle merchant payouts with retries, timeouts, and reconciliation safety?",
//   "Does Samarth’s work show he can meet Stripe’s reliability bar for financial systems (five-nines availability)?",
//   "How does Samarth’s system design knowledge align with Stripe’s priorities of correctness, observability, and developer velocity?",
//   "Generate 3 talking points for a Stripe interviewer about Samarth’s backend engineering strengths."
//
//     ];
//     // Randomly select 3 prompts
//     function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }
//     const selectedPrompts = shuffle([...allStarterPrompts]).slice(0, 3);
//     const starterPromptsContainer = document.getElementById('chatbot-starter-prompts');
//     selectedPrompts.forEach(text => {
//       const btn = document.createElement('button');
//       btn.className = 'chatbot-starter-prompt';
//       btn.textContent = text;
//       btn.addEventListener('click', handleStarterPromptClick);
//       starterPromptsContainer.appendChild(btn);
//     });
//
//     // --- Starter Prompts Logic ---
//     // Hide starter prompts utility
//     function hideStarterPrompts() {
//         const starterPrompts = document.getElementById('chatbot-starter-prompts');
//         if (starterPrompts) starterPrompts.style.display = 'none';
//     }
//
//     function handleStarterPromptClick(e) {
//         e.preventDefault();
//         e.stopPropagation();
//         const now = Date.now();
//         if (now - lastPromptClickTime < 300) return;
//         lastPromptClickTime = now;
//         const prompt = e.currentTarget.textContent;
//         if (chatbotInput && prompt) {
//             chatbotInput.value = prompt;
//             hideStarterPrompts(); // Hide prompts when a sample is clicked
//             sendMessage();
//         }
//     }
//
//     // Attach click listeners to starter prompts
//     const starterPromptButtons = document.querySelectorAll('.chatbot-starter-prompt');
//     starterPromptButtons.forEach(btn => {
//         btn.addEventListener('click', handleStarterPromptClick);
//     });
// });
//

/**
 * Modern Chatbot Functionality for Samarth's Portfolio
 * Rewritten to complement a modern, animation-driven CSS design.
 * Features random starter prompts and a clean UI.
 */

document.addEventListener('DOMContentLoaded', function() {
    // --- 1. DOM ELEMENTS ---
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotPopover = document.getElementById('chatbot-popover');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const starterPromptsContainer = document.getElementById('chatbot-starter-prompts');

    // --- 2. STATE & CONFIGURATION ---
    const SERVER_URL = 'https://samarthmahendra-github-io.onrender.com'; // Your server URL
    let conversation = [];
    let isFullscreen = false;

    // --- 3. INITIALIZATION ---
    // Show a helpful popover hint after a delay
    setTimeout(() => {
        if (!chatbotContainer.classList.contains('active')) {
            chatbotPopover.classList.add('popover-show');
        }
    }, 3000);

    checkServerHealth();
    populateRandomStarterPrompts();

    // --- 4. EVENT LISTENERS ---
    chatbotToggle.addEventListener('click', () => {
        chatbotPopover.classList.remove('popover-show');
        chatbotContainer.classList.toggle('active');
        if (chatbotContainer.classList.contains('active')) {
            chatbotInput.focus();
        }
    });

    chatbotClose.addEventListener('click', () => {
        chatbotContainer.classList.remove('active');
    });
    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    // --- 5. CORE CHAT LOGIC ---
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;

        hideStarterPrompts();
        addMessage(message, 'user');
        chatbotInput.value = '';
        chatbotInput.blur();
        showTypingIndicator();

        // Dummy response for demonstration. Replace with your actual fetch logic.
        // setTimeout(() => {
        //     removeTypingIndicator();
        //     const botResponse = `You asked: "${message}". The real AI is offline for this demo, but this is where the response would appear!`;
        //     addMessage(botResponse, 'bot');
        // }, 1500);

        // --- REAL SERVER COMMUNICATION LOGIC (UNCOMMENT TO USE) ---
        if (!window.chatUsername) {
            window.chatUsername = 'user_' + Math.random().toString(36).substring(2, 10);
        }

        fetch(`${SERVER_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message, conversation: conversation, username: window.chatUsername })
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            removeTypingIndicator();
            conversation = data.conversation || conversation;
            if (data.output) addMessage(data.output, 'bot');
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            removeTypingIndicator();
            addMessage("Sorry, I'm having trouble connecting. Please try again later.", 'bot');
        });
    }


    // --- 6. UI HELPER FUNCTIONS ---
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        // Sanitize and format text
        const escapeHTML = (str) => str.replace(/[&<>"']/g, tag => ({'&': '&amp;','<': '&lt;','>': '&gt;','"': '&quot;',"'": '&#39;'}[tag] || tag));
        messageContent.textContent = message; // Using textContent is safer

        messageElement.appendChild(messageContent);
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function showTypingIndicator() {
        if (document.getElementById('typing-indicator')) return; // Prevent multiple indicators

        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.className = 'message bot-message'; // Use the same alignment as bot messages

        // Create a distinct container for the dots that is styled by the new CSS
        typingIndicator.innerHTML = `
            <div class="typing-indicator-content">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        chatbotMessages.appendChild(typingIndicator);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        // Add CSS for the typing dots dynamically for encapsulation
        const styleId = 'typing-indicator-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .typing-indicator-content { display: flex; align-items: center; padding: 12px 18px; }
                .typing-dot { height: 8px; width: 8px; background: var(--text-secondary); border-radius: 50%; display: inline-block; margin: 0 3px; animation: typing-bounce 1.4s infinite ease-in-out both; }
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
                @keyframes typing-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
            `;
            document.head.appendChild(style);
        }
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    function hideStarterPrompts() {
        if (starterPromptsContainer) {
            // Animate out then hide
            starterPromptsContainer.style.opacity = '0';
            setTimeout(() => {
                starterPromptsContainer.style.display = 'none';
            }, 300);
        }
    }

    function populateRandomStarterPrompts() {
        const allPrompts =  [
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
      "What major achievements are highlighted in Samarth’s profile?",
      "Gather job-fit insights for a DevOps role from his candidate profile.",
      "Can you confirm Samarth’s availability for a follow-up discussion next week?",
      "What recent technologies or frameworks has Samarth worked with?",
      "Has Samarth demonstrated leadership or mentorship in past roles?",
      "Can you generate 3 bullet points on why Samarth would be a strong hire?",
      "Compare Samarth’s resume with the job description for a backend engineer at Meta.",
      "What types of problems has Samarth solved in previous projects?",
      "Is there evidence that Samarth works well in distributed or remote teams?",
      "Show examples of Samarth collaborating cross-functionally in his past projects.",
      "What was the impact of Samarth’s most recent project on his team or company?",
      "Does Samarth’s experience suggest he can own end-to-end delivery of features?",
      "Highlight examples where Samarth improved system performance or efficiency.",
      "List 3 situations where Samarth demonstrated creative problem-solving.",
      "What cloud platforms is Samarth experienced with, and to what extent?",
      "Identify any DevOps, CI/CD, or observability tooling Samarth has used.",
      "Which of Samarth’s projects show production-grade engineering skills?",
      "Generate a summary of Samarth's AI voice assistant project for a hiring manager.",
      "Is Samarth open to relocation or remote-first roles?",
      "Check if Samarth has experience working in startup or high-growth environments.",
      "What industries has Samarth worked in, and which ones is he targeting?",
      "Does Samarth's profile show adaptability to fast-changing tech stacks?",
      "Evaluate whether Samarth’s skills align with the company's current tech roadmap.",
      "Can you suggest questions I should ask Samarth based on his profile?",
      "What sets Samarth apart from other candidates with similar experience?",
      "How recently has Samarth updated his resume or LinkedIn profile?",
      "Has Samarth received any awards, honors, or special recognition?",
      "Create a quick one-slide summary of Samarth for the hiring committee.",
      "What are Samarth’s long-term career goals based on his stated interests?",
      "Does Samarth demonstrate readiness for designing backend systems at scale for FAANG?",
      "What’s Samarth’s fluency with CI/CD, observability (e.g., Datadog, Prometheus), and infra-as-code?",
      "Assess how Samarth balances speed, resilience, and observability in real-time system architectures.",
      "How has Samarth collaborated with cross-functional teams to ship production features?",
      "Give examples of product-minded thinking in Samarth’s contributions to his projects?",
      "Which of Samarth’s projects show self-initiative and curiosity in unstructured environments?",
      "Evaluate how Samarth balances shipping velocity with learning advanced topics like distributed DBs.",
      "How does Samarth’s voice AI assistant illustrate his ability to combine research, product, and engineering?",
      "Does Samarth’s resume suggest trajectory toward tech leadership or staff+ engineering?",
      "What leadership traits are evident from Samarth’s backend lead role and hackathon wins?",
      "“Could Samarth lead a small AI/infra team for an early-stage FAANG initiative?",
      "How does Samarth’s experience with streaming WebSockets and real-time voice AI demonstrate backend depth?",
      "Evaluate Samarth’s contributions in distributed systems and scalability from his candidate profile?",
      "Which of Samarth’s projects showcase mastery in LLM integration with efficient backend orchestration?",
      "How well does Samarth’s backend experience at Draup translate to Stripe’s payment processing and real-time data workflows?",
  "Evaluate whether Samarth’s work on dynamic query generation and Elasticsearch aligns with Stripe’s data pipeline design principles.",
  "How does Samarth’s understanding of distributed systems fit Stripe’s real-time transaction reconciliation systems?",
  "Which of Samarth’s projects best demonstrate his ability to build idempotent, high-availability APIs similar to Stripe’s architecture?",
  "Assess Samarth’s experience with Celery and Redis in terms of readiness for Stripe’s asynchronous task orchestration systems.",
  "Has Samarth built systems that ensure consistency and reliability under high load, similar to Stripe’s financial ledgers?",
  "Can Samarth’s background in building subscription access control map to Stripe’s billing and invoicing platform?",
  "Compare Samarth’s query optimization and API migration experience to the scale of Stripe’s financial data services.",
  "Would Samarth’s observability work with Datadog and Prometheus strengthen Stripe’s production monitoring reliability?",
  "Based on Samarth’s experience, how would he debug issues in a multi-service Stripe-like architecture with Kafka and Redis?",
  "How would Samarth approach designing a refund and dispute workflow like Stripe’s, based on his Draup background?",
  "Evaluate Samarth’s readiness to handle reconciliation tasks similar to Stripe’s clearing file ingestion and settlement pipelines.",
  "Has Samarth demonstrated the ability to think in terms of financial correctness, auditability, and idempotency in his past roles?",
  "What aspects of Samarth’s design patterns (Factory, Strategy, Validator) would be valuable in Stripe’s modular service architecture?",
  "Assess how Samarth’s experience in LLM integrations could help automate internal Stripe tooling for ops or reconciliation.",
  "How might Samarth apply his skills to Stripe’s data warehouse or transaction analytics layers?",
  "Could Samarth design a microservice to handle merchant payouts with retries, timeouts, and reconciliation safety?",
  "Does Samarth’s work show he can meet Stripe’s reliability bar for financial systems (five-nines availability)?",
  "How does Samarth’s system design knowledge align with Stripe’s priorities of correctness, observability, and developer velocity?",
  "Generate 3 talking points for a Stripe interviewer about Samarth’s backend engineering strengths."

    ];

        // Shuffle the array and pick the first three
        const selectedPrompts = allPrompts.sort(() => 0.5 - Math.random()).slice(0, 3);

        selectedPrompts.forEach(text => {
            const btn = document.createElement('button');
            btn.className = 'chatbot-starter-prompt'; // This class is styled by your new CSS
            btn.textContent = text;
            btn.addEventListener('click', (e) => {
                chatbotInput.value = e.currentTarget.textContent;
                sendMessage();
            });
            starterPromptsContainer.appendChild(btn);
        });
    }

    function checkServerHealth() {
        fetch(`${SERVER_URL}/health`)
            .then(response => console.log(`Chatbot server status: ${response.ok ? 'Online' : 'Offline'}`))
            .catch(error => console.error('Chatbot server is offline:', error));
    }
});