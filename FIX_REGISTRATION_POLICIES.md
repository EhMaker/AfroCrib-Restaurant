# Fix Supabase Registration Policies

## Problem
You're getting "Database error saving new user" because RLS (Row Level Security) is blocking user registration.

## Solution

Go to your Supabase SQL Editor and run these queries:

### 1. Check if you have a users or user_profiles table

```sql
-- Check existing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%user%';
```

### 2. Create user_profiles table if it doesn't exist

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

### 3. Create RLS Policies for user_profiles

```sql
-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can insert their own profile during registration
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 4. Create or update the trigger function for new user registration

```sql
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.created_at
    );
    RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```

### 5. Fix menu_categories and other tables RLS policies

If you have other tables like menu_categories, you need policies for public read access:

```sql
-- Allow public read access to menu_categories
CREATE POLICY "Anyone can view menu categories"
ON public.menu_categories
FOR SELECT
USING (true);

-- If you have a products/menu_items table:
CREATE POLICY "Anyone can view menu items"
ON public.menu_items
FOR SELECT
USING (true);
```

### 6. Verify policies are created

```sql
-- Check all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Testing

After running these queries:

1. Try registering a new user from your website
2. Check the Supabase Authentication tab to see if the user was created
3. Check the user_profiles table to see if the profile was created

## Important Notes

- The auth.users table is managed by Supabase and doesn't need RLS policies
- Your custom tables (like user_profiles) need RLS policies
- The trigger function must have SECURITY DEFINER to bypass RLS during user creation
- Make sure email confirmations are configured in Supabase Auth settings

## If still not working

Check your Supabase Auth settings:
1. Go to Authentication → Settings → Email Auth
2. Make sure "Enable Email Confirmations" is configured correctly
3. Check if you have email templates set up
4. Verify SMTP settings if using custom email provider
