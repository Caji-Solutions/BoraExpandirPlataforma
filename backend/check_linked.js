const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  console.log('Checking all dependents for any with processo_id...')
  const { data, error } = await supabase.from('dependentes').select('*').not('processo_id', 'is', null)
  if (error) {
    console.error('Error:', error)
  } else {
    console.log(`Found ${data.length} linked dependents.`)
    console.log('Sample:', data[0])
  }
}

check()
