document.addEventListener("DOMContentLoaded", () => {
    const libraryGrid = document.getElementById("library-grid");
    if (!libraryGrid) return;

    // --- State Management ---
    const state = {
        tab: 'templates',
        searchQuery: '',
        activeFilters: {
            industry: 'All',
            category: 'All'
        },
        sortBy: 'newest',
        data: {
            templates: [],
            components: []
        },
        ui: {
            isFilterDrawerOpen: false
        }
    };

    // --- Initialization ---
    init();

    async function init() {
        // 1. Sync State with URL
        const params = new URLSearchParams(window.location.search);
        state.tab = params.get('tab') || 'templates';
        state.activeFilters.industry = params.get('industry') || 'All';

        // 2. Load Data
        await loadData();

        // 3. Setup Event Listeners
        setupTabListeners();
        setupSearchListeners();
        setupFilterListeners();
        setupSortListeners();
        setupMobileDrawerListeners();

        // 4. Initial Render
        updateUI();

        // 5. Signal finished loading
        if (window.finishPageLoading) {
            // Small delay to ensure Tailwind and Lucide have initialized rendering
            setTimeout(window.finishPageLoading, 200);
        }
    }

    async function loadData() {
        try {
            const dataPrefix = window.location.pathname.includes('/pages/') ? '../data/' : 'data/';
            const [templatesRes, componentsRes] = await Promise.all([
                fetch(`${dataPrefix}templates.json`),
                fetch(`${dataPrefix}components.json`)
            ]);

            state.data.templates = await templatesRes.json();
            state.data.components = await componentsRes.json();
        } catch (error) {
            console.error("Error loading library data:", error);
            showError("Failed to load library data. Please try again later.");
        }
    }

    // --- Core Logic ---

    function updateUI() {
        // Sync Tab Buttons
        document.querySelectorAll('.library-tab').forEach(btn => {
            const isActive = btn.dataset.tab === state.tab;
            btn.classList.toggle('bg-blue-600', isActive);
            btn.classList.toggle('text-white', isActive);
            btn.classList.toggle('shadow-md', isActive);
            btn.classList.toggle('text-slate-600', !isActive);
            btn.classList.toggle('hover:bg-slate-100', !isActive);
        });

        // Update Title
        const titleMap = { templates: 'Template Library', components: 'Component Library' };
        document.getElementById('page-title').textContent = titleMap[state.tab];

        // 1. Re-populate Filters
        renderDynamicFilters();

        // 2. Filter & Sort Data
        const filteredItems = getFilteredData();

        // 3. Render Grid with transition
        libraryGrid.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => {
            renderGrid(filteredItems);
            libraryGrid.classList.remove('opacity-0', 'translate-y-2');
        }, 150);

        // 4. Update Active Filters Display
        renderActiveFilters();

        // Sync URL
        updateURL();
    }

    function getFilteredData() {
        let items = [...state.data[state.tab]];

        // 1. Search Filter
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            items = items.filter(item =>
                (item.name || item.title || '').toLowerCase().includes(query) ||
                (item.description || '').toLowerCase().includes(query)
            );
        }

        // 2. Industry Filter
        if (state.activeFilters.industry !== 'All') {
            items = items.filter(item =>
                (item.industry || '').toLowerCase() === state.activeFilters.industry.toLowerCase()
            );
        }

        // 3. Category Filter
        if (state.activeFilters.category !== 'All') {
            items = items.filter(item =>
                (item.category || '').toLowerCase() === state.activeFilters.category.toLowerCase()
            );
        }

        // 4. Sorting
        items.sort((a, b) => {
            if (state.sortBy === 'name-asc') return (a.name || a.title).localeCompare(b.name || b.title);
            if (state.sortBy === 'name-desc') return (b.name || b.title).localeCompare(a.name || a.title);
            return 0; // 'newest' is default (already mapped to JSON order)
        });

        return items;
    }

    // --- Rendering Functions ---

    function renderDynamicFilters() {
        const container = document.getElementById('dynamic-filters');
        container.innerHTML = '';

        const currentItems = state.data[state.tab];

        // Generate Industries (only for templates)
        if (state.tab !== 'components') {
            const industries = ['All', ...new Set(currentItems.map(item => item.industry).filter(Boolean))].sort();
            container.appendChild(createFilterGroup('Industry', industries, 'industry'));
        }

        // Generate Categories
        const categories = ['All', ...new Set(currentItems.map(item => item.category).filter(Boolean))].sort();
        container.appendChild(createFilterGroup(state.tab === 'components' ? 'Component Type' : 'Category', categories, 'category', true));

        // CRITICAL: Re-attach listeners to the fresh sidebar buttons
        setupFilterListeners(container);

        // Sync with mobile drawer
        const mobileContainer = document.getElementById('mobile-filters-container');
        if (mobileContainer) {
            mobileContainer.innerHTML = container.innerHTML;
            // Re-attach listeners to mobile buttons
            setupFilterListeners(mobileContainer);
        }

        // Re-run icons
        if (window.lucide) lucide.createIcons();
    }

    function createFilterGroup(title, options, filterKey, showCounts = false) {
        const group = document.createElement('div');
        const isActive = state.activeFilters[filterKey] !== 'All';

        group.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest">${title}</h4>
                ${isActive ? `<button class="clear-group-filter text-[10px] font-bold text-blue-600 hover:underline" data-key="${filterKey}">Clear</button>` : ''}
            </div>`;

        const list = document.createElement('div');
        list.className = "space-y-1";

        options.forEach(opt => {
            const count = showCounts ? state.data[state.tab].filter(item => (item[filterKey] || 'All') === opt || (opt === 'All')).length : null;
            const isActive = state.activeFilters[filterKey] === opt;

            const btn = document.createElement('button');
            btn.className = `filter-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${isActive ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`;
            btn.dataset.key = filterKey;
            btn.dataset.value = opt;

            btn.innerHTML = `
                <span>${opt}</span>
                ${showCounts && opt !== 'All' ? `<span class="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">${count}</span>` : ''}
            `;

            list.appendChild(btn);
        });

        group.appendChild(list);
        return group;
    }

    function renderGrid(items) {
        libraryGrid.innerHTML = '';
        document.getElementById('item-count').textContent = items.length;

        if (items.length === 0) {
            const template = document.getElementById('empty-state-template');
            libraryGrid.appendChild(template.content.cloneNode(true));
            if (window.lucide) lucide.createIcons();
            return;
        }

        items.forEach(item => {
            const card = createCard(item);
            libraryGrid.appendChild(card);
        });

        if (window.lucide) lucide.createIcons();
    }

    function renderActiveFilters() {
        const container = document.getElementById('active-filters-container');
        const list = document.getElementById('active-filters-list');
        list.innerHTML = '';

        let hasFilters = false;
        Object.entries(state.activeFilters).forEach(([key, value]) => {
            if (value !== 'All') {
                hasFilters = true;
                const badge = document.createElement('div');
                badge.className = "flex items-center gap-2 bg-blue-600 text-white pl-3 pr-2 py-1.5 rounded-lg text-xs font-bold";
                badge.innerHTML = `
                    <span>${value}</span>
                    <button class="remove-filter hover:bg-blue-500 rounded" data-key="${key}"><i data-lucide="x" class="w-3 h-3"></i></button>
                `;
                list.appendChild(badge);
            }
        });

        container.classList.toggle('hidden', !hasFilters);

        // Update Mobile Filter Count
        const count = Object.values(state.activeFilters).filter(v => v !== 'All').length;
        const countEl = document.getElementById('mobile-filter-count');
        if (countEl) {
            countEl.textContent = count;
            countEl.classList.toggle('hidden', count === 0);
            countEl.classList.toggle('flex', count > 0);
        }

        if (window.lucide) lucide.createIcons();
    }

    // --- Event Listeners ---

    function setupTabListeners() {
        document.querySelectorAll('.library-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                state.tab = btn.dataset.tab;
                state.activeFilters = { industry: 'All', category: 'All' }; // Reset filters
                updateUI();
            });
        });
    }

    function setupSearchListeners() {
        const inputs = [document.getElementById('search-input'), document.getElementById('mobile-search-input')];
        inputs.forEach(input => {
            if (!input) return;
            input.addEventListener('input', (e) => {
                state.searchQuery = e.target.value;
                // Sync the other input
                inputs.filter(i => i !== input).forEach(i => { if (i) i.value = e.target.value; });
                renderGrid(getFilteredData());
            });
        });
    }

    function setupFilterListeners(parent = document) {
        parent.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.activeFilters[btn.dataset.key] = btn.dataset.value;
                updateUI();
            });
        });

        parent.querySelectorAll('.clear-group-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                state.activeFilters[btn.dataset.key] = 'All';
                updateUI();
            });
        });

        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                state.activeFilters = { industry: 'All', category: 'All' };
                state.searchQuery = '';
                document.getElementById('search-input').value = '';
                const mSearch = document.getElementById('mobile-search-input');
                if (mSearch) mSearch.value = '';
                updateUI();
            });
        }

        document.querySelectorAll('.remove-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                state.activeFilters[btn.dataset.key] = 'All';
                updateUI();
            });
        });
    }

    function setupSortListeners() {
        const select = document.getElementById('sort-select');
        if (select) {
            select.addEventListener('change', (e) => {
                state.sortBy = e.target.value;
                renderGrid(getFilteredData());
            });
        }
    }

    function setupMobileDrawerListeners() {
        const drawer = document.getElementById('filter-drawer');
        const toggle = document.getElementById('filter-drawer-toggle');
        const close = document.getElementById('filter-drawer-close');
        const overlay = document.getElementById('filter-drawer-overlay');
        const apply = document.getElementById('filter-drawer-apply');

        if (toggle) toggle.addEventListener('click', () => drawer.classList.remove('hidden'));
        if (close) close.addEventListener('click', () => drawer.classList.add('hidden'));
        if (overlay) overlay.addEventListener('click', () => drawer.classList.add('hidden'));
        if (apply) apply.addEventListener('click', () => drawer.classList.add('hidden'));
    }

    // --- Helpers ---

    function getAestheticPlaceholder(item) {
        const type = state.tab;
        const key = (item.category || item.industry || 'General').toLowerCase();

        const config = {
            // Components
            'badges': { bg: 'bg-teal-500', icon: 'tag' },
            'buttons': { bg: 'bg-indigo-500', icon: 'mouse-pointer-2' },
            'cards': { bg: 'bg-purple-500', icon: 'layout' },
            'data': { bg: 'bg-blue-500', icon: 'database' },
            'footers': { bg: 'bg-slate-700', icon: 'panel-bottom' },
            'forms': { bg: 'bg-orange-500', icon: 'check-square' },
            'heroes': { bg: 'bg-rose-500', icon: 'image' },
            'modals': { bg: 'bg-cyan-500', icon: 'external-link' },
            'navbars': { bg: 'bg-blue-600', icon: 'menu' },
            'statistics': { bg: 'bg-emerald-500', icon: 'bar-chart-3' },
            'ui': { bg: 'bg-violet-500', icon: 'layers' },
            // Industries/Categories
            'saas': { bg: 'bg-blue-500', icon: 'cloud' },
            'crypto': { bg: 'bg-amber-500', icon: 'bitcoin' },
            'fintech': { bg: 'bg-emerald-600', icon: 'database' },
            'ai': { bg: 'bg-indigo-600', icon: 'cpu' },
            'education': { bg: 'bg-emerald-500', icon: 'graduation-cap' },
            'fitness': { bg: 'bg-rose-500', icon: 'activity' },
            'health': { bg: 'bg-cyan-500', icon: 'stethoscope' },
            'healthcare': { bg: 'bg-cyan-500', icon: 'stethoscope' },
            'medical': { bg: 'bg-cyan-500', icon: 'stethoscope' },
            'e-commerce': { bg: 'bg-pink-500', icon: 'shopping-cart' },
            'ecommerce': { bg: 'bg-pink-500', icon: 'shopping-cart' },
            'real estate': { bg: 'bg-amber-600', icon: 'home' },
            'landing': { bg: 'bg-indigo-500', icon: 'rocket' },
            'dashboard': { bg: 'bg-slate-800', icon: 'layout-dashboard' },
            'digital agency': { bg: 'bg-purple-600', icon: 'briefcase' },
            'agency': { bg: 'bg-purple-600', icon: 'briefcase' },
            'portfolio': { bg: 'bg-rose-400', icon: 'user' },
            'creative': { bg: 'bg-orange-400', icon: 'palette' },
            'blog': { bg: 'bg-sky-500', icon: 'file-text' },
            'news': { bg: 'bg-sky-500', icon: 'file-text' },
            'docs': { bg: 'bg-slate-600', icon: 'book-open' },
            'documentation': { bg: 'bg-slate-600', icon: 'book-open' },
            'help center': { bg: 'bg-blue-400', icon: 'help-circle' },
            'careers': { bg: 'bg-violet-600', icon: 'users' },
            'nft': { bg: 'bg-fuchsia-600', icon: 'zap' },
            'community': { bg: 'bg-teal-500', icon: 'message-square' },
            'events': { bg: 'bg-orange-500', icon: 'calendar' },
            'general': { bg: 'bg-slate-400', icon: 'component' }
        };
        const { bg, icon } = config[key] ||
            Object.entries(config).find(([k]) => key.includes(k))?.[1] ||
            config['general'];

        return `
            <div class="w-full h-52 ${bg} flex flex-col items-center justify-center text-white/90 gap-3 group-hover:scale-105 transition-transform duration-700">
                <div class="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                    <i data-lucide="${icon}" class="w-10 h-10"></i>
                </div>
                <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">${key}</span>
            </div>
        `;
    }

    // Global handler for image errors to avoid inline script complexity
    window.handleImageError = function (img, itemJson) {
        try {
            const item = JSON.parse(decodeURIComponent(itemJson));
            img.onerror = null;
            img.parentElement.innerHTML = getAestheticPlaceholder(item);
            setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 50);
        } catch (e) {
            console.error('Error handling image fallback:', e);
        }
    };

    function createCard(item) {
        const div = document.createElement('div');
        div.className = "bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative";

        const resolvePath = (path) => {
            if (!path) return null;
            if (path.startsWith('http') || path.startsWith('../')) return path;
            return '../' + path;
        };

        const previewImg = resolvePath(item.preview || item.thumbnail);
        const fileUrl = resolvePath(item.file) || '#';
        const tag = item.industry || item.category || 'General';

        const isImage = (url) => {
            if (!url) return false;
            // Common image extensions, avoiding anchor links like #p1
            const cleanUrl = url.split('#')[0].split('?')[0];
            return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(cleanUrl);
        };

        const itemData = encodeURIComponent(JSON.stringify(item));
        const previewHtml = isImage(previewImg) ? `
            <img src="${previewImg}" alt="${item.name}" loading="lazy" 
                class="w-full h-52 object-cover bg-slate-50 group-hover:scale-105 transition-transform duration-700"
                onerror="handleImageError(this, '${itemData}')">
        ` : getAestheticPlaceholder(item);

        let actionHtml = '';
        if (state.tab === 'components') {
            const viewLink = `component-view.html?file=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(item.name)}`;
            actionHtml = `
                <a href="${viewLink}" class="block w-full text-center bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2">
                    <span>View & Copy Code</span>
                    <i data-lucide="code-2" class="w-4 h-4"></i>
                </a>`;
        } else {
            const idParam = item.id;
            const previewLink = item.id ? `../preview-page.html?type=${state.tab}&id=${idParam}` : '#';
            actionHtml = `
                <div class="grid grid-cols-2 gap-3">
                    <a href="${previewLink}" class="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all text-center">
                        <i data-lucide="eye" class="w-4 h-4"></i> Preview
                    </a>
                    <button onclick="downloadFile('${fileUrl}', '${state.tab}', this)" class="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95">
                        <i data-lucide="download" class="w-4 h-4"></i> Download
                    </button>
                </div>`;
        }

        div.innerHTML = `
            <div class="relative overflow-hidden border-b border-slate-100 preview-container">
                ${previewHtml}
                <div class="absolute top-4 left-4">
                     <span class="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-100 flex items-center gap-1.5">
                        <span class="w-1 h-1 rounded-full bg-blue-600"></span>
                        ${tag}
                     </span>
                </div>
            </div>
            
            <div class="p-6 flex-1 flex flex-col">
                <div class="flex-1 mb-6">
                     <h3 class="font-bold text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors mb-2">${item.name || item.title || 'Untitled'}</h3>
                     <p class="text-sm text-slate-500 leading-relaxed line-clamp-2">${item.description || 'Professional responsive resource for modern web projects.'}</p>
                     
                     <div class="flex gap-2 mt-4 flex-wrap">
                        ${(item.tech || ['HTML', 'Tailwind']).slice(0, 3).map(tech =>
            `<span class="text-[9px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">${tech}</span>`
        ).join('')}
                     </div>
                </div>
                <div class="mt-auto pt-4 border-t border-slate-50">
                    ${actionHtml}
                </div>
            </div>`;
        return div;
    }

    function updateURL() {
        const url = new URL(window.location);
        url.searchParams.set('tab', state.tab);
        if (state.activeFilters.industry !== 'All') url.searchParams.set('industry', state.activeFilters.industry);
        else url.searchParams.delete('industry');
        window.history.replaceState({}, '', url);
    }

    function showError(msg) {
        libraryGrid.innerHTML = `<div class="col-span-full text-center py-20 bg-rose-50 rounded-3xl border border-rose-100">
            <p class="text-rose-600 font-bold">${msg}</p>
        </div>`;
    }
});

// -- Global Helpers (Keep original download functionality) --
async function downloadFile(fileUrl, type, btnElement) {
    if (window.trackDownload) window.trackDownload();
    if (!fileUrl || fileUrl === '#') return alert("File not available.");
    if (fileUrl.endsWith('.zip')) { window.location.href = fileUrl; return; }

    const btn = btnElement;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="animate-pulse">Zipping...</span>`;
    btn.disabled = true;

    try {
        const response = await fetch(fileUrl);
        const htmlContent = await response.text();

        if (window.JSZip) {
            const zip = new JSZip();
            zip.file(fileUrl.split('/').pop() || 'index.html', htmlContent);
            const blob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `webtemplatehub-${new Date().getTime()}.zip`;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            window.location.href = fileUrl;
        }
        btn.innerHTML = originalText;
        btn.disabled = false;
    } catch (e) {
        btn.innerHTML = `<i data-lucide="alert-circle" class="w-4 h-4"></i> Error`;
        btn.disabled = false;
    }
}
