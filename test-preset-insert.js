const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://muiysoayyceqemkszqps.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aXlzb2F5eWNlcWVta3N6cXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTczNDIsImV4cCI6MjA5NDY5MzM0Mn0.O9M3dqJ_y3uLnFCzPlXo1yOwABIuoPqKdi9f63xSbsM');

async function test() {
  const { data, error } = await supabase.from('farm_presets').insert({
    id: '12345678-1234-1234-1234-123456789012',
    user_id: '12345678-1234-1234-1234-123456789012',
    name: 'Test',
    target_goal: 1000,
    job_item_limit: 60
  });
  console.log('Error:', error);
}
test();
