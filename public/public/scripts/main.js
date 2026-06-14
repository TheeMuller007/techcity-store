// Main JavaScript

// Mobile menu toggle
document.getElementById('mobileMenuBtn')?.addEventListener('click', function() {
    const nav = document.getElementById('mainNav');
    nav.classList.toggle('active');
});

// Cart drawer
document.getElementById('cartBtn')?.addEventListener('click', openCart);
document.getElementById('closeCartBtn')?.addEventListener('click', closeCart);
document.querySelector('.cart-backdrop')?.addEventListener('click', closeCart);

// Search functionality
let searchOpen = false;
document.getElementById('searchBtn')?.addEventListener('click', function() {
    searchOpen = !searchOpen;
    if (searchOpen) {
        const searchBar = document.createElement('div');
        searchBar.className = 'search-bar';
        searchBar.innerHTML = `
            <input type="search" placeholder="Search products..." class="search-input" id="searchInput" autofocus>
            <button class="icon-btn" onclick="closeSearch()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        this.parentElement.insertBefore(searchBar, this);
        this.style.display = 'none';
    }
});

function closeSearch() {
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
        searchBar.remove();
        document.getElementById('searchBtn').style.display = 'flex';
        searchOpen = false;
    }
}

// Set active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

// Add CSS for mobile menu
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 767px) {
        .nav.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--background);
            border-bottom: 1px solid var(--border);
            padding: 1rem;
            box-shadow: var(--shadow-lg);
        }
    }
    
    .search-bar {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        animation: fadeIn 0.3s ease-out;
    }
    
    .search-input {
        width: 16rem;
        padding: 0.5rem 1rem;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        font-size: 0.875rem;
        font-family: var(--font-sans);
    }
    
    .search-input:focus {
        outline: none;
        border-color: var(--primary);
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);
