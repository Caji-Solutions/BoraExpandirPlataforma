import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

export interface UserProfile {
    id: string
    full_name: string
    email: string
    telefone?: string
    role: 'comercial' | 'juridico' | 'administrativo' | 'tradutor' | 'super_admin'
    nivel?: 'C1' | 'C2' | null
    is_supervisor?: boolean
    avatar_url?: string
    created_at?: string
    updated_at?: string
}

interface AuthState {
    user: any | null
    profile: UserProfile | null
    token: string | null
    loading: boolean
    error: string | null
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    isAuthenticated: boolean
    impersonatedProfile: UserProfile | null
    setImpersonatedProfile: (profile: UserProfile | null) => void
    activeProfile: UserProfile | null // either impersonated or real
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
    return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        token: null,
        loading: true,
        error: null,
    })
    const [impersonatedProfile, setImpersonatedProfile] = useState<UserProfile | null>(null)

    // Verificar token salvo ao carregar
    const checkAuth = useCallback(async () => {
        const savedToken = localStorage.getItem('auth_token')
        if (!savedToken) {
            setState(prev => ({ ...prev, loading: false }))
            return
        }

        try {
            const res = await fetch(`${BACKEND_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${savedToken}` }
            })

            if (res.ok) {
                const data = await res.json()
                setState({
                    user: data.user,
                    profile: data.profile,
                    token: savedToken,
                    loading: false,
                    error: null,
                })
            } else {
                // Token inválido
                localStorage.removeItem('auth_token')
                setState({ user: null, profile: null, token: null, loading: false, error: null })
            }
        } catch {
            localStorage.removeItem('auth_token')
            setState({ user: null, profile: null, token: null, loading: false, error: null })
        }
    }, [])

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    const login = async (email: string, password: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }))

        try {
            const res = await fetch(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setState(prev => ({ ...prev, loading: false, error: data.error || 'Erro ao fazer login' }))
                return { success: false, error: data.error }
            }

            localStorage.setItem('auth_token', data.session.access_token)

            setState({
                user: data.user,
                profile: data.profile,
                token: data.session.access_token,
                loading: false,
                error: null,
            })

            return { success: true }
        } catch (err: any) {
            const errorMsg = 'Erro de conexão com o servidor'
            setState(prev => ({ ...prev, loading: false, error: errorMsg }))
            return { success: false, error: errorMsg }
        }
    }

    const logout = () => {
        localStorage.removeItem('auth_token')
        setImpersonatedProfile(null)
        setState({ user: null, profile: null, token: null, loading: false, error: null })
        window.location.href = '/login'
    }

    const activeProfile = impersonatedProfile || state.profile

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                logout,
                isAuthenticated: !!state.token && !!state.profile,
                impersonatedProfile,
                setImpersonatedProfile,
                activeProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
