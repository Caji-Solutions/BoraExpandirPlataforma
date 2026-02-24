import { Router, Request, Response } from 'express'
import { supabase } from '../config/SupabaseClient'
import { createClient } from '@supabase/supabase-js'

const router = Router()

// Helper: monta o profile completo mesclando dados da tabela profiles + user_metadata do Auth
function buildFullProfile(profile: any, authUserMetadata: any) {
    return {
        ...profile,
        is_supervisor: authUserMetadata?.is_supervisor || false,
        nivel: authUserMetadata?.nivel || null,
        senha: authUserMetadata?.senha || null,
    }
}

// ============================================
// POST /auth/login — Login do colaborador
// ============================================
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' })
        }

        // Usa um cliente temporário para não poluir o singleton
        const tempSupabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE!, {
            auth: { persistSession: false, autoRefreshToken: false }
        })

        const { data: authData, error: authError } = await tempSupabase.auth.signInWithPassword({
            email,
            password
        })

        if (authError) {
            console.error('Erro ao fazer login:', authError.message)
            return res.status(401).json({ error: 'Email ou senha inválidos' })
        }

        // Buscar profile na tabela (colunas que já existem)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single()

        if (profileError || !profile) {
            console.error(`Erro ao buscar profile para ID ${authData.user.id}:`, profileError?.message)
            return res.status(404).json({ error: 'Perfil não encontrado. Contate o administrador.' })
        }

        // Mescla dados extras do user_metadata
        const fullProfile = buildFullProfile(profile, authData.user.user_metadata)

        return res.json({
            user: authData.user,
            profile: fullProfile,
            session: {
                access_token: authData.session.access_token,
                refresh_token: authData.session.refresh_token,
                expires_at: authData.session.expires_at
            }
        })
    } catch (error: any) {
        console.error('Erro no login:', error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// GET /auth/me — Dados do usuário logado
// ============================================
router.get('/me', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token não fornecido' })
        }

        const token = authHeader.split(' ')[1]
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) {
            return res.status(401).json({ error: 'Token inválido ou expirado' })
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return res.status(404).json({ error: 'Perfil não encontrado' })
        }

        const fullProfile = buildFullProfile(profile, user.user_metadata)

        return res.json({ user, profile: fullProfile })
    } catch (error: any) {
        console.error('Erro ao buscar /me:', error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// POST /auth/register — Registrar colaborador (Super Admin apenas)
// ============================================
router.post('/register', async (req: Request, res: Response) => {
    try {
        // Verificar se quem está chamando é Super Admin
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token não fornecido' })
        }

        const token = authHeader.split(' ')[1]
        const { data: { user: adminUser }, error: adminError } = await supabase.auth.getUser(token)

        if (adminError || !adminUser) {
            return res.status(401).json({ error: 'Token inválido' })
        }

        // Verificar se é super_admin
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', adminUser.id)
            .single()

        if (!adminProfile || adminProfile.role !== 'super_admin') {
            return res.status(403).json({ error: 'Apenas Super Admin pode registrar colaboradores' })
        }

        const { name, email, password, role, nivel, is_supervisor } = req.body

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Nome, email, senha e função são obrigatórios' })
        }

        // Validar role
        const validRoles = ['comercial', 'juridico', 'administrativo', 'tradutor', 'super_admin']
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: `Função inválida. Opções: ${validRoles.join(', ')}` })
        }

        // Tradutor não pode ser supervisor
        const isSupervisor = role === 'tradutor' ? false : (is_supervisor || false)

        // Criar no Supabase Auth (dados extras vão em user_metadata)
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: name,
                role,
                is_supervisor: isSupervisor,
                nivel: nivel || null,
                senha: password,
            }
        })

        if (authError) {
            console.error('Erro ao criar auth user:', authError.message)
            if (authError.message.includes('already')) {
                return res.status(409).json({ error: 'Já existe um usuário com esse email' })
            }
            return res.status(400).json({ error: authError.message })
        }

        // Upsert no profiles (Supabase tem trigger que auto-cria o registro, por isso usamos upsert)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                full_name: name,
                email,
                role,
            })
            .select()
            .single()

        if (profileError) {
            console.error('Erro ao criar profile:', profileError.message)
            // Rollback: deletar o auth user
            await supabase.auth.admin.deleteUser(authData.user.id)
            return res.status(500).json({ error: 'Erro ao criar perfil', detail: profileError.message })
        }

        // Retorna profile completo mesclando user_metadata
        const fullProfile = buildFullProfile(profile, authData.user.user_metadata)

        return res.status(201).json({ user: authData.user, profile: fullProfile })
    } catch (error: any) {
        console.error('Erro ao registrar colaborador:', error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// GET /auth/team — Listar todos os colaboradores
// ============================================
router.get('/team', async (req: Request, res: Response) => {
    try {
        // Buscar profiles da tabela
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('role', { ascending: true })
            .order('full_name', { ascending: true })

        if (error) {
            console.error('Erro ao listar equipe:', error)
            return res.status(500).json({ error: 'Erro ao listar equipe' })
        }

        // Buscar dados extras do Auth (user_metadata) para mesclar
        // bypass listUsers() cache to get fresh user_metadata (especially for passwords)
        const authMap = new Map<string, any>()
        if (profiles && profiles.length > 0) {
            await Promise.all(
                profiles.map(async (p) => {
                    const { data: userData } = await supabase.auth.admin.getUserById(p.id)
                    if (userData?.user?.user_metadata) {
                        authMap.set(p.id, userData.user.user_metadata)
                    }
                })
            )
        }

        // Mesclar
        const fullProfiles = (profiles || []).map(p => buildFullProfile(p, authMap.get(p.id)))

        return res.json(fullProfiles)
    } catch (error: any) {
        console.error('Erro ao listar equipe:', error)
        return res.status(500).json({ error: 'Erro ao listar equipe' })
    }
})

// ============================================
// GET /auth/team/:role — Listar colaboradores por setor
// ============================================
router.get('/team/:role', async (req: Request, res: Response) => {
    try {
        const { role } = req.params

        const validRoles = ['comercial', 'juridico', 'administrativo', 'tradutor', 'super_admin']
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Setor inválido' })
        }

        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', role)
            .order('full_name', { ascending: true })

        if (error) {
            console.error('Erro ao listar equipe por setor:', error)
            return res.status(500).json({ error: 'Erro ao listar equipe' })
        }

        // Mesclar user_metadata bypassando o cache
        const authMap = new Map<string, any>()
        if (profiles && profiles.length > 0) {
            await Promise.all(
                profiles.map(async (p) => {
                    const { data: userData } = await supabase.auth.admin.getUserById(p.id)
                    if (userData?.user?.user_metadata) {
                        authMap.set(p.id, userData.user.user_metadata)
                    }
                })
            )
        }

        const fullProfiles = (profiles || []).map(p => buildFullProfile(p, authMap.get(p.id)))

        return res.json(fullProfiles)
    } catch (error: any) {
        console.error('Erro ao listar equipe por setor:', error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// DELETE /auth/team/:id — Remover colaborador
// ============================================
router.delete('/team/:id', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token não fornecido' })
        }

        const token = authHeader.split(' ')[1]
        const { data: { user: adminUser }, error: adminError } = await supabase.auth.getUser(token)

        if (adminError || !adminUser) {
            return res.status(401).json({ error: 'Token inválido' })
        }

        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', adminUser.id)
            .single()

        if (!adminProfile || adminProfile.role !== 'super_admin') {
            return res.status(403).json({ error: 'Apenas Super Admin pode remover colaboradores' })
        }

        const { id } = req.params

        if (id === adminUser.id) {
            return res.status(400).json({ error: 'Você não pode remover seu próprio usuário' })
        }

        // Deletar profile
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id)

        if (profileError) {
            console.error('Erro ao deletar profile:', profileError)
        }

        // Deletar auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(id)

        if (authError) {
            console.error('Erro ao deletar auth user:', authError)
            return res.status(500).json({ error: 'Erro ao remover usuário' })
        }

        return res.json({ message: 'Colaborador removido com sucesso' })
    } catch (error: any) {
        console.error('Erro ao remover colaborador:', error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// PATCH /auth/team/:id/password — Alterar senha de um colaborador
// ============================================
router.patch('/team/:id/password', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token não fornecido' })
        }

        const token = authHeader.split(' ')[1]
        const { data: { user: adminUser }, error: adminError } = await supabase.auth.getUser(token)

        if (adminError || !adminUser) {
            console.error('Password PATCH error: Token inválido', adminError)
            return res.status(401).json({ error: 'Token inválido' })
        }

        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', adminUser.id)
            .single()

        if (!adminProfile || adminProfile.role !== 'super_admin') {
            return res.status(403).json({ error: 'Apenas Super Admin pode alterar senhas' })
        }

        const { id } = req.params
        const { password } = req.body

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' })
        }

        // Buscar metadata atual para garantir que nada se perca
        const { data: targetUser, error: targetError } = await supabase.auth.admin.getUserById(id)

        if (targetError || !targetUser.user) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        const currentMetadata = targetUser.user.user_metadata || {}

        // Atualizar senha no Auth + user_metadata
        const { error: updateError } = await supabase.auth.admin.updateUserById(id, {
            password,
            user_metadata: { ...currentMetadata, senha: password }
        })

        if (updateError) {
            console.error('Erro ao atualizar senha:', updateError)
            return res.status(500).json({ error: 'Erro ao atualizar senha' })
        }

        const isSelfUpdate = adminUser.id === id

        return res.json({
            message: 'Senha atualizada com sucesso',
            isSelfUpdate
        })
    } catch (error: any) {
        console.error('Erro ao atualizar senha:', error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

export default router
