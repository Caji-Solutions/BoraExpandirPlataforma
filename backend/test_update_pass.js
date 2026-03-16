require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const userId = '8cadbed6-865e-4fb0-b3b0-91d0877c0a0d';
  console.log('Updating password for user:', userId);
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password: 'mvuKjEucUc'
  });
  console.log('Update result data:', data);
  console.log('Update result error:', error);

  // also test login
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'expert.gamers007@gmail.com',
    password: 'mvuKjEucUc'
  });
  console.log('Login after update - result:', loginData?.user?.id ? 'Success' : 'Failed', loginError);
}
test();
