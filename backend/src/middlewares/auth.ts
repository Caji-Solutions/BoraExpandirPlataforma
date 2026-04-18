import { Response, NextFunction } from 'express'
import { supabase } from '../config/SupabaseClient'

export const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization
        const authHeaderValue = authHeader ? (authHeader.substring(0, 30) + '...') : 'null'
        console.log('[authMiddleware] =====================================================')
        console.log(`[authMiddleware] 🟦 Request: ${req.method} ${req.originalUrl || req.url}`)
        console.log(`[authMiddleware] 🔑 Header: ${authHeaderValue}`)

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[authMiddleware] ❌ Token não fornecido ou formato inválido')
            return res.status(401).json({ 
                error: 'Token não fornecido',
                receivedHeader: authHeaderValue 
            })
        }

        const token = authHeader.split(' ')[1]
        console.log('[authMiddleware] Token extraído (primeiros 20 chars):', token.substring(0, 20) + '...')

        // Buscar o profile vinculado a esse token no banco
        console.log('[authMiddleware] Buscando profile no banco com o token...')
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, cargo, nivel, supervisor_id, is_supervisor')
            .eq('auth_token', token)

        console.log('[authMiddleware] Resposta do Supabase:')
        console.log('  - profiles encontrados:', profiles ? profiles.length : 0)
        console.log('  - error:', error ? `${error.code}: ${error.message}` : 'null')

        if (error || !profiles || profiles.length === 0) {
            console.error('[authMiddleware] ❌ Token inválido ou expirado')
            console.log('[authMiddleware] Debug info:')
            console.log('  - token length:', token.length)
            console.log('  - token type:', typeof token)
            console.log('  - token sample:', token.substring(0, 50) + '...')
            console.log('  - error code:', error?.code)
            console.log('  - error message:', error?.message)

            // Tentar buscar TODOS os profiles com token para debug
            console.log('[authMiddleware] Buscando todos os profiles para debug...')
            const { data: allProfiles } = await supabase
                .from('profiles')
                .select('id, email, auth_token')
                .limit(5)
            console.log('[authMiddleware] Profiles encontrados (primeiros 5):')
            allProfiles?.forEach((p: any) => {
                console.log(`  - ${p.email}: auth_token=${p.auth_token ? p.auth_token.substring(0, 20) + '...' : 'NULL'}`)
            })

            return res.status(401).json({ error: 'Token inválido ou expirado' })
        }

        // Se encontrou múltiplos, pega o primeiro (não deveria acontecer)
        if (profiles.length > 1) {
            console.warn('[authMiddleware] ⚠️ Múltiplos profiles com mesmo token, usando o primeiro')
        }
        const profile = profiles[0]

        // Injetar os dados do usuário na requisição
        console.log('[authMiddleware] ✅ Profile encontrado:', {
            id: profile.id,
            email: profile.email,
            role: profile.role
        })

        // Check if superadmin is impersonating another user
        const impersonateUserId = req.headers['x-impersonate-user']
        if (impersonateUserId && profile.role === 'super_admin') {
            console.log(`[authMiddleware] 🔄 Super Admin impersonating user: ${impersonateUserId}`)
            try {
                const { data: targetProfile, error: _targetError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', impersonateUserId as string)
                    .single()

                if (targetProfile) {
                    req.user = targetProfile
                    req.userId = targetProfile.id
                    console.log(`[authMiddleware] ✅ Profile impersonated successfully:`, targetProfile.email)
                    return next()
                }
            } catch (err) {
                console.warn('[authMiddleware] ❌ Falha ao buscar perfil de impersonation:', err)
            }
        }

        req.user = profile
        req.userId = profile.id

        next()
    } catch (error) {
        console.error('[authMiddleware] ❌ Erro interno:', error)
        return res.status(500).json({ error: 'Erro interno na autenticação' })
    }
}
