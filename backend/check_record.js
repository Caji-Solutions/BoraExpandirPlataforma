const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const id = '752e174a-d390-47ef-8ff0-33505d31b395'
  console.log(`Checking dependent ID: ${id}`)
  const { data, error } = await supabase.from('dependentes').select('*').eq('id', id).maybeSingle()
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Record found:', data)
  }
}

check()
