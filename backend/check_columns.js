const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  console.log('Checking dependentes table...')
  const { data, error } = await supabase.from('dependentes').select('*').limit(1)
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Columns found:', Object.keys(data[0] || {}))
    console.log('Sample record:', data[0])
  }
}

check()
