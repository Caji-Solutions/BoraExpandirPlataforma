import { supabase } from './src/config/SupabaseClient'

async function checkAndCleanGhosts() {
    console.log("Looking up cajisolutionsofc@gmail.com one more time...")
    // Searching by email locally rather than trusting listUsers to work reliably
    // Supabase has auth.admin.getUserById but not *ByEmail in JS client exactly, 
    // but listUsers might work if we filter. 
    
    // Attempt listUsers with pagination
    let page = 1;
    let foundId = null;
    
    while (!foundId) {
        console.log(`Page ${page}...`)
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 })
        if (error) {
            console.error("List error:", error)
            break
        }
        if (!data.users || data.users.length === 0) break
        
        const ghost = data.users.find(u => u.email === 'cajisolutionsofc@gmail.com')
        if (ghost) {
            foundId = ghost.id
            console.log("Ghost found! ID:", foundId)
            break
        }
        page++
    }
    
    if (foundId) {
        console.log("Deleting ghost user from Auth...")
        const { error: delError } = await supabase.auth.admin.deleteUser(foundId)
        if (delError) {
             console.error("Fail deleting ghost:", delError)
        } else {
             console.log("GHOST DELETED!")
        }
    } else {
        console.log("No ghost found via JS Client. It might be deeply stuck or already gone.")
    }
}

checkAndCleanGhosts()
