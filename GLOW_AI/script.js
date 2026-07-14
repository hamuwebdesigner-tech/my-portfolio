/* ==========================================================================
   MOCK PRODUCT DATA (8 Premium AI Beauty Products)
   ========================================================================== */
const BEAUTY_PRODUCTS = [
    {
        id: "gai-01",
        name: "Lumina-9 Adaptive DNA Serum",
        category: "skincare",
        price: 98.00,
        rating: 4.9,
        reviews: 148,
        badge: "AI Signature",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "gai-02",
        name: "Hydra-Cellular Active Cream",
        category: "skincare",
        price: 82.00,
        rating: 4.8,
        reviews: 104,
        badge: "Bestseller",
        image: "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "gai-03",
        name: "Bio-Matrix Peptide Serum",
        category: "skincare",
        price: 115.00,
        rating: 5.0,
        reviews: 62,
        badge: "Highly Concentrated",
        image: "https://images.unsplash.com/photo-1610961798912-2593457a412c?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "gai-04",
        name: "Neural-Tone Brightening Corrector",
        category: "makeup",
        price: 54.00,
        rating: 4.7,
        reviews: 93,
        badge: "Patented Formula",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "gai-05",
        name: "Liquid Velvet Pigment Balm",
        category: "makeup",
        price: 36.00,
        rating: 4.6,
        reviews: 79,
        badge: "Climate Shield",
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "gai-06",
        name: "Follicle-Synthesizer Root Complex",
        category: "haircare",
        price: 72.00,
        rating: 4.9,
        reviews: 112,
        badge: "Dermatological",
        image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "gai-07",
        name: "Keratin Repair Nourishing Mist",
        category: "haircare",
        price: 48.00,
        rating: 4.5,
        reviews: 58,
        badge: "Silicone Free",
        image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "gai-08",
        name: "Micro-Dermal Exfoliating Glaze",
        category: "skincare",
        price: 64.00,
        rating: 4.8,
        reviews: 130,
        badge: "Cellular renewal",
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80"
    }
];

/* ==========================================================================
   CART STATE & SESSION STORES
   ========================================================================== */
let shoppingCart = JSON.parse(localStorage.getItem('glowai_active_cart')) || [];

// Save adjustments back to user local storage
function persistCartState() {
    localStorage.setItem('glowai_active_cart', JSON.stringify(shoppingCart));
    renderDrawerItems();
    updateCartUIComponents();
}

/* ==========================================================================
   APPLICATION ENTRYPOINT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Elements
    const productsGrid = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    // UI Panels Drawer Toggles
    const cartOpenBtn = document.getElementById('cartOpenBtn');
    const cartCloseBtn = document.getElementById('cartCloseBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const emptyCartShopBtn = document.getElementById('emptyCartShopBtn');
    
    // Responsive Navigation Bar
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    // Forms
    const contactForm = document.getElementById('contactForm');

    // Initialize Grid with Data
    renderProductsToGrid(BEAUTY_PRODUCTS);
    persistCartState(); // Sync and render cart elements on page load

    /* Events */
    
    // Dynamic Categories Filters
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            filterProductsEngine();
        });
    });

    // Real-Time Search Bar Filter
    searchInput.addEventListener('input', filterProductsEngine);

    // Cart Drawer Toggle Functionality
    cartOpenBtn.addEventListener('click', toggleCartDrawer);
    cartCloseBtn.addEventListener('click', toggleCartDrawer);
    cartOverlay.addEventListener('click', toggleCartDrawer);
    emptyCartShopBtn.addEventListener('click', toggleCartDrawer);

    // Responsive Mobile Menu Handler
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
    });

    // Automatic close mobile nav list on links clicks
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            // Setup visual links highlight toggle
            document.querySelectorAll('.nav-item').forEach(li => li.classList.remove('active'));
            link.classList.add('active');
            
            navMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-xmark');
        });
    });

    // Form Handling Submit Simulation
    if (contactForm) {
        contactForm.addEventListener('submit', simulateDiagnosticFormSubmit);
    }
});

/* ==========================================================================
   PRODUCTS RENDER & SEARCH/FILTER SYSTEM
   ========================================================================== */
