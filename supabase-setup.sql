-- ==============================================================================
-- AccessGlobal E-Commerce Master Supabase Setup & Administrator Script
-- Safe & Idempotent: Can be executed repeatedly without errors.
-- Paste & execute in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image_url TEXT,
    products_number INTEGER DEFAULT 0,
    parent_category TEXT DEFAULT '/',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    description TEXT,
    main_image TEXT,
    slug TEXT NOT NULL UNIQUE,
    manufacturer TEXT,
    category TEXT NOT NULL,
    in_stock INTEGER DEFAULT 1,
    popularity INTEGER DEFAULT 0,
    specs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure specs column exists on pre-existing products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '[]'::jsonb;

-- 4. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'user',
    avatar TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist on pre-existing users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'User';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    status TEXT DEFAULT 'Processing',
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    items JSONB DEFAULT '[]'::jsonb,
    payment_method TEXT DEFAULT 'Credit Card',
    shipping_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    comment TEXT,
    status TEXT DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. High Performance Database Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 9. Row Level Security Policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Categories') THEN
        CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Products') THEN
        CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Reviews') THEN
        CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Users Profile') THEN
        CREATE POLICY "Public Read Users Profile" ON public.users FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Insert Users') THEN
        CREATE POLICY "Public Insert Users" ON public.users FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Update Users') THEN
        CREATE POLICY "Public Update Users" ON public.users FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins Full Control Users') THEN
        CREATE POLICY "Admins Full Control Users" ON public.users FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Insert Orders') THEN
        CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Orders') THEN
        CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins Manage Orders') THEN
        CREATE POLICY "Admins Manage Orders" ON public.orders FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins Manage Products') THEN
        CREATE POLICY "Admins Manage Products" ON public.products FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins Manage Categories') THEN
        CREATE POLICY "Admins Manage Categories" ON public.categories FOR ALL USING (true);
    END IF;
END $$;

-- 10. Automatic Synchronization Trigger (auth.users -> public.users)
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Initial Seed Data (Categories)
INSERT INTO public.categories (name, slug, parent_category) VALUES
    ('E-Bikes', 'e-bikes', '/'),
    ('Clothing', 'clothing', '/'),
    ('Shoes', 'shoes', '/'),
    ('Appliances', 'appliances', '/'),
    ('Perfumes', 'perfumes', '/'),
    ('Accessories', 'accessories', '/')
ON CONFLICT (slug) DO NOTHING;

-- 12. Initial Seed Data (Products)
INSERT INTO public.products (title, price, rating, description, main_image, slug, manufacturer, category, in_stock, popularity) VALUES
    ('Volt X1 Commuter E-Bike', 1299.00, 4.95, 'Aircraft-grade 6061-T6 aluminum hydroformed frame paired with a whisper-quiet 250W rear hub motor and integrated torque sensor for responsive urban transit.', 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=900&auto=format&fit=crop&q=80', 'volt-x1-commuter-e-bike', 'Nordic Motion Labs (Helsinki)', 'E-Bikes', 14, 98),
    ('Trail Pro All-Terrain E-Bike', 2199.00, 4.90, 'Full-suspension gravel and trail machine engineered with a 650Wh high-capacity battery pack, 85Nm mid-drive torque, and hydraulic four-piston disc brakes.', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900&auto=format&fit=crop&q=80', 'trail-pro-all-terrain-e-bike', 'Kallio Alpine Works (Innsbruck)', 'E-Bikes', 8, 94),
    ('French Linen Belted Dress', 124.00, 4.88, 'Woven from 100% Normandy flax linen. Features deep side pockets, a removable self-tie sash, and reinforced French seams designed for timeless hot-weather layering.', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&auto=format&fit=crop&q=80', 'french-linen-belted-dress', 'Atelier Saint-Florent (Normandy)', 'Clothing', 32, 91),
    ('Selvedge Denim Chore Coat', 189.00, 4.92, '13.5 oz Japanese raw selvedge denim milled in Kojima. Constructed with triple-needle felled seams, custom copper hardware, and dual interior passport storage.', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=900&auto=format&fit=crop&q=80', 'selvedge-denim-chore-coat', 'Kojima Craft Guild (Okayama)', 'Clothing', 19, 89),
    ('Horween Derby Oxford Shoes', 285.00, 4.96, 'Hand-lasted Goodyear welt construction utilizing Horween Chromexcel pull-up leather. Features stacked leather heels and Vibram half-lug rubber outsoles.', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=900&auto=format&fit=crop&q=80', 'horween-derby-oxford-shoes', 'Calzaturificio Varese (Tuscany)', 'Shoes', 12, 97),
    ('Precision Burr Coffee Grinder', 245.00, 4.94, 'Solid billet CNC-milled 304 stainless steel body with 48mm heptagonal high-nitrogen martensitic steel burrs. Micrometric stepless adjustment mechanism.', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=900&auto=format&fit=crop&q=80', 'precision-burr-coffee-grinder', 'Mahlwerk Precision (Stuttgart)', 'Appliances', 26, 95),
    ('Botanical Eau de Parfum', 140.00, 4.89, 'Hand-blended micro-batch extract featuring Italian bergamot, Grasse vetiver, and wild Atlantic cedarwood aged in French glass demijohns for 90 days.', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&auto=format&fit=crop&q=80', 'botanical-eau-de-parfum', 'Maison Grasse (Provence)', 'Perfumes', 45, 92),
    ('Full-Grain Bridle Leather Briefcase', 340.00, 4.97, 'English vegetable-tanned bridle leather with hand-burnished edges, solid brass hardware, and dedicated padded compartment for 16-inch workstation devices.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=80', 'full-grain-bridle-leather-briefcase', 'Walsall Leather Guild (UK)', 'Accessories', 11, 96),
    ('AirStride Carbon-Plate Runner', 168.00, 4.92, 'Full-length curved carbon-fiber propulsion plate embedded in supercritical nitrogen-infused foam. Engineered for distance road running and daily tempo training.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80', 'airstride-carbon-plate-runner', 'Veloce Footwear Studio (Montebelluna)', 'Shoes', 18, 93),
    ('CycloneVac Pro Brushless Vacuum', 289.00, 4.88, 'High-speed 125,000 RPM digital brushless motor providing 180 Air Watts of continuous fade-free suction with a sealed 5-stage HEPA 13 filtration system.', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=900&auto=format&fit=crop&q=80', 'cyclonevac-pro-brushless-vacuum', 'AeroCraft Precision (Daejeon)', 'Appliances', 15, 90)
ON CONFLICT (slug) DO NOTHING;

-- 13. Create or Update Administrator Account
-- Credentials:
--   Email:    admin@accessglobal.com
--   Password: Admin@AccessGlobal2026!
DO $$
DECLARE
    admin_id UUID := gen_random_uuid();
    admin_email TEXT := 'admin@accessglobal.com';
    admin_password TEXT := 'Admin@AccessGlobal2026!';
BEGIN
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
