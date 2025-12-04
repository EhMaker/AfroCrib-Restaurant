// ========================================
// VERIFICATION MODAL COMPONENT
// ========================================

// Show verification modal
function showVerifyModal(email) {
    const overlay = document.getElementById('verify-modal-overlay');
    const emailDisplay = document.getElementById('verify-modal-email');
    const otpInput = document.getElementById('verify-modal-otp');
    const messageDiv = document.getElementById('verify-modal-message');
    
    // Set email display
    if (emailDisplay) {
        emailDisplay.textContent = email;
    }
    
    // Store email
    sessionStorage.setItem('verification_email', email);
    
    // Clear previous input
    if (otpInput) {
        otpInput.value = '';
    }
    
    // Hide any previous messages
    if (messageDiv) {
        messageDiv.style.display = 'none';
    }
    
    // Show modal with animation
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        
        // Focus on OTP input
        setTimeout(() => {
            if (otpInput) otpInput.focus();
        }, 300);
    }
}

// Hide verification modal
function hideVerifyModal() {
    const overlay = document.getElementById('verify-modal-overlay');
    
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }
}

// Show message in modal
function showVerifyMessage(message, type = 'info') {
    const messageDiv = document.getElementById('verify-modal-message');
    
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `verify-message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// Initialize verification modal
function initVerifyModal() {
    // Close button handler
    const closeBtn = document.getElementById('verify-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideVerifyModal);
    }
    
    // Close on overlay click (outside modal)
    const overlay = document.getElementById('verify-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                hideVerifyModal();
            }
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideVerifyModal();
        }
    });
    
    // Verify button handler
    const verifyBtn = document.getElementById('verify-modal-btn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', handleVerifyOTP);
    }
    
    // Resend button handler
    const resendBtn = document.getElementById('verify-modal-resend');
    if (resendBtn) {
        resendBtn.addEventListener('click', handleResendOTP);
    }
    
    // OTP input - allow only numbers
    const otpInput = document.getElementById('verify-modal-otp');
    if (otpInput) {
        otpInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
        
        // Submit on Enter key
        otpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleVerifyOTP();
            }
        });
    }
}

// Handle OTP verification
async function handleVerifyOTP() {
    const otpInput = document.getElementById('verify-modal-otp');
    const verifyBtn = document.getElementById('verify-modal-btn');
    const email = sessionStorage.getItem('verification_email');
    
    if (!email) {
        showVerifyMessage('Session expired. Please try again.', 'error');
        return;
    }
    
    const otp = otpInput.value.trim();
    
    // Validate OTP
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        showVerifyMessage('Please enter a valid 6-digit code', 'error');
        return;
    }
    
    // Show loading
    showLoading(verifyBtn, true);
    
    try {
        // Verify OTP with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
            email: email,
            token: otp,
            type: 'email'
        });
        
        if (error) throw error;
        
        // Success!
        showVerifyMessage('✅ Verified! Redirecting to dashboard...', 'success');
        
        // Clear stored email
        sessionStorage.removeItem('verification_email');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Verification error:', error);
        showVerifyMessage(error.message || 'Invalid code. Please try again.', 'error');
    } finally {
        showLoading(verifyBtn, false, 'Verify & Login');
    }
}

// Handle resend OTP
async function handleResendOTP() {
    const resendBtn = document.getElementById('verify-modal-resend');
    const email = sessionStorage.getItem('verification_email');
    
    if (!email) {
        showVerifyMessage('Session expired. Please try again.', 'error');
        return;
    }
    
    showLoading(resendBtn, true);
    
    try {
        const { data, error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: true
            }
        });
        
        if (error) throw error;
        
        showVerifyMessage('✅ New code sent to your email!', 'success');
        
    } catch (error) {
        console.error('Resend error:', error);
        showVerifyMessage(error.message || 'Failed to resend code', 'error');
    } finally {
        showLoading(resendBtn, false, 'Resend Code');
    }
}

// Initialize modal when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVerifyModal);
} else {
    initVerifyModal();
}
