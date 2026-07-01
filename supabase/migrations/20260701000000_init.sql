-- Enable UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. TABLES CREATION
-- =========================================================================

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Catalog Products Table (Searchable presets)
CREATE TABLE IF NOT EXISTS public.catalog_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category_name TEXT NOT NULL,
    options JSONB NOT NULL, -- Format: [{"quantity": "500 gm", "price": 130}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Submitted Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    quantity_option TEXT NOT NULL, -- e.g., "500 gm"
    seller_name TEXT NOT NULL,
    seller_quantity INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'sold'
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Settings Table (Global configuration)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    church_name TEXT NOT NULL DEFAULT 'Sunday Mart Church',
    church_logo TEXT,
    theme TEXT NOT NULL DEFAULT 'dark',
    contact_number TEXT,
    email TEXT,
    address TEXT,
    google_maps_iframe TEXT,
    submission_enabled BOOLEAN NOT NULL DEFAULT true,
    facebook_link TEXT,
    instagram_link TEXT,
    youtube_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Event Details Table (Countdown, title)
CREATE TABLE IF NOT EXISTS public.event_details (
    id TEXT PRIMARY KEY DEFAULT 'global',
    event_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    title TEXT NOT NULL DEFAULT 'Sunday Marketplace',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Homepage Banners Table
CREATE TABLE IF NOT EXISTS public.homepage_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Contacts Table (Public messages)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 2. INDEXES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_catalog_products_category ON public.catalog_products(category_name);

-- =========================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Category Policies
CREATE POLICY "Allow public read access to categories" 
ON public.categories FOR SELECT TO public, anon, authenticated USING (true);

CREATE POLICY "Allow admin write access to categories" 
ON public.categories ALL TO authenticated USING (true) WITH CHECK (true);

-- Catalog Product Policies
CREATE POLICY "Allow public read access to catalog_products" 
ON public.catalog_products FOR SELECT TO public, anon, authenticated USING (true);

CREATE POLICY "Allow admin write access to catalog_products" 
ON public.catalog_products ALL TO authenticated USING (true) WITH CHECK (true);

-- Product Policies
CREATE POLICY "Allow public read access to approved and sold products" 
ON public.products FOR SELECT TO public, anon USING (status IN ('approved', 'sold'));

CREATE POLICY "Allow admin read access to all products" 
ON public.products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow public to submit products" 
ON public.products FOR INSERT TO public, anon, authenticated WITH CHECK (status = 'pending');

CREATE POLICY "Allow admin write access to products" 
ON public.products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin delete access to products" 
ON public.products FOR DELETE TO authenticated USING (true);

-- Announcement Policies
CREATE POLICY "Allow public read access to announcements" 
ON public.announcements FOR SELECT TO public, anon, authenticated USING (is_active = true);

CREATE POLICY "Allow admin write access to announcements" 
ON public.announcements ALL TO authenticated USING (true) WITH CHECK (true);

-- Settings Policies
CREATE POLICY "Allow public read access to settings" 
ON public.settings FOR SELECT TO public, anon, authenticated USING (true);

CREATE POLICY "Allow admin write access to settings" 
ON public.settings ALL TO authenticated USING (true) WITH CHECK (true);

-- Event Details Policies
CREATE POLICY "Allow public read access to event_details" 
ON public.event_details FOR SELECT TO public, anon, authenticated USING (true);

CREATE POLICY "Allow admin write access to event_details" 
ON public.event_details ALL TO authenticated USING (true) WITH CHECK (true);

-- Banner Policies
CREATE POLICY "Allow public read access to banners" 
ON public.homepage_banners FOR SELECT TO public, anon, authenticated USING (is_active = true);

CREATE POLICY "Allow admin write access to banners" 
ON public.homepage_banners ALL TO authenticated USING (true) WITH CHECK (true);

-- Contact Policies
CREATE POLICY "Allow public to insert contacts" 
ON public.contacts FOR INSERT TO public, anon WITH CHECK (true);

CREATE POLICY "Allow admin select access to contacts" 
ON public.contacts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin delete access to contacts" 
ON public.contacts FOR DELETE TO authenticated USING (true);

-- =========================================================================
-- 4. STORAGE BUCKET CONFIGURATION & POLICIES
-- =========================================================================

-- Create bucket for product-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage object policies
CREATE POLICY "Allow public read access to product-images" 
ON storage.objects FOR SELECT TO public, anon, authenticated 
USING (bucket_id = 'product-images');

CREATE POLICY "Allow public upload access to product-images" 
ON storage.objects FOR INSERT TO public, anon, authenticated 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow admin CRUD access to product-images" 
ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'product-images') 
WITH CHECK (bucket_id = 'product-images');

-- =========================================================================
-- 5. INITIAL SEED DATA
-- =========================================================================

-- Categories
INSERT INTO public.categories (name, slug) VALUES
('Spices', 'spices'),
('Snacks', 'snacks'),
('Powders', 'powders'),
('Pappadam', 'pappadam'),
('Traditional Foods', 'traditional-foods'),
('Others', 'others')
ON CONFLICT (name) DO NOTHING;

-- Catalog Products (Predefined Presets)
INSERT INTO public.catalog_products (name, category_name, options) VALUES
('Spicy Chilli Powder', 'Spices', '[{"quantity": "500 gm", "price": 130}, {"quantity": "200 gm", "price": 65}]'::jsonb),
('Kashmiri Chilli Powder', 'Spices', '[{"quantity": "500 gm", "price": 195}, {"quantity": "200 gm", "price": 95}]'::jsonb),
('Coriander Powder', 'Spices', '[{"quantity": "500 gm", "price": 140}, {"quantity": "200 gm", "price": 56}]'::jsonb),
('Turmeric Powder', 'Spices', '[{"quantity": "100 gm", "price": 40}]'::jsonb),
('Corn Powder', 'Spices', '[{"quantity": "500 gm", "price": 60}]'::jsonb),
('Banana Chips', 'Snacks', '[{"quantity": "250 gm", "price": 100}]'::jsonb),
('Avalosu Powder', 'Traditional Foods', '[{"quantity": "250 gm", "price": 100}]'::jsonb),
('Pappadam', 'Pappadam', '[{"quantity": "8 Pieces", "price": 10}, {"quantity": "16 Pieces", "price": 20}, {"quantity": "25 Pieces", "price": 35}, {"quantity": "45 Pieces", "price": 55}]'::jsonb),
('Spice Mix', 'Others', '[{"quantity": "1 Pack", "price": 50}]'::jsonb),
('Chutney Powder', 'Powders', '[{"quantity": "150 gm", "price": 60}]'::jsonb),
('Kalkandam White', 'Others', '[{"quantity": "500 gm", "price": 55}]'::jsonb),
('Kalkandam Gold', 'Others', '[{"quantity": "250 gm", "price": 60}]'::jsonb),
('Ginger Powder', 'Powders', '[{"quantity": "100 gm", "price": 110}]'::jsonb),
('Fresh Kanthari Chilli', 'Others', '[{"quantity": "100 gm", "price": 80}]'::jsonb),
('Wheat Powder', 'Powders', '[{"quantity": "650 gm", "price": 45}]'::jsonb),
('Chammanthi Podi', 'Powders', '[{"quantity": "100 gm", "price": 75}]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Initial Settings
INSERT INTO public.settings (id, church_name, theme, contact_number, email, address, google_maps_iframe, submission_enabled) 
VALUES (
    'global', 
    'SJCK Sunday Mart', 
    'dark', 
    '+91 94470 12345', 
    'contact@stjosephchurchkaryavattom.org', 
    'St. Joseph Church Road, Karyavattom, Trivandrum, Kerala 695581',
    '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.3855581177694!2d76.88371307584102!3d8.558836373752538!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05beea087cbcd7%3A0xb3046bd14b2d56a2!2sSt.%20Joseph&#39;s%20RC%20Church%2C%20Kariyavattom!5e0!3m2!1sen!2sin!4v1719812948574!5m2!1sen!2sin" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
    true
)
ON CONFLICT (id) DO NOTHING;

-- Initial Event Details
INSERT INTO public.event_details (id, event_date, title, description)
VALUES (
    'global',
    (now() + interval '10 days'),
    'Sunday Harvest Fair & Marketplace',
    'A special church marketplace event featuring fresh hand-ground spices, delicious local snacks, homemade traditional foods, and other items produced by our parish members. Support our community, meet your neighbors, and purchase organic products.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed a Welcome Announcement
INSERT INTO public.announcements (content, is_active)
VALUES (
    'Welcome to the SJCK Sunday Mart! Submit your homemade items now to display them on the event day.',
    true
)
ON CONFLICT (id) DO NOTHING;
