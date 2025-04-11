// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

    // Register the ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // --- JobStats Section Animation (Existing) ---
    const jobstatsTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#current-work",
            start: "top 75%", // Adjusted start point slightly
            // markers: true,
            toggleActions: "play none none none"
        }
    });

    jobstatsTl
        .from("#jobstats-title", { y: 50, opacity: 0, duration: 0.8, ease: "power2.out" })
        .from("#jobstats-visual .tech-icon", { scale: 0.5, opacity: 0, stagger: 0.1, duration: 0.5, ease: "back.out(1.7)" }, "-=0.5") // Faster stagger
        .from("#jobstats-description", { x: -50, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.4")
        .from("#current-work .button", { y: 20, opacity: 0, duration: 0.6, ease: "power1.out" }, "-=0.3"); // Animate button too


    // --- About Section Animation ---
    gsap.from("#about .about-grid p", {
        scrollTrigger: {
            trigger: "#about",
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        y: 30,
        stagger: 0.15, // Stagger the animation for each paragraph
        duration: 0.7,
        ease: "power1.out"
    });

    // --- Skills Section Icons Animation ---
    gsap.from("#skills .skills-icons img", {
        scrollTrigger: {
            trigger: "#skills",
            start: "top 80%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        scale: 0.5,
        y: 20,
        stagger: 0.05, // Quick stagger for icons
        duration: 0.5,
        ease: "back.out(1.4)"
    });

    // --- Experience/Education Timeline Animation ---
    gsap.from(".timeline-item", {
        scrollTrigger: {
            trigger: ".timeline", // Trigger when the timeline container starts entering
            start: "top 85%",
            toggleActions: "play none none none",
            // markers: true, // Uncomment for debugging
        },
        opacity: 0,
        x: -50, // Slide in from left
        stagger: 0.2,
        duration: 0.8,
        ease: "power2.out"
    });

    // --- Projects Card Animation ---
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

    // --- Certifications Animation ---
    gsap.from("#certifications .certification-item", {
        scrollTrigger: {
            trigger: "#certifications",
            start: "top 85%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        x: 50, // Slide in from right
        stagger: 0.1,
        duration: 0.6,
        ease: "power1.out"
    });


    // --- Stats Animation ---
    gsap.from("#stats .stats-images img", {
        scrollTrigger: {
            trigger: "#stats",
            start: "top 85%",
            toggleActions: "play none none none"
        },
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: "elastic.out(1, 0.75)" // A little bounce
    });


}); // End DOMContentLoaded