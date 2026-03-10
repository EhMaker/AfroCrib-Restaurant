# 🔐 AFROCRIB Authentication System - User Guide

## Overview
Your restaurant website now has a **simplified email OTP authentication system** powered by Supabase. Users can sign up and log in using just their email - no passwords required!

---

## 🎯 How It Works

### **User Flow:**
```
1. User clicks "Join Now" button (newsletter section)
   ↓
2. Enters email → Receives 6-digit OTP code
   ↓
3. Enters OTP code → Verified
   ↓
4. Redirected to Dashboard (logged in!)
```

---

## 📄 System Files

### **Core Files:**
- **`auth-simple.js`** - Authentication utilities (session, login, logout)
- **`login.html`** - Email input page
- **`verify.html`** - OTP verification page
- **`dashboard.html`** - Protected user dashboard

### **Pages with Join Button:**
All these pages now have working authentication:
- ✅ `index.html` - Home page
- ✅ `shop.html` - Shop page
- ✅ `blog.html` - Blog page
- ✅ `about.html` - About page
- ✅ `contact.html` - Contact page
- ✅ `Sproduct.html` - Single product page

---

## 🚀 Features

### **For Users:**
- ✉️ **Email OTP Login** - No passwords to remember
- 📱 **Mobile Responsive** - Works on all devices
- 🔒 **Secure Sessions** - Automatic session management
- 👤 **User Dashboard** - View profile and account info
- 🔓 **Easy Logout** - One-click logout

### **For Developers:**
- 🎨 **Clean Code** - Simple, beginner-friendly
- 🔧 **Easy Integration** - Just add button ID and script
- 📦 **No Backend Required** - 100% Supabase
- 🌐 **Static Hosting** - Works on any web host
- 🛡️ **Built-in Security** - Supabase handles everything

---

## ⚙️ Configuration

### **1. Supabase Setup**
Your Supabase is already configured in `auth-simple.js`:
```javascript
const SUPABASE_URL = 'https://fppnpevkegctkefjipoe.supabase.co'
const SUPABASE_ANON_KEY = 'your-key-here'
```

### **2. Enable Email OTP**
In your Supabase dashboard:
1. Go to **Authentication** → **Providers**
2. Find **Email** provider
3. Enable **"Enable Email OTP"**
4. Save changes

### **3. Customize Email Template (Optional)**
1. Go to **Authentication** → **Email Templates**
2. Select **"Magic Link"**
3. Customize subject and body
4. Use `{{ .Token }}` for the OTP code

---

## 💻 Code Implementation

### **Join Button Structure:**
```html
<input type="email" id="newsletter-email" placeholder="Your email address">
<button type="button" id="join-btn" class="normal">Join Now</button>
```

### **Required Scripts:**
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="auth-simple.js"></script>
<script>
   // Authentication handler is automatically added
</script>
```

---

## 🎨 User Journey

### **Step 1: Newsletter Signup**
- User sees "Join Now" button in newsletter section
- Enters email address
- Clicks "Join Now"

### **Step 2: Email Verification**
- System sends 6-digit OTP to email
- User redirected to `verify.html`
- Email address shown on screen

### **Step 3: OTP Entry**
- User checks email for code
- Enters 6-digit code
- Can resend code if needed

### **Step 4: Dashboard Access**
- Code verified successfully
- User redirected to `dashboard.html`
- Can browse menu, view cart, etc.

---

## 🔒 Protected Pages

To protect any page (require login):
```javascript
// Add to the top of your page script
requireAuth();
```

To redirect logged-in users away from login/signup pages:
```javascript
// On login/verify pages
redirectIfAuthenticated();
```

---

## 🎯 Key Functions (auth-simple.js)

### **checkSession()**
```javascript
const session = await checkSession();
// Returns current session or null
```

### **requireAuth()**
```javascript
requireAuth();
// Redirects to login.html if not logged in
```

### **logout()**
```javascript
await logout();
// Logs out user and redirects to login
```

### **getCurrentUser()**
```javascript
const user = await getCurrentUser();
// Returns current user object
```

---

## 📧 Email OTP Details

### **OTP Code:**
- 6 digits
- Expires after 60 seconds (default)
- Can be resent unlimited times

### **Email Content:**
Supabase sends email with:
- Subject: "Your verification code"
- Body: "Your code is: **123456**"

---

## 🐛 Troubleshooting

### **OTP Not Received?**
1. Check spam/junk folder
2. Verify email address is correct
3. Try "Resend Code" button
4. Check Supabase logs in dashboard

### **Can't Login?**
1. Clear browser cache/cookies
2. Check Supabase is enabled
3. Verify SUPABASE_URL and KEY are correct
4. Check browser console for errors

### **Session Not Persisting?**
1. Supabase auto-saves to localStorage
2. Check browser allows localStorage
3. Don't use incognito/private mode

---

## 🎉 Success!

Your authentication system is **fully functional** and ready to use! Users can:
- ✅ Sign up from any newsletter section
- ✅ Verify with email OTP
- ✅ Access protected dashboard
- ✅ Stay logged in across sessions
- ✅ Logout securely

---

## 📞 Support

For issues:
1. Check browser console (F12)
2. Review Supabase dashboard logs
3. Verify email provider is enabled
4. Test with different email addresses

---

**Built with ❤️ using Supabase Email OTP Authentication**
