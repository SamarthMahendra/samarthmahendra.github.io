// Animation controller
document.addEventListener('DOMContentLoaded', function() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initialize theme (dark/light)
    initTheme();
    
    // Initialize Lottie animations
    initLottieAnimations();
    
    // Initialize text animations (splitting)
    initTextAnimations();
    
    // Initialize LocomotiveScroll for smooth scrolling
    initSmoothScroll();
    
    // Initialize swiper carousel
    initProjectCarousel();
    
    // Initialize various GSAP animations
    initGsapAnimations();
});

// Theme toggling
function initTheme() {
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(`theme-${savedTheme}`);
    
    // Initialize theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // Set initial state
        themeToggle.checked = savedTheme === 'dark';
        
        // Toggle theme on click
        themeToggle.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark' : 'light';
            document.body.classList.remove('theme-light', 'theme-dark');
            document.body.classList.add(`theme-${newTheme}`);
            localStorage.setItem('theme', newTheme);
            
            // Animate transition
            gsap.to('body', {
                backgroundColor: this.checked ? '#121212' : '#f4f7f6',
                color: this.checked ? '#e0e0e0' : '#333',
                duration: 0.5
            });
        });
    }
}

// Initialize Lottie animations
function initLottieAnimations() {
    // Header developer animation
    const developerAnimation = lottie.loadAnimation({
        container: document.getElementById('developer-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://assets3.lottiefiles.com/packages/lf20_w51pcehl.json'
    });
    
    // Skills section animation
    const skillsAnimation = lottie.loadAnimation({
        container: document.getElementById('skills-animation'),
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: 'https://assets6.lottiefiles.com/packages/lf20_3vbOcw.json'
    });
    
    // Trigger skills animation on scroll
    ScrollTrigger.create({
        trigger: "#skills",
        start: "top 70%",
        onEnter: () => skillsAnimation.play()
    });
    
    // Scroll down indicator
    const scrollAnimation = lottie.loadAnimation({
        container: document.getElementById('scroll-indicator'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://assets9.lottiefiles.com/packages/lf20_iikbn0zt.json'
    });
}

// Text reveal animations using Splitting.js
function initTextAnimations() {
    // Initialize Splitting
    const results = Splitting();
    
    // Animate headings
    gsap.utils.toArray('.reveal-text').forEach(heading => {
        const chars = heading.querySelectorAll('.char');
        
        gsap.from(chars, {
            scrollTrigger: {
                trigger: heading,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 100,
            rotateX: -90,
            stagger: 0.02,
            duration: 0.8,
            ease: "back.out(1.7)"
        });
    });
}

// Smooth scroll using Locomotive Scroll
function initSmoothScroll() {
    const scroller = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]'),
        smooth: true,
        smartphone: {
            smooth: true
        },
        tablet: {
            smooth: true
        }
    });
    
    // Update ScrollTrigger when scroll updates
    scroller.on('scroll', ScrollTrigger.update);
    
    // Update scroll position on page refresh
    ScrollTrigger.scrollerProxy('[data-scroll-container]', {
        scrollTop(value) {
            return arguments.length ? scroller.scrollTo(value, 0, 0) : scroller.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
            return {
                top: 0, 
                left: 0, 
                width: window.innerWidth, 
                height: window.innerHeight
            };
        }
    });
    
    // Each time the window updates, refresh ScrollTrigger and locomotive scroll
    ScrollTrigger.addEventListener('refresh', () => scroller.update());
    ScrollTrigger.refresh();
}

// Project animation (no carousel)
function initProjectCarousel() {
    // Animate project cards
    gsap.from(".featured-projects-grid .project-card", {
        scrollTrigger: {
            trigger: ".featured-projects-grid",
            start: "top 85%",
        },
        y: 50,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out"
    });
}

// Initialize all GSAP animations
function initGsapAnimations() {
    // Hero section
    gsap.from('.hero-content > *', {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out',
    });
    
    // Parallax effect for background elements
    gsap.utils.toArray('.parallax-bg').forEach(bg => {
        gsap.to(bg, {
            scrollTrigger: {
                trigger: bg.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            },
            y: (i, target) => {
                const depth = target.dataset.depth || 0.2;
                return -ScrollTrigger.maxScroll(window) * depth;
            }
        });
    });
    
    // About section animations
    animateAboutSection();
    
    // Skills section animations
    animateSkillsSection();
    
    // Experience timeline animations
    animateTimeline();
    
    // Projects animations
    animateProjects();
    
    // Stats animations
    animateStats();
    
    // Magnetic button effects
    initMagneticButtons();
    
    // Scroll-triggered progress bars
    animateProgressBars();
}

