/* PRODUCTS SCRIPT - DYNAMIC DB VERSION */

// State
let products = [];
window.products = products; // expose globally for search
let currentPage = 1;
const ITEMS_PER_PAGE = 15; // Reverting to original page size
let fetchError = null;

/**
 * Define rendering functions globally
 */
window.renderProducts = function() {
    console.log("renderProducts execution started.");
    const container = document.getElementById('allProducts') || document.getElementById('productContainer') || document.getElementById('categoryProducts');
    if (!container) return;

    if (fetchError) {
        container.innerHTML = `
            <div style="color:red;text-align:center;padding:50px;">
                Failed to load products. <br>
                <small style="color:#6b7280;">Error: ${fetchError}</small><br>
                <button class="btn btn-primary" style="margin-top:10px;" onclick="location.reload()">Try Again</button>
            </div>`;
        return;
    }

    if (products.length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px;">Loading products...</div>';
        return;
    }

    const pathname = window.location.pathname.toLowerCase();
    const pathMatch = pathname.match(/(laptops|smartphones|tablets|accessories|printers|bags)/);
    const activeCategory = pathMatch ? pathMatch[0] : null;

    let filtered = products;
    if (activeCategory) {
        filtered = products.filter(p => {
            if (!p.category) return false;
            const cat = p.category.toLowerCase().trim();
            if (activeCategory === 'bags' && (cat.includes('bag') || cat.includes('satchel'))) return true;
            return cat === activeCategory || 
                   cat === activeCategory.replace(/s$/, '') || 
                   activeCategory === cat.replace(/s$/, '');
        });
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const productsToRender = filtered.slice(startIndex, endIndex);

    container.innerHTML = productsToRender.map(p => createProductCard(p)).join('');
    updatePaginationUI(filtered.length);
    startCardImageRotation(productsToRender);
};

function createProductCard(product, hideSpecs = false) {
    const images = (product.images && Array.isArray(product.images) && product.images.length > 0) 
                   ? product.images 
                   : (product.image ? [product.image] : ['/images/placeholder.jpg']);
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const isWishlisted = wishlist.some(item => item.id == product.id);
    
    // REVERTING TO ORIGINAL HTML STRUCTURE & BUTTONS AS REQUESTED
    return `
    <div class="product-card fade-in" style="position: relative;">
        ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
        <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" onclick="toggleWishlist('${product.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06 a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </button>
        <div class="product-card-inner">
            <div class="product-info-main" style="display: grid; grid-template-columns: 1fr auto; align-items: center;">
                <div class="product-image-wrapper" style="grid-column: 1 / -1;">
                    <img src="${images[0]}" alt="${product.name}" class="product-image" id="product-img-${product.id}" onerror="this.src='/images/placeholder.jpg'">
                    <button class="quick-view" onclick="event.preventDefault(); event.stopPropagation(); showQuickView('${product.id}')">Quick View</button>
                    ${product.stock_quantity > 0 ? 
                        `<button class="add-to-cart-hover" onclick="addToCart('${product.id}')">Add to Cart</button>` : 
                        `<button class="add-to-cart-hover out-of-stock" disabled style="background: #ccc; cursor: not-allowed;">Out of Stock</button>`
                    }
                </div>
                <h3 class="product-title" style="grid-column: 1 / -1;">${product.name}</h3>
                <div class="product-rating" style="grid-column: 1 / -1;">${renderStars(product.rating)}</div>
                <div class="product-price" style="grid-column: 1; margin-bottom: 0;">$${parseFloat(product.price).toFixed(2)}</div>
                <div class="product-action-icons-corner" style="grid-column: 2; margin-bottom: 0;">
                    <span title="Quick View" onclick="event.preventDefault(); event.stopPropagation(); showQuickView('${product.id}')" class="icon-btn">
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
            ${!hideSpecs && product.specs && Array.isArray(product.specs) && product.specs.length > 0 ? `
            <div class="product-specs-overlay">
                <ul class="specs-list">
                    ${product.specs.slice(0, 4).map(s => `<li>• ${s}</li>`).join('')}
                </ul>
            </div>` : ''}
        </div>
    </div>`;
}
window.createProductCard = createProductCard; // expose for search bar

function renderStars(rating) {
    const r = parseFloat(rating) || 5;
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="${i <= r ? 'star-filled' : 'star-empty'}">★</span>`;
    }
    return stars;
}

function updatePaginationUI(totalItems) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) { pagination.innerHTML = ''; return; }
    let html = `<button class="btn btn-secondary" onclick="changePage('prev')" ${currentPage === 1 ? 'disabled' : ''}>Prev</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="changePage(${i})">${i}</button>`;
    }
    html += `<button class="btn btn-secondary" onclick="changePage('next')" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    pagination.innerHTML = html;
}

window.changePage = function(p) {
    if (p === 'prev') currentPage--;
    else if (p === 'next') currentPage++;
    else currentPage = p;
    window.renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function startCardImageRotation(renderedProducts) {
    renderedProducts.forEach(product => {
        const images = product.images;
        if (images && images.length > 1) {
            const imgEl = document.getElementById(`product-img-${product.id}`);
            if (!imgEl) return;
            let idx = 0;
            if (imgEl._rotator) clearInterval(imgEl._rotator);
            imgEl._rotator = setInterval(() => {
                idx = (idx + 1) % images.length;
                imgEl.src = images[idx];
            }, 3000);
        }
    });
}

async function fetchProducts() {
    try {
        const res = await fetch(`${window.TECHCITY_API_BASE || ''}/api/products?t=${Date.now()}`);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `Server responded with ${res.status}`);
        }
        products = await res.json();
        window.products = products; // keep global reference in sync
        fetchError = null;
        window.renderProducts();
        
        const track = document.getElementById('featuredTrack');
        if (track && products.length > 0) {
            let featured = products.filter(p => p.badge && p.badge.toLowerCase().includes('featured'));
            
            // Fallback: if no products are explicitly 'featured', just take the highest rated or first 5
            if (featured.length === 0) {
                featured = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
            }
            
            if (featured.length > 0) {
                // Repeat to ensure there are enough items to scroll nicely
                track.innerHTML = featured.map(p => {
                    // Remove 'Featured' text for the slider badges on home page
                    const pForSlider = { ...p };
                    if (pForSlider.badge && pForSlider.badge.toLowerCase() === 'featured') {
                        pForSlider.badge = '';
                    }
                    return createProductCard(pForSlider, true);
                }).join('').repeat(4);
            } else {
                track.innerHTML = '<div style="padding: 20px;">No featured products available.</div>';
            }
        }
    } catch (err) {
        console.error("fetchProducts error:", err);
        fetchError = err.message;
        window.renderProducts();
    }
}

