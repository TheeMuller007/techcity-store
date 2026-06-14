// Main JavaScript — shared across all category product pages

// Mobile menu toggle
document.getElementById('mobileMenuBtn')?.addEventListener('click', function() {
    const nav = document.getElementById('mainNav');
    nav?.classList.toggle('active');
});

// Cart drawer
document.getElementById('cartBtn')?.addEventListener('click', openCart);
document.getElementById('closeCartBtn')?.addEventListener('click', closeCart);
document.querySelector('.cart-backdrop')?.addEventListener('click', closeCart);

// ─── Search Functionality ─────────────────────────────────────
let searchOpen = false;

document.getElementById('searchBtn')?.addEventListener('click', function() {
    searchOpen = !searchOpen;

    if (searchOpen) {
        const searchBar = document.createElement('div');
        searchBar.className = 'search-bar';
        searchBar.id = 'searchBarWrapper';

        searchBar.innerHTML = `
            <input type="search" placeholder="Search products..." class="search-input" id="searchInput" autofocus autocomplete="off">
            <button class="icon-btn" id="closeSearchBtn" aria-label="Close search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        this.parentElement.insertBefore(searchBar, this);
        this.style.display = 'none';

        document.getElementById('closeSearchBtn').addEventListener('click', closeSearch);

        const searchInput = document.getElementById('searchInput');
        searchInput.focus();

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            const container = document.getElementById('allProducts') || document.getElementById('productContainer');
            if (!container) return;

            // Use the global products array populated by products.js
            const allProds = window.products || [];
            if (!allProds.length) return;

            // Respect the active category page
            const pathname = window.location.pathname.toLowerCase();
            const pathMatch = pathname.match(/(laptops|smartphones|tablets|accessories|printers|bags)/);
            const activeCategory = pathMatch ? pathMatch[0] : null;

            let pool = allProds;
            if (activeCategory) {
                pool = allProds.filter(p => {
                    if (!p.category) return false;
                    const cat = p.category.toLowerCase().trim();
                    return cat === activeCategory ||
                           cat === activeCategory.replace(/s$/, '') ||
                           activeCategory === cat.replace(/s$/, '');
                });
            }

            if (query === '') {
                // Restore normal paginated view
                if (window.renderProducts) window.renderProducts();
                const pagination = document.querySelector('.pagination');
                if (pagination) pagination.style.display = '';
                return;
            }

            const results = pool.filter(p =>
                p.name.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query)) ||
                (p.category && p.category.toLowerCase().includes(query))
            );

            // Hide pagination while searching
            const pagination = document.querySelector('.pagination');
            if (pagination) pagination.style.display = 'none';

            if (results.length === 0) {
                container.innerHTML = `
                    <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#6b7280;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" style="margin-bottom:12px;display:block;margin-left:auto;margin-right:auto;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <p style="font-size:1rem;font-weight:600;margin-bottom:4px;">No results for "<em>${query}</em>"</p>
                        <p style="font-size:0.85rem;">Try a different search term or browse categories.</p>
                    </div>`;
            } else {
                if (window.createProductCard) {
                    container.innerHTML = results.map(p => window.createProductCard(p)).join('');
                }
            }
        });
    } else {
        closeSearch();
    }
});

function closeSearch() {
    const searchBar = document.getElementById('searchBarWrapper');
    if (searchBar) searchBar.remove();
    const btn = document.getElementById('searchBtn');
    if (btn) btn.style.display = 'flex';
    searchOpen = false;
    // Restore pagination and normal product view
    const pagination = document.querySelector('.pagination');
    if (pagination) pagination.style.display = '';
    if (window.renderProducts) window.renderProducts();
}

// Set active nav link
const currentPagePath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPagePath) {
        link.classList.add('active');
    }
});
