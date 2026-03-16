require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'expert.gamers007@gmail.com',
    password: 'mvuKjEucUc'
  });
  console.log('Login result user:', data?.user?.id);
  console.log('Login result error:', error);
}
test();
