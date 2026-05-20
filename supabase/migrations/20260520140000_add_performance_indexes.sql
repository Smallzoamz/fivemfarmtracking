-- Performance Indexes to speed up multi-user data load and joins
CREATE INDEX IF NOT EXISTS idx_farm_presets_user_id ON public.farm_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_jobs_user_id ON public.farm_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_jobs_preset_id ON public.farm_jobs(preset_id);
CREATE INDEX IF NOT EXISTS idx_farm_vehicles_user_id ON public.farm_vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_vehicles_preset_id ON public.farm_vehicles(preset_id);
CREATE INDEX IF NOT EXISTS idx_farm_sessions_user_id ON public.farm_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_sessions_preset_id ON public.farm_sessions(preset_id);
CREATE INDEX IF NOT EXISTS idx_farm_laps_session_id ON public.farm_laps(session_id);
