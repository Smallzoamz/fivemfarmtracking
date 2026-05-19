-- Supabase SQL Schema for Farm Tracker (Multi-User)

-- 1. Create custom types if needed (Optional, but we can just use text constraints)

-- 2. Presets Table
CREATE TABLE IF NOT EXISTS public.farm_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_goal bigint DEFAULT 1000000,
  job_item_limit integer DEFAULT 60,
  is_vip_mode boolean DEFAULT false,
  is_process_before_store boolean DEFAULT false,
  farm_mode text DEFAULT 'city' CHECK (farm_mode IN ('city', 'dimension')),
  dimension_pocket_loops integer DEFAULT 1,
  dimension_yield_per_loop integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Jobs Table
CREATE TABLE IF NOT EXISTS public.farm_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preset_id uuid REFERENCES public.farm_presets(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_per_item bigint DEFAULT 0,
  item_weight float DEFAULT 1.0,
  processing_type text DEFAULT 'none' CHECK (processing_type IN ('none', 'one_to_one', 'batch_to_one')),
  process_ratio integer DEFAULT 1,
  final_item_name text DEFAULT '',
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Vehicles Table
CREATE TABLE IF NOT EXISTS public.farm_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preset_id uuid REFERENCES public.farm_presets(id) ON DELETE CASCADE,
  name text NOT NULL,
  trunk_capacity float DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Sessions Table
CREATE TABLE IF NOT EXISTS public.farm_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preset_id uuid REFERENCES public.farm_presets(id) ON DELETE CASCADE,
  job_id text NOT NULL, -- Storing as comma-separated string based on existing logic
  vehicle_id uuid, -- Optional, can be null or string
  start_time timestamp with time zone NOT NULL,
  is_crafting boolean DEFAULT false,
  crafting_name text,
  crafting_ratio integer,
  crafting_price bigint,
  is_vip boolean DEFAULT false,
  farm_mode text DEFAULT 'city',
  dimension_loops integer,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.farm_sessions ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- 6. Laps Table
CREATE TABLE IF NOT EXISTS public.farm_laps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.farm_sessions(id) ON DELETE CASCADE,
  lap_number integer NOT NULL,
  duration_ms bigint NOT NULL,
  items_gathered integer NOT NULL,
  eco_earned bigint NOT NULL,
  checkpoints jsonb, -- Stores the JobCheckpoint array
  created_at timestamp with time zone DEFAULT now()
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.farm_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_laps ENABLE ROW LEVEL SECURITY;

-- 8. Create Policies to isolate data per user
-- Presets
DROP POLICY IF EXISTS "Users can manage their own presets" ON public.farm_presets;
CREATE POLICY "Users can manage their own presets" ON public.farm_presets
  FOR ALL USING (auth.uid() = user_id);

-- Jobs
DROP POLICY IF EXISTS "Users can manage their own jobs" ON public.farm_jobs;
CREATE POLICY "Users can manage their own jobs" ON public.farm_jobs
  FOR ALL USING (auth.uid() = user_id);

-- Vehicles
DROP POLICY IF EXISTS "Users can manage their own vehicles" ON public.farm_vehicles;
CREATE POLICY "Users can manage their own vehicles" ON public.farm_vehicles
  FOR ALL USING (auth.uid() = user_id);

-- Sessions (Owner access)
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.farm_sessions;
CREATE POLICY "Users can manage their own sessions" ON public.farm_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Sessions (Public read access)
DROP POLICY IF EXISTS "Anyone can view public sessions" ON public.farm_sessions;
CREATE POLICY "Anyone can view public sessions" ON public.farm_sessions
  FOR SELECT USING (is_public = true);

-- Laps (Owner access)
DROP POLICY IF EXISTS "Users can manage their own laps" ON public.farm_laps;
CREATE POLICY "Users can manage their own laps" ON public.farm_laps
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.farm_sessions s
    WHERE s.id = session_id AND s.user_id = auth.uid()
  ));

-- Laps (Public read access)
DROP POLICY IF EXISTS "Anyone can view laps of public sessions" ON public.farm_laps;
CREATE POLICY "Anyone can view laps of public sessions" ON public.farm_laps
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.farm_sessions s
    WHERE s.id = session_id AND s.is_public = true
  ));
