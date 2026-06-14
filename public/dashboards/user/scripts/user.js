function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function productListCell(name, image, label) {
    const src = image && image !== 'undefined' ? image : '../../images/techcity1.jpg';
    return `<td data-label="${label}" class="cell-product">
        <div class="m-list-product">
            <img src="${escHtml(src)}" alt="">
            <span class="m-list-product-name">${escHtml(name)}</span>
        </div>
    </td>`;
}

document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    // Theme logic - Check local storage or system preference
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    }

    // Toggle Theme
    themeToggleBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeIcon.className = 'fas fa-moon';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeIcon.className = 'fas fa-sun';
        }
    });

    // Personalization logic
    const userData = JSON.parse(localStorage.getItem('techcity_user'));
    const usernameHeader = document.getElementById('username-header');
    const welcomeName = document.getElementById('welcome-name');

    if (userData && userData.username) {
        if (usernameHeader) usernameHeader.textContent = userData.username;
        if (welcomeName) welcomeName.textContent = `Welcome back, ${userData.username}!`;
    }

    // Logout logic
    const logoutLink = document.querySelector('a[href="../../index.html"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.performLogout) {
                performLogout(); // Saves user data to namespace + clears generic keys
            } else {
                // Fallback if auth.js not loaded
                localStorage.removeItem('techcity_token');
                localStorage.removeItem('techcity_user');
            }
            window.location.href = '/index.html';
        });
    }

    // Section Switching Logic
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.dashboard-section');
    const pageTitle = document.querySelector('.page-title');

    function navigateToSection(targetSection, activeNavItem) {
        if (!targetSection) return;

        navItems.forEach(nav => nav.classList.remove('active'));
        if (activeNavItem) activeNavItem.classList.add('active');

        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${targetSection}-section`) {
                section.classList.add('active');
            }
        });

        const titles = {
            profile: 'User Overview',
            orders: 'My Orders',
            wishlist: 'Wishlist',
            wallet: 'Wallet',
            support: 'Support',
            settings: 'Settings',
        };
        pageTitle.textContent = activeNavItem
            ? activeNavItem.textContent.trim()
            : (titles[targetSection] || 'Dashboard');

        if (targetSection === 'orders') renderAllOrders();
        if (targetSection === 'wishlist') renderFullWishlist();
        if (targetSection === 'wallet') renderWalletView();
        if (targetSection === 'support') renderSupportView();
        if (targetSection === 'settings') renderSettingsView();

        if (window.syncDashboardTab) window.syncDashboardTab(targetSection);
        if (window.closeDashboardSidebar) window.closeDashboardSidebar();
        if (window.scrollDashboardToTop) window.scrollDashboardToTop();
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToSection(item.dataset.section, item);
        });
    });

    document.addEventListener('dashboard:navigate', (e) => {
        const { section } = e.detail;
        if (section === 'menu') return;
        const nav = document.querySelector(`.sidebar .nav-item[data-section="${section}"]`);
        navigateToSection(section, nav);
    });

    // Real-time Dashboard Logic
    function updateDashboard() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const wallet = JSON.parse(localStorage.getItem('wallet')) || { balance: 0, transactions: [] };
        const storedUser = JSON.parse(localStorage.getItem('techcity_user')) || {};
        
        renderCart(cart);
        renderWishlist(wishlist);
        renderOrders(); // Now async
        updateStats(cart, wishlist, wallet); // Removed orders from local stats update
        
        // Update user info globally
        if (storedUser.username) {
            const profileName = document.getElementById('profile-display-name');
            const headerName = document.getElementById('username-header');
            if (profileName) profileName.textContent = storedUser.username;
            if (headerName) headerName.textContent = storedUser.username;
        }

        // Update profile pictures
        if (storedUser.profilePic) {
            const profilePreviews = document.querySelectorAll('img[alt="User"]');
            profilePreviews.forEach(img => {
                img.src = storedUser.profilePic;
            });
            const previewImg = document.getElementById('profile-img-preview');
        }
    }
    window.updateDashboard = updateDashboard;

    // --- Profile Picture Upload ---
    const profileUpload = document.getElementById('profile-upload');
    const profileUploadBtn = document.getElementById('profile-upload-btn');
    const uploadTrigger = document.getElementById('upload-trigger');

    if (profileUploadBtn && profileUpload) {
        profileUploadBtn.addEventListener('click', () => profileUpload.click());
    }
    if (uploadTrigger && profileUpload) {
        uploadTrigger.addEventListener('click', () => profileUpload.click());
    }

    if (profileUpload) {
        profileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const dataUrl = event.target.result;
                    
                    // Save to localStorage
                    let user = JSON.parse(localStorage.getItem('techcity_user')) || {};
                    user.profilePic = dataUrl;
                    localStorage.setItem('techcity_user', JSON.stringify(user));
                    
                    // Sync to backend so admin can see it
                    if (window.syncUserDataToServer) syncUserDataToServer();

                    // Update UI
                    updateDashboard();
                    alert('Profile picture updated successfully!');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Support Logic ---
    function renderSupportView() {
        const tickets = JSON.parse(localStorage.getItem('support_tickets')) || [];
        const ticketsTable = document.querySelector('#tickets-table tbody');
        if (!ticketsTable) return;

        if (tickets.length === 0) {
            ticketsTable.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No tickets created yet</td></tr>';
        } else {
            ticketsTable.innerHTML = tickets.slice().reverse().map(t => `
                <tr>
                    <td>#TKT-${t.id}</td>
                    <td>${t.subject}</td>
                    <td><span class="badge pending">${t.status}</span></td>
                </tr>
            `).join('');
        }
    }

    const supportForm = document.getElementById('support-form');
    if (supportForm) {
        supportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const subject = document.getElementById('support-subject').value;
            const message = document.getElementById('support-message').value;

            const tickets = JSON.parse(localStorage.getItem('support_tickets')) || [];
            tickets.push({
                id: Math.floor(Math.random() * 9000) + 1000,
                subject: subject,
                message: message,
                status: 'Open',
                date: new Date().toISOString()
            });

            localStorage.setItem('support_tickets', JSON.stringify(tickets));
            supportForm.reset();
            alert('Support ticket created successfully!');
            renderSupportView();
        });
    }

    // --- Settings Logic ---
    function renderSettingsView() {
        const settings = JSON.parse(localStorage.getItem('user_settings')) || { emailNotif: true, fa: false };
        const emailCheck = document.getElementById('email-notif');
        const faCheck = document.getElementById('2fa-toggle');

        if (emailCheck) emailCheck.checked = settings.emailNotif;
        if (faCheck) faCheck.checked = settings.fa;
    }

    const saveSettingsBtn = document.getElementById('save-settings-btn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const settings = {
                emailNotif: document.getElementById('email-notif').checked,
                fa: document.getElementById('2fa-toggle').checked
            };
            localStorage.setItem('user_settings', JSON.stringify(settings));
            alert('Settings saved successfully!');
        });
    }

    async function renderOrders() {
        const ordersTableBody = document.getElementById('recent-orders-tbody');
        if (!ordersTableBody) return;

        try {
            const token = localStorage.getItem('techcity_token');
            const response = await fetch((window.TECHCITY_API_BASE || '') + '/api/orders/my-orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch orders");
            const orders = await response.json();

            if (orders.length === 0) {
                ordersTableBody.innerHTML = '<tr class="empty-row"><td colspan="5">No orders placed yet</td></tr>';
                return;
            }

            const recentOrders = orders.slice(0, 5);
            ordersTableBody.innerHTML = recentOrders.map(order => `
                <tr class="m-data-row">
                    <td data-label="Order ID">#ORD-${order.id}</td>
                    <td data-label="Date">${new Date(order.created_at).toLocaleDateString()}</td>
                    <td data-label="Total">$${parseFloat(order.total_price).toFixed(2)}</td>
                    <td data-label="Status"><span class="badge ${order.status.toLowerCase()}">${escHtml(order.status)}</span></td>
                    <td data-label="Action" class="cell-action">${order.status.toLowerCase() === 'pending'
                        ? `<button type="button" class="btn btn-cancel-order" onclick="cancelOrder(${order.id})"><i class="fas fa-times"></i> Cancel</button>`
                        : '<span class="m-muted">—</span>'
                    }</td>
                </tr>
            `).join('');

            // Sync stats
            const totalOrdersStat = document.getElementById('total-orders-stat');
            if (totalOrdersStat) totalOrdersStat.textContent = orders.length;
            const pendingDeliveriesStat = document.getElementById('pending-deliveries-stat');
            if (pendingDeliveriesStat) {
                const pending = orders.filter(o => ['pending', 'paid', 'shipped', 'processing'].includes(o.status.toLowerCase())).length;
                pendingDeliveriesStat.textContent = pending;
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    }

    async function renderAllOrders() {
        const ordersTableBody = document.getElementById('all-orders-tbody');
        if (!ordersTableBody) return;

        try {
            const token = localStorage.getItem('techcity_token');
            const response = await fetch((window.TECHCITY_API_BASE || '') + '/api/orders/my-orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const orders = await response.json();

            if (orders.length === 0) {
                ordersTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No orders placed yet</td></tr>';
                return;
            }

            ordersTableBody.innerHTML = orders.map(order => `
                <tr>
                    <td>#ORD-${order.id}</td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                    <td>$${parseFloat(order.total_price).toFixed(2)}</td>
                    <td><span class="badge ${order.status.toLowerCase()}">${order.status}</span></td>
                    <td>${order.status.toLowerCase() === 'pending'
                        ? `<button onclick="cancelOrder(${order.id})" style="padding:4px 10px;background:#ef4444;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.8rem;font-weight:600;"><i class="fas fa-times"></i> Cancel</button>`
                        : `<span style="font-size:0.78rem;color:#94a3b8;">—</span>`
                    }</td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Error fetching orders:", err);
        }
    }

    function renderCart(cart) {
        const cartTableBody = document.querySelector('#cart-table tbody');
        if (!cartTableBody) return;

        if (cart.length === 0) {
            cartTableBody.innerHTML = '<tr class="empty-row"><td colspan="4">Your cart is empty</td></tr>';
            return;
        }

        cartTableBody.innerHTML = cart.map(item => `
            <tr class="m-data-row">
                ${productListCell(item.name, item.image, 'Product')}
                <td data-label="Price">$${parseFloat(item.price).toFixed(2)}</td>
                <td data-label="Qty">${item.quantity}</td>
                <td data-label="Subtotal">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');
    }

    function renderWishlist(wishlist) {
        const wishlistTableBody = document.querySelector('#wishlist-table tbody');
        if (!wishlistTableBody) return;

        if (wishlist.length === 0) {
            wishlistTableBody.innerHTML = '<tr class="empty-row"><td colspan="4">Your wishlist is empty</td></tr>';
            return;
        }

        wishlistTableBody.innerHTML = wishlist.slice(0, 5).map(item => `
            <tr class="m-data-row">
                ${productListCell(item.name, item.image, 'Product')}
                <td data-label="Category">${escHtml(item.category || '—')}</td>
                <td data-label="Price">$${parseFloat(item.price).toFixed(2)}</td>
                <td data-label="Action" class="cell-action">
                    <button type="button" class="btn btn-remove-wishlist" onclick="removeFromWishlist('${String(item.id).replace(/'/g, "\\'")}')">Remove</button>
                </td>
            </tr>
        `).join('');
    }

    function renderFullWishlist() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const wishlistTableBody = document.querySelector('#wishlist-table-full tbody');
        if (!wishlistTableBody) return;

        if (wishlist.length === 0) {
            wishlistTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Your wishlist is empty</td></tr>';
            return;
        }

        wishlistTableBody.innerHTML = wishlist.map(item => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${item.image && item.image !== 'undefined' ? item.image : '../../images/techcity1.jpg'}" alt="${item.name}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                        <span>${item.name}</span>
                    </div>
                </td>
                <td>${item.category}</td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td>
                    <button class="btn btn-primary" onclick="removeFromWishlist('${item.id}')" style="padding: 4px 8px; font-size: 0.8rem; background: var(--danger);">Remove</button>
                </td>
            </tr>
        `).join('');
    }

    function renderWalletView() {
        const wallet = JSON.parse(localStorage.getItem('wallet')) || { balance: 0, transactions: [] };
        const balanceDisplay = document.getElementById('wallet-balance-display');
        const transactionsTable = document.querySelector('#transactions-table tbody');

        if (balanceDisplay) balanceDisplay.textContent = `$${wallet.balance.toFixed(2)}`;

        if (transactionsTable) {
            if (wallet.transactions.length === 0) {
                transactionsTable.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No transactions yet</td></tr>';
            } else {
                transactionsTable.innerHTML = wallet.transactions.slice().reverse().map(t => `
                    <tr>
                        <td><span class="badge ${t.type.toLowerCase()}">${t.type}</span></td>
                        <td>$${t.amount.toFixed(2)}</td>
                        <td>${new Date(t.date).toLocaleDateString()}</td>
                        <td>${t.description}</td>
                    </tr>
                `).join('');
            }
        }
    }

    function updateStats(cart, wishlist, wallet) {
        const cartCountStat = document.getElementById('cart-count-stat');
        const wishlistCountStat = document.getElementById('wishlist-count-stat');
        const walletBalanceStat = document.getElementById('wallet-balance-stat');

        if (cartCountStat) cartCountStat.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (wishlistCountStat) wishlistCountStat.textContent = wishlist.length;
        if (walletBalanceStat) walletBalanceStat.textContent = `$${wallet.balance.toFixed(2)}`;
    }

    // Wallet Top-up Logic
    const topupBtn = document.getElementById('topup-btn');
    const topupAmount = document.getElementById('topup-amount');

    if (topupBtn) {
        topupBtn.addEventListener('click', () => {
            const amount = parseFloat(topupAmount.value);
            if (isNaN(amount) || amount <= 0) {
                alert('Please enter a valid amount');
                return;
            }

            let wallet = JSON.parse(localStorage.getItem('wallet')) || { balance: 0, transactions: [] };
            wallet.balance += amount;
            wallet.transactions.push({
                type: 'Top-up',
                amount: amount,
                date: new Date().toISOString(),
                description: 'Wallet top-up'
            });

            localStorage.setItem('wallet', JSON.stringify(wallet));
            topupAmount.value = '';
            alert(`Successfully topped up $${amount.toFixed(2)}!`);
            renderWalletView();
            updateDashboard();
        });
    }

    // Global function for removing from wishlist on dashboard
    window.removeFromWishlist = function(productId) {
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        wishlist = wishlist.filter(item => item.id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateDashboard();
        renderFullWishlist();
    };

    // Global function to cancel an order
    window.cancelOrder = function(orderId) {
        // Create a styled confirmation modal
        let modal = document.getElementById('cancelOrderModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'cancelOrderModal';
            modal.style.cssText = `
                position: fixed; inset: 0; z-index: 9999;
                display: flex; align-items: center; justify-content: center;
                background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
                padding: 1rem;
            `;
            modal.innerHTML = `
                <div style="background:#fff;border-radius:16px;padding:2rem;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.2);text-align:center;">
                    <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
                    <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem;">Cancel this order?</h3>
                    <p style="color:#64748b;font-size:0.9rem;margin-bottom:1.5rem;line-height:1.6;">
                        Order <strong id="cancel-order-id"></strong> will be permanently cancelled and stock will be restored. This cannot be undone.
                    </p>
                    <div style="display:flex;gap:0.75rem;">
                        <button id="cancelModal-no" style="flex:1;padding:0.75rem;border:1px solid #e2e8f0;border-radius:8px;background:#fff;cursor:pointer;font-weight:600;font-size:0.9rem;">Keep Order</button>
                        <button id="cancelModal-yes" style="flex:1;padding:0.75rem;border:none;border-radius:8px;background:#ef4444;color:#fff;cursor:pointer;font-weight:600;font-size:0.9rem;">Yes, Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        document.getElementById('cancel-order-id').textContent = `#ORD-${orderId}`;
        modal.style.display = 'flex';

        // Close on backdrop
        modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
        document.getElementById('cancelModal-no').onclick = () => modal.style.display = 'none';

        document.getElementById('cancelModal-yes').onclick = async () => {
            const btn = document.getElementById('cancelModal-yes');
            btn.disabled = true;
            btn.textContent = 'Cancelling…';

            try {
                const token = localStorage.getItem('techcity_token');
                const res = await fetch(`${window.TECHCITY_API_BASE || ''}/api/orders/${orderId}/cancel`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                modal.style.display = 'none';

                if (res.ok) {
                    showDashboardToast('✅ Order cancelled successfully');
                    renderOrders();
                    renderAllOrders();
                } else {
                    showDashboardToast(`❌ ${data.message}`, 'error');
                }
            } catch (err) {
                console.error(err);
                showDashboardToast('❌ Network error. Please try again.', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Yes, Cancel';
            }
        };
    };

    function showDashboardToast(msg, type = 'success') {
        let toast = document.getElementById('dashboard-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'dashboard-toast';
            toast.style.cssText = `
                position: fixed; bottom: 24px; right: 24px;
                padding: 12px 20px; border-radius: 10px;
                font-size: 0.88rem; font-weight: 600; z-index: 99999;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                transition: all 0.3s; font-family: 'Inter', sans-serif;
                color: #fff; max-width: 320px;
            `;
            document.body.appendChild(toast);
        }
        toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
        toast.textContent = msg;
        toast.style.display = 'block';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 4000);
    }

    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
        if (['cart', 'wishlist', 'orders', 'wallet', 'support_tickets', 'user_settings', 'techcity_user'].includes(e.key)) {
            updateDashboard();
            const activeSection = document.querySelector('.nav-item.active').dataset.section;
            if (activeSection === 'wallet') renderWalletView();
            if (activeSection === 'orders') renderAllOrders();
            if (activeSection === 'wishlist') renderFullWishlist();
            if (activeSection === 'support') renderSupportView();
            if (activeSection === 'settings') renderSettingsView();
        }
    });

    // Initial load
    updateDashboard();

    // Simulated data fetching
    console.log("User Dashboard Initialized for:", userData ? userData.username : "Guest");
});
