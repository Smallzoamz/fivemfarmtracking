-- Animal Farming System - Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/muiysoayyceqemkszqps/sql/new

-- Add animal farming columns to farm_jobs
ALTER TABLE farm_jobs ADD COLUMN IF NOT EXISTS job_category TEXT DEFAULT 'white';
ALTER TABLE farm_jobs ADD COLUMN IF NOT EXISTS animals_per_round INTEGER;
ALTER TABLE farm_jobs ADD COLUMN IF NOT EXISTS total_rounds INTEGER;
ALTER TABLE farm_jobs ADD COLUMN IF NOT EXISTS minutes_per_round INTEGER;
ALTER TABLE farm_jobs ADD COLUMN IF NOT EXISTS animal_yields JSONB DEFAULT '[]'::jsonb;

-- Add job_category to farm_sessions
ALTER TABLE farm_sessions ADD COLUMN IF NOT EXISTS job_category TEXT DEFAULT 'white';
