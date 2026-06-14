/* =============================================
   TECH CITY — Admin Dashboard Script
   Real-time user data from backend API
   ============================================= */

const API = (window.TECHCITY_API_BASE || '') + '/api';
let allUsers = [];
let allProducts = [];
let refreshInterval;

// HTML escape helper — prevents XSS and ReferenceError crashes
function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Bootstrap ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    guardAdmin();
    initTheme();
    fetchUsers();
    fetchOrders();
    fetchProductsAdmin();

    // Auto-refresh every 10 seconds for a more "real-time" feel
    refreshInterval = setInterval(() => {
        fetchUsers();
        fetchOrders();
        fetchProductsAdmin();
    }, 10000);
});



// ─── Auth Guard ──────────────────────────────
function guardAdmin() {
    const token = localStorage.getItem('techcity_token');
    const user  = JSON.parse(localStorage.getItem('techcity_user') || '{}');
    if (!token || user.role !== 'admin') {
        window.location.href = '../../login/index.html';
        return;
    }
    const nameEl = document.getElementById('admin-name');
    const welcomeEl = document.getElementById('admin-welcome-name');
    if (nameEl) nameEl.textContent = user.username || 'Admin';
    if (welcomeEl) welcomeEl.textContent = user.username || 'Admin';
    if (user.profilePic) {
        const av = document.getElementById('admin-avatar');
        if (av) av.src = user.profilePic;
    }
}

// ─── Fetch Users ─────────────────────────────
async function fetchUsers() {
    const token = localStorage.getItem('techcity_token');
    try {
        const res = await fetch(`${API}/admin/users-full`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                return logout();
            }
            throw new Error('API error ' + res.status);
        }
        allUsers = await res.json();

        try { renderOverview(allUsers); } catch(e) { console.error('Overview error:', e); }
        try { filterUsers(); } catch(e) { console.error('Grid error:', e); }
        try { renderCartsTable(allUsers); } catch(e) { console.error('Carts error:', e); }
        try { renderWishlistsTable(allUsers); } catch(e) { console.error('Wishlists error:', e); }
        try { updateStats(allUsers); } catch(e) { console.error('Stats error:', e); }

        const el = document.getElementById('last-refresh');
        if (el) el.textContent = 'Updated ' + new Date().toLocaleTimeString();
    } catch (err) {
        console.error('Error fetching users:', err);
        showToast('⚠️ Could not refresh data. Is the server running?', 'error');
    }
}

// ─── Stats Overview ──────────────────────────
function updateStats(users) {
    const totalUsers    = users.length;
    const activeCarts   = users.filter(u => (u.cart_data || []).length > 0).length;
    const totalWishlist = users.reduce((s, u) => s + (u.wishlist_data || []).length, 0);
    const admins        = users.filter(u => u.role === 'admin').length;
    const withPic       = users.filter(u => u.profile_pic).length;

    setText('stat-total-users',   totalUsers);
    setText('stat-active-carts',  activeCarts);
    setText('stat-wishlist-items', totalWishlist);
    setText('stat-admins',         admins);
    setText('stat-profile-pics',   withPic);
}

// ─── Overview Table ──────────────────────────
function renderOverview(users) {
    const tbody = document.getElementById('overview-table-body');
    if (!tbody) return;
    if (!users.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#6b7280;">No users found.</td></tr>';
        return;
    }
    tbody.innerHTML = users.map(u => {
        const cart     = u.cart_data    || [];
        const wishlist = u.wishlist_data || [];
        const joined   = u.created_at ? new Date(u.created_at).toLocaleDateString() : '—';
        return `
        <tr>
          <td>${avatarHtml(u, 36)}</td>
          <td><strong>${esc(u.username)}</strong></td>
          <td style="color:#6b7280;font-size:0.82rem;">${esc(u.email)}</td>
          <td>${roleBadge(u.role)}</td>
          <td><span class="badge ${cart.length ? 'completed' : 'cancelled'}">${cart.length} item${cart.length !== 1 ? 's' : ''}</span></td>
          <td>${wishlist.length}</td>
          <td style="color:#6b7280;font-size:0.82rem;">${joined}</td>
        </tr>`;
    }).join('');
}

