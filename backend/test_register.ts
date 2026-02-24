import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

async function testRegister() {
    // Login
    const resLogin = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'portob162@gmail.com', password: 'batata12' })
    })

    const loginData = await resLogin.json()
    if (!resLogin.ok) {
        console.log('Login falhou:', loginData)
        return
    }

    const token = loginData.session.access_token

    // Registra novo com email único
    const testEmail = `teste_${Date.now()}@gmail.com`
    console.log('Registrando:', testEmail)

    const resReg = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: 'Teste User',
            email: testEmail,
            password: 'senhaforte123',
            role: 'juridico',
            is_supervisor: true,
            nivel: null
        })
    })

    console.log('Status Register:', resReg.status)
    const regData = await resReg.json()
    console.log('Dados Register:', JSON.stringify(regData, null, 2))
}

testRegister()
