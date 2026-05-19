const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://muiysoayyceqemkszqps.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aXlzb2F5eWNlcWVta3N6cXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTczNDIsImV4cCI6MjA5NDY5MzM0Mn0.O9M3dqJ_y3uLnFCzPlXo1yOwABIuoPqKdi9f63xSbsM');

async function test() {
  const { data, error } = await supabase.from('farm_sessions').insert({
      id: '2d611d3d-d746-420a-9b82-7377d4e38c50',
      user_id: '12345678-1234-1234-1234-123456789012',
      preset_id: 'default',
      job_id: 'test',
      start_time: new Date().toISOString()
  });
  console.log('Error:', error);
}
test();
