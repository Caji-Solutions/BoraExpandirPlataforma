import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Mapeia role -> rota de destino
export const roleRouteMap: Record<string, string> = {
    comercial: '/comercial',
    juridico: '/juridico',
    administrativo: '/financeiro',
    tradutor: '/tradutor',
    super_admin: '/adm',
}

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, profile, loading } = useAuth()

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

    if (!isAuthenticated || !profile) {
        return <Navigate to="/login" replace />
    }

    // Super admin acessa tudo
    if (profile.role === 'super_admin') {
        return <>{children}</>
    }

    // Verifica se o role do usuário está na lista de permitidos
    if (!allowedRoles.includes(profile.role)) {
        const destination = roleRouteMap[profile.role] || '/login'
        return <Navigate to={destination} replace />
    }

    return <>{children}</>
}
