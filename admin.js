// ========================================
// ADMIN PANEL FUNCTIONALITY
// ========================================

class AdminPanel {
    constructor() {
        this.recipes = JSON.parse(localStorage.getItem('adminRecipes')) || [];
        this.features = JSON.parse(localStorage.getItem('adminFeatures')) || [];
        this.blogs = JSON.parse(localStorage.getItem('adminBlogs')) || [];
        this.currentUser = null;
        this.credentials = {
            username: 'admin',
            password: 'afrocrib2025'
        };
        
        this.init();
    }

    init() {
        if (window.location.pathname.includes('admin.html')) {
            this.bindEvents();
            this.checkAuthStatus();
            this.renderRecipeList();
            this.renderFeatureList();
            this.renderBlogList();
            this.updateStats();
        }
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Tab navigation
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Add recipe form
        const addRecipeForm = document.getElementById('add-recipe-form');
        if (addRecipeForm) {
            addRecipeForm.addEventListener('submit', (e) => this.handleAddRecipe(e));
        }

        // Add feature form
        const addFeatureForm = document.getElementById('add-feature-form');
        if (addFeatureForm) {
            addFeatureForm.addEventListener('submit', (e) => this.handleAddFeature(e));
        }

        // Add blog form
        const addBlogForm = document.getElementById('add-blog-form');
        if (addBlogForm) {
            addBlogForm.addEventListener('submit', (e) => this.handleAddBlog(e));
        }

        // Image input toggle
        const imageUrlOption = document.getElementById('image-url-option');
        const imageFileOption = document.getElementById('image-file-option');
        if (imageUrlOption && imageFileOption) {
            imageUrlOption.addEventListener('change', () => this.toggleImageInput('url'));
            imageFileOption.addEventListener('change', () => this.toggleImageInput('file'));
        }

        // Image file input
        const imageFileInput = document.getElementById('recipe-image-file');
        if (imageFileInput) {
            imageFileInput.addEventListener('change', (e) => this.handleImageFile(e));
        }

        // Image URL input for preview
        const imageUrlInput = document.getElementById('recipe-image-url');
        if (imageUrlInput) {
            imageUrlInput.addEventListener('input', (e) => this.previewImageUrl(e.target.value));
        }

        // Drag and drop for file input
        const fileInputGroup = document.getElementById('file-input-group');
        if (fileInputGroup) {
            fileInputGroup.addEventListener('dragover', (e) => this.handleDragOver(e));
            fileInputGroup.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            fileInputGroup.addEventListener('drop', (e) => this.handleDrop(e));
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.style.borderColor = 'var(--primary-color)';
        e.currentTarget.style.backgroundColor = 'var(--primary-light)';
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const fileInput = document.getElementById('recipe-image-file');
        const files = e.dataTransfer.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            this.handleImageFile({ target: fileInput });
        }
        
        // Reset styling
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
    }

    checkAuthStatus() {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        const loginSection = document.getElementById('admin-login');
        const dashboardSection = document.getElementById('admin-dashboard');

        if (isLoggedIn) {
            loginSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            this.currentUser = 'admin';
        } else {
            loginSection.classList.remove('hidden');
            dashboardSection.classList.add('hidden');
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        if (username === this.credentials.username && password === this.credentials.password) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            this.currentUser = username;
            this.checkAuthStatus();
            this.showMessage('Login successful! Welcome to the admin panel.', 'success');
        } else {
            this.showMessage('Invalid credentials. Please try again.', 'error');
        }
    }

