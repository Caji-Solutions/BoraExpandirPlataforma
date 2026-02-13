import React, { useState, useEffect, useCallback } from 'react'
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
    ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ClientDNAData, ClientNote, CATEGORIAS_LIST, formatDate } from './ClientDNA'
import { ProcessAction } from '../../modules/juridico/components/ProcessAction'
import { DocumentRequestModal } from '../../modules/juridico/components/DocumentRequestModal'

export function DNAClientDetailView({
    client,
    onBack
}: {
    client: ClientDNAData
    onBack: () => void
}) {
    const [copiedId, setCopiedId] = useState(false)
    const [noteStageId, setNoteStageId] = useState<string | null>(null)
    const [newNote, setNewNote] = useState('')
    const [notes, setNotes] = useState<ClientNote[]>([])
    const [loadingNotes, setLoadingNotes] = useState(false)
    const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set([client.categoria]))
    const [isDocModalOpen, setIsDocModalOpen] = useState(false)

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
                    author: n.autor?.full_name || 'Jurídico',
                    createdAt: n.created_at,
                    stageId: n.etapa
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
                    texto: newNote
                })
            })

            if (response.ok) {
                const result = await response.json()
                const n = result.data
                const note: ClientNote = {
                    id: n.id,
                    text: n.texto,
                    author: n.autor?.full_name || 'Jurídico',
                    createdAt: n.created_at,
                    stageId: n.etapa
                }
                setNotes([note, ...notes])
                setNewNote('')
                setNoteStageId(null)
            }
        } catch (err) {
            console.error('Erro ao salvar nota:', err)
        }
    }

    const currentStageIndex = CATEGORIAS_LIST.findIndex(cat => cat.id === client.categoria)

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
                                    <button onClick={handleCopyId} className="hover:text-primary transition-colors">
                                        {copiedId ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </div>
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Linha do Tempo (Timeline) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-8 relative">
                            <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3">
                                <History className="h-6 w-6 text-primary" />
                                Timeline do Processo
                            </h3>

                            <div className="space-y-0 relative ml-4">
                                {/* Linha vertical decorativa */}
                                <div className="absolute left-[15px] top-2 bottom-6 w-0.5 bg-border" />

                                {CATEGORIAS_LIST.map((stage, index) => {
                                    const isCurrent = stage.id === client.categoria
                                    const isCompleted = index < currentStageIndex
                                    const isFuture = index > currentStageIndex
                                    const stageNotes = notes.filter(n => n.stageId === stage.id)

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
                                                            <div key={note.id} className="bg-muted/30 border border-border/50 rounded-xl p-4 text-sm relative">
                                                                <div className="flex justify-between items-center mb-2 opacity-70">
                                                                    <span className="font-bold flex items-center gap-1.5"><User className="h-3 w-3" /> {note.author}</span>
                                                                    <span className="text-[10px]">{new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
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
                    </div>

                    {/* Coluna Direita: Informações Extras */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <ProcessAction 
                                clienteId={client.true_id || client.id}
                                processoId={client.processo_id}
                                onActionClick={(action) => {
                                    if (action === 'solicitar_documentos') {
                                        setIsDocModalOpen(true)
                                    } else {
                                        console.log('Action triggered:', action)
                                    }
                                }}
                            />
                        </div>

                        {/* Notas Gerais (sem etapa) */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Post-it</h3>
                            <div className="space-y-3">
                                {notes.filter(n => !n.stageId).length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-4 italic">Nenhuma nota geral</p>
                                ) : (
                                    notes.filter(n => !n.stageId).map(note => (
                                        <div key={note.id} className="bg-muted/30 border border-border/50 rounded-xl p-3 text-xs">
                                            <p className="text-foreground/90">{note.text}</p>
                                            <div className="flex justify-between mt-2 opacity-50">
                                                <span>{note.author}</span>
                                                <span>{new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DocumentRequestModal 
                isOpen={isDocModalOpen}
                onOpenChange={setIsDocModalOpen}
                clienteId={client.true_id || client.id}
                processoId={client.processo_id}
            />
        </div>
    )
}
