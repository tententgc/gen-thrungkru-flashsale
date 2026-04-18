-- ThungKhru61 — supplementary SQL that Prisma doesn't manage on its own.
-- Run after `prisma migrate deploy`.

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- pg_cron lives in the supabase-reserved 'cron' schema on Supabase.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- 2. Generated geography columns for fast radius queries
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS geom geography(Point, 4326)
  GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_vendors_geom
  ON public.vendors USING GIST (geom);

ALTER TABLE public.user_locations
  ADD COLUMN IF NOT EXISTS geom geography(Point, 4326)
  GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_user_locations_geom
  ON public.user_locations USING GIST (geom);

-- 3. Trigram indexes for Thai fuzzy search
CREATE INDEX IF NOT EXISTS idx_vendors_name_trgm
  ON public.vendors USING GIN (shop_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON public.products USING GIN (name gin_trgm_ops);

-- 4. Check constraints that mirror sprintplan business rules
ALTER TABLE public.flash_sales
  DROP CONSTRAINT IF EXISTS flash_sale_duration_window,
  ADD CONSTRAINT flash_sale_duration_window CHECK (
    "endAt" > "startAt" + interval '15 minutes'
    AND "endAt" < "startAt" + interval '6 hours 1 minute'
  );

-- 5. Flash-sale status transition cron (runs every minute)
-- Keeps SCHEDULED → ACTIVE → ENDED in sync without requiring an always-on worker.
DO $$
BEGIN
  PERFORM cron.schedule(
    'flash-sale-status-transitions',
    '* * * * *',
    $cron$
    UPDATE public.flash_sales
       SET status = 'ACTIVE'
     WHERE status = 'SCHEDULED'
       AND "startAt" <= now()
       AND "endAt"   >  now();

    UPDATE public.flash_sales
       SET status = 'ENDED'
     WHERE status IN ('SCHEDULED', 'ACTIVE')
       AND "endAt" <= now();
    $cron$
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'skipping cron schedule (likely already exists or cron not enabled): %', SQLERRM;
END$$;

-- 6. RLS (only turned on when explicitly opted-in via env; safe to run twice)
ALTER TABLE public.vendors       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_sales   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews       ENABLE ROW LEVEL SECURITY;

-- Public reads on catalog tables
DROP POLICY IF EXISTS "public read vendors"   ON public.vendors;
CREATE POLICY "public read vendors"   ON public.vendors   FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read products" ON public.products;
CREATE POLICY "public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read flash_sales" ON public.flash_sales;
CREATE POLICY "public read flash_sales" ON public.flash_sales FOR SELECT USING (true);

DROP POLICY IF EXISTS "public read reviews" ON public.reviews;
CREATE POLICY "public read reviews"   ON public.reviews   FOR SELECT USING (true);

-- Owner-only writes
DROP POLICY IF EXISTS "vendor writes own vendor" ON public.vendors;
CREATE POLICY "vendor writes own vendor" ON public.vendors
  FOR ALL USING (auth.uid() = "userId"::uuid)
  WITH CHECK (auth.uid() = "userId"::uuid);

DROP POLICY IF EXISTS "vendor writes own products" ON public.products;
CREATE POLICY "vendor writes own products" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.vendors v
            WHERE v.id = "vendorId"::uuid AND v."userId"::uuid = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.vendors v
            WHERE v.id = "vendorId"::uuid AND v."userId"::uuid = auth.uid())
  );

DROP POLICY IF EXISTS "vendor writes own flash_sales" ON public.flash_sales;
CREATE POLICY "vendor writes own flash_sales" ON public.flash_sales
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.vendors v
            WHERE v.id = "vendorId"::uuid AND v."userId"::uuid = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.vendors v
            WHERE v.id = "vendorId"::uuid AND v."userId"::uuid = auth.uid())
  );

-- User-scoped data
DROP POLICY IF EXISTS "user rw own location" ON public.user_locations;
CREATE POLICY "user rw own location" ON public.user_locations
  FOR ALL USING (auth.uid() = "userId"::uuid)
  WITH CHECK (auth.uid() = "userId"::uuid);

DROP POLICY IF EXISTS "user rw own follows" ON public.follows;
CREATE POLICY "user rw own follows" ON public.follows
  FOR ALL USING (auth.uid() = "userId"::uuid)
  WITH CHECK (auth.uid() = "userId"::uuid);

DROP POLICY IF EXISTS "user rw own favorites" ON public.favorites;
CREATE POLICY "user rw own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = "userId"::uuid)
  WITH CHECK (auth.uid() = "userId"::uuid);

DROP POLICY IF EXISTS "user writes own reviews" ON public.reviews;
CREATE POLICY "user writes own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = "userId"::uuid);

DROP POLICY IF EXISTS "user updates own reviews" ON public.reviews;
CREATE POLICY "user updates own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = "userId"::uuid)
  WITH CHECK (auth.uid() = "userId"::uuid);
