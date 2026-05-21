-- ==========================================
-- Arooj Arts : ENTERPRISE SUPABASE SCHEMA
-- ==========================================

-- Clean up existing objects for a fresh seed (uncomment if recreating)
-- DROP TABLE IF EXISTS public.payments CASCADE;
-- DROP TABLE IF EXISTS public.reviews CASCADE;
-- DROP TABLE IF EXISTS public.wishlist CASCADE;
-- DROP TABLE IF EXISTS public.addresses CASCADE;
-- DROP TABLE IF EXISTS public.order_items CASCADE;
-- DROP TABLE IF EXISTS public.orders CASCADE;
-- DROP TABLE IF EXISTS public.cart_items CASCADE;
-- DROP TABLE IF EXISTS public.carts CASCADE;
-- DROP TABLE IF EXISTS public.product_images CASCADE;
-- DROP TABLE IF EXISTS public.inventory CASCADE;
-- DROP TABLE IF EXISTS public.products CASCADE;
-- DROP TABLE IF EXISTS public.categories CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Linked with Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Categories Table
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Products Table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  designer TEXT NOT NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  image TEXT NOT NULL, -- Core tactile display photo URL
  description TEXT,
  long_description TEXT,
  details TEXT[] DEFAULT '{}'::TEXT[],
  stock INTEGER DEFAULT 10 CHECK (stock >= 0),
  featured BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Product Images (For additional gallery views if needed)
CREATE TABLE public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- 5. Inventory Ledger (Separate log representing audits)
CREATE TABLE public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stock_count INTEGER DEFAULT 10 CHECK (stock_count >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 6. Carts Table
CREATE TABLE public.carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- 7. Cart Items
CREATE TABLE public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  size TEXT DEFAULT 'M',
  engraving TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_cart_item_combo UNIQUE (cart_id, product_id, size)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 8. Orders Table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Can be null for guest checkouts
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 9. Order Items Table
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0)
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 10. Reviews Table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 11. Wishlist Table
CREATE TABLE public.wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_wishlist TEXT UNIQUE (user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- 12. Addresses Table (For multi-address profile settings)
CREATE TABLE public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 13. Payments Table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
  payment_method TEXT NOT NULL,
  payment_intent_id TEXT, -- For Stripe Integration Sync
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 14. Coupons System Table (Additional marketing structures)
CREATE TABLE public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- INDEXES FOR HIGH QUERY SPEEDS (ENTERPRISE)
-- ==========================================
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX idx_product_images_product ON public.product_images(product_id);
CREATE INDEX idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_reviews_product ON public.reviews(product_id);
CREATE INDEX idx_wishlist_user ON public.wishlist(user_id);
CREATE INDEX idx_payments_order ON public.payments(order_id);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Check Role Functions
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profile viewing" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users direct profile update" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.get_auth_role() = 'admin');

-- Categories Policies
CREATE POLICY "Read categories public" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admin write categories" ON public.categories
  FOR ALL USING (public.get_auth_role() = 'admin');

-- Products Policies
CREATE POLICY "Read products public" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Admin write products" ON public.products
  FOR ALL USING (public.get_auth_role() = 'admin');

-- Product Images Policies
CREATE POLICY "Read product images public" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Admin write images" ON public.product_images
  FOR ALL USING (public.get_auth_role() = 'admin');

-- Inventory Policies
CREATE POLICY "Admin view inventory" ON public.inventory
  FOR SELECT USING (public.get_auth_role() = 'admin');

CREATE POLICY "Admin write inventory" ON public.inventory
  FOR ALL USING (public.get_auth_role() = 'admin');

-- Cards Tables Policies
CREATE POLICY "Users direct cart operations" ON public.carts
  FOR ALL USING (user_id = auth.uid() OR public.get_auth_role() = 'admin');

CREATE POLICY "Cart items RLS matching ownership" ON public.cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.carts 
      WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
    ) OR public.get_auth_role() = 'admin'
  );

-- Orders Policies
CREATE POLICY "User orders checkup" ON public.orders
  FOR SELECT USING (user_id = auth.uid() OR public.get_auth_role() = 'admin');

CREATE POLICY "Anyone places orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manages order changes" ON public.orders
  FOR UPDATE USING (public.get_auth_role() = 'admin');

