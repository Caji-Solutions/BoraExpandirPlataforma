const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE

const supabase = createClient(supabaseUrl, supabaseKey)

async function link() {
  const depId = '752e174a-d390-47ef-8ff0-33505d31b395'
  const procId = 'd2e922a4-fb71-46cc-963d-95cae7a12421'
  
  console.log(`Linking dependent ${depId} to process ${procId}...`)
  
  const { data, error } = await supabase
    .from('dependentes')
    .update({ processo_id: procId })
    .eq('id', depId)
    .select()

  if (error) {
    console.error('Update Error:', error)
  } else {
    console.log('Update Success:', data)
  }
}

link()
