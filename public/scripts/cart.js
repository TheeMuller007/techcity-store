/**
 * TECH CITY - Premium Cart System (Bulletproof Version)
 * This script handles cart injection, management, and UI.
 */

// 1. GLOBAL STATE & FUNCTIONS EXPOSURE
// We define these immediately so they are available even before DOMContentLoaded
window.cart = JSON.parse(localStorage.getItem('cart')) || [];

/**
 * Show/hide cart drawer
 */
window.openCart = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    console.log("[Cart] openCart triggered");
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
        drawer.classList.add('active');
        if (window.renderCart) window.renderCart();
    } else {
        console.error("[Cart] Critical Error: cartDrawer element not found!");
        // Attempt re-injection as a fallback
        if (window.injectCartHTML) {
            window.injectCartHTML();
            setTimeout(() => {
                const retryDrawer = document.getElementById('cartDrawer');
                if (retryDrawer) {
                    retryDrawer.classList.add('active');
                    if (window.renderCart) window.renderCart();
                }
            }, 100);
        }
    }
};

window.closeCart = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    console.log("[Cart] closeCart triggered");
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
        drawer.classList.remove('active');
    }
};

/**
 * Add product to cart
 */
window.addToCart = function(productId) {
    console.log("[Cart] addToCart triggered for ID:", productId);
    
    const allProducts = window.products || [];
    const product = allProducts.find(p => p.id == productId);
    
    if (!product) {
        console.error("[Cart] Product not found in window.products. ID:", productId);
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: (product.images && product.images.length > 0) ? product.images[0] : (product.image || ''),
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.cart = cart; // Keep memory in sync
    
    if (window.updateCartCount) window.updateCartCount();
    if (window.showNotification) window.showNotification('Product added to cart!');
    if (window.syncUserDataToServer) window.syncUserDataToServer();
    
    // Optional: open cart automatically to show progress
    // window.openCart();
};

/**
 * Update cart count badge
 */
window.updateCartCount = function() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = count;
    }
};

/**
 * Remove from cart
 */
window.removeFromCart = function(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id != productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.cart = cart;
    
    window.updateCartCount();
    window.renderCart();
    if (window.syncUserDataToServer) window.syncUserDataToServer();
};

/**
 * Update quantity
 */
window.updateQuantity = function(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(i => i.id == productId);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);
        localStorage.setItem('cart', JSON.stringify(cart));
        window.cart = cart;
        
        window.updateCartCount();
        window.renderCart();
        if (window.syncUserDataToServer) window.syncUserDataToServer();
    }
};

/**
 * Render cart items and footer
 */
