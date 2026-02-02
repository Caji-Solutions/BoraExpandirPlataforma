import React, { useState } from 'react'
import {
    User,
    FileText,
    History,
    Briefcase,
    Calendar,
    Copy,
    Check,
    ExternalLink,
    Phone,
    Mail,
    MapPin,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Search,
    ClipboardList,
    FolderOpen,
    Plane,
    CheckSquare,
    Flag,
    XCircle,
    Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Tipos
export type ClientDNAData = {
    id: string
    nome: string
    email?: string
    telefone?: string
    endereco?: string
    tipoAssessoria: string
    contratoAtivo: boolean
    dataContrato?: string
    previsaoChegada?: string
    faseAtual?: string
    categoria: string
    historico?: {
        data: string
        evento: string
        responsavel?: string
        tipo?: 'info' | 'success' | 'warning' | 'error'
    }[]
}

type DNACategory = {
    id: string
    label: string
    icon: React.ReactNode
    color: string
    count: number
}

// Mock data - clientes por categoria
const mockClientes: ClientDNAData[] = [
    {
        id: 'CLI-001', nome: 'João Silva', email: 'joao@email.com', telefone: '+55 11 98765-4321',
        tipoAssessoria: 'Visto D7', contratoAtivo: true, dataContrato: '15/01/2024',
        previsaoChegada: '15/03/2025', faseAtual: 'Análise Documental', categoria: 'assessoria_andamento',
        historico: [{ data: '31/01/2026', evento: 'Documentos enviados', responsavel: 'Maria', tipo: 'info' }]
    },
    {
        id: 'CLI-002', nome: 'Maria Santos', email: 'maria@email.com', telefone: '+55 21 99876-5432',
        tipoAssessoria: 'Golden Visa', contratoAtivo: true, dataContrato: '10/01/2024',
        previsaoChegada: '20/04/2025', faseAtual: 'Aguardando Documentos', categoria: 'aguardando_assessoria',
        historico: [{ data: '28/01/2026', evento: 'Contrato assinado', responsavel: 'Sistema', tipo: 'success' }]
    },
    {
        id: 'CLI-003', nome: 'Carlos Oliveira', email: 'carlos@email.com', telefone: '+55 31 97654-3210',
        tipoAssessoria: 'Consultoria', contratoAtivo: false, categoria: 'aguardando_consultoria',
        historico: [{ data: '25/01/2026', evento: 'Agendou consultoria', responsavel: 'Ana', tipo: 'info' }]
    },
    {
        id: 'CLI-004', nome: 'Ana Costa', email: 'ana@email.com', telefone: '+55 41 96543-2109',
        tipoAssessoria: 'Visto D7', contratoAtivo: true, dataContrato: '05/12/2023',
        previsaoChegada: '10/02/2025', faseAtual: 'Visto Aprovado', categoria: 'assessoria_finalizada',
        historico: [{ data: '20/01/2026', evento: 'Processo finalizado', responsavel: 'Sistema', tipo: 'success' }]
    },
    {
        id: 'CLI-005', nome: 'Pedro Almeida', email: 'pedro@email.com', telefone: '+55 51 95432-1098',
        tipoAssessoria: 'Visto D7', contratoAtivo: false, categoria: 'cancelado',
        historico: [{ data: '15/01/2026', evento: 'Cliente desistiu', responsavel: 'Admin', tipo: 'error' }]
    },
    {
        id: 'CLI-006', nome: 'Fernanda Lima', email: 'fernanda@email.com', telefone: '+55 11 94321-0987',
        tipoAssessoria: 'Formulário Imigração', contratoAtivo: false, categoria: 'formularios',
        historico: [{ data: '30/01/2026', evento: 'Formulário enviado', responsavel: 'Sistema', tipo: 'info' }]
    },
    {
        id: 'CLI-007', nome: 'Roberto Souza', email: 'roberto@email.com', telefone: '+55 21 93210-9876',
        tipoAssessoria: 'C2', contratoAtivo: true, dataContrato: '20/01/2024', categoria: 'clientes_c2',
        historico: [{ data: '29/01/2026', evento: 'Processo iniciado', responsavel: 'Carlos', tipo: 'info' }]
    },
    {
        id: 'CLI-008', nome: 'Juliana Ferreira', email: 'juliana@email.com', telefone: '+55 31 92109-8765',
        tipoAssessoria: 'Visto D7', contratoAtivo: true, dataContrato: '12/01/2024',
        faseAtual: 'Coleta de Documentos', categoria: 'assessoria_andamento',
        historico: [{ data: '27/01/2026', evento: 'Documentos pendentes', responsavel: 'Maria', tipo: 'warning' }]
    },
]

// Categorias do DNA
const dnaCategories: DNACategory[] = [
    {
        id: 'formularios',
        label: '1-Formulários Consultoria Imigração',
        icon: <ClipboardList className="h-6 w-6" />,
        color: 'bg-gray-500',
        count: mockClientes.filter(c => c.categoria === 'formularios').length
    },
    {
        id: 'aguardando_consultoria',
        label: '2-CRM de Clientes Aguardando Consultoria',
        icon: <FolderOpen className="h-6 w-6" />,
        color: 'bg-amber-600',
        count: mockClientes.filter(c => c.categoria === 'aguardando_consultoria').length
    },
    {
        id: 'clientes_c2',
        label: '3- CRM Clientes C2',
        icon: <ClipboardList className="h-6 w-6" />,
        color: 'bg-slate-600',
        count: mockClientes.filter(c => c.categoria === 'clientes_c2').length
    },
    {
        id: 'aguardando_assessoria',
        label: '4-CRM Clientes Aguardando Assessoria',
        icon: <CheckSquare className="h-6 w-6 text-green-500" />,
        color: 'bg-green-600',
        count: mockClientes.filter(c => c.categoria === 'aguardando_assessoria').length
    },
    {
        id: 'assessoria_andamento',
        label: '5-CRM de Clientes Assessoria em Andamento',
        icon: <Plane className="h-6 w-6 text-blue-500" />,
        color: 'bg-blue-600',
        count: mockClientes.filter(c => c.categoria === 'assessoria_andamento').length
    },
    {
        id: 'assessoria_finalizada',
        label: '6- CRM de Clientes Assessorias Finalizadas',
        icon: <Flag className="h-6 w-6" />,
        color: 'bg-slate-700',
        count: mockClientes.filter(c => c.categoria === 'assessoria_finalizada').length
    },
    {
        id: 'cancelado',
        label: '7-CRM de Clientes Cancelados/Desistiu',
        icon: <XCircle className="h-6 w-6 text-red-500" />,
        color: 'bg-red-600',
        count: mockClientes.filter(c => c.categoria === 'cancelado').length
    },
]

/**
 * Tela inicial - Categorias/Filtros do DNA
 */
function DNACategoriesView({ onSelectCategory }: { onSelectCategory: (categoryId: string) => void }) {
    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">DNA do Cliente</h1>
                    <p className="text-muted-foreground mt-1">Selecione uma categoria para visualizar os clientes</p>
                </div>

                <div className="space-y-3">
                    {dnaCategories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => onSelectCategory(category.id)}
                            className="w-full flex items-center gap-4 p-4 bg-card hover:bg-muted/50 border border-border rounded-xl transition-all hover:shadow-md group"
                        >
                            <div className={cn(
                                'h-12 w-12 rounded-lg flex items-center justify-center shrink-0',
                                'bg-muted/50 group-hover:bg-muted'
                            )}>
                                {category.icon}
                            </div>
                            <span className="flex-1 text-left text-lg font-medium text-foreground">
                                {category.label}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                                    {category.count}
                                </span>
                                <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * Lista de clientes filtrada por categoria
 */
function DNAClientListView({
    categoryId,
    onBack,
    onSelectClient
}: {
    categoryId: string
    onBack: () => void
    onSelectClient: (client: ClientDNAData) => void
}) {
    const [searchTerm, setSearchTerm] = useState('')

    const category = dnaCategories.find(c => c.id === categoryId)
    const clientes = mockClientes.filter(c => c.categoria === categoryId)

    const filteredClientes = clientes.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-muted rounded-lg transition"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-foreground">{category?.label}</h1>
                        <p className="text-muted-foreground">{clientes.length} clientes encontrados</p>
                    </div>
                </div>

                {/* Busca */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>

                {/* Lista de clientes */}
                {filteredClientes.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center">
                        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-muted-foreground">Nenhum cliente encontrado nesta categoria</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredClientes.map((cliente) => (
                            <button
                                key={cliente.id}
                                onClick={() => onSelectClient(cliente)}
                                className="w-full flex items-center gap-4 p-4 bg-card hover:bg-muted/50 border border-border rounded-xl transition-all hover:shadow-md group text-left"
                            >
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-foreground">{cliente.nome}</div>
                                    <div className="text-sm text-muted-foreground truncate">{cliente.email}</div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-sm font-mono text-muted-foreground">{cliente.id}</div>
                                    <div className={cn(
                                        'text-xs px-2 py-0.5 rounded-full inline-block mt-1',
                                        cliente.contratoAtivo
                                            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400'
                                    )}>
                                        {cliente.contratoAtivo ? 'Ativo' : 'Inativo'}
                                    </div>
                                </div>
                                <ArrowLeft className="h-5 w-5 text-muted-foreground rotate-180 group-hover:translate-x-1 transition-transform shrink-0" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Detalhes do cliente
 */
function DNAClientDetailView({
    client,
    onBack
}: {
    client: ClientDNAData
    onBack: () => void
}) {
    const [copiedId, setCopiedId] = useState(false)

    const handleCopyId = async () => {
        await navigator.clipboard.writeText(client.id)
        setCopiedId(true)
        setTimeout(() => setCopiedId(false), 2000)
    }

    const getEventIcon = (tipo?: string) => {
        switch (tipo) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />
            case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
            default: return <Clock className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <div className="p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-muted rounded-lg transition"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">DNA do Cliente</h1>
                            <p className="text-muted-foreground mt-1">Informações completas</p>
                        </div>
                    </div>
                    <div className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium',
                        client.contratoAtivo
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    )}>
                        {client.contratoAtivo ? '● Contrato Ativo' : '● Contrato Inativo'}
                    </div>
                </div>

                {/* Main Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Card Principal - Dados do Cliente */}
                    <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-2xl font-bold text-foreground">{client.nome}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <code className="text-sm bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
                                        {client.id}
                                    </code>
                                    <button
                                        onClick={handleCopyId}
                                        className="p-1 hover:bg-muted rounded transition"
                                        title="Copiar ID"
                                    >
                                        {copiedId ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {client.email && (
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wide">E-mail</div>
                                        <div className="text-sm font-medium text-foreground">{client.email}</div>
                                    </div>
                                </div>
                            )}

                            {client.telefone && (
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Telefone</div>
                                        <div className="text-sm font-medium text-foreground">{client.telefone}</div>
                                    </div>
                                </div>
                            )}

                            {client.endereco && (
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg md:col-span-2">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wide">Endereço</div>
                                        <div className="text-sm font-medium text-foreground">{client.endereco}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card Lateral - Informações do Contrato */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Contrato
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tipo de Assessoria</div>
                                <div className="text-sm font-semibold text-primary">{client.tipoAssessoria}</div>
                            </div>

                            {client.dataContrato && (
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Data do Contrato</div>
                                    <div className="text-sm font-medium text-foreground">{client.dataContrato}</div>
                                </div>
                            )}

                            {client.faseAtual && (
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Fase Atual</div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-full text-sm font-medium">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        {client.faseAtual}
                                    </div>
                                </div>
                            )}

                            <button className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-lg transition group">
                                <span className="text-sm font-medium text-foreground">Ver Contrato Completo</span>
                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Card Previsão de Chegada */}
                {client.previsaoChegada && (
                    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Previsão de Chegada</div>
                                    <div className="text-2xl font-bold text-primary">{client.previsaoChegada}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Histórico */}
                {client.historico && client.historico.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
                            <History className="h-5 w-5 text-primary" />
                            Histórico do Cliente
                        </h3>

                        <div className="relative">
                            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />

                            <div className="space-y-4">
                                {client.historico.map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="relative z-10 h-10 w-10 rounded-full bg-card border-2 border-border flex items-center justify-center shrink-0">
                                            {getEventIcon(item.tipo)}
                                        </div>
                                        <div className="flex-1 bg-muted/30 rounded-lg p-4 -mt-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="font-medium text-foreground">{item.evento}</div>
                                                    {item.responsavel && (
                                                        <div className="text-sm text-muted-foreground mt-0.5">
                                                            por {item.responsavel}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground whitespace-nowrap">
                                                    {item.data}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Componente principal - DNA do Cliente
 * Gerencia a navegação entre: Categorias -> Lista -> Detalhes
 */
type DNAView = 'categories' | 'list' | 'detail'

export function ClientDNAPage() {
    const [view, setView] = useState<DNAView>('categories')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedClient, setSelectedClient] = useState<ClientDNAData | null>(null)

    const handleSelectCategory = (categoryId: string) => {
        setSelectedCategory(categoryId)
        setView('list')
    }

    const handleSelectClient = (client: ClientDNAData) => {
        setSelectedClient(client)
        setView('detail')
    }

    const handleBackToCategories = () => {
        setSelectedCategory(null)
        setView('categories')
    }

    const handleBackToList = () => {
        setSelectedClient(null)
        setView('list')
    }

    switch (view) {
        case 'categories':
            return <DNACategoriesView onSelectCategory={handleSelectCategory} />
        case 'list':
            return (
                <DNAClientListView
                    categoryId={selectedCategory!}
                    onBack={handleBackToCategories}
                    onSelectClient={handleSelectClient}
                />
            )
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
