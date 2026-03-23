import { Response, NextFunction } from 'express'
import { supabase } from '../config/SupabaseClient'

export const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token não fornecido' })
        }

        const token = authHeader.split(' ')[1]
        
        // Buscar o profile vinculado a esse token no banco
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_token', token)
            .single()

        if (error || !profile) {
            console.error('[authMiddleware] Token invalido ou expirado:', token)
            return res.status(401).json({ error: 'Token inválido ou expirado' })
        }

        // Injetar os dados do usuário na requisição
        req.user = profile
        req.userId = profile.id
        
        next()
    } catch (error) {
        console.error('[authMiddleware] Erro interno:', error)
        return res.status(500).json({ error: 'Erro interno na autenticação' })
    }
}
