-- =============================================
-- Run this in Supabase SQL Editor
-- Creates tables if missing, adds product_ids to packs
-- =============================================

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  address text,
  contact_method text NOT NULL DEFAULT 'whatsapp',
  promo_code text,
  discount_amount numeric NOT NULL DEFAULT 0,
  subtotal numeric NOT NULL,
  total_price numeric NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Admins can manage orders') THEN
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    GRANT INSERT ON public.orders TO anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
    GRANT ALL ON public.orders TO service_role;
    CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
    CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- PROMO CODES
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL,
  min_purchase_amount numeric,
  max_uses integer,
  current_uses integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='promo_codes' AND policyname='Public can read active promo codes') THEN
    ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
    GRANT SELECT ON public.promo_codes TO anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_codes TO authenticated;
    GRANT ALL ON public.promo_codes TO service_role;
    CREATE POLICY "Public can read active promo codes" ON public.promo_codes FOR SELECT USING (is_active = true);
    CREATE POLICY "Admins can manage promo codes" ON public.promo_codes FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- PRODUCT PACKS
CREATE TABLE IF NOT EXISTS public.product_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  min_items integer NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL,
  applicable_categories jsonb,
  product_ids jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add product_ids column if table existed already without it
ALTER TABLE public.product_packs ADD COLUMN IF NOT EXISTS product_ids jsonb;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='product_packs' AND policyname='Public can read active product packs') THEN
    ALTER TABLE public.product_packs ENABLE ROW LEVEL SECURITY;
    GRANT SELECT ON public.product_packs TO anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_packs TO authenticated;
    GRANT ALL ON public.product_packs TO service_role;
    CREATE POLICY "Public can read active product packs" ON public.product_packs FOR SELECT USING (is_active = true);
    CREATE POLICY "Admins can manage product packs" ON public.product_packs FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- HELPER: increment promo uses
CREATE OR REPLACE FUNCTION public.increment_promo_uses(promo_code_value text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.promo_codes SET current_uses = current_uses + 1 WHERE code = promo_code_value;
$$;
