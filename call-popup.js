// call-popup.js
// Handles the call button hover popover with rotating creative messages
document.addEventListener('DOMContentLoaded', function() {
    // Create popover HTML if it doesn't exist
    if (!document.getElementById('call-popover')) {
        const popover = document.createElement('div');
        popover.id = 'call-popover';
        popover.className = 'call-popover';
        
        // Create the text element inside the popover
        const popoverText = document.createElement('span');
        popoverText.className = 'call-popover-text';
        popover.appendChild(popoverText);
        
        // Add the popover to the body
        document.body.appendChild(popover);
    }
    
    // Get the popover and text elements
    const popover = document.getElementById('call-popover');
    const popoverText = popover.querySelector('.call-popover-text');
    
    // Array of creative popover messages
    const popoverMessages = [
        "📞 Need to talk? Call my personal assistant!",
        "🗣️ Skip the AI, talk to a real human!",
        "📱 Let's take this conversation offline!"
    ];
    
    // Track last shown message to avoid repetition
    let lastPopoverIndex = -1;
    
    // Function to set a random message
    function setRandomPopoverMessage() {
        if (!popoverText) return;
        let idx;
        do {
            idx = Math.floor(Math.random() * popoverMessages.length);
        } while (popoverMessages.length > 1 && idx === lastPopoverIndex);
        
        lastPopoverIndex = idx;
        popoverText.textContent = popoverMessages[idx];
    }
    
    // Set initial random message
    setRandomPopoverMessage();
    
    // Show popover when mouse is near the call button
    function showCallPopover() {
        if (!popover) return;
        setRandomPopoverMessage(); // Change message each time
        popover.classList.add('popover-show');
        
        // Hide after a few seconds
        setTimeout(() => {
            popover.classList.remove('popover-show');
        }, 4000);
    }
    
    // Function to check if mouse is near an element
    function isNear(rect, mouseX, mouseY, threshold = 100) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));
        return distance < threshold;
    }
    
    // Track if mouse was near to avoid repeated triggers
    let mouseWasNearCall = false;

    if (window.innerWidth > 480) {
    
    // Listen for mouse movement to show popover when near the call button
    document.addEventListener('mousemove', function(e) {
        const callBtn = document.getElementById('call-assistant-btn');
        if (!callBtn || !popover) return;
        
        const btnRect = callBtn.getBoundingClientRect();
        const popRect = popover.getBoundingClientRect();
        
        const isHot = isNear(btnRect, e.clientX, e.clientY) || 
                     (popover.classList.contains('popover-show') && isNear(popRect, e.clientX, e.clientY));
        
        if (isHot && !mouseWasNearCall) {
            showCallPopover();
        }
        
        mouseWasNearCall = isHot;
    });
    
}   
    // Show call popover automatically after 5 seconds of page load
    setTimeout(() => {
        showCallPopover();
    }, 5000);
});
