import { useState, useMemo, useEffect } from 'react'
import {
    User,
    Clock,
    AlertCircle,
    ArrowLeft,
    Search,
    Users,
    ChevronLeft,
    ChevronRight,
    Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from './Badge'
import { ClientDNAData, CATEGORIAS_LIST, formatDate } from './ClientDNA'
import juridicoService, { type FuncionarioJuridico } from '../../modules/juridico/services/juridicoService'
import { useAuth } from '../../contexts/AuthContext'

export function DNAClientListView({
    clientes,
    onSelectClient
}: {
    clientes: ClientDNAData[]
    onSelectClient: (client: ClientDNAData) => void
}) {
    const { activeProfile } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [equipe, setEquipe] = useState<FuncionarioJuridico[]>([])
    const [filters, setFilters] = useState({
        id: '',
        nome: '',
        tipoServico: '',
        status: 'todos' as 'todos' | 'ativo' | 'inativo',
        prioridade: 'todos' as 'todos' | 'high' | 'medium' | 'low',
        prazos: 'todos' as 'todos' | 'critico' | 'normal',
        requerimento: 'todos' as 'todos' | 'sim' | 'nao',
        responsavel: 'todos'
    })

    // Carregar equipe jurídica para o filtro
    useEffect(() => {
        const fetchEquipe = async () => {
            try {
                const membros = await juridicoService.getFuncionariosJuridico()
                setEquipe(membros)
            } catch (err) {
                console.error("Erro ao carregar equipe para filtros:", err)
            }
        }
        fetchEquipe()
    }, [])

    const serviceTypes = useMemo(() => Array.from(new Set(clientes.map(c => c.tipoAssessoria))), [clientes])

    const highPriorityClients = useMemo(() => clientes.filter(c => 
        c.priority === 'high' || 
        (c.deadline && new Date(c.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    ), [clientes])

    const filteredClientes = useMemo(() => {
        const filtered = clientes.filter(c => {
            const matchesSearch = 
                c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.id.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesId = !filters.id || c.id.toLowerCase().includes(filters.id.toLowerCase())
            const matchesNome = !filters.nome || c.nome.toLowerCase().includes(filters.nome.toLowerCase())
            const matchesServico = filters.tipoServico === '' || c.tipoAssessoria === filters.tipoServico
            const matchesStatus = filters.status === 'todos' || (filters.status === 'ativo' ? c.contratoAtivo : !c.contratoAtivo)
            const matchesPriority = filters.prioridade === 'todos' || c.priority === filters.prioridade
            const matchesRequerimento = filters.requerimento === 'todos' || (filters.requerimento === 'sim' ? c.hasRequirement : !c.hasRequirement)
            
            // Filtro de Responsável
            let matchesResponsavel = true
            if (filters.responsavel !== 'todos') {
                if (filters.responsavel === 'meus') {
                    matchesResponsavel = c.responsavel?.id === activeProfile?.id
                } else if (filters.responsavel === 'vagos') {
                    matchesResponsavel = !c.responsavel
                } else {
                    matchesResponsavel = c.responsavel?.id === filters.responsavel
                }
            }
            
            let matchesPrazo = true
            if (filters.prazos === 'critico') {
                matchesPrazo = !!(c.deadline && new Date(c.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
            }

            return matchesSearch && matchesId && matchesNome && matchesServico && matchesStatus && matchesPriority && matchesPrazo && matchesRequerimento && matchesResponsavel
        })

        // Ordenação automática por previsão de chegada (mais próximas primeiro)
        return filtered.sort((a, b) => {
            if (!a.previsaoChegada) return 1
            if (!b.previsaoChegada) return -1
            return new Date(a.previsaoChegada).getTime() - new Date(b.previsaoChegada).getTime()
        })
    }, [clientes, searchTerm, filters, activeProfile?.id])

    // Lógica de Paginação
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10
    const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE)
    
    const paginatedClientes = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredClientes.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredClientes, currentPage])

    // Helper para verificar urgência (< 7 dias)
    const isUrgent = (dateString?: string) => {
        if (!dateString) return false
        const arrivalDate = new Date(dateString)
        const diffTime = arrivalDate.getTime() - Date.now()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= 7
    }

    // Resetar para página 1 quando filtros mudarem
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filters])

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">DNA do Cliente</h1>
                        <p className="text-muted-foreground mt-1">Gestão centralizada e acompanhamento de etapas</p>
                    </div>
                </div>

                {/* Área de Filtros Seletores (Sempre Visível) */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">ID Cliente</label>
                            <input
                                value={filters.id}
                                onChange={e => setFilters(f => ({ ...f, id: e.target.value }))}
                                placeholder="Ex: 001"
                                className="w-full bg-muted/30 border border-border px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nome</label>
                            <input
                                value={filters.nome}
                                onChange={e => setFilters(f => ({ ...f, nome: e.target.value }))}
                                placeholder="Filtrar por nome..."
                                className="w-full bg-muted/30 border border-border px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Serviço</label>
                            <select
                                value={filters.tipoServico}
                                onChange={e => setFilters(f => ({ ...f, tipoServico: e.target.value }))}
                                className="w-full bg-muted/30 border border-border px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Todos os Serviços</option>
                                {serviceTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Status</label>
                            <select
                                value={filters.status}
                                onChange={e => setFilters(f => ({ ...f, status: e.target.value as any }))}
                                className="w-full bg-muted/30 border border-border px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                            >
                                <option value="todos">Todos os Status</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Prioridade</label>
                            <select
                                value={filters.prioridade}
                                onChange={e => setFilters(f => ({ ...f, prioridade: e.target.value as any }))}
                                className="w-full bg-muted/30 border border-border px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                            >
                                <option value="todos">Todas</option>
                                <option value="high">Alta</option>
                                <option value="medium">Média</option>
                                <option value="low">Baixa</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Requerimento</label>
                            <select
                                value={filters.requerimento}
                                onChange={e => setFilters(f => ({ ...f, requerimento: e.target.value as any }))}
                                className="w-full bg-muted/30 border border-border px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                            >
                                <option value="todos">Todos</option>
                                <option value="sim">Com Requerimento</option>
                                <option value="nao">Sem Requerimento</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Responsável</label>
                            <select
                                value={filters.responsavel}
                                onChange={e => setFilters(f => ({ ...f, responsavel: e.target.value }))}
                                className="w-full bg-muted/30 border border-border px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                            >
                                <option value="todos">Todos os Responsáveis</option>
                                <option value="meus">Meus Clientes</option>
                                <option value="vagos">Sem Responsável</option>
                                {equipe.map(membro => (
                                    <option key={membro.id} value={membro.id}>{membro.full_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Barra de Pesquisa Integrada abaixo dos seletores */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
                        <input
                            type="text"
                            placeholder="Busca rápida universal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border-2 border-transparent focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-inner text-base"
                        />
                        {(searchTerm || filters.id || filters.nome || filters.tipoServico !== '' || filters.status !== 'todos' || filters.prioridade !== 'todos' || filters.responsavel !== 'todos') && (
                            <button 
                                onClick={() => {
                                    setSearchTerm('')
                                    setFilters({ 
                                        id: '', 
                                        nome: '', 
                                        tipoServico: '', 
                                        status: 'todos', 
                                        prioridade: 'todos', 
                                        prazos: 'todos', 
                                        requerimento: 'todos',
                                        responsavel: 'todos'
                                    })
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:underline"
                            >
                                Limpar Busca
                            </button>
                        )}
                    </div>
                </div>
                {highPriorityClients.length > 0 && (
                    <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <h2 className="text-lg font-semibold text-red-900 dark:text-red-400">Destaques e Prazos Críticos</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {highPriorityClients.slice(0, 3).map(cliente => (
                                <button
                                    key={cliente.id}
                                    onClick={() => onSelectClient(cliente)}
                                    className="flex items-center gap-3 p-3 bg-card border border-red-200/50 dark:border-red-500/20 rounded-xl hover:shadow-md transition-all text-left group"
                                >
                                    <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                                        <Clock className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-foreground truncate">{cliente.nome}</div>
                                        <div className="text-[10px] text-red-600 font-medium uppercase tracking-wider">
                                            Vence: {formatDate(cliente.deadline)}
                                        </div>
                                    </div>
                                    <ArrowLeft className="h-4 w-4 text-red-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lista de clientes */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">
                        <div className="col-span-1">ID</div>
                        <div className="col-span-3 text-left">Cliente</div>
                        <div className="col-span-3">Serviço / Etapa</div>
                        <div className="col-span-2">Previsão</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-2">Ações</div>
                    </div>

                    {filteredClientes.length === 0 ? (
                        <div className="p-12 text-center text-center">
                            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-muted-foreground">Nenhum cliente encontrado com os critérios selecionados</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {paginatedClientes.map((cliente) => {
                                const urgent = isUrgent(cliente.previsaoChegada)
                                return (
                                    <div
                                        key={cliente.id}
                                        className={cn(
                                            "grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors",
                                            urgent ? "bg-red-50/70 hover:bg-red-100/70 dark:bg-red-500/10 dark:hover:bg-red-500/20" : "hover:bg-muted/30"
                                        )}
                                    >
                                        <div className="col-span-1 text-center">
                                            <span className="text-xs font-mono text-muted-foreground">{cliente.id.replace('CLI-', '')}</span>
                                        </div>
                                        <div className="col-span-3 flex items-center gap-3">
                                            <div className={cn(
                                                "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                                                urgent ? "bg-red-100 dark:bg-red-500/20" : "bg-primary/10"
                                            )}>
                                                <User className={cn("h-4 w-4", urgent ? "text-red-600 dark:text-red-400" : "text-primary")} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    {cliente.nome}
                                                    {cliente.priority === 'high' && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                                    )}
                                                    {cliente.hasRequirement && (
                                                        <Badge variant="destructive" className="animate-pulse text-[7px] px-1 py-0 h-3 leading-none min-w-[50px] flex items-center justify-center">
                                                            REQ
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">{cliente.email}</div>
                                                {cliente.responsavel && (
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Briefcase className="h-3 w-3 text-blue-500" />
                                                        <span className="text-[10px] font-medium text-blue-600">{cliente.responsavel.nome}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-center">
                                            <div className="text-xs font-medium text-foreground">{cliente.tipoAssessoria}</div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {CATEGORIAS_LIST.find(cat => cat.id === cliente.categoria)?.label.split('-')[1] || cliente.categoria}
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-center text-xs font-medium text-foreground">
                                            <div className="flex flex-col items-center gap-1">
                                                {formatDate(cliente.previsaoChegada)}
                                                {urgent && (
                                                    <span className="text-[10px] px-2 py-0.5 bg-red-600 text-white rounded-full font-black animate-pulse uppercase">
                                                        URGENTE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <span className={cn(
                                                'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
                                                cliente.contratoAtivo
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400'
                                            )}>
                                                {cliente.contratoAtivo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <button
                                                onClick={() => onSelectClient(cliente)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm",
                                                    urgent 
                                                        ? "bg-red-600 text-white hover:bg-red-700" 
                                                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                                                )}
                                            >
                                                Ver Detalhes
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                }</div>

                {/* Paginação */}
                {filteredClientes.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between bg-card border border-border px-6 py-4 rounded-2xl shadow-sm">
                        <div className="text-xs text-muted-foreground font-medium">
                            Mostrando <span className="text-foreground font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a <span className="text-foreground font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredClientes.length)}</span> de <span className="text-foreground font-bold">{filteredClientes.length}</span> clientes
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            "w-8 h-8 rounded-xl text-xs font-bold transition-all",
                                            currentPage === i + 1 
                                                ? "bg-primary text-primary-foreground shadow-sm" 
                                                : "hover:bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-border rounded-xl hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
