
// ========================================
// SCROLL ANIMATION FOR RESTAURANT NAME & ORDER BUTTON
// ========================================

// Throttle function for better scroll performance
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle scroll animation for restaurant name and order-now button
const handleScroll = throttle(function() {
    const header = document.getElementById('header');
    const restaurantName = document.querySelector('.restaurant-name');
    const orderButton = document.getElementById('order-now');
    const scrollPosition = window.scrollY;
    
    // Add/remove scrolled class based on scroll position with hysteresis
    if (scrollPosition > 120) {
        header.classList.add('scrolled');
        if (restaurantName) {
            restaurantName.classList.add('scrolled');
        }
    } else if (scrollPosition < 80) {
        header.classList.remove('scrolled');
        if (restaurantName) {
            restaurantName.classList.remove('scrolled');
        }
    }
    
    // Order-now button scroll animation with hysteresis
    if (orderButton) {
        if (scrollPosition > 220) {
            orderButton.classList.add('scroll-highlight');
            orderButton.classList.remove('scroll-fade');
        } else if (scrollPosition > 70) {
            orderButton.classList.add('scroll-highlight');
            orderButton.classList.remove('scroll-fade');
        } else if (scrollPosition < 30) {
            orderButton.classList.remove('scroll-highlight', 'scroll-fade');
        }
        
        // Add fade effect when scrolled very far with hysteresis
        if (scrollPosition > 620) {
            orderButton.classList.add('scroll-fade');
        } else if (scrollPosition < 580) {
            orderButton.classList.remove('scroll-fade');
        }
    }
}, 16); // ~60fps

window.addEventListener('scroll', handleScroll);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Ensure initial state is correct
    const header = document.getElementById('header');
    const restaurantName = document.querySelector('.restaurant-name');
    const orderButton = document.getElementById('order-now');
    
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
        if (restaurantName) {
            restaurantName.classList.add('scrolled');
        }
    }
    
    // Initialize order button state based on current scroll position
    if (orderButton) {
        const scrollPosition = window.scrollY;
        if (scrollPosition > 200) {
            orderButton.classList.add('scroll-highlight');
        } else if (scrollPosition > 600) {
            orderButton.classList.add('scroll-fade');
        }
    }

    // Load admin content if on homepage
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname.endsWith('/sellSite/')) {
        
        // Load admin recipes and features
        setTimeout(() => {
            const recipes = JSON.parse(localStorage.getItem('homepageRecipes')) || [];
            const features = JSON.parse(localStorage.getItem('homepageFeatures')) || [];

            // Load custom recipes
            recipes.forEach(recipe => {
                addRecipeToMenu(recipe);
            });

            // Load custom features
            features.forEach(feature => {
                addFeatureToPage(feature);
            });
        }, 100);
    }
});

//Menu bar
const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');
const close = document.getElementById('close');

if(bar){
    bar.addEventListener('click',()=>{
        nav.classList.add('active');
    })
}

if(close){
    close.addEventListener('click',()=>{
        nav.classList.remove('active');
    })
}

// ========================================
// SHOPPING CART FUNCTIONALITY
// ========================================

// Cart Management System
class ShoppingCart {
    constructor() {
        this.items = this.getCartItems();
        this.init();
    }

    // Get cart items from localStorage
    getCartItems() {
        const cartData = localStorage.getItem('afrocrib_cart');
        return cartData ? JSON.parse(cartData) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('afrocrib_cart', JSON.stringify(this.items));
        this.updateCartCounter();
    }

