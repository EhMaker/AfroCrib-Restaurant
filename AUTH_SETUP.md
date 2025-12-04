# AFROCRIB Authentication System

## 🔐 Complete Email Verification & Registration Flow

This system implements a comprehensive authentication flow using Supabase that includes:

1. **Email Collection** - Users enter their email to join the newsletter
2. **Email Verification** - A 6-digit code is sent to their email
3. **Registration** - Users complete their profile with full name, phone, and password
4. **Success** - Welcome message with option to explore the menu

## 🚀 Setup Instructions

### 1. Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings > API** and copy:
   - Project URL (`SUPABASE_URL`)
   - Anon/Public key (`SUPABASE_ANON_KEY`)

### 2. Database Setup

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the SQL script from `supabase-setup.sql`
3. This creates the `user_profiles` table and security policies

### 3. Authentication Configuration

1. Go to **Authentication > Settings** in Supabase
2. Enable **"Confirm email"**
3. Configure **Email OTP** settings
4. Set your **Site URL** (your website domain)
5. Add **Redirect URLs** (your website domain)

### 4. Email Templates (Optional but Recommended)

1. Go to **Authentication > Email Templates**
2. Customize the **"Magic Link"** or **"Email OTP"** template
3. Use `{{ .Token }}` to include the 6-digit verification code
4. Customize subject and styling to match your brand

### 5. Update Configuration

In `auth.js`, replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

## 📱 How It Works

### Step 1: Email Input
- User enters email address
- System validates email format
- Sends OTP to email using Supabase Auth

### Step 2: Email Verification
- User receives 6-digit code via email
- Enters code to verify email ownership
- Option to resend code if needed

### Step 3: Registration (New Users Only)
- User fills out complete profile:
  - Full Name
  - Phone Number
  - Password (minimum 6 characters)
  - Confirm Password
- Data is saved to user profile

### Step 4: Success
- Welcome message displayed
- Option to explore the menu
- User is now authenticated

## 🎨 Features

### ✅ Complete Authentication Flow
- Email verification with OTP
- Password-based registration
- Profile data collection
- Success confirmation

### ✅ User Experience
- Smooth step-by-step progression
- Loading states for all actions
- Error handling and validation
- Responsive design

### ✅ Security
- Email verification required
- Password strength validation
- Supabase Row Level Security (RLS)
- Secure session management

### ✅ Error Handling
- Invalid email format detection
- OTP verification failures
- Password mismatch validation
- Network error handling

## 🎯 User Flow

```
1. Newsletter Signup
   ↓
2. Email Verification (OTP)
   ↓
3. Profile Registration
   ↓
4. Welcome & Success
   ↓
5. Explore Menu
```

## 🔧 Customization Options

### Email Templates
- Customize OTP email design
- Add your restaurant branding
- Modify verification code format

### Form Fields
- Add/remove registration fields
- Modify validation rules
- Customize styling

### Success Actions
- Redirect to different pages
- Show special offers
- Send welcome emails

## 🛠 Technical Details

### Technologies Used
- **Supabase Auth** - Authentication & OTP
- **Supabase Database** - User profile storage
- **Vanilla JavaScript** - Frontend logic
- **CSS3** - Styling and animations
- **HTML5** - Semantic markup

### Security Features
- Row Level Security (RLS) enabled
- Email verification required
- Secure password handling
- Session management

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Progressive enhancement

## 📋 Testing Checklist

### Before Going Live:
- [ ] Test email delivery
- [ ] Verify OTP codes work
- [ ] Test registration flow
- [ ] Check error handling
- [ ] Validate responsive design
- [ ] Test on different devices

### Production Considerations:
- [ ] Set up custom SMTP (optional)
- [ ] Configure proper error logging
- [ ] Set up monitoring
- [ ] Backup database regularly
- [ ] Monitor authentication metrics

## 🎉 Success Metrics

Track these metrics in Supabase:
- Email verification success rate
- Registration completion rate
- User engagement after signup
- Error rates by step

## 🔍 Troubleshooting

### Common Issues:

1. **OTP not received**
   - Check spam folder
   - Verify email template is configured
   - Check Supabase email logs

2. **Authentication errors**
   - Verify Supabase credentials
   - Check browser console for errors
   - Ensure proper CORS settings

3. **Database errors**
   - Verify RLS policies are correct
   - Check table permissions
   - Review SQL setup

## 📞 Support

For technical support:
1. Check browser console for errors
2. Review Supabase dashboard logs
3. Verify configuration settings
4. Test with different email addresses

---

**Ready to launch! 🚀**

Your customers can now seamlessly join your newsletter with full email verification and create secure accounts to enhance their dining experience at AFROCRIB!