-- Order Items Policies
CREATE POLICY "Read order items detail" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.get_auth_role() = 'admin')
    )
  );

CREATE POLICY "Insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- Reviews Policies
CREATE POLICY "Reviews display public" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated user reviews writing" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Moderation control" ON public.reviews
  FOR DELETE USING (public.get_auth_role() = 'admin');

-- Wishlist Policies
CREATE POLICY "Wishlist ownership operations" ON public.wishlist
  FOR ALL USING (user_id = auth.uid());

-- Address Policies
CREATE POLICY "Address client ownership" ON public.addresses
  FOR ALL USING (user_id = auth.uid());

-- Payments Policies
CREATE POLICY "Payments administration details" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = payments.order_id AND (orders.user_id = auth.uid() OR public.get_auth_role() = 'admin')
    )
  );

CREATE POLICY "Admin edit payments" ON public.payments
  FOR ALL USING (public.get_auth_role() = 'admin');

-- Coupons Policies
CREATE POLICY "View active coupons" ON public.coupons
  FOR SELECT USING (active = true);

CREATE POLICY "Manage coupons" ON public.coupons
  FOR ALL USING (public.get_auth_role() = 'admin');


-- ==========================================================
-- TRIGGER: AUTO-CREATE PROFILE RECORDS UPON AUTH USER REGISTRATION
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Guest Member'),
    'customer'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_sync_profiles_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ==========================================
