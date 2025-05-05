// Main JavaScript for profile website
document.addEventListener('DOMContentLoaded', function() {
    // --- Call Assistant Button & Modal Logic ---
    const callBtn = document.getElementById('call-assistant-btn');
    const callModal = document.getElementById('call-assistant-modal');
    const callClose = document.getElementById('call-assistant-close');
    if (callBtn && callModal && callClose) {
        callBtn.addEventListener('click', function() {
            callModal.classList.add('show');
        });
        callClose.addEventListener('click', function() {
            callModal.classList.remove('show');
        });
        callModal.addEventListener('click', function(e) {
            if (e.target === callModal) callModal.classList.remove('show');
        });
    }
    // --- End Call Assistant Logic ---

    // Show chatbot popover animation on first load (once per session)
    const popover = document.getElementById('chatbot-popover');
    const popoverText = popover ? popover.querySelector('.chatbot-popover-text') : null;
    const popoverIcon = popover ? popover.querySelector('.chatbot-popover-icon') : null;
    const popoverMessages = [
        "👋 Need help? Chat with Samarth's AI!",
        "🚀 Have a question? I'm here (AI)!",
        "🤖 Let's chat! Ask away (AI)."
    ];
    let lastPopoverIndex = -1;
    function setRandomPopoverMessage() {
        if (!popoverText) return;
        let idx;
        do {
            idx = Math.floor(Math.random() * popoverMessages.length);
        } while (popoverMessages.length > 1 && idx === lastPopoverIndex);
        lastPopoverIndex = idx;
        popoverText.textContent = popoverMessages[idx];
    }
    setRandomPopoverMessage();
    // Always show chatbot popover animation on page load
    if (popover) {
        setTimeout(() => {
            if (!popoverEnabled) return;
            popover.classList.add('popover-show');
            setTimeout(() => {
                popover.classList.remove('popover-show');
            }, 4000);
        }, 1200);
    }

    // Show popover when mouse moves near chatbot button or popover
    let popoverTimeout = null;
    function showPopover() {
        setRandomPopoverMessage();
        if (popoverTimeout) clearTimeout(popoverTimeout);
        popover.classList.add('popover-show');
        popoverTimeout = setTimeout(() => {
            popover.classList.remove('popover-show');
        }, 4000);
    }
    let mouseWasNear = false;
    document.addEventListener('mousemove', function(e) {
        if (!popoverEnabled) return;
        const toggleBtn = document.getElementById('chatbot-toggle');
        if (!toggleBtn || !popover) return;
        const btnRect = toggleBtn.getBoundingClientRect();
        const popRect = popover.getBoundingClientRect();
        const mouseX = e.clientX, mouseY = e.clientY;
        function isNear(rect) {
            return (
                mouseX >= rect.left - 80 && mouseX <= rect.right + 80 &&
                mouseY >= rect.top - 80 && mouseY <= rect.bottom + 80
            );
        }
        const isHot = isNear(btnRect) || isNear(popRect);
        if (isHot && !mouseWasNear) {
            showPopover();
        }
        mouseWasNear = isHot;
    });
    // Animate icon wiggle every 12s
    if (popoverIcon) {
        setInterval(() => {
            popoverIcon.style.animation = 'none';
            // Force reflow to restart animation
            void popoverIcon.offsetWidth;
            popoverIcon.style.animation = '';
        }, 12000);
    }
    // On click: expand popover and open chatbot
    if (popover) {
        popover.addEventListener('click', () => {
            popover.classList.add('popover-expand');
            setTimeout(() => {
                popover.classList.remove('popover-show');
                // Try to open chatbot (simulate clicking chatbot-toggle)
                const toggleBtn = document.getElementById('chatbot-toggle');
                if (toggleBtn) toggleBtn.click();
            }, 350);
        });
    }
    // Hide popover when chat is open
    let popoverEnabled = true;
    function hidePopover() {
        if (popoverTimeout) clearTimeout(popoverTimeout);
        popover.classList.remove('popover-show');
    }
    // Detect chat open (assume #chatbot-container becomes visible)
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    if (chatbotToggle && chatbotContainer) {
        chatbotToggle.addEventListener('click', () => {
            setTimeout(() => {
                if (window.getComputedStyle(chatbotContainer).display !== 'none' && chatbotContainer.offsetHeight > 0) {
                    popoverEnabled = false;
                    hidePopover();
                }
            }, 150);
        });
        // Re-enable popover when chat is closed
        const closeBtn = document.getElementById('chatbot-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                setTimeout(() => {
                    popoverEnabled = true;
                }, 200);
            });
        }
    }


    console.log('Happy developing ✨');
    

    
    // Initialize scrolling behavior
    initScrollBehavior();
    
    // Initialize typing effects
    initTypingEffect();
    
    // Initialize stat counters
    initCounters();
    
    // Initialize scroll-to-top button
    initScrollToTop();
});

