import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config()
const supabaseUrl = process.env.SUPABASE_URL

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is not set');
}
const supabaseKey = process.env.SUPABASE_SERVICE

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