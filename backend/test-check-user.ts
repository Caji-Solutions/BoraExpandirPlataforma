import { supabase } from './src/config/SupabaseClient'

async function checkUser() {
    console.log("Checking user cajisolutionsofc@gmail.com ...")
    const { data: listData, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
        console.error("List users error:", error)
        return
    }
    
    const user = listData?.users?.find((u: any) => u.email === 'cajisolutionsofc@gmail.com')
    if (user) {
        console.log("User found:", user.id, user.email, "created:", user.created_at)
        
        // Let's also check if they are in profiles
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        console.log("Profile data:", profile)
        
        const { data: cliente } = await supabase.from('clientes').select('*').eq('user_id', user.id).single()
        console.log("Cliente by user_id:", cliente)
    } else {
        console.log("USER NOT FOUND in auth.users!")
        
        const { data: clienteByEmail } = await supabase.from('clientes').select('*').eq('email', 'cajisolutionsofc@gmail.com').single()
        console.log("But cliente found by email:", clienteByEmail)
    }
}

checkUser()
