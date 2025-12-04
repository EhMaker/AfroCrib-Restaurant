// ========================================
// SUPABASE AUTHENTICATION SYSTEM
// ========================================

// Supabase Configuration (Replace with your actual credentials)
const SUPABASE_URL = 'https://fppnpevkegctkefjipoe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcG5wZXZrZWdjdGtlZmppcG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzA4NTMsImV4cCI6MjA3NTYwNjg1M30.l183uTySyCDqDDPjqQd8zBcVNoLI-xuQ_WYSj8g4Dzw';

// Initialize Supabase client
let supabase;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase (only if credentials are provided)s
    if (SUPABASE_URL !== 'https://fppnpevkegctkefjipoe.supabase.co' && SUPABASE_ANON_KEY !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcG5wZXZrZWdjdGtlZmppcG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzA4NTMsImV4cCI6MjA3NTYwNjg1M30.l183uTySyCDqDDPjqQd8zBcVNoLI-xuQ_WYSj8g4Dzw') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized');
    } else {
        console.log('⚠️ Please update SUPABASE_URL and SUPABASE_ANON_KEY in auth.js');
    }
    
    // Initialize auth system
    initializeAuth();
});

// ========================================
// AUTHENTICATION STATE MANAGEMENT
// ========================================

class AuthFlow {
    constructor() {
        this.currentStep = 'email';
        this.userEmail = '';
        this.tempUserData = {};
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Steps
        this.emailStep = document.getElementById('email-step');
        this.verificationStep = document.getElementById('verification-step');
        this.registrationStep = document.getElementById('registration-step');
        this.successStep = document.getElementById('success-step');

        // Inputs
        this.emailInput = document.getElementById('email-input');
        this.verificationCode = document.getElementById('verification-code');
        this.fullName = document.getElementById('full-name');
        this.phoneNumber = document.getElementById('phone-number');
        this.password = document.getElementById('password');
        this.confirmPassword = document.getElementById('confirm-password');

        // Buttons
        this.joinBtn = document.getElementById('join-btn');
        this.verifyBtn = document.getElementById('verify-btn');
        this.resendBtn = document.getElementById('resend-btn');
        this.registerBtn = document.getElementById('register-btn');
        this.exploreMenuBtn = document.getElementById('explore-menu-btn');

        // Display elements
        this.emailDisplay = document.getElementById('email-display');
    }

