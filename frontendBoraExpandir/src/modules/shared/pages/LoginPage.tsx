import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { roleRouteMap } from '../../../components/ProtectedRoute'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const result = await login(email, password)

        if (result.success) {
            // Buscar o profile e redirecionar conforme role
            const token = localStorage.getItem('auth_token')
            if (token) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    const data = await res.json()
                    const destination = roleRouteMap[data.profile?.role] || '/adm'
                    navigate(destination, { replace: true })
                } catch {
                    navigate('/adm', { replace: true })
                }
            }
        } else {
            setError(result.error || 'Email ou senha inválidos')
        }

        setIsLoading(false)
    }

    return (
        <div style={styles.page}>
            {/* Background decorativo */}
            <div style={styles.bgCircle1} />
            <div style={styles.bgCircle2} />
            <div style={styles.bgCircle3} />

            <div style={styles.card}>
                {/* Logo */}
                <div style={styles.logoContainer}>
                    <img
                        src="/assets/bora-logo.png"
                        alt="BoraExpandir"
                        style={styles.logo}
                    />
                </div>

                <h1 style={styles.title}>Bem-vindo de volta</h1>
                <p style={styles.subtitle}>Acesse sua conta para continuar</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && (
                        <div style={styles.errorBox}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                                <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm.5 10.5h-1v-1h1v1zm0-2h-1V5h1v4.5z" fill="#DC2626" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div style={styles.fieldGroup}>
                        <label style={styles.label} htmlFor="login-email">Email</label>
                        <div style={styles.inputWrapper}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.inputIcon}>
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="M22 7l-10 7L2 7" />
                            </svg>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                                style={styles.input}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label} htmlFor="login-password">Senha</label>
                        <div style={styles.inputWrapper}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.inputIcon}>
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={styles.input}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !email || !password}
                        style={{
                            ...styles.submitButton,
                            opacity: (isLoading || !email || !password) ? 0.6 : 1,
                            cursor: (isLoading || !email || !password) ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isLoading ? (
                            <div style={styles.spinnerWrapper}>
                                <div style={styles.spinner} />
                                <span>Entrando...</span>
                            </div>
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>

                <p style={styles.footer}>
                    © 2026 BoraExpandir — Plataforma Interna
                </p>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 30px) scale(1.1); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, 15px) scale(0.95); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder {
          color: #9CA3AF;
        }
        input:focus {
          outline: none;
          border-color: #3B52E5 !important;
          box-shadow: 0 0 0 3px rgba(59, 82, 229, 0.15) !important;
        }
      `}</style>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1f3a 0%, #0f1225 40%, #161b35 100%)',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    bgCircle1: {
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 82, 229, 0.15) 0%, transparent 70%)',
        top: '-150px',
        right: '-100px',
        animation: 'float1 8s ease-in-out infinite',
    },
    bgCircle2: {
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        bottom: '-100px',
        left: '-80px',
        animation: 'float2 10s ease-in-out infinite',
    },
    bgCircle3: {
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 70%)',
        top: '40%',
        left: '60%',
        animation: 'float3 12s ease-in-out infinite',
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '2.5rem',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeIn 0.6s ease-out',
    },
    logoContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '1.5rem',
    },
    logo: {
        height: '60px',
        objectFit: 'contain',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#FFFFFF',
        textAlign: 'center' as const,
        marginBottom: '0.25rem',
    },
    subtitle: {
        fontSize: '0.875rem',
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center' as const,
        marginBottom: '2rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '1.25rem',
    },
    errorBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        background: 'rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.2)',
        borderRadius: '10px',
        color: '#FCA5A5',
        fontSize: '0.85rem',
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.4rem',
    },
    label: {
        fontSize: '0.8rem',
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.7)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    inputWrapper: {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
    },
    inputIcon: {
        position: 'absolute' as const,
        left: '14px',
        color: 'rgba(255, 255, 255, 0.35)',
        pointerEvents: 'none' as const,
    },
    input: {
        width: '100%',
        padding: '0.8rem 2.8rem 0.8rem 2.8rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        color: '#FFFFFF',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
    },
    eyeButton: {
        position: 'absolute' as const,
        right: '10px',
        background: 'none',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.35)',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
    },
    submitButton: {
        width: '100%',
        padding: '0.85rem',
        background: 'linear-gradient(135deg, #3B52E5 0%, #5B6BF5 100%)',
        border: 'none',
        borderRadius: '10px',
        color: '#FFFFFF',
        fontSize: '0.95rem',
        fontWeight: 600,
        transition: 'all 0.2s ease',
        marginTop: '0.5rem',
    },
    spinnerWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    spinner: {
        width: '18px',
        height: '18px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: '#FFFFFF',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
    },
    footer: {
        textAlign: 'center' as const,
        fontSize: '0.7rem',
        color: 'rgba(255, 255, 255, 0.25)',
        marginTop: '2rem',
    },
}
