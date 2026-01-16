/**
 * Web Template Hub - No-DB Analytics & Social Proof
 * Uses CountAPI (countapi.xyz) for public hit counters
 */

const COUNTAPI_NAMESPACE = 'web-template-hub.netlify.app';

/**
 * Increment a specific counter and update UI
 * @param {string} key 
 */
async function trackInteraction(key) {
    try {
        // Increment the counter
        const response = await fetch(`https://api.countapi.xyz/hit/${COUNTAPI_NAMESPACE}/${key}`);
        const data = await response.json();

        // Update UI if on index page
        updateCounterDisplay(key, data.value);

        // Also log to GA4 for private tracking
        if (typeof gtag === 'function') {
            gtag('event', 'interaction', {
                'event_category': 'Engagement',
                'event_label': key,
                'value': 1
            });
        }
    } catch (error) {
        console.warn('Analytics tracking failed:', error);
    }
}

/**
 * Fetch and display current counts
 */
async function loadStats() {
    const keys = ['total_downloads', 'total_copies', 'total_views'];

    // Track page view for stats
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        trackInteraction('total_views');
    }

    keys.forEach(async (key) => {
        try {
            const response = await fetch(`https://api.countapi.xyz/get/${COUNTAPI_NAMESPACE}/${key}`);
            const data = await response.json();
            updateCounterDisplay(key, data.value);
        } catch (error) {
            // Fallback to a static number if API fails (first time)
            updateCounterDisplay(key, 0);
        }
    });
}

/**
 * Update the DOM elements with the new count
 * @param {string} key 
 * @param {number} value 
 */
function updateCounterDisplay(key, value) {
    const elements = document.querySelectorAll(`[data-stat="${key}"]`);
    elements.forEach(el => {
        // Animate count if possible, or just set text
        const targetValue = value || 0;
        el.textContent = targetValue.toLocaleString() + '+';
    });
}

// Initialize stats on load
document.addEventListener('DOMContentLoaded', loadStats);

// Global access for other scripts
window.trackDownload = () => trackInteraction('total_downloads');
window.trackCopy = () => trackInteraction('total_copies');
