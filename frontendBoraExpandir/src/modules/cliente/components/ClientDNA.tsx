import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    AlertCircle,
    ClipboardList,
    Clock,
    FolderOpen,
    Plane,
    CheckSquare,
    Flag,
    XCircle,
} from 'lucide-react'
import { DNAClientListView } from '@/modules/cliente/components/DNAClientListView'
import { DNAClientDetailView } from '@/modules/cliente/components/DNAClientDetailView'
import { useAuth } from '@/contexts/AuthContext'

export type ClientNote = {
    id: string
    text: string
    author: string
    area: string
    createdAt: string
    stageId?: string
    autorId?: string
}

// ... (ClientDNAData remains same)

export type ClientDNAData = {
    id: string
    true_id?: string // UUID real do banco
    processo_id?: string // ID do processo atual
    nome: string
    email?: string
    telefone?: string
    endereco?: string
    tipoAssessoria: string
    contratoAtivo: boolean
    dataContrato?: string
    previsaoChegada?: string
    deadline?: string
    faseAtual?: string
    categoria: string
    priority: 'high' | 'medium' | 'low'
    notes?: ClientNote[]
    responsavel?: {
        id: string
        nome: string
    }
    historico?: {
        data: string
        evento: string
        responsavel?: string
        tipo?: 'info' | 'success' | 'warning' | 'error'
    }[]
    documento?: string
    passaporte?: string
    status?: string
    criador?: {
        id: string
        nome: string
    }
    perfil_unificado?: { data: Record<string, any>; metadata?: Record<string, any> }
    criado_em?: string
    hasActiveRequirement?: boolean
}

export type DNACategory = {
    id: string
    label: string
    icon: React.ReactNode
    color: string
    count: number
}

export const CATEGORIAS_LIST: Omit<DNACategory, 'count'>[] = [
    { id: 'formularios', label: 'Formularios Consultoria Imigracao', icon: <ClipboardList className="h-6 w-6" />, color: 'bg-gray-500' },
    { id: 'aguardando_consultoria', label: 'Aguardando consultoria', icon: <FolderOpen className="h-6 w-6" />, color: 'bg-amber-600' },
    { id: 'em_consultoria', label: 'Em Consultoria', icon: <Clock className="h-6 w-6 text-yellow-500" />, color: 'bg-yellow-500' },
    { id: 'clientes_c2', label: 'Pos Consultoria', icon: <ClipboardList className="h-6 w-6" />, color: 'bg-slate-600' },
    { id: 'aguardando_assessoria', label: 'Aguardando Assessoria', icon: <CheckSquare className="h-6 w-6 text-green-500" />, color: 'bg-green-600' },
    { id: 'assessoria_andamento', label: 'Assessoria em Andamento', icon: <Plane className="h-6 w-6 text-blue-500" />, color: 'bg-blue-600' },
    { id: 'assessoria_finalizada', label: 'Assessoria finalizada', icon: <Flag className="h-6 w-6" />, color: 'bg-slate-700' },
    { id: 'cancelado', label: 'Cancelou / Desistiu', icon: <XCircle className="h-6 w-6 text-red-500" />, color: 'bg-red-600' },
];

export const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '---'
    try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString
        return date.toLocaleDateString('pt-BR')
    } catch (e) {
        return dateString
    }
}

type DNAView = 'list' | 'detail'

