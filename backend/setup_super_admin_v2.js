const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const SUPABASE_URL = 'https://rtuxziaxeegbaaihpjni.supabase.co'
const SUPABASE_SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dXh6aWF4ZWVnYmFhaWhwam5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDYxMzYxMywiZXhwIjoyMDgwMTg5NjEzfQ.uWeF9ihRMIRFYhID4Il1sFIsykACs9TTEfmpA7sGPFA'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false }
})

async function main() {
  const EMAIL = 'portob162@gmail.com'
  const PASSWORD = '123123'
  
  console.log('=== 1. Modificando Schema do Banco ===')
  // We can attempt to run the migration via rpc if a function exists, but we don't assume.
  // We'll trust the user ran `migration.sql` or we can try to insert and see if it fails.
  
  console.log('\n=== 2. Configurando super_admin no banco ===')
  const salt = await bcrypt.genSalt(10)
  const password_hash = await bcrypt.hash(PASSWORD, salt)
  const newId = crypto.randomUUID()

  // Verify if it exists
  const { data: existingProfile } = await supabase.from('profiles').select('id').eq('email', EMAIL).maybeSingle()
  
  if (existingProfile) {
    console.log('Profile já existe. Atualizando password e role...')
    const { error: upErr } = await supabase.from('profiles').update({
      password_hash: password_hash,
      role: 'super_admin',
      full_name: 'Bruno Porto'
    }).eq('id', existingProfile.id)
    if (upErr) console.error('Erro ao atualizar:', upErr.message)
    else console.log('✅ super_admin atualizado com sucesso!')
  } else {
    console.log('Criando novo profile super_admin...')
    const { error: inErr } = await supabase.from('profiles').insert({
      id: newId,
      full_name: 'Bruno Porto',
      email: EMAIL,
      role: 'super_admin',
      password_hash: password_hash
    })
    
    if (inErr) {
      if (inErr.message.includes('password_hash')) {
        console.error('❌ ERRO: Parece que a coluna password_hash não existe na tabela profiles.')
        console.log('-> Dica: Rode o código do arquivo migration.sql no SQL Editor do Supabase primeiro!')
      } else {
        console.error('Erro ao inserir:', inErr.message)
      }
      process.exit(1)
    } else {
      console.log('✅ Profile super_admin criado com sucesso!')
    }
  }

  console.log('\n=== 3. Limpando tabelas (Opcional, conforme solicitado) ===')
  const tables = [
    'notas_juridico', 'formularios_cliente', 'formularios_juridico',
    'documentos', 'requerimentos', 'assessorias_juridico', 'processos',
    'agendamentos', 'contratos_servicos', 'notificacoes', 'clientes'
  ]
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log(error ? `  ⚠️  ${table}: ${error.message}` : `  ✅ ${table}: limpo`)
  }

  console.log('\n✨ Tudo limpo e configurado! Use a nova autenticação pelo profiles.')
}

main().catch(console.error)
