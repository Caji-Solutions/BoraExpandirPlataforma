import React, { useState, useEffect, useCallback } from 'react'
import {
    FileCheck,
    FileX,
    Eye,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowLeft,
    Send,
    Clock,
    User,
    Mail,
    Phone,
    Package,
    Calendar,
    CreditCard,
    AlertCircle,
    RefreshCw,
    X
} from 'lucide-react'
import { catalogService, Service } from '../../adm/services/catalogService'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL

interface Comprovante {
    id: string
    tipo?: 'agendamento' | 'contrato' | 'parcela'
    metodo_pagamento?: string
    ids_grupo?: string[]
    nome: string
    email: string
    telefone: string
    produto_id: string
    produto_nome?: string
    valor?: number
    data_hora: string
    comprovante_url: string
    comprovante_upload_em: string
    pagamento_status: string
    pagamento_nota_recusa?: string
    status: string
    duracao_minutos: number
    tipo_comprovante?: 'agendamento' | 'traducao' | 'parcela_boleto'
    valor_tradutor?: number
    valor_plataforma?: number
    lucro?: number
    prazo_entrega?: string
    numero_parcela?: number
    quantidade_parcelas?: number
    data_vencimento?: string
    tradutor_nome?: string
    observacoes?: string
    docs_relacionados?: Array<{
        id: string
        documento_id: string
        nome: string
        valor: number
        observacoes?: string
    }>
}

type ActionState = 'idle' | 'aprovar' | 'recusar' | 'confirming_aprovar' | 'confirming_recusar' | 'loading'

const parseCurrencyValue = (value: unknown): number => {
    if (value === null || value === undefined) return 0

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0
    }

    if (typeof value !== 'string') return 0

    const compact = value.replace(/\s/g, '')
    let normalized = compact
    if (compact.includes('.') && compact.includes(',')) {
        normalized = compact.replace(/\./g, '').replace(',', '.')
    } else if (compact.includes(',') && !compact.includes('.')) {
        normalized = compact.replace(',', '.')
    }

    const match = normalized.match(/-?\d+(?:\.\d+)?/)
    if (!match) return 0

    const parsed = Number(match[0])
    return Number.isFinite(parsed) ? parsed : 0
}

const calculateContratoValor = (contrato: any): number => {
    const valorFinalDraft = parseCurrencyValue(contrato?.draft_dados?.valor_final)
    const valorComDesconto = parseCurrencyValue(contrato?.draft_dados?.valor_desconto)
    const valorTabela = parseCurrencyValue(contrato?.draft_dados?.valor_pavao)
    const valorServico = parseCurrencyValue(contrato?.servico_valor || contrato?.servico?.valor)
    const descontoConsultoriaDraft = parseCurrencyValue(contrato?.draft_dados?.valor_consultoria)
    const descontoConsultoriaPerfil = parseCurrencyValue(contrato?.cliente?.perfil_unificado?.data?.valor_desconto)
    const descontoConsultoria = descontoConsultoriaDraft || descontoConsultoriaPerfil

    if (valorFinalDraft > 0) {
        if (descontoConsultoria > 0 && valorComDesconto > 0 && Math.abs(valorFinalDraft - valorComDesconto) < 0.01) {
            return Math.max(valorComDesconto - descontoConsultoria, 0)
        }
        return valorFinalDraft
    }

    if (valorComDesconto > 0 && descontoConsultoria > 0) {
        return Math.max(valorComDesconto - descontoConsultoria, 0)
    }

    return valorComDesconto || valorTabela || valorServico || 0
}