export function ClientDNAPage() {
    const { activeProfile } = useAuth()
    const [searchParams] = useSearchParams()
    const queryClienteId = searchParams.get('clienteId')
    const queryTab = searchParams.get('tab') as 'timeline' | 'formularios' | 'contrato_comprovantes' | 'notas' | null
    const queryArea = searchParams.get('area') as 'todos' | 'juridico' | 'comercial' | 'administrativo' | null
    const [view, setView] = useState<DNAView>('list')
    const [selectedClient, setSelectedClient] = useState<ClientDNAData | null>(null)
    const [clientes, setClientes] = useState<ClientDNAData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchClientes = useCallback(async () => {
        if (!activeProfile?.id) return;

        try {
            setLoading(true)
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
            const token = localStorage.getItem('auth_token')
            const response = await fetch(`${baseUrl}/cliente/clientes`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            })
            const result = await response.json()
            console.log("clientes da lsitagem")
            console.log(result)
            

            if (result.data) {
                // const clientesReais = result.data.filter((item: any) => item.status !== 'LEAD')
                const mappedClientes: ClientDNAData[] = result.data.map((item: any) => {
                    // Encontra o processo mais recente para determinar o responsável e status
                    const lastProcess = item.processos?.[0]
                    const agendamentos = item.agendamentos || []
                    const contratos = item.contratos_servicos || []
                    const lastAgendamento = agendamentos.length > 0 ? agendamentos.reduce((latest: any, current: any) => new Date(latest.data_hora) > new Date(current.data_hora) ? latest : current) : null
                    const agendamentosPagos = agendamentos.filter((a: any) => a.pagamento_status === 'aprovado')
                    const firstPaidAgendamento = agendamentosPagos.length > 0
                        ? agendamentosPagos.reduce((earliest: any, current: any) => new Date(earliest.data_hora) < new Date(current.data_hora) ? earliest : current)
                        : null

                    // Contratos validos (nao cancelados/invalidos) - filtro relaxado para capturar nome do servico
                    const contratosValidos = contratos.filter((c: any) => {
                        const statusContrato = String(c?.status_contrato || '').toUpperCase()
                        return statusContrato !== 'INVALIDO' && statusContrato !== 'CANCELADO'
                    })

                    const firstContrato = contratosValidos.length > 0
                        ? contratosValidos.reduce((earliest: any, current: any) => new Date(earliest.criado_em) < new Date(current.criado_em) ? earliest : current)
                        : null

                    const servicoDoDna = String(item?.perfil_unificado?.data?.servico_inicial || '').trim()
                    const servicoDoContrato = String(firstContrato?.subservico_nome || firstContrato?.servico_nome || '').trim()
                    const servicoDoProcesso = String(lastProcess?.tipo_servico || '').trim()
                    const servicoDoAgendamento = String(firstPaidAgendamento?.produto_nome || lastAgendamento?.produto_nome || '').trim()
                    const processoEhConsultoria = /consultoria/i.test(servicoDoProcesso)
                    const agendamentoEhAssessoria = /assessoria|fixo|contrato|arraigo/i.test(servicoDoAgendamento)

                    // Prioridade: DNA > Contrato > Agendamento(se assessoria) > Processo(se nao consultoria) > Agendamento > fallback
                    let tipoAssessoria: string
                    if (servicoDoDna) {
                        tipoAssessoria = servicoDoDna
                    } else if (servicoDoContrato) {
                        tipoAssessoria = servicoDoContrato
                    } else if (agendamentoEhAssessoria && servicoDoAgendamento) {
                        tipoAssessoria = servicoDoAgendamento
                    } else if (servicoDoProcesso && !processoEhConsultoria) {
                        tipoAssessoria = servicoDoProcesso
                    } else if (servicoDoAgendamento) {
                        tipoAssessoria = servicoDoAgendamento
                    } else {
                        tipoAssessoria = 'Assessoria'
                    }

                    // Categoria: usar stage do banco; fallback inteligente baseado na presenca de contratos
                    const categoriaFallback = (() => {
                        if (item.stage) return item.stage
                        if (lastProcess?.status) return lastProcess.status
                        if (item.status === 'cadastrado') return 'assessoria_andamento'
                        if (item.status === 'cliente' || item.status === 'aguardando_assessoria') {
                            return contratosValidos.length > 0 ? 'aguardando_assessoria' : 'aguardando_consultoria'
                        }
                        return item.status || 'formularios'
                    })()

                    return {
                        id: item.client_id || item.id,
                        true_id: item.id,
                        processo_id: lastProcess?.id,
                        nome: item.nome || 'Sem nome',
                        email: item.email || 'Sem e-mail',
                        telefone: item.whatsapp || '',
                        tipoAssessoria,
                        contratoAtivo: true, // Padronizado para true para evitar quebras, mas não é mais usado na listagem
                        categoria: categoriaFallback,
                        previsaoChegada: item.previsao_chegada || '',
                        priority: 'medium',
                        notes: [],
                        responsavel: lastProcess?.responsavel ? {
                            id: lastProcess.responsavel.id,
                            nome: lastProcess.responsavel.full_name
                        } : undefined,
                        historico: [],
                        documento: item.documento || '',
                        passaporte: item.passaporte || '',
                        status: item.status,
                        criado_em: item.criado_em,
                        hasActiveRequirement: (item.requerimentos || []).some((r: any) => r.status === 'pendente'),
                        criador: item.criado_por ? {
                            id: item.criado_por,
                            nome: item.criado_por_nome || 'Desconhecido'
                        } : undefined,
                        perfil_unificado: item.perfil_unificado || undefined
                    }
                })
                setClientes(mappedClientes)
                if (queryClienteId) {
                    const found = mappedClientes.find(
                        c => c.true_id === queryClienteId || c.id === queryClienteId
                    )
                    if (found) {
                        setSelectedClient(found)
                        setView('detail')
                    }
                }
            }
            setError(null)
        } catch (err) {
            console.error('Erro ao buscar clientes:', err)
            setError('Falha ao carregar lista de clientes.')
        } finally {
            setLoading(false)
        }
    }, [activeProfile?.id, queryClienteId])

    useEffect(() => {
        fetchClientes()
    }, [fetchClientes])

    const handleSelectClient = (client: ClientDNAData) => {
        setSelectedClient(client)
        setView('detail')
    }

    const handleBackToList = () => {
        setSelectedClient(null)
        setView('list')
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Carregando DNA dos Clientes...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 text-center max-w-xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-900 mb-2">Ops! Algo deu errado</h2>
                    <p className="text-red-700 mb-6">{error}</p>
                    <button
                        onClick={fetchClientes}
                        className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-700 transition"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        )
    }

    switch (view) {
        case 'list':
            return <DNAClientListView clientes={clientes} onSelectClient={handleSelectClient} />
        case 'detail':
            return (
                <DNAClientDetailView
                    client={selectedClient!}
                    onBack={handleBackToList}
                    initialTab={queryTab || undefined}
                    initialArea={queryArea || undefined}
                />
            )
    }
}

export default ClientDNAPage
