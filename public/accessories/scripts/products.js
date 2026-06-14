const products = [
    {
        id: '1',
        name: 'SMART GLASSES',
        price: 14.99,
        images: ['images/glss2.WEBP', 'images/glasses 3.avif', 'images/glasses 4.webp'],
        rating: 4,
        category: 'accessories',
        badge: 'Featured',
        specs: [
            "Bluetooth 5.0",
            "Built-in speakers",
            "Touch control",
            "8 hours battery life"
        ]
    },
    {
        id: '2',
        name: 'F11 2.0 MICROPHONE',
        price: 15.00,
        images: ['images/f11.webp'],
        rating: 5,
        category: 'accessories',
        specs: [
            "Condenser microphone",
            "2.0 channel audio",
            "USB plug & play",
            "Noise reduction"
        ]
    },
    {
        id: '3',
        name: 'ORAIMO SMART WATCH',
        price: 45.00,
        images: ['images/smtwa.WEBP'],
        rating: 3,
        category: 'accessories',
        specs: [
            "Heart rate monitoring",
            "Step & sleep tracking",
            "Bluetooth connectivity",
            "Rechargeable battery"
        ]
    },
    {
        id: '4',
        name: 'X3 SMART CONTROLLER',
        price: 40.00,
        images: ['images/x3 2.webp'],
        rating: 3,
        category: 'accessories',
        specs: [
            "Wireless controller",
            "Android & PC compatible",
            "Ergonomic design",
            "Rechargeable battery"
        ]
    },
    {
        id: '5',
        name: 'CAMO GAMING HEADSET',
        price: 45.00,
        images: ['images/camo headset2.jpg'],
        rating: 4,
        category: 'accessories',
        specs: [
            "Surround sound",
            "Noise-isolating microphone",
            "Comfortable ear cushions",
            "3.5mm audio jack"
        ]
    },
    {
        id: '6',
        name: 'RGB MOUSE + KEYBOARD',
        price: 40.00,
        images: ['images/keyboard.WEBP'],
        rating: 4,
        category: 'smartphones',
        specs: [
            "RGB backlighting",
            "USB wired connection",
            "Gaming-grade keys",
            "High-precision mouse"
        ]
    },
    {
        id: '7',
        name: 'COOLER PAD',
        price: 145.00,
        images: ['images/cooler pad.avif'],
        rating: 5,
        category: 'accessories',
        specs: [
            "High-speed cooling fans",
            "USB powered",
            "Adjustable height",
            "Compatible with most laptops"
        ]
    },
    {
        id: '8',
        name: 'AIRPODS PRO',
        price: 15.00,
        images: ['images/airpods2.webp'],
        rating: 5,
        category: 'accessories',
        specs: [
            "Wireless earbuds",
            "Active noise cancellation",
            "Charging case included",
            "Bluetooth connectivity"
        ]
    },
    {
        id: '9',
        name: 'LED PROJECTOR',
        price: 145.00,
        images: ['images/projector.jpg'],
        rating: 5,
        category: 'accessories',
        specs: [
            "HD projection",
            "HDMI & USB input",
            "Built-in speaker",
            "Portable design"
        ]
    },
    {
        id: '10',
        name: 'LOGITECH WEB CAM',
        price: 145.00,
        images: ['images/web cam.jpg'],
        rating: 5,
        category: 'accessories',
        specs: [
            "HD video recording",
            "Built-in microphone",
            "USB plug & play",
            "Low-light correction"
        ]
    },
    {
        id: '11',
        name: 'LAPTOP STAND',
        price: 145.00,
        images: ['images/laptop stand.jpg'],
        rating: 5,
        category: 'accessories',
        specs: [
            "Adjustable height",
            "Aluminum alloy build",
            "Improves airflow",
            "Foldable design"
        ]
    },
    {
        id: '12',
        name: 'TP-LINK ROUTER',
        price: 145.00,
        images: ['images/tp link.webp'],
        rating: 5,
        category: 'accessories',
        specs: [
            "High-speed Wi-Fi",
            "Multiple device support",
            "Easy setup",
            "Stable network coverage"
        ]
    },
    {
        id: '13',
        name: 'EVENT HORIZON BT SPEAKER',
        price: 145.00,
        images: ['images/eventhorizon3.jpg'],
        rating: 5,
        category: 'accessories',
        specs: [
            "Bluetooth speaker",
            "Deep bass sound",
            "Rechargeable battery",
            "Portable design"
        ]
    },
    {
        id: '14',
        name: '11 IN 1 USB ADAPTER',
        price: 145.00,
        images: ['images/adpt.jpg'],
        rating: 5,
        category: 'accessories',
        specs: [
            "11-in-1 ports",
            "USB-C compatible",
            "Fast data transfer",
            "Aluminum casing"
        ]
    },
    {
        id: '15',
        name: 'LAPTOP STAND',
        price: 145.00,
        images: ['images/laptop stand.jpg'],
        rating: 5,
        category: 'accessories',
        specs: [
            "Portable laptop stand",
            "Anti-slip base",
            "Lightweight design",
            "Heat dissipation support"
        ]
    },
    {
        id: '16',
        name: 'SAMSUNG A51s',
        price: 1299.99,
        images: ['images/a51s2.jpg'],
        rating: 4,
        category: 'laptops',
        badge: ''
    },
    {
        id: '17',
        name: 'REDMI',
        price: 999.99,
        images: ['images/redmi.jpg'],
        rating: 5,
        category: 'smartphones'
    },
    {
        id: '18',
        name: 'INFINIX',
        price: 450.99,
        images: ['images/infinix.png'],
        rating: 3,
        category: 'accessories'
    },
    {
        id: '19',
        name: 'ZTE BLADE',
        price: 660.99,
        images: ['images/zte.WEBP'],
        rating: 3,
        category: 'accessories'
    },
    {
        id: '20',
        name: 'ITEL S25 ULTRA',
        price: 200.00,
        images: ['images/itelS25.WEBP'],
        rating: 4,
        category: 'smartphones'
    },
    {
        id: '21',
        name: 'TECNO CAMON 40',
        price: 320.00,
        images: ['images/camon40.jpg'],
        rating: 4,
        category: 'smartphones'
    },
    {
        id: '22',
        name: 'TECNO SPARK 10',
        price: 144.99,
        images: ['images/spark10.jpg'],
        rating: 4.5,
        category: 'smartphones'
    },
    {
        id: '23',
        name: 'TECNO POP 7',
        price: 144.99,
        images: ['images/pop7 2.jpg'],
        rating: 5,
        category: 'smartphones'
    },
    {
        id: '24',
        name: 'TECNO POP 8',
        price: 144.99,
        images: ['images/pop8.png'],
        rating: 5,
        category: 'smartphones'
    },
    {
        id: '25',
        name: 'TECNO POP 9',
        price: 180.00,
        images: ['images/pop9.jpeg'],
        rating: 5,
        category: 'smartphones'
    },
    {
        id: '26',
        name: 'REDMI 14C',
        price: 215.00,
        images: ['images/redmi 14c.WEBP'],
        rating: 4,
        category: 'smartphones'
    },
    {
        id: '27',
        name: 'SAMSUNG A51',
        price: 144.99,
        images: ['images/a51 2.jpg'],
        rating: 5,
        category: 'smartphones'
    },
    {
        id: '28',
        name: 'SAMSUNG GALAXY TAB',
        price: 144.99,
        images: ['images/galaxy tab.jpg'],
        rating: 5,
        category: 'smartphones'
    },
    {
        id: '29',
        name: 'FIRE HD KIDS TAB',
        price: 144.99,
        images: ['images/kids tab.avif'],
        rating: 5,
        category: 'smartphones'
    },
    {
        id: '30',
        name: 'AIRTAB',
        price: 144.99,
        images: ['images/airtab2.jpg'],
        rating: 5,
        category: 'smartphones'
    }
];
const ITEMS_PER_PAGE = 15;

