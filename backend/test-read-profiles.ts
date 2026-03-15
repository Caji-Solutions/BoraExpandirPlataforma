import { supabase } from './src/config/SupabaseClient'

async function checkProfiles() {
    console.log("Checking profiles table...")
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10)
        .order('id', { ascending: false })
        
    if (error) {
        console.error("Error:", error)
    } else {
        console.log("Profiles found:", profiles?.length)
        console.log(profiles)
    }
}

checkProfiles()
