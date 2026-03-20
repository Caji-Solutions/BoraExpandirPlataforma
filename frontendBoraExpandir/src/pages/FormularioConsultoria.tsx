import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, AlertCircle, Clock, XCircle, Phone, Copy, Check } from 'lucide-react'

type FormStep = 'loading' | 'form' | 'submitting' | 'success' | 'status_aprovado' | 'status_em_analise' | 'status_pendente' | 'status_recusado' | 'status_ja_preenchido' | 'expirado' | 'cancelado' | 'bloqueado' | 'nao_encontrado'
type PagamentoStatus = 'pendente' | 'aprovado' | 'em_analise' | 'recusado' | null

const PIX_CNPJ = '55.218.947/0001-65'

export default function FormularioConsultoria() {
    const { agendamentoId } = useParams<{ agendamentoId: string }>()
    const [step, setStep] = useState<FormStep>(agendamentoId ? 'loading' : 'form')
    const [error, setError] = useState<string | null>(null)
    const [emailEnviado, setEmailEnviado] = useState('')
    const [copiedPix, setCopiedPix] = useState(false)

    // Dados de resposta do backend
    const [pagamentoStatus, setPagamentoStatus] = useState<PagamentoStatus>(null)
    const [comprovanteUrl, setComprovanteUrl] = useState<string | null>(null)

    // Stepper de 3 etapas
    const [currentStep, setCurrentStep] = useState(1)

    const [searchParams] = useSearchParams()
    const preNome = searchParams.get('nome') || ''
    const preEmail = searchParams.get('email') || ''
    const preTelefone = searchParams.get('telefone') || ''

    // Dados do formulário — pré-preenchidos via query params quando disponíveis
    const [formData, setFormData] = useState({
        nome_completo: preNome,
        email: preEmail,
        whatsapp: preTelefone,
        data_nascimento: '',
        nacionalidade: '',
        estado_civil: '',
        cpf: '',
        passaporte: '',
        pais_residencia: '',
        tem_filhos: false,
        quantidade_filhos: 0,
        idades_filhos: '',
        profissao: '',
        escolaridade: '',
        experiencia_exterior: '',
        empresa_exterior: '',
        objetivo_imigracao: '',
        pais_destino: '',
        prazo_mudanca: '',
        ja_tem_visto: false,
        tipo_visto: '',
        pretende_trabalhar: '',
        area_trabalho: '',
        renda_mensal: '',
        possui_reserva: '',
        observacoes: '',
        como_conheceu: ''
    })

    // ========== Verificação de seções completas ==========
    const isPessoalComplete = useCallback(() => {
        return !!(
            formData.nome_completo.trim() &&
            formData.email.trim() &&
            formData.whatsapp.trim() &&
            formData.data_nascimento &&
            formData.nacionalidade.trim() &&
            formData.estado_civil
        )
    }, [formData.nome_completo, formData.email, formData.whatsapp, formData.data_nascimento, formData.nacionalidade, formData.estado_civil])

    const isDocumentosComplete = useCallback(() => {
        return !!(formData.cpf.trim() || formData.passaporte.trim())
    }, [formData.cpf, formData.passaporte])

    const isProfissionalComplete = useCallback(() => {
        return !!(formData.profissao.trim() && formData.escolaridade)
    }, [formData.profissao, formData.escolaridade])

    const isImigracaoComplete = useCallback(() => {
        return !!(
            formData.objetivo_imigracao.trim() &&
            formData.pais_destino &&
            formData.prazo_mudanca
        )
    }, [formData.objetivo_imigracao, formData.pais_destino, formData.prazo_mudanca])

    // ========== Verificação de status ao carregar ==========
    useEffect(() => {
        if (!agendamentoId) return

        const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''
        if (!backendUrl) {
            setStep('form')
            return
        }

        async function checkStatus() {
            try {
                const response = await fetch(`${backendUrl}/formulario/consultoria/${agendamentoId}/status`)
                if (!response.ok) {
                    // Se não encontrou, bloqueia o preenchimento para não dar erro depois
                    setStep('nao_encontrado')
                    return
                }

                const data = await response.json()

                if (!data.found) {
                    setStep('nao_encontrado')
                    return
                }

                // Se bloqueado pelo CRON (cancelado automaticamente por falta de formulário)
                if (data.bloqueado_cron) {
                    setStep('bloqueado')
                    return
                }

                // Se cancelado por outro motivo
                if (data.cancelado) {
                    setStep('cancelado')
                    return
                }

                // Se expirado (menos de 1h para a reunião)
                if (data.expirado) {
                    setStep('expirado')
                    return
                }

                // Se o formulário já foi preenchido, mostrar tela de status apropriada
                if (data.formulario_preenchido) {
                    const pgStatus = data.pagamento_status
                    if (pgStatus === 'aprovado') {
                        setStep('status_aprovado')
                    } else if (pgStatus === 'em_analise') {
                        setStep('status_em_analise')
                    } else if (pgStatus === 'recusado') {
                        setStep('status_recusado')
                    } else if (pgStatus === 'pendente') {
                        setStep('status_pendente')
                    } else {
                        // Fallback genérico para formulário já preenchido se não tiver status financeiro
                        setStep('status_ja_preenchido')
                    }
                    return
                }

                // Formulário não preenchido e dentro do prazo — exibir normalmente
                if (data.dna) {
                    setFormData(prev => ({ ...prev, ...data.dna }))
                }
                setStep('form')
            } catch (err) {
                console.error('Erro ao verificar status do agendamento:', err)
                setStep('form')
            }
        }

        checkStatus()
    }, [agendamentoId])

    // Navegacao do stepper
    const nextStep = () => {
        if (currentStep === 1) {
            if (!isPessoalComplete()) {
                setError('Preencha todos os campos obrigatorios de Dados Pessoais antes de continuar.')
                return
            }
            if (!isDocumentosComplete()) {
                setError('Preencha pelo menos CPF ou Passaporte antes de continuar.')
                return
            }
            setError(null)
        }
        if (currentStep === 2) {
            if (!isProfissionalComplete()) {
                setError('Preencha profissao e escolaridade antes de continuar.')
                return
            }
            if (!isImigracaoComplete()) {
                setError('Preencha objetivo, pais de destino e prazo antes de continuar.')
                return
            }
            setError(null)
        }
        setCurrentStep(prev => Math.min(prev + 1, 3))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const prevStep = () => {
        setError(null)
        setCurrentStep(prev => Math.max(prev - 1, 1))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validação das seções obrigatórias
        const erros: string[] = []

        if (!isPessoalComplete()) {
            erros.push('Dados Pessoais (nome, email, whatsapp, data de nascimento, nacionalidade e estado civil)')
        }
        if (!isDocumentosComplete()) {
            erros.push('Documentos (CPF ou passaporte)')
        }
        if (!isProfissionalComplete()) {
            erros.push('Informações Profissionais (profissão e escolaridade)')
        }
        if (!isImigracaoComplete()) {
            erros.push('Plano de Imigração (objetivo, país de destino e prazo)')
        }

        if (erros.length > 0) {
            setError(`Preencha as seções obrigatórias:\n• ${erros.join('\n• ')}`)
            // Abrir a etapa que contem o erro
            if (!isPessoalComplete() || !isDocumentosComplete()) setCurrentStep(1)
            else if (!isProfissionalComplete() || !isImigracaoComplete()) setCurrentStep(2)
            return
        }

        setStep('submitting')

        const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''
        if (!backendUrl) {
            setError('Erro de configuração. URL do backend não encontrada.')
            setStep('form')
            return
        }

        try {
            const response = await fetch(`${backendUrl}/formulario/consultoria`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    agendamento_id: agendamentoId || null
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao enviar formulário')
            }

            setEmailEnviado(formData.email)
            setPagamentoStatus(data.pagamento_status || null)
            setComprovanteUrl(data.comprovante_url || null)
            setStep('success')
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar formulário. Tente novamente.')
            setStep('form')
        }
    }

    // ========== Função para copiar chave PIX ==========
    const handleCopyPix = async () => {
        try {
            await navigator.clipboard.writeText(PIX_CNPJ)
            setCopiedPix(true)
            setTimeout(() => setCopiedPix(false), 3000)
        } catch {
            setCopiedPix(true)
            setTimeout(() => setCopiedPix(false), 3000)
        }
    }

    // ========== Telas de status (pré-formulário) ==========

    // Loading
    if (step === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg font-semibold">Verificando seu agendamento...</p>
                    <p className="text-gray-400 mt-2">Aguarde um momento</p>
                </div>
            </div>
        )
    }

    // Status: APROVADO — Parabéns, conta criada
    if (step === 'status_aprovado') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Parabéns! 🎉</h1>
                    <p className="text-gray-300 text-lg mb-2">
                        Sua nova conta na <span className="text-blue-400 font-bold">Bora Expandir</span> foi criada com sucesso!
                    </p>
                    <p className="text-gray-400 text-sm mb-8">
                        O pagamento foi confirmado e suas credenciais de acesso foram enviadas para o seu email.
                    </p>
                    <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            <p className="text-emerald-400 font-bold">Pagamento Aprovado</p>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Verifique sua caixa de entrada (e spam) para encontrar as credenciais de acesso à plataforma.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Status: EM ANÁLISE — Paciência
    if (step === 'status_em_analise') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Clock className="h-12 w-12 text-blue-400 animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Quase lá! ⏳</h1>
                    <p className="text-gray-300 text-lg mb-2">
                        Seu formulário já foi recebido e o pagamento está sendo verificado pela nossa equipe.
                    </p>
                    <p className="text-gray-400 text-sm mb-8">
                        Tenha um pouquinho de paciência — em breve tudo estará pronto!
                    </p>
                    <div className="bg-blue-500/10 rounded-2xl p-5 border border-blue-500/20">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-blue-400" />
                            <p className="text-blue-400 font-bold">Pagamento em Análise</p>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Assim que o comprovante for verificado, você receberá um email com os dados de acesso à plataforma Bora Expandir.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Status: PENDENTE — Chave PIX para pagamento
    if (step === 'status_pendente') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <AlertCircle className="h-12 w-12 text-amber-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Formulário Recebido! ✅</h1>
                    <p className="text-gray-300 text-lg mb-2">
                        Seus dados foram salvos com sucesso. Agora só falta o pagamento para liberar sua conta!
                    </p>
                    <p className="text-gray-400 text-sm mb-6">
                        Realize o pagamento via PIX usando a chave abaixo e envie o comprovante ao seu consultor.
                    </p>

                    <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/20 mb-6">
                        <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Chave PIX (CNPJ)</p>
                        <div className="flex items-center justify-center gap-3">
                            <code className="text-2xl font-bold text-white tracking-wider">{PIX_CNPJ}</code>
                            <button
                                onClick={handleCopyPix}
                                className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-bold hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                            >
                                {copiedPix ? <><Check className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar</>}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Phone className="h-4 w-4 text-blue-400" />
                            <p className="text-blue-400 font-semibold">Envie o comprovante ao seu consultor</p>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Após o pagamento, envie o comprovante via WhatsApp para o consultor que lhe atendeu. Sua conta será criada assim que o pagamento for confirmado.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Status: RECUSADO — Pagamento recusado
    if (step === 'status_recusado') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <XCircle className="h-12 w-12 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Pagamento Recusado 😔</h1>
                    <p className="text-gray-300 text-lg mb-2">
                        Infelizmente, o pagamento referente à sua consultoria foi recusado.
                    </p>
                    <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20 mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            <p className="text-emerald-400 font-bold">Seus dados foram salvos!</p>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Você <strong className="text-white">não precisa preencher o formulário novamente</strong>. Seus dados estão seguros em nosso sistema.
                        </p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Phone className="h-4 w-4 text-blue-400" />
                            <p className="text-blue-400 font-semibold">Entre em contato com seu consultor</p>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Para resolver essa questão, entre em contato com o consultor que lhe atendeu via WhatsApp ou email.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Status: EXPIRADO — Formulário expirado (menos de 1h para reunião)
    if (step === 'expirado') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Clock className="h-12 w-12 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Formulário Expirado ⏰</h1>
                    <p className="text-gray-300 text-lg mb-6">
                        O prazo para preenchimento deste formulário encerrou. O formulário deve ser enviado com pelo menos 1 hora de antecedência da reunião.
                    </p>
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Phone className="h-4 w-4 text-blue-400" />
                            <p className="text-blue-400 font-semibold">Entre em contato com seu consultor</p>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Fale com o consultor que lhe atendeu para remarcar ou obter um novo link.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Status: BLOQUEADO — Formulário bloqueado pelo CRON (cancelado automaticamente)
    if (step === 'bloqueado') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-red-500/30 p-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <XCircle className="h-12 w-12 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Formulário Indisponível 🚫</h1>
                    <p className="text-gray-300 text-lg mb-4">
                        Este formulário não está mais disponível para preenchimento.
                    </p>
                    <div className="bg-red-500/10 rounded-2xl p-5 border border-red-500/20 mb-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <p className="text-red-400 font-bold">Agendamento bloqueado</p>
                        </div>
                        <p className="text-gray-400 text-sm">
                            O formulário não foi preenchido dentro do prazo estipulado (até 1 hora antes da reunião) e o agendamento foi cancelado automaticamente pelo sistema.
                        </p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Phone className="h-4 w-4 text-blue-400" />
                            <p className="text-blue-400 font-semibold">Entre em contato com seu consultor</p>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Para remarcar sua consultoria, entre em contato com o consultor que lhe atendeu via WhatsApp ou email.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Status: NÃO ENCONTRADO — ID do agendamento inválido
    if (step === 'nao_encontrado') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-500/20 flex items-center justify-center">
                        <AlertCircle className="h-12 w-12 text-gray-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Agendamento não encontrado</h1>
                    <p className="text-gray-300 text-lg mb-6">
                        O link que você acessou parece estar inválido ou o agendamento não existe mais no sistema.
                    </p>
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Phone className="h-4 w-4 text-blue-400" />
                            <p className="text-blue-400 font-semibold">Precisa de ajuda?</p>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Entre em contato com a equipe comercial solicitando um novo link para o seu formulário.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Status: CANCELADO — Agendamento cancelado (por outro motivo)
    if (step === 'cancelado') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <XCircle className="h-12 w-12 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Agendamento Cancelado</h1>
                    <p className="text-gray-300 text-lg mb-6">
                        Este agendamento foi cancelado. Para agendar novamente, entre em contato com nosso time comercial.
                    </p>
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Phone className="h-4 w-4 text-blue-400" />
                            <p className="text-blue-400 font-semibold">Fale com nosso time</p>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Entre em contato pelo WhatsApp ou email para remarcar sua consultoria.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // ========== Tela de sucesso com status de pagamento ==========
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 text-center">
                    {/* Ícone do status */}
                    {pagamentoStatus === 'recusado' ? (
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-red-400" />
                        </div>
                    ) : pagamentoStatus === 'pendente' ? (
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <Clock className="h-10 w-10 text-amber-400" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                        </div>
                    )}

                    <h1 className="text-3xl font-bold text-white mb-4">Formulário Enviado! 🎉</h1>

                    {/* Mensagem de acordo com o status do comprovante */}
                    {comprovanteUrl && pagamentoStatus === 'pendente' ? (
                        <>
                            <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/20 mb-6">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <Clock className="h-5 w-5 text-amber-400" />
                                    <p className="text-amber-400 font-bold text-lg">Comprovante em Análise</p>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Seu comprovante de pagamento está sendo verificado pela nossa equipe.
                                    Quando a análise for concluída, uma mensagem será enviada para o seu email.
                                </p>
                            </div>
                            <p className="text-blue-400 font-semibold text-lg mb-4">
                                📧 {emailEnviado}
                            </p>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <p className="text-gray-400 text-sm">
                                    Aguarde a verificação do comprovante. Você receberá um email com as credenciais de acesso à plataforma assim que for aprovado.
                                </p>
                            </div>
                        </>
                    ) : comprovanteUrl && pagamentoStatus === 'aprovado' ? (
                        <>
                            <p className="text-gray-300 text-lg mb-2">
                                Pagamento confirmado! As informações da sua consultoria foram enviadas para o seu email.
                            </p>
                            <p className="text-blue-400 font-semibold text-lg mb-8">
                                📧 {emailEnviado}
                            </p>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <p className="text-gray-400 text-sm">
                                    Verifique sua caixa de entrada (e spam) para encontrar as credenciais de acesso à sua área do cliente na plataforma Bora Expandir.
                                </p>
                            </div>
                        </>
                    ) : comprovanteUrl && pagamentoStatus === 'recusado' ? (
                        <>
                            <div className="bg-red-500/10 rounded-2xl p-5 border border-red-500/20 mb-6">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    <p className="text-red-400 font-bold text-lg">Comprovante Recusado</p>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Infelizmente, seu comprovante de pagamento não foi aprovado.
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Phone className="h-4 w-4 text-blue-400" />
                                    <p className="text-blue-400 font-semibold">Entre em contato com um de nossos consultores</p>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Para resolver essa questão, entre em contato com nossa equipe pelo WhatsApp ou email.
                                </p>
                            </div>
                        </>
                    ) : (
                        /* Sem comprovante — mensagem padrão */
                        <>
                            <p className="text-gray-300 text-lg mb-2">
                                As informações da sua consultoria foram enviadas para o seu email.
                            </p>
                            <p className="text-blue-400 font-semibold text-lg mb-8">
                                📧 {emailEnviado}
                            </p>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                <p className="text-gray-400 text-sm">
                                    Verifique sua caixa de entrada (e spam) para encontrar as credenciais de acesso à sua área do cliente na plataforma Bora Expandir.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    // Status: JÁ PREENCHIDO genérico
    if (step === 'status_ja_preenchido') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
                <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Formulário já preenchido! ✅</h1>
                    <p className="text-gray-300 text-lg mb-2">
                        Seus dados já foram recebidos com sucesso pelo nosso sistema.
                    </p>
                    <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-500/20 mb-6">
                        <p className="text-gray-400 text-sm">
                            Você não precisa preencher este formulário novamente. Se tiver alguma dúvida, entre em contato com seu consultor.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Submitting
    if (step === 'submitting') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222] flex items-center justify-center p-6">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg font-semibold">Processando seu formulário...</p>
                    <p className="text-gray-400 mt-2">Criando sua conta e confirmando o agendamento</p>
                </div>
            </div>
        )
    }

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
    const labelClass = "block text-sm font-semibold text-gray-300 mb-1.5"

    const stepLabels = ['Sobre Você', 'Carreira e Planos', 'Finalizar']

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#071222]">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
                <div className="max-w-3xl mx-auto px-6 pt-12 pb-6 relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                            B
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Formulário Consultoria</h1>
                            <p className="text-gray-400 text-sm">Imigração 🇪🇸 🇵🇹</p>
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                        Preencha o formulário abaixo com suas informações. Ao finalizar, sua conta será criada automaticamente e as informações serão enviadas para seu email.
                    </p>
                </div>
            </div>

            {/* Stepper indicator */}
            <div className="max-w-3xl mx-auto px-6 pb-8">
                <div className="flex items-center justify-between">
                    {stepLabels.map((label, idx) => {
                        const stepNum = idx + 1
                        const isActive = currentStep === stepNum
                        const isCompleted = currentStep > stepNum
                        return (
                            <div key={stepNum} className="flex-1 flex items-center">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                                        isCompleted
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                            : isActive
                                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20'
                                                : 'bg-white/10 text-gray-500'
                                    }`}>
                                        {isCompleted ? '✓' : stepNum}
                                    </div>
                                    <span className={`mt-2 text-xs font-semibold transition-colors ${
                                        isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-gray-500'
                                    }`}>{label}</span>
                                </div>
                                {idx < stepLabels.length - 1 && (
                                    <div className={`h-0.5 flex-1 mx-2 mb-6 rounded transition-colors duration-300 ${
                                        isCompleted ? 'bg-emerald-500' : 'bg-white/10'
                                    }`} />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 pb-16 space-y-6">
                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm whitespace-pre-line">
                        {error}
                    </div>
                )}

                {/* ==================== ETAPA 1: Sobre Você ==================== */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Dados Pessoais */}
                        <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">📋 Dados Pessoais</h2>
                            <div>
                                <label className={labelClass}>Nome completo *</label>
                                <input name="nome_completo" value={formData.nome_completo} onChange={handleChange} className={inputClass + (preNome ? ' opacity-70' : '')} placeholder="Seu nome completo" required readOnly={!!preNome} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Email *</label>
                                    <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass + (preEmail ? ' opacity-70' : '')} placeholder="seuemail@exemplo.com" required readOnly={!!preEmail} />
                                </div>
                                <div>
                                    <label className={labelClass}>WhatsApp com DDD *</label>
                                    <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className={inputClass + (preTelefone ? ' opacity-70' : '')} placeholder="+55 11 99999-9999" required readOnly={!!preTelefone} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Data de Nascimento *</label>
                                    <input name="data_nascimento" type="date" value={formData.data_nascimento} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Nacionalidade *</label>
                                    <input name="nacionalidade" value={formData.nacionalidade} onChange={handleChange} className={inputClass} placeholder="Brasileira" />
                                </div>
                                <div>
                                    <label className={labelClass}>Estado Civil *</label>
                                    <select name="estado_civil" value={formData.estado_civil} onChange={handleChange} className={inputClass}>
                                        <option className="bg-[#0f172a] text-gray-200" value="">Selecione</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="solteiro">Solteiro(a)</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="casado">Casado(a)</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="divorciado">Divorciado(a)</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="viuvo">Viúvo(a)</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="uniao_estavel">União Estável</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Documentos */}
                        <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">🪪 Documentos</h2>
                            <p className="text-xs text-gray-400">Preencha pelo menos um: CPF ou Passaporte</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>CPF *</label>
                                    <input name="cpf" value={formData.cpf} onChange={handleChange} className={inputClass} placeholder="000.000.000-00" />
                                </div>
                                <div>
                                    <label className={labelClass}>Passaporte *</label>
                                    <input name="passaporte" value={formData.passaporte} onChange={handleChange} className={inputClass} placeholder="Nº do passaporte" />
                                </div>
                            </div>
                        </div>

                        {/* Situação Atual */}
                        <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">🌍 Situação Atual</h2>
                            <div>
                                <label className={labelClass}>Qual cidade e país você reside hoje?</label>
                                <input name="pais_residencia" value={formData.pais_residencia} onChange={handleChange} className={inputClass} placeholder="Ex: São Paulo, Brasil" />
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" name="tem_filhos" checked={formData.tem_filhos} onChange={handleChange} className="w-5 h-5 rounded bg-white/5 border-white/10 accent-blue-500" />
                                <label className="text-sm text-gray-300">Você têm filhos(as) que seguem para Europa com você?</label>
                            </div>
                            {formData.tem_filhos && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Quantos filhos?</label>
                                        <input name="quantidade_filhos" type="number" value={formData.quantidade_filhos} onChange={handleChange} className={inputClass} min="0" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Idades</label>
                                        <input name="idades_filhos" value={formData.idades_filhos} onChange={handleChange} className={inputClass} placeholder="Ex: 5, 8, 12" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navegação */}
                        <div className="flex justify-end pt-4">
                            <button type="button" onClick={nextStep} className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25">
                                Próximo →
                            </button>
                        </div>
                    </div>
                )}

                {/* ==================== ETAPA 2: Carreira e Planos ==================== */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Profissional */}
                        <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">💼 Informações Profissionais</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Profissão *</label>
                                    <input name="profissao" value={formData.profissao} onChange={handleChange} className={inputClass} placeholder="Sua profissão atual" />
                                </div>
                                <div>
                                    <label className={labelClass}>Escolaridade *</label>
                                    <select name="escolaridade" value={formData.escolaridade} onChange={handleChange} className={inputClass}>
                                        <option className="bg-[#0f172a] text-gray-200" value="">Selecione</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="fundamental">Ensino Fundamental</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="medio">Ensino Médio</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="tecnico">Técnico</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="superior_incompleto">Superior Incompleto</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="superior">Superior Completo</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="pos_graduacao">Pós-Graduação</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="mestrado">Mestrado</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="doutorado">Doutorado</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Você possui CNPJ? Se sim, informe qual a categoria.</label>
                                <input name="empresa_exterior" value={formData.empresa_exterior} onChange={handleChange} className={inputClass} placeholder="Ex: MEI, ME, etc." />
                            </div>
                            <div>
                                <label className={labelClass}>Experiência no exterior</label>
                                <textarea name="experiencia_exterior" value={formData.experiencia_exterior} onChange={handleChange} className={inputClass + ' min-h-[80px]'} placeholder="Já morou/trabalhou fora do Brasil? Descreva..." />
                            </div>
                        </div>

                        {/* Imigração */}
                        <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">✈️ Planos de Imigração</h2>
                            <div>
                                <label className={labelClass}>Qual seu objetivo com a imigração? *</label>
                                <textarea name="objetivo_imigracao" value={formData.objetivo_imigracao} onChange={handleChange} className={inputClass + ' min-h-[80px]'} placeholder="Descreva seus objetivos..." />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>País de destino *</label>
                                    <select name="pais_destino" value={formData.pais_destino} onChange={handleChange} className={inputClass}>
                                        <option className="bg-[#0f172a] text-gray-200" value="">Selecione</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="espanha">Espanha 🇪🇸</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="portugal">Portugal 🇵🇹</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="ambos">Ambos</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="indeciso">Ainda indeciso</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Prazo estimado para mudança *</label>
                                    <select name="prazo_mudanca" value={formData.prazo_mudanca} onChange={handleChange} className={inputClass}>
                                        <option className="bg-[#0f172a] text-gray-200" value="">Selecione</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="imediato">Imediato</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="3_meses">Até 3 meses</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="6_meses">Até 6 meses</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="1_ano">Até 1 ano</option>
                                        <option className="bg-[#0f172a] text-gray-200" value="mais_1_ano">Mais de 1 ano</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" name="ja_tem_visto" checked={formData.ja_tem_visto} onChange={handleChange} className="w-5 h-5 rounded bg-white/5 border-white/10 accent-blue-500" />
                                <label className="text-sm text-gray-300">Você está disponível a estudar na Espanha?</label>
                            </div>
                            <div>
                                <label className={labelClass}>Você pretende trabalhar na Espanha?</label>
                                <select name="pretende_trabalhar" value={formData.pretende_trabalhar} onChange={handleChange} className={inputClass}>
                                    <option className="bg-[#0f172a] text-gray-200" value="">Selecione</option>
                                    <option className="bg-[#0f172a] text-gray-200" value="sim_presencial">Sim, presencialmente</option>
                                    <option className="bg-[#0f172a] text-gray-200" value="sim_remoto">Sim, trabalho remoto do Brasil</option>
                                    <option className="bg-[#0f172a] text-gray-200" value="sim_autonomo">Sim, como autônomo</option>
                                    <option className="bg-[#0f172a] text-gray-200" value="nao">Não</option>
                                    <option className="bg-[#0f172a] text-gray-200" value="indeciso">Indeciso</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Qual sua área de trabalho?</label>
                                <input name="area_trabalho" value={formData.area_trabalho} onChange={handleChange} className={inputClass} placeholder="Ex: TI, Saúde, Educação..." />
                            </div>
                        </div>

                        {/* Navegação */}
                        <div className="flex justify-between pt-4">
                            <button type="button" onClick={prevStep} className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold transition-all active:scale-[0.98]">
                                ← Anterior
                            </button>
                            <button type="button" onClick={nextStep} className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25">
                                Próximo →
                            </button>
                        </div>
                    </div>
                )}

                {/* ==================== ETAPA 3: Finalizar ==================== */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Financeiro */}
                        <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">💰 Informações Financeiras</h2>
                            <div>
                                <label className={labelClass}>Qual sua faixa de renda mensal?</label>
                                <select name="renda_mensal" value={formData.renda_mensal} onChange={handleChange} className={inputClass}>
                                    <option className="bg-[#0f172a] text-gray-200" value="">Selecione</option>
                                    <option className="bg-[#0f172a] text-gray-200" value="ate_3k">Até R$ 3.000</option>
                                    <option className="bg-[#0f172a] text-gray-200" value="3k_5k">R$ 3.000 - R$ 5.000</option>
                                    <option className="bg-[#0f172a] text-gray-200" value="5k_10k">R$ 5.000 - R$ 10.000</option>
                                    <option className="bg-[#0f172a] text-gray-200" value="10k_20k">R$ 10.000 - R$ 20.000</option>
                                    <option className="bg-[#0f172a] text-gray-200" value="acima_20k">Acima de R$ 20.000</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Possui reserva financeira? Qual montante?</label>
                                <input name="possui_reserva" value={formData.possui_reserva} onChange={handleChange} className={inputClass} placeholder="Ex: Sim, R$ 50.000" />
                            </div>
                        </div>

                        {/* Observações */}
                        <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">💬 Observações</h2>
                            <div>
                                <label className={labelClass}>Como conheceu a Bora Expandir?</label>
                                <input name="como_conheceu" value={formData.como_conheceu} onChange={handleChange} className={inputClass} placeholder="Ex: Instagram, indicação..." />
                            </div>
                            <div>
                                <label className={labelClass}>Alguma observação adicional?</label>
                                <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} className={inputClass + ' min-h-[100px]'} placeholder="Escreva aqui qualquer informação adicional que julgar relevante..." />
                            </div>
                        </div>

                        {/* Navegação + Submit */}
                        <div className="flex justify-between pt-4">
                            <button type="button" onClick={prevStep} className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold transition-all active:scale-[0.98]">
                                ← Anterior
                            </button>
                            <button
                                type="submit"
                                className="px-10 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98]"
                            >
                                ✓ Finalizar e Enviar
                            </button>
                        </div>
                        <p className="text-center text-gray-500 text-xs">
                            Ao clicar em finalizar, sua conta será criada automaticamente e os dados de acesso serão enviados para seu email.
                        </p>
                    </div>
                )}
            </form>
        </div>
    )
}