// Smooth scroll to section when clicking on navigation links
function initScrollBehavior() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = Array.from(document.querySelectorAll('section[id]'));

    // IntersectionObserver-based highlighting
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60% 0px', // triggers when section top is 40% from top
        threshold: 0
    };
    function onSectionIntersect(entries) {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navLink = document.querySelector('.nav-links a[href="#' + id + '"]');
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    }
    const observer = new window.IntersectionObserver(onSectionIntersect, observerOptions);
    sections.forEach(section => observer.observe(section));

    // Create navigation if it doesn't exist
    if (!document.querySelector('.nav-menu')) {
        const navHTML = `
            <nav class="nav-menu">
                <div class="nav-container">
                    <a href="#" class="nav-logo magnetic-button">SM</a>
                    <ul class="nav-links">
                        <li><a href="#about">About</a></li>
                        <li><a href="#skills">Skills</a></li>
                        <li><a href="#experience">Experience</a></li>
                        <li><a href="#projects">Projects</a></li>
                        <li><a href="#contact" class="nav-cta magnetic-button">Contact</a></li>
                    </ul>
                    <div class="nav-mobile-toggle">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </nav>
        `;
        document.body.insertAdjacentHTML('afterbegin', navHTML);
        
        // Setup mobile navigation
        const mobileToggle = document.querySelector('.nav-mobile-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileToggle) {
            mobileToggle.addEventListener('click', function() {
                this.classList.toggle('active');
                navLinks.classList.toggle('active');
            });
        }
    }
    
    // Setup scroll behavior for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            const mobileToggle = document.querySelector('.nav-mobile-toggle');
            const navLinks = document.querySelector('.nav-links');
            if (mobileToggle && mobileToggle.classList.contains('active')) {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
            
            // Scroll to target
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Change active link on scroll
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Typing effect for hero section
function initTypingEffect() {
    // If we have a typing element, initialize the effect
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        const phrases = [
            'Software Engineer',
            'Full Stack Developer',
            'Backend Specialist',
            'LLM Engineer',
            'Problem Solver'
        ];
        
        let currentPhrase = 0;
        let currentChar = 0;
        let isDeleting = false;
        let isPaused = false;
        let pauseEnd = 0;
        
        function type() {
            // Current phrase
            const phrase = phrases[currentPhrase];
            
            // Typing logic
            if (isDeleting) {
                // Remove character
                typingElement.textContent = phrase.substring(0, currentChar - 1);
                currentChar--;
                
                // If deleted completely, move to next phrase
                if (currentChar === 0) {
                    isDeleting = false;
                    currentPhrase = (currentPhrase + 1) % phrases.length;
                }
            } else {
                // Add character
                typingElement.textContent = phrase.substring(0, currentChar + 1);
                currentChar++;
                
                // If typed completely, start deleting after pause
                if (currentChar === phrase.length) {
                    isPaused = true;
                    pauseEnd = Date.now() + 2000; // 2 second pause
                }
            }
            
            // Timing
            let typeSpeed = 100;
            
            if (isPaused && Date.now() >= pauseEnd) {
                isPaused = false;
                isDeleting = true;
            }
            
            if (isDeleting) {
                typeSpeed /= 2; // Faster when deleting
            }
            
            if (!isPaused) {
                setTimeout(type, typeSpeed);
            } else {
                setTimeout(type, 50); // Check pause status frequently
            }
        }
        
        // Start typing effect
        setTimeout(type, 1000);
    }
}

// Initialize number counters with animation
function initCounters() {
    const counterElements = document.querySelectorAll('.counter');
    
    counterElements.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const step = Math.ceil(target / (duration / 20)); // Update every 20ms
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current >= target) {
                counter.textContent = target;
            } else {
                counter.textContent = current;
                setTimeout(updateCounter, 20);
            }
        };
        
        // Use Intersection Observer to start when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// Initialize scroll to top button
function initScrollToTop() {
    // Create button if it doesn't exist
    if (!document.querySelector('.scroll-top')) {
        const scrollButton = document.createElement('div');
        scrollButton.className = 'scroll-top';
        scrollButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
        document.body.appendChild(scrollButton);
        
        // Scroll to top when clicked
        scrollButton.addEventListener('click', () => {
            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // Fallback for older browsers
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });
    }
    
    // Ensure click handler for existing scroll-top button
    const scrollExisting = document.querySelector('.scroll-top');
    if (scrollExisting) {
        scrollExisting.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });
    }
    
    // Show/hide button based on scroll position
    const scrollTopButton = document.querySelector('.scroll-top');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopButton.classList.add('active');
        } else {
            scrollTopButton.classList.remove('active');
        }
    });
}

// Current year for footer
document.getElementById('current-year').textContent = new Date().getFullYear();