// ─── Users Grid ──────────────────────────────
function renderUsersGrid(users) {
    const grid = document.getElementById('users-grid');
    if (!grid) return;
    
    // Remember which panels were open before re-rendering
    const openPanelIds = Array.from(grid.querySelectorAll('.user-details-panel.open'))
        .map(p => p.id);

    if (!users.length) {
        grid.innerHTML = '<p style="color:#6b7280;">No users registered yet.</p>';
        return;
    }
    
    grid.innerHTML = users.map(u => userCard(u)).join('');

    // Restore open panels and their toggle button states
    openPanelIds.forEach(id => {
        const panel = document.getElementById(id);
        if (panel) {
            panel.classList.add('open');
            // Update the button text to "Hide Details" for these panels
            const actionRow = panel.previousElementSibling;
            const mainBtn = actionRow?.querySelector('.expand-btn');
            if (mainBtn) {
                mainBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Details';
            }
        }
    });
}

function userCard(u) {
    const cart     = u.cart_data    || [];
    const wishlist = u.wishlist_data || [];
    const joined   = u.created_at ? new Date(u.created_at).toLocaleDateString() : '—';
    const cartVal  = cart.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);

    return `
    <div class="user-card" id="user-card-${u.id}">
      <div class="user-card-header">
        ${avatarHtml(u, 56, true)}
        <div class="user-header-info">
          <h3>${esc(u.username)}</h3>
          <p>${esc(u.email)}</p>
          <span class="user-badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}">${u.role}</span>
        </div>
      </div>
      <div class="user-card-body">
        <div class="user-info-row"><i class="fas fa-user"></i> Full Name: <span>${esc(u.full_name || '—')}</span></div>
        <div class="user-info-row"><i class="fas fa-calendar-alt"></i> Joined: <span>${joined}</span></div>
        <hr class="section-divider">
        <div class="mini-badge-row">
          <span class="mini-badge cart"><i class="fas fa-shopping-cart"></i> ${cart.length} cart item${cart.length !== 1 ? 's' : ''}</span>
          <span class="mini-badge wishlist"><i class="fas fa-heart"></i> ${wishlist.length} wished</span>
          ${cartVal > 0 ? `<span class="mini-badge orders"><i class="fas fa-dollar-sign"></i> $${cartVal.toFixed(2)} cart value</span>` : ''}
        </div>
        <div style="display:flex;gap:8px;margin-bottom:10px;">
          <button class="expand-btn" style="flex:1;" onclick="toggleDetails(${u.id})">
            <i class="fas fa-chevron-down"></i> Details
          </button>
          <button onclick="deleteUser(${u.id},'${u.username.replace(/'/g,"\\'")}')"
            style="padding:8px 14px;background:#ef4444;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:0.8rem;transition:background .2s;"
            onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="user-details-panel" id="details-${u.id}">
          <h4><i class="fas fa-shopping-cart"></i> Cart Contents</h4>
          ${cart.length
            ? cart.map(i => `<div class="detail-item"><span>${esc(i.name)}</span><span>×${i.quantity} — $${((i.price||0)*(i.quantity||1)).toFixed(2)}</span></div>`).join('') + 
              `<div class="detail-item" style="font-weight:700; color:var(--admin-accent); border-top:1px solid var(--border-color, #e5e7eb); margin-top:4px;"><span>Total Cart Value</span><span>$${cartVal.toFixed(2)}</span></div>`
            : '<p class="empty-detail">No items in cart.</p>'
          }
          <h4 style="margin-top:12px;"><i class="fas fa-heart"></i> Wishlist</h4>
          ${wishlist.length
            ? wishlist.map(i => `<div class="detail-item"><span>${esc(i.name || i.id)}</span><span>$${parseFloat(i.price||0).toFixed(2)}</span></div>`).join('') +
              `<div class="detail-item" style="font-weight:700; color:var(--danger); border-top:1px solid var(--border-color, #e5e7eb); margin-top:4px;"><span>Total Wishlist Items</span><span>${wishlist.length} items</span></div>`
            : '<p class="empty-detail">Wishlist is empty.</p>'
          }
          <div style="text-align:center; padding-top:12px; margin-top:8px; border-top:1px dashed var(--border-color, #e5e7eb);">
            <button class="expand-btn" style="border:none; width:auto; padding:4px 20px;" onclick="toggleDetails(${u.id})">
              <i class="fas fa-chevron-up"></i> Hide
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

// ─── Cart Activity Table ──────────────────────
function renderCartsTable(users) {
    const tbody = document.getElementById('carts-table-body');
    if (!tbody) return;
    const withCart = users.filter(u => (u.cart_data || []).length > 0);
    if (!withCart.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#6b7280;">No active carts.</td></tr>';
        return;
    }
    tbody.innerHTML = withCart.map(u => {
        const cart  = u.cart_data || [];
        const value = cart.reduce((s, i) => s + (i.price||0)*(i.quantity||1), 0);
        const top   = cart.sort((a,b) => (b.price||0)-(a.price||0))[0];
        return `
        <tr>
          <td>${avatarHtml(u, 36)}</td>
          <td><strong>${esc(u.username)}</strong><br><small style="color:#6b7280;">${esc(u.email)}</small></td>
          <td><span class="badge completed">${cart.length} item${cart.length!==1?'s':''}</span></td>
          <td><strong>$${value.toFixed(2)}</strong></td>
          <td>${top ? esc(top.name) + ` <small style="color:#6b7280;">×${top.quantity}</small>` : '—'}</td>
        </tr>`;
    }).join('');
}

// ─── Wishlists Table ─────────────────────────
function renderWishlistsTable(users) {
    const tbody = document.getElementById('wishlists-table-body');
    if (!tbody) return;
    const withWish = users.filter(u => (u.wishlist_data || []).length > 0);
    if (!withWish.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#6b7280;">No wishlist activity.</td></tr>';
        return;
    }
    tbody.innerHTML = withWish.map(u => {
        const wl  = u.wishlist_data || [];
        const top = wl[0];
        return `
        <tr>
          <td>${avatarHtml(u, 36)}</td>
          <td><strong>${esc(u.username)}</strong><br><small style="color:#6b7280;">${esc(u.email)}</small></td>
          <td><span class="badge pending">${wl.length} item${wl.length!==1?'s':''}</span></td>
          <td>${top ? esc(top.name || top.id) : '—'}</td>
        </tr>`;
    }).join('');
}

// ─── Order Management ────────────────────────
let allOrders = [];

async function fetchOrders() {
    const token = localStorage.getItem('techcity_token');
    try {
        const res = await fetch(`${API}/orders/admin/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                return logout();
            }
            throw new Error('API error ' + res.status);
        }
        allOrders = await res.json();
        renderOrdersTable(allOrders);
    } catch (err) {
        console.error('Error fetching orders:', err);
    }
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    if (!orders.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#6b7280;">No orders found.</td></tr>';
        return;
    }
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>#ORD-${o.id}</td>
            <td><strong>${esc(o.username)}</strong><br><small style="color:#6b7280;">${esc(o.email)}</small></td>
            <td>$${parseFloat(o.total_price).toFixed(2)}</td>
            <td><span class="badge ${o.status.toLowerCase()}">${o.status}</span></td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td>
                <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding:4px; border-radius:4px; font-size:0.8rem;">
                    <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Paid" ${o.status === 'Paid' ? 'selected' : ''}>Paid</option>
                    <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
        </tr>
    `).join('');
}

async function updateOrderStatus(orderId, newStatus) {
    const token = localStorage.getItem('techcity_token');
    try {
        const res = await fetch(`${API}/orders/admin/${orderId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            showToast('✅ Order status updated');
            fetchOrders();
        } else {
            showToast('❌ Failed to update status', 'error');
        }
    } catch (err) {
        showToast('❌ Network error', 'error');
    }
}

