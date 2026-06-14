/**
 * TECH CITY — storefront mobile app shell (≤767px).
 * Injects bottom tab bar; hidden on desktop via main.css.
 */
(function () {
    if (window.location.pathname.includes('/dashboards/')) return;

    const TABS = [
        { id: 'home', href: '/index.html', icon: 'fa-house', label: 'Home', match: (p) => p === '' || p.endsWith('index.html') && !p.includes('/shop/') && !p.includes('/about/') && !p.includes('/contact/') && !p.includes('/login/') && !p.includes('/register/') },
        { id: 'shop', href: '/shop/index.html', icon: 'fa-bag-shopping', label: 'Shop', match: (p) => p.includes('/shop/') || p.includes('/Laptops/') || p.includes('/smartphones/') || p.includes('/accessories/') || p.includes('/printers/') || p.includes('/bags/') },
        { id: 'search', action: 'search', icon: 'fa-magnifying-glass', label: 'Search' },
        { id: 'cart', action: 'cart', icon: 'fa-cart-shopping', label: 'Cart' },
        { id: 'menu', action: 'menu', icon: 'fa-bars', label: 'Menu' },
    ];

    function getActiveTabId() {
        const path = window.location.pathname.replace(/\\/g, '/').toLowerCase();
        if (path.includes('/shop/') || path.includes('/laptops/') ||
            path.includes('/smartphones/') || path.includes('/accessories/') ||
            path.includes('/printers/') || path.includes('/bags/')) {
            return 'shop';
        }
        const file = path.split('/').pop() || 'index.html';
        if (file === 'index.html' && !path.includes('/login/') && !path.includes('/register/') &&
            !path.includes('/dashboards/') && !path.includes('/about/') && !path.includes('/contact/')) {
            return 'home';
        }
        return '';
    }

    function buildTabBar() {
        if (document.getElementById('storeTabBar')) return;

        const nav = document.createElement('nav');
        nav.id = 'storeTabBar';
        nav.className = 'store-tab-bar mobile-only';
        nav.setAttribute('aria-label', 'Store navigation');

        const activeId = getActiveTabId();

        TABS.forEach((tab) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'store-tab-item' + (tab.id === activeId ? ' active' : '');
            btn.dataset.tab = tab.id;
            btn.setAttribute('aria-label', tab.label);
            btn.innerHTML = `<i class="fas ${tab.icon}" aria-hidden="true"></i><span>${tab.label}</span>`;

            if (tab.href) {
                btn.addEventListener('click', () => {
                    window.location.href = tab.href;
                });
            } else if (tab.action === 'search') {
                btn.addEventListener('click', () => {
                    if (typeof window.openSearch === 'function') window.openSearch();
                });
            } else if (tab.action === 'cart') {
                btn.addEventListener('click', () => {
                    if (typeof window.openCart === 'function') window.openCart();
                });
            } else if (tab.action === 'menu') {
                btn.addEventListener('click', () => {
                    document.getElementById('mainNav')?.classList.toggle('active');
                });
            }

            nav.appendChild(btn);
        });

        document.body.appendChild(nav);
        document.body.classList.add('store-app-shell');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildTabBar);
    } else {
        buildTabBar();
    }
})();
