const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE

const supabase = createClient(supabaseUrl, supabaseKey)

async function find() {
  const { data, error } = await supabase
    .from('profiles')
    .select('email, id, auth_token')
    .eq('email', 'joao-victor_07@outlook.com')
    .single()
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Profile:', data)
  }
}

find()
