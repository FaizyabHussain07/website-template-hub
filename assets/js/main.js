/**
 * Web Templates Hub - Core Logic
 * Handles dynamic rendering, search, and filtering.
 */

document.addEventListener('DOMContentLoaded', () => {
    const templatesGrid = document.getElementById('templates-grid');
    const searchInput = document.getElementById('search-input');
    const industryFilter = document.getElementById('industry-filter');
    const categoryFilter = document.getElementById('category-filter');
    const templateCount = document.getElementById('template-count');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    const industriesGrid = document.getElementById('industries-grid');

    let allTemplates = [];

    const industryMeta = {
        'SaaS': { icon: 'cloud', color: 'blue', desc: 'Software, analytics, and cloud solutions templates for modern startups.' },
        'Crypto': { icon: 'bitcoin', color: 'orange', desc: 'DeFi, NFTs, and blockchain landing pages with high-tech aesthetics.' },
        'Healthcare': { icon: 'activity', color: 'emerald', desc: 'Clinics, hospitals, and wellness centers focused on care and trust.' },
        'Real Estate': { icon: 'home', color: 'rose', desc: 'Property listings, agency profiles, and architectural showcases.' },
        'Digital Agency': { icon: 'laptop', color: 'indigo', desc: 'Portfolio and service pages for creative and development agencies.' },
        'E-commerce': { icon: 'shopping-cart', color: 'purple', desc: 'Storefronts and product landing pages for online retail.' },
        'Education': { icon: 'graduation-cap', color: 'amber', desc: 'Learning platforms, schools, and professional certification sites.' },
        'Fitness': { icon: 'dumbbell', color: 'red', desc: 'Gyms, personal trainers, and health tracking applications.' },
        'Portfolio': { icon: 'user', color: 'pink', desc: 'Personal branding and resume sites for creative professionals.' },
        'Travel': { icon: 'globe', color: 'cyan', desc: 'Booking platforms and travel guides for world explorers.' },
        'Food & Drink': { icon: 'coffee', color: 'orange', desc: 'Restaurants, cafes, and catering service websites.' },
        'Technology': { icon: 'cpu', color: 'slate', desc: 'Hardware, AI, and futuristic tech innovation pages.' }
    };

    // Fetch templates from JSON
    async function fetchTemplates() {
        try {
            const response = await fetch('data/templates.json');
            allTemplates = await response.json();
            populateIndustries(allTemplates);
            populateCategories(allTemplates);

            // Apply URL filters if any
            const urlParams = new URLSearchParams(window.location.search);
            const industryParam = urlParams.get('industry');
            if (industryParam && industryFilter) {
                industryFilter.value = industryParam;
            }

            filterTemplates();
            renderIndustries(allTemplates);
        } catch (error) {
            console.error('Error loading templates:', error);
            if (templatesGrid) templatesGrid.innerHTML = '<p class="col-span-full text-center py-12 text-red-500">Failed to load templates. Please try again later.</p>';
            if (industriesGrid) industriesGrid.innerHTML = '<p class="col-span-full text-center py-12 text-red-500">Failed to load industries.</p>';
        }
    }

    // Render industry cards for categories page
    function renderIndustries(templates) {
        if (!industriesGrid) return;
        industriesGrid.innerHTML = '';

        const industries = [...new Set(templates.map(t => t.industry))].sort();

        industries.forEach((ind, index) => {
            const meta = industryMeta[ind] || { icon: 'layout', color: 'blue', desc: `Professional templates for the ${ind} industry.` };
            const count = templates.filter(t => t.industry === ind).length;

            const card = document.createElement('a');
            card.href = `index.html?industry=${encodeURIComponent(ind)}`;
            card.className = 'bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-2xl hover:border-blue-200 transition-all group fade-in';
            card.style.animationDelay = `${index * 50}ms`;

            card.innerHTML = `
                <div class="w-14 h-14 bg-${meta.color}-50 text-${meta.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-${meta.color}-600 group-hover:text-white transition-all">
                    <i data-lucide="${meta.icon}" class="w-8 h-8"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-900 mb-2">${ind}</h3>
                <p class="text-slate-500 text-sm mb-4">${meta.desc}</p>
                <span class="text-${meta.color}-600 font-bold text-sm">${count} Templates &rarr;</span>
            `;
            industriesGrid.appendChild(card);
        });

        lucide.createIcons();
    }

    // Render template cards
    function renderTemplates(templates) {
        templatesGrid.innerHTML = '';
        templateCount.textContent = templates.length;

        if (templates.length === 0) {
            templatesGrid.innerHTML = '<p class="col-span-full text-center py-12 text-gray-500">No templates found matching your criteria.</p>';
            return;
        }

        templates.forEach((template, index) => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover fade-in';
            card.style.animationDelay = `${index * 50}ms`;

            card.innerHTML = `
                <div class="relative group aspect-video bg-slate-100 overflow-hidden">
                    <img src="${template.thumbnail}" alt="${template.name} - Free ${template.industry} Template" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-8\\'><div class=\\'text-center space-y-2\\'><div class=\\'text-white/20 font-black text-3xl uppercase tracking-tighter mb-1\\'>${template.industry}</div><div class=\\'text-white font-bold text-lg\\'>${template.name}</div></div><div class=\\'absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100\\'><a href=\\'template.html?id=${template.id}\\' class=\\'bg-white text-gray-900 px-6 py-2 rounded-full font-semibold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl\\'>Preview Template</a></div></div>'">
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <a href="template.html?id=${template.id}" class="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl" aria-label="Preview ${template.name} Template">
                            Preview Template
                        </a>
                    </div>
                </div>
                <div class="p-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">${template.industry}</span>
                        <div class="flex gap-1">
                            ${template.tech.map(t => `<span class="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">${t}</span>`).join('')}
                        </div>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900 mb-1">${template.name}</h3>
                    <p class="text-sm text-gray-500 line-clamp-1 mb-4">${template.category}</p>
                    <div class="flex items-center justify-between pt-4 border-t border-gray-50">
                        <a href="template.html?id=${template.id}" class="text-blue-600 font-semibold text-sm hover:underline">View Details</a>
                        <a href="${template.zipUrl}" class="flex items-center gap-2 text-gray-900 font-semibold text-sm bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors" download>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            ZIP
                        </a>
                    </div>
                </div>
            `;
            templatesGrid.appendChild(card);
        });
    }

    // Populate Industry Filter dynamically
    function populateIndustries(templates) {
        if (!industryFilter) return;
        const industries = [...new Set(templates.map(t => t.industry))].sort();
        const currentVal = industryFilter.value;
        industryFilter.innerHTML = '<option value="all">All Industries</option>';
        industries.forEach(ind => {
            const option = document.createElement('option');
            option.value = ind;
            option.textContent = ind;
            industryFilter.appendChild(option);
        });
        industryFilter.value = currentVal;
    }

    // Populate Category Filter dynamically
    function populateCategories(templates) {
        if (!categoryFilter) return;
        const categories = [...new Set(templates.map(t => t.category))];
        const currentVal = categoryFilter.value;
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
        categoryFilter.value = currentVal;
    }

    // Filter and Search
    function filterTemplates() {
        if (!templatesGrid) return;

        const searchTerm = (searchInput?.value || '').toLowerCase();
        const selectedIndustry = industryFilter?.value || 'all';
        const selectedCategory = categoryFilter?.value || 'all';

        const filtered = allTemplates.filter(template => {
            const matchesSearch = template.name.toLowerCase().includes(searchTerm) ||
                template.industry.toLowerCase().includes(searchTerm) ||
                template.category.toLowerCase().includes(searchTerm);

            const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry;
            const matchesCategory = selectedCategory === 'all' || template.category.toLowerCase().includes(selectedCategory.toLowerCase());

            return matchesSearch && matchesIndustry && matchesCategory;
        });

        renderTemplates(filtered);
    }

    // Event Listeners
    if (searchInput) searchInput.addEventListener('input', filterTemplates);
    if (industryFilter) industryFilter.addEventListener('change', filterTemplates);
    if (categoryFilter) categoryFilter.addEventListener('change', filterTemplates);

    // Mobile Menu Toggle
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
        });
    }

    // Initial load
    fetchTemplates();
});
