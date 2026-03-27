import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Save, Loader2, Calendar, Clock, User, Mail, Phone, CreditCard, FileText, Package, X, AlertCircle, Upload, CheckCircle2, XCircle, Copy } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '../../../../contexts/AuthContext'
import { CalendarPicker } from '@/components/ui/CalendarPicker'
import { catalogService, Service } from '../../../adm/services/catalogService'
import comercialService from '../../services/comercialService'
import juridicoService from '../../../juridico/services/juridicoService'
import { parseBackendDate, formatDataHora } from '../../../../utils/dateUtils'

const HORARIOS_DISPONIVEIS = [
    '08:00', '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00'
]

interface ConflictPopup {
    agendamento: any
    horasOcupadas: string[]
    x: number
    y: number
}

function getDirectlyOccupiedSlots(ag: any, allSlots: string[], dateIso: string): string[] {
    const inicio = parseBackendDate(ag.data_hora)
    const fim = new Date(inicio.getTime() + (ag.duracao_minutos || 60) * 60000)

    return allSlots.filter(hora => {
        const slotTime = new Date(`${dateIso}T${hora}:00`)
        return slotTime >= inicio && slotTime < fim
    })
}

export function AgendamentoEditPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const toast = useToast()
    const { activeProfile } = useAuth()

    const [loading, setLoading] = useState(true)
    const [salvando, setSalvando] = useState(false)

    const [agendamento, setAgendamento] = useState<any>(null)
    const [produtos, setProdutos] = useState<Service[]>([])
    const [usuariosSistema, setUsuariosSistema] = useState<any[]>([])

    const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined)
    const [horaSelecionada, setHoraSelecionada] = useState<string>('')
    const [agendamentosDia, setAgendamentosDia] = useState<any[]>([])

    const [conflictPopup, setConflictPopup] = useState<ConflictPopup | null>(null)
    const popupRef = useRef<HTMLDivElement>(null)

    // Comprovante Upload States
    const [comprovanteFile, setComprovanteFile] = useState<File | null>(null)
    const [comprovantePreview, setComprovantePreview] = useState<string | null>(null)
    const [uploadingComprovante, setUploadingComprovante] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Cancel states
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)
    const [cancelling, setCancelling] = useState(false)

    // Rescheduling states
    const [isRescheduling, setIsRescheduling] = useState(false)

    // Fechar popup ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                // Verificar se o clique não foi em um botão de horário (que tem seu próprio handler)
                const isButtonClick = (event.target as HTMLElement).closest('button')
                if (!isButtonClick) {
                    setConflictPopup(null)
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const [prods, usuariosData] = await Promise.all([
                    catalogService.getCatalogServices(),
                    juridicoService.getFuncionariosJuridico().catch(() => [])
                ])
                setProdutos(prods)
                setUsuariosSistema(Array.isArray(usuariosData) ? usuariosData : [])


                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/comercial/agendamento/${id}`)
                if (!response.ok) throw new Error('Agendamento não encontrado')

                const data = await response.json()
                setAgendamento(data)

                if (data.data_hora) {
                    const dt = parseBackendDate(data.data_hora)
                    setDataSelecionada(dt)
                    setHoraSelecionada(data.data_hora.includes('T') ? data.data_hora.split('T')[1].substring(0, 5) : '')
                }
            } catch (err: any) {
                console.error(err)
                toast.error('Não foi possível carregar os dados do agendamento.')
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    useEffect(() => {
        if (!dataSelecionada) return
        const ano = dataSelecionada.getFullYear()
        const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0')
        const dia = String(dataSelecionada.getDate()).padStart(2, '0')
        const isoDate = `${ano}-${mes}-${dia}`

        async function fetchDia() {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/comercial/agendamentos/${isoDate}`)
                if (response.ok) {
                    const data = await response.json()
                    setAgendamentosDia(data || [])
                }
            } catch (e) {
                console.error('Erro ao buscar ocupacao do dia', e)
            }
        }
        fetchDia()
    }, [dataSelecionada])

    const getDateIso = () => {
        if (!dataSelecionada) return ''
        const ano = dataSelecionada.getFullYear()
        const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0')
        const dia = String(dataSelecionada.getDate()).padStart(2, '0')
        return `${ano}-${mes}-${dia}`
    }

    const isHorarioDisponivel = (hora: string) => {
        if (!dataSelecionada) return true
        const dataIso = getDateIso()

        const inicioNovo = new Date(`${dataIso}T${hora}:00`)
        const duracaoNovo = agendamento?.duracao_minutos || 60
        const fimNovo = new Date(inicioNovo.getTime() + duracaoNovo * 60000)

        return agendamentosDia.every((ag) => {
            if (ag.id === id) return true
            const inicioExistente = parseBackendDate(ag.data_hora)
            const duracaoExistente = ag.duracao_minutos || 60
            const fimExistente = new Date(inicioExistente.getTime() + duracaoExistente * 60000)
            return !(inicioExistente < fimNovo && inicioNovo < fimExistente)
        })
    }

    const handleUnavailableSlotClick = (e: React.MouseEvent, hora: string) => {
        const dataIso = getDateIso()
        if (!dataIso) return

        const rect = e.currentTarget.getBoundingClientRect()
        const parentRect = e.currentTarget.closest('.relative')?.getBoundingClientRect()

        // Calcular posição relativa ao container .relative
        const x = rect.left - (parentRect?.left || 0) + rect.width / 2
        const y = rect.top - (parentRect?.top || 0) + rect.height + 10

        const inicioNovo = new Date(`${dataIso}T${hora}:00`)
        const duracaoNovo = agendamento?.duracao_minutos || 60
        const fimNovo = new Date(inicioNovo.getTime() + duracaoNovo * 60000)

        const conflito = agendamentosDia.find((ag) => {
            if (ag.id === id) return false
            const inicioExistente = parseBackendDate(ag.data_hora)
            const duracaoExistente = ag.duracao_minutos || 60
            const fimExistente = new Date(inicioExistente.getTime() + duracaoExistente * 60000)
            return inicioExistente < fimNovo && inicioNovo < fimExistente
        })

        if (conflito) {
            const horasOcupadas = getDirectlyOccupiedSlots(conflito, HORARIOS_DISPONIVEIS, dataIso)
            setConflictPopup({ agendamento: conflito, horasOcupadas, x, y })
        }
    }

    const handleSalvar = async () => {
        if (!dataSelecionada || !horaSelecionada) {
            toast.warning('Selecione uma data e horário válidos.')
            return
        }

        try {
            setSalvando(true)
            const isoDate = getDateIso()

            const payload: any = {
                data_hora: `${isoDate}T${horaSelecionada}:00`
            }

            // Se o agendamento estava em conflito e foi resolvido ao escolher nova data/hora, removemos a flag.
            if (agendamento.conflito_horario && agendamento.pagamento_status === 'aprovado') {
                payload.conflito_horario = false
            }

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/comercial/agendamento/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error('Falha ao atualizar agendamento')

            toast.success('Agendamento atualizado com sucesso!')
            navigate('/comercial/meus-agendamentos')
        } catch (e: any) {
            console.error(e)
            toast.error(e.message || 'Erro de conexão')
        } finally {
            setSalvando(false)
            setIsRescheduling(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setComprovanteFile(file)
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (ev) => setComprovantePreview(ev.target?.result as string)
                reader.readAsDataURL(file)
            } else {
                setComprovantePreview(null)
            }
        }
    }

    const handleUploadComprovante = async () => {
        if (!comprovanteFile || !agendamento?.id) return

        setUploadingComprovante(true)
        const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''

        try {
            const formData = new FormData()
            formData.append('comprovante', comprovanteFile)
            formData.append('agendamento_id', agendamento.id)
            if (agendamento.cliente_id) {
                formData.append('cliente_id', agendamento.cliente_id)
            }

            const response = await fetch(`${backendUrl}/formulario/comprovante`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                throw new Error('Erro ao enviar comprovante')
            }

            toast.success('Comprovante enviado com sucesso!')
            
            // Update local state to show it was sent
            setAgendamento((prev: any) => ({
                ...prev,
                comprovante_url: 'enviado',
                pagamento_status: 'em_analise',
                status: 'aguardando_verificacao'
            }))
            
            setComprovanteFile(null)
            setComprovantePreview(null)
        } catch (err: any) {
            toast.error(err.message || 'Erro ao enviar comprovante. Tente novamente.')
        } finally {
            setUploadingComprovante(false)
        }
    }

    const handleCancelarAgendamento = async () => {
        if (!agendamento?.id) return
        try {
            setCancelling(true)
            await comercialService.cancelarAgendamento(agendamento.id)
            toast.success('Agendamento cancelado com sucesso.')
            navigate('/comercial/meus-agendamentos')
        } catch (err: any) {
            toast.error(err.message || 'Erro ao cancelar agendamento.')
        } finally {
            setCancelling(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50/50 dark:bg-[#0a0a0a]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    if (!agendamento) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p>Agendamento não encontrado.</p>
                <button onClick={() => navigate('/comercial/meus-agendamentos')} className="text-emerald-600 font-medium hover:underline mt-4">
                    Voltar para Meus Agendamentos
                </button>
            </div>
        )
    }

    const produtoDetalhe = produtos.find(p => p.id === agendamento.produto_id)
    const nomeProduto = produtoDetalhe?.name || agendamento.produto_nome || agendamento.produto_id || 'Não especificado'

    const formatDataHoraDisplay = (dataHora: string) => {
        try {
            return formatDataHora(dataHora);
        } catch { return dataHora }
    }

    const isAgendamentoConfirmadoOuPassado = () => {
        if (!agendamento) return false;
        const status = agendamento.status;
        const confirmado = status === 'confirmado' || status === 'realizado';
        const hoje = new Date();
        const dataAgendamento = new Date(agendamento.data_hora);
        const passado = dataAgendamento < hoje;
        return confirmado || passado;
    }

    const showLockedView = isAgendamentoConfirmadoOuPassado() && !isRescheduling && agendamento.status !== 'cancelado';

    return (
        <div className="min-h-screen bg-gray-50/30 dark:bg-[#0a0a0a] p-4 md:p-8 pt-20 md:pt-10">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate('/comercial/meus-agendamentos')}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800 transition text-gray-600 dark:text-gray-300"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold font-outfit text-gray-900 dark:text-white">Editar Agendamento</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Modifique a data e horário do agendamento.</p>
                    </div>
                </div>

                {/* ═══ BANNER DE PEDIDO DE REAGENDAMENTO ═══ */}
                {agendamento.pedido_reagendamento && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600/50 rounded-2xl shadow-sm mb-6 px-6 py-4 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-base mb-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            Pedido de Reagendamento pelo Juridico
                        </div>
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            <strong>Mensagem:</strong> {agendamento.mensagem_reagendamento}
                        </p>
                    </div>
                )}

                {/* ═══ BANNER DE CONFLITO ═══ */}
                {agendamento.conflito_horario && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700/50 rounded-2xl shadow-sm mb-6 px-6 py-4 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-base mb-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            Atenção: Conflito de Horário!
                        </div>
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            Após a confirmação do pagamento, verificamos que o horário selecionado (<strong>{formatDataHoraDisplay(agendamento.data_hora)}</strong>) 
                            já foi ocupado por outro cliente que teve o pagamento confirmado primeiro. 
                            <br/><br/>
                            <strong>Ação Necessária:</strong> Selecione um novo horário disponível abaixo para realocar este cliente. Não será necessário confirmar o pagamento novamente.
                        </p>
                    </div>
                )}

                {/* ═══ STATUS BAR (topo, full-width) ═══ */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm mb-6 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Lado Esquerdo: Pessoa */}
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {agendamento.nome || 'Não informado'}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" /> {agendamento.email || '—'}</span>
                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {agendamento.telefone || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Centro: Produto */}
                        <div className="flex items-center gap-2 text-sm">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">{nomeProduto}</span>
                            <span className="text-xs text-gray-400">({agendamento.duracao_minutos} min)</span>
                        </div>

                        {/* Lado Direito: Badges de Status */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${agendamento.status === 'confirmado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                agendamento.status === 'bloqueado' || agendamento.status === 'cancelado' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    agendamento.status === 'aguardando_verificacao' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                }`}>
                                {agendamento.status === 'aguardando_verificacao' ? 'Aguardando Verificação' : agendamento.status}
                            </span>
                            {/* Badge de pagamento_status */}
                            {agendamento.pagamento_status === 'aprovado' && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                    <CreditCard className="w-3 h-3" /> Pgto Aprovado ✓
                                </span>
                            )}
                            {agendamento.pagamento_status === 'pendente' && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                    <CreditCard className="w-3 h-3" /> Verificação Pendente
                                </span>
                            )}
                            {agendamento.pagamento_status === 'recusado' && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                    <CreditCard className="w-3 h-3" /> Pgto Recusado ✗
                                </span>
                            )}
                            {!agendamento.pagamento_status && (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${agendamento.comprovante_url
                                    ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400'
                                    }`}>
                                    <CreditCard className="w-3 h-3" /> Pix {agendamento.comprovante_url ? '✓' : '—'}
                                </span>
                            )}
                            {(() => {
                                const frontendUrl = import.meta.env.VITE_FRONTEND_URL?.trim() || window.location.origin
                                const isFormPreenchido = agendamento.formulario_preenchido;
                                const isPgtoAprovado = agendamento.pagamento_status === 'aprovado'
                                
                                if (isFormPreenchido) {
                                    return (
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                            <FileText className="w-3 h-3" /> Form ✓
                                        </span>
                                    )
                                } else if (isPgtoAprovado) {
                                    return (
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                            <FileText className="w-3 h-3" /> Form Pendente
                                        </span>
                                    )
                                } else {
                                    return (
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400">
                                            <FileText className="w-3 h-3" /> Form —
                                        </span>
                                    )
                                }
                            })()}
                        </div>
                    </div>
                </div>

                {/* ═══ NOTA DE RECUSA DO FINANCEIRO ═══ */}
                {agendamento.pagamento_status === 'recusado' && agendamento.pagamento_nota_recusa && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl shadow-sm mb-6 px-6 py-4">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-semibold text-sm mb-2">
                            <AlertCircle className="w-4 h-4" />
                            Pagamento Recusado pelo Financeiro
                        </div>
                        <p className="text-sm text-red-600 dark:text-red-400">
                            <strong>Motivo:</strong> {agendamento.pagamento_nota_recusa}
                        </p>
                    </div>
                )}

                {/* ═══ LINK DO FORMULÁRIO (visível quando pagamento aprovado E não preenchido E não é Assessoria/Contratos) ═══ */}
                {agendamento.pagamento_status === 'aprovado' && !agendamento.formulario_preenchido && !(
                    nomeProduto.toLowerCase().includes('assessoria') ||
                    agendamento.tipo_servico?.toLowerCase().includes('assessoria') ||
                    agendamento.servico_nome?.toLowerCase().includes('assessoria') ||
                    agendamento.tipo_servico?.toLowerCase().includes('contratos') ||
                    agendamento.tipo_servico?.toLowerCase() === 'fixo'
                ) && (
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Formulário de Consultoria
                        </h2>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                            {(() => {
                                const frontendUrl = import.meta.env.VITE_FRONTEND_URL?.trim() || window.location.origin
                                const params = new URLSearchParams()
                                if (agendamento.nome) params.set('nome', agendamento.nome)
                                if (agendamento.email) params.set('email', agendamento.email)
                                if (agendamento.telefone) params.set('telefone', agendamento.telefone)
                                const formLink = `${frontendUrl}/formulario/consultoria/${agendamento.id}?${params.toString()}`
                                const mensagem = `✅ Olá, ${agendamento.nome || 'cliente'}! Sua conta já foi criada, verifique seu email! 📝 Aqui está o formulário que precisa ser preenchido para continuarmos com seu agendamento:\n\n${formLink}`

                                return (
                                    <div className="space-y-3">
                                        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                                            📋 Mensagem pronta para enviar ao cliente:
                                        </p>
                                        <textarea
                                            readOnly
                                            value={mensagem}
                                            rows={5}
                                            className="w-full text-xs bg-white dark:bg-neutral-800 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 resize-none"
                                            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(mensagem)
                                                toast.success('Mensagem copiada!')
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                                        >
                                            Copiar Mensagem
                                        </button>
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                )}

                {/* ═══ LINK DO GOOGLE MEET ═══ */}
                {agendamento.meet_link && (
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            Link do Google Meet
                        </h2>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800/30">
                            <p className="text-sm text-emerald-800 dark:text-emerald-300 mb-3 font-medium">
                                📹 Link da videochamada para a consultoria:
                            </p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={agendamento.meet_link}
                                    className="flex-1 text-xs bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-emerald-700/50 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-200 font-mono"
                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(agendamento.meet_link)
                                        toast.success('Link do Google Meet copiado!')
                                    }}
                                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
                                >
                                    <Copy className="w-3.5 h-3.5" /> Copiar Link
                                </button>
                            </div>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                                Este link foi gerado automaticamente e enviado para o cliente. Use-o no dia da consultoria.
                            </p>
                        </div>
                    </div>
                )}

                {/* ═══ UPLOAD DE COMPROVANTE ═══ */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        Comprovante de Pagamento
                    </h2>

                    <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl p-5 border border-gray-200 dark:border-neutral-700">
                        {agendamento.pagamento_status === 'aprovado' ? (
                            <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="h-6 w-6" />
                                <div>
                                    <p className="font-bold">Pagamento Aprovado</p>
                                    <p className="text-sm">O comprovante já foi verificado e aprovado pelo financeiro.</p>
                                </div>
                            </div>
                        ) : agendamento.comprovante_url && agendamento.pagamento_status !== 'recusado' ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                                    <Clock className="h-6 w-6" />
                                    <div>
                                        <p className="font-bold">Aguardando Verificação</p>
                                        <p className="text-sm">O comprovante foi enviado e está na fila do financeiro.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold underline"
                                >
                                    Enviar outro
                                </button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {comprovanteFile ? (
                                    <div className="space-y-4">
                                        {comprovantePreview && (
                                            <img src={comprovantePreview} alt="Comprovante" className="w-full max-h-48 object-contain rounded-lg border bg-white" />
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 p-3 rounded-lg border">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                            <span className="flex-1 truncate font-medium">{comprovanteFile.name}</span>
                                            <button
                                                onClick={() => { setComprovanteFile(null); setComprovantePreview(null) }}
                                                className="text-red-500 hover:text-red-700 text-sm font-medium px-2"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleUploadComprovante}
                                            disabled={uploadingComprovante}
                                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {uploadingComprovante ? (
                                                <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                                            ) : (
                                                <><Upload className="h-4 w-4" /> Enviar Comprovante para o Financeiro</>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 rounded-xl text-gray-500 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex flex-col items-center gap-3"
                                    >
                                        <div className="p-3 bg-gray-100 dark:bg-neutral-700 rounded-full">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-sm font-bold block mb-1">Clique para anexar o comprovante do cliente</span>
                                            <span className="text-xs opacity-70">Formatos aceitos: JPG, PNG, WebP ou PDF (máx. 10MB)</span>
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ CALENDÁRIO + HORÁRIOS (full-width) ═══ */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            Data e Horário
                        </h2>
                        {showLockedView && (
                            <button
                                onClick={() => setIsRescheduling(true)}
                                className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 font-bold hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors inline-flex items-center gap-2 shadow-sm"
                            >
                                <Calendar className="w-4 h-4" />
                                Reagendar
                            </button>
                        )}
                    </div>

                    {showLockedView && (
                        <div className="bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-700 rounded-xl p-4 mb-6 flex items-center justify-between shadow-sm">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                    Horário Atual
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {formatDataHoraDisplay(agendamento.data_hora)}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-emerald-600 opacity-50" />
                        </div>
                    )}

                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-all ${showLockedView ? 'opacity-60' : ''}`}>
                        {/* Calendário */}
                        <div>
                            <CalendarPicker
                                selectedDate={dataSelecionada}
                                onDateSelect={setDataSelecionada}
                                disableWeekends={true}
                                minDate={(() => {
                                    const tomorrow = new Date()
                                    tomorrow.setDate(tomorrow.getDate() + 1)
                                    tomorrow.setHours(0, 0, 0, 0)
                                    return tomorrow
                                })()}
                            />
                        </div>

                        {/* Horários */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Horários Disponíveis</p>
                            {!dataSelecionada ? (
                                <div className="flex-1 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-xl flex items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-neutral-900/50">
                                    <div>
                                        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 max-w-[200px] mx-auto">Selecione uma data para ver os horários</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {HORARIOS_DISPONIVEIS.map((hora) => {
                                        const disponivel = isHorarioDisponivel(hora)
                                        const isDirectlyOccupied = conflictPopup?.horasOcupadas.includes(hora)
                                        return (
                                            <button
                                                key={hora}
                                                onClick={(e) => {
                                                    if (!disponivel) {
                                                        handleUnavailableSlotClick(e, hora)
                                                    } else if (!showLockedView) {
                                                        setHoraSelecionada(hora)
                                                    }
                                                }}
                                                className={`py-2.5 px-3 text-sm rounded-lg font-medium transition-all ${!disponivel
                                                    ? isDirectlyOccupied
                                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-2 border-red-400 dark:border-red-500 cursor-pointer ring-2 ring-red-300/50 dark:ring-red-500/30'
                                                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 border border-gray-200 dark:border-neutral-700 cursor-pointer opacity-80'
                                                    : horaSelecionada === hora
                                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 border-emerald-600'
                                                        : `bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-neutral-700 ${showLockedView ? 'cursor-not-allowed opacity-50' : 'hover:border-emerald-500 hover:text-emerald-600 cursor-pointer'}`
                                                    }`}
                                            >
                                                <Clock className="h-3.5 w-3.5 inline mr-1.5 opacity-70" />
                                                {hora}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══ CONFLICT POPUP ═══ */}
                    {conflictPopup && (
                        <div
                            ref={popupRef}
                            className="absolute z-20 animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-none"
                            style={{
                                left: `${conflictPopup.x}px`,
                                top: `${conflictPopup.y}px`,
                                transform: 'translateX(-50%)',
                                width: '320px'
                            }}
                        >
                            <div className="bg-white/80 dark:bg-neutral-800/80 rounded-xl border-2 border-red-300 dark:border-red-700 shadow-2xl p-4 pointer-events-auto">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
                                        <AlertCircle className="w-5 h-5" />
                                        Horário Ocupado
                                    </div>
                                    <button
                                        onClick={() => setConflictPopup(null)}
                                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Cliente</span>
                                        <p className="font-medium text-gray-900 dark:text-white">{conflictPopup.agendamento.nome || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">E-mail</span>
                                        <p className="font-medium text-gray-900 dark:text-white truncate">{conflictPopup.agendamento.email || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Telefone</span>
                                        <p className="font-medium text-gray-900 dark:text-white">{conflictPopup.agendamento.telefone || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Status</span>
                                        <p className="font-medium text-gray-900 dark:text-white capitalize">{conflictPopup.agendamento.status || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Horário</span>
                                        <p className="font-medium text-gray-900 dark:text-white">{formatDataHoraDisplay(conflictPopup.agendamento.data_hora)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Duração</span>
                                        <p className="font-medium text-gray-900 dark:text-white">{conflictPopup.agendamento.duracao_minutos || 60} min</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Produto</span>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {conflictPopup.agendamento.produto_nome || 
                                             produtos.find(p => p.id === conflictPopup.agendamento.produto_id)?.name || 
                                             conflictPopup.agendamento.produto_id || '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Pagamento</span>
                                        <p className="font-medium text-gray-900 dark:text-white capitalize">{conflictPopup.agendamento.metodo_pagamento || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Valor</span>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {conflictPopup.agendamento.valor ? `R$ ${Number(conflictPopup.agendamento.valor).toFixed(2)}` : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Criado por</span>
                                        <p className="font-medium text-gray-900 dark:text-white truncate text-xs">
                                            {(() => {
                                                const uid = conflictPopup.agendamento.usuario_id
                                                if (!uid) return '—'
                                                if (activeProfile?.id === uid) return activeProfile?.full_name || 'Você'
                                                const user = usuariosSistema.find((u: any) => u.id === uid)
                                                if (user) return user.full_name
                                                return 'Não identificado'
                                            })()}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-700">
                                    <p className="text-xs text-red-500 dark:text-red-400">
                                        Slots ocupados: <strong>{conflictPopup.horasOcupadas.join(', ')}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ CANCELAR AGENDAMENTO ═══ */}
                {agendamento.status !== 'cancelado' && agendamento.status !== 'realizado' && (
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-red-100 dark:border-red-900/30 shadow-sm mt-6">
                        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Cancelar Agendamento
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Ao cancelar, o horário será liberado e o agendamento não poderá ser reativado.
                        </p>
                        {showCancelConfirm ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCancelarAgendamento}
                                    disabled={cancelling}
                                    className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {cancelling ? <><Loader2 className="h-4 w-4 animate-spin" /> Cancelando...</> : 'Confirmar Cancelamento'}
                                </button>
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    disabled={cancelling}
                                    className="px-5 py-2.5 rounded-xl bg-gray-200 text-gray-700 dark:bg-neutral-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-300 dark:hover:bg-neutral-600 transition-all"
                                >
                                    Voltar
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowCancelConfirm(true)}
                                className="px-5 py-2.5 rounded-xl border-2 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Cancelar Agendamento
                            </button>
                        )}
                    </div>
                )}

                {/* Botão Salvar - Esconde o botão se estiver no locked view para não causar confusão */}
                {!showLockedView && (
                    <div className="flex justify-end pt-6 gap-3">
                        {isRescheduling && (
                            <button
                                onClick={() => setIsRescheduling(false)}
                                className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 dark:bg-neutral-800 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-neutral-700 transition-all flex items-center justify-center min-w-[140px]"
                            >
                                Cancelar Reagendamento
                            </button>
                        )}
                        <button
                            onClick={handleSalvar}
                            disabled={salvando || !dataSelecionada || !horaSelecionada || agendamento.status === 'cancelado'}
                            className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {salvando ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Salvar Alterações</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
