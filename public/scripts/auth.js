// auth.js
// Handles login and registration API requests

const API_BASE_URL = (window.TECHCITY_API_BASE || '') + '/api/auth';

// =====================================
// USER-SCOPED LOCALSTORAGE HELPERS
// These prevent data from leaking between different user accounts
// =====================================
const USER_DATA_KEYS = ['cart', 'wishlist', 'orders', 'wallet', 'support_tickets', 'user_settings'];

/**
 * Save all generic user data keys into a namespace for the given userId.
 * e.g. 'cart' -> 'user_42_cart'
 */
function saveUserDataToNamespace(userId) {
    if (!userId) return;
    USER_DATA_KEYS.forEach(key => {
        const val = localStorage.getItem(key);
        if (val !== null) {
            localStorage.setItem(`user_${userId}_${key}`, val);
        }
    });
}

/**
 * Restore the given user's namespaced data into the generic keys.
 * If the user has no saved data, the generic keys are set to empty defaults.
 */
function restoreUserDataFromNamespace(userId) {
    const defaults = {
        cart: '[]',
        wishlist: '[]',
        orders: '[]',
        wallet: JSON.stringify({ balance: 0, transactions: [] }),
        support_tickets: '[]',
        user_settings: JSON.stringify({ emailNotif: true, fa: false })
    };
    USER_DATA_KEYS.forEach(key => {
        const saved = localStorage.getItem(`user_${userId}_${key}`);
        localStorage.setItem(key, saved !== null ? saved : defaults[key]);
    });
}

/**
 * Clear all generic user data keys (used after logout so next user starts clean).
 */
function clearGenericUserData() {
    USER_DATA_KEYS.forEach(key => localStorage.removeItem(key));
}

/**
 * Full logout: save current user data to namespace, wipe generic keys and auth tokens.
 */
function performLogout() {
    const userData = JSON.parse(localStorage.getItem('techcity_user') || '{}');
    if (userData && userData.id) {
        saveUserDataToNamespace(userData.id);
    }
    clearGenericUserData();
    localStorage.removeItem('techcity_token');
    localStorage.removeItem('techcity_user');
}

// Make logout available globally for other scripts
window.performLogout = performLogout;

