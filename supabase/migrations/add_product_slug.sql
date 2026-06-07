-- Migration: Add unique slug column to products table
-- This migration adds a slug column to the products table and populates it for existing products

-- Step 1: Add the slug column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'slug'
    ) THEN
        ALTER TABLE public.products ADD COLUMN slug TEXT;
    END IF;
END $$;

-- Step 2: Populate slug column for existing products
-- Generate slugs from product names by:
-- 1. Converting to lowercase
-- 2. Removing special characters
-- 3. Replacing spaces with hyphens
UPDATE public.products
SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Step 3: Add unique constraint on slug column
-- First, handle any potential duplicates by appending numbers
DO $$
DECLARE
    duplicate RECORD;
    counter INTEGER;
BEGIN
    FOR duplicate IN 
        SELECT slug, COUNT(*) as count 
        FROM public.products 
        WHERE slug IS NOT NULL AND slug != ''
        GROUP BY slug 
        HAVING COUNT(*) > 1
    LOOP
        counter := 1;
        FOR dup_row IN 
            SELECT id FROM public.products 
            WHERE slug = duplicate.slug 
            ORDER BY id
        LOOP
            UPDATE public.products 
            SET slug = duplicate.slug || '-' || counter
            WHERE id = dup_row.id;
            counter := counter + 1;
        END LOOP;
    END LOOP;
END $$;

-- Step 4: Add unique constraint
ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);

-- Step 5: Add NOT NULL constraint
ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;
