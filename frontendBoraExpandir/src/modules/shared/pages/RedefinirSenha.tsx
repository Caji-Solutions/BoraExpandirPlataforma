import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle2, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react'

export default function RedefinirSenha() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [verifying, setVerifying] = useState(true)
    const [accessToken, setAccessToken] = useState<string | null>(null)

    const navigate = useNavigate()

    useEffect(() => {
        // Obter o token da hash da URL retornada pelo Supabase
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const token = hashParams.get('access_token')
        const type = hashParams.get('type')

        if (token && type === 'recovery') {
            setAccessToken(token)
            setVerifying(false)
        } else {
            setError('Link de recuperação inválido ou não encontrado.')
            setVerifying(false)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.')
            return
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.')
            return
        }

        if (!accessToken) {
            setError('Nenhum token de acesso válido encontrado.')
            return
        }

        setLoading(true)

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
            const res = await fetch(`${backendUrl}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    access_token: accessToken,
                    new_password: password
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao redefinir a senha.')
            }

            setSuccess(true)
            
            // Redirecionar para o login após 3 segundos
            setTimeout(() => {
                navigate('/login', { replace: true })
            }, 3000)

        } catch (err: any) {
            console.error('Erro ao redefinir senha:', err)
            setError(err.message || 'Ocorreu um erro ao redefinir a senha.')
        } finally {
            setLoading(false)
        }
    }

    if (verifying) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg font-semibold">Verificando link seguro...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6 font-['Inter']">
            
            {/* Elementos decorativos de fundo */}
            <div className="absolute top-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(59,82,229,0.15)_0%,transparent_70%)] animate-[float1_8s_ease-in-out_infinite]" />
            <div className="absolute bottom-[-100px] left-[-80px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.1)_0%,transparent_70%)] animate-[float2_10s_ease-in-out_infinite]" />
            
            <div className="w-full max-w-[420px] bg-white/[0.03] backdrop-blur-[20px] border border-white/[0.08] rounded-[20px] p-10 relative z-10 shadow-2xl animate-[fadeIn_0.6s_ease-out]">
                
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <KeyRound className="h-8 w-8 text-white" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white text-center mb-2">Definir Nova Senha</h1>
                
                {success ? (
                    <div className="text-center mt-6">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 mb-6">
                            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                            <p className="text-emerald-400 font-bold text-lg mb-1">Senha atualizada!</p>
                            <p className="text-emerald-400/80 text-sm">Sua senha foi redefinida com sucesso.</p>
                        </div>
                        <p className="text-gray-400 text-sm animate-pulse">
                            Redirecionando para o login em instantes...
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-400 text-sm text-center mb-8">
                            Digite sua nova senha de acesso à plataforma.
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.8rem] font-medium text-white/70 uppercase tracking-wide">
                                    Nova Senha
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 p-1 text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.8rem] font-medium text-white/70 uppercase tracking-wide">
                                    Confirmar Nova Senha
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword || !accessToken}
                                className={`w-full py-3.5 mt-2 bg-gradient-to-r from-[#3B52E5] to-[#5B6BF5] border-none rounded-xl text-white text-[0.95rem] font-semibold transition-all flex items-center justify-center gap-2 ${
                                    (loading || !password || !confirmPassword || !accessToken) ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    'Atualizar Senha'
                                )}
                            </button>
                        </form>
                    </>
                )}
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
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
