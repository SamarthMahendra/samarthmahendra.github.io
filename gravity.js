// Floating effect for the hero section only, toggleable by button
window.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.getElementById('home');
    if (!heroSection) return;

    // Collect elements in hero-content and hero-content-centered
    const heroContent = heroSection.querySelector('.hero-content');
    const heroCentered = heroSection.querySelector('.hero-content-centered');
    // Collect elements to animate: individual social icons float separately
    const elements = [];
    if (heroContent) elements.push(...heroContent.children);
    if (heroCentered) {
        Array.from(heroCentered.children).forEach(child => {
            if (child.classList.contains('social-links')) {
                elements.push(...child.querySelectorAll('a'));
            } else {
                elements.push(child);
            }
        });
    }

    // // Create fun toggle button
    // const floatBtn = document.createElement('button');
    // floatBtn.id = 'float-toggle-btn';
    // floatBtn.className = 'float-button';
    // floatBtn.innerHTML = `<span class=\"float-btn-emoji\" style=\"font-size:24px;vertical-align:middle;line-height:1;display:inline-block;\">🪶</span>`;
    // floatBtn.style.position = 'fixed';
    // floatBtn.style.bottom = '24px';
    // floatBtn.style.left = '24px';
    // floatBtn.style.zIndex = '999';
    // floatBtn.style.height = '48px';
    // floatBtn.style.padding = '0 20px';
    // floatBtn.style.borderRadius = '24px';
    // floatBtn.style.background = 'linear-gradient(135deg, #0066FF 0%, #33CCFF 100%)';
    // floatBtn.style.border = 'none';
    // floatBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12)';
    // floatBtn.style.display = 'flex';
    // floatBtn.style.alignItems = 'center';
    // floatBtn.style.fontSize = '16px';
    // floatBtn.style.fontWeight = '600';
    // floatBtn.style.color = '#fff';
    // floatBtn.style.cursor = 'pointer';
    // floatBtn.style.userSelect = 'none';
    // floatBtn.style.transition = 'all 200ms cubic-bezier(.4,1.2,.6,1)';
    // floatBtn.style.letterSpacing = '0.01em';
    // floatBtn.style.boxSizing = 'border-box';
    // floatBtn.style.outline = 'none';
    
    // floatBtn.style.minWidth = '0';
    // floatBtn.style.fontFamily = 'inherit';
    // floatBtn.style.margin = '0';
    // // Modern shadow always-on
    // floatBtn.onmouseenter = () => {
    //     floatBtn.style.background = 'linear-gradient(135deg, #338DFF 0%, #66E6FF 100%)';
    //     floatBtn.style.transform = 'translateY(-2px)';
    //     floatBtn.style.boxShadow = '0 8px 16px rgba(0,0,0,0.20)';
    // };
    // floatBtn.onmouseleave = () => {
    //     floatBtn.style.background = 'linear-gradient(135deg, #0066FF 0%, #33CCFF 100%)';
    //     floatBtn.style.transform = 'none';
    //     floatBtn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12)';
    // };


    // document.body.appendChild(floatBtn);

    let floatingEnabled = false;
    let animId = null;
    let start = null;

    function animateFloating(ts) {
        if (!floatingEnabled) return;
        if (!start) start = ts;
        const t = (ts - start) / 1000;
        elements.forEach((el, i) => {
            const floatY = Math.sin(t * 1.1 + i) * 16 + Math.cos(t * 0.6 + i * 1.7) * 8;
            const floatX = Math.cos(t * 0.7 + i * 2.2) * 40;
            el.style.transform = `translate(${floatX}px, ${floatY}px)`;
        });
        animId = requestAnimationFrame(animateFloating);
    }

    function resetFloating() {
        elements.forEach(el => {
            el.style.transform = '';
        });
        start = null;
        if (animId) cancelAnimationFrame(animId);
    }

    let tooltipElem = null;
    function showTooltip() {
        if (floatingEnabled) return;
        if (tooltipElem) {
            tooltipElem.remove();
            tooltipElem = null;
        }
        if (floatBtn.querySelector('.float-popup')) floatBtn.querySelector('.float-popup').remove();
        tooltipElem = document.createElement('div');
        tooltipElem.className = 'float-popup';
        // Style popup inline for consistent appearance
        Object.assign(tooltipElem.style, {
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fff',
            color: '#222',
            borderRadius: '8px',
            padding: '6px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: '14px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            zIndex: '2000'
        });
        tooltipElem.innerHTML = 'Make me float!';
        floatBtn.appendChild(tooltipElem);
        setTimeout(() => {
            if (tooltipElem && tooltipElem.parentNode === floatBtn) {
                tooltipElem.remove();
                tooltipElem = null;
            }
        }, 2200);
    }
    let tooltipTimeoutId = setTimeout(showTooltip, 5000);

    // Track which emoji to show when toggled off
    let floatOffToggle = false;
    // Use a persistent emoji span for updates
    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'float-btn-emoji';
    emojiSpan.style.fontSize = '24px';
    emojiSpan.style.verticalAlign = 'middle';
    emojiSpan.style.lineHeight = '1';
    emojiSpan.style.display = 'inline-block';
    emojiSpan.textContent = '🪶';
    floatBtn.innerHTML = '';
    floatBtn.appendChild(emojiSpan);

    floatBtn.addEventListener('click', () => {
        floatingEnabled = !floatingEnabled;
        if (floatingEnabled) {
            emojiSpan.textContent = '🌀';
            animateFloating();
            if (tooltipTimeoutId) clearTimeout(tooltipTimeoutId);
        } else {
            floatOffToggle = !floatOffToggle;
            const offEmoji = floatOffToggle ? '🌙' : '🪶';
            emojiSpan.textContent = offEmoji;
            resetFloating();
            tooltipTimeoutId = setTimeout(showTooltip, 10000);
        }
    });
});
