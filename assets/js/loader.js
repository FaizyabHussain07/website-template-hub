// Page Loader - Show loading spinner until page is fully loaded
(function() {
    // Create loader HTML
    const loaderHTML = `
    <div id="page-loader" class="fixed inset-0 bg-white dark:bg-gray-900 z-9999 flex items-center justify-center">
        <div class="flex flex-col items-center gap-4">
            <!-- Spinner -->
            <div class="relative w-16 h-16">
                <div class="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
            </div>
            <!-- Loading text -->
            <p class="text-gray-600 dark:text-gray-300 font-medium">Loading...</p>
        </div>
    </div>
    `;

    // Insert loader at the beginning of body
    document.addEventListener('DOMContentLoaded', function() {
        const loaderDiv = document.createElement('div');
        loaderDiv.innerHTML = loaderHTML;
        document.body.insertBefore(loaderDiv.firstElementChild, document.body.firstChild);
    });

    // Hide loader when page is fully loaded
    window.addEventListener('load', function() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            // Fade out effect
            loader.style.transition = 'opacity 0.5s ease-out';
            loader.style.opacity = '0';
            
            // Remove loader from DOM after fade-out
            setTimeout(function() {
                loader.remove();
            }, 500);
        }
    });

    // Also hide loader if it takes too long (10 seconds timeout)
    setTimeout(function() {
        const loader = document.getElementById('page-loader');
        if (loader && loader.parentNode) {
            loader.style.transition = 'opacity 0.5s ease-out';
            loader.style.opacity = '0';
            setTimeout(function() {
                if (loader.parentNode) {
                    loader.remove();
                }
            }, 500);
        }
    }, 10000);
})();