document.addEventListener('DOMContentLoaded', () => {
    
    // =====================================
    // LOGIN FORM LOGIC
    // =====================================
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent full page reload

            const usernameInput = document.getElementById('user').value;
            const passwordInput = document.getElementById('pass').value;

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: usernameInput, password: passwordInput })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Login successful!');

                    // --- STEP 1: Capture Guest Data & Clear Generic Data
                    const guestCart = JSON.parse(localStorage.getItem('cart') || '[]');
                    const guestWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                    clearGenericUserData();

                    // --- STEP 2: Store the JWT token and user profile
                    localStorage.setItem('techcity_token', data.token);
                    
                    const userToStore = {
                        ...data.user,
                        profilePic: data.user.profile_pic
                    };
                    localStorage.setItem('techcity_user', JSON.stringify(userToStore));

                    // --- STEP 3: Restore & Merge Data
                    let finalCart = data.user.cart_data || [];
                    if (guestCart.length > 0) {
                        // Merge guest cart: add items that aren't already in user's cart
                        guestCart.forEach(gItem => {
                            const exists = finalCart.find(uItem => uItem.id == gItem.id);
                            if (exists) {
                                exists.quantity = (exists.quantity || 1) + (gItem.quantity || 1);
                            } else {
                                finalCart.push(gItem);
                            }
                        });
                    }
                    localStorage.setItem('cart', JSON.stringify(finalCart));

                    let finalWishlist = data.user.wishlist_data || [];
                    if (guestWishlist.length > 0) {
                        guestWishlist.forEach(gItem => {
                            if (!finalWishlist.some(uItem => uItem.id == gItem.id)) {
                                finalWishlist.push(gItem);
                            }
                        });
                    }
                    localStorage.setItem('wishlist', JSON.stringify(finalWishlist));

                    // --- STEP 4: Sync merged data back to server
                    await syncUserDataToServer(data.token);
                    
                    // --- STEP 5: Redirect based on user role
                    if (data.user && data.user.role === 'admin') {
                        window.location.href = '../dashboards/admin/index.html';
                    } else if (data.user && data.user.role === 'user') {
                        window.location.href = '../dashboards/user/index.html';
                    } else {
                        window.location.href = '../index.html';
                    }
                } else {
                    alert('Login failed: ' + data.message);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('A network error occurred. Is the backend running?');
            }
        });
    }

    // =====================================
    // REGISTER FORM LOGIC
    // =====================================
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                return alert('Passwords do not match!');
            }

            try {
                const response = await fetch(`${API_BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        full_name: fullname, 
                        username: username, 
                        email: email, 
                        password: password 
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Registration successful! Please log in.');
                    window.location.href = '../login/index.html';
                } else {
                    alert('Registration failed: ' + data.message);
                }
            } catch (error) {
                console.error('Error during registration:', error);
                alert('A network error occurred. Is the backend running?');
            }
        });
    }

    // =====================================
    // CHECK LOGIN STATUS HELPER
    // =====================================
    const updateHeaderUI = () => {
        const token = localStorage.getItem('techcity_token');
        const userData = JSON.parse(localStorage.getItem('techcity_user'));
        const headerActions = document.querySelector('.header-actions');
        
        if (token && headerActions) {
            // Change login/register buttons to personalized dashboard link
            const loginBtn = document.querySelector('a[href="/login/index.html"], a[href="../login/index.html"], a[href="../../login/index.html"]');
            const registerBtn = document.querySelector('a[href="/register/index.html"], a[href="../register/index.html"], a[href="../../register/index.html"]');
            
            if (loginBtn && userData) {
                // Determine dashboard path based on role and current page depth
                const dashPath = userData.role === 'admin' ? '/dashboards/admin/index.html' : '/dashboards/user/index.html';
                
                loginBtn.innerHTML = `<i class="fas fa-user-circle"></i> Welcome, ${userData.username}`;
                loginBtn.href = dashPath;
                loginBtn.classList.add('user-welcome-link');
                
                if (registerBtn) {
                    registerBtn.textContent = 'Logout';
                    registerBtn.href = '#';
                    registerBtn.onclick = (e) => {
                        e.preventDefault();
                        performLogout();
                        window.location.href = '/index.html';
                    };
                }
            }
        }
    };

    /**
     * Restore user data from DB if token exists but localStorage might be stale/cleared
     */
    const fetchAndRestoreUserData = async () => {
        const token = localStorage.getItem('techcity_token');
        if (!token) return;

        try {
            const res = await fetch((window.TECHCITY_API_BASE || '') + '/api/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                
                // Update user profile (pic)
                const currentUser = JSON.parse(localStorage.getItem('techcity_user') || '{}');
                const updatedUser = {
                    ...currentUser,
                    id: data.id,
                    username: data.username,
                    role: data.role,
                    profilePic: data.profile_pic
                };
                localStorage.setItem('techcity_user', JSON.stringify(updatedUser));

                // Restore cart and wishlist ONLY if localStorage is empty 
                // (or we can overwrite, but usually we want to preserve current session if exists)
                if (data.cart_data && (!localStorage.getItem('cart') || localStorage.getItem('cart') === '[]')) {
                    localStorage.setItem('cart', JSON.stringify(data.cart_data));
                    if (window.updateCartCount) window.updateCartCount();
                }
                if (data.wishlist_data && (!localStorage.getItem('wishlist') || localStorage.getItem('wishlist') === '[]')) {
                    localStorage.setItem('wishlist', JSON.stringify(data.wishlist_data));
                }
                
                updateHeaderUI();
                // If on dashboard, update its UI too
                if (window.updateDashboard) window.updateDashboard();
            } else if (res.status === 403 || res.status === 401) {
                // Token invalid, clear it
                performLogout();
                window.location.href = '/login/index.html';
            }
        } catch (err) {
            console.warn("Failed to restore user data from server:", err.message);
        }
    };

    updateHeaderUI();
    fetchAndRestoreUserData();
});

// =====================================
// SYNC USER DATA TO BACKEND
// Call this whenever cart/wishlist/profile pic changes
// =====================================
async function syncUserDataToServer(token) {
    token = token || localStorage.getItem('techcity_token');
    if (!token) return; // Not logged in, skip

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const userData = JSON.parse(localStorage.getItem('techcity_user') || '{}');
    const profile_pic = userData.profilePic || null;

    try {
        await fetch((window.TECHCITY_API_BASE || '') + '/api/user/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cart, wishlist, profile_pic })
        });
    } catch (err) {
        console.warn('Could not sync user data to server:', err.message);
    }
}

// Auto-sync whenever localStorage changes (cart/wishlist/profile updates)
window.addEventListener('storage', (e) => {
    if (['cart', 'wishlist', 'techcity_user'].includes(e.key)) {
        syncUserDataToServer();
    }
});

// Make it globally available for other scripts
window.syncUserDataToServer = syncUserDataToServer;
