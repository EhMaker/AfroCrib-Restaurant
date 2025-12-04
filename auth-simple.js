// ========================================
// SIMPLE SUPABASE EMAIL OTP AUTHENTICATION
// ========================================

// Supabase Configuration
const SUPABASE_URL = 'https://fppnpevkegctkefjipoe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcG5wZXZrZWdjdGtlZmppcG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzA4NTMsImV4cCI6MjA3NTYwNjg1M30.l183uTySyCDqDDPjqQd8zBcVNoLI-xuQ_WYSj8g4Dzw';

// Initialize Supabase client
let supabase;

// Check if we're in browser environment and Supabase library is loaded
if (typeof window !== 'undefined' && window.supabase) {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
    }
} else {
    console.error('❌ Supabase library not loaded. Make sure the CDN script is included.');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

function showLoading(button, isLoading, originalText) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = '⏳ Loading...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || originalText;
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ========================================
// CHECK SESSION & PROTECT PAGES
// ========================================

async function checkSession() {
    if (!supabase) return null;
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
        console.error('Session error:', error);
        return null;
    }
    
    return session;
}

async function requireAuth() {
    const session = await checkSession();
    
    if (!session) {
        // Not logged in, redirect to login
        window.location.href = 'login.html';
        return null;
    }
    
    return session;
}

async function redirectIfAuthenticated() {
    const session = await checkSession();
    
    if (session) {
        // Already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// ========================================
// LOGOUT FUNCTION
// ========================================

async function logout() {
    if (!supabase) return;
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
        console.error('Logout error:', error);
        showMessage('Logout failed. Please try again.', 'error');
        return;
    }
    
    console.log('✅ Logged out successfully');
    window.location.href = 'login.html';
}

// ========================================
// GET CURRENT USER
// ========================================

async function getCurrentUser() {
    if (!supabase) return null;
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
        console.error('Get user error:', error);
        return null;
    }
    
    return user;
}
