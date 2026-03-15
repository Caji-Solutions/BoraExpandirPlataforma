import { supabase } from './src/config/SupabaseClient'
import { v4 as uuidv4 } from 'uuid';

async function testProfileInsert() {
    const testEmail = `test_${Date.now()}@example.com`
    console.log("Testing auth user creation for:", testEmail)
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'password123',
        email_confirm: true,
        user_metadata: { full_name: 'Test Setup User', role: 'cliente' }
    })
    
    if (authError) {
        console.log("AUTH CREATE ERROR", authError)
        return
    }
    
    const userId = authData.user.id
    console.log("Auth user created with ID:", userId)
    
    console.log("Upserting profile...")
    const { error: profileError, data } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            full_name: 'Test Setup User',
            email: testEmail,
            role: 'cliente',
            cpf: null,
            telefone: '+551199999999'
        })
        
    if (profileError) {
        console.error("ERRO AO INSERIR PROFILE:", profileError)
    } else {
        console.log("SUCESSO AO INSERIR PROFILE")
    }
}

testProfileInsert()
