import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE)

async function check() {
  const { data, error } = await supabase.from('dependentes').select('*').limit(1)
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Columns:', Object.keys(data[0] || {}))
    console.log('Sample record:', data[0])
  }
}

check()
