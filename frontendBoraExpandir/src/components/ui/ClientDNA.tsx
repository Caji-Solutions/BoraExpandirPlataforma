import React, { useState, useEffect, useCallback } from 'react'
import {
    AlertCircle,
    ClipboardList,
    FolderOpen,
    Plane,
    CheckSquare,
    Flag,
    XCircle,
} from 'lucide-react'
import { DNAClientListView } from './DNAClientListView'
import { DNAClientDetailView } from './DNAClientDetailView'

export type ClientNote = {
    id: string
    text: string
    author: string
    createdAt: string
    stageId?: string
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
    historico?: {
        data: string
        evento: string
        responsavel?: string
        tipo?: 'info' | 'success' | 'warning' | 'error'
    }[]
}

export type DNACategory = {
    id: string
    label: string
    icon: React.ReactNode
    color: string
    count: number
}

export const CATEGORIAS_LIST: Omit<DNACategory, 'count'>[] = [
    { id: 'formularios', label: '1-Formulários Consultoria Imigração', icon: <ClipboardList className="h-6 w-6" />, color: 'bg-gray-500' },
    { id: 'aguardando_consultoria', label: '2-CRM de Clientes Aguardando Consultoria', icon: <FolderOpen className="h-6 w-6" />, color: 'bg-amber-600' },
    { id: 'clientes_c2', label: '3- CRM Clientes C2', icon: <ClipboardList className="h-6 w-6" />, color: 'bg-slate-600' },
    { id: 'aguardando_assessoria', label: '4-CRM Clientes Aguardando Assessoria', icon: <CheckSquare className="h-6 w-6 text-green-500" />, color: 'bg-green-600' },
    { id: 'assessoria_andamento', label: '5-CRM de Clientes Assessoria em Andamento', icon: <Plane className="h-6 w-6 text-blue-500" />, color: 'bg-blue-600' },
    { id: 'assessoria_finalizada', label: '6- CRM de Clientes Assessorias Finalizadas', icon: <Flag className="h-6 w-6" />, color: 'bg-slate-700' },
    { id: 'cancelado', label: '7-CRM de Clientes Cancelados/Desistiu', icon: <XCircle className="h-6 w-6 text-red-500" />, color: 'bg-red-600' },
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
    const [view, setView] = useState<DNAView>('list')
    const [selectedClient, setSelectedClient] = useState<ClientDNAData | null>(null)
    const [clientes, setClientes] = useState<ClientDNAData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchClientes = useCallback(async () => {
        try {
            setLoading(true)
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
            const response = await fetch(`${baseUrl}/cliente/clientes`)
            const result = await response.json()

            if (result.data) {
                const LAWER_ID = '41f21e5c-dd93-4592-9470-e043badc3a18';
                
                const mappedClientes: ClientDNAData[] = result.data
                    .filter((item: any) => {
                        // Filtra apenas clientes que possuem processos atribuídos ao advogado logado
                        return item.processos && item.processos.some((p: any) => p.responsavel_id === LAWER_ID);
                    })
                    .map((item: any) => {
                        // Encontra o processo específico deste advogado (ou o primeiro caso tenha múltiplos)
                        const userProcess = item.processos.find((p: any) => p.responsavel_id === LAWER_ID) || item.processos[0];

                        return {
                            id: item.client_id || item.id,
                            true_id: item.id,
                            processo_id: userProcess?.id,
                            nome: item.nome || 'Sem nome',
                            email: item.email || 'Sem e-mail',
                            telefone: item.whatsapp || '',
                            tipoAssessoria: userProcess?.tipo_servico || 'Assessoria',
                            contratoAtivo: item.status !== 'cancelado',
                            categoria: userProcess?.status || item.stage || (item.status === 'cadastrado' ? 'assessoria_andamento' : (item.status || 'formularios')),
                            previsaoChegada: item.previsao_chegada || '',
                            priority: 'medium',
                            notes: [],
                            historico: []
                        }
                    })
                setClientes(mappedClientes)
            }
            setError(null)
        } catch (err) {
            console.error('Erro ao buscar clientes:', err)
            setError('Falha ao carregar lista de clientes.')
        } finally {
            setLoading(false)
        }
    }, [])

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
                />
            )
    }
}

export default ClientDNAPage