    handleLogout() {
        sessionStorage.removeItem('adminLoggedIn');
        this.currentUser = null;
        this.showMessage('Logged out successfully.', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }

    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    toggleImageInput(type) {
        const urlGroup = document.getElementById('url-input-group');
        const fileGroup = document.getElementById('file-input-group');
        const preview = document.getElementById('image-preview');

        if (type === 'url') {
            urlGroup.classList.add('active');
            fileGroup.classList.remove('active');
        } else {
            urlGroup.classList.remove('active');
            fileGroup.classList.add('active');
        }

        // Clear preview when switching
        preview.innerHTML = '';
    }

    handleImageFile(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('image-preview');

        if (!file) {
            preview.innerHTML = '';
            return;
        }

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            this.showMessage('Please select a valid image file (PNG, JPEG, JPG, GIF, WebP)', 'error');
            event.target.value = '';
            preview.innerHTML = '';
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            this.showMessage('Image file size must be less than 5MB', 'error');
            event.target.value = '';
            preview.innerHTML = '';
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileSize = (file.size / (1024 * 1024)).toFixed(2);
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Recipe preview">
                <div class="preview-info">
                    <strong>${file.name}</strong><br>
                    Size: ${fileSize} MB | Type: ${file.type}
                </div>
                <button type="button" class="remove-preview" onclick="adminPanel.clearImagePreview()">
                    Remove Preview
                </button>
            `;
        };
        reader.readAsDataURL(file);
    }

    previewImageUrl(url) {
        const preview = document.getElementById('image-preview');
        
        if (!url) {
            preview.innerHTML = '';
            return;
        }

        // Simple URL validation
        try {
            new URL(url);
        } catch {
            // If not a valid URL, check if it's a relative path
            if (!url.startsWith('Saleimages/') && !url.includes('.')) {
                preview.innerHTML = '';
                return;
            }
        }

        preview.innerHTML = `
            <img src="${url}" alt="Recipe preview" onerror="this.parentElement.innerHTML='<p style=&quot;color: var(--accent-color);&quot;>Unable to load image preview</p>'">
            <div class="preview-info">
                <strong>Image URL Preview</strong><br>
                ${url}
            </div>
            <button type="button" class="remove-preview" onclick="adminPanel.clearImagePreview()">
                Remove Preview
            </button>
        `;
    }

    clearImagePreview() {
        const preview = document.getElementById('image-preview');
        const fileInput = document.getElementById('recipe-image-file');
        const urlInput = document.getElementById('recipe-image-url');

        preview.innerHTML = '';
        if (fileInput) fileInput.value = '';
        if (urlInput) urlInput.value = '';
    }

    handleAddRecipe(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Determine image source
        let imageSource = '';
        const imageInputType = formData.get('image-input-type');
        
        if (imageInputType === 'url') {
            imageSource = formData.get('imageUrl');
            if (!imageSource) {
                this.showMessage('Please provide an image URL', 'error');
                return;
            }
        } else {
            const imageFile = formData.get('imageFile');
            if (!imageFile || imageFile.size === 0) {
                this.showMessage('Please select an image file', 'error');
                return;
            }
            
            // Convert file to base64 for storage
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Image = event.target.result;
                this.createAndSaveRecipe(formData, base64Image, e.target);
            };
            reader.readAsDataURL(imageFile);
            return; // Exit here as we'll handle the rest in the FileReader callback
        }
        
        // Handle URL-based image
        this.createAndSaveRecipe(formData, imageSource, e.target);
    }

    createAndSaveRecipe(formData, imageSource, form) {
        const recipe = {
            id: Date.now(),
            name: formData.get('name'),
            category: formData.get('category'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            rating: parseInt(formData.get('rating')),
            image: imageSource,
            addToMenu: formData.get('addToMenu') === 'on',
            addToFeatures: formData.get('addToFeatures') === 'on',
            createdAt: new Date().toISOString()
        };

        // Add to recipes array
        this.recipes.push(recipe);
        this.saveRecipes();

        // Add to homepage if requested
        if (recipe.addToMenu) {
            this.addRecipeToHomepage(recipe);
        }

        if (recipe.addToFeatures) {
            this.addFeatureToHomepage(recipe);
        }

        // Reset form and update UI
        form.reset();
        this.clearImagePreview();
        this.toggleImageInput('url'); // Reset to URL input
        this.renderRecipeList();
        this.updateStats();
        this.showMessage(`Recipe "${recipe.name}" added successfully!`, 'success');
    }

    handleAddFeature(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const feature = {
            id: Date.now(),
            name: formData.get('name'),
            image: formData.get('image'),
            createdAt: new Date().toISOString()
        };

        this.features.push(feature);
        this.saveFeatures();
        this.addFeatureToHomepage(feature);

        e.target.reset();
        this.renderFeatureList();
        this.updateStats();
        this.showMessage(`Feature "${feature.name}" added successfully!`, 'success');
    }

    handleAddBlog(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const blog = {
            id: Date.now(),
            title: formData.get('title'),
            subtitle: formData.get('subtitle'),
            excerpt: formData.get('excerpt'),
            content: formData.get('content'),
            image: formData.get('image') || '',
            author: formData.get('author'),
            createdAt: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        };

        this.blogs.push(blog);
        this.saveBlogs();

        e.target.reset();
        this.renderBlogList();
        this.updateStats();
        this.showMessage(`Blog "${blog.title}" added successfully!`, 'success');
    }

    addRecipeToHomepage(recipe) {
        // Store recipe for homepage rendering
        let homepageRecipes = JSON.parse(localStorage.getItem('homepageRecipes')) || [];
        homepageRecipes.push(recipe);
        localStorage.setItem('homepageRecipes', JSON.stringify(homepageRecipes));
        
        // Dispatch custom event to notify homepage if it's open in another tab
        window.dispatchEvent(new CustomEvent('recipeAdded', { detail: recipe }));
    }

    addFeatureToHomepage(feature) {
        // Store feature for homepage rendering
        let homepageFeatures = JSON.parse(localStorage.getItem('homepageFeatures')) || [];
        homepageFeatures.push(feature);
        localStorage.setItem('homepageFeatures', JSON.stringify(homepageFeatures));
    }

    renderRecipeList() {
        const recipeList = document.getElementById('recipe-list');
        if (!recipeList) return;

        if (this.recipes.length === 0) {
            recipeList.innerHTML = '<p class="text-center">No recipes added yet. Add your first recipe using the form above!</p>';
            return;
        }

        recipeList.innerHTML = this.recipes.map(recipe => `
            <div class="recipe-item">
                <div class="recipe-info">
                    <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image" onerror="this.src='Saleimages/cake1.png'">
                    <div class="recipe-details">
                        <h4>${recipe.name}</h4>
                        <p>${recipe.description}</p>
                        <small>Category: ${recipe.category} | Rating: ${'★'.repeat(recipe.rating)}</small>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="recipe-price">₦${recipe.price.toFixed(2)}</span>
                    <button class="admin-btn danger" onclick="adminPanel.deleteRecipe(${recipe.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderFeatureList() {
        const featureList = document.getElementById('feature-list');
        if (!featureList) return;

        if (this.features.length === 0) {
            featureList.innerHTML = '<p class="text-center">No custom features added yet.</p>';
            return;
        }

        featureList.innerHTML = this.features.map(feature => `
            <div class="feature-item">
                <div class="feature-info">
                    <img src="${feature.image}" alt="${feature.name}" class="feature-image" onerror="this.src='Saleimages/cake1.png'">
                    <div class="feature-details">
                        <h4>${feature.name}</h4>
                    </div>
                </div>
                <button class="admin-btn danger" onclick="adminPanel.deleteFeature(${feature.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    renderBlogList() {
        const blogList = document.getElementById('blog-list');
        if (!blogList) return;

        if (this.blogs.length === 0) {
            blogList.innerHTML = '<p class="text-center">No blog posts added yet. Add your first blog using the form above!</p>';
            return;
        }

        blogList.innerHTML = this.blogs.map((blog, index) => {
            const isRecent = index >= this.blogs.length - 2;
            return `
            <div class="blog-item ${isRecent ? 'blog-recent' : ''}">
                <div class="blog-info">
                    <div class="blog-details">
                        <h4>${blog.title}</h4>
                        <p><strong>${blog.subtitle}</strong> - ${blog.excerpt}</p>
                        <small>By ${blog.author} | ${blog.date}${isRecent ? ' <span class="badge-recent">🟢 Shown on Homepage</span>' : ''}</small>
                    </div>
                </div>
                <button class="admin-btn danger" onclick="adminPanel.deleteBlog(${blog.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `}).join('');
    }

    deleteRecipe(id) {
        if (confirm('Are you sure you want to delete this recipe?')) {
            this.recipes = this.recipes.filter(recipe => recipe.id !== id);
            this.saveRecipes();
            
            // Also remove from homepage
            let homepageRecipes = JSON.parse(localStorage.getItem('homepageRecipes')) || [];
            homepageRecipes = homepageRecipes.filter(recipe => recipe.id !== id);
            localStorage.setItem('homepageRecipes', JSON.stringify(homepageRecipes));
            
            this.renderRecipeList();
            this.updateStats();
            this.showMessage('Recipe deleted successfully!', 'success');
        }
    }

    deleteFeature(id) {
        if (confirm('Are you sure you want to delete this feature?')) {
            this.features = this.features.filter(feature => feature.id !== id);
            this.saveFeatures();
            
            // Also remove from homepage
            let homepageFeatures = JSON.parse(localStorage.getItem('homepageFeatures')) || [];
            homepageFeatures = homepageFeatures.filter(feature => feature.id !== id);
            localStorage.setItem('homepageFeatures', JSON.stringify(homepageFeatures));
            
            this.renderFeatureList();
            this.updateStats();
            this.showMessage('Feature deleted successfully!', 'success');
        }
    }

    deleteBlog(id) {
        if (confirm('Are you sure you want to delete this blog post?')) {
            this.blogs = this.blogs.filter(blog => blog.id !== id);
            this.saveBlogs();
            
            this.renderBlogList();
            this.updateStats();
            this.showMessage('Blog post deleted successfully!', 'success');
        }
    }

    updateStats() {
        const totalRecipesEl = document.getElementById('total-recipes');
        const totalFeaturesEl = document.getElementById('total-features');
        const lastUpdatedEl = document.getElementById('last-updated');

        if (totalRecipesEl) totalRecipesEl.textContent = this.recipes.length;
        if (totalFeaturesEl) totalFeaturesEl.textContent = 6 + this.features.length; // 6 default + custom
        if (lastUpdatedEl) lastUpdatedEl.textContent = new Date().toLocaleDateString();
    }

    saveRecipes() {
        localStorage.setItem('adminRecipes', JSON.stringify(this.recipes));
    }

    saveFeatures() {
        localStorage.setItem('adminFeatures', JSON.stringify(this.features));
    }

    saveBlogs() {
        localStorage.setItem('adminBlogs', JSON.stringify(this.blogs));
    }

    showMessage(message, type = 'info') {
        const messagesContainer = document.getElementById('admin-messages');
        if (!messagesContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `admin-message ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 'info-circle';
        
        messageEl.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;

        messagesContainer.appendChild(messageEl);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 5000);
    }

    // Public method to load recipes on homepage
    static loadHomepageContent() {
        const recipes = JSON.parse(localStorage.getItem('homepageRecipes')) || [];
        const features = JSON.parse(localStorage.getItem('homepageFeatures')) || [];

        // Load custom recipes
        recipes.forEach(recipe => {
            AdminPanel.addRecipeToMenu(recipe);
        });

        // Load custom features
        features.forEach(feature => {
            AdminPanel.addFeatureToPage(feature);
        });
    }

    static addRecipeToMenu(recipe) {
        const proContainer = document.querySelector('#product1 .pro-container');
        if (!proContainer) return;

        const recipeElement = document.createElement('div');
        recipeElement.className = 'pro';
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

    static addFeatureToPage(feature) {
        const featureSection = document.getElementById('feature');
        if (!featureSection) return;

        const featureElement = document.createElement('div');
        featureElement.className = 'fe-box';
        featureElement.innerHTML = `
            <img src="${feature.image}" height="115px" alt="${feature.name}" onerror="this.src='Saleimages/cake1.png'">
            <h6>${feature.name}</h6>
        `;

        featureSection.appendChild(featureElement);
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel();

// Load content on homepage if recipes exist
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', () => {
        AdminPanel.loadHomepageContent();
    });
}