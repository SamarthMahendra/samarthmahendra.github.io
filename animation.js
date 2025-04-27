// Animation controller
document.addEventListener('DOMContentLoaded', function() {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initialize theme (dark/light)
    initTheme();
    
    // Initialize Lottie animations
    initLottieAnimations();
    
    // Initialize text animations (Splitting.js headings)
    initTextAnimations();
    
    // Animate About section
    animateAboutSection();
    // Animate Skills section
    animateSkillsSection();
    // Animate Timeline (Experience/Education)
    animateTimeline();
    // Animate Projects section
    animateProjects();
    // Animate Stats section
    animateStats();
    // Animate Progress Bars
    animateProgressBars();
    // Animate Magnetic Buttons
    initMagneticButtons();

    // Wait for LocomotiveScroll to be available
    window.addEventListener('load', function() {
        setTimeout(() => {
            initSmoothScroll();
            initProjectCarousel();
            // Re-initialize all GSAP animations after scroll/carousel ready
            initGsapAnimations();
        }, 500);
    });
});

// Theme toggling
function initTheme() {
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(`theme-${savedTheme}`);

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
        path: 'https://assets2.lottiefiles.com/packages/lf20_qdbb21wb.json' // Scroll down animation
    });
}

// Text reveal animations using Splitting.js
function initTextAnimations() {
    console.log('[GSAP] initTextAnimations() called');
    const headings = document.querySelectorAll('.reveal-text');
    console.log(`[GSAP] .reveal-text count: ${headings.length}`);
    // Initialize Splitting
    const results = Splitting();

    // Custom: Animate hero name (first .hero-content-centered h1.reveal-text)
    const heroName = document.querySelector('.hero-content-centered h1.reveal-text[data-splitting]');
    if (heroName) {
        const chars = heroName.querySelectorAll('.char');
        gsap.fromTo(chars, {
            opacity: 0,
            y: 30,
        }, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.05,
            ease: 'power2.out',
            delay: 0.2,
        });
    }

    // Animate headings (except hero name) on scroll
    gsap.utils.toArray('.reveal-text').forEach(heading => {
        // Skip hero name (already animated)
        if (heading === heroName) return;
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
    console.log('[GSAP] initTextAnimations() called');
    const headings = document.querySelectorAll('.reveal-text');
    console.log(`[GSAP] .reveal-text count: ${headings.length}`);
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
    // Check if LocomotiveScroll is available
    if (typeof LocomotiveScroll === 'undefined') {
        console.warn('LocomotiveScroll is not defined. Smooth scrolling disabled.');
        return;
    }
    
    try {
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
        
        // Update ScrollTrigger when scroll updates (if ScrollTrigger is available)
        if (typeof ScrollTrigger !== 'undefined') {
            scroller.on('scroll', ScrollTrigger.update);
        }
    } catch (error) {
        console.warn('Error initializing smooth scroll:', error);
    }
    
    // Update scroll position on page refresh (if ScrollTrigger is available)
    if (typeof ScrollTrigger !== 'undefined') {
        try {
            ScrollTrigger.scrollerProxy('[data-scroll-container]', {
                scrollTop(value) {
                    if (typeof scroller !== 'undefined') {
                        return arguments.length ? scroller.scrollTo(value, 0, 0) : scroller.scroll.instance.scroll.y;
                    }
                    return 0;
                },
                getBoundingClientRect() {
                    return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
                },
                pinType: document.querySelector('[data-scroll-container]').style.transform ? "transform" : "fixed"
            });
        } catch (error) {
            console.warn('Error setting up ScrollTrigger proxy:', error);
        }
    }
    
    // Each time the window updates, refresh ScrollTrigger and locomotive scroll
    if (typeof ScrollTrigger !== 'undefined' && typeof scroller !== 'undefined') {
        try {
            ScrollTrigger.addEventListener('refresh', () => scroller.update());
            ScrollTrigger.refresh();
        } catch (error) {
            console.warn('Error refreshing ScrollTrigger:', error);
        }
    }
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
    if (document.querySelector('#about .about-grid p') || document.querySelector('.about-image')) {
        animateAboutSection();
    }
    // Skills section animations
    if (document.querySelector('#skills .skill-category')) {
        animateSkillsSection();
    }
    // Experience timeline animations
    if (document.querySelector('.timeline') && document.querySelector('.timeline-item')) {
        animateTimeline();
    }
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
    console.log('[GSAP] animateAboutSection() called');
    const aboutGrid = document.querySelectorAll('#about .about-grid p');
    console.log(`[GSAP] #about .about-grid p count: ${aboutGrid.length}`);
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
    
    // Image reveal animation (only if .about-image exists)
    if (document.querySelector('.about-image')) {
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
}

// Skills section detailed animations
function animateSkillsSection() {
    console.log('[GSAP] animateSkillsSection() called');
    const skillCategories = document.querySelectorAll('.skill-category');
    console.log(`[GSAP] .skill-category count: ${skillCategories.length}`);
    // Icon animations (only if #skills .skills-icons img exists)
    if (document.querySelector('#skills .skills-icons img')) {
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
    }
    
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
    console.log('[GSAP] animateTimeline() called');
    const items = document.querySelectorAll('.timeline-item');
    console.log(`[GSAP] .timeline-item count: ${items.length}`);
    // Timeline line drawing animation (pseudo-element cannot be animated directly)
    // Instead, consider adding a child .timeline-line and animate that if needed.
    // gsap.from('.timeline-line', { ... });
    // Skipping direct animation of .timeline::before
    
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
    
    // Timeline dots (pseudo-element cannot be animated directly)
    // Instead, consider adding a child element for the dot and animate that if needed.
    // Skipping direct animation of .timeline-item::before
}

// Project cards animations
function animateProjects() {
    console.log('[GSAP] animateProjects() called');
    const projectCards = document.querySelectorAll('#projects .project-card');
    console.log(`[GSAP] #projects .project-card count: ${projectCards.length}`);
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
    console.log('[GSAP] animateStats() called');
    const counterElements = document.querySelectorAll('.counter');
    console.log(`[GSAP] .counter count: ${counterElements.length}`);
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
    console.log('[GSAP] animateProgressBars() called');
    const progressBars = document.querySelectorAll('.progress-bar');
    console.log(`[GSAP] .progress-bar count: ${progressBars.length}`);
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