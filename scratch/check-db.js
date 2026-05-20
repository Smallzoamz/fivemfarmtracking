const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://muiysoayyceqemkszqps.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aXlzb2F5eWNlcWVta3N6cXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTczNDIsImV4cCI6MjA5NDY5MzM0Mn0.O9M3dqJ_y3uLnFCzPlXo1yOwABIuoPqKdi9f63xSbsM');

async function check() {
  try {
    const { count: sessionCount, error: err1 } = await supabase.from('farm_sessions').select('*', { count: 'exact', head: true });
    const { count: lapCount, error: err2 } = await supabase.from('farm_laps').select('*', { count: 'exact', head: true });
    
    console.log('--- Database Count ---');
    console.log('Total sessions:', sessionCount, err1 ? err1 : '');
    console.log('Total laps:', lapCount, err2 ? err2 : '');

    // Let's see some samples
    const { data: topSessions } = await supabase.from('farm_sessions').select('id, start_time').order('start_time', { ascending: false }).limit(5);
    console.log('Latest 5 sessions:', topSessions);
  } catch (e) {
    console.error(e);
  }
}
check();
