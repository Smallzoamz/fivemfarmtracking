-- Migration to add pocket mode columns to farm_presets
ALTER TABLE farm_presets 
ADD COLUMN IF NOT EXISTS pocket_mode TEXT DEFAULT 'limit',
ADD COLUMN IF NOT EXISTS pocket_kilo_limit NUMERIC DEFAULT 30;
