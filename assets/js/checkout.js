// Checkout Modal Functionality
(function() {
    'use strict';

    // Elements
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const closeBtn = document.querySelector('.checkout-close-btn');
    const overlay = document.querySelector('.checkout-modal-overlay');
    const checkoutForm = document.getElementById('checkout-form');
    const steps = document.querySelectorAll('.checkout-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // Buttons
    const nextBtn = document.querySelector('.checkout-next-btn');
    const backBtn = document.querySelector('.checkout-back-btn');
    const submitBtn = document.querySelector('.checkout-submit-btn');
    const doneBtn = document.querySelector('.checkout-done-btn');
    const copyIdBtn = document.querySelector('.copy-id-btn');

    let currentStep = 1;
    let orderData = {};

    // Open checkout modal
    function openCheckoutModal() {
        checkoutModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentStep = 1;
        showStep(1);
    }

    // Close checkout modal
    function closeCheckoutModal() {
        checkoutModal.classList.remove('active');
        document.body.style.overflow = '';
        resetForm();
    }

    // Show specific step
    function showStep(stepNumber) {
        // Hide all steps
        steps.forEach(step => step.classList.remove('active'));
        progressSteps.forEach(step => step.classList.remove('active'));

        // Show current step
        const currentStepEl = document.querySelector(`[data-step="${stepNumber}"]`);
        if (currentStepEl && currentStepEl.classList.contains('checkout-step')) {
            currentStepEl.classList.add('active');
        }

        // Update progress
        progressSteps.forEach((step, index) => {
            if (index + 1 <= stepNumber) {
                step.classList.add('active');
            }
        });

        currentStep = stepNumber;
    }

    // Validate step 1 (Customer Information)
    function validateStep1() {
        const name = document.getElementById('customer-name').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const address = document.getElementById('delivery-address').value.trim();

        if (!name) {
            alert('Please enter your full name');
            document.getElementById('customer-name').focus();
            return false;
        }

        if (!email || !isValidEmail(email)) {
            alert('Please enter a valid email address');
            document.getElementById('customer-email').focus();
            return false;
        }

        if (!phone) {
            alert('Please enter your phone number');
            document.getElementById('customer-phone').focus();
            return false;
        }

        if (!address) {
            alert('Please enter your delivery address');
            document.getElementById('delivery-address').focus();
            return false;
        }

        // Save data
        orderData.name = name;
        orderData.email = email;
        orderData.phone = phone;
        orderData.address = address;

        return true;
    }

    // Validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate step 2 (Payment Method)
    function validateStep2() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        
        if (!paymentMethod) {
            alert('Please select a payment method');
            return false;
        }

        orderData.paymentMethod = paymentMethod.value;
        return true;
    }

    // Generate delivery ID
    function generateDeliveryId() {
        const prefix = 'AFRO';
        const timestamp = Date.now().toString().slice(-4);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }

    // Format payment method for display
    function formatPaymentMethod(method) {
        const methods = {
            'card': 'Debit/Credit Card',
            'transfer': 'Bank Transfer',
            'cash': 'Cash on Delivery',
            'mobile': 'Mobile Payment'
        };
        return methods[method] || method;
    }

    // Display order confirmation
    function displayConfirmation() {
        const deliveryId = generateDeliveryId();
        
        // Update delivery ID
        document.getElementById('delivery-id-text').textContent = deliveryId;
        
        // Update confirmation details
        document.getElementById('confirm-name').textContent = orderData.name;
        document.getElementById('confirm-email').textContent = orderData.email;
        document.getElementById('confirm-phone').textContent = orderData.phone;
        document.getElementById('confirm-payment').textContent = formatPaymentMethod(orderData.paymentMethod);
        
        // Get total from page
        const totalElement = document.querySelector('.total-amount strong');
        const total = totalElement ? totalElement.textContent : '₦11,556.25';
        document.getElementById('confirm-total').textContent = total;

        // Store delivery ID
        orderData.deliveryId = deliveryId;

        // Save to localStorage for tracking
        saveOrderToLocalStorage(orderData);

        // Show success notification
        showSuccessNotification();
    }

    // Save order to localStorage
    function saveOrderToLocalStorage(order) {
        try {
            let orders = JSON.parse(localStorage.getItem('afrocrib_orders') || '[]');
            order.orderDate = new Date().toISOString();
            order.status = 'Pending';
            orders.push(order);
            localStorage.setItem('afrocrib_orders', JSON.stringify(orders));
        } catch (e) {
            console.error('Error saving order:', e);
        }
    }

    // Copy delivery ID to clipboard
    function copyDeliveryId() {
        const deliveryIdText = document.getElementById('delivery-id-text').textContent;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(deliveryIdText).then(() => {
                // Show feedback
                const btn = copyIdBtn;
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.style.background = '#4caf50';
                
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                fallbackCopyToClipboard(deliveryIdText);
            });
        } else {
            fallbackCopyToClipboard(deliveryIdText);
        }
    }

    // Fallback copy method for older browsers
    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            alert('Delivery ID copied: ' + text);
        } catch (err) {
            alert('Delivery ID: ' + text + '\n\nPlease copy it manually.');
        }
        
        document.body.removeChild(textArea);
    }

    // Show success notification
    function showSuccessNotification() {
        // You can implement a toast notification here
        console.log('Order placed successfully!');
    }

    // Reset form
    function resetForm() {
        checkoutForm.reset();
        orderData = {};
        currentStep = 1;
        showStep(1);
    }

    // Event Listeners
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', openCheckoutModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeCheckoutModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeCheckoutModal);
    }

    // Next button (Step 1 -> Step 2)
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validateStep1()) {
                showStep(2);
            }
        });
    }

    // Back button (Step 2 -> Step 1)
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showStep(1);
        });
    }

    // Form submission (Step 2 -> Step 3)
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (validateStep2()) {
                displayConfirmation();
                showStep(3);
            }
        });
    }

    // Done button (Close modal)
    if (doneBtn) {
        doneBtn.addEventListener('click', () => {
            closeCheckoutModal();
            // Optionally redirect to home or orders page
            // window.location.href = 'index.html';
        });
    }

    // Copy delivery ID button
    if (copyIdBtn) {
        copyIdBtn.addEventListener('click', copyDeliveryId);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && checkoutModal.classList.contains('active')) {
            closeCheckoutModal();
        }
    });

    // Prevent modal content click from closing
    const modalContent = document.querySelector('.checkout-modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

})();
