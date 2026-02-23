import { useState, useEffect, useRef } from 'react'
import {
    ClipboardList,
    Clock,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    CheckCircle2,
    Briefcase,
    FileText,
    ExternalLink,
    Upload
} from 'lucide-react'
import { Badge } from './ui/badge'
import { cn, formatDate } from '../lib/utils'
import { clienteService } from '../services/clienteService'
import { compressFile } from '../../../utils/compressFile'

interface Requerimento {
    id: string
    tipo: string
    status: string
    observacoes: string
    created_at: string
    updated_at: string
    documentos?: any[]
}

interface RequirementsCardProps {
    clienteId: string
    processoId?: string
    membroId?: string
    initialRequirements?: any[]
    alwaysExpanded?: boolean
    onUploadSuccess?: () => void
}

export function RequirementsCard({
    clienteId,
    processoId,
    membroId,
    initialRequirements,
    alwaysExpanded = false,
    onUploadSuccess
}: RequirementsCardProps) {
    const [isExpanded, setIsExpanded] = useState(alwaysExpanded)
    const [requirements, setRequirements] = useState<Requerimento[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [uploadingDocId, setUploadingDocId] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [pendingDocId, setPendingDocId] = useState<string | null>(null)
    const [pendingDocContext, setPendingDocContext] = useState<any | null>(null)

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

    useEffect(() => {
        const processRequirements = (data: any[]) => {
            let filtered = data
            if (membroId) {
                filtered = data.filter((req: Requerimento) =>
                    req.documentos?.some(doc => (doc.dependente_id || doc.cliente_id) === membroId) ||
                    (req as any).membro_id === membroId
                ).map((req: Requerimento) => ({
                    ...req,
                    documentos: req.documentos?.filter(doc => (doc.dependente_id || doc.cliente_id) === membroId)
                }))
            }
            setRequirements(filtered)

            if (filtered.some(r => r.status === 'pendente')) {
                setIsExpanded(true)
            }
        }

        if (initialRequirements) {
            processRequirements(initialRequirements)
            return
        }

        const fetchRequirements = async () => {
            if (!clienteId) return

            setIsLoading(true)
            try {
                const data = await clienteService.getRequerimentos(clienteId)
                processRequirements(data)
            } catch (error) {
                console.error('Erro ao buscar requerimentos:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchRequirements()
    }, [clienteId, membroId, initialRequirements])

    const handleUploadClick = (doc: any) => {
        setPendingDocId(doc.id)
        setPendingDocContext(doc)
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !pendingDocId || !pendingDocContext) return

        try {
            setUploadingDocId(pendingDocId)
            const compressed = await compressFile(file)
            const formData = new FormData()
            formData.append('file', compressed)
            formData.append('documentoId', pendingDocId)
            formData.append('clienteId', clienteId)
            formData.append('documentType', pendingDocContext.tipo || '')
            if (processoId) formData.append('processoId', processoId)
            if (membroId) formData.append('memberId', membroId)

            const response = await fetch(`${API_BASE_URL}/cliente/uploadDoc`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) throw new Error('Falha ao enviar arquivo')

            if (onUploadSuccess) onUploadSuccess()
        } catch (error) {
            console.error('Erro ao enviar documento:', error)
            alert('Erro ao enviar documento. Tente novamente.')
        } finally {
            setUploadingDocId(null)
            setPendingDocId(null)
            setPendingDocContext(null)
            e.target.value = ''
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pendente':
                return <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-bold text-[10px]">PENDENTE</Badge>
            case 'em_analise':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-bold text-[10px]">ANÁLISE</Badge>
            case 'concluido':
            case 'concluído':
                return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-bold text-[10px]">CONCLUÍDO</Badge>
            default:
                return <Badge variant="secondary" className="font-bold text-[10px]">{status.toUpperCase()}</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pendente':
                return <Clock className="h-4 w-4 text-amber-500" />
            case 'concluido':
            case 'concluído':
                return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            default:
                return <AlertCircle className="h-4 w-4 text-blue-500" />
        }
    }

    const getDocStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-[9px] font-bold px-1.5 py-0">Pendente</Badge>
            case 'ANALYZING':
                return <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-[9px] font-bold px-1.5 py-0">Enviado</Badge>
            case 'APPROVED':
                return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[9px] font-bold px-1.5 py-0">Aprovado</Badge>
            default:
                return <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0">{status}</Badge>
        }
    }

    const hasPending = requirements.some(r => r.status === 'pendente')

    return (
        <div className={alwaysExpanded ? '' : 'mt-4 first:mt-0'}>
            {/* Hidden file input for uploads */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Header - hidden when alwaysExpanded */}
            {!alwaysExpanded && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(
                        "w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border rounded-2xl transition-all group",
                        hasPending
                            ? "border-red-500 shadow-sm shadow-red-500/10 hover:border-red-600"
                            : "border-border hover:border-blue-500/30"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">
                                Requerimentos Jurídicos
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                    {requirements.length} {requirements.length === 1 ? 'Processo' : 'Processos'} em aberto
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-blue-500" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-blue-500" />
                        )}
                    </div>
                </button>
            )}

            {/* Expanded Content */}
            {(isExpanded || alwaysExpanded) && (
                <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-3">
                            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sincronizando Dados...</span>
                        </div>
                    ) : requirements.length === 0 ? (
                        <div className="py-10 text-center bg-muted/20 rounded-2xl border border-dashed border-border mx-2">
                            <ClipboardList className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-30" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed px-10">
                                Nenhum requerimento especial<br />localizado para este membro.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 px-2">
                            {requirements.map((req) => (
                                <div
                                    key={req.id}
                                    className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden shadow-sm"
                                >
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                                    {getStatusIcon(req.status)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <h5 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">
                                                        {req.tipo}
                                                    </h5>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        {getStatusBadge(req.status)}
                                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                            {formatDate(new Date(req.created_at))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <div className="text-[9px] uppercase font-black text-muted-foreground tracking-tighter opacity-50">Protocólo</div>
                                                <div className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-0.5">
                                                    #{req.id.split('-')[0].toUpperCase()}
                                                </div>
                                            </div>
                                        </div>

                                        {req.observacoes && (
                                            <div className="mt-4 p-3 bg-muted/30 rounded-xl text-xs text-muted-foreground border-l-4 border-blue-500/30">
                                                <span className="font-black text-[9px] uppercase block mb-1">Notas da Equipe:</span>
                                                {req.observacoes}
                                            </div>
                                        )}

                                        {/* Linked Documents - Inline Layout */}
                                        {req.documentos && req.documentos.length > 0 && (
                                            <div className="mt-4 border-t border-border/50 pt-3 space-y-1.5">
                                                {req.documentos.map((doc: any) => (
                                                    <div key={doc.id} className="flex items-center justify-between py-2 px-3 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                            <span className="text-[11px] font-bold text-foreground truncate">{doc.tipo}</span>
                                                            {getDocStatusBadge(doc.status)}
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0 ml-3">
                                                            {doc.public_url && (
                                                                <button
                                                                    onClick={() => window.open(doc.public_url, '_blank')}
                                                                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[9px] font-bold uppercase tracking-wide transition-all active:scale-95"
                                                                >
                                                                    <ExternalLink className="h-3 w-3" />
                                                                    Ver
                                                                </button>
                                                            )}
                                                            {doc.status === 'PENDING' && (
                                                                <button
                                                                    onClick={() => handleUploadClick(doc)}
                                                                    disabled={uploadingDocId === doc.id}
                                                                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[9px] font-bold uppercase tracking-wide transition-all active:scale-95 disabled:opacity-50"
                                                                >
                                                                    {uploadingDocId === doc.id ? (
                                                                        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                                                                    ) : (
                                                                        <Upload className="h-3 w-3" />
                                                                    )}
                                                                    Enviar
                                                                </button>
                                                            )}
                                                            {doc.status === 'APPROVED' && !doc.public_url && (
                                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-muted/10 p-2 flex justify-center border-t border-border/50">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                            Última atualização: {formatDate(new Date(req.updated_at))}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
