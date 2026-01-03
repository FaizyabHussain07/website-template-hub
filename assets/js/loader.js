// Page Loader Logic
(function () {
    // Critical Loader Styles
    const style = document.createElement('style');
    style.textContent = `
        #page-loader {
            position: fixed;
            inset: 0;
            background: #f8fafc;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #eff6ff 100%);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 2rem;
            transition: opacity 0.25s ease-out;
            visibility: visible !important;
        }
        .loader-content { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .loader-logo { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
        .loader-logo-icon { 
            width: 3.5rem; height: 3.5rem; 
            background: #2563eb; 
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            border-radius: 1rem; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.25);
        }
        .loader-logo-text { font-size: 1.75rem; font-weight: 800; color: #0f172a; font-family: sans-serif; }
        .loader-logo-text span { color: #2563eb; }
        .loader-spinner { position: relative; width: 4.5rem; height: 4.5rem; }
        .spinner-ring { position: absolute; inset: 0; border-radius: 50%; border: 4px solid transparent; }
        .spinner-ring-outer { border-top-color: #2563eb; border-right-color: #60a5fa; animation: loader-spin 1.5s linear infinite; }
        .spinner-ring-inner { inset: 0.6rem; border-bottom-color: #3b82f6; border-left-color: #93c5fd; animation: loader-spin-reverse 2s linear infinite; }
        .loader-text { text-align: center; font-family: sans-serif; }
        .loader-text p:first-child { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
        .loader-text p:last-child { font-size: 0.875rem; color: #64748b; margin-top: 0.5rem; }
        .loader-progress-bar { width: 14rem; height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
        .loader-progress-value { height: 100%; background: #2563eb; width: 40%; animation: loader-progress 2s ease-in-out infinite; }
        @keyframes loader-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes loader-spin-reverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes loader-progress { 0% { transform: translateX(-100%); width: 30%; } 50% { width: 60%; } 100% { transform: translateX(250%); width: 30%; } }
        
        /* Hide content until loaded */
        body > *:not(#page-loader) { opacity: 0; }
        body.loaded > *:not(#page-loader) { opacity: 1; transition: opacity 0.3s ease-in-out; }
        html.loaded { overflow-y: auto; }
        html:not(.loaded) { overflow-y: hidden; }
    `;
    document.head.appendChild(style);

    const loaderHTML = `
    <div id="page-loader">
        <div class="loader-content">
            <div class="loader-logo">
                <div class="loader-logo-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                </div>
                <span class="loader-logo-text">WebTemplates<span>Hub</span></span>
            </div>

            <div class="loader-spinner">
                <div class="spinner-ring spinner-ring-outer"></div>
                <div class="spinner-ring spinner-ring-inner"></div>
            </div>

            <div class="loader-text">
                <p>Loading...</p>
                <p>Preparing your experience</p>
            </div>

            <div class="loader-progress-bar">
                <div class="loader-progress-value"></div>
            </div>
        </div>
    </div>
    `;

    // Ensure the HTML has the 'loaded' class state managed
    function showContent() {
        document.documentElement.classList.add('loaded');
        document.body.classList.add('loaded');

        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                if (loader.parentNode) loader.remove();
            }, 250);
        }
    }

    function hideContent() {
        document.documentElement.classList.remove('loaded');
        document.body.classList.remove('loaded');
    }

    function createLoader() {
        if (document.getElementById('page-loader')) return;

        const loaderContainer = document.createElement('div');
        loaderContainer.innerHTML = loaderHTML;
        const loader = loaderContainer.firstElementChild;

        // Insert as first child of body
        if (document.body) {
            document.body.insertBefore(loader, document.body.firstChild);
        } else {
            // Fallback if body isn't ready, wait for it
            const observer = new MutationObserver((mutations, obs) => {
                if (document.body) {
                    document.body.insertBefore(loader, document.body.firstChild);
                    obs.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true });
        }
    }

    // Initialize loader as soon as possible
    createLoader();

    // Re-run on DOMContentLoaded just in case
    document.addEventListener('DOMContentLoaded', createLoader);

    // Initial state
    hideContent();

    // Final show when everything is ready
    window.addEventListener('load', function () {
        // Give Tailwind a moment to parse (reduced for speed)
        setTimeout(showContent, 100);
    });

    // Strict fallback timer (3 seconds as requested)
    setTimeout(showContent, 3000);

    // Lucide initialization helper
    window.addEventListener('load', function () {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    });

    // Handle navigation
    document.addEventListener('click', function (e) {
        const link = e.target.closest('a[href]');
        if (link && link.href && !link.target && !link.href.startsWith('#') && !link.href.startsWith('javascript:')) {
            const url = new URL(link.href, window.location.origin);
            if (url.origin === window.location.origin) {
                // Same site navigation
                hideContent();
                // We don't necessarily need to create the loader here as the next page will have it
            }
        }
    }, true);
})();
