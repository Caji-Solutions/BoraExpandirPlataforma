/**
 * wipe-and-seed.js
 * USO: node wipe-and-seed.js --confirm
 * Lê SUPABASE_URL e SUPABASE_SERVICE do ../backend/.env
 * 1. TRUNCATE ALL tables no schema public (CASCADE)
 * 2. Esvazia todos os buckets do Storage
 * 3. Deleta todos os usuários do Auth
 * 4. Cria Sergio Meirelles e Fernanda Meirelles como SUPER_ADMIN
 */
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') })
const { createClient } = require('@supabase/supabase-js')

if (!process.argv.includes('--confirm')) {
  console.error('Execute com --confirm para autorizar operação DESTRUTIVA')
  process.exit(1)
}

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE
if (!url || !key) {
  console.error('SUPABASE_URL ou SUPABASE_SERVICE não definidos')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

async function execSql(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql })
  if (error) throw error
  return data
}

async function listTables() {
  const sql = `SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
  return (await execSql(sql)) || []
}

async function countBefore(tables) {
  console.log('\n=== CONTAGEM ANTES ===')
  for (const t of tables) {
    const name = t.tablename || t
    const { count } = await supabase.from(name).select('*', { count: 'exact', head: true })
    console.log(`  ${name}: ${count ?? '?'}`)
  }
}

async function truncateAll(tables) {
  console.log('\n=== TRUNCATE CASCADE ===')
  const list = tables.map((t) => `"public"."${t.tablename || t}"`).join(', ')
  if (!list) {
    console.log('  nenhuma tabela')
    return
  }
  const sql = `TRUNCATE ${list} RESTART IDENTITY CASCADE`
  console.log(`  SQL: ${sql.slice(0, 120)}${sql.length > 120 ? '...' : ''}`)
  await execSql(sql)
  console.log('  ✓ concluído')
}

async function wipeStorage() {
  console.log('\n=== STORAGE ===')
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) throw error
  for (const b of buckets) {
    console.log(`  bucket: ${b.name}`)
    let cursor = null
    let total = 0
    while (true) {
      const { data: files, error: lerr } = await supabase.storage.from(b.name).list('', {
        limit: 1000,
        offset: cursor || 0,
      })
      if (lerr) throw lerr
      if (!files || files.length === 0) break
      const paths = await collectFiles(b.name, '')
      if (paths.length === 0) break
      const { error: derr } = await supabase.storage.from(b.name).remove(paths)
      if (derr) console.error('    erro remove:', derr.message)
      else console.log(`    ✓ removidos ${paths.length} objetos`)
      total += paths.length
      break
    }
    console.log(`  total: ${total}`)
  }
}

async function collectFiles(bucket, prefix) {
  const out = []
  const { data: entries, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 })
  if (error) throw error
  for (const e of entries || []) {
    const full = prefix ? `${prefix}/${e.name}` : e.name
    if (e.id === null) {
      const sub = await collectFiles(bucket, full)
      out.push(...sub)
    } else {
      out.push(full)
    }
  }
  return out
}

async function wipeAuth() {
  console.log('\n=== AUTH USERS ===')
  let page = 1
  let total = 0
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const users = data.users || []
    if (users.length === 0) break
    for (const u of users) {
      const { error: derr } = await supabase.auth.admin.deleteUser(u.id)
      if (derr) console.error(`  erro ao deletar ${u.email}:`, derr.message)
      else total++
    }
    if (users.length < 1000) break
    page++
  }
  console.log(`  ✓ deletados ${total} usuários`)
}

async function createAdmin(email, password, nome) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome, tipo: 'SUPER_ADMIN' },
  })
  if (error) throw new Error(`createUser ${email}: ${error.message}`)
  const id = data.user.id
  const { error: ierr } = await supabase.from('usuarios').insert({
    id,
    email,
    nome,
    tipo: 'SUPER_ADMIN',
  })
  if (ierr) throw new Error(`insert usuarios ${email}: ${ierr.message}`)
  console.log(`  ✓ ${email} (${nome}) id=${id}`)
  return id
}

async function seed() {
  console.log('\n=== SEED SUPER ADMINS ===')
  await createAdmin('adm@boraexpandir.com.br', 'Jeovashama@1', 'Sergio Meirelles')
  await createAdmin('adv@boraexpandir.com.br', 'Jeovashama@1', 'Fernanda Meirelles')
}

async function main() {
  console.log('URL:', url)
  const tables = await listTables()
  console.log('Tabelas encontradas:', tables.map((t) => t.tablename || t).join(', '))
  await countBefore(tables)
  await truncateAll(tables)
  await wipeStorage()
  await wipeAuth()
  await seed()
  console.log('\n✅ Limpeza + seed concluídos')
}

main().catch((e) => {
  console.error('\n❌ ERRO:', e.message || e)
  process.exit(2)
})
