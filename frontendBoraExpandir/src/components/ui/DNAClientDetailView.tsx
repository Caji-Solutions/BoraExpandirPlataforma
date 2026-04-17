import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    User,
    FileText,
    History,
    Copy,
    Check,
    ExternalLink,
    Phone,
    Mail,
    Clock,
    AlertCircle,
    ArrowLeft,
    ChevronDown,
    StickyNote,
    Trash2,
    ClipboardList,
    XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ClientDNAData, ClientNote, CATEGORIAS_LIST, formatDate } from './ClientDNA'
import { ProcessAction } from '../../modules/juridico/components/ProcessAction'
import { DocumentRequestModal } from '../../modules/juridico/components/DocumentRequestModal'
import { RequirementRequestModal } from '../../modules/juridico/components/RequirementRequestModal'
import { FormsDeclarationsSection } from '../../modules/juridico/components/FormsDeclarationsSection'
import { RequirementsSection } from '../../modules/juridico/components/RequirementsSection'
import { FormUploadModal } from '../../modules/juridico/components/FormUploadModal'
import { ApostilleQuoteModal } from '../../modules/cliente/components/services/ApostilleQuoteModal'
import { TranslationQuoteModal } from '../../modules/cliente/components/services/TranslationPaymentModal'
import { BillingNotificationModal } from '../../modules/juridico/components/BillingNotificationModal'
import juridicoService from '../../modules/juridico/services/juridicoService'
import comercialService from '../../modules/comercial/services/comercialService'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from '@/modules/shared/components/ui/sonner'
import { apiClient } from '@/modules/shared/services/api'

