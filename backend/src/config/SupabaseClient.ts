import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config()
const supabaseUrl = process.env.SUPABASE_URL

console.log('[SupabaseClient] Iniciando...')
console.log('[SupabaseClient] SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida')

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is not set');
}
const supabaseKey = process.env.SUPABASE_SERVICE

console.log('[SupabaseClient] SUPABASE_SERVICE:', supabaseKey ? `✅ Definida (${supabaseKey.substring(0, 20)}...)` : '❌ Não definida')

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE environment variable is not set');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

console.log('[SupabaseClient] Cliente Supabase criado com sucesso')