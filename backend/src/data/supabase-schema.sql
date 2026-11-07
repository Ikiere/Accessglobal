-- ============================================================
-- AccessGlobal & Free-Admin-Dashboard Supabase Schema
-- Run this in your Supabase SQL Editor to initialize all tables
-- ============================================================

-- 1. Categories Table
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

-- 2. Products Table
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    avatar TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    status TEXT DEFAULT 'Processing' CHECK (status IN ('Processing', 'Delivered', 'Cancelled', 'Pending')),
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    items JSONB DEFAULT '[]'::jsonb,
    payment_method TEXT DEFAULT 'Credit Card',
    shipping_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 8. Row Level Security Policies
-- Public Read for Catalog Data
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Categories') THEN
        CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Products') THEN
        CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Reviews') THEN
        CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (status = 'approved');
    END IF;
END $$;

-- Service Role (Backend API) Full Access to All Tables
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service Role All Access Categories') THEN
        CREATE POLICY "Service Role All Access Categories" ON public.categories FOR ALL USING (auth.role() = 'service_role');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service Role All Access Products') THEN
        CREATE POLICY "Service Role All Access Products" ON public.products FOR ALL USING (auth.role() = 'service_role');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service Role All Access Orders') THEN
        CREATE POLICY "Service Role All Access Orders" ON public.orders FOR ALL USING (auth.role() = 'service_role');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service Role All Access Users') THEN
        CREATE POLICY "Service Role All Access Users" ON public.users FOR ALL USING (auth.role() = 'service_role');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service Role All Access Reviews') THEN
        CREATE POLICY "Service Role All Access Reviews" ON public.reviews FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- 9. Initial Seed Data (Verified Maker Workshops)
INSERT INTO public.categories (name, slug, parent_category) VALUES
    ('E-Bikes', 'e-bikes', '/'),
    ('Clothing', 'clothing', '/'),
    ('Shoes', 'shoes', '/'),
    ('Appliances', 'appliances', '/'),
    ('Perfumes', 'perfumes', '/'),
    ('Accessories', 'accessories', '/')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (title, price, rating, description, main_image, slug, manufacturer, category, in_stock, popularity) VALUES
    ('Volt X1 Commuter E-Bike', 1299.00, 4.95, 'Aircraft-grade 6061-T6 aluminum hydroformed frame paired with a whisper-quiet 250W rear hub motor and integrated torque sensor for responsive urban transit.', 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=900&auto=format&fit=crop&q=80', 'volt-x1-commuter-e-bike', 'Nordic Motion Labs (Helsinki)', 'E-Bikes', 14, 98),
    ('Trail Pro All-Terrain E-Bike', 2199.00, 4.90, 'Full-suspension gravel and trail machine engineered with a 650Wh high-capacity battery pack, 85Nm mid-drive torque, and hydraulic four-piston disc brakes.', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900&auto=format&fit=crop&q=80', 'trail-pro-all-terrain-e-bike', 'Kallio Alpine Works (Innsbruck)', 'E-Bikes', 8, 94),
    ('French Linen Belted Dress', 124.00, 4.88, 'Woven from 100% Normandy flax linen. Features deep side pockets, a removable self-tie sash, and reinforced French seams designed for timeless hot-weather layering.', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&auto=format&fit=crop&q=80', 'french-linen-belted-dress', 'Atelier Saint-Florent (Normandy)', 'Clothing', 32, 91),
    ('Selvedge Denim Chore Coat', 189.00, 4.92, '13.5 oz Japanese raw selvedge denim milled in Kojima. Constructed with triple-needle felled seams, custom copper hardware, and dual interior passport storage.', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=900&auto=format&fit=crop&q=80', 'selvedge-denim-chore-coat', 'Kojima Craft Guild (Okayama)', 'Clothing', 19, 89),
    ('Horween Derby Oxford Shoes', 285.00, 4.96, 'Hand-lasted Goodyear welt construction utilizing Horween Chromexcel pull-up leather. Features stacked leather heels and Vibram half-lug rubber outsoles.', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=900&auto=format&fit=crop&q=80', 'horween-derby-oxford-shoes', 'Calzaturificio Varese (Tuscany)', 'Shoes', 12, 97),
    ('Precision Burr Coffee Grinder', 245.00, 4.94, 'Solid billet CNC-milled 304 stainless steel body with 48mm heptagonal high-nitrogen martensitic steel burrs. Micrometric stepless adjustment mechanism.', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=900&auto=format&fit=crop&q=80', 'precision-burr-coffee-grinder', 'Mahlwerk Precision (Stuttgart)', 'Appliances', 26, 95),
    ('Botanical Eau de Parfum', 140.00, 4.89, 'Hand-blended micro-batch extract featuring Italian bergamot, Grasse vetiver, and wild Atlantic cedarwood aged in French glass demijohns for 90 days.', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&auto=format&fit=crop&q=80', 'botanical-eau-de-parfum', 'Maison Grasse (Provence)', 'Perfumes', 45, 92),
    ('Full-Grain Bridle Leather Briefcase', 340.00, 4.97, 'English vegetable-tanned bridle leather with hand-burnished edges, solid brass hardware, and dedicated padded compartment for 16-inch workstation devices.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=80', 'full-grain-bridle-leather-briefcase', 'Walsall Leather Guild (UK)', 'Accessories', 11, 96)
ON CONFLICT (slug) DO NOTHING;
