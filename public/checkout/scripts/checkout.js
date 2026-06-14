document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const token = localStorage.getItem('techcity_token');

    if (!token) {
        window.location.href = '/login/index.html';
        return;
    }
    if (cart.length === 0) {
        window.location.href = '/';
        return;
    }

    renderOrderSummary(cart);
    updateTotals(cart);

    // Delivery change listeners
    document.querySelectorAll('input[name="deliveryOption"]').forEach(r =>
        r.addEventListener('change', () => updateTotals(cart))
    );

    // Live form validation
    ['fullName','phone','address','city'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('blur', () => validateField(el));
            el.addEventListener('input', () => {
                if (el.classList.contains('invalid')) validateField(el);
            });
        }
    });

    // Form submit
    document.getElementById('checkoutForm').addEventListener('submit', handleSubmit);
});

function validateField(el) {
    const valid = el.value.trim().length > 0;
    el.classList.toggle('invalid', !valid);
    return valid;
}

function validateForm() {
    const fields = ['fullName','phone','address','city'].map(id => {
        const el = document.getElementById(id);
        return validateField(el);
    });
    return fields.every(Boolean);
}

async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const token = localStorage.getItem('techcity_token');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const placeOrderBtnDesktop = document.getElementById('placeOrderBtnDesktop');
    const btnLabel = document.getElementById('btn-label');
    const btnLoading = document.getElementById('btn-loading');

    // Disable buttons and show loading
    [placeOrderBtn, placeOrderBtnDesktop].forEach(btn => { if (btn) btn.disabled = true; });
    if (btnLabel) btnLabel.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'flex';

    const shippingAddress = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        zipCode: document.getElementById('zipCode').value
    };
    const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingFee = deliveryOption === 'Pickup' ? 0 : deliveryOption === 'Express' ? 25 : 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shippingFee + tax;

    try {
        const res = await fetch((window.TECHCITY_API_BASE || '') + '/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
                total_price: total,
                shipping_address: shippingAddress,
                delivery_option: deliveryOption,
                payment_method: paymentMethod
            })
        });

        const result = await res.json();

        if (res.ok) {
            localStorage.removeItem('cart');
            if (window.syncUserDataToServer) window.syncUserDataToServer();

            // Show success modal
            const modal = document.getElementById('successModal');
            const orderEl = document.getElementById('successOrderId');
            if (orderEl) orderEl.textContent = `#${result.order.id}`;
            if (modal) modal.style.display = 'flex';

            // Mark progress steps complete
            document.getElementById('step1')?.classList.add('done');
            document.getElementById('step2')?.classList.add('done');
            document.getElementById('step3')?.classList.add('active');
        } else {
            showError(result.message || 'Something went wrong. Please try again.');
            resetBtn();
        }
    } catch (err) {
        console.error(err);
        showError('Network error. Please check your connection and try again.');
        resetBtn();
    }

    function resetBtn() {
        [placeOrderBtn, placeOrderBtnDesktop].forEach(btn => { if (btn) btn.disabled = false; });
        if (btnLabel) btnLabel.style.display = 'flex';
        if (btnLoading) btnLoading.style.display = 'none';
    }
}

function showError(msg) {
    let toast = document.getElementById('co-error-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'co-error-toast';
        toast.style.cssText = `
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
            background: #ef4444; color: #fff; padding: 12px 24px; border-radius: 10px;
            font-size: 0.9rem; font-weight: 600; z-index: 99999;
            box-shadow: 0 4px 20px rgba(239,68,68,0.35);
            animation: slideUp 0.3s ease;
            font-family: 'Inter', sans-serif;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = `⚠️ ${msg}`;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 5000);
}

function renderOrderSummary(cart) {
    const container = document.getElementById('checkoutItems');
    const countEl = document.getElementById('co-item-count');
    if (!container) return;

    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    if (countEl) countEl.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;

    container.innerHTML = cart.map(item => `
        <div class="co-item">
            <div class="co-item-img-wrap">
                <img src="${item.image || '/images/techcity1.jpg'}" alt="${item.name}" class="co-item-img"
                     onerror="this.src='/images/techcity1.jpg'">
                <span class="co-item-qty">${item.quantity}</span>
            </div>
            <div class="co-item-info">
                <div class="co-item-name">${item.name}</div>
                <div class="co-item-meta">$${parseFloat(item.price).toFixed(2)} each</div>
            </div>
            <div class="co-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
}

function updateTotals(cart) {
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const sel = document.querySelector('input[name="deliveryOption"]:checked');
    const deliveryOption = sel ? sel.value : 'Standard';
    const shippingFee = deliveryOption === 'Pickup' ? 0 : deliveryOption === 'Express' ? 25 : 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shippingFee + tax;

    document.getElementById('subtotalPrice').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shippingPrice').textContent = shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`;
    document.getElementById('taxPrice').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('totalPrice').textContent = `$${total.toFixed(2)}`;
}
