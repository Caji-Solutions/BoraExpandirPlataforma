import { Router, Request, Response } from 'express'
import { supabase } from '../config/SupabaseClient'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const router = Router()

// Helper: monta o profile completo a partir da tabela profiles apenas
function buildFullProfile(profile: any) {
    return {
        ...profile,
        // Agora o profile carrega is_supervisor e nivel se forem persistidos na tabela
        is_supervisor: profile?.is_supervisor || false,
        nivel: profile?.nivel || null,
        horario_trabalho: profile?.horario_trabalho || null,
    }
}

// Helper: buscar usuário a partir do token (Bearer UUID)
async function getUserByToken(req: Request) {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null

    const token = authHeader.split(' ')[1]
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_token', token)
        .single()
        
    return profile
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

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single()

        if (error || !profile) {
            return res.status(401).json({ error: 'Email ou senha inválidos' })
        }

        if (!profile.password_hash) {
            return res.status(401).json({ error: 'Erro de autenticação: Conta sem senha definida' })
        }

        const isMatch = await bcrypt.compare(password, profile.password_hash)

        if (!isMatch) {
            return res.status(401).json({ error: 'Email ou senha inválidos' })
        }

        const token = crypto.randomUUID()
        
        await supabase
            .from('profiles')
            .update({ auth_token: token })
            .eq('id', profile.id)

        const fullProfile = buildFullProfile(profile)

        return res.json({
            user: { id: profile.id, email: profile.email },
            profile: fullProfile,
            session: {
                access_token: token,
                refresh_token: token,
                expires_at: Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 dias
            }
        })
    } catch (error: any) {
        console.error('Erro no login:', error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// POST /auth/reset-password — Redefinir senha de usuário via token de recuperação
// ============================================
router.post('/reset-password', async (req: Request, res: Response) => {
    try {
        const { access_token, new_password } = req.body

        if (!access_token || !new_password) {
            return res.status(400).json({ error: 'Token de acesso e nova senha são obrigatórios' })
        }

        if (new_password.length < 6) {
            return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('auth_token', access_token)
            .single()

        if (!profile) {
            return res.status(401).json({ error: 'Link de recuperação inválido ou expirado' })
        }

        const salt = await bcrypt.genSalt(10)
        const password_hash = await bcrypt.hash(new_password, salt)

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ password_hash })
            .eq('id', profile.id)

        if (updateError) {
            return res.status(500).json({ error: updateError.message })
        }

        return res.json({ message: 'Senha atualizada com sucesso' })
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// GET /auth/me — Dados do usuário logado
// ============================================
router.get('/me', async (req: Request, res: Response) => {
    try {
        const profile = await getUserByToken(req)

        if (!profile) {
            return res.status(401).json({ error: 'Token inválido ou expirado' })
        }

        const fullProfile = buildFullProfile(profile)
        return res.json({ user: { id: profile.id, email: profile.email }, profile: fullProfile })
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
        const adminProfile = await getUserByToken(req)

        if (!adminProfile || adminProfile.role !== 'super_admin') {
            return res.status(403).json({ error: 'Apenas Super Admin pode registrar colaboradores' })
        }

        const { name, email, password, role, nivel, is_supervisor, cpf, telefone, horario_trabalho } = req.body

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Nome, email, senha e função são obrigatórios' })
        }

        const validRoles = ['comercial', 'juridico', 'administrativo', 'tradutor', 'super_admin']
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: `Função inválida. Opções: ${validRoles.join(', ')}` })
        }

        const isSupervisor = role === 'tradutor' ? false : (is_supervisor || false)

        const salt = await bcrypt.genSalt(10)
        const password_hash = await bcrypt.hash(password, salt)
        const newId = crypto.randomUUID()

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: newId,
                full_name: name,
                email,
                role,
                cpf: cpf || null,
                telefone: telefone || null,
                horario_trabalho: horario_trabalho || null,
                password_hash,
                is_supervisor: isSupervisor, // Note: certifique-se que o profile aceita adds sem dar erro nas colunas q faltam
                nivel: nivel || null
            })
            .select()
            .single()

        if (profileError) {
            if (profileError.code === '23505') {
                return res.status(409).json({ error: 'Já existe um usuário com esse email' })
            }
            return res.status(500).json({ error: 'Erro ao criar perfil', detail: profileError.message })
        }

        return res.status(201).json({ user: { id: profile.id, email: profile.email }, profile: buildFullProfile(profile) })
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// GET /auth/team — Listar todos os colaboradores
// ============================================
router.get('/team', async (req: Request, res: Response) => {
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('role', { ascending: true })
            .order('full_name', { ascending: true })

        if (error) {
            return res.status(500).json({ error: 'Erro ao listar equipe' })
        }

        const fullProfiles = (profiles || []).map(p => buildFullProfile(p))
        return res.json(fullProfiles)
    } catch (error: any) {
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
            return res.status(500).json({ error: 'Erro ao listar equipe' })
        }

        const fullProfiles = (profiles || []).map(p => buildFullProfile(p))
        return res.json(fullProfiles)
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// DELETE /auth/team/:id — Remover colaborador
// ============================================
router.delete('/team/:id', async (req: Request, res: Response) => {
    try {
        const adminProfile = await getUserByToken(req)

        if (!adminProfile || adminProfile.role !== 'super_admin') {
            return res.status(403).json({ error: 'Apenas Super Admin pode remover colaboradores' })
        }

        const { id } = req.params
        if (id === adminProfile.id) {
            return res.status(400).json({ error: 'Você não pode remover seu próprio usuário' })
        }

        const { error: profileError } = await supabase.from('profiles').delete().eq('id', id)

        if (profileError) {
            return res.status(500).json({ error: 'Erro ao remover usuário' })
        }

        return res.json({ message: 'Colaborador removido com sucesso' })
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// PATCH /auth/team/:id/password — Alterar senha de um colaborador
// ============================================
router.patch('/team/:id/password', async (req: Request, res: Response) => {
    try {
        const adminProfile = await getUserByToken(req)

        if (!adminProfile || adminProfile.role !== 'super_admin') {
            return res.status(403).json({ error: 'Apenas Super Admin pode alterar senhas' })
        }

        const { id } = req.params
        const { password } = req.body

        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' })
        }

        const salt = await bcrypt.genSalt(10)
        const password_hash = await bcrypt.hash(password, salt)

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ password_hash, auth_token: null }) // force logout on pass change limit
            .eq('id', id)

        if (updateError) {
            return res.status(500).json({ error: 'Erro ao atualizar senha' })
        }

        return res.json({
            message: 'Senha atualizada com sucesso',
            isSelfUpdate: adminProfile.id === id
        })
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// PATCH /auth/team/:id — Atualizar dados de um colaborador
// ============================================
router.patch('/team/:id', async (req: Request, res: Response) => {
    try {
        const adminProfile = await getUserByToken(req)

        if (!adminProfile || adminProfile.role !== 'super_admin') {
            return res.status(403).json({ error: 'Apenas Super Admin pode alterar colaboradores' })
        }

        const { id } = req.params
        const { name, email, role, nivel, is_supervisor, cpf, telefone, horario_trabalho } = req.body

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: name,
                role,
                cpf: cpf || null,
                telefone: telefone || null,
                horario_trabalho: horario_trabalho || null,
                is_supervisor: role === 'tradutor' ? false : (is_supervisor || false),
                nivel: nivel || null,
                ...(email ? { email } : {})
            })
            .eq('id', id)

        if (profileError) {
            return res.status(500).json({ error: 'Erro ao atualizar perfil' })
        }

        return res.json({ message: 'Colaborador atualizado com sucesso' })
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

export default router
