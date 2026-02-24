import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE!
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkIds() {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'portob162@gmail.com',
        password: 'batata12'
    })

    if (authError) {
        console.log('Login failed:', authError.message)
        return
    }

    console.log('Auth ID:', authData.user.id)

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', authData.user.id)
        .single()

    if (profileError) {
        console.log('Profile query error:', profileError.message)

        // Check what profiles DO exist
        const { data: allProfiles } = await supabase.from('profiles').select('id, email, full_name').limit(5)
        console.log('Existing profiles:', allProfiles)
    } else {
        console.log('Profile Found:', profile)
    }
}

checkIds()
