const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://muiysoayyceqemkszqps.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aXlzb2F5eWNlcWVta3N6cXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTczNDIsImV4cCI6MjA5NDY5MzM0Mn0.O9M3dqJ_y3uLnFCzPlXo1yOwABIuoPqKdi9f63xSbsM');

async function test() {
  const [p, j, v, s, l] = await Promise.all([
    supabase.from('farm_presets').select('count', { count: 'exact' }),
    supabase.from('farm_jobs').select('count', { count: 'exact' }),
    supabase.from('farm_vehicles').select('count', { count: 'exact' }),
    supabase.from('farm_sessions').select('count', { count: 'exact' }),
    supabase.from('farm_laps').select('count', { count: 'exact' })
  ]);
  console.log('Presets:', p.count);
  console.log('Jobs:', j.count);
  console.log('Vehicles:', v.count);
  console.log('Sessions:', s.count);
  console.log('Laps:', l.count);
}
test();