// About section detail animations
function animateAboutSection() {
    gsap.from("#about .about-grid p", {
        scrollTrigger: {
            trigger: "#about",
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.7,
        ease: "power1.out"
    });
    
    // Image reveal animation
    gsap.from(".about-image", {
        scrollTrigger: {
            trigger: ".about-image",
            start: "top 85%"
        },
        clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
        duration: 1,
        ease: "power3.inOut"
    });
}

// Skills section detailed animations
function animateSkillsSection() {
    // Icon animations
    gsap.from("#skills .skills-icons img", {
        scrollTrigger: {
            trigger: "#skills",
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        scale: 0.5,
        y: 20,
        stagger: 0.05,
        duration: 0.5,
        ease: "back.out(1.4)"
    });
    
    // Category groups animations
    gsap.utils.toArray('.skill-category').forEach((category, i) => {
        gsap.from(category, {
            scrollTrigger: {
                trigger: category,
                start: "top 85%"
            },
            opacity: 0,
            x: i % 2 === 0 ? -50 : 50,
            duration: 0.8,
            ease: "power2.out"
        });
    });
}

// Experience and education timeline animations
function animateTimeline() {
    // Timeline line drawing animation
    gsap.from(".timeline::before", {
        scrollTrigger: {
            trigger: ".timeline",
            start: "top 80%",
            end: "bottom 20%",
            scrub: true
        },
        scaleY: 0,
        transformOrigin: "top center",
        ease: "none"
    });
    
    // Timeline items
    gsap.from(".timeline-item", {
        scrollTrigger: {
            trigger: ".timeline",
            start: "top 85%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        x: -50,
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out"
    });
    
    // Timeline dots
    gsap.from(".timeline-item::before", {
        scrollTrigger: {
            trigger: ".timeline",
            start: "top 85%"
        },
        scale: 0,
        opacity: 0,
        stagger: 0.2,
        duration: 0.5,
        ease: "back.out(1.7)"
    });
}

// Project cards animations
function animateProjects() {
    // Standard cards animation
    gsap.from("#projects .project-card", {
        scrollTrigger: {
            trigger: "#projects",
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.7,
        ease: "power1.out"
    });
    
    // Hover effects
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            gsap.to(this, {
                y: -10,
                scale: 1.02,
                boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                duration: 0.3
            });
        });
        
        card.addEventListener('mouseleave', function() {
            gsap.to(this, {
                y: 0,
                scale: 1,
                boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
                duration: 0.3
            });
        });
    });
}

// Stats animations
function animateStats() {
    // Stats counter animation
    const counterElements = document.querySelectorAll('.counter');
    counterElements.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        
        gsap.to(counter, {
            scrollTrigger: {
                trigger: counter,
                start: "top 85%"
            },
            innerHTML: target,
            duration: 2,
            snap: { innerHTML: 1 },
            ease: "power2.out"
        });
    });
    
    // Github stats
    gsap.from("#stats .stats-images img", {
        scrollTrigger: {
            trigger: "#stats",
            start: "top 85%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: "elastic.out(1, 0.75)"
    });
}

// Animate buttons with magnetic effect
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-button');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(this, {
                x: x * 0.2,
                y: y * 0.2,
                rotation: x * 0.05,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        btn.addEventListener('mouseleave', function() {
            gsap.to(this, {
                x: 0,
                y: 0,
                rotation: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.5)"
            });
        });
    });
}

// Animate skill progress bars
function animateProgressBars() {
    gsap.utils.toArray('.progress-bar').forEach(bar => {
        const percent = bar.getAttribute('data-percent');
        
        gsap.from(bar, {
            scrollTrigger: {
                trigger: bar,
                start: "top 85%"
            },
            width: 0,
            duration: 1.5,
            ease: "power2.out"
        });
        
        // Update percentage counter
        const counter = bar.querySelector('.progress-percent');
        if (counter) {
            gsap.to(counter, {
                scrollTrigger: {
                    trigger: bar,
                    start: "top 85%"
                },
                innerHTML: percent + '%',
                duration: 1.5,
                snap: { innerHTML: 1 }
            });
        }
    });
}