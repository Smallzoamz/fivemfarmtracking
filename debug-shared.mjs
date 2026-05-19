import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://muiysoayyceqemkszqps.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aXlzb2F5eWNlcWVta3N6cXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTczNDIsImV4cCI6MjA5NDY5MzM0Mn0.O9M3dqJ_y3uLnFCzPlXo1yOwABIuoPqKdi9f63xSbsM'
);

console.log('=== End-to-End Share Test ===\n');

// 1. Login as 'boss'
const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
  email: 'boss@gmail.com',
  password: 'boss1234'
});

if (authErr) {
  console.log('Login failed:', authErr.message);
  console.log('Creating account...');
  const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
    email: 'boss@gmail.com',
    password: 'boss1234',
    options: { data: { display_name: 'Boss' } }
  });
  if (signUpErr) { console.log('Signup failed:', signUpErr.message); process.exit(1); }
  console.log('Account created! User ID:', signUp.user.id);
}

const userId = auth?.user?.id || (await supabase.auth.getUser()).data.user?.id;
console.log('Logged in as:', userId);

// 2. Create a Preset
const presetId = crypto.randomUUID();
const { error: presetErr } = await supabase.from('farm_presets').upsert({
  id: presetId,
  user_id: userId,
  name: 'Test City',
  target_goal: 1000000,
  job_item_limit: 60
}, { onConflict: 'id' });
console.log('Preset created:', presetErr ? presetErr.message : presetId);

// 3. Create a Job
const jobId = crypto.randomUUID();
await supabase.from('farm_jobs').upsert({
  id: jobId,
  user_id: userId,
  preset_id: presetId,
  name: 'Weed',
  price_per_item: 500,
  item_weight: 1.0,
  processing_type: 'none',
  process_ratio: 1,
  final_item_name: ''
}, { onConflict: 'id' });
console.log('Job created:', jobId);

// 4. Create a Session with is_public = true
const sessionId = crypto.randomUUID();
const { error: sessionErr } = await supabase.from('farm_sessions').upsert({
  id: sessionId,
  user_id: userId,
  preset_id: presetId,
  job_id: jobId,
  vehicle_id: null,
  start_time: new Date().toISOString(),
  is_crafting: false,
  is_vip: false,
  farm_mode: 'city',
  is_public: true
}, { onConflict: 'id' });
console.log('Session created:', sessionErr ? sessionErr.message : sessionId);

// 5. Create Laps
const laps = [
  { id: crypto.randomUUID(), session_id: sessionId, lap_number: 1, duration_ms: 120000, items_gathered: 60, eco_earned: 30000, checkpoints: [{ jobId, durationMs: 120000, itemsGathered: 60 }] },
  { id: crypto.randomUUID(), session_id: sessionId, lap_number: 2, duration_ms: 110000, items_gathered: 60, eco_earned: 30000, checkpoints: [{ jobId, durationMs: 110000, itemsGathered: 60 }] },
  { id: crypto.randomUUID(), session_id: sessionId, lap_number: 3, duration_ms: 105000, items_gathered: 60, eco_earned: 30000, checkpoints: [{ jobId, durationMs: 105000, itemsGathered: 60 }] },
];
const { error: lapErr } = await supabase.from('farm_laps').upsert(laps, { onConflict: 'id' });
console.log('Laps created:', lapErr ? lapErr.message : `${laps.length} laps`);

// 6. Sign out and test anonymous access
await supabase.auth.signOut();
console.log('\nSigned out. Now testing anonymous access...');

const { data: publicSession, error: pubErr } = await supabase
  .from('farm_sessions')
  .select('id, is_public, start_time, farm_laps(*)')
  .eq('id', sessionId)
  .single();

console.log('\nAnonymous fetch result:');
console.log('  Session found:', publicSession ? 'YES' : 'NO');
console.log('  is_public:', publicSession?.is_public);
console.log('  laps count:', publicSession?.farm_laps?.length);
console.log('  error:', pubErr?.message || 'none');

console.log('\n✅ Share URL: http://localhost:3000/shared/' + sessionId);
