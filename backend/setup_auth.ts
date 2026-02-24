import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE!
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixProfile() {
    console.log('🔍 Verificando usuário na tabela profiles...\n')

    // O ID que vimos na imagem é db421fea-2783-4c76-ad9a-f5c5fb88a464
    const authId = 'db421fea-2783-4c76-ad9a-f5c5fb88a464'

    // Verificar se já existe
    const { data: existing, error: errCheck } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authId)
        .single()

    if (existing) {
        console.log('✅ Usuário já existe na tabela profiles:', existing)

        // Atualiza apenas os campos obrigatórios para garantir
        const { error: errUpdate } = await supabase
            .from('profiles')
            .update({
                email: 'portob162@gmail.com',
                full_name: 'Bruno Porto',
                role: 'super_admin'
            })
            .eq('id', authId)

        if (errUpdate) console.log('❌ Erro ao atualizar:', errUpdate)
        else console.log('✅ Usuário atualizado com sucesso (Role = super_admin)')
    } else {
        console.log('⚠️ Usuário não encontrado em profiles. Inserindo...')

        // Tenta inserir apenas com as colunas que a gente sabe que existem pela imagem:
        // id, email, full_name, role
        const { error: errInsert } = await supabase
            .from('profiles')
            .insert({
                id: authId,
                email: 'portob162@gmail.com',
                full_name: 'Bruno Porto',
                role: 'super_admin'
            })

        if (errInsert) {
            console.log('❌ Erro no insert:', errInsert.message)
        } else {
            console.log('✅ Usuário inserido com sucesso!')
        }
    }
}

fixProfile().then(() => console.log('\nPronto!'))