export function DNAClientDetailView({
    client,
    onBack,
    initialTab,
    initialArea
}: {
    client: ClientDNAData
    onBack: () => void
    initialTab?: 'timeline' | 'formularios' | 'contrato_comprovantes'
    initialArea?: 'todos' | 'juridico' | 'comercial' | 'administrativo'
}) {
    const queryClient = useQueryClient()
    const { activeProfile } = useAuth()
    const navigate = useNavigate()
    const [copiedId, setCopiedId] = useState(false)
    const [noteStageId, setNoteStageId] = useState<string | null>(null)
    const [newNote, setNewNote] = useState('')
    const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set([client.categoria]))
    const [isDocModalOpen, setIsDocModalOpen] = useState(false)
    const [isReqModalOpen, setIsReqModalOpen] = useState(false)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false)
    const [selectedRequerimentoId, setSelectedRequerimentoId] = useState<string | undefined>(undefined)
    const [areaFilter, setAreaFilter] = useState<'todos' | 'juridico' | 'comercial' | 'administrativo'>(initialArea || 'todos')

    console.log('[DNAClientDetailView] Mounted with:', { initialArea, initialTab, clientId: client.true_id || client.id, areaFilter: initialArea || 'todos' })
    const [activeTab, setActiveTab] = useState<'timeline' | 'formularios' | 'contrato_comprovantes' | 'notas'>(initialTab || 'timeline')
    const [leadNotesExpanded, setLeadNotesExpanded] = useState(false)
    const [isApostilleModalOpen, setIsApostilleModalOpen] = useState(false)
    const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false)
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false)
    const [localProcessoId, setLocalProcessoId] = useState<string | undefined>(client.processo_id)

    const clientId = client.true_id || client.id

    // --- QUERIES ---

    // 1. Processo (se faltar)
    const { data: fetchedProcesso } = useQuery({
        queryKey: ['processo', clientId],
        queryFn: () => juridicoService.getProcessoByCliente(clientId),
        enabled: !localProcessoId && !!clientId
    })

    useEffect(() => {
        if (fetchedProcesso?.id && !localProcessoId) {
            setLocalProcessoId(fetchedProcesso.id)
        }
    }, [fetchedProcesso, localProcessoId])

    // Handle adding document to a specific requirement
    const handleAddDocToReq = (reqId: string) => {
        setSelectedRequerimentoId(reqId)
        setIsDocModalOpen(true)
    }

    // Reset requirement ID when modal closes
    useEffect(() => {
        if (!isDocModalOpen && selectedRequerimentoId) {
            setSelectedRequerimentoId(undefined)
        }
    }, [isDocModalOpen, selectedRequerimentoId])

    // 2. Notas do Processo
    const { data: notesRaw, isLoading: loadingNotes } = useQuery({
        queryKey: ['notes', clientId],
        queryFn: async () => {
            const res = await apiClient.get<{ data: any[] }>(`/juridico/notas/${clientId}`)
            return res.data || []
        },
        enabled: !!clientId
    })

    const notes = useMemo(() => {
        if (!notesRaw) return []
        return notesRaw.map((n: any) => ({
            id: n.id,
            text: n.texto,
            author: n.autor_nome || n.autor?.full_name || 'Usuário',
            area: n.autor_setor || n.autor?.role || 'juridico',
            createdAt: n.created_at,
            stageId: n.etapa,
            autorId: n.autor_id
        })) as ClientNote[]
    }, [notesRaw])

    // 3. Notas do Lead
    const { data: leadNotesData = [], isLoading: loadingLeadNotes } = useQuery({
        queryKey: ['lead-notes', clientId],
        queryFn: async () => {
            const res = await apiClient.get<{ data: any[] }>(`/cliente/lead-notas/${clientId}`)
            return res.data || []
        },
        enabled: !!clientId && (activeTab === 'notas' || activeTab === 'timeline')
    })

    // 4. Membros / Dependentes
    const { data: members = [], isLoading: loadingMembers } = useQuery({
        queryKey: ['members', clientId],
        queryFn: async () => {
            const depData = await juridicoService.getDependentes(clientId)
            const titular = {
                id: clientId,
                name: client.nome,
                type: 'Titular',
                isTitular: true
            }
            const formattedDeps = depData.map((d: any) => ({
                id: d.id,
                name: d.nome_completo || d.name,
                type: d.parentesco || 'Dependente',
                isTitular: false
            }))
            return [titular, ...formattedDeps]
        },
        enabled: !!clientId
    })

    // 5. Todos os documentos do cliente (para o modal de apostilagem)
    const { data: allClientDocs = [] } = useQuery({
        queryKey: ['all-client-docs', clientId],
        queryFn: async () => {
            const res = await apiClient.get<{ data: any[] }>(`/cliente/${clientId}/documentos`)
            return res.data || []
        },
        enabled: !!clientId
    })

    // 6. Agendamentos
    const { data: agendamentos = [], isLoading: loadingAgendamentos } = useQuery({
        queryKey: ['agendamentos', clientId],
        queryFn: () => comercialService.getAgendamentosByCliente(clientId),
        enabled: !!clientId
    })

    // 7. Contratos
    const { data: contratosServicos = [], isLoading: loadingContratos } = useQuery({
        queryKey: ['contratos', clientId],
        queryFn: async () => {
            const res = await apiClient.get<{ data: any[] }>(`/cliente/contratos?clienteId=${clientId}`)
            return res.data || []
        },
        enabled: !!clientId && activeTab === 'contrato_comprovantes'
    })

    // --- MUTATIONS ---

    const addNoteMutation = useMutation({
        mutationFn: async ({ text, stageId }: { text: string, stageId?: string }) => {
            return apiClient.post('/juridico/notas', {
                clienteId: clientId,
                processoId: localProcessoId || client.processo_id,
                etapa: stageId || noteStageId || undefined,
                texto: text,
                autorId: activeProfile?.id,
                autorNome: activeProfile?.full_name,
                autorSetor: activeProfile?.role
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes', clientId] })
            setNewNote('')
            setNoteStageId(null)
        }
    })

    const deleteNoteMutation = useMutation({
        mutationFn: (noteId: string) => 
            apiClient.delete(`/juridico/notas/${noteId}?userId=${activeProfile?.id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes', clientId] })
        }
    })

    const deleteLeadNoteMutation = useMutation({
        mutationFn: (noteId: string) =>
            apiClient.delete(`/cliente/lead-notas/${noteId}?userId=${activeProfile?.id}&leadId=${clientId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lead-notes', clientId] })
        }
    })

    const handleAddNote = async (e: React.FormEvent, stageId?: string) => {
        e.preventDefault()
        if (!newNote.trim()) return
        addNoteMutation.mutate({ text: newNote, stageId })
    }

    const handleDeleteNote = async (noteId: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
            deleteNoteMutation.mutate(noteId)
        }
    }

    const handleDeleteLeadNote = async (noteId: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta nota do lead?')) {
            deleteLeadNoteMutation.mutate(noteId)
        }
    }

    const toggleStage = (stageId: string) => {
        const next = new Set(expandedStages)
        if (next.has(stageId)) next.delete(stageId)
        else next.add(stageId)
        setExpandedStages(next)
    }

    const handleCopyId = async () => {
        await navigator.clipboard.writeText(client.id)
        setCopiedId(true)
        setTimeout(() => setCopiedId(false), 2000)
    }


    const currentStageIndex = CATEGORIAS_LIST.findIndex(cat => cat.id === client.categoria)
    const contratosAprovados = contratosServicos.filter((c: any) => c.assinatura_status === 'aprovado' && c.contrato_assinado_url)
    const todosComprovantes = [
        ...agendamentos.filter((a: any) => a.pagamento_status === 'aprovado' && a.comprovante_url).map(a => ({ ...a, tipo: 'Consultoria' })),
        ...contratosServicos.filter((c: any) => c.pagamento_status === 'aprovado' && c.pagamento_comprovante_url).map(c => ({ ...c, tipo: 'Serviço', produto_nome: c.servico_nome || c.servico?.nome, data_referencia: c.pagamento_comprovante_upload_em || c.criado_em, comprovante_url: c.pagamento_comprovante_url }))
    ].sort((a, b) => new Date(b.data_referencia || b.data_hora || b.created_at || 0).getTime() - new Date(a.data_referencia || a.data_hora || a.created_at || 0).getTime())

    return (
        <div className="p-6 lg:p-8">
            <ApostilleQuoteModal
                isOpen={isApostilleModalOpen}
                onClose={() => setIsApostilleModalOpen(false)}
                documentoId=""
                documentoNome={client.nome}
                allDocuments={allClientDocs}
            />

            <TranslationQuoteModal
                isOpen={isTranslationModalOpen}
                onClose={() => setIsTranslationModalOpen(false)}
                documentoId=""
                documentoNome={client.nome}
                allDocuments={allClientDocs}
            />

            <BillingNotificationModal
                isOpen={isBillingModalOpen}
                onClose={() => setIsBillingModalOpen(false)}
                clienteId={clientId}
                clienteNome={client.nome}
            />

            <div className="max-w-6xl mx-auto space-y-5">
                {/* Header */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="touch-target p-2.5 hover:bg-muted rounded-xl transition-all border border-transparent hover:border-border flex-shrink-0"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h1 className="text-2xl font-bold text-foreground tracking-tight truncate">{client.nome}</h1>
                                    <span className={cn(
                                        'px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider flex-shrink-0',
                                        client.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-primary/10 text-primary'
                                    )}>
                                        {client.priority}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-[13px] text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {client.email}</span>
                                    <span className="text-border hidden sm:inline">|</span>
                                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {client.telefone}</span>
                                    <span className="text-border hidden sm:inline">|</span>
                                    <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-0.5 rounded-md font-mono text-[11px]">
                                        <span className="truncate max-w-[140px]">{client.id}</span>
                                        <button onClick={handleCopyId} className="touch-target hover:text-primary transition-colors flex-shrink-0" title="Copiar ID">
                                            {copiedId ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                    </div>

                                    {activeProfile?.role === 'super_admin' && (
                                        <button
                                            onClick={() => {
                                                localStorage.setItem('impersonatedClientId', client.true_id || client.id)
                                                localStorage.setItem('impersonatedClientName', client.nome)
                                                navigate('/cliente')
                                            }}
                                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/30 rounded-md text-[11px] font-bold transition-colors"
                                            title="Acessar como cliente"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            Acessar Área
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 flex-shrink-0">
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground/70 tracking-widest mb-0.5">Assessoria</span>
                                <span className="text-sm font-bold text-primary">{client.tipoAssessoria}</span>
                            </div>
                            <div className="w-px h-8 bg-border/60" />
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground/70 tracking-widest mb-0.5">Previsão</span>
                                <span className="text-sm font-bold text-foreground">{formatDate(client.previsaoChegada)}</span>
                            </div>
                            <div className="w-px h-8 bg-border/60" />
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-[9px] uppercase font-bold text-muted-foreground/70 tracking-widest mb-0.5">Contrato</span>
                                <span className={cn(
                                    "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase mt-0.5",
                                    client.contratoAtivo ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                                )}>
                                    {client.contratoAtivo ? 'Vigente' : 'Inativo'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation & Filters */}
                <div className="bg-card/80 backdrop-blur-lg border border-border rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-2 py-2 sticky top-4 z-40 shadow-sm">
                    <div className="flex items-center gap-0.5 bg-muted/40 p-0.5 rounded-lg overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={cn(
                                "flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-[12px] sm:text-[13px] font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                                activeTab === 'timeline'
                                    ? "bg-background text-foreground shadow-sm border border-border/60"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <History className="h-3.5 w-3.5" />
                            Timeline
                        </button>
                        <button
                            onClick={() => setActiveTab('formularios')}
                            className={cn(
                                "flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-[12px] sm:text-[13px] font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                                activeTab === 'formularios'
                                    ? "bg-background text-foreground shadow-sm border border-border/60"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <FileText className="h-3.5 w-3.5" />
                            Formulários
                        </button>
                        {(activeProfile?.role === 'comercial' || activeProfile?.role === 'super_admin' || activeProfile?.role === 'administrativo') && (
                            <button
                                onClick={() => setActiveTab('contrato_comprovantes')}
                                className={cn(
                                    "flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-[12px] sm:text-[13px] font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                                    activeTab === 'contrato_comprovantes'
                                        ? "bg-background text-foreground shadow-sm border border-border/60"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Copy className="h-3.5 w-3.5" />
                                Contratos
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-1.5 pr-1">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground/60 mr-1 tracking-wider">Área:</span>
                        <div className="flex items-center gap-0.5 bg-muted/30 p-0.5 rounded-lg">
                            {(['todos', 'juridico', 'comercial', 'administrativo'] as const).map((area) => (
                                <button
                                    key={area}
                                    onClick={() => {
                                        setAreaFilter(area)
                                        if (activeTab !== 'timeline' && activeTab !== 'notas') setActiveTab('timeline')
                                    }}
                                    className={cn(
                                        "px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold transition-all capitalize whitespace-nowrap",
                                        areaFilter === area && (activeTab === 'timeline' || activeTab === 'notas')
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                    )}
                                >
                                    {area === 'todos' ? 'Todas' : area}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8 space-y-5">
                        {activeTab === 'timeline' ? (
                            <div className="space-y-6">
                                {/* Notas do Lead - Bloco Colapsável */}
                                {leadNotesData.length > 0 && (
                                    <div className="rounded-2xl border border-amber-200/60 dark:border-amber-800/30 bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 overflow-hidden">
                                        <div
                                            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-amber-100/30 dark:hover:bg-amber-900/10 transition-colors"
                                            onClick={() => setLeadNotesExpanded(!leadNotesExpanded)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                                    <ClipboardList className="h-4 w-4 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Notas do Lead</h4>
                                                    <p className="text-[11px] text-amber-600/70 dark:text-amber-400/60">{leadNotesData.length} {leadNotesData.length === 1 ? 'avaliação registrada' : 'avaliações registradas'} na captação</p>
                                                </div>
                                            </div>
                                            <ChevronDown className={cn("h-4 w-4 text-amber-500 transition-transform duration-300", leadNotesExpanded && "rotate-180")} />
                                        </div>

                                        {leadNotesExpanded && (
                                            <div className="px-6 pb-5 space-y-2.5" style={{ animation: 'slideDown 0.25s ease-out' }}>
                                                {leadNotesData.map((note: any) => (
                                                    <div key={note.id} className="bg-white/70 dark:bg-neutral-900/50 border border-amber-100/60 dark:border-amber-900/20 rounded-xl px-4 py-3 text-sm group">
                                                        <div className="flex justify-between items-center mb-1.5 text-amber-700/60 dark:text-amber-400/50">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-xs flex items-center gap-1"><User className="h-3 w-3" /> {note.autor_nome || 'Lead'}</span>
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">Lead</span>
                                                            </div>
                                                            <span className="text-[10px] tabular-nums">{new Date(note.created_at).toLocaleDateString('pt-BR')}</span>
                                                        </div>
                                                        <p className="text-foreground/80 text-[13px] leading-relaxed whitespace-pre-wrap">{note.texto || note.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Timeline Principal */}
                                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                                    {/* Header com barra de progresso */}
                                    <div className="px-8 pt-7 pb-5">
                                        <div className="flex items-center justify-between mb-5">
                                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <History className="h-4 w-4 text-primary" />
                                                </div>
                                                Timeline do Processo
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="font-semibold tabular-nums">{Math.max(currentStageIndex, 0)}/{CATEGORIAS_LIST.length - 1}</span>
                                                <span>etapas</span>
                                            </div>
                                        </div>
                                        {/* Barra de progresso horizontal */}
                                        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-primary transition-all duration-700 ease-out"
                                                style={{ width: `${Math.max(((currentStageIndex) / (CATEGORIAS_LIST.length - 1)) * 100, 2)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stages */}
                                    <div className="px-6 pb-6">
                                        {CATEGORIAS_LIST.map((stage, index) => {
                                            const isCurrent = stage.id === client.categoria
                                            const isCompleted = index < currentStageIndex
                                            const isFuture = !isCurrent && !isCompleted
                                            const isEmConsultoria = stage.id === 'em_consultoria'
                                            const isCancelado = stage.id === 'cancelado'

                                            // Verificar Consultorias Puladas (só após agendamentos carregarem)
                                            const hasConsultoriaRealizada = agendamentos.some((a: any) =>
                                                a.status === 'realizado' &&
                                                /consultoria/i.test(String(a.produto_nome || ''))
                                            )
                                            const skippedConsultoria = !loadingAgendamentos && currentStageIndex >= 3 && !hasConsultoriaRealizada
                                            const isSkippedNode = skippedConsultoria && (index === 0 || index === 1 || index === 2)

                                            const stageNotes = notes.filter(n => {
                                                const matchesStage = n.stageId === stage.id
                                                const matchesArea = areaFilter === 'todos' || n.area === areaFilter
                                                return matchesStage && matchesArea
                                            })

                                            // Notas só permitidas no status atual e passados
                                            const canAddNote = isCurrent || isCompleted

                                            // Vendedor C2 para Pos Consultoria
                                            const vendedorC2Nome = stage.id === 'clientes_c2'
                                                ? (client.perfil_unificado?.data?.vendedor_c2_nome as string | undefined)
                                                : undefined

                                            const isLast = index === CATEGORIAS_LIST.length - 1

                                            return (
                                                <div
                                                    key={stage.id}
                                                    className="relative"
                                                    style={{ animationDelay: `${index * 60}ms` }}
                                                >
                                                    <div className={cn(
                                                        "relative flex gap-4 py-3 transition-all duration-300",
                                                        isCurrent && "py-4"
                                                    )}>
                                                        {/* Coluna do indicador + linha */}
                                                        <div className="flex flex-col items-center flex-shrink-0 w-10">
                                                            {/* Dot */}
                                                            <div className={cn(
                                                                "relative z-10 flex items-center justify-center rounded-full transition-all duration-500",
                                                                isCurrent && isEmConsultoria
                                                                    ? "w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                                                                    : isCurrent
                                                                    ? "w-10 h-10 bg-gradient-to-br from-primary to-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.35)]"
                                                                    : isSkippedNode
                                                                    ? "w-8 h-8 bg-red-500/80"
                                                                    : isCompleted
                                                                    ? "w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600"
                                                                    : "w-7 h-7 bg-muted border-2 border-border"
                                                            )}>
                                                                {isCurrent && (
                                                                    <div className="absolute inset-0 rounded-full bg-inherit animate-ping opacity-20" />
                                                                )}
                                                                {isSkippedNode ? <XCircle className="h-4 w-4 text-white" /> :
                                                                 isCompleted ? <Check className="h-4 w-4 text-white" /> :
                                                                 isCurrent ? <Clock className="h-4.5 w-4.5 text-white" /> :
                                                                 <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />}
                                                            </div>
                                                            {/* Linha conectora */}
                                                            {!isLast && (
                                                                <div className={cn(
                                                                    "w-0.5 flex-1 min-h-[8px] transition-colors duration-500",
                                                                    isCompleted ? "bg-emerald-400/50" : "bg-border"
                                                                )} />
                                                            )}
                                                        </div>

                                                        {/* Conteúdo */}
                                                        <div className={cn(
                                                            "flex-1 min-w-0 rounded-xl transition-all duration-300 -mt-1",
                                                            isCurrent && "bg-primary/[0.03] dark:bg-primary/[0.06] border border-primary/10 px-4 py-3",
                                                            isCurrent && isEmConsultoria && "bg-amber-500/[0.04] dark:bg-amber-500/[0.06] border-amber-400/15"
                                                        )}>
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2.5 flex-wrap">
                                                                        <h4 className={cn(
                                                                            "font-bold transition-all duration-300",
                                                                            isCurrent && isEmConsultoria ? "text-amber-600 dark:text-amber-400 text-[15px]" :
                                                                            isCurrent ? "text-primary text-[15px]" :
                                                                            isSkippedNode ? "text-red-400 line-through text-sm" :
                                                                            isCompleted ? "text-foreground text-sm" :
                                                                            "text-muted-foreground/50 text-sm"
                                                                        )}>
                                                                            {stage.label}
                                                                        </h4>
                                                                        {isCurrent && (
                                                                            <span className={cn(
                                                                                "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest",
                                                                                isEmConsultoria
                                                                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                                                                    : "bg-primary/10 text-primary"
                                                                            )}>
                                                                                Atual
                                                                            </span>
                                                                        )}
                                                                        {isSkippedNode && (
                                                                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900/20 text-red-500">
                                                                                Pulado
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {vendedorC2Nome && (isCurrent || isCompleted) && (
                                                                        <p className="text-[11px] text-muted-foreground mt-1">Vendedor C2: <span className="font-semibold text-foreground">{vendedorC2Nome}</span></p>
                                                                    )}
                                                                </div>

                                                                {/* Ações — só em etapas atuais e passadas */}
                                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                                    {stageNotes.length > 0 && (
                                                                        <button
                                                                            onClick={() => toggleStage(stage.id)}
                                                                            className={cn(
                                                                                "flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all text-[10px] font-bold",
                                                                                expandedStages.has(stage.id)
                                                                                    ? "text-primary bg-primary/5 border border-primary/10"
                                                                                    : "text-muted-foreground hover:bg-muted border border-transparent"
                                                                            )}
                                                                        >
                                                                            <StickyNote className="h-3 w-3" />
                                                                            {stageNotes.length}
                                                                            <ChevronDown className={cn(
                                                                                "h-3 w-3 transition-transform duration-300",
                                                                                expandedStages.has(stage.id) && "rotate-180"
                                                                            )} />
                                                                        </button>
                                                                    )}

                                                                    {canAddNote && !isCancelado && (
                                                                        <button
                                                                            onClick={() => setNoteStageId(stage.id === noteStageId ? null : stage.id)}
                                                                            className={cn(
                                                                                "text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1",
                                                                                noteStageId === stage.id
                                                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                                                    : "text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/15"
                                                                            )}
                                                                        >
                                                                            <FileText className="h-3 w-3" />
                                                                            Nota
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Form de Nota */}
                                                            {noteStageId === stage.id && canAddNote && (
                                                                <form
                                                                    onSubmit={(e) => {
                                                                        handleAddNote(e, stage.id)
                                                                        if (!expandedStages.has(stage.id)) toggleStage(stage.id)
                                                                    }}
                                                                    className="mt-3 bg-muted/40 dark:bg-muted/20 p-4 rounded-xl border border-border/50"
                                                                    style={{ animation: 'slideDown 0.2s ease-out' }}
                                                                >
                                                                    <textarea
                                                                        autoFocus
                                                                        value={newNote}
                                                                        onChange={(e) => setNewNote(e.target.value)}
                                                                        placeholder={`Nota para: ${stage.label}...`}
                                                                        className="w-full bg-card border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 min-h-[72px] resize-none placeholder:text-muted-foreground/40 transition-all"
                                                                    />
                                                                    <div className="flex justify-end gap-2 mt-2.5">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setNoteStageId(null)}
                                                                            className="px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                                                                        >
                                                                            Cancelar
                                                                        </button>
                                                                        <button
                                                                            type="submit"
                                                                            disabled={!newNote.trim()}
                                                                            className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-[11px] font-bold hover:bg-primary/90 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                                                        >
                                                                            Salvar
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            )}

                                                            {/* Notas desta etapa */}
                                                            {(stageNotes.length > 0 && expandedStages.has(stage.id)) && (
                                                                <div className="mt-3 space-y-2" style={{ animation: 'slideDown 0.25s ease-out' }}>
                                                                    {stageNotes.map((note: any) => (
                                                                        <div key={note.id} className="bg-muted/30 dark:bg-muted/15 border border-border/40 rounded-lg px-4 py-3 text-sm relative group hover:border-border/60 transition-colors">
                                                                            <div className="flex justify-between items-center mb-1.5">
                                                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                                                    <span className="font-semibold text-xs text-foreground/70 flex items-center gap-1"><User className="h-3 w-3" /> {note.author}</span>
                                                                                    <span className={cn(
                                                                                        "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                                                                                        note.area === 'juridico' ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" :
                                                                                        note.area === 'comercial' ? "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400" :
                                                                                        "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                                                                    )}>
                                                                                        {note.area}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-[10px] text-muted-foreground/60 tabular-nums">{new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
                                                                                    {note.autorId === activeProfile?.id && (
                                                                                        <button
                                                                                            onClick={() => handleDeleteNote(note.id)}
                                                                                            className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 rounded transition-all"
                                                                                            title="Excluir nota"
                                                                                        >
                                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <p className="text-foreground/80 leading-relaxed text-[13px] border-l-2 border-primary/15 pl-3">
                                                                                {note.text}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <style>{`
                                    @keyframes slideDown {
                                        from { opacity: 0; transform: translateY(-8px); }
                                        to { opacity: 1; transform: translateY(0); }
                                    }
                                `}</style>
                            </div>
                        ) : activeTab === 'formularios' ? (
                            <div>
                                {client.perfil_unificado?.data && (() => {
                                    const dna = client.perfil_unificado!.data

                                    // Montar seções dinamicamente — apenas com campos preenchidos
                                    const sections: { title: string; color: string; fields: { q: string; a: string }[] }[] = []

                                    const push = (title: string, color: string, fields: [string, any][]) => {
                                        const filled = fields.filter(([, v]) => v).map(([q, v]) => ({ q, a: String(v) }))
                                        if (filled.length > 0) sections.push({ title, color, fields: filled })
                                    }

                                    push('Perfil Pessoal', 'from-blue-500 to-sky-500', [
                                        ['Nacionalidade', dna.nacionalidade],
                                        ['Estado Civil', dna.estado_civil],
                                        ['Cidade / País de Residência', dna.cidade_pais_residencia],
                                        ['Esteve na Europa por mais de 6 meses?', dna.esteve_europa_6meses],
                                    ])
                                    push('Família', 'from-pink-500 to-rose-500', [
                                        ['Filhos — Quantidade e Idades', dna.filhos_qtd_idades],
                                        ['Familiares na Espanha', dna.familiares_espanha],
                                        ['Filhos com Nacionalidade Europeia', dna.filhos_nacionalidade_europeia],
                                    ])
                                    push('Mobilidade & Vínculos com a Europa', 'from-emerald-500 to-teal-500', [
                                        ['Visto UE', dna.visto_ue],
                                        ['Trabalho Destacado na UE', dna.trabalho_destacado_ue],
                                        ['CNH — Categoria e Ano', dna.possui_cnh_categoria_ano],
                                        ['Proposta de Trabalho na Espanha', dna.proposta_trabalho_espanha],
                                    ])
                                    push('Trabalho, Formação & Planos', 'from-violet-500 to-purple-500', [
                                        ['Situação Profissional', dna.situacao_profissional],
                                        ['Profissão (online / presencial)', dna.profissao_online_presencial],
                                        ['Escolaridade', dna.escolaridade],
                                        ['Área de Formação', dna.area_formacao],
                                        ['Tipo de Visto Planejado', dna.tipo_visto_planejado],
                                        ['Pretende Trabalhar na Espanha', dna.pretende_trabalhar_espanha],
                                        ['Disposto a Estudar', dna.disposto_estudar],
                                        ['Pretende Ser Autônomo', dna.pretende_autonomo],
                                    ])

                                    if (sections.length === 0 && !dna.duvidas_consultoria) return null

                                    return (
                                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                                            {/* Header */}
                                            <div className="px-8 pt-7 pb-5">
                                                <div className="flex items-center justify-between mb-5">
                                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <FileText className="h-4 w-4 text-primary" />
                                                        </div>
                                                        Formulário de Consultoria
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="font-semibold tabular-nums">{sections.reduce((acc, s) => acc + s.fields.length, 0)}</span>
                                                        <span>respostas</span>
                                                    </div>
                                                </div>
                                                {/* Barra de preenchimento */}
                                                <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-primary w-full transition-all duration-700 ease-out" />
                                                </div>
                                            </div>

                                            {/* Seções como steps verticais — igual timeline */}
                                            <div className="px-6 pb-6">
                                                {sections.map((section, sIdx) => {
                                                    const isLast = sIdx === sections.length - 1 && !dna.duvidas_consultoria
                                                    return (
                                                        <div key={sIdx} className="relative">
                                                            <div className="relative flex gap-4 py-3">
                                                                {/* Coluna do indicador + linha */}
                                                                <div className="flex flex-col items-center flex-shrink-0 w-10">
                                                                    <div className={cn(
                                                                        "relative z-10 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br text-white shadow-sm",
                                                                        section.color
                                                                    )}>
                                                                        <Check className="h-4 w-4" />
                                                                    </div>
                                                                    {!isLast && (
                                                                        <div className="w-0.5 flex-1 min-h-[8px] bg-emerald-400/30" />
                                                                    )}
                                                                </div>

                                                                {/* Conteúdo */}
                                                                <div className="flex-1 min-w-0 -mt-1 pb-2">
                                                                    <h4 className="text-[13px] font-bold text-foreground mb-3">{section.title}</h4>
                                                                    <div className="space-y-3">
                                                                        {section.fields.map((field, fIdx) => (
                                                                            <div key={fIdx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                                                                                <span className="text-[11px] text-muted-foreground/50 font-semibold sm:min-w-[200px] sm:text-right flex-shrink-0">
                                                                                    {field.q}
                                                                                </span>
                                                                                <span className="text-[13px] font-semibold text-foreground leading-relaxed whitespace-pre-line">
                                                                                    {field.a}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}

                                                {/* Dúvidas — último step com destaque */}
                                                {dna.duvidas_consultoria && (
                                                    <div className="relative">
                                                        <div className="relative flex gap-4 py-3">
                                                            <div className="flex flex-col items-center flex-shrink-0 w-10">
                                                                <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                                                                    <AlertCircle className="h-4 w-4" />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0 -mt-1">
                                                                <h4 className="text-[13px] font-bold text-amber-600 dark:text-amber-400 mb-2">Dúvidas para a Consultoria</h4>
                                                                <p className="text-[13px] text-foreground/80 font-medium leading-relaxed border-l-2 border-amber-400/30 pl-3 italic">
                                                                    "{String(dna.duvidas_consultoria)}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })()}
                            </div>
                        ) : activeTab === 'contrato_comprovantes' ? (
                            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                                <div className="px-6 py-4 border-b border-border/60 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Copy className="h-4 w-4 text-primary" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground">Contrato e Comprovantes</h3>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Section 1: Comprovantes de Pagamento */}
                                    <section>
                                        <h4 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-sky-500" />
                                            Comprovantes de Pagamento
                                        </h4>
                                        {(loadingAgendamentos || loadingContratos) ? (
                                            <div className="text-center py-8 text-muted-foreground animate-pulse text-sm">Carregando...</div>
                                        ) : todosComprovantes.length > 0 ? (
                                            <div className="space-y-2">
                                                {todosComprovantes.map((item: any, idx) => (
                                                    <div key={item.id || idx} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border/40 hover:border-border transition-colors group">
                                                        <div className="min-w-0">
                                                            <div className="text-[13px] font-semibold text-foreground flex items-center gap-2 flex-wrap">
                                                                Comprovante
                                                                <span className="text-[9px] bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{item.tipo}: {item.produto_nome || item.servico_nome || 'Serviço'}</span>
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground/60 mt-0.5 tabular-nums">{formatDate(item.data_referencia || item.data_hora || item.data_agendamento)}</div>
                                                        </div>
                                                        <a href={item.comprovante_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-muted/60 hover:bg-muted border border-border/40 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 flex-shrink-0">
                                                            <ExternalLink className="h-3 w-3" />
                                                            Ver
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="border border-dashed border-border/50 rounded-xl py-8 text-center">
                                                <FileText className="h-6 w-6 text-muted-foreground/20 mx-auto mb-2" />
                                                <p className="text-[13px] text-muted-foreground/50">Nenhum comprovante confirmado.</p>
                                            </div>
                                        )}
                                    </section>

                                    {/* Section 2: Contratos */}
                                    <section>
                                        <h4 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-3 flex items-center gap-2 pt-5 border-t border-border/40">
                                            <div className="w-1 h-1 rounded-full bg-primary" />
                                            Contratos
                                        </h4>
                                        {loadingContratos ? (
                                            <div className="text-center py-8 text-muted-foreground animate-pulse text-sm">Carregando...</div>
                                        ) : contratosAprovados.length > 0 ? (
                                            <div className="space-y-2">
                                                {contratosAprovados.map((contrato: any) => (
                                                    <div key={contrato.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border/40 hover:border-border transition-colors group">
                                                        <div className="min-w-0">
                                                            <div className="text-[13px] font-semibold text-foreground flex items-center gap-2 flex-wrap">
                                                                Contrato
                                                                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{contrato.servico_nome || contrato.servico?.nome || 'Serviço'}</span>
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground/60 mt-0.5 tabular-nums">{formatDate(contrato.criado_em)}</div>
                                                        </div>
                                                        <a href={contrato.contrato_assinado_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-muted/60 hover:bg-muted border border-border/40 rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 flex-shrink-0">
                                                            <ExternalLink className="h-3 w-3" />
                                                            Ver
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="border border-dashed border-border/50 rounded-xl py-8 text-center">
                                                <Copy className="h-6 w-6 text-muted-foreground/20 mx-auto mb-2" />
                                                <p className="text-[13px] text-muted-foreground/50">Nenhum contrato assinado.</p>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Coluna Direita: Informações Extras */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <ProcessAction
                                client={client}
                                clienteId={client.true_id || client.id}
                                processoId={client.processo_id}
                                responsavel={client.responsavel}
                                areaFilter={areaFilter}
                                onSolicitarDocumentos={() => setIsDocModalOpen(true)}
                                onSolicitarFormulario={() => setIsFormModalOpen(true)}
                                onSolicitarApostilagem={() => setIsApostilleModalOpen(true)}
                                onSolicitarTraducao={() => setIsTranslationModalOpen(true)}
                                onGerarFatura={() => setIsBillingModalOpen(true)}
                                onSetTab={(tab) => setActiveTab(tab as any)}
                                localProcessoId={localProcessoId}
                                onActionClick={(action) => {
                                    console.log('[DNAClientDetailView] onActionClick fallback:', action);
                                    if (action === 'solicitar_documentos') {
                                        queryClient.invalidateQueries({ queryKey: ['notes', clientId] })
                                    }
                                }}
                            />
                        </div>
                        {/* Requirements Section */}
                        <RequirementsSection
                            clienteId={client.true_id || client.id}
                            processoId={client.processo_id || ''}
                            members={members}
                            onAddRequirement={() => setIsReqModalOpen(true)}
                            onAddDocumentToRequirement={handleAddDocToReq}
                        />

                        {/* FormsDeclarationsSection moved to main column as a tab */}
                    </div>
                </div>
            </div>

            <DocumentRequestModal
                isOpen={isDocModalOpen}
                onOpenChange={setIsDocModalOpen}
                clienteId={client.true_id || client.id}
                processoId={client.processo_id}
                members={members}
                initialRequerimentoId={selectedRequerimentoId}
            />

            <RequirementRequestModal
                isOpen={isReqModalOpen}
                onOpenChange={setIsReqModalOpen}
                clienteId={client.true_id || client.id}
                processoId={client.processo_id}
                members={members}
            />

            <FormUploadModal
                isOpen={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                clienteId={client.true_id || client.id}
                processoId={client.processo_id}
                members={members}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['notes', clientId] })}
            />
        </div>
    )
}

