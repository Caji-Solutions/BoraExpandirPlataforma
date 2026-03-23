import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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
    Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ClientDNAData, ClientNote, CATEGORIAS_LIST, formatDate } from './ClientDNA'
import { ProcessAction } from '../../modules/juridico/components/ProcessAction'
import { DocumentRequestModal } from '../../modules/juridico/components/DocumentRequestModal'
import { RequirementRequestModal } from '../../modules/juridico/components/RequirementRequestModal'
import { FormsDeclarationsSection } from '../../modules/juridico/components/FormsDeclarationsSection'
import { ClientQuestionnaireAnswers } from './ClientQuestionnaireAnswers'
import { RequirementsSection } from '../../modules/juridico/components/RequirementsSection'
import juridicoService from '../../modules/juridico/services/juridicoService'
import comercialService from '../../modules/comercial/services/comercialService'
import { useAuth } from '../../contexts/AuthContext'

export function DNAClientDetailView({
    client,
    onBack,
    initialTab,
    initialArea
}: {
    client: ClientDNAData
    onBack: () => void
    initialTab?: 'timeline' | 'formularios' | 'contrato_comprovantes' | 'notas'
    initialArea?: 'todos' | 'juridico' | 'comercial' | 'administrativo'
}) {
    const { activeProfile } = useAuth()
    const navigate = useNavigate()
    const [copiedId, setCopiedId] = useState(false)
    const [noteStageId, setNoteStageId] = useState<string | null>(null)
    const [newNote, setNewNote] = useState('')
    const [notes, setNotes] = useState<ClientNote[]>([])
    const [loadingNotes, setLoadingNotes] = useState(false)
    const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set([client.categoria]))
    const [isDocModalOpen, setIsDocModalOpen] = useState(false)
    const [isReqModalOpen, setIsReqModalOpen] = useState(false)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false)
    const [members, setMembers] = useState<any[]>([])
    const [loadingMembers, setLoadingMembers] = useState(false)
    const [selectedRequerimentoId, setSelectedRequerimentoId] = useState<string | undefined>(undefined)
    const [areaFilter, setAreaFilter] = useState<'todos' | 'juridico' | 'comercial' | 'administrativo'>(initialArea || 'todos')
    const [activeTab, setActiveTab] = useState<'timeline' | 'formularios' | 'contrato_comprovantes' | 'notas'>(initialTab || 'timeline')
    const [agendamentos, setAgendamentos] = useState<any[]>([])
    const [loadingAgendamentos, setLoadingAgendamentos] = useState(false)
    const [contratosServicos, setContratosServicos] = useState<any[]>([])
    const [loadingContratos, setLoadingContratos] = useState(false)
    const [leadNotesData, setLeadNotesData] = useState<any[]>([])
    const [loadingLeadNotes, setLoadingLeadNotes] = useState(false)

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

    const fetchNotes = useCallback(async () => {
        try {
            setLoadingNotes(true)
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
            const response = await fetch(`${baseUrl}/juridico/notas/${client.true_id || client.id}`)
            const result = await response.json()

            if (result.data) {
                const mappedNotes: ClientNote[] = result.data.map((n: any) => ({
                    id: n.id,
                    text: n.texto,
                    author: n.autor_nome || n.autor?.full_name || 'Usuário',
                    area: n.autor_setor || n.autor?.role || 'juridico',
                    createdAt: n.created_at,
                    stageId: n.etapa,
                    autorId: n.autor_id
                }))
                setNotes(mappedNotes)
            }
        } catch (err) {
            console.error('Erro ao buscar notas:', err)
        } finally {
            setLoadingNotes(false)
        }
    }, [client.id, client.true_id])

    useEffect(() => {
        fetchNotes()
    }, [fetchNotes])

    useEffect(() => {
        const fetchMembers = async () => {
            if (!client.true_id && !client.id) return
            setLoadingMembers(true)
            try {
                const depData = await juridicoService.getDependentes(client.true_id || client.id)
                const titular = {
                    id: client.true_id || client.id,
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
                setMembers([titular, ...formattedDeps])
            } catch (err) {
                console.error('Erro ao buscar membros:', err)
            } finally {
                setLoadingMembers(false)
            }
        }
        fetchMembers()
    }, [client.id, client.true_id, client.nome])

    useEffect(() => {
        if (activeTab === 'contrato_comprovantes') {
            const fetchAgendamentos = async () => {
                try {
                    setLoadingAgendamentos(true)
                    const data = await comercialService.getAgendamentosByCliente(client.true_id || client.id)
                    setAgendamentos(data)
                } catch (err) {
                    console.error('Erro ao buscar agendamentos:', err)
                } finally {
                    setLoadingAgendamentos(false)
                }
            }
            const fetchContratos = async () => {
                try {
                    setLoadingContratos(true)
                    const data = await comercialService.getContratosServicos(client.true_id || client.id)
                    setContratosServicos(data)
                } catch (err) {
                    console.error('Erro ao buscar contratos:', err)
                } finally {
                    setLoadingContratos(false)
                }
            }
            fetchAgendamentos()
            fetchContratos()
        }
        if (activeTab === 'notas') {
            const fetchLeadNotes = async () => {
                try {
                    setLoadingLeadNotes(true)
                    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
                    const response = await fetch(`${baseUrl}/cliente/lead-notas/${client.true_id || client.id}`)
                    const result = await response.json()
                    setLeadNotesData(result.data || [])
                } catch (err) {
                    console.error('Erro ao buscar notas do lead:', err)
                } finally {
                    setLoadingLeadNotes(false)
                }
            }
            fetchLeadNotes()
            fetchNotes()
        }
    }, [activeTab, client.id, client.true_id, fetchNotes])

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

    const handleAddNote = async (e: React.FormEvent, stageId?: string) => {
        e.preventDefault()
        if (!newNote.trim()) return

        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
            const response = await fetch(`${baseUrl}/juridico/notas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clienteId: client.true_id || client.id,
                    processoId: client.processo_id,
                    etapa: stageId || noteStageId || undefined,
                    texto: newNote,
                    autorId: activeProfile?.id,
                    autorNome: activeProfile?.full_name,
                    autorSetor: activeProfile?.role
                })
            })

            if (response.ok) {
                const result = await response.json()
                const n = result.data
                const note: ClientNote = {
                    id: n.id,
                    text: n.texto,
                    author: n.autor_nome || n.autor?.full_name || 'Usuário',
                    area: n.autor_setor || n.autor?.role || 'juridico',
                    createdAt: n.created_at,
                    stageId: n.etapa,
                    autorId: n.autor_id
                }
                setNotes([note, ...notes])
                setNewNote('')
                setNoteStageId(null)
            }
        } catch (err) {
            console.error('Erro ao salvar nota:', err)
        }
    }

    const handleDeleteNote = async (noteId: string) => {
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
            const response = await fetch(`${baseUrl}/juridico/notas/${noteId}?userId=${activeProfile?.id}`, { method: 'DELETE' })
            if (response.ok) {
                setNotes(notes.filter(n => n.id !== noteId))
            } else {
                const errorData = await response.json()
                alert(errorData.message || 'Erro ao deletar nota da timeline')
            }
        } catch (err) {
            console.error('Erro ao deletar nota da timeline:', err)
        }
    }

    const handleDeleteLeadNote = async (noteId: string) => {
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
            const response = await fetch(`${baseUrl}/cliente/lead-notas/${noteId}?userId=${activeProfile?.id}`, { method: 'DELETE' })
            if (response.ok) {
                setLeadNotesData(prev => prev.filter(n => n.id !== noteId))
            } else {
                const errData = await response.json()
                alert(errData.message || 'Erro ao deletar nota do lead')
            }
        } catch (err) {
            console.error('Erro ao deletar nota do lead:', err)
        }
    }

    const currentStageIndex = CATEGORIAS_LIST.findIndex(cat => cat.id === client.categoria)
    const contratosAprovados = contratosServicos.filter((c: any) => c.assinatura_status === 'aprovado' && c.contrato_assinado_url)
    const todosComprovantes = [
        ...agendamentos.filter((a: any) => a.pagamento_status === 'aprovado' && a.comprovante_url).map(a => ({ ...a, tipo: 'Consultoria' })),
        ...contratosServicos.filter((c: any) => c.pagamento_status === 'aprovado' && c.pagamento_comprovante_url).map(c => ({ ...c, tipo: 'Serviço', produto_nome: c.servico_nome || c.servico?.nome, data_referencia: c.pagamento_comprovante_upload_em || c.criado_em, comprovante_url: c.pagamento_comprovante_url }))
    ].sort((a, b) => new Date(b.data_referencia || b.data_hora || b.created_at || 0).getTime() - new Date(a.data_referencia || a.data_hora || a.created_at || 0).getTime())

    return (
        <div className="p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-card p-6 border border-border rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={onBack}
                            className="p-3 hover:bg-muted rounded-xl transition-all border border-transparent hover:border-border"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-foreground">{client.nome}</h1>
                                <span className={cn(
                                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                                    client.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                )}>
                                    {client.priority}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {client.email}</span>
                                <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {client.telefone}</span>
                                <div className="flex items-center gap-2 bg-muted px-2 py-0.5 rounded font-mono text-xs">
                                    {client.id}
                                    <button onClick={handleCopyId} className="hover:text-primary transition-colors" title="Copiar ID">
                                        {copiedId ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </div>

                                {activeProfile?.role === 'super_admin' && (
                                    <button
                                        onClick={() => {
                                            localStorage.setItem('impersonatedClientId', client.true_id || client.id)
                                            localStorage.setItem('impersonatedClientName', client.nome)
                                            navigate('/cliente')
                                        }}
                                        className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-full text-xs font-bold transition-colors ml-2"
                                        title="Acessar como cliente"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        Acessar Área
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Assessoria</span>
                            <span className="text-sm font-bold text-primary">{client.tipoAssessoria}</span>
                        </div>
                        <div className="w-px h-8 bg-border hidden sm:block" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Previsão</span>
                            <span className="text-sm font-bold">{formatDate(client.previsaoChegada)}</span>
                        </div>
                        <div className="w-px h-8 bg-border hidden sm:block" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Contrato</span>
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-0.5",
                                client.contratoAtivo ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                            )}>
                                {client.contratoAtivo ? 'Vigente' : 'Inativo'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Unified Tab Navigation & Filters */}
                <div className="bg-card/50 backdrop-blur-md border border-border p-2 rounded-2xl flex flex-wrap items-center justify-between gap-4 sticky top-4 z-40 shadow-sm">
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                activeTab === 'timeline'
                                    ? "bg-background text-primary shadow-sm border border-border"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <History className="h-4 w-4" />
                            Timeline do Processo
                        </button>
                        <button
                            onClick={() => setActiveTab('formularios')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                activeTab === 'formularios'
                                    ? "bg-background text-primary shadow-sm border border-border"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <FileText className="h-4 w-4" />
                            Formulários
                        </button>
                        {(activeProfile?.role === 'comercial' || activeProfile?.role === 'super_admin' || activeProfile?.role === 'administrativo') && (
                            <button
                                onClick={() => setActiveTab('contrato_comprovantes')}
                                className={cn(
                                    "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                    activeTab === 'contrato_comprovantes'
                                        ? "bg-background text-primary shadow-sm border border-border"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Copy className="h-4 w-4" />
                                Contrato e Comprovantes
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('notas')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                activeTab === 'notas'
                                    ? "bg-background text-amber-600 shadow-sm border border-border"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <StickyNote className="h-4 w-4" />
                            Notas
                        </button>
                    </div>

                    <div className="flex items-center gap-2 pr-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground mr-2 hidden sm:block">Filtrar Área:</span>
                        <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-xl">
                            {(['todos', 'juridico', 'comercial', 'administrativo'] as const).map((area) => (
                                <button
                                    key={area}
                                    onClick={() => {
                                        setAreaFilter(area)
                                        if (activeTab !== 'timeline' && activeTab !== 'notas') setActiveTab('timeline')
                                    }}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize",
                                        areaFilter === area && (activeTab === 'timeline' || activeTab === 'notas')
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    {area === 'todos' ? 'Todas' : area}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8 space-y-6">
                        {activeTab === 'timeline' ? (
                            <div className="bg-card border border-border rounded-2xl p-8 relative">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                    <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                                        <History className="h-6 w-6 text-primary" />
                                        Timeline do Processo
                                    </h3>
                                </div>

                                <div className="space-y-0 relative ml-4">
                                    {/* Linha vertical decorativa */}
                                    <div className="absolute left-[15px] top-2 bottom-6 w-0.5 bg-border" />

                                    {CATEGORIAS_LIST.map((stage, index) => {
                                        const isCurrent = stage.id === client.categoria
                                        const isCompleted = index < currentStageIndex
                                        const isFuture = index > currentStageIndex

                                        const stageNotes = notes.filter(n => {
                                            const matchesStage = n.stageId === stage.id
                                            const matchesArea = areaFilter === 'todos' || n.area === areaFilter
                                            return matchesStage && matchesArea
                                        })

                                        return (
                                            <div key={stage.id} className="relative pl-12 pb-10 group last:pb-0">
                                                {/* Dot / Indicator */}
                                                <div className={cn(
                                                    "absolute left-0 top-1 w-8 h-8 rounded-full border-4 z-10 flex items-center justify-center transition-all",
                                                    isCurrent ? "bg-primary border-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)] animate-pulse" :
                                                        isCompleted ? "bg-green-500 border-green-200" : "bg-muted border-card"
                                                )}>
                                                    {isCompleted ? <Check className="h-4 w-4 text-white" /> :
                                                        isCurrent ? <Clock className="h-4 w-4 text-white" /> :
                                                            <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className={cn(
                                                            "font-bold transition-colors",
                                                            isCurrent ? "text-primary text-lg" :
                                                                isCompleted ? "text-foreground" : "text-muted-foreground"
                                                        )}>
                                                            {stage.label.split('-')[1] || stage.label}
                                                        </h4>

                                                        <div className="flex items-center gap-2">
                                                            {stageNotes.length > 0 && (
                                                                <button
                                                                    onClick={() => toggleStage(stage.id)}
                                                                    className={cn(
                                                                        "flex items-center gap-1 px-2 py-1 rounded-lg transition-all border border-transparent hover:bg-muted font-bold text-[10px]",
                                                                        expandedStages.has(stage.id) ? "text-primary bg-primary/5 border-primary/10" : "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    <ChevronDown className={cn(
                                                                        "h-3.5 w-3.5 transition-transform duration-300",
                                                                        expandedStages.has(stage.id) && "rotate-180"
                                                                    )} />
                                                                    {stageNotes.length} {stageNotes.length === 1 ? 'Nota' : 'Notas'}
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => setNoteStageId(stage.id === noteStageId ? null : stage.id)}
                                                                className="text-xs font-semibold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20 transition-all flex items-center gap-1.5"
                                                            >
                                                                <FileText className="h-3.5 w-3.5" />
                                                                Adicionar Nota
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Form de Nota para esta etapa */}
                                                    {noteStageId === stage.id && (
                                                        <form
                                                            onSubmit={(e) => {
                                                                handleAddNote(e, stage.id)
                                                                if (!expandedStages.has(stage.id)) toggleStage(stage.id)
                                                            }}
                                                            className="mt-4 bg-muted/30 p-4 rounded-xl border border-primary/10 animate-in zoom-in-95 duration-200"
                                                        >
                                                            <textarea
                                                                autoFocus
                                                                value={newNote}
                                                                onChange={(e) => setNewNote(e.target.value)}
                                                                placeholder={`Detalhes para a etapa: ${stage.label}...`}
                                                                className="w-full bg-card border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none"
                                                            />
                                                            <div className="flex justify-end gap-2 mt-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setNoteStageId(null)}
                                                                    className="px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/90 shadow-sm"
                                                                >
                                                                    Salvar na Etapa
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )}

                                                    {/* Notas desta etapa (Colapsáveis) */}
                                                    {(stageNotes.length > 0 && expandedStages.has(stage.id)) && (
                                                        <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                                            {stageNotes.map(note => (
                                                                <div key={note.id} className="bg-muted/30 border border-border/50 rounded-xl p-4 text-sm relative group">
                                                                    <div className="flex justify-between items-center mb-2 opacity-70">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="font-bold flex items-center gap-1.5"><User className="h-3 w-3" /> {note.author}</span>
                                                                            <span className={cn(
                                                                                "text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tight",
                                                                                note.area === 'juridico' ? "bg-purple-100 text-purple-700" :
                                                                                    note.area === 'comercial' ? "bg-blue-100 text-blue-700" :
                                                                                        "bg-amber-100 text-amber-700"
                                                                            )}>
                                                                                {note.area}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px]">{new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
                                                                            {note.autorId === activeProfile?.id && (
                                                                                <button
                                                                                    onClick={() => handleDeleteNote(note.id)}
                                                                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
                                                                                    title="Excluir nota"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-foreground/90 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                                                                        "{note.text}"
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : activeTab === 'formularios' ? (
                            <div className="space-y-6">
                                {client.perfil_unificado?.data && (() => {
                                    const dna = client.perfil_unificado!.data
                                    const hasPerfilPessoal = dna.nacionalidade || dna.estado_civil || dna.cidade_pais_residencia || dna.esteve_europa_6meses
                                    const hasFamilia = dna.filhos_qtd_idades || dna.familiares_espanha || dna.filhos_nacionalidade_europeia
                                    const hasMobilidade = dna.visto_ue || dna.trabalho_destacado_ue || dna.possui_cnh_categoria_ano || dna.proposta_trabalho_espanha
                                    const hasTrabalho = dna.situacao_profissional || dna.profissao_online_presencial || dna.pretende_autonomo || dna.pretende_trabalhar_espanha || dna.disposto_estudar || dna.escolaridade || dna.area_formacao || dna.tipo_visto_planejado
                                    const hasAny = hasPerfilPessoal || hasFamilia || hasMobilidade || hasTrabalho || dna.duvidas_consultoria
                                    if (!hasAny) return null

                                    const card = "bg-gray-50/50 dark:bg-neutral-800/30 p-5 rounded-3xl border border-gray-100/50 dark:border-neutral-800/50 transition-all hover:border-blue-200 dark:hover:border-blue-900/50 group"
                                    const cardLabel = "text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2"
                                    const cardValue = "text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors whitespace-pre-line"

                                    return (
                                        <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in duration-300">
                                            {/* Header */}
                                            <div className="px-8 py-6 border-b border-gray-100/50 dark:border-neutral-800/50 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-2xl flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Formulário de Consultoria</h3>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em] mt-1">DNA do cliente · Dados preenchidos no agendamento</p>
                                                </div>
                                                <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20 flex-shrink-0">
                                                    <FileText className="h-5 w-5 text-white" />
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <div className="p-8 space-y-8">

                                                {/* Perfil Pessoal */}
                                                {hasPerfilPessoal && (
                                                    <div className="space-y-4">
                                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">Perfil Pessoal</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {dna.nacionalidade && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>Nacionalidade</p>
                                                                    <p className={cardValue}>{String(dna.nacionalidade)}</p>
                                                                </div>
                                                            )}
                                                            {dna.estado_civil && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>Estado Civil</p>
                                                                    <p className={cardValue}>{String(dna.estado_civil)}</p>
                                                                </div>
                                                            )}
                                                            {dna.cidade_pais_residencia && (
                                                                <div className={cn(card, "sm:col-span-2")}>
                                                                    <p className={cardLabel}>Cidade / País de Residência</p>
                                                                    <p className={cardValue}>{String(dna.cidade_pais_residencia)}</p>
                                                                </div>
                                                            )}
                                                            {dna.esteve_europa_6meses && (
                                                                <div className={cn(card, "sm:col-span-2")}>
                                                                    <p className={cardLabel}>Esteve na Europa por mais de 6 meses</p>
                                                                    <p className={cardValue}>{String(dna.esteve_europa_6meses)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Família */}
                                                {hasFamilia && (
                                                    <div className="space-y-4">
                                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">Família</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {dna.filhos_qtd_idades && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>Filhos — Qtd. e Idades</p>
                                                                    <p className={cardValue}>{String(dna.filhos_qtd_idades)}</p>
                                                                </div>
                                                            )}
                                                            {dna.familiares_espanha && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>Familiares na Espanha</p>
                                                                    <p className={cardValue}>{String(dna.familiares_espanha)}</p>
                                                                </div>
                                                            )}
                                                            {dna.filhos_nacionalidade_europeia && (
                                                                <div className={cn(card, "sm:col-span-2")}>
                                                                    <p className={cardLabel}>Filhos com Nacionalidade Europeia</p>
                                                                    <p className={cardValue}>{String(dna.filhos_nacionalidade_europeia)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Mobilidade & Vínculos */}
                                                {hasMobilidade && (
                                                    <div className="space-y-4">
                                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">Mobilidade & Vínculos com a Europa</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {dna.visto_ue && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>Visto UE</p>
                                                                    <p className={cardValue}>{String(dna.visto_ue)}</p>
                                                                </div>
                                                            )}
                                                            {dna.trabalho_destacado_ue && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>Trabalho Destacado na UE</p>
                                                                    <p className={cardValue}>{String(dna.trabalho_destacado_ue)}</p>
                                                                </div>
                                                            )}
                                                            {dna.possui_cnh_categoria_ano && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>CNH — Categoria e Ano</p>
                                                                    <p className={cardValue}>{String(dna.possui_cnh_categoria_ano)}</p>
                                                                </div>
                                                            )}
                                                            {dna.proposta_trabalho_espanha && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>Proposta de Trabalho na Espanha</p>
                                                                    <p className={cardValue}>{String(dna.proposta_trabalho_espanha)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Trabalho & Formação */}
                                                {hasTrabalho && (
                                                    <div className="space-y-4">
                                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">Trabalho, Formação & Planos</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {dna.situacao_profissional && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>Situação Profissional</p>
                                                                    <p className={cardValue}>{String(dna.situacao_profissional)}</p>
                                                                </div>
                                                            )}
                                                            {dna.profissao_online_presencial && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>Profissão (online / presencial)</p>
                                                                    <p className={cardValue}>{String(dna.profissao_online_presencial)}</p>
                                                                </div>
                                                            )}
                                                            {dna.escolaridade && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>Escolaridade</p>
                                                                    <p className={cardValue}>{String(dna.escolaridade)}</p>
                                                                </div>
                                                            )}
                                                            {dna.area_formacao && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>Área de Formação</p>
                                                                    <p className={cardValue}>{String(dna.area_formacao)}</p>
                                                                </div>
                                                            )}
                                                            {dna.tipo_visto_planejado && (
                                                                <div className={cn(card, "sm:col-span-2")}>
                                                                    <p className={cardLabel}>Tipo de Visto Planejado</p>
                                                                    <p className={cardValue}>{String(dna.tipo_visto_planejado)}</p>
                                                                </div>
                                                            )}
                                                            {dna.pretende_trabalhar_espanha && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>Pretende Trabalhar na Espanha</p>
                                                                    <p className={cardValue}>{String(dna.pretende_trabalhar_espanha)}</p>
                                                                </div>
                                                            )}
                                                            {dna.disposto_estudar && (
                                                                <div className={card}>
                                                                    <p className={cardLabel}>Disposto a Estudar</p>
                                                                    <p className={cardValue}>{String(dna.disposto_estudar)}</p>
                                                                </div>
                                                            )}
                                                            {dna.pretende_autonomo && (
                                                                <div className={cn(card, "sm:col-span-2")}>
                                                                    <p className={cardLabel}>Pretende Ser Autônomo</p>
                                                                    <p className={cardValue}>{String(dna.pretende_autonomo)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dúvidas — destaque especial */}
                                                {dna.duvidas_consultoria && (
                                                    <div className="p-6 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 rounded-[2rem] relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                                                            <AlertCircle className="h-16 w-16 text-amber-500" />
                                                        </div>
                                                        <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-black tracking-widest mb-3">Dúvidas para a Consultoria</p>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">
                                                            "{String(dna.duvidas_consultoria)}"
                                                        </p>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    )
                                })()}
                                <ClientQuestionnaireAnswers clienteId={client.true_id || client.id} />
                            </div>
                        ) : activeTab === 'contrato_comprovantes' ? (
                            <div className="bg-card border border-border rounded-2xl p-8 relative">
                                <h3 className="text-xl font-bold text-foreground flex items-center gap-3 mb-8">
                                    <Copy className="h-6 w-6 text-primary" />
                                    Contrato e Comprovantes
                                </h3>

                                <div className="space-y-8">
                                    {/* Section 1: Comprovantes de Pagamento */}
                                    <section>
                                        <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            Comprovantes de Pagamento
                                        </h4>
                                        {(loadingAgendamentos || loadingContratos) ? (
                                            <div className="text-center p-8 text-muted-foreground animate-pulse text-sm">Carregando comprovantes...</div>
                                        ) : todosComprovantes.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {todosComprovantes.map((item: any, idx) => (
                                                    <div key={item.id || idx} className="bg-muted border border-border/50 rounded-xl p-4 flex items-center justify-between group hover:border-primary/30 transition-all">
                                                        <div>
                                                            <div className="text-sm font-bold text-foreground flex items-center gap-2">
                                                                Comprovante <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase tracking-tight">{item.tipo}: {item.produto_nome || item.servico_nome || 'Serviço'}</span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mt-1">Ref: {formatDate(item.data_referencia || item.data_hora || item.data_agendamento)}</div>
                                                        </div>
                                                        <a href={item.comprovante_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-background border border-border rounded-lg shadow-sm hover:text-primary transition-all group-hover:scale-105 active:scale-95 text-xs font-bold flex items-center gap-2">
                                                            <ExternalLink className="h-3 w-3" />
                                                            Ver
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-muted/30 border border-dashed border-border/60 rounded-xl p-8 text-center">
                                                <div className="flex justify-center mb-3">
                                                    <div className="w-12 h-12 rounded-full bg-background border shadow-sm flex items-center justify-center">
                                                        <FileText className="h-6 w-6 text-muted-foreground/30" />
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground">Nenhum comprovante confirmado pelo financeiro.</p>
                                            </div>
                                        )}
                                    </section>

                                    {/* Section 2: Contratos */}
                                    <section>
                                        <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 pt-6 border-t border-border">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            Contratos
                                        </h4>
                                        {loadingContratos ? (
                                            <div className="text-center p-8 text-muted-foreground animate-pulse text-sm">Carregando contratos...</div>
                                        ) : contratosAprovados.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {contratosAprovados.map((contrato: any) => (
                                                    <div key={contrato.id} className="bg-muted border border-border/50 rounded-xl p-4 flex items-center justify-between group hover:border-primary/30 transition-all">
                                                        <div>
                                                            <div className="text-sm font-bold text-foreground flex items-center gap-2">
                                                                Contrato <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md uppercase tracking-tight">{contrato.servico_nome || contrato.servico?.nome || 'Serviço'}</span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mt-1">Ref: {formatDate(contrato.criado_em)}</div>
                                                        </div>
                                                        <a href={contrato.contrato_assinado_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-background border border-border rounded-lg shadow-sm hover:text-primary transition-all group-hover:scale-105 active:scale-95 text-xs font-bold flex items-center gap-2">
                                                            <ExternalLink className="h-3 w-3" />
                                                            Ver
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-muted border border-dashed border-border/60 rounded-xl p-8 text-center">
                                                <div className="flex justify-center mb-3">
                                                    <div className="w-12 h-12 rounded-full bg-background border shadow-sm flex items-center justify-center">
                                                        <Copy className="h-6 w-6 text-muted-foreground/30" />
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground">Ainda não há contratos assinados vinculados a este cliente.</p>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            </div>
                        ) : activeTab === 'notas' && (
                            <div className="bg-card border border-border rounded-2xl p-8 relative">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                                        <StickyNote className="h-6 w-6 text-amber-500" />
                                        Notas do Cliente
                                    </h3>
                                    <button 
                                        onClick={() => setNoteStageId(noteStageId === 'general' ? null : 'general')}
                                        className="text-sm font-bold bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <StickyNote className="h-4 w-4" />
                                        Nova Nota
                                    </button>
                                </div>

                                {noteStageId === 'general' && (
                                    <form
                                        onSubmit={(e) => {
                                            handleAddNote(e)
                                            setNoteStageId(null)
                                        }}
                                        className="mb-8 bg-muted/30 p-6 rounded-2xl border border-primary/20 animate-in zoom-in-95 duration-200 shadow-inner"
                                    >
                                        <textarea
                                            autoFocus
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Escreva uma nota geral sobre o cliente..."
                                            className="w-full bg-card border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-none shadow-sm"
                                        />
                                        <div className="flex justify-end gap-3 mt-4">
                                            <button
                                                type="button"
                                                onClick={() => setNoteStageId(null)}
                                                className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg transition-all active:scale-95"
                                            >
                                                Salvar Nota
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <div className="space-y-6">
                                    {/* Unified Notes List */}
                                    {loadingNotes || loadingLeadNotes ? (
                                        <div className="text-center p-12 text-muted-foreground animate-pulse text-sm">Carregando todas as notas...</div>
                                    ) : (
                                        <>
                                            {/* Combined notes from both sources */}
                                            {[
                                                ...notes.map(n => ({ ...n, type: 'process' })),
                                                ...leadNotesData.map(n => ({
                                                    id: n.id,
                                                    text: n.texto,
                                                    author: n.autor_nome || n.autor?.full_name || 'Usuário',
                                                    area: n.autor_setor || 'lead',
                                                    createdAt: n.created_at,
                                                    autorId: n.autor_id,
                                                    type: 'lead'
                                                }))
                                            ]
                                            .filter(n => areaFilter === 'todos' || n.area === areaFilter)
                                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                            .map((note) => (
                                                <div key={note.id} className="bg-muted/30 border border-border/50 rounded-2xl p-5 text-sm relative group hover:border-primary/20 transition-all shadow-sm">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                                <User className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-foreground flex items-center gap-2">
                                                                    {note.author}
                                                                    <span className={cn(
                                                                        "text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider",
                                                                        note.area === 'juridico' ? "bg-purple-100 text-purple-700" :
                                                                        note.area === 'comercial' ? "bg-blue-100 text-blue-700" :
                                                                        note.area === 'lead' ? "bg-amber-100 text-amber-700" :
                                                                        "bg-emerald-100 text-emerald-700"
                                                                    )}>
                                                                        {note.area}
                                                                    </span>
                                                                    {note.type === 'process' && (note as any).stageId && (
                                                                        <span className="text-[9px] bg-muted px-2 py-0.5 rounded-md text-muted-foreground font-bold uppercase">
                                                                            Etapa: {(note as any).stageId}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground font-medium">
                                                                    {new Date(note.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {note.autorId === activeProfile?.id && (
                                                            <button
                                                                onClick={() => note.type === 'lead' ? handleDeleteLeadNote(note.id) : handleDeleteNote(note.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 transition-all hover:bg-red-50 rounded-lg"
                                                                title="Excluir nota"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-foreground/90 leading-relaxed pl-11 border-l-2 border-primary/10 ml-4 py-1">
                                                        {note.text}
                                                    </p>
                                                </div>
                                            ))}

                                            {notes.length === 0 && leadNotesData.length === 0 && (
                                                <div className="text-center p-16 bg-muted/20 rounded-3xl border border-dashed border-border">
                                                    <StickyNote className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                                                    <p className="text-muted-foreground font-bold">Nenhuma nota registrada</p>
                                                    <p className="text-sm text-muted-foreground/60 mt-2">Use o botão acima para adicionar a primeira nota deste cliente.</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Coluna Direita: Informações Extras */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <ProcessAction
                                clienteId={client.true_id || client.id}
                                processoId={client.processo_id}
                                responsavel={client.responsavel}
                                onActionClick={(action) => {
                                    if (action === 'solicitar_documentos') {
                                        setIsDocModalOpen(true)
                                    } else if (action === 'solicitar_formulario') {
                                        setIsFormModalOpen(true)
                                    } else if (action === 'comercial_agenda') {
                                        navigate('/comercial/agendamento', { 
                                            state: { 
                                                preSelectedClient: client, 
                                                preSelectedProduto: 'Consultoria', 
                                                step: 'data_hora' 
                                            } 
                                        })
                                    } else {
                                        console.log('Action triggered:', action)
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

        </div>
    )
}

