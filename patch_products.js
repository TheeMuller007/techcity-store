const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'scripts', 'products.js');
let content = fs.readFileSync(filePath, 'utf8');

// ─── FIX 1: Add normalizeProduct before createProductCard ───────────────────
const oldCardFn = '// Create individual product card HTML\nfunction createProductCard(product) {\n    return `';
const newCardFn = `// Normalize product so it always has an 'images' array
function normalizeProduct(product) {
    if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
        product.images = product.image ? [product.image] : [];
    }
    return product;
}

// Create individual product card HTML
function createProductCard(product) {
    product = normalizeProduct(product);
    return \``;

if (content.includes(oldCardFn.replace(/\n/g, '\r\n'))) {
    content = content.replace(oldCardFn.replace(/\n/g, '\r\n'), newCardFn.replace(/\n/g, '\r\n'));
    console.log('✓ Fix 1 applied (CRLF)');
} else if (content.includes(oldCardFn)) {
    content = content.replace(oldCardFn, newCardFn);
    console.log('✓ Fix 1 applied (LF)');
} else {
    console.log('✗ Fix 1: could not find createProductCard function start');
}

// ─── FIX 2: Replace everything from '// Price filter' to end of file ─────────
const priceSectionMarker = '// Price filter';
const idx = content.indexOf(priceSectionMarker);

// Also check for the filterProducts function that might come before price filter
const filterFnMarker = 'function filterProducts(category) {';
const filterIdx = content.indexOf(filterFnMarker);

// We want to cut from whichever comes first
const cutFrom = (filterIdx !== -1 && filterIdx < idx) ? filterIdx : idx;

if (cutFrom !== -1) {
    content = content.substring(0, cutFrom);

    const newBottom = `function filterProducts(category) {
    if (category === 'all') {
        renderProductsList(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        renderProductsList(filtered);
    }
}

// Price filter & search - safely wired up after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const MIN_PRICE = 0;
    const MAX_PRICE = 1500;

    const priceRange = document.getElementById('priceRange');
    const minPriceDisplay = document.getElementById('minPrice');
    const maxPriceDisplay = document.getElementById('maxPrice');

    if (priceRange && minPriceDisplay && maxPriceDisplay) {
        priceRange.min = MIN_PRICE;
        priceRange.max = MAX_PRICE;
        priceRange.value = MAX_PRICE;

        minPriceDisplay.textContent = '$' + MIN_PRICE;
        maxPriceDisplay.textContent = '$' + MAX_PRICE;

        priceRange.addEventListener('input', () => {
            const currentValue = Number(priceRange.value);
            maxPriceDisplay.textContent = '$' + currentValue;
            const filtered = products.filter(p => p.price <= currentValue);
            renderProductsList(filtered);
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            if (query === '') {
                renderProductsList(products);
                return;
            }
            const results = products.filter(p => p.name.toLowerCase().includes(query));
            renderProductsList(results);
        });
    }
});
`;
    content = content + newBottom;
    console.log('✓ Fix 2 applied - replaced global price filter and searchInput code');
} else {
    console.log('✗ Fix 2: could not find price filter section');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ products.js saved successfully');
