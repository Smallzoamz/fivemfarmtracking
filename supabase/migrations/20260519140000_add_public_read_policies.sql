-- Allow anyone to select presets, jobs, and vehicles
DROP POLICY IF EXISTS "Anyone can view presets" ON public.farm_presets;
CREATE POLICY "Anyone can view presets" ON public.farm_presets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view jobs" ON public.farm_jobs;
CREATE POLICY "Anyone can view jobs" ON public.farm_jobs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view vehicles" ON public.farm_vehicles;
CREATE POLICY "Anyone can view vehicles" ON public.farm_vehicles
  FOR SELECT USING (true);
