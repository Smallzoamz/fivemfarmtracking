-- Add price range options to farm_jobs
ALTER TABLE public.farm_jobs ADD COLUMN IF NOT EXISTS has_price_range BOOLEAN DEFAULT false;
ALTER TABLE public.farm_jobs ADD COLUMN IF NOT EXISTS min_price_per_item BIGINT DEFAULT 0;
ALTER TABLE public.farm_jobs ADD COLUMN IF NOT EXISTS max_price_per_item BIGINT DEFAULT 0;

-- Add min/max eco earned to farm_laps for variable/fluctuating income
ALTER TABLE public.farm_laps ADD COLUMN IF NOT EXISTS min_eco_earned BIGINT DEFAULT NULL;
ALTER TABLE public.farm_laps ADD COLUMN IF NOT EXISTS max_eco_earned BIGINT DEFAULT NULL;
