import { Router, Request, Response } from 'express'
import { supabase } from '../config/SupabaseClient'
import { authMiddleware } from '../middlewares/auth'
import { loginSchema, registerSchema, validateInput } from '../utils/validators'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import EmailService from '../services/EmailService'

const router = Router()

// Helper: monta o profile completo a partir da tabela profiles apenas
function buildFullProfile(profile: any) {
    return {
        ...profile,
        is_supervisor: profile?.is_supervisor || false,
        nivel: profile?.nivel || null,
        cargo: profile?.cargo || null,
        supervisor_id: profile?.supervisor_id || null,
        horario_trabalho: profile?.horario_trabalho || null,
    }
}

// Helper: determina o cargo baseado em nivel e is_supervisor
function determineCargo(role: string, nivel: string | null, isSupervisor: boolean): string | null {
    if (role !== 'comercial') return null
    if (isSupervisor) return 'HEAD'
    return nivel || 'C1'
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

        const validation = validateInput(loginSchema, { email, password })
        if (!validation.success) {
            return res.status(400).json({ message: 'Validação falhou', errors: validation.errors })
        }

        const { email: validEmail, password: validPassword } = validation.data as { email: string; password: string }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', validEmail)
            .single()

        if (error || !profile) {
            return res.status(401).json({ error: 'Email ou senha inválidos' })
        }

        if (!profile.password_hash) {
            return res.status(401).json({ error: 'Erro de autenticação: Conta sem senha definida' })
        }

        const isMatch = await bcrypt.compare(validPassword, profile.password_hash)

        if (!isMatch) {
            return res.status(401).json({ error: 'Email ou senha inválidos' })
        }

        const token = crypto.randomUUID()
        console.log('[Auth.login] Token gerado:', token)

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ auth_token: token })
            .eq('id', profile.id)

        if (updateError) {
            console.error('[Auth.login] ❌ Erro ao atualizar auth_token:', updateError)
            return res.status(500).json({ error: 'Erro ao gerar token de sessão' })
        }

        console.log('[Auth.login] ✅ Token salvo para o usuário:', profile.id)

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
// POST /auth/forgot-password — Solicitar redefinição de senha
// ============================================
router.post('/forgot-password', async (req: Request, res: Response) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ error: 'Email é obrigatório' })
        }

        const normalizedEmail = email.trim().toLowerCase()

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('email', normalizedEmail)
            .single()

        if (error || !profile) {
            // Por segurança, retornamos 200 mesmo se o email não existir para evitar enumeração de usuários
            return res.json({ message: 'Se o email existir em nossa base, você receberá um link de recuperação' })
        }

        const token = crypto.randomUUID()
        
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ auth_token: token })
            .eq('id', profile.id)

        if (updateError) {
            console.error('[Auth.forgotPassword] ❌ Erro ao salvar token de recuperação:', updateError)
            return res.status(500).json({ error: 'Erro ao processar solicitação' })
        }

        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3010').replace(/\/$/, '')
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`

        await EmailService.sendPasswordResetEmail({
            to: profile.email,
            name: profile.full_name,
            resetUrl
        })

        return res.json({ message: 'Link de recuperação enviado com sucesso' })
    } catch (error: any) {
        console.error('Erro no forgot-password:', error)
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

        const { name, email, password, role, nivel, is_supervisor, supervisor_id, cpf, telefone, horario_trabalho } = req.body

        const validation = validateInput(registerSchema, { name, email, password, role })
        if (!validation.success) {
            return res.status(400).json({ message: 'Validação falhou', errors: validation.errors })
        }

        const { name: validName, email: validEmail, password: validPassword, role: validRole } = validation.data as { name: string; email: string; password: string; role: string }

        const isSupervisor = validRole === 'tradutor' ? false : (is_supervisor || false)
        const cargo = determineCargo(validRole, nivel || null, isSupervisor)

        const salt = await bcrypt.genSalt(10)
        const password_hash = await bcrypt.hash(validPassword, salt)
        const newId = crypto.randomUUID()

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: newId,
                full_name: validName,
                email: validEmail,
                role: validRole,
                cpf: cpf || null,
                telefone: telefone || null,
                horario_trabalho: horario_trabalho || null,
                password_hash,
                is_supervisor: isSupervisor,
                nivel: nivel || null,
                cargo,
                supervisor_id: supervisor_id || null
            })
            .select()
            .single()

        if (profileError) {
            console.error('Erro Supabase ao criar perfil:', profileError.code, profileError.message, profileError.details)
            if (profileError.code === '23505') {
                return res.status(409).json({ error: 'Já existe um usuário com esse email' })
            }
            return res.status(500).json({ error: 'Erro ao criar perfil', detail: profileError.message })
        }

        return res.status(201).json({ user: { id: profile.id, email: profile.email }, profile: buildFullProfile(profile) })
    } catch (error: any) {
        console.error('Erro inesperado no register:', error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// POST /auth/team/draft — Criar rascunho de colaborador (sem supervisor ainda)
// ============================================
router.post('/team/draft', async (req: Request, res: Response) => {
    try {
        const adminProfile = await getUserByToken(req)

        if (!adminProfile || adminProfile.role !== 'super_admin') {
            return res.status(403).json({ error: 'Apenas Super Admin pode registrar colaboradores' })
        }

        const { name, email, password, role, nivel, is_supervisor, cpf, telefone, horario_trabalho } = req.body

        const validation = validateInput(registerSchema, { name, email, password, role })
        if (!validation.success) {
            return res.status(400).json({ message: 'Validação falhou', errors: validation.errors })
        }

        const { name: validName, email: validEmail, password: validPassword, role: validRole } = validation.data as { name: string; email: string; password: string; role: string }

        const isSupervisor = validRole === 'tradutor' ? false : (is_supervisor || false)
        const cargo = determineCargo(validRole, nivel || null, isSupervisor)

        const salt = await bcrypt.genSalt(10)
        const password_hash = await bcrypt.hash(validPassword, salt)
        const newId = crypto.randomUUID()

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: newId,
                full_name: validName,
                email: validEmail,
                role: validRole,
                cpf: cpf || null,
                telefone: telefone || null,
                horario_trabalho: horario_trabalho || null,
                password_hash,
                is_supervisor: isSupervisor,
                nivel: nivel || null,
                cargo,
                supervisor_id: null,
                registration_complete: false
            })
            .select()
            .single()

        if (profileError) {
            console.error('Erro ao criar rascunho:', profileError.code, profileError.message)
            if (profileError.code === '23505') {
                return res.status(409).json({ error: 'Já existe um usuário com esse email' })
            }
            return res.status(500).json({ error: 'Erro ao criar rascunho', detail: profileError.message })
        }

        return res.status(201).json({ user: { id: profile.id, email: profile.email }, profile: buildFullProfile(profile) })
    } catch (error: any) {
        console.error('Erro inesperado ao criar rascunho:', error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// GET /auth/team — Listar todos os colaboradores (exceto rascunhos)
// ============================================
router.get('/team', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, cargo, nivel, is_supervisor, supervisor_id, horario_trabalho, cpf, telefone, created_at')
            .or('registration_complete.is.null,registration_complete.eq.true')
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
// GET /auth/team/delegados/:supervisorId — Listar delegados de um supervisor
// ============================================
router.get('/team/delegados/:supervisorId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { supervisorId } = req.params

        const { data: delegados, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, nivel, cargo, is_supervisor, telefone, horario_trabalho, created_at')
            .eq('supervisor_id', supervisorId)
            .or('registration_complete.is.null,registration_complete.eq.true')
            .order('full_name', { ascending: true })

        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar delegados' })
        }

        return res.json(delegados || [])
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// GET /auth/team/draft — Retornar rascunho de colaborador pendente
// ============================================
router.get('/team/draft', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { data: drafts, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, cargo, nivel, is_supervisor, supervisor_id, horario_trabalho, cpf, telefone, created_at')
            .eq('registration_complete', false)
            .order('created_at', { ascending: false })
            .limit(1)

        if (error) {
            return res.status(500).json({ error: 'Erro ao buscar rascunho' })
        }

        return res.json(drafts && drafts.length > 0 ? drafts[0] : null)
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// GET /auth/team/:role — Listar colaboradores por setor
// ============================================
router.get('/team/:role', authMiddleware, async (req: Request, res: Response) => {
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
            .or('registration_complete.is.null,registration_complete.eq.true')
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
// PATCH /auth/team/:id/supervisor — Atribuir supervisor a um colaborador
// ============================================
router.patch('/team/:id/supervisor', async (req: Request, res: Response) => {
    try {
        const adminProfile = await getUserByToken(req)

        if (!adminProfile || adminProfile.role !== 'super_admin') {
            return res.status(403).json({ error: 'Apenas Super Admin pode alterar colaboradores' })
        }

        const { id } = req.params
        const { supervisor_id } = req.body

        const { error } = await supabase
            .from('profiles')
            .update({ supervisor_id: supervisor_id || null })
            .eq('id', id)

        if (error) {
            return res.status(500).json({ error: 'Erro ao atualizar supervisor' })
        }

        return res.json({ message: 'Supervisor atualizado com sucesso' })
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// PUT /auth/team/:id/delegados — Atribuir delegados a um supervisor
// ============================================
router.put('/team/:id/delegados', async (req: Request, res: Response) => {
    try {
        const adminProfile = await getUserByToken(req)

        if (!adminProfile || adminProfile.role !== 'super_admin') {
            return res.status(403).json({ error: 'Apenas Super Admin pode gerenciar delegados' })
        }

        const { id } = req.params
        const { delegateIds } = req.body

        if (!Array.isArray(delegateIds)) {
            return res.status(400).json({ error: 'delegateIds deve ser um array' })
        }

        // Limpar delegados existentes deste supervisor
        const { error: clearError } = await supabase
            .from('profiles')
            .update({ supervisor_id: null })
            .eq('supervisor_id', id)

        if (clearError) {
            return res.status(500).json({ error: 'Erro ao limpar delegados anteriores' })
        }

        // Atribuir novos delegados
        if (delegateIds.length > 0) {
            const { error: setError } = await supabase
                .from('profiles')
                .update({ supervisor_id: id })
                .in('id', delegateIds)

            if (setError) {
                return res.status(500).json({ error: 'Erro ao atribuir delegados' })
            }
        }

        return res.json({ message: 'Delegados atualizados com sucesso' })
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// ============================================
// PATCH /auth/team/:id/complete — Concluir registro de rascunho
// ============================================
router.patch('/team/:id/complete', async (req: Request, res: Response) => {
    try {
        const adminProfile = await getUserByToken(req)

        if (!adminProfile || adminProfile.role !== 'super_admin') {
            return res.status(403).json({ error: 'Apenas Super Admin pode completar registros' })
        }

        const { id } = req.params

        const { error } = await supabase
            .from('profiles')
            .update({ registration_complete: true })
            .eq('id', id)

        if (error) {
            return res.status(500).json({ error: 'Erro ao completar registro' })
        }

        return res.json({ message: 'Registro completado com sucesso' })
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
        const { name, email, role, nivel, is_supervisor, supervisor_id, cpf, telefone, horario_trabalho } = req.body

        const isSupervisor = role === 'tradutor' ? false : (is_supervisor || false)
        const cargo = determineCargo(role, nivel || null, isSupervisor)

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: name,
                role,
                cpf: cpf || null,
                telefone: telefone || null,
                horario_trabalho: horario_trabalho || null,
                is_supervisor: isSupervisor,
                nivel: nivel || null,
                cargo,
                supervisor_id: supervisor_id || null,
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
