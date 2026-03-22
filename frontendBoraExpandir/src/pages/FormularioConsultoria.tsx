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
        // Step 1 - Identificação
        nome_completo: preNome,
        parceiro_indicador: '',
        email: preEmail,
        whatsapp: preTelefone,
        // Step 1 - Pessoais
        nacionalidade: '',
        esteve_europa_6meses: '',
        cidade_pais_residencia: '',
        // Step 2 - Familiar e Documentos
        estado_civil: [] as string[],
        filhos_qtd_idades: '',
        familiares_espanha: '',
        possui_cnh_categoria_ano: '',
        proposta_trabalho_espanha: '',
        visto_ue: '',
        trabalho_destacado_ue: '',
        filhos_nacionalidade_europeia: '',
        pretende_autonomo: [] as string[],
        // Step 3 - Educação e Trabalho
        disposto_estudar: '',
        pretende_trabalhar_espanha: [] as string[],
        escolaridade: [] as string[],
        area_formacao: '',
        situacao_profissional: [] as string[],
        profissao_online_presencial: '',
        tipo_visto_planejado: '',
        duvidas_consultoria: '',
    })

    // ========== Verificação de seções completas ==========
    const isStep1Complete = useCallback(() => {
        return !!(
            formData.nome_completo.trim() &&
            formData.email.trim() &&
            formData.whatsapp.trim() &&
            formData.nacionalidade.trim() &&
            formData.esteve_europa_6meses.trim() &&
            formData.cidade_pais_residencia.trim()
            // parceiro_indicador é OPCIONAL
        )
    }, [formData.nome_completo, formData.email, formData.whatsapp,
        formData.nacionalidade, formData.esteve_europa_6meses, formData.cidade_pais_residencia])

    const isStep2Complete = useCallback(() => {
        return !!(
            formData.estado_civil.length > 0 &&
            formData.filhos_qtd_idades.trim() &&
            formData.familiares_espanha.trim() &&
            formData.possui_cnh_categoria_ano.trim() &&
            formData.proposta_trabalho_espanha.trim() &&
            formData.visto_ue.trim() &&
            formData.trabalho_destacado_ue.trim() &&
            formData.filhos_nacionalidade_europeia.trim() &&
            formData.pretende_autonomo.length > 0
        )
    }, [formData.estado_civil, formData.filhos_qtd_idades, formData.familiares_espanha,
        formData.possui_cnh_categoria_ano, formData.proposta_trabalho_espanha, formData.visto_ue,
        formData.trabalho_destacado_ue, formData.filhos_nacionalidade_europeia, formData.pretende_autonomo])

    const isStep3Complete = useCallback(() => {
        return !!(
            formData.disposto_estudar &&
            formData.pretende_trabalhar_espanha.length > 0 &&
            formData.escolaridade.length > 0 &&
            formData.area_formacao.trim() &&
            formData.situacao_profissional.length > 0 &&
            formData.profissao_online_presencial.trim() &&
            formData.tipo_visto_planejado.trim() &&
            formData.duvidas_consultoria.trim()
        )
    }, [formData.disposto_estudar, formData.pretende_trabalhar_espanha, formData.escolaridade,
        formData.area_formacao, formData.situacao_profissional, formData.profissao_online_presencial,
        formData.tipo_visto_planejado, formData.duvidas_consultoria])

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
            if (!isStep1Complete()) {
                setError('Preencha todos os campos obrigatórios antes de continuar.')
                return
            }
            setError(null)
        }
        if (currentStep === 2) {
            if (!isStep2Complete()) {
                setError('Preencha todos os campos obrigatórios desta etapa antes de continuar.')
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => {
            const current = (prev[field] as string[]) || []
            return {
                ...prev,
                [field]: current.includes(value)
                    ? current.filter(v => v !== value)
                    : [...current, value]
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validação das seções obrigatórias
        const erros: string[] = []

        if (!isStep1Complete()) erros.push('Identificação e Dados Pessoais (Etapa 1)')
        if (!isStep2Complete()) erros.push('Situação Familiar e Documentos (Etapa 2)')
        if (!isStep3Complete()) erros.push('Educação, Trabalho e Objetivos (Etapa 3)')

        if (erros.length > 0) {
            setError(`Preencha as seções obrigatórias:\n• ${erros.join('\n• ')}`)
            if (!isStep1Complete()) setCurrentStep(1)
            else if (!isStep2Complete()) setCurrentStep(2)
            else setCurrentStep(3)
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

    const stepLabels = ['Identificação', 'Situação Familiar', 'Educação e Planos']

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

            {/* Aviso Importante */}
            <div className="max-w-3xl mx-auto px-6 pb-6">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-amber-400 font-bold text-sm mb-2">⚠️ Importante:</p>
                    <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                        <li>Use o mesmo e-mail que você utilizou para fazer o agendamento. Se for diferente, o sistema não consegue confirmar a sua consultoria.</li>
                        <li>Quem vai participar da consultoria é quem precisa preencher o formulário. (Ex.: se a consultoria é para você, não deixe outra pessoa preencher por você.)</li>
                    </ol>
                    <p className="text-gray-400 text-sm mt-2">Esse formulário é essencial para que possamos analisar o seu caso e garantir um atendimento realmente personalizado.</p>
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

                {/* ==================== ETAPA 1: Identificação ==================== */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Identificação */}
                        <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">👤 Identificação</h2>
                            <div>
                                <label className={labelClass}>Nome completo *</label>
                                <input name="nome_completo" value={formData.nome_completo} onChange={handleChange} className={inputClass + (preNome ? ' opacity-70' : '')} placeholder="Seu nome completo" readOnly={!!preNome} />
                            </div>
                            <div>
                                <label className={labelClass}>Você foi indicado(a) por algum parceiro(a)? Se sim, qual nome dele(a)?</label>
                                <input name="parceiro_indicador" value={formData.parceiro_indicador} onChange={handleChange} className={inputClass} placeholder="Deixe em branco se não foi indicado" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Qual seu email? *</label>
                                    <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClass + (preEmail ? ' opacity-70' : '')} placeholder="seuemail@exemplo.com" readOnly={!!preEmail} />
                                </div>
                                <div>
                                    <label className={labelClass}>Qual seu número de WhatsApp com DDI? *</label>
                                    <input name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} className={inputClass + (preTelefone ? ' opacity-70' : '')} placeholder="+55 11 99999-9999" readOnly={!!preTelefone} />
                                </div>
                            </div>
                        </div>

                        {/* Dados Pessoais */}
                        <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">🌍 Dados Pessoais</h2>
                            <div>
                                <label className={labelClass}>Qual sua nacionalidade? *</label>
                                <textarea name="nacionalidade" value={formData.nacionalidade} onChange={handleChange} className={inputClass + ' min-h-[80px]'} placeholder="Ex: Brasileira" />
                            </div>
                            <div>
                                <label className={labelClass}>Você esteve na EUROPA nos últimos 6 meses? Se sim, quais as datas que esteve aqui? *</label>
                                <input name="esteve_europa_6meses" value={formData.esteve_europa_6meses} onChange={handleChange} className={inputClass} placeholder="Ex: Não / Sim, de Março/2024 a Abril/2024" />
                            </div>
                            <div>
                                <label className={labelClass}>Qual cidade e país reside hoje? Se já estiver na Espanha informe a data que entrou aqui: *</label>
                                <textarea name="cidade_pais_residencia" value={formData.cidade_pais_residencia} onChange={handleChange} className={inputClass + ' min-h-[80px]'} placeholder="Ex: São Paulo, Brasil — ou — Madrid, Espanha (entrou em 15/03/2024)" />
                            </div>
                        </div>

                        {/* Navegação */}
                        <div className="flex justify-end pt-4">
                            <button type="button" onClick={nextStep} className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25">
                                Próximo →
                            </button>
                        </div>
                    </div>
                )}

                {/* ==================== ETAPA 2: Situação Familiar ==================== */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Estado Civil */}
                        <div className="space-y-3 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">💍 Qual seu estado civil? *</h2>
                            {[
                                'Solteiro(a)',
                                'Namorando',
                                'Noivo(a)',
                                'Casado(a)',
                                'Amasiado(mora junto e não fez registro de união estável)',
                                'União Estável(mora junto e fez escritura de união estável no cartório)',
                                'Divorciado(separou e já se divorciou no papel)',
                                'Separado(separou mas não se divorciou no papel)',
                            ].map(opcao => (
                                <label key={opcao} className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.estado_civil.includes(opcao)}
                                        onChange={() => handleCheckboxChange('estado_civil', opcao)}
                                        className="mt-0.5 w-4 h-4 accent-blue-500 flex-shrink-0"
                                    />
                                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{opcao}</span>
                                </label>
                            ))}
                        </div>

                        {/* Família e Documentos */}
                        <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">👨‍👩‍👧 Família e Documentos</h2>
                            <div>
                                <label className={labelClass}>Possui filhos? Se sim, quantos e idade? *</label>
                                <textarea name="filhos_qtd_idades" value={formData.filhos_qtd_idades} onChange={handleChange} className={inputClass + ' min-h-[80px]'} placeholder="Ex: 2 filhos, 5 e 8 anos / Não tenho filhos" />
                            </div>
                            <div>
                                <label className={labelClass}>Possui familiares que mora na Espanha? Se sim qual o grau de parentesco e qual tipo de residência eles possuem aqui? *</label>
                                <textarea name="familiares_espanha" value={formData.familiares_espanha} onChange={handleChange} className={inputClass + ' min-h-[80px]'} placeholder="Ex: Irmão com residência permanente / Não tenho" />
                            </div>
                            <div>
                                <label className={labelClass}>Você possui CNH? Se sim, informe qual a categoria e qual ano você obteve. *</label>
                                <input name="possui_cnh_categoria_ano" value={formData.possui_cnh_categoria_ano} onChange={handleChange} className={inputClass} placeholder="Ex: Categoria B, 2015 / Não possuo" />
                            </div>
                            <div>
                                <label className={labelClass}>Você já tem uma proposta de trabalho na Espanha? Se sim, qual o tipo de contrato, salário e cargo? *</label>
                                <textarea name="proposta_trabalho_espanha" value={formData.proposta_trabalho_espanha} onChange={handleChange} className={inputClass + ' min-h-[80px]'} placeholder="Ex: Sim, contrato CLT, 2000€/mês, cargo de Engenheiro / Não" />
                            </div>
                            <div>
                                <label className={labelClass}>Você tem algum tipo de visto, residência ou nacionalidade de outro país da União Europeia? *</label>
                                <textarea name="visto_ue" value={formData.visto_ue} onChange={handleChange} className={inputClass + ' min-h-[80px]'} placeholder="Ex: Tenho residência portuguesa / Não tenho" />
                            </div>
                            <div>
                                <label className={labelClass}>Você trabalha na Espanha como destacado/transladado por uma empresa de outro país da União Europeia? *</label>
                                <input name="trabalho_destacado_ue" value={formData.trabalho_destacado_ue} onChange={handleChange} className={inputClass} placeholder="Ex: Sim, empresa portuguesa prestando serviço na Espanha / Não" />
                            </div>
                            <div>
                                <label className={labelClass}>Você tem algum filho menor de idade que tem nacionalidade europeia? *</label>
                                <textarea name="filhos_nacionalidade_europeia" value={formData.filhos_nacionalidade_europeia} onChange={handleChange} className={inputClass + ' min-h-[80px]'} placeholder="Ex: Sim, filho de 7 anos com passaporte espanhol / Não" />
                            </div>
                        </div>

                        {/* Pretende Autônomo */}
                        <div className="space-y-3 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">🏢 Você pretende trabalhar como autônomo, abrir um negócio/empreender, assim que chegar na Espanha? *</h2>
                            {[
                                'Sim. Tenho experiência/formação na área. Tenho investimento inicial',
                                'Sim. Mas não tenho experiência/formação na área. Tenho investimento',
                                'Sim. Mas não tenho experiência/formação. Não tenho investimento',
                                'Não pretendo agora mas em futuro quem sabe',
                                'Não pretendo',
                            ].map(opcao => (
                                <label key={opcao} className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.pretende_autonomo.includes(opcao)}
                                        onChange={() => handleCheckboxChange('pretende_autonomo', opcao)}
                                        className="mt-0.5 w-4 h-4 accent-blue-500 flex-shrink-0"
                                    />
                                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{opcao}</span>
                                </label>
                            ))}
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

                {/* ==================== ETAPA 3: Educação e Planos ==================== */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Disposto a estudar */}
                        <div className="space-y-3 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">📚 Você está disposto(a) a estudar na Espanha? *</h2>
                            {[
                                'Sim',
                                'Apenas se esse for o único jeito de ficar regular',
                                'Não. De jeito nenhum',
                            ].map(opcao => (
                                <label key={opcao} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="disposto_estudar"
                                        value={opcao}
                                        checked={formData.disposto_estudar === opcao}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-blue-500"
                                    />
                                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{opcao}</span>
                                </label>
                            ))}
                        </div>

                        {/* Pretende trabalhar */}
                        <div className="space-y-3 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">💼 Você pretende trabalhar na Espanha? *</h2>
                            {[
                                'Sim. Isso é essencial para mim.',
                                'Não pretendo. Tenho renda para me manter sem precisar trabalhar.',
                                'Tenho renda para me manter. Mas quero ter a opção de poder trabalhar.',
                                'Depende. Tenho renda p/ me manter sem trabalhar mas preciso analisar.',
                            ].map(opcao => (
                                <label key={opcao} className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.pretende_trabalhar_espanha.includes(opcao)}
                                        onChange={() => handleCheckboxChange('pretende_trabalhar_espanha', opcao)}
                                        className="mt-0.5 w-4 h-4 accent-blue-500 flex-shrink-0"
                                    />
                                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{opcao}</span>
                                </label>
                            ))}
                        </div>

                        {/* Escolaridade */}
                        <div className="space-y-3 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">🎓 Qual sua escolaridade? *</h2>
                            {[
                                'Ensino fundamental completo',
                                'Ensino fundamental incompleto',
                                'Ensino médio completo',
                                'Ensino médio incompleto',
                                'Ensino superior completo',
                                'Ensino superior incompleto',
                            ].map(opcao => (
                                <label key={opcao} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.escolaridade.includes(opcao)}
                                        onChange={() => handleCheckboxChange('escolaridade', opcao)}
                                        className="w-4 h-4 accent-blue-500"
                                    />
                                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{opcao}</span>
                                </label>
                            ))}
                        </div>

                        {/* Situação profissional */}
                        <div className="space-y-3 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">🏗️ Qual sua situação profissional atual? *</h2>
                            {[
                                'Desempregado(a)',
                                'Aposentado/Pensionista',
                                'Autônomo(atua sem CNPJ)',
                                'Tem empresa(atua com CNPJ: MEI ME ou LTDA)',
                                'Contrato CLT',
                                'Funcionário(a) Público(a)',
                            ].map(opcao => (
                                <label key={opcao} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={formData.situacao_profissional.includes(opcao)}
                                        onChange={() => handleCheckboxChange('situacao_profissional', opcao)}
                                        className="w-4 h-4 accent-blue-500"
                                    />
                                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">{opcao}</span>
                                </label>
                            ))}
                        </div>

                        {/* Textos longos */}
                        <div className="space-y-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">📝 Formação e Objetivos</h2>
                            <div>
                                <label className={labelClass}>Qual sua área de formação? *</label>
                                <textarea name="area_formacao" value={formData.area_formacao} onChange={handleChange} className={inputClass + ' min-h-[80px]'} placeholder="Ex: Engenharia de Software, Medicina, Direito..." />
                            </div>
                            <div>
                                <label className={labelClass}>Qual sua profissão? Você trabalha Online ou Presencial? *</label>
                                <textarea name="profissao_online_presencial" value={formData.profissao_online_presencial} onChange={handleChange} className={inputClass + ' min-h-[80px]'} placeholder="Ex: Desenvolvedor Frontend, trabalho 100% remoto" />
                            </div>
                            <div>
                                <label className={labelClass}>Você já tem ideia do tipo de visto ou residência que pretende solicitar? Se sim, qual? *</label>
                                <textarea name="tipo_visto_planejado" value={formData.tipo_visto_planejado} onChange={handleChange} className={inputClass + ' min-h-[80px]'} placeholder="Ex: Visto de trabalho por conta alheia / Ainda não sei" />
                            </div>
                            <div>
                                <label className={labelClass}>Como podemos te ajudar na Consultoria? Deixe aqui as dúvidas que você deseja resolver. *</label>
                                <textarea name="duvidas_consultoria" value={formData.duvidas_consultoria} onChange={handleChange} className={inputClass + ' min-h-[120px]'} placeholder="Descreva aqui as principais dúvidas que deseja resolver na consultoria..." />
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

