// Shopping Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Product added to cart!');
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    }
}

// Render cart
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p style="font-weight: 500; margin-bottom: 0.5rem;">Your cart is empty</p>
                <p style="font-size: 0.875rem;">Add some products to get started</p>
                <button class="btn btn-primary" onclick="closeCart()" style="margin-top: 1rem;">Continue Shopping</button>
            </div>
        `;
        cartFooter.innerHTML = '';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-content">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <h3 class="cart-item-name">${item.name}</h3>
                        <button class="icon-btn" onclick="removeFromCart('${item.id}')" style="width: 1.5rem; height: 1.5rem; margin-top: -0.25rem;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <span style="width: 2rem; text-align: center;">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;

    cartFooter.innerHTML = `
        <div class="cart-summary">
            <div class="cart-summary-row">
                <span style="color: var(--muted-foreground);">Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="cart-summary-row">
                <span style="color: var(--muted-foreground);">Shipping</span>
                <span>$${shipping.toFixed(2)}</span>
            </div>
            <div class="cart-summary-row">
                <span style="color: var(--muted-foreground);">Tax (10%)</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="cart-summary-row total">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
        <button class="btn btn-primary btn-full" onclick="checkout()">Proceed to Checkout</button>
    `;
}

// Show/hide cart
function openCart() {
    document.getElementById('cartDrawer').classList.add('active');
    renderCart();
}

function closeCart() {
    document.getElementById('cartDrawer').classList.remove('active');
}

// Checkout
function checkout() {
    alert('STILL UNDER DEVELOPMENT');
    console.log('Checkout with items:', cart);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 5rem;
        right: 1rem;
        background: var(--card);
        border: 1px solid var(--card-border);
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Initialize cart
updateCartCount();
