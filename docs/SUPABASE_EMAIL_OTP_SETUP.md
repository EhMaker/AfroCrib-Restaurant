# 📧 Supabase Email OTP Configuration Guide

## Issue: Getting Magic Links Instead of OTP Codes

By default, Supabase sends **magic links** (clickable links) instead of **OTP codes** (6-digit numbers). Here's how to fix this.

---

## 🔧 Solution: Configure Email OTP in Supabase

### **Step 1: Access Your Supabase Dashboard**

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project: **fppnpevkegctkefjipoe**

---

### **Step 2: Enable Email OTP**

1. In the left sidebar, click **Authentication**
2. Click **Providers** tab
3. Find **Email** in the provider list
4. Click on **Email** to expand settings
5. Look for **"Enable Email OTP"** toggle
6. **Turn it ON** ✅
7. Click **Save**

**Screenshot reference:**
```
Authentication > Providers > Email
└── Enable Email OTP: [ON]
```

---

### **Step 3: Configure Email Template for OTP**

1. In the left sidebar, click **Authentication**
2. Click **Email Templates** tab
3. Select **"Magic Link"** template (this is used for OTP too)
4. Replace the template with this OTP-specific version:

#### **Subject:**
```
Your AFROCRIB Verification Code
```

#### **Email Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .otp-code {
            background: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #667eea;
            font-family: 'Courier New', monospace;
        }
        .message {
            color: #666;
            line-height: 1.6;
            margin: 20px 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #999;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍽️ AFROCRIB Restaurant</h1>
        </div>
        <div class="content">
            <h2>Verify Your Email</h2>
            <p class="message">
                Thank you for joining AFROCRIB! Please use the verification code below to complete your signup.
            </p>
            
            <div class="otp-code">
                {{ .Token }}
            </div>
            
            <p class="message">
                <strong>This code will expire in 60 minutes.</strong><br>
                If you didn't request this code, please ignore this email.
            </p>
            
            <p class="message">
                Need help? Contact us at support@afrocrib.com
            </p>
        </div>
        <div class="footer">
            <p>© 2025 AFROCRIB Restaurant. All rights reserved.</p>
            <p>Wellington Road, Street 32 A4, Ikeja</p>
        </div>
    </div>
</body>
</html>
```

5. Click **Save** to apply the template

---

### **Step 4: Test Configuration**

1. Go back to your website
2. Enter a test email address
3. Click "Join Now"
4. Check your inbox
5. You should now receive a **6-digit OTP code** like: `123456`

---

## 🎯 Important Notes

### **{{ .Token }} Variable**
- This is the magic variable that Supabase replaces with the actual OTP code
- **DO NOT** remove or modify `{{ .Token }}`
- It will be replaced with a 6-digit code like: `847392`

### **OTP Code Details:**
- **Format:** 6 digits (e.g., `123456`)
- **Expiration:** 60 minutes (default)
- **Type:** Numeric only
- **Case sensitive:** No (it's all numbers)

### **Email Template Variables Available:**
```
{{ .Token }}          - The 6-digit OTP code
{{ .SiteURL }}        - Your site URL
{{ .ConfirmationURL }} - Full confirmation URL (for magic links)
{{ .TokenHash }}      - Token hash
{{ .RedirectTo }}     - Redirect URL
```

---

## 🔍 Verification Checklist

After configuration, verify:

✅ **Email OTP is enabled** in Providers  
✅ **Email template uses {{ .Token }}**  
✅ **Template subject is customized**  
✅ **Template body is HTML formatted**  
✅ **Test email received with 6-digit code**  
✅ **Code works in verification page**  

---

## 🐛 Troubleshooting

### **Still getting magic links instead of OTP?**

1. **Check Provider Settings:**
   - Go to Authentication > Providers > Email
   - Ensure "Enable Email OTP" is **ON**
   - Click Save again

2. **Clear your code:**
   Make sure your JavaScript is using `signInWithOtp` with correct options:
   ```javascript
   const { data, error } = await supabase.auth.signInWithOtp({
       email: email,
       options: {
           shouldCreateUser: true
       }
   });
   ```

3. **Refresh Supabase Session:**
   - Sign out of Supabase dashboard
   - Sign back in
   - Check settings again

4. **Check Email Template:**
   - Must be using `{{ .Token }}` variable
   - Save template and test again

5. **Verify in Supabase Logs:**
   - Go to Authentication > Logs
   - Check what type of email was sent
   - Should say "OTP" not "Magic Link"

---

## 📱 Alternative: Use Plain Text Email

If HTML is too complex, use this simple plain text version:

### **Subject:**
```
Your AFROCRIB Verification Code
```

### **Body:**
```
Hello!

Thank you for joining AFROCRIB Restaurant.

Your verification code is:

{{ .Token }}

This code will expire in 60 minutes.

If you didn't request this code, please ignore this email.

Best regards,
AFROCRIB Team

---
Wellington Road, Street 32 A4, Ikeja
Phone: +234 8105435361
```

---

## ✨ Advanced Customization

### **Change OTP Expiration Time:**
Currently not configurable in Supabase UI. Default is 60 minutes (3600 seconds).

### **Custom SMTP (Optional):**
If you want to use your own email server:
1. Go to Settings > Auth
2. Enable "Custom SMTP"
3. Configure your SMTP settings
4. This gives more control over email delivery

### **Add Logo to Email:**
```html
<img src="https://your-site.com/logo.png" alt="AFROCRIB" style="max-width: 200px;">
```

---

## 🎉 Expected Result

After configuration, your customers will receive:

```
From: AFROCRIB <noreply@mail.app.supabase.io>
Subject: Your AFROCRIB Verification Code

[Email with beautiful design showing:]

🍽️ AFROCRIB Restaurant

Verify Your Email

Thank you for joining AFROCRIB! Please use the verification code below.

┌─────────────┐
│   847392    │  ← 6-digit OTP code
└─────────────┘

This code will expire in 60 minutes.

© 2025 AFROCRIB Restaurant
```

---

## 📞 Still Need Help?

1. Check Supabase documentation: [https://supabase.com/docs/guides/auth/auth-email-otp](https://supabase.com/docs/guides/auth/auth-email-otp)
2. Verify your project settings in Supabase dashboard
3. Test with multiple email addresses
4. Check spam/junk folders

---

**Once configured, your OTP emails will work perfectly! 🎊**
