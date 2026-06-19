// Main JavaScript - Search & Cart Initializer
console.log('[main.js] Script parsed and running v8');

// Mobile menu toggle
(function() {
    window.toggleMobileMenu = function(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();

        const menuBtn = document.getElementById('mobileMenuBtn');
        const nav = document.getElementById('mainNav');

        if (!menuBtn || !nav) {
            console.warn('[Mobile Menu] mobileMenuBtn or mainNav not found');
            return;
        }

        nav.classList.toggle('active');
        menuBtn.classList.toggle('menu-open', nav.classList.contains('active'));
        console.log('[Mobile Menu] Toggled:', nav.classList.contains('active'));
    };

    const menuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mainNav');

    if (menuBtn && nav) {
        // Direct binding for normal page loads.
        menuBtn.addEventListener('click', window.toggleMobileMenu);

        // Delegated binding catches taps when scripts inject/replace header markup.
        document.body.addEventListener('click', function(e) {
            const btn = e.target.closest && e.target.closest('#mobileMenuBtn');
            if (btn) window.toggleMobileMenu(e);
        });

        // Close menu when a nav link is clicked
        nav.querySelectorAll('.nav-link').forEach(function(link) {
            link.addEventListener('click', function() {
                nav.classList.remove('active');
                menuBtn.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                !menuBtn.contains(e.target)) {
                nav.classList.remove('active');
                menuBtn.classList.remove('menu-open');
            }
        });

        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                nav.classList.remove('active');
                menuBtn.classList.remove('menu-open');
            }
        });
    } else {
        console.warn('[Mobile Menu] mobileMenuBtn or mainNav not found');
    }
})();


// Cart drawer
document.getElementById('cartBtn')?.addEventListener('click', openCart);
document.getElementById('closeCartBtn')?.addEventListener('click', closeCart);
document.querySelector('.cart-backdrop')?.addEventListener('click', closeCart);

// ── Search button delegation (multiple strategies for reliability) ──
// Strategy 1: Event delegation on document body
document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('#searchBtn');
    if (btn) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[Search] Clicked via body delegation');
        if (typeof window.openSearch === 'function') window.openSearch();
    }
});

// Strategy 2: Direct binding after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('searchBtn');
    if (btn) {
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Search] Clicked via direct onclick');
            if (typeof window.openSearch === 'function') window.openSearch();
        };
        console.log('[Search] Direct binding attached to #searchBtn');
    } else {
        console.warn('[Search] #searchBtn not found on DOMContentLoaded');
    }
});

window.openSearch = function() {
    let overlay = document.getElementById('searchOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'searchOverlay';
        overlay.className = 'search-overlay';
        overlay.innerHTML = `
            <div class="search-container">
                <div class="search-bar-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--muted-foreground)">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input type="text" placeholder="Search products, categories..." class="search-input-main" id="searchInputMain" autocomplete="off">
                    <button class="icon-btn" id="closeSearchOverlay" aria-label="Close search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="search-results-container" id="searchResults">
                    <div class="search-empty-state">
                        <i class="fas fa-search"></i>
                        <p>Start typing to search products...</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = document.getElementById('searchInputMain');
        const resultsContainer = document.getElementById('searchResults');

        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            renderSearchResults(query, resultsContainer);
        });

        document.getElementById('closeSearchOverlay').addEventListener('click', closeSearch);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeSearch();
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) closeSearch();
        });
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('searchInputMain').focus(), 100);
}

window.closeSearch = function() {
    const overlay = document.getElementById('searchOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function renderSearchResults(query, container) {
    if (!query) {
        container.innerHTML = `
            <div class="search-empty-state">
                <i class="fas fa-search"></i>
                <p>Start typing to search products...</p>
            </div>
        `;
        return;
    }

    const allProducts = window.products || [];
    const results = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.category && p.category.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
    ).slice(0, 8); // Limit results for better UI

    if (results.length === 0) {
        container.innerHTML = `
            <div class="search-empty-state">
                <i class="fas fa-frown"></i>
                <p>No products found for "${query}"</p>
            </div>
        `;
        return;
    }

    container.innerHTML = results.map(p => `
        <div class="search-result-item" onclick="handleSearchResultClick('${p.id}')">
            <img src="${(p.images && p.images[0]) || p.image || '/images/placeholder.jpg'}" alt="${p.name}" class="search-result-image" onerror="this.src='/images/placeholder.jpg'">
            <div class="search-result-info">
                <div class="search-result-name">${p.name}</div>
                <div class="search-result-meta">
                    <span>${p.category}</span>
                    <span class="search-result-price">$${parseFloat(p.price).toFixed(2)}</span>
                </div>
            </div>
            <i class="fas fa-chevron-right" style="font-size: 0.8rem; color: var(--muted-foreground)"></i>
        </div>
    `).join('');
}

window.handleSearchResultClick = function(id) {
    closeSearch();
    if (window.showQuickView) {
        window.showQuickView(id);
    } else {
        console.warn("showQuickView not found, retrying...");
        setTimeout(() => window.showQuickView && window.showQuickView(id), 500);
    }
};



// Set active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});






// Hero pictures logic has been moved to an inline script in index.html to guarantee reliable execution.

// ─── FEATURED PRODUCTS CAROUSEL ──────────────────────────────
// Now completely handled by CSS animations in main.css (scroll-marquee)

// Lazy-load images
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll("img");

  images.forEach(img => {
    img.loading = "lazy";
  });
});


// Delay heavy scripts until page is fully loaded
window.addEventListener("load", () => {
  const heavyScripts = [
    "/js/analytics.js",
    "/js/tracking.js",
    "/js/carousel.js",
  ];



  // Clean up unused CSS classes after page loads
window.addEventListener("load", () => {
  document.querySelectorAll("[data-remove]").forEach(el => {
    el.classList.remove(el.dataset.remove);
  });
});


  heavyScripts.forEach(src => {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  });
});






// Preload critical resources
const preload = (url, type) => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = url;
  link.as = type;
  document.head.appendChild(link);
};

preload("../images/bck 336.jpg", "image"); // your background
preload("/fonts/poppins.woff2", "font");

// Storefront mobile app shell (tab bar) — skip dashboards
(function loadStoreMobileShell() {
    if (window.location.pathname.includes('/dashboards/')) return;
    if (document.querySelector('script[src*="store-mobile"]')) return;
    const script = document.createElement('script');
    script.src = '/scripts/store-mobile.js?v=1';
    script.defer = true;
    document.body.appendChild(script);
})();



// Load non-essential CSS after the page is visible
window.addEventListener("load", () => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/css/animations.css";
  document.head.appendChild(link);
});


