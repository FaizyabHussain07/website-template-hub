// Page Loader - Show loading spinner until page is fully loaded with all assets
(function() {
    // Create professional loader HTML
    const loaderHTML = `
    <div id="page-loader" class="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 z-9999 flex items-center justify-center">
        <div class="flex flex-col items-center gap-8">
            <!-- Logo/Brand -->
            <div class="flex items-center gap-2 mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-4h2v18h-2z"/>
                    </svg>
                </div>
                <span class="text-2xl font-bold text-slate-900">WebTemplates<span class="text-blue-600">Hub</span></span>
            </div>

            <!-- Advanced Spinner -->
            <div class="relative w-20 h-20">
                <!-- Outer ring -->
                <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-400 animate-spin" style="animation-duration: 2s;"></div>
                <!-- Middle ring -->
                <div class="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-500 border-l-blue-300 animate-spin" style="animation-duration: 3s; animation-direction: reverse;"></div>
                <!-- Inner ring -->
                <div class="absolute inset-4 rounded-full border-2 border-blue-200"></div>
            </div>

            <!-- Loading text with dots animation -->
            <div class="text-center">
                <p class="text-slate-600 font-semibold text-lg">
                    Loading<span class="inline-block w-6 text-left">
                        <span class="inline-block animate-bounce" style="animation-delay: 0s;">.</span><span class="inline-block animate-bounce" style="animation-delay: 0.2s;">.</span><span class="inline-block animate-bounce" style="animation-delay: 0.4s;">.</span>
                    </span>
                </p>
                <p class="text-slate-400 text-sm mt-2">Getting everything ready for you</p>
            </div>

            <!-- Progress bar -->
            <div class="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse" style="width: 70%; animation: progress 2s ease-in-out infinite;"></div>
            </div>
        </div>

        <style>
            @keyframes progress {
                0%, 100% { width: 30%; }
                50% { width: 70%; }
            }
        </style>
    </div>
    `;

    // Hide page until everything loads
    function hidePage() {
        document.documentElement.classList.remove('loaded');
    }

    // Show page when everything is ready
    function showPage() {
        document.documentElement.classList.add('loaded');
        hideLoader();
    }

    // Function to create and show loader
    function createLoader() {
        // Remove existing loader if any
        const existingLoader = document.getElementById('page-loader');
        if (existingLoader) {
            existingLoader.remove();
        }
        
        // Create new loader
        const loaderDiv = document.createElement('div');
        loaderDiv.innerHTML = loaderHTML;
        const loader = loaderDiv.firstElementChild;
        loader.style.opacity = '1';
        loader.style.transition = 'opacity 0.3s ease-out';
        document.body.insertBefore(loader, document.body.firstChild);
        return loader;
    }

    // Function to hide loader
    function hideLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.transition = 'opacity 0.4s ease-out';
            loader.style.opacity = '0';
            
            // Remove loader from DOM after fade-out
            setTimeout(function() {
                if (loader.parentNode) {
                    loader.remove();
                }
            }, 400);
        }
    }

    // Hide page initially
    hidePage();

    // Create loader on page start
    if (document.body) {
        createLoader();
    }

    // Insert loader at the beginning of body when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        if (!document.getElementById('page-loader')) {
            createLoader();
        }
        
        // Initialize lucide icons if available
        if (window.lucide && window.lucide.createIcons) {
            try {
                window.lucide.createIcons();
            } catch (e) {
                console.log('Lucide icons initialization...');
            }
        }
    });

    // Hide loader and show page when all resources are loaded
    window.addEventListener('load', function() {
        // Wait a bit to ensure all rendering is complete
        setTimeout(function() {
            // Initialize lucide icons again
            if (window.lucide && window.lucide.createIcons) {
                try {
                    window.lucide.createIcons();
                } catch (e) {
                    console.log('Final lucide initialization...');
                }
            }
            showPage();
        }, 150);
    });

    // Fallback: Hide loader after max time (15 seconds)
    setTimeout(function() {
        hideLoader();
        showPage();
    }, 15000);

    // Intercept all navigation to show loader again
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href]');
        if (link && link.href && !link.target && !link.href.startsWith('#')) {
            // Check if it's an internal link (same domain or relative)
            const isInternal = link.hostname === window.location.hostname || !link.hostname;
            if (isInternal) {
                // Hide page and show loader for navigation
                hidePage();
                createLoader();
            }
        }
    }, true);
})();
