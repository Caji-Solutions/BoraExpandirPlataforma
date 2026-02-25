import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Mapeia role -> rota de destino
export const roleRouteMap: Record<string, string> = {
    comercial: '/comercial',
    juridico: '/juridico',
    administrativo: '/financeiro',
    tradutor: '/tradutor',
    super_admin: '/adm',
    cliente: '/cliente',
}

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, activeProfile, profile, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground text-sm">Verificando autenticação...</p>
                </div>
            </div>
        )
    }

    // Se não estiver autenticado ou não tiver perfil, manda pro login
    if (!isAuthenticated || !activeProfile) {
        return <Navigate to="/login" replace />
    }

    // Se for Super Admin REAL (não impersonado), ele tem acesso total
    // Se estiver impersonando, ele deve seguir as regras do perfil impersonado
    if (profile?.role === 'super_admin' && activeProfile.role === 'super_admin') {
        return <>{children}</>
    }

    // Verifica se o role do perfil ativo (pode ser o impersonado) está na lista de permitidos
    if (!allowedRoles.includes(activeProfile.role)) {
        // Redireciona para a home do próprio usuário se ele tentar entrar onde não deve
        const destination = roleRouteMap[activeProfile.role] || '/login'
        return <Navigate to={destination} replace />
    }

    return <>{children}</>
}
