/**
 * add-reset-token.js
 * USO: node deploy/add-reset-token.js --confirm
 * Adiciona colunas reset_token e reset_token_expires_at na tabela profiles
 */
const path = require('path')
const backendModules = path.join(__dirname, '..', 'backend', 'node_modules')
require('module').Module._nodeModulePaths(__dirname).unshift(backendModules)
require(path.join(backendModules, 'dotenv')).config({ path: path.join(__dirname, '..', 'backend', '.env') })
const { createClient } = require(path.join(backendModules, '@supabase', 'supabase-js'))

if (!process.argv.includes('--confirm')) {
  console.error('Execute com --confirm para aplicar a migration')
  process.exit(1)
}

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE
if (!url || !key) {
  console.error('SUPABASE_URL ou SUPABASE_SERVICE não definidos')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

async function run() {
  const sql = `
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS reset_token text,
      ADD COLUMN IF NOT EXISTS reset_token_expires_at timestamptz;

    CREATE INDEX IF NOT EXISTS profiles_reset_token_idx
      ON public.profiles (reset_token)
      WHERE reset_token IS NOT NULL;
  `
  console.log('Aplicando migration...')
  const { error } = await supabase.rpc('exec_sql', { sql })
  if (error) {
    console.error('❌ Erro:', error.message)
    process.exit(2)
  }
  console.log('✅ Colunas reset_token e reset_token_expires_at adicionadas')
}

run().catch((e) => {
  console.error('❌ ERRO:', e.message || e)
  process.exit(2)
})