export function ComprovantesPage() {
    const [comprovantes, setComprovantes] = useState<Comprovante[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [services, setServices] = useState<Service[]>([])

    // Estado de ação por item
    const [actionStates, setActionStates] = useState<Record<string, ActionState>>({})
    const [notaRecusa, setNotaRecusa] = useState<Record<string, string>>({})
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; type: 'success' | 'error'; msg: string } | null>(null)

    const fetchComprovantes = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const [agRes, contratoRes, parcelasRes] = await Promise.all([
                fetch(`${API_BASE_URL}/financeiro/comprovantes/pendentes`),
                fetch(`${API_BASE_URL}/financeiro/contratos/comprovantes/pendentes`),
                fetch(`${API_BASE_URL}/financeiro/parcelas/comprovantes/pendentes`)
            ])

            if (!agRes.ok) throw new Error('Erro ao buscar comprovantes')
            if (!contratoRes.ok) throw new Error('Erro ao buscar comprovantes de contrato')
            if (!parcelasRes.ok) throw new Error('Erro ao buscar comprovantes de parcelas')

            const agJson = await agRes.json()
            const contratoJson = await contratoRes.json()
            const parcelasJson = await parcelasRes.json()

            const agendamentos = (agJson.data || []).map((c: any) => ({
                ...c,
                tipo: 'agendamento'
            }))

            const contratos = (contratoJson.data || []).map((c: any) => ({
                id: c.id,
                tipo: 'contrato',
                nome: c.cliente_nome || c.cliente?.nome || 'Sem nome',
                email: c.cliente_email || c.cliente?.email || '',
                telefone: c.cliente_telefone || c.cliente?.whatsapp || '',
                produto_id: c.servico_id || c.servico?.id || '',
                produto_nome: c.servico_nome || c.servico?.nome || 'Serviço',
                valor: calculateContratoValor(c),
                data_hora: c.criado_em || c.created_at || '',
                comprovante_url: c.pagamento_comprovante_url,
                comprovante_upload_em: c.pagamento_comprovante_upload_em,
                pagamento_status: c.pagamento_status,
                status: 'contrato',
                duracao_minutos: 0,
                tipo_comprovante: 'agendamento',
                draft_dados: c.draft_dados,
                cliente: c.cliente
            }))

            const parcelas = (parcelasJson.data || []).map((p: any) => ({
                id: p.id,
                tipo: 'parcela',
                nome: p.pagador_nome || 'Sem nome',
                email: '',
                telefone: '',
                produto_id: p.origem_id || '',
                produto_nome: p.servico_nome || 'Parcela Boleto',
                valor: Number(p.valor || 0),
                data_hora: p.data_vencimento,
                comprovante_url: p.comprovante_url,
                comprovante_upload_em: p.comprovante_upload_em,
                pagamento_status: p.status,
                pagamento_nota_recusa: p.nota_recusa || null,
                status: p.status,
                duracao_minutos: 0,
                tipo_comprovante: 'parcela_boleto',
                numero_parcela: p.numero_parcela,
                quantidade_parcelas: p.quantidade_parcelas,
                data_vencimento: p.data_vencimento
            }))

            setComprovantes([...agendamentos, ...contratos, ...parcelas])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const loadServices = async () => {
            try {
                const data = await catalogService.getCatalogServices()
                setServices(data)
            } catch (err) {
                console.error('Erro ao carregar servicos', err)
            }
        }
        loadServices()
        fetchComprovantes()
    }, [fetchComprovantes])

    const getServiceName = (produtoId: string, produtoNome?: string) => {
        if (produtoNome && produtoNome.trim() !== '') return produtoNome
        const service = services.find(s => s.id === produtoId)
        return service ? service.name : produtoId
    }

    const setAction = (id: string, state: ActionState) => {
        setActionStates(prev => ({ ...prev, [id]: state }))
    }

    const handleAprovar = async (id: string, tipo: 'agendamento' | 'contrato' = 'agendamento') => {
        try {
            setAction(id, 'loading')
            const item = comprovantes.find(c => c.id === id)
            const isTraducao = item?.tipo_comprovante === 'traducao'
            const isContrato = item?.tipo === 'contrato'
            const isParcela = item?.tipo === 'parcela'
            const endpoint = isTraducao
                ? `${API_BASE_URL}/financeiro/traducao/comprovante/${id}/aprovar`
                : isContrato
                    ? `${API_BASE_URL}/financeiro/contratos/comprovante/${id}/aprovar`
                    : isParcela
                        ? `${API_BASE_URL}/financeiro/parcelas/comprovante/${id}/aprovar`
                        : `${API_BASE_URL}/financeiro/comprovante/${id}/aprovar`

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids_grupo: item?.ids_grupo
                })
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.message || 'Erro ao aprovar')

            setFeedbackMsg({ id, type: 'success', msg: 'Comprovante aprovado com sucesso!' })
            // Remove da lista após um breve delay
            setTimeout(() => {
                setComprovantes(prev => prev.filter(c => c.id !== id))
                setFeedbackMsg(null)
            }, 1500)
        } catch (err: any) {
            setFeedbackMsg({ id, type: 'error', msg: err.message })
            setAction(id, 'idle')
        }
    }

    const handleRecusar = async (id: string, tipo: 'agendamento' | 'contrato' = 'agendamento') => {
        const nota = notaRecusa[id] || ''
        if (!nota.trim()) {
            setFeedbackMsg({ id, type: 'error', msg: 'Escreva uma nota antes de recusar.' })
            return
        }

        try {
            setAction(id, 'loading')
            const item = comprovantes.find(c => c.id === id)
            const isTraducao = item?.tipo_comprovante === 'traducao'
            const isContrato = item?.tipo === 'contrato'
            const isParcela = item?.tipo === 'parcela'
            const endpoint = isTraducao
                ? `${API_BASE_URL}/financeiro/traducao/comprovante/${id}/recusar`
                : isContrato
                    ? `${API_BASE_URL}/financeiro/contratos/comprovante/${id}/recusar`
                    : isParcela
                        ? `${API_BASE_URL}/financeiro/parcelas/comprovante/${id}/recusar`
                        : `${API_BASE_URL}/financeiro/comprovante/${id}/recusar`

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nota,
                    ids_grupo: item?.ids_grupo
                })
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.message || 'Erro ao recusar')

            setFeedbackMsg({ id, type: 'success', msg: 'Comprovante recusado. Nota registrada.' })
            setTimeout(() => {
                setComprovantes(prev => prev.filter(c => c.id !== id))
                setFeedbackMsg(null)
            }, 1500)
        } catch (err: any) {
            setFeedbackMsg({ id, type: 'error', msg: err.message })
            setAction(id, 'idle')
        }
    }

    const formatDate = (d: string) => {
        try {
            return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        } catch { return d }
    }

    const formatDateTime = (d: string) => {
        try {
            const dt = new Date(d)
            return `${dt.toLocaleDateString('pt-BR')} às ${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        } catch { return d }
    }

    const formatCurrency = (v?: number) => {
        if (!v) return '—'
        return `R$ ${Number(v).toFixed(2)}`
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold font-outfit text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <FileCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        Comprovantes de Pagamento
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-[52px]">
                        Verifique e aprove/recuse os comprovantes enviados pelo comercial.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Badge de pendentes */}
                    {comprovantes.length > 0 && (
                        <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {comprovantes.length} pendente{comprovantes.length !== 1 ? 's' : ''}
                        </span>
                    )}
                    <button
                        onClick={fetchComprovantes}
                        className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-gray-500 dark:text-gray-400"
                        title="Atualizar"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            {/* Empty state */}
            {comprovantes.length === 0 && !error && (
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tudo em dia!</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Não há comprovantes pendentes de verificação no momento.
                    </p>
                </div>
            )}

            {/* List */}
            <div className="space-y-4">
                {comprovantes.map((c) => {
                    const actionState = actionStates[c.id] || 'idle'
                    const feedback = feedbackMsg?.id === c.id ? feedbackMsg : null

                    return (
                        <div
                            key={c.id}
                            className={`bg-white dark:bg-neutral-900 rounded-2xl border shadow-sm transition-all duration-300 ${feedback?.type === 'success'
                                ? 'border-emerald-300 dark:border-emerald-700 opacity-60 scale-[0.98]'
                                : 'border-gray-100 dark:border-neutral-800'
                                }`}
                        >
                            {/* Card header */}
                            <div className="p-5 pb-4">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    {/* Info do lead */}
                                    <div className="flex items-start gap-4 min-w-0 flex-1">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                                {c.nome || 'Sem nome'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email || '—'}</span>
                                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.telefone || '—'}</span>
                                                <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {getServiceName(c.produto_id, c.produto_nome) || '—'}</span>
                                                <span className="flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {c.tipo === 'contrato' ? 'Contrato' : c.tipo === 'parcela' ? 'Parcela Boleto' : 'Agendamento'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {c.tipo_comprovante === 'traducao'
                                                        ? 'Tradução'
                                                        : c.tipo_comprovante === 'parcela_boleto'
                                                            ? `Parcela ${c.numero_parcela}/${c.quantidade_parcelas}`
                                                            : c.tipo === 'contrato'
                                                                ? 'Contrato'
                                                                : 'Agendamento'}
                                                </span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateTime(c.data_hora)}</span>
                                                {c.data_vencimento && (
                                                    <span className="flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3" />
                                                        Vencimento: {formatDate(c.data_vencimento)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Valor + data upload */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="flex flex-col items-end">
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(c.valor)}</p>
                                            {c.ids_grupo && c.ids_grupo.length > 1 && (
                                                <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase mt-1">
                                                    Pagamento em Lote ({c.ids_grupo.length} itens)
                                                </span>
                                            )}
                                            {c.tipo === 'contrato' && (
                                                <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase mt-1">
                                                    Contrato (Fixo)
                                                </span>
                                            )}
                                            {c.metodo_pagamento === 'wise' && (
                                                <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase mt-1">
                                                    Wise
                                                </span>
                                            )}
                                            {c.metodo_pagamento === 'cartao' && (
                                                <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase mt-1">
                                                    Cartão
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-end">
                                            <CreditCard className="w-3 h-3" />
                                            Enviado em {formatDate(c.comprovante_upload_em)}
                                        </p>
                                        {c.tipo_comprovante === 'traducao' && c.lucro !== undefined && (
                                            <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider">
                                                Lucro Estimado: {formatCurrency(c.lucro)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Detalhes Extras para Tradução e Apostila */}
                                {c.tipo_comprovante === 'traducao' && (
                                    <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-700/50 animate-in fade-in duration-300">
                                        {c.docs_relacionados && c.docs_relacionados.length > 0 ? (
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-200 dark:border-neutral-700 pb-1">Documentos Pagos Neste Comprovante</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {c.docs_relacionados.map((doc: { id: string; documento_id: string; nome: string; valor: number; observacoes?: string; }) => (
                                                        <div key={doc.id} className="flex items-center justify-between bg-white dark:bg-neutral-900 p-2 rounded-lg border border-gray-100 dark:border-neutral-800">
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{doc.nome}</p>
                                                                <p className="text-[10px] text-gray-500 italic">{doc.observacoes || 'Sem observações'}</p>
                                                            </div>
                                                            <p className="text-xs font-bold text-gray-900 dark:text-white ml-2">{formatCurrency(doc.valor)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Tradutor(a)</p>
                                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                                                        <User className="w-3.5 h-3.5 text-indigo-500" />
                                                        {c.tradutor_nome || 'Não definido'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Custo Tradutor</p>
                                                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                                        {formatCurrency(c.valor_tradutor)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Valor Plataforma</p>
                                                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                        {formatCurrency(c.valor_plataforma)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Prazo de Entrega</p>
                                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                                                        {formatDate(c.prazo_entrega || '')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {c.observacoes && !c.docs_relacionados && (
                                            <div className="col-span-full border-t border-gray-100 dark:border-neutral-700/50 pt-2 mt-1">
                                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Observações do Orçamento</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                                                    "{c.observacoes}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 dark:border-neutral-800" />

                            {/* Actions area */}
                            <div className="p-5 pt-4">
                                {/* Feedback message */}
                                {feedback && (
                                    <div className={`mb-3 p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${feedback.type === 'success'
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                        }`}>
                                        {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {feedback.msg}
                                    </div>
                                )}

                                {/* State: idle — show Ver / Aprovar / Recusar */}
                                {actionState === 'idle' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPreviewUrl(c.comprovante_url)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
                                        >
                                            <Eye className="w-4 h-4" /> Ver Comprovante
                                        </button>
                                        <button
                                            onClick={() => setAction(c.id, 'confirming_aprovar')}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Aprovar {c.ids_grupo && c.ids_grupo.length > 1 ? 'Lote' : ''}
                                        </button>
                                        <button
                                            onClick={() => setAction(c.id, 'confirming_recusar')}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/20 transition"
                                        >
                                            <XCircle className="w-4 h-4" /> Recusar {c.ids_grupo && c.ids_grupo.length > 1 ? 'Lote' : ''}
                                        </button>
                                    </div>
                                )}

                                {/* State: confirming_aprovar — Confirmar ou Voltar */}
                                {actionState === 'confirming_aprovar' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setAction(c.id, 'idle')}
                                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleAprovar(c.id, c.tipo || 'agendamento')}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/30 transition animate-in fade-in duration-200"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Confirmar Aprovação {c.ids_grupo && c.ids_grupo.length > 1 ? 'do Lote' : ''}
                                        </button>
                                    </div>
                                )}

                                {/* State: confirming_recusar — Nota + Enviar ou Voltar */}
                                {actionState === 'confirming_recusar' && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <textarea
                                            placeholder="Escreva o motivo da recusa..."
                                            value={notaRecusa[c.id] || ''}
                                            onChange={e => setNotaRecusa(prev => ({ ...prev, [c.id]: e.target.value }))}
                                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition resize-none"
                                            rows={3}
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setAction(c.id, 'idle')
                                                    setNotaRecusa(prev => ({ ...prev, [c.id]: '' }))
                                                }}
                                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRecusar(c.id, c.tipo || 'agendamento')}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/30 transition"
                                            >
                                                <Send className="w-4 h-4" /> Enviar Recusa {c.ids_grupo && c.ids_grupo.length > 1 ? 'do Lote' : ''}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* State: loading */}
                                {actionState === 'loading' && (
                                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                                        Processando... {c.ids_grupo && c.ids_grupo.length > 1 ? 'Lote de pagamentos' : ''}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
                    <div
                        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-neutral-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Eye className="w-5 h-5 text-emerald-600" /> Visualizar Comprovante
                            </h3>
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-gray-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 flex items-center justify-center min-h-[400px] max-h-[70vh] overflow-auto">
                            {previewUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-[65vh] rounded-lg border border-gray-200 dark:border-neutral-700"
                                    title="Comprovante PDF"
                                />
                            ) : (
                                <img
                                    src={previewUrl}
                                    alt="Comprovante de pagamento"
                                    className="max-w-full max-h-[65vh] rounded-lg shadow-md object-contain"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