// ─── Filter Users Search ─────────────────────
function filterUsers() {
    const q = (document.getElementById('user-search')?.value || '').toLowerCase();
    const filtered = allUsers.filter(u =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.email    || '').toLowerCase().includes(q) ||
        (u.full_name|| '').toLowerCase().includes(q)
    );
    renderUsersGrid(filtered);
}

// ─── Section Switcher ────────────────────────
function switchSection(section, el) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(n => n.classList.remove('active'));

    const target = document.getElementById('section-' + section);
    if (target) target.classList.add('active');
    if (el) el.classList.add('active');

    const titles = { overview:'Admin Overview', users:'All Users', carts:'Cart Activity', wishlists:'Wishlists', orders:'Order Management', products:'Product Management' };
    const pt = document.getElementById('page-title');
    if (pt) pt.textContent = titles[section] || section;

    if (window.syncDashboardTab) window.syncDashboardTab(section);
    if (window.closeDashboardSidebar) window.closeDashboardSidebar();
    if (window.scrollDashboardToTop) window.scrollDashboardToTop();

    if (section === 'products' && typeof fetchProductsAdmin === 'function') {
        fetchProductsAdmin();
    }
}

document.addEventListener('dashboard:navigate', (e) => {
    const { section } = e.detail;
    if (section === 'menu') return;
    const nav = document.querySelector(`.sidebar-nav .nav-item[data-section="${section}"]`);
    switchSection(section, nav);
});

