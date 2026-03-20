const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://rtuxziaxeegbaaihpjni.supabase.co'
const SUPABASE_SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dXh6aWF4ZWVnYmFhaWhwam5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDYxMzYxMywiZXhwIjoyMDgwMTg5NjEzfQ.uWeF9ihRMIRFYhID4Il1sFIsykACs9TTEfmpA7sGPFA'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
  auth: { persistSession: false, autoRefreshToken: false }
})

async function main() {
  const EMAIL = 'portob162@gmail.com'
  const PASSWORD = '123123'
  
  console.log('=== 1. Configurando super_admin ===')
  
  // Estratégia: deletar user existente e recriar limpo
  // Primeiro tentar achar pelo profiles
  const { data: profile } = await supabase.from('profiles').select('id').eq('email', EMAIL).maybeSingle()
  
  if (profile) {
    console.log('Encontrado no profiles:', profile.id)
    // Deletar auth e profile para recriar
    console.log('Deletando user antigo...')
    await supabase.from('profiles').delete().eq('id', profile.id)
    await supabase.auth.admin.deleteUser(profile.id)
    console.log('User antigo deletado.')
  } else {
    // Tentar achar no auth via getUserByEmail (não existe nativamente, mas podemos tentar RPC)
    // Alternativa: listar TODOS os users
    console.log('Não encontrado no profiles. Buscando no Auth...')
    let allUsers = []
    let page = 1
    while (true) {
      const { data } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
      if (!data?.users?.length) break
      allUsers = allUsers.concat(data.users)
      if (data.users.length < 1000) break
      page++
    }
    console.log(`Total de users no Auth: ${allUsers.length}`)
    const found = allUsers.find(u => u.email === EMAIL)
    if (found) {
      console.log('Encontrado no Auth:', found.id, '- Deletando...')
      await supabase.auth.admin.deleteUser(found.id)
      console.log('Deletado.')
    } else {
      console.log('Não encontrado no Auth. Será criado do zero.')
    }
  }

  // Agora criar limpo
  console.log('Criando super_admin...')
  const { data: authData, error: createErr } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: 'Bruno Porto', role: 'super_admin', is_supervisor: true }
  })

  if (createErr) {
    console.error('ERRO ao criar:', createErr.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log('Auth user criado:', userId)

  // Criar profile
  const { error: profErr } = await supabase.from('profiles').upsert({
    id: userId,
    full_name: 'Bruno Porto',
    email: EMAIL,
    role: 'super_admin'
  })
  if (profErr) console.error('Erro profile:', profErr.message)
  else console.log('Profile super_admin criado!')

  console.log('\n=== 2. Limpando tabelas ===')
  const tables = [
    'notas_juridico', 'formularios_cliente', 'formularios_juridico',
    'documentos', 'requerimentos', 'assessorias_juridico', 'processos',
    'agendamentos', 'contratos_servicos', 'notificacoes', 'clientes'
  ]
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log(error ? `  ⚠️  ${table}: ${error.message}` : `  ✅ ${table}: limpo`)
  }

  console.log('\n✅ Pronto!')
  console.log(`Login: ${EMAIL} / ${PASSWORD} (super_admin)`)
}

main().catch(console.error)