// Function to render star ratings
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="${i <= rating ? 'star-filled' : 'star-empty'}">★</span>`;
    }
    return stars;
}

// Create individual product card HTML
function createProductCard(product) {
    return `
    <div class="product-card fade-in" style="position: relative;">
        ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
        <button class="wishlist-btn" data-id="${product.id}" onclick="toggleWishlist('${product.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06 a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </button>
        <div class="product-card-inner">
            <div class="product-info-main">
                <div class="product-image-wrapper">
                    <img src="${product.images[0]}" alt="${product.name}" class="product-image" id="product-img-${product.id}">
                    <button class="quick-view" onclick="showQuickView('${product.id}')">Quick View</button>
                    <button class="add-to-cart-hover" onclick="addToCart('${product.id}')">Add to Cart</button>
                </div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">${renderStars(product.rating)}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-action-icons-corner">
                    <span title="Quick View" onclick="showQuickView('${product.id}')" class="icon-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </span>
                    <span title="Add to Cart" onclick="addToCart('${product.id}')" class="icon-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"></path>
                        </svg>
                    </span>
                </div>
            </div>
            ${product.specs && product.specs.length > 0 ? `
            <div class="product-specs-overlay">
                <ul class="specs-list">
                    ${product.specs.map(spec => `<li>• ${spec}</li>`).join('')}
                </ul>
            </div>` : ''}
        </div>
    </div>
    `;
}

// Wishlist toggle function
function toggleWishlist(productId) {
    const btn = document.querySelector(`.wishlist-btn[data-id="${productId}"]`);
    if (btn) btn.classList.toggle('active');
    console.log('Wishlist toggled for product:', productId);
}

// Filter products by category
function getProductsByCategory(category) {
    if (!category || category === 'all') return products;
    return products.filter(p => p.category === category);
}

// Quick view modal global
let modalProductId = null;

// Show quick view modal
function showQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    modalProductId = productId;

    document.getElementById('modalProductName').innerText = product.name;

    const modalImageContainer = document.getElementById('modalProductImageContainer');
    const modalDetails = document.getElementById('modalProductDetails');

    // Build slideshow
    modalImageContainer.innerHTML = `
        ${product.images.map((img, i) => `<img src="${img}" class="modal-slide ${i === 0 ? 'active' : ''}">`).join('')}
        <button class="prev-slide">◀</button>
        <button class="next-slide">▶</button>
    `;

    let slideIndex = 0;
    const slides = modalImageContainer.querySelectorAll('.modal-slide');

    // Slide buttons
    modalImageContainer.querySelector('.next-slide').onclick = () => {
        slides[slideIndex].classList.remove('active');
        slideIndex = (slideIndex + 1) % slides.length;
        slides[slideIndex].classList.add('active');
    };

    modalImageContainer.querySelector('.prev-slide').onclick = () => {
        slides[slideIndex].classList.remove('active');
        slideIndex = (slideIndex - 1 + slides.length) % slides.length;
        slides[slideIndex].classList.add('active');
    };

    // Render product details
    modalDetails.innerHTML = `
        <ul>
            <li>Price: $${product.price.toFixed(2)}</li>
            <li>Category: ${product.category}</li>
            <li>Rating: ${renderStars(product.rating)}</li>
            ${product.specs ? product.specs.map(spec => `<li>${spec}</li>`).join('') : '<li>No specifications available.</li>'}
        </ul>
    `;

    // Show modal
    document.getElementById('quickViewModal').style.display = 'flex';

    // --- ZOOM OVERLAY ---
    const zoomOverlay = document.getElementById('imageZoomOverlay');
    const zoomedImage = document.getElementById('zoomedImage');

    slides.forEach(slide => {
        // Use click instead of hover to prevent flicker
        slide.onclick = () => {
            zoomedImage.src = slide.src;
            zoomOverlay.style.display = 'flex';
        };
    });

    // Close overlay on click
    zoomOverlay.onclick = () => {
        zoomOverlay.style.display = "none";
    };
}

// Close modal
function closeQuickView() {
    document.getElementById('quickViewModal').style.display = 'none';
}




// Automatically rotate product images
function startCardImageRotation() {
    products.forEach(product => {
        if (product.images && product.images.length > 1) {
            let index = 0;
            const imgEl = document.getElementById(`product-img-${product.id}`);
            if (!imgEl) return;

            setInterval(() => {
                index = (index + 1) % product.images.length;
                imgEl.src = product.images[index];
            }, 3000);
        }
    });
}

// DOMContentLoaded - main initialization
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('allProducts');
    const pagination = document.querySelector('.pagination');
    let currentPage = 1;

    function renderProducts() {
        if (!container) return;
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const productsToRender = products.slice(startIndex, endIndex);
        container.innerHTML = productsToRender.map(p => createProductCard(p)).join('');

        if (pagination) {
            const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
            pagination.querySelectorAll('button').forEach(btn => {
                const pageVal = btn.dataset.page;
                if (pageVal == currentPage) {
                    btn.classList.add('btn-primary');
                    btn.classList.remove('btn-secondary');
                } else if (pageVal !== 'prev' && pageVal !== 'next') {
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-secondary');
                }
            });
        }

        startCardImageRotation(); // Restart rotation for newly rendered products
    }

    if (pagination) {
        pagination.addEventListener('click', e => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const page = btn.dataset.page;
            const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

            if (page === 'prev' && currentPage > 1) currentPage--;
            else if (page === 'next' && currentPage < totalPages) currentPage++;
            else if (!isNaN(page)) currentPage = Number(page);

            renderProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    renderProducts();

    // Render featured products
    const featuredContainer = document.getElementById('featuredProducts');
    if (featuredContainer) {
        const featuredProducts = products.filter(p => p.badge === 'Featured').slice(0, 4);
        featuredContainer.innerHTML = featuredProducts.map(p => createProductCard(p)).join('');
    }
});






// Render function with optional filtering
function renderProductsList(productList) {
    const container = document.getElementById('allProducts');
    if (!container) return;
    container.innerHTML = productList.map(p => createProductCard(p)).join('');
}

// Price filter
const priceRange = document.getElementById('priceRange');
const minPriceDisplay = document.getElementById('minPrice'); // left
const maxPriceDisplay = document.getElementById('maxPrice'); // right

const MIN_PRICE = 0;
const MAX_PRICE = 500; // set the maximum price of your products

priceRange.min = MIN_PRICE;
priceRange.max = MAX_PRICE;
priceRange.value = MIN_PRICE; // start slider at left (0)

// Display initial values
minPriceDisplay.textContent = `$${priceRange.value}`; // left updates with slider
maxPriceDisplay.textContent = `$${MAX_PRICE}`;        // right always shows max

// Update filter on slider input
priceRange.addEventListener('input', () => {
    const currentValue = Number(priceRange.value);
    minPriceDisplay.textContent = `$${currentValue.toFixed(2)}`; // update left value
    maxPriceDisplay.textContent = `$${MAX_PRICE}`;               // right stays max

    const filtered = products.filter(p => p.price >= MIN_PRICE && p.price <= currentValue);
    renderProductsList(filtered);
});

function filterProducts(category) {
    if (category === 'all') {
        renderProductsList(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        renderProductsList(filtered);
    }
}

// Initial render
renderProductsList(products);