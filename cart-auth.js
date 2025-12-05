// ========================================
// CART PAGE AUTHENTICATION
// ========================================

class CartAuth {
    constructor() {
        this.currentEmail = null;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        this.checkAuthStatus();

        // Attach event listeners
        this.attachEventListeners();
    }

    async checkAuthStatus() {
        try {
            if (!supabase) {
                console.error('Supabase not initialized');
                return;
            }

            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;

            if (session) {
                this.currentUser = session.user;
                this.updateUIForLoggedInUser(session.user);
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }

    attachEventListeners() {
        // Login button
        const loginBtn = document.getElementById('cart-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.openLoginModal());
        }

        // Close modal buttons
        const closeBtn = document.querySelector('.auth-close-btn');
        const modalOverlay = document.querySelector('.auth-modal-overlay');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeLoginModal());
        }
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => this.closeLoginModal());
        }

        // Email form submission
        const emailForm = document.getElementById('auth-email-form');
        if (emailForm) {
            emailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEmailSubmit();
            });
        }

        // OTP form submission
        const otpForm = document.getElementById('auth-otp-form');
        if (otpForm) {
            otpForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOTPSubmit();
            });
        }

        // Resend code button
        const resendBtn = document.getElementById('resend-code-btn');
        if (resendBtn) {
            resendBtn.addEventListener('click', () => this.resendCode());
        }

        // Continue shopping button
        const continueBtn = document.getElementById('continue-shopping-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.closeLoginModal());
        }

        // Auto-format OTP input
        const otpInput = document.getElementById('auth-otp');
        if (otpInput) {
            otpInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }
    }

    openLoginModal() {
        const modal = document.getElementById('cart-login-modal');
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Focus on email input
            setTimeout(() => {
                const emailInput = document.getElementById('auth-email');
                if (emailInput) emailInput.focus();
            }, 100);
        }
    }

    closeLoginModal() {
        const modal = document.getElementById('cart-login-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            // Reset to email step
            this.showStep('email-step');
            this.clearMessage();
        }
    }

    showStep(stepId) {
        // Hide all steps
        document.querySelectorAll('.auth-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show target step
        const targetStep = document.getElementById(stepId);
        if (targetStep) {
            targetStep.classList.add('active');
        }
    }

    async handleEmailSubmit() {
        const emailInput = document.getElementById('auth-email');
        const email = emailInput.value.trim();

        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        const submitBtn = document.querySelector('#auth-email-form button[type="submit"]');
        this.setButtonLoading(submitBtn, true);

        try {
            if (!supabase) throw new Error('Supabase not initialized');

            // Send OTP (will create user if doesn't exist)
            const { data, error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: true
                }
            });

            if (error) throw error;

            this.currentEmail = email;
            
            // Show OTP step
            const emailDisplay = document.getElementById('verify-email-display');
            if (emailDisplay) emailDisplay.textContent = email;
            
            this.showStep('otp-step');
            this.showMessage('Verification code sent to your email!', 'success');
            
            // Focus on OTP input
            setTimeout(() => {
                const otpInput = document.getElementById('auth-otp');
                if (otpInput) otpInput.focus();
            }, 100);

        } catch (error) {
            console.error('Email submit error:', error);
            this.showMessage(error.message || 'Failed to send verification code', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async handleOTPSubmit() {
        const otpInput = document.getElementById('auth-otp');
        const otp = otpInput.value.trim();

        if (otp.length !== 6) {
            this.showMessage('Please enter a 6-digit code', 'error');
            return;
        }

        const submitBtn = document.querySelector('#auth-otp-form button[type="submit"]');
        this.setButtonLoading(submitBtn, true);

        try {
            if (!supabase) throw new Error('Supabase not initialized');

            const { data, error } = await supabase.auth.verifyOtp({
                email: this.currentEmail,
                token: otp,
                type: 'email'
            });

            if (error) throw error;

            this.currentUser = data.user;
            
            // Update UI
            const userEmailDisplay = document.getElementById('user-email-display');
            if (userEmailDisplay) {
                userEmailDisplay.textContent = this.currentUser.email;
            }

            this.showStep('success-step');
            this.updateUIForLoggedInUser(this.currentUser);
            
            // Auto close after 2 seconds
            setTimeout(() => {
                this.closeLoginModal();
            }, 2000);

        } catch (error) {
            console.error('OTP verification error:', error);
            this.showMessage(error.message || 'Invalid verification code', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    async resendCode() {
        if (!this.currentEmail) {
            this.showMessage('Please start over', 'error');
            this.showStep('email-step');
            return;
        }

        const resendBtn = document.getElementById('resend-code-btn');
        this.setButtonLoading(resendBtn, true);

        try {
            if (!supabase) throw new Error('Supabase not initialized');

            const { data, error } = await supabase.auth.signInWithOtp({
                email: this.currentEmail,
                options: {
                    shouldCreateUser: true
                }
            });

            if (error) throw error;

            this.showMessage('New code sent to your email!', 'success');

        } catch (error) {
            console.error('Resend error:', error);
            this.showMessage(error.message || 'Failed to resend code', 'error');
        } finally {
            this.setButtonLoading(resendBtn, false);
        }
    }

    updateUIForLoggedInUser(user) {
        const accountSection = document.getElementById('cart-account-section');
        const loginBtn = document.getElementById('cart-login-btn');
        const accountStatus = document.getElementById('account-status');

        if (accountStatus) {
            accountStatus.innerHTML = `
                <i class="fas fa-check-circle" style="color: #28a745;"></i>
                <span>Logged in as: <strong>${user.email}</strong></span>
            `;
        }

        if (loginBtn) {
            loginBtn.innerHTML = `
                <i class="fas fa-sign-out-alt"></i>
                Logout
            `;
            loginBtn.onclick = () => this.handleLogout();
        }
    }

    async handleLogout() {
        try {
            if (!supabase) throw new Error('Supabase not initialized');

            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            this.currentEmail = null;

            // Reset UI
            const accountStatus = document.getElementById('account-status');
            const loginBtn = document.getElementById('cart-login-btn');

            if (accountStatus) {
                accountStatus.innerHTML = `
                    <i class="fas fa-user-circle"></i>
                    <span>Sign in for faster checkout</span>
                `;
            }

            if (loginBtn) {
                loginBtn.innerHTML = `
                    <i class="fas fa-sign-in-alt"></i>
                    Login / Register
                `;
                loginBtn.onclick = () => this.openLoginModal();
            }

            this.showMessage('Logged out successfully', 'success');

        } catch (error) {
            console.error('Logout error:', error);
            this.showMessage('Failed to logout', 'error');
        }
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.getElementById('auth-message');
        if (!messageDiv) return;

        messageDiv.textContent = message;
        messageDiv.className = `auth-message ${type}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    clearMessage() {
        const messageDiv = document.getElementById('auth-message');
        if (messageDiv) {
            messageDiv.style.display = 'none';
            messageDiv.textContent = '';
        }
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

// Initialize cart auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartAuth = new CartAuth();
    console.log('🔐 Cart authentication initialized');
});