// ─── Delete User ─────────────────────────────
async function deleteUser(userId, username) {
    const me = JSON.parse(localStorage.getItem('techcity_user') || '{}');
    if (userId === me.id) {
        showToast('❌ You cannot delete your own account.', 'error');
        return;
    }
    if (!confirm(`Are you sure you want to permanently delete user "${username}"?\n\nThis cannot be undone.`)) return;

    const token = localStorage.getItem('techcity_token');
    try {
        const res = await fetch(`${API}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            showToast(`✅ ${data.message}`);
            // Remove card from DOM immediately
            document.getElementById(`user-card-${userId}`)?.remove();
            // Update allUsers and re-render stats
            allUsers = allUsers.filter(u => u.id !== userId);
            updateStats(allUsers);
            renderOverview(allUsers);
            renderCartsTable(allUsers);
            renderWishlistsTable(allUsers);
        } else {
            showToast(`❌ ${data.message}`, 'error');
        }
    } catch (err) {
        showToast('❌ Network error. Could not delete user.', 'error');
    }
}

// ─── Toggle Details Panel ────────────────────
function toggleDetails(userId) {
    const panel = document.getElementById(`details-${userId}`);
    if (!panel) return;
    
    // Find the main "Details" button in the action row above the panel
    // The panel's previous sibling is the div containing the buttons
    const actionRow = panel.previousElementSibling;
    const mainBtn = actionRow?.querySelector('.expand-btn');
    
    panel.classList.toggle('open');
    const isOpen = panel.classList.contains('open');
    
    if (mainBtn) {
        mainBtn.innerHTML = isOpen
            ? '<i class="fas fa-chevron-up"></i> Hide Details'
            : '<i class="fas fa-chevron-down"></i> View Details';
    }
}

// ─── Helpers ─────────────────────────────────
function avatarHtml(u, size = 40, forCard = false) {
    const style = `width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;`;
    if (u.profile_pic) {
        return `<img src="${u.profile_pic}" alt="${esc(u.username)}" style="${style}${forCard ? 'border:3px solid rgba(255,255,255,0.4);' : ''}">`;
    }
    const initials = (u.username || '?')[0].toUpperCase();
    const bg = forCard ? 'background:rgba(255,255,255,0.25);color:#fff;'
                       : 'background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;';
    return `<div style="${style}${bg}display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(size*0.4)}px;">${initials}</div>`;
}

function roleBadge(role) {
    return role === 'admin'
        ? `<span class="badge completed">Admin</span>`
        : `<span class="badge pending">User</span>`;
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function logout() {
    if (window.performLogout) {
        performLogout(); // Saves admin data to namespace + clears generic keys
    } else {
        localStorage.removeItem('techcity_token');
        localStorage.removeItem('techcity_user');
    }
    window.location.href = '../../login/index.html';
}

function showToast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    if (type === 'error') t.style.background = '#ef4444';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

// ─── Theme ───────────────────────────────────
function initTheme() {
    const btn  = document.getElementById('themeToggle');
    const icon = btn?.querySelector('i');
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (icon) icon.className = 'fas fa-sun';
    }
    btn?.addEventListener('click', () => {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
        localStorage.setItem('theme', dark ? 'light' : 'dark');
        if (icon) icon.className = dark ? 'fas fa-moon' : 'fas fa-sun';
    });
}

window.filterProducts = function() {
    const q = (document.getElementById('prodSearch')?.value || '').toLowerCase();
    const cat = (document.getElementById('prodCategoryFilter')?.value || '').toLowerCase();
    const filtered = allProducts.filter(p => {
        const matchName = !q || (p.name || '').toLowerCase().includes(q);
        const matchCat  = !cat || (p.category || '').toLowerCase() === cat;
        return matchName && matchCat;
    });
    renderProductsTable(filtered);
};

// ─── Product Management ───────────────────────
let isDraggingAdmin = false;

async function fetchProductsAdmin() {
    if (isDraggingAdmin) return; // Block refreshes while dragging
    try {
        const res = await fetch(`${API}/products?t=${Date.now()}`);
        if (!res.ok) throw new Error('API error ' + res.status);
        allProducts = await res.json();
        if (typeof window.filterProducts === 'function') {
            window.filterProducts();
        } else {
            renderProductsTable(allProducts);
        }
    } catch (err) {
        console.error('Error fetching products:', err);
        const tbody = document.getElementById('products-table-body');
        if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:red;">Failed to load: ${err.message}</td></tr>`;
    }
}

function renderProductsTable(products) {
    console.log('[Admin] renderProductsTable called with', products ? products.length : 'null', 'products');
    const tbody = document.getElementById('products-table-body');
    if (!tbody) {
        console.warn('[Admin] products-table-body not found in DOM');
        return;
    }
    if (!products || !products.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#6b7280;">No products in database.</td></tr>';
        return;
    }

    // Group products by category
    const grouped = {};
    products.forEach(p => {
        const cat = p.category || 'Uncategorized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
    });

    let html = '';
    Object.keys(grouped).sort().forEach(cat => {
        // Category Header Row
        html += `
        <tr class="category-header-row" style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <td colspan="7" style="padding: 12px 20px; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">
                <i class="fas fa-folder-open" style="margin-right: 8px; color: var(--admin-accent);"></i> ${cat} 
                <span style="font-weight: 400; color: #94a3b8; margin-left: 8px;">(${grouped[cat].length} products)</span>
            </td>
        </tr>`;

        // Products in this category
        grouped[cat].forEach(p => {
            const img = (p.images && p.images[0]) || p.image || '../../images/placeholder.jpg';
            html += `
            <tr class="product-row" data-id="${p.id}" draggable="true">
                <td class="drag-handle"><i class="fas fa-grip-lines"></i> #${p.id}</td>
                <td><img src="${img}" style="width:40px;height:40px;border-radius:4px;object-fit:cover;"></td>
                <td><strong>${esc(p.name)}</strong></td>
                <td><span class="badge pending">${esc(p.category)}</span></td>
                <td>$${parseFloat(p.price).toFixed(2)}</td>
                <td><span class="badge ${p.stock_quantity > 0 ? 'completed' : 'cancelled'}">${p.stock_quantity}</span></td>
                <td>
                    <div style="display:flex;gap:5px;">
                        <button class="btn btn-secondary" onclick="editProduct(${p.id})" style="padding:4px 8px;min-width:auto;"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-primary" onclick="deleteProductAdmin(${p.id})" style="padding:4px 8px;min-width:auto;background:#ef4444;"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
        });
    });

    tbody.innerHTML = html;
    initDragAndDrop();
}

function initDragAndDrop() {
    console.log('[Admin] Initializing Drag and Drop handlers');
    const tbody = document.getElementById('products-table-body');
    const rows = tbody.querySelectorAll('.product-row');
    const headers = tbody.querySelectorAll('.category-header-row');
    let draggedRow = null;

    rows.forEach(row => {
        row.addEventListener('dragstart', (e) => {
            console.log('[Admin] Drag started for product:', row.dataset.id);
            draggedRow = row;
            isDraggingAdmin = true;
            row.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            row.style.opacity = '0.4';

            // PAUSE AUTO-REFRESH while dragging
            if (window.refreshInterval) {
                console.log('[Admin] Pausing auto-refresh');
                clearInterval(window.refreshInterval);
            }
        });

        row.addEventListener('dragend', async () => {
            console.log('[Admin] Drag ended');
            const currentDraggedRow = draggedRow;
            draggedRow = null;
            
            if (currentDraggedRow) {
                currentDraggedRow.classList.remove('dragging');
                currentDraggedRow.style.opacity = '1';
            }
            
            // Remove over classes from all rows and headers
            tbody.querySelectorAll('.product-row, .category-header-row').forEach(r => {
                r.classList.remove('drag-over');
                r.style.borderTop = '';
            });
            
            // 🛑 CRITICAL: Keep isDraggingAdmin = true until saveNewOrder finishes
            // This prevents fetchProductsAdmin from snapping the product back mid-save
            try {
                await saveNewOrder();
            } catch (err) {
                console.error('[Admin] Drag end save failed:', err);
            } finally {
                isDraggingAdmin = false;
                
                // RESTART AUTO-REFRESH only after everything is done
                console.log('[Admin] Restarting auto-refresh');
                if (window.refreshInterval) clearInterval(window.refreshInterval);
                window.refreshInterval = setInterval(() => {
                    if (typeof fetchUsers === 'function') fetchUsers();
                    if (typeof fetchOrders === 'function') fetchOrders();
                    fetchProductsAdmin();
                }, 10000);
            }
        });
    });

    // Handle dragover on the entire tbody to allow smoother movement
    tbody.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (!draggedRow) return;

        const target = e.target.closest('.product-row, .category-header-row');
        
        // Remove highlighting from everyone else
        tbody.querySelectorAll('.product-row, .category-header-row').forEach(r => {
            if (r !== target) {
                r.classList.remove('drag-over');
            }
        });

        if (target && target !== draggedRow) {
            target.classList.add('drag-over');
            const rect = target.getBoundingClientRect();
            const next = (e.clientY - rect.top) > (rect.height / 2);
            
            // If dragging over a header, we can drop it after the header
            if (target.classList.contains('category-header-row')) {
                tbody.insertBefore(draggedRow, target.nextSibling);
            } else {
                tbody.insertBefore(draggedRow, next ? target.nextSibling : target);
            }
        }
    });

    tbody.addEventListener('dragleave', (e) => {
        const target = e.target.closest('.product-row, .category-header-row');
        if (target) target.classList.remove('drag-over');
    });
}

async function saveNewOrder() {
    const tbody = document.getElementById('products-table-body');
    const rows = tbody.querySelectorAll('.product-row');
    
    console.log('[Admin] saveNewOrder called. Row count:', rows.length);

    const updates = Array.from(rows).map((row, index) => {
        // Detect current category based on preceding header
        let currentCategory = '';
        let prev = row.previousElementSibling;
        while (prev) {
            if (prev.classList.contains('category-header-row')) {
                // Get text content and clean it up (removing numbers in brackets and icons)
                const fullText = prev.textContent || prev.innerText || '';
                // The header looks like: "FOLDER_ICON Category Name (X products)"
                // We split by '(' to remove the product count
                let catName = fullText.split('(')[0].trim();
                currentCategory = catName.toLowerCase();
                break;
            }
            prev = prev.previousElementSibling;
        }

        return {
            id: parseInt(row.dataset.id),
            display_order: index,
            category: currentCategory
        };
    });

    const productIds = updates.map(u => u.id);
    const categoryUpdates = updates.map(u => ({ id: u.id, category: u.category }));
    
    // OPTIMISTIC UPDATE: Update the global allProducts array to match the new DOM order
    // This prevents any accidental re-renders from using old data while we wait for the server
    const newProductsOrder = [];
    updates.forEach(u => {
        const found = allProducts.find(p => p.id === u.id);
        if (found) {
            newProductsOrder.push({ ...found, category: u.category });
        }
    });
    allProducts = newProductsOrder;

    console.log('[Admin] New sequence IDs:', productIds);
    console.log('[Admin] Category mappings:', categoryUpdates);

    const token = localStorage.getItem('techcity_token');
    try {
        const res = await fetch(`${API}/products/reorder/all`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productIds, categoryUpdates })
        });
        
        if (res.ok) {
            console.log('[Admin] Reorder save successful');
            showToast('✅ Order and Categories saved');
            
            // Refresh local state
            const refreshRes = await fetch(`${API}/products?t=${Date.now()}`);
            if (refreshRes.ok) {
                allProducts = await refreshRes.json();
                console.log('[Admin] Re-fetching all products after save');
                renderProductsTable(allProducts);
            }
        } else {
            const errData = await res.json().catch(() => ({}));
            console.error('[Admin] Reorder save failed:', res.status, errData);
            showToast(`❌ Failed to save: ${errData.message || res.statusText}`, 'error');
            renderProductsTable(allProducts); // Snap back on failure
        }
    } catch (err) {
        console.error('[Admin] Network error saving order:', err);
        showToast('❌ Network error saving order', 'error');
        renderProductsTable(allProducts);
    }
}

window.openProductModal = function(editId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('productModalTitle');
    
    form.reset();
    clearImage(); // Clear file input and preview
    document.getElementById('editProductId').value = editId || '';
    title.innerText = editId ? 'Edit Product' : 'Add New Product';

    if (editId) {
        const p = allProducts.find(prod => prod.id === editId);
        if (p) {
            document.getElementById('prodName').value = p.name;
            document.getElementById('prodCategory').value = p.category;
            document.getElementById('prodPrice').value = p.price;
            document.getElementById('prodStock').value = p.stock_quantity;
            document.getElementById('prodRating').value = p.rating;
            
            document.getElementById('prodDescription').value = p.description || '';
            document.getElementById('prodBadge').value = p.badge || '';
            // Handle featured checkbox
            document.getElementById('prodIsFeatured').checked = (p.badge || '').toLowerCase().includes('featured');
            document.getElementById('prodSpecs').value = (p.specs && Array.isArray(p.specs)) ? p.specs.join(', ') : '';
            
            // Populate images textarea
            let imageList = [];
            if (p.images && Array.isArray(p.images)) {
                imageList = p.images;
            } else if (p.image) {
                imageList = [p.image];
            }
            document.getElementById('prodImage').value = imageList.join('\n');
            updateImageGallery();
        }
    }
    modal.style.display = 'flex';
};

window.closeProductModal = function() {
    document.getElementById('productModal').style.display = 'none';
};

window.updateImageGallery = function() {
    const textarea = document.getElementById('prodImage');
    const gallery = document.getElementById('imageGalleryPreview');
    if (!gallery) return;

    const urls = textarea.value.split('\n').map(u => u.trim()).filter(u => u);
    
    if (urls.length === 0) {
        gallery.innerHTML = '<p style="grid-column: 1/-1; font-size: 0.75rem; color: #94a3b8; font-style: italic;">No images selected</p>';
        return;
    }

    gallery.innerHTML = urls.map((url, index) => `
        <div style="position: relative; width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; background: #f8fafc;">
            <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='../../images/placeholder.jpg';this.style.opacity='0.5'">
            <button type="button" onclick="removeImageFromGallery(${index})" style="position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; background: rgba(239, 68, 68, 0.9); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
};

window.removeImageFromGallery = function(index) {
    const textarea = document.getElementById('prodImage');
    const urls = textarea.value.split('\n').map(u => u.trim()).filter(u => u);
    urls.splice(index, 1);
    textarea.value = urls.join('\n');
    updateImageGallery();
};

window.handleImageUpload = async function(event) {
    const files = Array.from(event.target.files);
    const textarea = document.getElementById('prodImage');
    const currentUrls = textarea.value.split('\n').map(u => u.trim()).filter(u => u);

    for (const file of files) {
        try {
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(e);
                reader.readAsDataURL(file);
            });
            currentUrls.push(base64);
        } catch (err) {
            console.error('Error reading file:', err);
        }
    }

    textarea.value = currentUrls.join('\n');
    updateImageGallery();
    // Clear the file input so the same file can be selected again if needed
    event.target.value = '';
};

window.clearImage = function() {
    document.getElementById('prodImage').value = '';
    updateImageGallery();
};

window.editProduct = function(id) {
    openProductModal(id);
};

window.saveProduct = async function(e) {
    e.preventDefault();
    const token = localStorage.getItem('techcity_token');
    const id = document.getElementById('editProductId').value;
    
    const productData = {
        name: document.getElementById('prodName').value,
        category: document.getElementById('prodCategory').value,
        price: parseFloat(document.getElementById('prodPrice').value),
        stock_quantity: parseInt(document.getElementById('prodStock').value),
        rating: parseFloat(document.getElementById('prodRating').value),
        images: document.getElementById('prodImage').value.split('\n').map(s => s.trim()).filter(s => s),
        description: document.getElementById('prodDescription').value,
        badge: (() => {
            let b = document.getElementById('prodBadge').value || '';
            const isF = document.getElementById('prodIsFeatured').checked;
            if (isF && !b.toLowerCase().includes('featured')) {
                b = b ? `${b}, Featured` : 'Featured';
            } else if (!isF && b.toLowerCase().includes('featured')) {
                // Remove 'featured' case-insensitively, then clean up commas and whitespace
                b = b.replace(/featured/gi, '').split(',').map(s => s.trim()).filter(s => s).join(', ');
            }
            return b;
        })(),
        specs: (document.getElementById('prodSpecs')?.value || '').split(',').map(s => s.trim()).filter(s => s)
    };

    try {
        const url = id ? `${API}/products/${id}` : `${API}/products`;
        const method = id ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(productData)
        });

        if (res.ok) {
            showToast(`✅ Product ${id ? 'updated' : 'added'} successfully`);
            closeProductModal();
            fetchProductsAdmin();
        } else {
            const err = await res.json();
            showToast(`❌ Error: ${err.message}`, 'error');
        }
    } catch (err) {
        showToast('❌ Network error', 'error');
    }
};

window.deleteProductAdmin = async function(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const token = localStorage.getItem('techcity_token');
    try {
        const res = await fetch(`${API}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            showToast('✅ Product deleted');
            fetchProductsAdmin();
        } else {
            showToast('❌ Failed to delete product', 'error');
        }
    } catch (err) {
        showToast('❌ Network error', 'error');
    }
};