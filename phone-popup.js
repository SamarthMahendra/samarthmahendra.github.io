// phone-popup.js
// Handles the phone call popup for "Call my personal assistant"
document.addEventListener('DOMContentLoaded', function() {
    // Create popup HTML
    const popup = document.createElement('div');
    popup.id = 'phone-popup';
    popup.innerHTML = `
        <div class="phone-popup-content">
            <span class="phone-popup-close" id="phone-popup-close">&times;</span>
            <h2>Call my personal assistant</h2>
            <p>Would you like to call Samarth's personal assistant?</p>
            <a href="tel:+18339703274" class="phone-popup-call-btn">Call (833) 970-3274</a>
        </div>
    `;
    document.body.appendChild(popup);

    // Show popup on button click
    const phoneBtn = document.getElementById('call-assistant-btn');
    if (phoneBtn) {
        phoneBtn.addEventListener('click', function(e) {
            e.preventDefault();
            popup.classList.add('show');
        });
    }

    // Close popup
    document.getElementById('phone-popup-close').onclick = function() {
        popup.classList.remove('show');
    };
    // Close on outside click
    window.onclick = function(event) {
        if (event.target === popup) {
            popup.classList.remove('show');
        }
    };
});
