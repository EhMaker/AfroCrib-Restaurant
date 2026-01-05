// ========================================
// DASHBOARD AUTHENTICATION HANDLER
// ========================================

// Supabase Configuration
window.SUPABASE_URL = window.SUPABASE_URL || 'https://fppnpevkegctkefjipoe.supabase.co';
window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcG5wZXZrZWdjdGtlZmppcG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzA4NTMsImV4cCI6MjA3NTYwNjg1M30.l183uTySyCDqDDPjqQd8zBcVNoLI-xuQ_WYSj8g4Dzw';

// Initialize Supabase client as global variable (only if not already initialized)
if (!window.supabaseClient) {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized in dashboard-auth.js');
    } else {
        console.error('⚠️ Supabase SDK not loaded. Make sure to include the Supabase script before dashboard-auth.js');
    }
}

// Create local reference
var supabase = window.supabaseClient;

class DashboardAuth {
    constructor() {
        this.init();
    }

    init() {
        // Attach event listeners for login links
        this.attachEventListeners();
    }

    attachEventListeners() {
        // User Login link
        const userLoginLink = document.getElementById('user-login-link');
        if (userLoginLink) {
            userLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('👤 User login clicked');
                this.handleUserLogin();
            });
        } else {
            console.warn('⚠️ User login link not found');
        }

        // Admin Login link
        const adminLoginLink = document.getElementById('admin-login-link');
        if (adminLoginLink) {
            adminLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('👨‍💼 Admin login clicked');
                this.handleAdminLogin();
            });
        } else {
            console.warn('⚠️ Admin login link not found');
        }

        // Mobile dropdown toggle
        const dashboardLink = document.getElementById('dashboard-link');
        if (dashboardLink && window.innerWidth <= 799) {
            dashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                const dropdownNav = dashboardLink.closest('.dropdown-nav');
                dropdownNav.classList.toggle('active');
            });
        }
    }

    async handleUserLogin() {
        // Check if user is already logged in
        try {
            if (!supabase) {
                console.error('Supabase not initialized');
                this.showLoginModal('user');
                return;
            }

            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;

            if (session) {
                // User is logged in, redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Show login modal for user
                this.showLoginModal('user');
            }
        } catch (error) {
            console.error('User login check error:', error);
            this.showLoginModal('user');
        }
    }

    handleAdminLogin() {
        // Redirect to admin page (admin has its own authentication)
        window.location.href = 'admin.html';
    }

    showLoginModal(type) {
        // Create and show login modal
        const modal = this.createLoginModal(type);
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    createLoginModal(type) {
        const modalHTML = `
            <div id="dashboard-login-modal" class="auth-modal" role="dialog" aria-labelledby="dashboard-auth-title" aria-hidden="true">
                <div class="auth-modal-overlay"></div>
                <div class="auth-modal-content">
                    <button type="button" class="auth-close-btn" aria-label="Close login">
                        <i class="fas fa-times"></i>
                    </button>
                    
                    <div class="auth-modal-header">
                        <i class="fas fa-${type === 'user' ? 'user-circle' : 'user-shield'}"></i>
                        <h2 id="dashboard-auth-title">${type === 'user' ? 'User Login' : 'Admin Login'}</h2>
                        <p>${type === 'user' ? 'Login or register to access your dashboard' : 'Login to admin panel'}</p>
                    </div>

                    <div class="auth-modal-body">
                        <!-- Email & Password Login Step -->
                        <div id="dashboard-login-step" class="auth-step active">
                            <form id="dashboard-auth-login-form">
                                <div class="form-group">
                                    <label for="dashboard-auth-email">Email Address</label>
                                    <input type="email" 
                                           id="dashboard-auth-email" 
                                           class="form-control" 
                                           placeholder="Enter your email"
                                           required>
                                </div>
                                <div class="form-group">
                                    <label for="dashboard-auth-password">Password</label>
                                    <div class="password-input-wrapper">
                                        <input type="password" 
                                               id="dashboard-auth-password" 
                                               class="form-control" 
                                               placeholder="Enter your password"
                                               required>
                                        <button type="button" class="password-toggle" id="toggle-password">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" class="auth-btn">
                                    <i class="fas fa-sign-in-alt"></i>
                                    Login
                                </button>
                                ${type === 'user' ? `
                                <button type="button" class="auth-btn-secondary" id="switch-to-register">
                                    <i class="fas fa-user-plus"></i>
                                    New User? Register Here
                                </button>
                                ` : ''}
                            </form>
                        </div>

                        <!-- Registration Step (Users Only) -->
                        ${type === 'user' ? `
                        <div id="dashboard-register-step" class="auth-step">
                            <form id="dashboard-auth-register-form">
                                <div class="form-group">
                                    <label for="dashboard-register-email">Email Address</label>
                                    <input type="email" 
                                           id="dashboard-register-email" 
                                           class="form-control" 
                                           placeholder="Enter your email"
                                           required>
                                </div>
                                <div class="form-group">
                                    <label for="dashboard-register-password">Password</label>
                                    <div class="password-input-wrapper">
                                        <input type="password" 
                                               id="dashboard-register-password" 
                                               class="form-control" 
                                               placeholder="Create a password (min 6 characters)"
                                               minlength="6"
                                               required>
                                        <button type="button" class="password-toggle" id="toggle-register-password">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" class="auth-btn">
                                    <i class="fas fa-envelope"></i>
                                    Send Verification Code
                                </button>
                                <button type="button" class="auth-btn-secondary" id="switch-to-login">
                                    <i class="fas fa-sign-in-alt"></i>
                                    Already have an account? Login
                                </button>
                            </form>
                        </div>
                        ` : ''}

                        <!-- OTP Verification Step (Registration Only) -->
                        <div id="dashboard-otp-step" class="auth-step">
                            <form id="dashboard-auth-otp-form">
                                <div class="otp-info">
                                    <i class="fas fa-envelope-open"></i>
                                    <p>We've sent a 6-digit code to</p>
                                    <strong id="dashboard-verify-email-display"></strong>
                                </div>
                                <div class="form-group">
                                    <label for="dashboard-auth-otp">Verification Code</label>
                                    <input type="text" 
                                           id="dashboard-auth-otp" 
                                           class="form-control otp-input" 
                                           placeholder="Enter 6-digit code"
                                           maxlength="6"
                                           pattern="[0-9]{6}"
                                           required>
                                </div>
                                <button type="submit" class="auth-btn">
                                    <i class="fas fa-check"></i>
                                    Verify & Complete Registration
                                </button>
                                <button type="button" class="auth-btn-secondary" id="dashboard-resend-code-btn">
                                    <i class="fas fa-redo"></i>
                                    Resend Code
                                </button>
                            </form>
                        </div>
                    </div>

                    <div class="auth-message" id="dashboard-auth-message"></div>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        const modal = tempDiv.firstElementChild;

        // Attach event listeners
        this.attachModalEventListeners(modal, type);

        return modal;
    }

    attachModalEventListeners(modal, type) {
        // Close button
        const closeBtn = modal.querySelector('.auth-close-btn');
        const overlay = modal.querySelector('.auth-modal-overlay');
        
        closeBtn.addEventListener('click', () => this.closeModal(modal));
        overlay.addEventListener('click', () => this.closeModal(modal));

        // Login form
        const loginForm = modal.querySelector('#dashboard-auth-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLoginSubmit(modal, type);
            });
        }

        // Register form (for users only)
        const registerForm = modal.querySelector('#dashboard-auth-register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegisterSubmit(modal);
            });
        }

        // Switch to register
        const switchToRegister = modal.querySelector('#switch-to-register');
        if (switchToRegister) {
            switchToRegister.addEventListener('click', () => {
                this.showStep(modal, 'dashboard-register-step');
            });
        }

        // Switch to login
        const switchToLogin = modal.querySelector('#switch-to-login');
        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => {
                this.showStep(modal, 'dashboard-login-step');
            });
        }

        // OTP form
        const otpForm = modal.querySelector('#dashboard-auth-otp-form');
        otpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleOTPSubmit(modal, type);
        });

        // Resend button
        const resendBtn = modal.querySelector('#dashboard-resend-code-btn');
        resendBtn.addEventListener('click', () => this.resendCode(modal));

        // Password toggle for login
        const togglePassword = modal.querySelector('#toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                const passwordInput = modal.querySelector('#dashboard-auth-password');
                const icon = togglePassword.querySelector('i');
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }

        // Password toggle for register
        const toggleRegisterPassword = modal.querySelector('#toggle-register-password');
        if (toggleRegisterPassword) {
            toggleRegisterPassword.addEventListener('click', () => {
                const passwordInput = modal.querySelector('#dashboard-register-password');
                const icon = toggleRegisterPassword.querySelector('i');
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }

        // Auto-format OTP
        const otpInput = modal.querySelector('#dashboard-auth-otp');
        otpInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    async handleLoginSubmit(modal, type) {
        const emailInput = modal.querySelector('#dashboard-auth-email');
        const passwordInput = modal.querySelector('#dashboard-auth-password');
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!this.validateEmail(email)) {
            this.showMessage(modal, 'Please enter a valid email address', 'error');
            return;
        }

        if (!password || password.length < 6) {
            this.showMessage(modal, 'Password must be at least 6 characters', 'error');
            return;
        }

        const submitBtn = modal.querySelector('#dashboard-auth-login-form button[type="submit"]');
        this.setButtonLoading(submitBtn, true);

        try {
            if (!supabase) throw new Error('Supabase not initialized');

            // Login with email and password
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            // Successful login - redirect based on type
            if (type === 'user') {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'admin.html';
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(modal, error.message || 'Invalid email or password', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleRegisterSubmit(modal) {
        const emailInput = modal.querySelector('#dashboard-register-email');
        const passwordInput = modal.querySelector('#dashboard-register-password');
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!this.validateEmail(email)) {
            this.showMessage(modal, 'Please enter a valid email address', 'error');
            return;
        }

        if (!password || password.length < 6) {
            this.showMessage(modal, 'Password must be at least 6 characters', 'error');
            return;
        }

        const submitBtn = modal.querySelector('#dashboard-auth-register-form button[type="submit"]');
        this.setButtonLoading(submitBtn, true);

        try {
            if (!supabase) throw new Error('Supabase not initialized');

            // Register user and send OTP for email verification
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: window.location.origin + '/dashboard.html'
                }
            });

            if (error) throw error;

            this.currentEmail = email;
            this.currentPassword = password;
            this.currentType = 'user';
            
            // Show OTP step
            const emailDisplay = modal.querySelector('#dashboard-verify-email-display');
            emailDisplay.textContent = email;
            
            this.showStep(modal, 'dashboard-otp-step');
            this.showMessage(modal, 'Verification code sent to your email!', 'success');
            
            // Focus on OTP input
            setTimeout(() => {
                const otpInput = modal.querySelector('#dashboard-auth-otp');
                otpInput.focus();
            }, 100);

        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage(modal, error.message || 'Failed to register. Email may already be in use.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleOTPSubmit(modal, type) {
        const otpInput = modal.querySelector('#dashboard-auth-otp');
        const otp = otpInput.value.trim();

        if (otp.length !== 6) {
            this.showMessage(modal, 'Please enter a 6-digit code', 'error');
            return;
        }

        const submitBtn = modal.querySelector('#dashboard-auth-otp-form button[type="submit"]');
        this.setButtonLoading(submitBtn, true);

        try {
            if (!supabase) throw new Error('Supabase not initialized');

            const { data, error } = await supabase.auth.verifyOtp({
                email: this.currentEmail,
                token: otp,
                type: 'email'
            });

            if (error) throw error;

            // Successful registration verification - redirect to dashboard
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error('OTP verification error:', error);
            this.showMessage(modal, error.message || 'Invalid verification code', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async resendCode(modal) {
        if (!this.currentEmail || !this.currentPassword) {
            this.showMessage(modal, 'Please start over', 'error');
            this.showStep(modal, 'dashboard-register-step');
            return;
        }

        const resendBtn = modal.querySelector('#dashboard-resend-code-btn');
        this.setButtonLoading(resendBtn, true);

        try {
            if (!supabase) throw new Error('Supabase not initialized');

            // Resend OTP for registration
            const { data, error } = await supabase.auth.signUp({
                email: this.currentEmail,
                password: this.currentPassword,
                options: {
                    emailRedirectTo: window.location.origin + '/dashboard.html'
                }
            });

            if (error) throw error;

            this.showMessage(modal, 'New code sent to your email!', 'success');

        } catch (error) {
            console.error('Resend error:', error);
            this.showMessage(modal, error.message || 'Failed to resend code', 'error');
        } finally {
            this.setButtonLoading(resendBtn, false);
        }
    }

    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    showStep(modal, stepId) {
        modal.querySelectorAll('.auth-step').forEach(step => {
            step.classList.remove('active');
        });

        const targetStep = modal.querySelector(`#${stepId}`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
    }

    showMessage(modal, message, type = 'info') {
        const messageDiv = modal.querySelector('#dashboard-auth-message');
        if (!messageDiv) return;

        messageDiv.textContent = message;
        messageDiv.className = `auth-message ${type}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    setButtonLoading(button, isLoading) {
        if (!button) return;

        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || button.innerHTML;
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

// Initialize dashboard auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure Supabase is initialized
    setTimeout(() => {
        if (!supabase) {
            console.error('⚠️ Supabase client not initialized in dashboard-auth.js');
        }
        window.dashboardAuth = new DashboardAuth();
        console.log('🔐 Dashboard authentication initialized');
    }, 100);
});