    // Add item to cart
    addToCart(product) {
        // Validate product data
        if (!product || !product.id || !product.name || !product.price) {
            this.showNotification('Invalid product data. Please try again.', 'error');
            return false;
        }

        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
            this.showNotification(`Updated ${product.name} quantity to ${existingItem.quantity}`, 'success');
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image || '',
                description: product.description || product.name,
                quantity: 1
            });
            this.showNotification(`${product.name} added to cart!`, 'success');
        }
        
        this.saveCart();
        return true;
    }

    // Remove item from cart
    removeFromCart(productId) {
        const itemIndex = this.items.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const removedItem = this.items.splice(itemIndex, 1)[0];
            this.showNotification(`${removedItem.name} removed from cart`, 'info');
            this.saveCart();
            return true;
        }
        return false;
    }

    // Update item quantity
    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item && newQuantity > 0) {
            item.quantity = newQuantity;
            this.saveCart();
            return true;
        } else if (item && newQuantity === 0) {
            return this.removeFromCart(productId);
        }
        return false;
    }

    // Get cart total
    getCartTotal() {
        return this.items.reduce((total, item) => {
            const price = parseFloat(item.price.replace('₦', '').replace(',', ''));
            return total + (price * item.quantity);
        }, 0);
    }

    // Get total items count
    getItemsCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.saveCart();
        this.showNotification('Cart cleared!', 'info');
    }

    // Update cart counter in header
    updateCartCounter() {
        const cartIcons = document.querySelectorAll('#lg-bag a, #mobile a[href="cart.html"], .mobile-cart');
        const itemCount = this.getItemsCount();
        
        cartIcons.forEach(icon => {
            // Remove existing counter
            const existingCounter = icon.querySelector('.cart-counter, .cart-badge');
            if (existingCounter) {
                existingCounter.remove();
            }
            
            // Add new counter if items exist
            if (itemCount > 0) {
                const counter = document.createElement('span');
                counter.className = icon.classList.contains('mobile-cart') ? 'cart-badge' : 'cart-counter';
                counter.textContent = itemCount;
                counter.setAttribute('aria-label', `${itemCount} items in cart`);
                icon.style.position = 'relative';
                icon.appendChild(counter);
            }
        });
        
        // Also update any existing cart badges in the HTML (like on cart.html)
        const existingBadges = document.querySelectorAll('.cart-badge');
        existingBadges.forEach(badge => {
            // Only update if it's not one we just created above
            if (!badge.hasAttribute('aria-label')) {
                badge.textContent = itemCount;
            }
        });
        
        // Update any cart page specific elements
        const itemCountElements = document.querySelectorAll('[aria-label*="items in cart"], [aria-label*="item in cart"]');
        itemCountElements.forEach(element => {
            const newLabel = `${itemCount} item${itemCount !== 1 ? 's' : ''} in cart`;
            element.setAttribute('aria-label', newLabel);
        });
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.cart-notification');
        existingNotifications.forEach(notif => notif.remove());

        // Create notification
        const notification = document.createElement('div');
        notification.className = `cart-notification cart-notification--${type}`;
        notification.innerHTML = `
            <div class="cart-notification__content">
                <i class="fas fa-shopping-cart"></i>
                <span>${message}</span>
                <button class="cart-notification__close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);

        // Close button functionality
        notification.querySelector('.cart-notification__close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Get cart summary for display
    getCartSummary() {
        return {
            items: this.items,
            totalItems: this.getItemsCount(),
            totalPrice: this.getCartTotal(),
            formattedTotal: '₦' + this.getCartTotal().toLocaleString('en-NG', {minimumFractionDigits: 2})
        };
    }

    // Render cart items on cart page
    renderCartPage() {
        const cartItemsContainer = document.querySelector('.cart-items-grid');
        const orderSummary = document.querySelector('.order-summary');
        
        if (!cartItemsContainer) return; // Not on cart page
        
        // Debug: Log current cart state
        console.log('Rendering cart page with items:', this.items);
        console.log('Total items count:', this.getItemsCount());
        console.log('Total price:', this.getCartTotal());
        
        if (this.items.length === 0) {
            this.renderEmptyCart(cartItemsContainer);
            return;
        }
        
        // Clear existing items
        cartItemsContainer.innerHTML = '';
        
        // Render each cart item
        this.items.forEach((item, index) => {
            const itemElement = this.createCartItemElement(item, index);
            cartItemsContainer.appendChild(itemElement);
        });
        
        // Update order summary
        this.updateOrderSummary();
        
        // Update cart counter
        this.updateCartCounter();
        
        // Update cart page item counter
        const itemsCountSpan = document.querySelector('.items-count');
        if (itemsCountSpan) {
            const itemCount = this.getItemsCount();
            itemsCountSpan.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
            console.log('Updated cart page items count to:', itemCount);
        }
    }
    
    // Create cart item HTML element
    createCartItemElement(item, index) {
        const itemPrice = this.parsePrice(item.price);
        const itemSubtotal = itemPrice * item.quantity;
        
        const itemElement = document.createElement('article');
        itemElement.className = 'cart-item-card';
        itemElement.setAttribute('data-item-id', item.id);
        
        itemElement.innerHTML = `
            <div class="item-image">
                <img src="${item.image || 'Saleimages/default-food.jpg'}" 
                     alt="${item.name}"
                     loading="lazy">
            </div>
            <div class="item-details">
                <h3 class="item-name">${item.name}</h3>
                <p class="item-description">${item.description}</p>
                <div class="item-meta">
                    <span class="item-category">Main Course</span>
                    <span class="item-rating" aria-label="Rating: 4.5 out of 5 stars">
                        <i class="fas fa-star" aria-hidden="true"></i>
                        <i class="fas fa-star" aria-hidden="true"></i>
                        <i class="fas fa-star" aria-hidden="true"></i>
                        <i class="fas fa-star" aria-hidden="true"></i>
                        <i class="fas fa-star-half-alt" aria-hidden="true"></i>
                        4.5
                    </span>
                </div>
            </div>
            <div class="item-price">
                <span class="current-price">${item.price}</span>
            </div>
            <div class="quantity-controls">
                <label for="qty${index}" class="sr-only">Quantity for ${item.name}</label>
                <button class="qty-btn qty-decrease" 
                        type="button" 
                        aria-label="Decrease quantity"
                        data-item-id="${item.id}">
                    <i class="fas fa-minus" aria-hidden="true"></i>
                </button>
                <input type="number" 
                       id="qty${index}" 
                       class="qty-input" 
                       value="${item.quantity}" 
                       min="1" 
                       max="50"
                       data-item-id="${item.id}"
                       aria-describedby="qty-help-${index}">
                <button class="qty-btn qty-increase" 
                        type="button" 
                        aria-label="Increase quantity"
                        data-item-id="${item.id}">
                    <i class="fas fa-plus" aria-hidden="true"></i>
                </button>
            </div>
            <div class="item-subtotal">
                <span class="subtotal-amount">₦${itemSubtotal.toLocaleString('en-NG', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="item-actions">
                <button class="remove-item-btn" 
                        type="button" 
                        aria-label="Remove ${item.name} from cart"
                        data-item-id="${item.id}">
                    <i class="far fa-trash-alt" aria-hidden="true"></i>
                    <span>Remove</span>
                </button>
            </div>
        `;
        
        return itemElement;
    }
    
    // Render empty cart state
    renderEmptyCart(container) {
        container.innerHTML = `
            <div class="empty-cart-state">
                <div class="empty-cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything to your cart yet. Start shopping to fill it up!</p>
                <a href="shop.html" class="btn-primary">
                    <i class="fas fa-utensils"></i>
                    Start Shopping
                </a>
            </div>
        `;
        
        // Update order summary for empty cart
        this.updateOrderSummary();
    }
    
    // Update order summary
    updateOrderSummary() {
        const subtotalElement = document.querySelector('.summary-row .value[aria-live="polite"]');
        const taxElement = document.querySelector('.tax-row .value');
        const totalElement = document.querySelector('.total-amount'); // Fixed selector
        const itemCountElement = document.querySelector('.summary-row .label');
        
        if (!subtotalElement) return;
        
        const subtotal = this.getCartTotal();
        const itemCount = this.getItemsCount();
        const tax = subtotal * 0.075; // 7.5% tax
        const delivery = subtotal >= 5000 ? 0 : 500; // Free delivery over ₦5000
        const total = subtotal + tax + delivery;
        
        // Update subtotal
        subtotalElement.textContent = `₦${subtotal.toLocaleString('en-NG', {minimumFractionDigits: 2})}`;
        
        // Update item count in label
        if (itemCountElement) {
            itemCountElement.textContent = `Subtotal (${itemCount} item${itemCount !== 1 ? 's' : ''}):`;
        }
        
        // Update tax
        if (taxElement) {
            taxElement.textContent = `₦${tax.toLocaleString('en-NG', {minimumFractionDigits: 2})}`;
        }
        
        // Update total
        if (totalElement) {
            totalElement.innerHTML = `<strong>₦${total.toLocaleString('en-NG', {minimumFractionDigits: 2})}</strong>`;
        }
        
        // Update delivery fee display
        const deliveryElement = document.querySelector('.delivery-free');
        if (deliveryElement) {
            if (delivery === 0) {
                deliveryElement.innerHTML = `
                    <span class="original-price">₦500.00</span>
                    <span class="free-text">FREE</span>
                `;
            } else {
                deliveryElement.innerHTML = `₦${delivery.toFixed(2)}`;
            }
        }
        
        // Update cart page header item count - this targets the blue badge "3 items"
        const itemsCountSpan = document.querySelector('.items-count');
        if (itemsCountSpan) {
            itemsCountSpan.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
            console.log('Updated cart page items count to:', itemCount);
        }
        
        // Debug log for troubleshooting
        console.log('Cart Summary Update:', {
            items: itemCount,
            subtotal: subtotal,
            tax: tax,
            delivery: delivery,
            total: total,
            cartItems: this.items
        });
    }
    
    // Parse price string to number
    parsePrice(priceString) {
        return parseFloat(priceString.replace(/[₦,\s]/g, '')) || 0;
    }
    
    // Attach cart page event listeners
    attachCartPageListeners() {
        if (!document.querySelector('.cart-items-grid')) return; // Not on cart page
        
        // Quantity increase/decrease buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.qty-decrease')) {
                const button = e.target.closest('.qty-decrease');
                const itemId = button.getAttribute('data-item-id');
                const item = this.items.find(item => item.id === itemId);
                if (item && item.quantity > 1) {
                    this.updateQuantity(itemId, item.quantity - 1);
                    this.renderCartPage();
                }
            } else if (e.target.closest('.qty-increase')) {
                const button = e.target.closest('.qty-increase');
                const itemId = button.getAttribute('data-item-id');
                const item = this.items.find(item => item.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity + 1);
                    this.renderCartPage();
                }
            } else if (e.target.closest('.remove-item-btn')) {
                const button = e.target.closest('.remove-item-btn');
                const itemId = button.getAttribute('data-item-id');
                this.removeFromCart(itemId);
                this.renderCartPage();
            }
        });
        
        // Quantity input changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('qty-input')) {
                const input = e.target;
                const itemId = input.getAttribute('data-item-id');
                const newQuantity = parseInt(input.value) || 1;
                this.updateQuantity(itemId, newQuantity);
                this.renderCartPage();
            }
        });
    }

    // Extract product data from product element
    extractProductData(productElement) {
        const img = productElement.querySelector('img');
        const nameSpan = productElement.querySelector('.description span');
        const descriptionH5 = productElement.querySelector('.description h5');
        const priceH4 = productElement.querySelector('.description h4');
        
        // Generate unique ID based on product name and price
        const name = nameSpan ? nameSpan.textContent.trim() : 'Unknown Product';
        const price = priceH4 ? priceH4.textContent.trim() : '₦0.00';
        const id = `${name.toLowerCase().replace(/\s+/g, '_')}_${price.replace(/[^\d]/g, '')}`;

        return {
            id: id,
            name: name,
            price: price,
            image: img ? img.src : '',
            description: descriptionH5 ? descriptionH5.textContent.trim() : name
        };
    }

    // Extract product data from single product page
    extractSingleProductData() {
        // For single product page (Sproduct.html)
        const mainImg = document.querySelector('#Main') || document.querySelector('#pro-details img');
        const productDetails = document.querySelector('#pro-details div');
        
        if (!productDetails) return null;

        const nameH4 = productDetails.querySelector('h4');
        const priceH2 = productDetails.querySelector('h2');
        const descriptionSpan = productDetails.querySelector('span');
        const quantityInput = document.querySelector('#quantity-input');
        
        // Extract product info
        const name = nameH4 ? nameH4.textContent.trim() : 'Rice and Stew';
        const price = priceH2 ? priceH2.textContent.trim() : '₦5299.25';
        const description = descriptionSpan ? descriptionSpan.textContent.trim().substring(0, 100) + '...' : name;
        const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
        
        const id = `${name.toLowerCase().replace(/\s+/g, '_')}_${price.replace(/[^\d]/g, '')}`;

        return {
            id: id,
            name: name,
            price: price,
            image: mainImg ? mainImg.src : '',
            description: description,
            quantity: quantity
        };
    }

    // Initialize cart functionality
    init() {
        this.updateCartCounter();
        this.attachEventListeners();
        
        // If on cart page, render cart items
        if (document.querySelector('.cart-items-grid')) {
            this.attachCartPageListeners();
            this.renderCartPage();
        }
    }

    // Attach event listeners to all cart icons
    attachEventListeners() {
        // Add to cart buttons for product grids
        document.addEventListener('click', (e) => {
            const cartIcon = e.target.closest('a[aria-label*="cart"], .cart, i.fal.fa-shopping-cart');
            
            if (cartIcon && cartIcon.getAttribute('href') !== 'cart.html') {
                e.preventDefault();
                
                // Find the product container
                const productContainer = cartIcon.closest('.pro');
                if (productContainer) {
                    const productData = this.extractProductData(productContainer);
                    this.addToCart(productData);
                }
            }
        });

        // Add to cart button for single product page
        const addToCartButton = document.querySelector('button.normal');
        if (addToCartButton && addToCartButton.textContent.includes('Add To Cart')) {
            addToCartButton.addEventListener('click', (e) => {
                e.preventDefault();
                
                const productData = this.extractSingleProductData();
                if (productData) {
                    // Create a single product object and let addToCart handle quantity
                    const singleProduct = {
                        id: productData.id,
                        name: productData.name,
                        price: productData.price,
                        image: productData.image,
                        description: productData.description
                    };
                    
                    // Add the specified quantity
                    for (let i = 0; i < productData.quantity; i++) {
                        this.addToCart(singleProduct);
                    }
                    
                    // Show special message for multiple items
                    if (productData.quantity > 1) {
                        setTimeout(() => {
                            this.showNotification(`Added ${productData.quantity} items of ${productData.name} to cart!`, 'success');
                        }, 500);
                    }
                }
            });
        }

        // Update counter on page load
        this.updateCartCounter();
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
    
    // Debug function - can be called from browser console
    window.debugCart = () => {
        console.log('Cart Items:', window.cart.items);
        console.log('Total Items:', window.cart.getItemsCount());
        console.log('Total Price: ₦' + window.cart.getCartTotal().toFixed(2));
        return window.cart.getCartSummary();
    };
    
    // Clear cart function for testing
    window.clearCart = () => {
        window.cart.clearCart();
        if (document.querySelector('.cart-items-grid')) {
            window.cart.renderCartPage();
        }
    };
    
    // Add some visual feedback for successful initialization
    console.log('🛒 AFROCRIB Shopping Cart initialized successfully!');
    console.log('💡 Use debugCart() to see cart contents or clearCart() to empty cart');
});

// ========================================
// PRODUCT DETAILS - Click to View
// ========================================

// Store all products data for thumbnail navigation
let allProductsData = [];

// Function to extract product data from element
function extractProductData(productElement) {
    const img = productElement.querySelector('img');
    const description = productElement.querySelector('.description');
    const span = description.querySelector('span');
    const h5 = description.querySelector('h5');
    const stars = description.querySelectorAll('.star i.fas.fa-star').length;
    const price = description.querySelector('h4');

    return {
        mainImage: img.src,
        category: span ? span.textContent.trim() : 'Food',
        name: h5 ? h5.textContent.trim() : 'Delicious Meal',
        rating: stars,
        price: price ? price.textContent.trim() : '₦0.00',
        description: `${h5 ? h5.textContent.trim() : 'This delicious meal'} is a wonderful ${span ? span.textContent.trim().toLowerCase() : 'food'} dish from our menu. Made with fresh ingredients and traditional recipes, this meal is perfect for any occasion. Enjoy the authentic taste and quality that AFROCRIB Restaurant is known for.`
    };
}

// Function to collect all products and select related ones
function getRelatedProducts(mainProduct, allProducts) {
    // Filter to get 3 other different products
    const otherProducts = allProducts.filter(p => p.mainImage !== mainProduct.mainImage);
    
    // Shuffle and pick 3 random products
    const shuffled = otherProducts.sort(() => 0.5 - Math.random());
    const related = shuffled.slice(0, 3);
    
    return [mainProduct, ...related];
}

// Function to save product data when clicked
function saveProductDetails(productElement) {
    try {
        const mainProduct = extractProductData(productElement);
        
        // Get all products on the page
        const allProductElements = document.querySelectorAll('.pro');
        allProductsData = Array.from(allProductElements).map(el => extractProductData(el));
        
        // Get 4 products (main + 3 related)
        const selectedProducts = getRelatedProducts(mainProduct, allProductsData);

        const productData = {
            mainProduct: selectedProducts[0],
            relatedProducts: [
                selectedProducts[1] || selectedProducts[0],
                selectedProducts[2] || selectedProducts[0],
                selectedProducts[3] || selectedProducts[0]
            ],
            timestamp: new Date().getTime()
        };

        localStorage.setItem('selectedProduct', JSON.stringify(productData));
        console.log('📦 Product saved:', productData);
    } catch (error) {
        console.error('Error saving product:', error);
    }
}

// Add click handlers to all product cards
document.addEventListener('DOMContentLoaded', function() {
    // Handle all product card clicks
    const allProducts = document.querySelectorAll('.pro');
    allProducts.forEach(product => {
        // Skip if it already has an onclick with window.location
        if (product.getAttribute('onclick')) {
            // Update existing onclick to save data first
            const originalOnclick = product.getAttribute('onclick');
            product.onclick = function(e) {
                // Don't trigger if clicking the cart button
                if (e.target.closest('.cart')) return;
                
                saveProductDetails(this);
                eval(originalOnclick);
            };
        } else {
            // Add click handler for products without onclick
            product.style.cursor = 'pointer';
            product.addEventListener('click', function(e) {
                // Don't navigate if clicking the cart button
                if (e.target.closest('.cart')) return;
                
                saveProductDetails(this);
                window.location.href = 'Sproduct.html';
            });
        }
    });
});

// ========================================
// SPRODUCT PAGE - Load Product Details
// ========================================

// Function to display product details
function displayProductDetails(product) {
    // Update main image
    const mainImg = document.getElementById('Main');
    if (mainImg) mainImg.src = product.mainImage;
    
    // Update product details section
    const detailsSection = document.querySelector('.single-pro-details');
    if (detailsSection) {
        // Update breadcrumb
        const breadcrumb = detailsSection.querySelector('h6');
        if (breadcrumb) breadcrumb.textContent = `Home / ${product.category}`;
        
        // Update product name
        const nameHeading = detailsSection.querySelector('h4');
        if (nameHeading) nameHeading.textContent = product.name;
        
        // Update price
        const priceHeading = detailsSection.querySelector('h2');
        if (priceHeading) priceHeading.textContent = product.price;
        
        // Update description
        const descSpan = detailsSection.querySelector('span');
        if (descSpan) {
            descSpan.textContent = product.description;
        }
    }
}

// Load product details on Sproduct.html page
if (window.location.pathname.includes('Sproduct.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        const savedProduct = localStorage.getItem('selectedProduct');
        
        if (savedProduct) {
            try {
                const productData = JSON.parse(savedProduct);
                
                // Display main product initially
                displayProductDetails(productData.mainProduct);
                
                // Update small images with related products
                const smallImages = document.querySelectorAll('.small-img');
                const relatedProducts = productData.relatedProducts || [];
                
                // Set images and attach click handlers
                smallImages.forEach((img, index) => {
                    if (relatedProducts[index]) {
                        img.src = relatedProducts[index].mainImage;
                        img.style.cursor = 'pointer';
                        
                        // Click handler to update details AND main image
                        img.onclick = function() {
                            // Update main image
                            const mainImg = document.getElementById('Main');
                            if (mainImg) mainImg.src = this.src;
                            
                            // Update product details
                            displayProductDetails(relatedProducts[index]);
                            
                            console.log('🔄 Switched to:', relatedProducts[index].name);
                        };
                    }
                });
                
                // Also add click to show main product when last thumbnail is clicked
                if (smallImages.length > 3) {
                    const lastThumb = smallImages[3];
                    lastThumb.src = productData.mainProduct.mainImage;
                    lastThumb.onclick = function() {
                        const mainImg = document.getElementById('Main');
                        if (mainImg) mainImg.src = this.src;
                        displayProductDetails(productData.mainProduct);
                        console.log('🔄 Back to main product:', productData.mainProduct.name);
                    };
                }
                
                console.log('✅ Product details loaded successfully');
            } catch (error) {
                console.error('Error loading product details:', error);
            }
        } else {
            console.log('ℹ️ No saved product found, showing default product');
        }
    });
}

//image gallery - fallback for non-dynamic images
var MainImg = document.getElementById("Main");
var smallImg = document.getElementsByClassName("small-img");

if(smallImg.length > 0){
    smallImg[0].onclick = function(){
        MainImg.src = smallImg[0].src;
    }
}
if(smallImg.length > 1){
    smallImg[1].onclick = function(){
        MainImg.src = smallImg[1].src;
    }
}
if(smallImg.length > 2){
    smallImg[2].onclick = function(){
        MainImg.src = smallImg[2].src;
    }
}
if(smallImg.length > 3){
    smallImg[3].onclick = function(){
        MainImg.src = smallImg[3].src;
    }
}

// ========================================
// ADMIN CONTENT HELPERS
// ========================================

// Helper functions for admin content
function addRecipeToMenu(recipe) {
    const proContainer = document.querySelector('#product1 .pro-container');
    if (!proContainer) return;

    const recipeElement = document.createElement('div');
    recipeElement.className = 'pro admin-added';
    recipeElement.innerHTML = `
        <img src="${recipe.image}" height="210px" alt="${recipe.name}" onerror="this.src='Saleimages/cake1.png'">
        <div class="description">
            <span>${recipe.category}</span>
            <h5>${recipe.description}</h5>
            <div class="star">
                ${'<i class="fas fa-star"></i>'.repeat(recipe.rating)}
            </div>
            <h4>₦${recipe.price.toFixed(2)}</h4>
        </div>
        <a href="#" aria-label="Add ${recipe.name} to cart"><i class="fal fa-shopping-cart cart"></i></a>
    `;

    proContainer.appendChild(recipeElement);
}

function addFeatureToPage(feature) {
    const featureSection = document.getElementById('feature');
    if (!featureSection) return;

    const featureElement = document.createElement('div');
    featureElement.className = 'fe-box admin-added';
    featureElement.innerHTML = `
        <img src="${feature.image}" height="115px" alt="${feature.name}" onerror="this.src='Saleimages/cake1.png'">
        <h6>${feature.name}</h6>
    `;

    featureSection.appendChild(featureElement);
}