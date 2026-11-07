-- ==============================================================================
-- AccessGlobal Supabase Administrator Account Creation Script
-- Run this script inside your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Enable pgcrypto extension for secure bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Ensure public.users table exists with correct schema & constraints
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    avatar TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public read of non-sensitive user metadata & allow users to read/update their own profile
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Users Profile') THEN
        CREATE POLICY "Public Read Users Profile" ON public.users FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins Full Control Users') THEN
        CREATE POLICY "Admins Full Control Users" ON public.users FOR ALL USING (true);
    END IF;
END $$;

-- 3. Automatic Synchronization Trigger (auth.users -> public.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, role, status, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Create or Update Administrator Account
-- Credentials:
--   Email:    admin@accessglobal.com
--   Password: Admin@AccessGlobal2026!
DO $$
DECLARE
    admin_id UUID := gen_random_uuid();
    admin_email TEXT := 'admin@accessglobal.com';
    admin_password TEXT := 'Admin@AccessGlobal2026!';
BEGIN
    -- Check if user already exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud,
            confirmation_token
        ) VALUES (
            admin_id,
            '00000000-0000-0000-0000-000000000000',
            admin_email,
            crypt(admin_password, gen_salt('bf', 10)),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"System Administrator","role":"admin"}',
            NOW(),
            NOW(),
            'authenticated',
            'authenticated',
            encode(gen_random_bytes(32), 'hex')
        );

        -- Also ensure record exists in public.users
        INSERT INTO public.users (id, name, email, role, status, created_at, updated_at)
        VALUES (
            admin_id,
            'System Administrator',
            admin_email,
            'admin',
            'active',
            NOW(),
            NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
            role = 'admin',
            status = 'active',
            updated_at = NOW();

        RAISE NOTICE 'Administrator account % created successfully!', admin_email;
    ELSE
        -- Update existing user password and role to admin
        UPDATE auth.users SET
            encrypted_password = crypt(admin_password, gen_salt('bf', 10)),
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"admin"')
        WHERE email = admin_email;

        UPDATE public.users SET
            role = 'admin',
            status = 'active',
            updated_at = NOW()
        WHERE email = admin_email;

        RAISE NOTICE 'Administrator account % updated with admin role and active password.', admin_email;
    END IF;
END $$;

