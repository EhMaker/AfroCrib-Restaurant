// ========================================
// DASHBOARD AUTHENTICATION HANDLER
// ========================================

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
                this.handleUserLogin();
            });
        }

        // Admin Login link
        const adminLoginLink = document.getElementById('admin-login-link');
        if (adminLoginLink) {
            adminLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAdminLogin();
            });
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
                        <!-- Email Input Step -->
                        <div id="dashboard-email-step" class="auth-step active">
                            <form id="dashboard-auth-email-form">
                                <div class="form-group">
                                    <label for="dashboard-auth-email">Email Address</label>
                                    <input type="email" 
                                           id="dashboard-auth-email" 
                                           class="form-control" 
                                           placeholder="Enter your email"
                                           required>
                                </div>
                                <button type="submit" class="auth-btn">
                                    <i class="fas fa-envelope"></i>
                                    Continue with Email
                                </button>
                            </form>
                            ${type === 'user' ? `
                            <div class="auth-note">
                                <i class="fas fa-info-circle"></i>
                                <span>New user? We'll automatically register you!</span>
                            </div>
                            ` : ''}
                        </div>

                        <!-- OTP Verification Step -->
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
                                    Verify & Login
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

        // Email form
        const emailForm = modal.querySelector('#dashboard-auth-email-form');
        emailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEmailSubmit(modal, type);
        });

        // OTP form
        const otpForm = modal.querySelector('#dashboard-auth-otp-form');
        otpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleOTPSubmit(modal, type);
        });

        // Resend button
        const resendBtn = modal.querySelector('#dashboard-resend-code-btn');
        resendBtn.addEventListener('click', () => this.resendCode(modal));

        // Auto-format OTP
        const otpInput = modal.querySelector('#dashboard-auth-otp');
        otpInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    async handleEmailSubmit(modal, type) {
        const emailInput = modal.querySelector('#dashboard-auth-email');
        const email = emailInput.value.trim();

        if (!this.validateEmail(email)) {
            this.showMessage(modal, 'Please enter a valid email address', 'error');
            return;
        }

        const submitBtn = modal.querySelector('#dashboard-auth-email-form button[type="submit"]');
        this.setButtonLoading(submitBtn, true);

        try {
            if (!supabase) throw new Error('Supabase not initialized');

            // Send OTP (creates user if doesn't exist for user type only)
            const { data, error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: type === 'user' // Only allow registration for users, not admins
                }
            });

            if (error) throw error;

            this.currentEmail = email;
            this.currentType = type;
            
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
            console.error('Email submit error:', error);
            this.showMessage(modal, error.message || 'Failed to send verification code', 'error');
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

            // Successful login - redirect based on type
            if (type === 'user') {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'admin.html';
            }

        } catch (error) {
            console.error('OTP verification error:', error);
            this.showMessage(modal, error.message || 'Invalid verification code', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async resendCode(modal) {
        if (!this.currentEmail) {
            this.showMessage(modal, 'Please start over', 'error');
            this.showStep(modal, 'dashboard-email-step');
            return;
        }

        const resendBtn = modal.querySelector('#dashboard-resend-code-btn');
        this.setButtonLoading(resendBtn, true);

        try {
            if (!supabase) throw new Error('Supabase not initialized');

            const { data, error } = await supabase.auth.signInWithOtp({
                email: this.currentEmail,
                options: {
                    shouldCreateUser: this.currentType === 'user'
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
    window.dashboardAuth = new DashboardAuth();
    console.log('🔐 Dashboard authentication initialized');
});