function renderProductsToGrid(items) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (items.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1.5rem; color: var(--color-text-secondary)">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; margin-bottom: 1.5rem; color: var(--color-accent-gold)"></i>
                <p>No matching formulations located in our clinical system.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = items.map(product => `
        <article class="product-card">
            <div class="card-img-container">
                <span class="card-tag">${product.badge}</span>
                <img class="card-img" src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="card-details">
                <span class="card-category">${product.category}</span>
                <h3 class="card-name">${product.name}</h3>
                <div class="card-row">
                    <span class="card-price">$${product.price.toFixed(2)}</span>
                    <div class="card-rating">
                        <i class="fa-solid fa-star"></i>
                        <span>${product.rating} (${product.reviews})</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="addProductToBag('${product.id}')">Add To Selection</button>
            </div>
        </article>
    `).join('');
}

function filterProductsEngine() {
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    const activeCategory = document.querySelector('.filter-tab.active').getAttribute('data-filter');

    const filtered = BEAUTY_PRODUCTS.filter(product => {
        const matchSearch = product.name.toLowerCase().includes(searchVal) || 
                            product.category.toLowerCase().includes(searchVal);
        const matchCategory = activeCategory === 'all' || product.category === activeCategory;
        return matchSearch && matchCategory;
    });

    renderProductsToGrid(filtered);
}

/* ==========================================================================
   CART SYSTEM OPERATIONS
   ========================================================================== */
function toggleCartDrawer() {
    document.getElementById('cartDrawer').classList.toggle('active');
    document.getElementById('cartOverlay').classList.toggle('active');
}

function addProductToBag(id) {
    const matchedProduct = BEAUTY_PRODUCTS.find(p => p.id === id);
    const existingIndex = shoppingCart.findIndex(item => item.id === id);

    if (existingIndex > -1) {
        shoppingCart[existingIndex].qty += 1;
    } else {
        shoppingCart.push({ ...matchedProduct, qty: 1 });
    }
    
    persistCartState();
    toggleCartDrawer(); // Automatically slides over the side cart to showcase successfully added selection
}

function adjustCartQuantity(id, delta) {
    const matchedIndex = shoppingCart.findIndex(item => item.id === id);
    if (matchedIndex > -1) {
        shoppingCart[matchedIndex].qty += delta;
        if (shoppingCart[matchedIndex].qty <= 0) {
            shoppingCart.splice(matchedIndex, 1);
        }
        persistCartState();
    }
}

function removeProductFromCart(id) {
    shoppingCart = shoppingCart.filter(item => item.id !== id);
    persistCartState();
}

function updateCartUIComponents() {
    const cartCounter = document.getElementById('cartCounter');
    const totalCount = shoppingCart.reduce((accum, curr) => accum + curr.qty, 0);
    cartCounter.textContent = totalCount;
}

function renderDrawerItems() {
    const itemsContainer = document.getElementById('cartItemsContainer');
    const subtotalDisplay = document.getElementById('cartSubtotal');
    
    if (shoppingCart.length === 0) {
        itemsContainer.innerHTML = `
            <div class="empty-cart-state">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Your shopping bag is currently empty.</p>
                <a href="#products" class="btn btn-secondary btn-sm" onclick="toggleCartDrawer()">Explore Products</a>
            </div>
        `;
        subtotalDisplay.textContent = "$0.00";
        return;
    }

    itemsContainer.innerHTML = shoppingCart.map(item => `
        <div class="cart-line-item">
            <img class="cart-line-img" src="${item.image}" alt="${item.name}">
            <div class="cart-line-content">
                <h4 class="cart-line-name">${item.name}</h4>
                <div class="cart-line-price">$${item.price.toFixed(2)}</div>
                <div class="cart-line-controls">
                    <div class="qty-stepper">
                        <button class="stepper-btn" onclick="adjustCartQuantity('${item.id}', -1)">-</button>
                        <span class="qty-display">${item.qty}</span>
                        <button class="stepper-btn" onclick="adjustCartQuantity('${item.id}', 1)">+</button>
                    </div>
                    <button class="remove-item-btn" onclick="removeProductFromCart('${item.id}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    const calculatedSubtotal = shoppingCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    subtotalDisplay.textContent = `$${calculatedSubtotal.toFixed(2)}`;
}

/* ==========================================================================
   CONCIERGE FORM SIMULATION
   ========================================================================== */
function simulateDiagnosticFormSubmit(e) {
    e.preventDefault();
    const feedbackEl = document.getElementById('formFeedback');
    
    feedbackEl.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Processing biological telemetry...`;
    feedbackEl.className = "form-feedback";

    setTimeout(() => {
        feedbackEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Analysis request submitted. Our diagnostics team will respond in under 2 hours.`;
        feedbackEl.className = "form-feedback success";
        document.getElementById('contactForm').reset();
    }, 1800);
}