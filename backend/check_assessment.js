const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const clienteId = '83567db5-bf9b-4ba7-8b50-7c90e600bde5'
  console.log(`Checking assessments for client: ${clienteId}`)
  const { data, error } = await supabase.from('assessorias_juridico').select('*').eq('cliente_id', clienteId).order('criado_em', { ascending: false }).limit(1)
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Latest assessment:', data[0])
  }
}

check()
