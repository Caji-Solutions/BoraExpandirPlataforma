require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById('8cadbed6-865e-4fb0-b3b0-91d0877c0a0d');
  console.log('Auth user result:', JSON.stringify(authUser, null, 2));
}
test();
