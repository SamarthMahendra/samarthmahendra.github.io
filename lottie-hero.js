// Lottie animation loader for hero section
// https://lottie.host/703bcf86-7138-48c0-bd8d-c1bc403722df/wgVlCeniwY.lottie

document.addEventListener('DOMContentLoaded', function() {
    var lottieContainer = document.getElementById('hero-lottie-animation');
    if (!lottieContainer) return;
    
    // Dynamically load lottie-web if not present
    function loadLottie(callback) {
        if (window.lottie) return callback();
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    loadLottie(function() {
        window.lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: './lotty_animation.json',
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid meet'
            }
        });
    });
});