-- INITIAL POPULATION (SEED DATA)
-- ==========================================
INSERT INTO public.categories (id, name, banner_url) VALUES
('apparel', 'Apparel & Outerwear', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200'),
('decor', 'Geologic Home Accents', 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?w=1200'),
('watches', 'Fine Timekeepers', 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1200'),
('fragrances', 'Prestige Fragrances', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, designer, category_id, price, image, description, long_description, details, stock, featured, rating) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'L''Éternel Silk Trench Coat', 'Gabrielle Marceau', 'apparel', 1250, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80', 'Flowing double-breasted trench spun from exquisite mulberry raw silk.', 'A masterpiece of modern tailoring, L''Éternel is engineered with lightweight mulberry silk that mirrors light flawlessly. Designed for effortless draping, it features custom natural horn buttons, structured notch lapels, and an adjustable belted waist. Hand-stitched seams inside represent the absolute pinnacle of artisanal garment construction.', ARRAY['100% Mulberry Silk shell', 'Genuine Buffalo horn double-breasted buttons', 'Stain-resistant nanocoated weave', 'Handcrafted in Lyons, France', 'Dry clean only'], 12, true, 4.9),
('550e8400-e29b-41d4-a716-446655440002', 'Signature Leather Saddle Bag', 'Atelier Villon', 'apparel', 890, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80', 'Full-grain vegetable tanned leather clutch with brushed brass hardware.', 'Sculpted by hand from premium Full-Grain French calfskin, the Signature Saddle Bag displays organic elegance. Over time, the rich tan leather will develop a gorgeous golden-brown patina unique to your journey. Built with dual bellows compartments, a soft velour-lined interior, and adjustable leather crossbody straps.', ARRAY['French Full-Grain vegetable-tanned leather', 'Solid brushed artisan brass clasp', 'Expandable structural dual-bellows compartment', 'Made by master cordwainers in Florence, Italy', 'Dimensions: 9.5" W x 8.0" H x 3.5" D'], 8, true, 4.8),
('550e8400-e29b-41d4-a716-446655440003', 'Atelier Cashmere Ribbed Knit', 'Gabrielle Marceau', 'apparel', 450, 'https://images.unsplash.com/photo-1574164904299-3a102b110380?w=600&auto=format&fit=crop&q=80', 'Ultra-fine rib-knitted organic cashmere sweater in soft alabaster.', 'Woven in our partner mills in Inner Mongolia, this ethically-sourced, high-gauge organic cashmere sweater offers supreme softness. Featuring a subtly raised crewneck collar, relaxed droptails, and clean ribbing that retains its structure. It provides sublime thermal equilibrium in a versatile silhouette.', ARRAY['100% Organic Grade-A cashmere thread', 'High-gauge 12-ply ribbed knit structure', 'Hypoallergenic and highly breathable weave', 'Ethically combed from free-roaming herds', 'Eco-dyed using plant-based pigments'], 24, false, 4.7),
('550e8400-e29b-41d4-a716-446655440004', 'Sculptural Travertine Side Table', 'Studio Kanso', 'decor', 1850, 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?w=600&auto=format&fit=crop&q=80', 'Honed raw travertine pedestal exhibiting rich geologic banding.', 'Crafted directly out of monolithic Italian travertine, this end table is a monument to modern geometry. Its form balances a heavy cylindrical column support against an ultra-precise square top. Left unsealed to celebrate the stone''s tactile geological porousness, but honed to a smooth cashmere texture.', ARRAY['Raw Class-A Italian Travertine Stone', 'Monolithic geometric locking design', 'Honed silk-touch textured finish', 'Each unit shows distinct ancient shell & mineral veins', 'Weight: 84 lbs — handles with extreme care'], 4, true, 5.0),
('550e8400-e29b-41d4-a716-446655440005', 'Artisan Glazed Ochre Ceramic Vase', 'Sora Ceramicist', 'decor', 320, 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80', 'Wabi-sabi inspired hand-thrown vase with cracked salt-glaze finish.', 'Thrown individually on a foot-pedaled kickwheel in Kyoto, this organic-clay vase integrates crackled amber-ochre with a heavy iron reduction. Each firing alters the copper-tinted micro-crystals, making every singular piece an entirely unrepeatable artifact of heat and gravity.', ARRAY['100% locally harvested Kyoto river clay', 'Wood-ash salt reduction glazing', 'Waterproof stoneware interior sealant', 'Embossed artisan potter''s stamp at base', 'Height: 11"'], 15, false, 4.6),
('550e8400-e29b-41d4-a716-446655440006', 'Astral Scented Candle Duo', 'Arooj L''Étoile Atelier', 'decor', 95, 'https://images.unsplash.com/photo-1603006905393-0d703de3fb21?w=600&auto=format&fit=crop&q=80', 'Soy-coconut wax blend infused with notes of ambergris, cedar, and vetiver.', 'Designed to craft a serene olfactory environment. This duo features two hand-poured candles in matte concrete jars. Formulated with dynamic soy-coconut clean wax and natural crackling wood wicks that gently hum like an open fireside.', ARRAY['Natural Soy & Coconut wax bases', 'Top notes: Bergamot, Ambergris', 'Heart notes: Aged cedarwood, Warm leather', 'Base notes: Vetiver, Smoked vanilla', 'Burn time: 55 hours per vessel'], 45, false, 4.9),
('550e8400-e29b-41d4-a716-446655440007', 'Arooj Chronosphere Wristwatch', 'Atelier Chronos', 'watches', 4200, 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80', 'Automatic movement watch with sapphire crystal glass and Milanese steel band.', 'Engineered with Swiss automatic self-winding movement featuring dual-barrel 72-hour power reserves. The dial is precision crafted in deep obsidian enamel, protected by ultra-reflective double domed sapphire crystal, and wrapped in a beautiful stainless Milanese magnetic strap.', ARRAY['Calibre MC-50 Swiss automatic movement', 'Double-domed anti-reflective sapphire glass', 'Polished 316L surgical stainless-steel case', 'Water resistant to 50m (5 ATM)', 'Lifetime mechanical warranty included'], 5, true, 4.9),
('550e8400-e29b-41d4-a716-446655440008', 'Santal Mystique Extrait', 'Arooj Perfumes', 'fragrances', 240, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80', 'Highly concentrated fragrance featuring aged Indian sandalwood and cardamoms.', 'A hypnotic, warm woody unisex fragrance celebrating Santalum Album found in the rain forests of Mysore. We blend this rare oil with rich green cardamom spices, leather chords, and cracked dry cedar notes for a fragrance that lingers dynamically for hours.', ARRAY['Pure Perfume Extrait concentration (24%)', 'Primary components: Mysore Sandalwood, Cardamom', 'Secondary accents: Amber, Violet, Smoky Papyrus', 'Hand-filtered and aged locally for 90 days', 'Elegant heavy glass bottle with magnetic cap'], 30, true, 4.8)
ON CONFLICT (id) DO NOTHING;
