// =========================================================
// TECHCITY SEARCH MODULE - search.js
// Standalone: works without main.js
// =========================================================

(function() {

    function buildOverlay() {
        var overlay = document.createElement('div');
        overlay.id = 'searchOverlay';
        overlay.style.cssText = [
            'position:fixed',
            'inset:0',
            'background:rgba(15,23,42,0.7)',
            'backdrop-filter:blur(10px)',
            '-webkit-backdrop-filter:blur(10px)',
            'z-index:99999',
            'display:none',
            'flex-direction:column',
            'align-items:center',
            'padding-top:8vh'
        ].join(';');

        var container = document.createElement('div');
        container.style.cssText = [
            'background:#fff',
            'border-radius:20px',
            'width:90%',
            'max-width:720px',
            'overflow:hidden',
            'box-shadow:0 25px 60px rgba(0,0,0,0.3)'
        ].join(';');

        // Header bar
        var header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:1rem;padding:1.5rem 2rem;border-bottom:1px solid #f1f5f9;';

        var searchIcon = document.createElement('span');
        searchIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';

        var input = document.createElement('input');
        input.id = 'searchInputMain';
        input.type = 'text';
        input.placeholder = 'Search products, categories...';
        input.autocomplete = 'off';
        input.style.cssText = 'flex:1;border:none;font-size:1.1rem;outline:none;color:#0f172a;font-family:inherit;background:transparent;';

        var closeBtn = document.createElement('button');
        closeBtn.id = 'closeSearchOverlay';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Close search');
        closeBtn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:1.5rem;color:#94a3b8;line-height:1;padding:0;';
        closeBtn.onclick = function() { window.closeSearch(); };

        header.appendChild(searchIcon);
        header.appendChild(input);
        header.appendChild(closeBtn);

        // Results container
        var results = document.createElement('div');
        results.id = 'searchResults';
        results.style.cssText = 'max-height:60vh;overflow-y:auto;padding:1rem;';
        results.innerHTML = '<div style="padding:2rem;text-align:center;color:#94a3b8;">Start typing to search products...</div>';

        container.appendChild(header);
        container.appendChild(results);
        overlay.appendChild(container);

        // Close on backdrop click
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) window.closeSearch();
        });

        // Close on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') window.closeSearch();
        });

        // Search input handler
        input.addEventListener('input', function() {
            var q = input.value.toLowerCase().trim();
            var r = document.getElementById('searchResults');
            if (!q) {
                r.innerHTML = '<div style="padding:2rem;text-align:center;color:#94a3b8;">Start typing to search products...</div>';
                return;
            }
            var prods = window.products || [];
            var found = prods.filter(function(p) {
                var name = (p.name || '').toLowerCase();
                var cat = (p.category || '').toLowerCase();
                var desc = (p.description || '').toLowerCase();
                return name.indexOf(q) !== -1 || cat.indexOf(q) !== -1 || desc.indexOf(q) !== -1;
            });

            // Prioritize results that START with the query in their name
            found.sort(function(a, b) {
                var nameA = (a.name || '').toLowerCase();
                var nameB = (b.name || '').toLowerCase();
                var aStarts = nameA.indexOf(q) === 0;
                var bStarts = nameB.indexOf(q) === 0;
                
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;
                return 0;
            });

            found = found.slice(0, 10);

            if (!found.length) {
                r.innerHTML = '<div style="padding:2rem;text-align:center;color:#94a3b8;">No products found for "' + q + '"</div>';
                return;
            }

            r.innerHTML = '';
            found.forEach(function(p) {
                var img = (p.images && p.images[0]) || p.image || '/images/placeholder.jpg';
                var price = '$' + parseFloat(p.price || 0).toFixed(2);
                var item = document.createElement('div');
                item.style.cssText = 'display:flex;align-items:center;gap:1rem;padding:0.85rem 1rem;border-radius:12px;cursor:pointer;transition:background 0.15s;';
                item.onmouseenter = function() { item.style.background = '#f8fafc'; };
                item.onmouseleave = function() { item.style.background = ''; };
                item.onclick = function() {
                    window.closeSearch();
                    if (typeof window.showQuickView === 'function') window.showQuickView(String(p.id));
                };
                item.innerHTML =
                    '<img src="' + img + '" style="width:56px;height:56px;object-fit:cover;border-radius:10px;background:#f1f5f9;" onerror="this.src=\'/images/placeholder.jpg\'">' +
                    '<div style="flex:1"><div style="font-weight:600;font-size:0.95rem;">' + (p.name || '') + '</div>' +
                    '<div style="color:#64748b;font-size:0.8rem;">' + (p.category || '') + ' &mdash; ' + price + '</div></div>' +
                    '<span style="color:#94a3b8;">&rsaquo;</span>';
                r.appendChild(item);
            });
        });

        document.body.appendChild(overlay);
        return overlay;
    }

    window.openSearch = function() {
        console.log('[Search] openSearch() called');
        var overlay = document.getElementById('searchOverlay') || buildOverlay();
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        var inp = document.getElementById('searchInputMain');
        if (inp) { inp.value = ''; inp.focus(); }
        var r = document.getElementById('searchResults');
        if (r) r.innerHTML = '<div style="padding:2rem;text-align:center;color:#94a3b8;">Start typing to search products...</div>';
    };

    window.closeSearch = function() {
        var overlay = document.getElementById('searchOverlay');
        if (overlay) { overlay.style.display = 'none'; }
        document.body.style.overflow = '';
    };

    // Attach to any existing search button immediately
    function bindSearchBtn() {
        var btn = document.getElementById('searchBtn');
        if (btn) {
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.openSearch();
            };
            console.log('[Search] Bound to #searchBtn');
        } else {
            console.warn('[Search] #searchBtn not found yet');
        }
    }

    // Try immediately (if script is at bottom of body)
    bindSearchBtn();

    // Also try after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindSearchBtn);
    }

    // Body delegation as ultimate fallback
    document.addEventListener('click', function(e) {
        var btn = e.target.closest && e.target.closest('#searchBtn');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            window.openSearch();
        }
    }, true); // capture phase to beat any other listeners

    console.log('[search.js] Loaded - openSearch and closeSearch are ready');

})();
