
// Main JavaScript for profile website
document.addEventListener('DOMContentLoaded', function() {
    console.log('Happy developing ✨');
    
    // Initialize theme on load
    initThemeToggle();
    
    // Initialize scrolling behavior
    initScrollBehavior();
    
    // Initialize typing effects
    initTypingEffect();
    
    // Initialize stat counters
    initCounters();
    
    // Initialize scroll-to-top button
    initScrollToTop();
});

// Theme toggle functionality
function initThemeToggle() {
    // Default to dark theme, check for saved theme
    // Always default to dark unless user explicitly chose light
    
    savedTheme = 'dark';
    localStorage.setItem('theme', 'dark');

    
    // Create theme toggle if it doesn't exist
    if (!document.querySelector('.theme-switch-wrapper')) {
        const toggleHTML = `
            <div class="theme-switch-wrapper">
                <label class="theme-switch" for="theme-toggle">
                    <input type="checkbox" id="theme-toggle" ${savedTheme === 'dark' ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', toggleHTML);
    }
    
}

// Smooth scroll to section when clicking on navigation links
function initScrollBehavior() {
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
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
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