window.renderCart = function() {
    try {
        const cartItems = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');
        const cartSubtitle = document.getElementById('cartSubtitle');
        const shippingProgress = document.getElementById('shippingProgress');
        
        if (!cartItems) return;

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (cartSubtitle) {
            cartSubtitle.textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`;
        }

        // Shipping Progress Logic
        if (shippingProgress) {
            const threshold = 100;
            const remaining = Math.max(0, threshold - subtotal);
            const percent = Math.min(100, (subtotal / threshold) * 100);
            
            shippingProgress.innerHTML = `
                <div class="shipping-progress-text">
                    <span>${remaining > 0 ? `Spend $${remaining.toFixed(2)} more for FREE shipping` : 'You\'ve unlocked FREE shipping!'}</span>
                    <span>$${threshold.toFixed(0)}</span>
                </div>
                <div class="shipping-progress-track">
                    <div class="shipping-progress-bar ${percent >= 100 ? 'complete' : ''}" style="width: ${percent}%"></div>
                </div>
            `;
            shippingProgress.style.display = cart.length === 0 ? 'none' : 'block';
        }

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty-premium fade-in" style="text-align: center; padding: 3rem 1rem;">
                    <i class="fas fa-shopping-bag" style="font-size: 4rem; color: #e2e8f0; margin-bottom: 1.5rem;"></i>
                    <h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem;">Your cart is empty</h3>
                    <p style="color: #64748b; margin-bottom: 2rem;">Looks like you haven't added anything to your cart yet.</p>
                    <button class="checkout-btn-premium" onclick="closeCart()" style="width: auto; padding: 1rem 2rem;">
                        Start Shopping
                    </button>
                </div>
            `;
            if (cartFooter) cartFooter.innerHTML = '';
            return;
        }

        cartItems.innerHTML = cart.map(item => {
            const allProds = window.products || [];
            const product = allProds.find(p => p.id == item.id);
            const displayImage = item.image || (product && product.images ? product.images[0] : '/images/techcity1.jpg');
            
            return `
            <div class="cart-item fade-in">
                <div class="cart-item-content" style="display: flex; gap: 1rem; align-items: center;">
                    <img src="${displayImage}" alt="${item.name}" class="cart-item-image" style="width: 80px; height: 80px; object-fit: cover; border-radius: 12px; border: 1px solid #f1f5f9;" onerror="this.src='/images/placeholder.jpg'">
                    <div class="cart-item-details" style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <h3 class="cart-item-name" style="font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0;">${item.name}</h3>
                            <button class="icon-btn" onclick="removeFromCart('${item.id}')" style="color: #94a3b8; border: none; background: transparent; cursor: pointer;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <p class="cart-item-price" style="font-weight: 600; color: #0f172a; margin: 0.25rem 0;">$${(item.price * item.quantity).toFixed(2)}</p>
                        <div class="cart-item-quantity" style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem;">
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)" style="width: 24px; height: 24px; border: 1px solid #e2e8f0; border-radius: 6px; background: white; cursor: pointer;">-</button>
                            <span style="font-size: 0.875rem; font-weight: 600;">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)" style="width: 24px; height: 24px; border: 1px solid #e2e8f0; border-radius: 6px; background: white; cursor: pointer;">+</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

        const tax = subtotal * 0.1;
        const shipping = subtotal > 100 ? 0 : 10;
        const total = subtotal + tax + shipping;

        if (cartFooter) {
            cartFooter.innerHTML = `
                <div class="cart-summary" style="background: #f8fafc; padding: 1.5rem; border-radius: 16px; margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem; color: #64748b;">
                        <span>Subtotal</span>
                        <span style="color: #1e293b; font-weight: 600;">$${subtotal.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem; color: #64748b;">
                        <span>Shipping</span>
                        <span style="color: ${shipping === 0 ? '#10b981' : '#1e293b'}; font-weight: 600;">${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.875rem; color: #64748b;">
                        <span>Estimated Tax</span>
                        <span style="color: #1e293b; font-weight: 600;">$${tax.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 1.1rem; font-weight: 800; color: #0f172a;">
                        <span>Grand Total</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
                <button class="checkout-btn-premium" onclick="checkout()" style="width: 100%; padding: 1.25rem; background: #0ea5e9; color: white; border: none; border-radius: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.3);">
                    Proceed to Checkout <i class="fas fa-arrow-right" style="margin-left: 8px;"></i>
                </button>
            `;
        }
    } catch (err) {
        console.error("[Cart] renderCart failure:", err);
    }
};

/**
 * Global Notification System
 */
window.showNotification = function(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 2rem; right: 2rem; background: #0ea5e9; color: white;
        padding: 1rem 1.5rem; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        z-index: 10001; animation: slideIn 0.3s ease-out; font-weight: 600; font-size: 0.9rem;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981; margin-right: 8px;"></i> ${message}`;
    
    // Add slideIn animation if not exists
    if (!document.getElementById('cart-notif-style')) {
        const s = document.createElement('style');
        s.id = 'cart-notif-style';
        s.textContent = `
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
        document.head.appendChild(s);
    }
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

/**
 * Inject Cart HTML if missing
 */
window.injectCartHTML = function() {
    if (document.getElementById('cartDrawer')) {
        console.log("[Cart] cartDrawer already exists, skipping injection.");
        return;
    }
    
    console.log("[Cart] Injecting cartDrawer HTML...");
    const div = document.createElement('div');
    div.innerHTML = `
        <div id="cartDrawer" class="cart-drawer">
            <div class="cart-backdrop"></div>
            <div class="cart-content">
                <div class="cart-header" id="cartHeader">
                    <div class="cart-header-top" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <h2 style="margin: 0; font-size: 1.35rem; font-weight: 800; color: #0f172a;">Shopping Cart</h2>
                        <button class="icon-btn" id="closeCartBtn" style="border: none; background: transparent; cursor: pointer; color: #64748b; font-size: 1.25rem;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="cart-header-subtitle" id="cartSubtitle" style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">0 items</div>
                    <div class="shipping-progress-container" id="shippingProgress" style="margin-top: 1rem;"></div>
                </div>
                <div class="cart-items" id="cartItems" style="flex: 1; overflow-y: auto; padding: 1.5rem;"></div>
                <div class="cart-footer" id="cartFooter" style="padding: 1.5rem; border-top: 1px solid #f1f5f9;"></div>
            </div>
        </div>
    `;
    
    // Append all nodes from the div to document.body
    while (div.firstChild) {
        document.body.appendChild(div.firstChild);
    }
};

/**
 * Checkout logic
 */
window.checkout = function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    window.location.href = '/checkout/index.html';
};

// 2. INITIALIZATION & DELEGATED LISTENERS
(function init() {
    console.log("[Cart] Script starting...");
    
    // Run injection immediately
    window.injectCartHTML();
    
    // Also run on DOMContentLoaded just in case body wasn't ready
    document.addEventListener('DOMContentLoaded', () => {
        console.log("[Cart] DOMContentLoaded reached");
        window.injectCartHTML();
        window.updateCartCount();
        
        // GLOBAL DELEGATED CLICK HANDLER
        document.body.addEventListener('click', (e) => {
            const target = e.target;
            
            // Cart Button (Open)
            const cartBtn = target.closest('#cartBtn');
            if (cartBtn) {
                console.log("[Cart] cartBtn clicked via delegation");
                window.openCart(e);
                return;
            }
            
            // Close Cart Button
            const closeBtn = target.closest('#closeCartBtn');
            if (closeBtn) {
                console.log("[Cart] closeCartBtn clicked via delegation");
                window.closeCart(e);
                return;
            }
            
            // Backdrop (Close)
            const backdrop = target.closest('.cart-backdrop');
            if (backdrop) {
                console.log("[Cart] Backdrop clicked via delegation");
                window.closeCart(e);
                return;
            }
            
            // Add to Cart Buttons (by attribute or ID)
            const addBtn = target.closest('[onclick^="addToCart"]');
            if (addBtn && !addBtn.getAttribute('onclick')) {
                // If the element has onclick but it's being blocked or handled here
                // Note: Regular [onclick] attributes usually work fine, but we can catch them here if needed.
            }
        });
    });
    
    console.log("[Cart] Initialization sequence scheduled.");
})();
