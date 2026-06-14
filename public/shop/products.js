const products = [
    {
        id: '1',
        name: 'HP OMEN 16',
        price: 1299.99,
        image: 'images/shop/omen 16.jpg',
        rating: 4,
        category: 'laptops',
        badge: 'Featured'
    },
    {
        id: '2',
        name: 'Samsung S25',
        price: 999.99,
        image: 'images/shop/s25.jpg',
        rating: 5,
        category: 'smartphones'
    },
    {
        id: '3',
        name: 'All in 1 HP MONITOR',
        price: 450.99,
        image: 'images/shop/All in 1 hp.png',
        rating: 3,
        category: 'accessories'
    },
    {
        id: '4',
        name: 'Gaming CPU',
        price: 350.99,
        image: 'images/shop/cpu.jpg',
        rating: 4,
        category: 'accessories'
    },
    {
        id: '5',
        name: 'Wireless Headphones',
        price: 60.99,
        image: 'images/shop/headset.jpg',
        rating: 3,
        category: 'accessories'
    },
    {
        id: '6',
        name: 'Tech Bag',
        price: 15.00,
        image: 'images/shop/hpbag.webp',
        rating: 4,
        category: 'bags'
    },
    {
        id: '7',
        name: 'Tecno Camon 40',
        price: 400.00,
        image: 'images/shop/camon40.jpg',
        rating: 5,
        category: 'smartphones'
    },
    {
        id: '8',
        name: 'Infinix note 50 Pro',
        price: 299.99,
        image: 'images/shop/infinix50.jpg',
        rating: 5,
        category: 'smartphones'
    }
];
// Render star rating
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="${i <= rating ? 'star-filled' : 'star-empty'}">★</span>`;
    }
    return stars;
}

// Create product card
function createProductCard(product) {
    return `
        <div class="product-card fade-in">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <button class="wishlist-btn" data-id="${product.id}" onclick="toggleWishlist('${product.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image">
            </div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-rating">${renderStars(product.rating)}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="btn btn-primary btn-full" onclick="addToCart('${product.id}')">Add to Cart</button>
        </div>
    `;
}

// Toggle wishlist
function toggleWishlist(productId) {
    const btn = document.querySelector(`.wishlist-btn[data-id="${productId}"]`);
    btn.classList.toggle('active');
    console.log('Wishlist toggled for product:', productId);
}

// Get products by category
function getProductsByCategory(category) {
    if (!category || category === 'all') {
        return products;
    }
    return products.filter(p => p.category === category);
}

// Load featured products on home page
if (document.getElementById('featuredProducts')) {
    const featuredProducts = products.slice(0, 4);
    document.getElementById('featuredProducts').innerHTML = featuredProducts
        .map(product => createProductCard(product))
        .join('');
}

// Load all products on shop page
if (document.getElementById('allProducts')) {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const displayProducts = getProductsByCategory(category);
    
    document.getElementById('allProducts').innerHTML = displayProducts
        .map(product => createProductCard(product))
        .join('');
}
