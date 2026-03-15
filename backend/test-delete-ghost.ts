import { supabase } from './src/config/SupabaseClient'

async function deleteBrokenUsers() {
    console.log("Trying to find and delete broken auth user: cajisolutionsofc@gmail.com")
    // Use page traversal to avoid 500 errors from fetching all at once
    let page = 1;
    let foundId = null;
    
    while(true && !foundId) {
        console.log("Fetching page", page)
        const { data: listData, error } = await supabase.auth.admin.listUsers({
            page,
            perPage: 50
        })
        
        if (error) {
            console.error("Error on page", page, error)
            break;
        }
        
        if (!listData || !listData.users || listData.users.length === 0) {
            console.log("No more users.")
            break;
        }
        
        const user = listData.users.find((u: any) => u.email === 'cajisolutionsofc@gmail.com')
        if (user) {
            foundId = user.id
            console.log("Found ghost user! ID:", foundId)
            break;
        }
        page++;
    }
    
    if (foundId) {
        console.log("Deleting user...")
        const { error: delError } = await supabase.auth.admin.deleteUser(foundId)
        if (delError) {
            console.error("Delete failed:", delError)
        } else {
            console.log("User DELETED successfully. The system is clean for the next test.")
        }
    } else {
        console.log("User not found.")
    }
}

deleteBrokenUsers()
