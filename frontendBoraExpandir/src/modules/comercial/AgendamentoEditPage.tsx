import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Save, Loader2, Calendar, Clock, User, Mail, Phone, CreditCard, FileText, Package, X, AlertCircle } from 'lucide-react'
import { useToast } from '../../components/ui/Toast'
import { CalendarPicker } from '../../components/ui/CalendarPicker'
import { catalogService, Service } from '../adm/services/catalogService'

const HORARIOS_DISPONIVEIS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
]

interface ConflictPopup {
    agendamento: any
    horasOcupadas: string[]
    x: number
    y: number
}

function getDirectlyOccupiedSlots(ag: any, allSlots: string[], dateIso: string): string[] {
    const inicio = new Date(ag.data_hora)
    const fim = new Date(inicio.getTime() + (ag.duracao_minutos || 60) * 60000)

    return allSlots.filter(hora => {
        const slotTime = new Date(`${dateIso}T${hora}:00Z`)
        return slotTime >= inicio && slotTime < fim
    })
}

export function AgendamentoEditPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const toast = useToast()

    const [loading, setLoading] = useState(true)
    const [salvando, setSalvando] = useState(false)

    const [agendamento, setAgendamento] = useState<any>(null)
    const [produtos, setProdutos] = useState<Service[]>([])

    const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined)
    const [horaSelecionada, setHoraSelecionada] = useState<string>('')
    const [agendamentosDia, setAgendamentosDia] = useState<any[]>([])

    // Popup de conflito
    const [conflictPopup, setConflictPopup] = useState<ConflictPopup | null>(null)
    const popupRef = useRef<HTMLDivElement>(null)

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
                const prods = await catalogService.getCatalogServices()
                setProdutos(prods)

                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/comercial/agendamento/${id}`)
                if (!response.ok) throw new Error('Agendamento não encontrado')

                const data = await response.json()
                setAgendamento(data)

                if (data.data_hora) {
                    const dt = new Date(data.data_hora)
                    setDataSelecionada(new Date(dt.getTime() + dt.getTimezoneOffset() * 60000))
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
                console.error('Erro ao buscar ocupação do dia', e)
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

        const inicioNovo = new Date(`${dataIso}T${hora}:00Z`)
        const duracaoNovo = agendamento?.duracao_minutos || 60
        const fimNovo = new Date(inicioNovo.getTime() + duracaoNovo * 60000)

        return agendamentosDia.every((ag) => {
            if (ag.id === id) return true
            const inicioExistente = new Date(ag.data_hora)
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

        const inicioNovo = new Date(`${dataIso}T${hora}:00Z`)
        const duracaoNovo = agendamento?.duracao_minutos || 60
        const fimNovo = new Date(inicioNovo.getTime() + duracaoNovo * 60000)

        const conflito = agendamentosDia.find((ag) => {
            if (ag.id === id) return false
            const inicioExistente = new Date(ag.data_hora)
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

            const payload = {
                data_hora: `${isoDate}T${horaSelecionada}:00`
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

    const formatDataHora = (dataHora: string) => {
        try {
            const dt = new Date(dataHora)
            return `${dt.toLocaleDateString('pt-BR')} às ${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        } catch { return dataHora }
    }

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
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${agendamento.status === 'confirmado' || agendamento.status === 'aprovado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                agendamento.status === 'bloqueado' || agendamento.status === 'cancelado' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                }`}>
                                {agendamento.status}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${agendamento.comprovante_url
                                ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400'
                                }`}>
                                <CreditCard className="w-3 h-3" /> Pix {agendamento.comprovante_url ? '✓' : '—'}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400">
                                <FileText className="w-3 h-3" /> Form —
                            </span>
                        </div>
                    </div>
                </div>

                {/* ═══ CALENDÁRIO + HORÁRIOS (full-width) ═══ */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm relative">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                        Data e Horário
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Calendário */}
                        <div>
                            <CalendarPicker
                                selectedDate={dataSelecionada}
                                onDateSelect={setDataSelecionada}
                                minDate={new Date()}
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
                                                onClick={(e) => disponivel ? setHoraSelecionada(hora) : handleUnavailableSlotClick(e, hora)}
                                                className={`py-2.5 px-3 text-sm rounded-lg font-medium transition-all ${!disponivel
                                                    ? isDirectlyOccupied
                                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-2 border-red-400 dark:border-red-500 cursor-pointer ring-2 ring-red-300/50 dark:ring-red-500/30'
                                                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 border border-gray-200 dark:border-neutral-700 cursor-pointer opacity-60'
                                                    : horaSelecionada === hora
                                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 border-emerald-600'
                                                        : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:border-emerald-500 hover:text-emerald-600 border border-gray-200 dark:border-neutral-700'
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
                                        <p className="font-medium text-gray-900 dark:text-white">{formatDataHora(conflictPopup.agendamento.data_hora)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Duração</span>
                                        <p className="font-medium text-gray-900 dark:text-white">{conflictPopup.agendamento.duracao_minutos || 60} min</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Produto</span>
                                        <p className="font-medium text-gray-900 dark:text-white">{conflictPopup.agendamento.produto_nome || conflictPopup.agendamento.produto_id || '—'}</p>
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
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Criado por (ID)</span>
                                        <p className="font-medium text-gray-900 dark:text-white truncate text-xs">{conflictPopup.agendamento.usuario_id || '—'}</p>
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

                {/* Botão Salvar */}
                <div className="flex justify-end pt-6">
                    <button
                        onClick={handleSalvar}
                        disabled={salvando || !dataSelecionada || !horaSelecionada}
                        className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {salvando ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Salvar Alterações</>}
                    </button>
                </div>
            </div>
        </div>
    )
}