    attachEventListeners() {
        // Email step
        this.joinBtn?.addEventListener('click', () => this.handleEmailSubmit());
        this.emailInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleEmailSubmit();
        });

        // Verification step
        this.verifyBtn?.addEventListener('click', () => this.handleVerificationSubmit());
        this.resendBtn?.addEventListener('click', () => this.handleResendCode());
        this.verificationCode?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleVerificationSubmit();
        });

        // Registration step
        this.registerBtn?.addEventListener('click', () => this.handleRegistrationSubmit());
        this.confirmPassword?.addEventListener('input', () => this.validatePasswordMatch());

        // Success step
        this.exploreMenuBtn?.addEventListener('click', () => this.handleExploreMenu());
    }

    // ========================================
    // STEP MANAGEMENT
    // ========================================

    showStep(stepName) {
        // Hide all steps
        document.querySelectorAll('.auth-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show target step
        const targetStep = document.getElementById(`${stepName}-step`);
        if (targetStep) {
            targetStep.classList.add('active');
            this.currentStep = stepName;
        }
    }

    showError(element, message) {
        // Remove existing error
        this.clearError(element);

        // Add error class
        element.classList.add('error');

        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        element.parentNode.insertBefore(errorDiv, element.nextSibling);
    }

    clearError(element) {
        element.classList.remove('error');
        const errorMsg = element.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    clearAllErrors() {
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.remove());
    }

    setLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            button.textContent = 'Loading...';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    // ========================================
    // EMAIL STEP
    // ========================================

    async handleEmailSubmit() {
        const email = this.emailInput.value.trim();

        // Clear previous errors
        this.clearAllErrors();

        // Validate email
        if (!email) {
            this.showError(this.emailInput, 'Please enter your email address');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError(this.emailInput, 'Please enter a valid email address');
            return;
        }

        // Check if Supabase is initialized
        if (!supabase) {
            this.showError(this.emailInput, 'Authentication service not configured. Please contact support.');
            return;
        }

        // Set loading state
        this.setLoading(this.joinBtn, true);

        try {
            // Send OTP to email using Supabase
            const { data, error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: false // We'll create user later with additional info
                }
            });

            if (error) {
                throw error;
            }

            // Store email and move to verification step
            this.userEmail = email;
            this.emailDisplay.textContent = email;
            this.showStep('verification');
            
            console.log('✅ Verification code sent to:', email);

        } catch (error) {
            console.error('Email submission error:', error);
            this.showError(this.emailInput, error.message || 'Failed to send verification code. Please try again.');
        } finally {
            this.setLoading(this.joinBtn, false);
            this.joinBtn.textContent = 'Join Now';
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ========================================
    // VERIFICATION STEP
    // ========================================

    async handleVerificationSubmit() {
        const code = this.verificationCode.value.trim();

        // Clear previous errors
        this.clearAllErrors();

        // Validate code
        if (!code) {
            this.showError(this.verificationCode, 'Please enter the verification code');
            return;
        }

        if (code.length !== 6) {
            this.showError(this.verificationCode, 'Verification code must be 6 digits');
            return;
        }

        // Set loading state
        this.setLoading(this.verifyBtn, true);

        try {
            // Verify OTP with Supabase
            const { data, error } = await supabase.auth.verifyOtp({
                email: this.userEmail,
                token: code,
                type: 'email'
            });

            if (error) {
                throw error;
            }

            // Check if user already exists
            if (data.user) {
                // User exists, show success message
                this.showStep('success');
                console.log('✅ User verified and logged in');
            } else {
                // New user, proceed to registration
                this.showStep('registration');
                console.log('✅ Code verified, proceeding to registration');
            }

        } catch (error) {
            console.error('Verification error:', error);
            this.showError(this.verificationCode, error.message || 'Invalid verification code. Please try again.');
        } finally {
            this.setLoading(this.verifyBtn, false);
            this.verifyBtn.textContent = 'Verify Code';
        }
    }

    async handleResendCode() {
        // Set loading state
        this.setLoading(this.resendBtn, true);

        try {
            // Resend OTP
            const { data, error } = await supabase.auth.signInWithOtp({
                email: this.userEmail
            });

            if (error) {
                throw error;
            }

            // Show success feedback
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.textContent = 'Verification code resent successfully!';
            successMsg.style.fontSize = '0.875rem';
            successMsg.style.marginTop = '0.5rem';
            
            this.verificationCode.parentNode.insertBefore(successMsg, this.verificationCode.nextSibling);

            // Remove success message after 3 seconds
            setTimeout(() => {
                if (successMsg.parentNode) {
                    successMsg.remove();
                }
            }, 3000);

            console.log('✅ Verification code resent');

        } catch (error) {
            console.error('Resend error:', error);
            alert('Failed to resend code. Please try again.');
        } finally {
            this.setLoading(this.resendBtn, false);
            this.resendBtn.textContent = 'Resend Code';
        }
    }

    // ========================================
    // REGISTRATION STEP
    // ========================================

    async handleRegistrationSubmit() {
        // Clear previous errors
        this.clearAllErrors();

        // Get form data
        const userData = {
            fullName: this.fullName.value.trim(),
            phoneNumber: this.phoneNumber.value.trim(),
            password: this.password.value,
            confirmPassword: this.confirmPassword.value
        };

        // Validate form
        if (!this.validateRegistrationForm(userData)) {
            return;
        }

        // Set loading state
        this.setLoading(this.registerBtn, true);

        try {
            // Update user profile with additional information
            const { data, error } = await supabase.auth.updateUser({
                password: userData.password,
                data: {
                    full_name: userData.fullName,
                    phone_number: userData.phoneNumber,
                    email: this.userEmail
                }
            });

            if (error) {
                throw error;
            }

            // Store user data in database (optional)
            await this.saveUserProfile(userData);

            // Show success step
            this.showStep('success');
            console.log('✅ User registration completed');

        } catch (error) {
            console.error('Registration error:', error);
            this.showError(this.registerBtn.parentNode, error.message || 'Registration failed. Please try again.');
        } finally {
            this.setLoading(this.registerBtn, false);
            this.registerBtn.textContent = 'Complete Registration';
        }
    }

    validateRegistrationForm(userData) {
        let isValid = true;

        // Validate full name
        if (!userData.fullName) {
            this.showError(this.fullName, 'Please enter your full name');
            isValid = false;
        }

        // Validate phone number
        if (!userData.phoneNumber) {
            this.showError(this.phoneNumber, 'Please enter your phone number');
            isValid = false;
        } else if (!this.isValidPhoneNumber(userData.phoneNumber)) {
            this.showError(this.phoneNumber, 'Please enter a valid phone number');
            isValid = false;
        }

        // Validate password
        if (!userData.password) {
            this.showError(this.password, 'Please enter a password');
            isValid = false;
        } else if (userData.password.length < 6) {
            this.showError(this.password, 'Password must be at least 6 characters');
            isValid = false;
        }

        // Validate password confirmation
        if (userData.password !== userData.confirmPassword) {
            this.showError(this.confirmPassword, 'Passwords do not match');
            isValid = false;
        }

        return isValid;
    }

    validatePasswordMatch() {
        if (this.password.value && this.confirmPassword.value) {
            if (this.password.value !== this.confirmPassword.value) {
                this.showError(this.confirmPassword, 'Passwords do not match');
            } else {
                this.clearError(this.confirmPassword);
                this.confirmPassword.classList.add('success');
            }
        }
    }

    isValidPhoneNumber(phone) {
        // Basic phone validation (adjust regex based on your requirements)
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    async saveUserProfile(userData) {
        try {
            // Create user profile in your custom table (optional)
            const { data, error } = await supabase
                .from('user_profiles')
                .insert([
                    {
                        email: this.userEmail,
                        full_name: userData.fullName,
                        phone_number: userData.phoneNumber,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error && error.code !== '42P01') { // Ignore table doesn't exist error
                console.warn('Profile save error:', error);
            }
        } catch (error) {
            console.warn('Profile save error:', error);
        }
    }

    // ========================================
    // SUCCESS STEP
    // ========================================

    handleExploreMenu() {
        // Redirect to shop page
        window.location.href = 'shop.html';
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    reset() {
        // Reset form
        this.emailInput.value = '';
        this.verificationCode.value = '';
        this.fullName.value = '';
        this.phoneNumber.value = '';
        this.password.value = '';
        this.confirmPassword.value = '';

        // Clear errors
        this.clearAllErrors();

        // Reset to first step
        this.showStep('email');

        // Reset state
        this.currentStep = 'email';
        this.userEmail = '';
        this.tempUserData = {};
    }
}

// ========================================
// INITIALIZATION
// ========================================

let authFlow;

function initializeAuth() {
    authFlow = new AuthFlow();
    console.log('🔐 Authentication system initialized');
}

// Global functions for external access
window.AuthFlow = AuthFlow;
window.authFlow = authFlow;

// ========================================
// SUPABASE SESSION MANAGEMENT
// ========================================

// Listen for auth state changes
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        if (supabase) {
            supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state change:', event, session);
                
                if (event === 'SIGNED_IN') {
                    console.log('✅ User signed in:', session.user.email);
                    // You can add additional logic here for signed-in users
                }
                
                if (event === 'SIGNED_OUT') {
                    console.log('👋 User signed out');
                    // Reset auth flow if user signs out
                    if (authFlow) {
                        authFlow.reset();
                    }
                }
            });
        }
    });
}