fetchProducts();

window.showQuickView = function(id) {
    const product = (window.products || []).find(p => p.id == id);
    if (!product) return;
    
    const existingModal = document.getElementById('quickViewModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    let modal = document.createElement('div');
    modal.id = 'quickViewModal';
    modal.style.cssText = `
        display: none; 
        position: fixed; 
        inset: 0; 
        background: rgba(15, 23, 42, 0.7); 
        z-index: 9999; 
        align-items: center; 
        justify-content: center; 
        padding: 20px; 
        backdrop-filter: blur(8px);
        animation: fadeIn 0.4s ease;
    `;
    
    if (!document.getElementById('quickViewStyles')) {
        const style = document.createElement('style');
        style.id = 'quickViewStyles';
        style.textContent = `
            #quickViewModal div::-webkit-scrollbar { width: 6px; }
            #quickViewModal div::-webkit-scrollbar-track { background: transparent; }
            #quickViewModal div::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            #quickViewModal div::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `;
        document.head.appendChild(style);
    }
    
    modal.innerHTML = `
        <div style="background: white; padding: 0; border-radius: 24px; width: 95%; max-width: 1100px; height: 85vh; max-height: 850px; overflow: hidden; position: relative; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.3); display: grid; grid-template-columns: 1fr 1fr;">
            <button id="modalCloseBtn" style="position: absolute; right: 24px; top: 24px; background: white; border: none; font-size: 1rem; cursor: pointer; color: #64748b; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div style="background: #fdfdfd; display: flex; flex-direction: column; border-right: 1px solid #f1f5f9; overflow-y: auto;">
                <div style="position: relative; background: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 12px 24px 0 24px; min-height: 200px;">
                    <div id="modalProductImageContainer" style="width: 100%;"></div>
                </div>
                
                <div style="padding: 4px 40px 24px 40px; background: white;">
                    <h2 id="modalProductName" style="margin: 0 0 10px 0; font-size: 2rem; font-weight: 800; color: #0f172a; line-height: 1.2;"></h2>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                        <div id="modalProductPrice" style="font-size: 1.8rem; font-weight: 700; color: #0f172a;"></div>
                        <div id="modalStockStatus"></div>
                    </div>
                    <p id="modalProductDescription" style="margin: 0; color: #64748b; line-height: 1.6; font-size: 1rem;"></p>
                </div>
            </div>
            
            <div style="padding: 50px; overflow-y: auto; display: flex; flex-direction: column; background: #f8fafc; scrollbar-width: thin;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <span id="modalProductCategory" style="font-size: 0.85rem; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.1em;"></span>
                    <div style="display: flex; gap: 2px; color: #fbbf24; font-size: 1rem;" id="modalProductRating"></div>
                </div>

                <div id="modalProductDetails" style="flex: 1;"></div>
                
                <div style="margin-top: 40px; display: flex; flex-direction: column; gap: 15px;">
                    <button class="btn btn-primary" id="modalAddToCartBtn" style="width: 100%; padding: 20px; font-size: 1.15rem; border-radius: 16px; border: none; background: #0f172a; color: white; cursor: pointer; font-weight: 700; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> Add to Cart
                    </button>
                    <div style="text-align: center; color: #94a3b8; font-size: 0.85rem; font-weight: 500; display: flex; justify-content: center; align-items: center; gap: 5px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Official TechCity Warranty
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Safe Escape listener
    const escapeListener = (e) => {
        if (e.key === 'Escape') {
            closeQuickView();
            document.removeEventListener('keydown', escapeListener);
        }
    };
    document.addEventListener('keydown', escapeListener);

    // Event binding for close
    document.getElementById('modalCloseBtn').onclick = (e) => {
        e.stopPropagation();
        closeQuickView();
    };

    if (window.event) {
        window.event.stopPropagation();
        window.event.preventDefault();
    }

    try {
        console.log("[QuickView] Rendering product:", product.name);
        const images = (product.images && Array.isArray(product.images) && product.images.length > 0) 
                       ? product.images 
                       : (product.image ? [product.image] : ['/images/placeholder.jpg']);
        
        const addToCartBtn = document.getElementById('modalAddToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.onclick = () => {
                if (typeof addToCart === 'function') addToCart(product.id);
                closeQuickView();
            };
            if (product.stock_quantity <= 0) {
                addToCartBtn.disabled = true;
                addToCartBtn.style.background = '#ccc';
                addToCartBtn.innerText = 'Out of Stock';
            } else {
                addToCartBtn.disabled = false;
                addToCartBtn.style.background = '#000';
                addToCartBtn.innerText = 'Add to Cart';
            }
        }
        
        document.getElementById('modalProductName').innerText = product.name;
        document.getElementById('modalProductCategory').innerText = product.category || 'Uncategorized';
        document.getElementById('modalProductDescription').innerText = product.description || '';
        document.getElementById('modalProductRating').innerHTML = renderStars(product.rating);
        
        const price = parseFloat(product.price);
        document.getElementById('modalProductPrice').innerHTML = `
            $${price.toFixed(2)}
            <span style="font-size: 1rem; color: #94a3b8; text-decoration: line-through; font-weight: 400; margin-left: 10px;">$${(price * 1.2).toFixed(2)}</span>
            <span id="modalOriginalPrice" style="display:none;"></span>
            <span id="modalDiscountBadge" style="display:none;"></span>
        `;
        const originalPriceEl = document.getElementById('modalOriginalPrice');
        const discountBadgeEl = document.getElementById('modalDiscountBadge');
        if (originalPriceEl && discountBadgeEl) {
            if (product.discount) {
                originalPriceEl.style.display = 'inline';
                discountBadgeEl.style.display = 'inline';
                discountBadgeEl.innerText = `-${product.discount}%`;
            } else {
                originalPriceEl.style.display = 'none';
                discountBadgeEl.style.display = 'none';
            }
        }
        
        const specsList = document.getElementById('modalSpecsList');
        if (specsList) {
            if (product.specs && Array.isArray(product.specs)) {
                specsList.innerHTML = product.specs.map(spec => `<li>• ${spec}</li>`).join('');
            } else {
                specsList.innerHTML = '<li>No specifications available</li>';
            }
        }

        const stockEl = document.getElementById('modalStockStatus');
        if (product.stock_quantity > 0) {
            stockEl.innerHTML = `
                <span style="background: #ecfdf5; color: #059669; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                    <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                    In Stock (${product.stock_quantity})
                </span>
                <style>@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }</style>
            `;
        } else {
            stockEl.innerHTML = `
                <span style="background: #fef2f2; color: #dc2626; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                    <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></div>
                    Out of Stock
                </span>
            `;
        }

        let productSpecsArray = product.specs;
        if (typeof productSpecsArray === 'string') {
            try { productSpecsArray = JSON.parse(productSpecsArray); } catch(e) { productSpecsArray = []; }
        }
        
        const detailsContainer = document.getElementById('modalProductDetails');
        if (Array.isArray(productSpecsArray) && productSpecsArray.length > 0) {
            detailsContainer.innerHTML = `
                <div style="background: white; border-radius: 20px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <h3 style="margin: 0 0 20px 0; font-size: 0.9rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-list-ul" style="color: #6366f1;"></i> Key Features
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                        ${productSpecsArray.map(spec => `
                            <div style="display: flex; align-items: flex-start; gap: 12px;">
                                <div style="width: 22px; height: 22px; background: #eff6ff; color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                                    <i class="fas fa-check" style="font-size: 0.75rem;"></i>
                                </div>
                                <span style="font-size: 0.95rem; color: #1e293b; font-weight: 500; line-height: 1.4;">${spec}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            detailsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; background: white; border-radius: 20px; border: 2px dashed #e2e8f0;">
                    <p style="color: #94a3b8; font-style: italic;">Detailed specifications for this product are currently being updated.</p>
                </div>
            `;
        }

        const imgContainer = document.getElementById('modalProductImageContainer');
        let currentImageIndex = 0;
        
        const renderSlider = () => {
            imgContainer.innerHTML = `
                <div style="position: relative; width: 100%; height: 220px; display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 8px; overflow: hidden;">
                    <img src="${images[currentImageIndex]}" style="max-width: 100%; max-height: 100%; object-fit: contain; cursor: pointer;" onclick="event.stopPropagation(); openFullScreenImage('${images[currentImageIndex]}')" onerror="this.src='/images/placeholder.jpg'">
                    ${images.length > 1 ? `
                        <button id="qvPrev" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                        <button id="qvNext" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
                        <div style="position: absolute; bottom: 15px; display: flex; gap: 8px; justify-content: center; width: 100%;">
                            ${images.map((_, i) => `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${i === currentImageIndex ? '#6366f1' : 'rgba(0,0,0,0.2)'}; transition: all 0.3s;"></div>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;

            if (images.length > 1) {
                document.getElementById('qvPrev').onclick = (e) => {
                    e.stopPropagation();
                    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
                    renderSlider();
                };
                document.getElementById('qvNext').onclick = (e) => {
                    e.stopPropagation();
                    currentImageIndex = (currentImageIndex + 1) % images.length;
                    renderSlider();
                };
            }
        };
        
        renderSlider();
        modal.style.display = 'flex';
        
        // Setup backdrop click listener safely
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeQuickView();
            }
        };
        
        document.body.style.overflow = 'hidden';

        const track = document.getElementById('featuredTrack');
        if (track) track.style.animationPlayState = 'paused';
    } catch (err) {
        console.error("[QuickView] Critical Render error:", err);
        // Don't close immediately in debug mode so we can see the error
        // closeQuickView(); 
    }
};

window.openFullScreenImage = function(src) {
    let fs = document.getElementById('fullScreenViewer');
    if (fs) {
        fs.remove(); // Recreate it to avoid event listener ghosting
    }
    
    fs = document.createElement('div');
    fs.id = 'fullScreenViewer';
    fs.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(5px); opacity: 0; transition: opacity 0.3s ease;';
    fs.innerHTML = `
        <img id="fsImage" src="${src}" style="max-width: 90%; max-height: 90%; object-fit: contain; box-shadow: 0 0 50px rgba(0,0,0,0.5); border-radius: 4px;" />
        <button id="fsCloseBtn" style="position: absolute; right: 30px; top: 30px; background: rgba(255,255,255,0.1); border: none; font-size: 2rem; cursor: pointer; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;
    document.body.appendChild(fs);
    
    const closeFs = () => {
        fs.style.opacity = '0';
        setTimeout(() => fs.remove(), 300);
    };

    document.getElementById('fsCloseBtn').onclick = (e) => {
        e.stopPropagation();
        closeFs();
    };

    fs.onclick = (e) => {
        if (e.target === fs || e.target.tagName === 'IMG') {
            closeFs();
        }
    };
    
    fs.style.display = 'flex';
    void fs.offsetWidth; // Force reflow
    fs.style.opacity = '1';
};

window.closeQuickView = () => {
    console.log("[QuickView] closeQuickView called");
    const modal = document.getElementById('quickViewModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    document.body.style.overflow = '';

    const track = document.getElementById('featuredTrack');
    if (track) track.style.animationPlayState = 'running';

    const fs = document.getElementById('fullScreenViewer');
    if (fs) {
        fs.style.opacity = '0';
        setTimeout(() => fs.style.display = 'none', 300);
    }
};


window.toggleWishlist = function(id) {
    const token = localStorage.getItem('techcity_token');
    if (!token) { alert("Please login to use wishlists"); return; }
    
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const product = products.find(p => p.id == id);
    if (!product) return;

    const index = wishlist.findIndex(item => item.id == id);
    const btns = document.querySelectorAll(`.wishlist-btn[data-id="${id}"]`);

    if (index === -1) {
        wishlist.push({ id: product.id, name: product.name, price: product.price, image: (product.images ? product.images[0] : product.image), category: product.category });
        btns.forEach(btn => btn.classList.add('active'));
    } else {
        wishlist.splice(index, 1);
        btns.forEach(btn => btn.classList.remove('active'));
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    if (window.syncUserDataToServer) window.syncUserDataToServer();
};

document.addEventListener('DOMContentLoaded', () => {
    window.renderProducts();
    const searchInput = document.getElementById('searchInput') || document.getElementById('shopSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(query));
            const container = document.getElementById('allProducts') || document.getElementById('productContainer') || document.getElementById('categoryProducts');
            if (container) container.innerHTML = filtered.map(p => createProductCard(p)).join('');
        });
    }

    // Featured Slider Controls
    const featuredContainer = document.getElementById('featuredProductsContainer');
    const featuredTrack = document.getElementById('featuredTrack');
    const prevBtn = document.getElementById('featuredPrev');
    const nextBtn = document.getElementById('featuredNext');

    if (featuredContainer && prevBtn && nextBtn) {
        const scrollAmount = 300;
        
        nextBtn.addEventListener('click', () => {
            // If track is animating, we might want to pause it or scroll the container
            // Since it's a marquee with transform, scrolling the container might not work as expected
            // if the animation is active. Let's try scrolling the container first.
            featuredContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            
            // Optional: Pause animation on interaction
            if (featuredTrack) featuredTrack.style.animationPlayState = 'paused';
        });

        prevBtn.addEventListener('click', () => {
            featuredContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            if (featuredTrack) featuredTrack.style.animationPlayState = 'paused';
        });
    }
});