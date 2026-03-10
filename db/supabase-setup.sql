-- ========================================
-- SUPABASE DATABASE SETUP
-- ========================================

-- 1. Create user_profiles table (optional, for storing additional user data)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create RLS (Row Level Security) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = (SELECT auth.uid()::text));

-- Policy: Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = (SELECT auth.uid()::text));

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = (SELECT auth.uid()::text));

-- 3. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- AUTHENTICATION SETTINGS
-- ========================================

/*
In your Supabase dashboard, make sure to configure:

1. Go to Authentication > Settings
2. Enable "Confirm email" 
3. Set up email templates for:
   - Confirm signup
   - Magic Link
   - Email OTP

4. Email Templates Configuration:
   - Subject: "Your AFROCRIB verification code"
   - Body: Include {{ .Token }} for the 6-digit code
   
5. Site URL: Set your website URL
6. Redirect URLs: Add your website domain

7. Optional: Configure SMTP settings for custom email sending
*/

-- ========================================
-- USAGE INSTRUCTIONS
-- ========================================

/*
1. Run this SQL in your Supabase SQL editor
2. Update the SUPABASE_URL and SUPABASE_ANON_KEY in auth.js
3. Configure email templates in Supabase dashboard
4. Test the authentication flow

Your Supabase credentials can be found in:
- Project Settings > API
- SUPABASE_URL: Your project URL
- SUPABASE_ANON_KEY: Your anon/public key
*/