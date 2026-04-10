import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
            const res = await fetch(`${backendUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Erro ao processar solicitação')
            } else {
                setSuccess(true)
            }
        } catch (err) {
            setError('Erro de conexão com o servidor')
        } finally {
            setIsLoading(false)
        }
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

                <h1 style={styles.title}>Recuperar Senha</h1>
                <p style={styles.subtitle}>
                    {success 
                        ? 'Enviamos as instruções para o seu e-mail.' 
                        : 'Informe seu e-mail para receber o link de redefinição.'}
                </p>

                {success ? (
                    <div style={styles.successBox}>
                        <p>Se o email informado estiver em nossa base, você receberá um link em instantes.</p>
                        <button 
                            onClick={() => navigate('/login')}
                            style={styles.backButton}
                        >
                            Voltar para o Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        {error && (
                            <div style={styles.errorBox}>
                                <span>{error}</span>
                            </div>
                        )}

                        <div style={styles.fieldGroup}>
                            <label style={styles.label} htmlFor="forgot-email">Email</label>
                            <div style={styles.inputWrapper}>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email}
                            style={{
                                ...styles.submitButton,
                                opacity: (isLoading || !email) ? 0.6 : 1,
                                cursor: (isLoading || !email) ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {isLoading ? 'Enviando...' : 'Enviar Link'}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => navigate('/login')}
                            style={styles.textButton}
                        >
                            Voltar para o Login
                        </button>
                    </form>
                )}

                <p style={styles.footer}>
                    © 2026 BoraExpandir — Plataforma Interna
                </p>
            </div>

            <style>{`
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
        padding: '0.75rem 1rem',
        background: 'rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.2)',
        borderRadius: '10px',
        color: '#FCA5A5',
        fontSize: '0.85rem',
        textAlign: 'center',
    },
    successBox: {
        padding: '1.5rem',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '12px',
        color: '#A7F3D0',
        fontSize: '0.9rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
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
    input: {
        width: '100%',
        padding: '0.8rem 1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        color: '#FFFFFF',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
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
    },
    backButton: {
        padding: '0.6rem 1rem',
        background: 'rgba(255, 255, 255, 0.1)',
        border: 'none',
        borderRadius: '8px',
        color: '#FFFFFF',
        fontSize: '0.85rem',
        fontWeight: 500,
        cursor: 'pointer',
    },
    textButton: {
        background: 'none',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.85rem',
        cursor: 'pointer',
        marginTop: '0.5rem',
    },
    footer: {
        textAlign: 'center' as const,
        fontSize: '0.7rem',
        color: 'rgba(255, 255, 255, 0.25)',
        marginTop: '2rem',
    },
}
