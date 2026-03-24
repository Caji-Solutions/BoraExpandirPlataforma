import { useState, useEffect, useMemo } from 'react'
import { 
    FileDown, 
    Search, 
    Folder, 
    User, 
    ChevronRight, 
    ChevronLeft, 
    FileText, 
    Download, 
    Upload, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Button } from '@/modules/shared/components/ui/button'
import { Input } from '@/modules/shared/components/ui/input'
import { Badge } from '@/components/ui/Badge'
import { cn, formatDateSimple } from '../../cliente/lib/utils'
import { apostilamentoService, Apostilamento } from '../services/apostilamentoService'

type ViewState = 'folders' | 'members' | 'analysis'

interface FolderData {
    titularId: string
    titularName: string
    totalDocs: number
    pendingDocs: number
    members: Record<string, {
        name: string
        isTitular: boolean
        apostilamentos: Apostilamento[]
    }>
}

export function AdminApostilamento() {
    const [view, setView] = useState<ViewState>('folders')
    const [apostilamentos, setApostilamentos] = useState<Apostilamento[]>([])
    const [loading, setLoading] = useState(true)
    const [isUploading, setIsUploading] = useState<Record<string, boolean>>({})
    const [searchTerm, setSearchTerm] = useState('')
    
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const data = await apostilamentoService.getAllApostilamentos()
            setApostilamentos(data)
        } catch (error) {
            console.error('Erro ao buscar apostilamentos:', error)
        } finally {
            setLoading(false)
        }
    }

    // Grouping logic
    const folders = useMemo(() => {
        const map: Record<string, FolderData> = {}

        // FILTRO: Só exibe documentos que já passaram pela conferência de pagamento
        // Status aceitáveis para o administrativo processar ou visualizar histórico
        const allowedStatuses = ['pronto_para_apostilagem', 'executing_apostille', 'concluido', 'em_processamento'];

        apostilamentos
            .filter(ap => allowedStatuses.includes(ap.status.toLowerCase()))
            .forEach(ap => {
                const doc = ap.documentos
                if (!doc) return

            const titularId = doc.cliente_id
            const titularName = doc.clientes?.nome || 'Titular Desconhecido'
            const memberId = doc.dependente_id || titularId
            const memberName = doc.dependente_id ? (doc as any).dependentes?.nome_completo || 'Dependente' : titularName

            if (!map[titularId]) {
                map[titularId] = {
                    titularId,
                    titularName,
                    totalDocs: 0,
                    pendingDocs: 0,
                    members: {}
                }
            }

            if (!map[titularId].members[memberId]) {
                map[titularId].members[memberId] = {
                    name: memberName,
                    isTitular: !doc.dependente_id,
                    apostilamentos: []
                }
            }

            map[titularId].totalDocs++
            if (ap.status === 'pronto_para_apostilagem') map[titularId].pendingDocs++
            map[titularId].members[memberId].apostilamentos.push(ap)
        })

        return Object.values(map)
    }, [apostilamentos])

    const filteredFolders = folders.filter(f => 
        f.titularName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.titularId.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedFolder = folders.find(f => f.titularId === selectedFolderId)
    const sortedMembers = selectedFolder 
        ? Object.entries(selectedFolder.members).sort((a, b) => b[1].isTitular ? 1 : -1) 
        : []

    const selectedMember = selectedFolder?.members[selectedMemberId || '']

    const handleUpdateStatus = async (id: string, status: string, fileUrl?: string) => {
        try {
            await apostilamentoService.updateStatus(id, { status, documentoApostiladoUrl: fileUrl })
            fetchData() // Refresh
        } catch (error) {
            alert('Erro ao atualizar status do apostilamento')
        }
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setIsUploading(prev => ({ ...prev, [id]: true }))
            
            // Simulate network delay for "WOW" effect
            await new Promise(resolve => setTimeout(resolve, 1500))

            // In a real app, upload file to storage first
            const mockUrl = 'https://exemplo.com/arquivo-apostilado.pdf'
            await handleUpdateStatus(id, 'concluido', mockUrl)
            
        } catch (error) {
            console.error(error)
        } finally {
            setIsUploading(prev => ({ ...prev, [id]: false }))
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Carregando apostilamentos...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        {view !== 'folders' && (
                            <button 
                                onClick={() => {
                                    if (view === 'analysis') setView('members')
                                    else setView('folders')
                                }}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        )}
                        Gestão de Apostilagem
                    </h1>
                    <p className="text-muted-foreground ml-1">
                        {view === 'folders' && "Fila administrativa de documentos para apostilamento."}
                        {view === 'members' && `Membros do projeto de ${selectedFolder?.titularName}`}
                        {view === 'analysis' && `Documentos de ${selectedMember?.name}`}
                    </p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar por cliente ou ID..." 
                        className="pl-10 h-11 rounded-xl shadow-sm border-2 border-transparent focus:border-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* View Switching */}
            {view === 'folders' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFolders.length > 0 ? filteredFolders.map(folder => (
                        <Card 
                            key={folder.titularId}
                            className="group hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md border-border/60"
                            onClick={() => {
                                setSelectedFolderId(folder.titularId)
                                setView('members')
                            }}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <Folder className="h-6 w-6 text-primary" />
                                    </div>
                                    {folder.pendingDocs > 0 && (
                                        <Badge variant="destructive" className="animate-pulse">
                                            {folder.pendingDocs} pendente(s)
                                        </Badge>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg truncate">{folder.titularName}</h3>
                                    <p className="text-xs text-muted-foreground font-mono">ID: {folder.titularId.substring(0, 8)}...</p>
                                </div>
                                <div className="mt-6 pt-6 border-t flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{folder.totalDocs} documentos totais</span>
                                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full py-20 text-center space-y-4 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                            <Folder className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground">Nenhuma pasta encontrada para apostilamento.</p>
                        </div>
                    )}
                </div>
            )}

            {view === 'members' && (
                <div className="bg-card border rounded-3xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-muted/30 border-b text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                        <div className="col-span-6">Membro da Família</div>
                        <div className="col-span-3 text-center">Status</div>
                        <div className="col-span-3 text-right">Ações</div>
                    </div>
                    <div className="divide-y divide-border/60">
                        {sortedMembers.map(([id, member]) => (
                            <div 
                                key={id}
                                className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-muted/10 transition-colors cursor-pointer group"
                                onClick={() => {
                                    setSelectedMemberId(id)
                                    setView('analysis')
                                }}
                            >
                                <div className="col-span-6 flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{member.name}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                            {member.isTitular ? "Titular do Projeto" : "Dependente"}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-3 flex justify-center gap-2">
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                        {member.apostilamentos.filter(a => a.status === 'pronto_para_apostilagem').length} Pendentes
                                    </Badge>
                                </div>
                                <div className="col-span-3 flex justify-end">
                                    <Button variant="ghost" size="sm" className="rounded-xl group-hover:bg-primary/10 group-hover:text-primary">
                                        Ver Documentos
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'analysis' && (
                <div className="grid gap-6">
                    {selectedMember?.apostilamentos.map(ap => (
                        <Card key={ap.id} className="overflow-hidden border-border/60 shadow-sm">
                            <div className="flex flex-col md:flex-row">
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">{ap.documentos?.nome_original || "Documento"}</h4>
                                                <p className="text-xs text-muted-foreground">{ap.documentos?.tipo || "Apostilamento"}</p>
                                            </div>
                                        </div>
                                        <Badge 
                                            className={cn(
                                                "rounded-lg px-3 py-1",
                                                ap.status === 'pronto_para_apostilagem' ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                ap.status === 'concluido' ? "bg-green-100 text-green-700 border-green-200" :
                                                "bg-blue-100 text-blue-700 border-blue-200"
                                            )}
                                        >
                                            {ap.status === 'pronto_para_apostilagem' ? "Pronto para Apostila" : 
                                             ap.status === 'concluido' ? "Apostilado" : ap.status}
                                        </Badge>
                                    </div>

                                    {ap.observacoes && (
                                        <div className="p-3 bg-muted/40 rounded-xl border border-dashed border-border/60">
                                            <p className="text-xs italic text-muted-foreground line-clamp-2">
                                                "{ap.observacoes}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" />
                                            Solicitado: {formatDateSimple(ap.solicitado_em)}
                                        </div>
                                        {ap.concluido_em && (
                                            <div className="flex items-center gap-1.5 text-green-600">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Concluído: {formatDateSimple(ap.concluido_em)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 bg-muted/20 border-t md:border-t-0 md:border-l border-border/60 flex flex-col justify-center gap-3 w-full md:w-64">
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start gap-3 h-12 rounded-xl border-2"
                                        onClick={() => window.open(ap.documento_url, '_blank')}
                                    >
                                        <Download className="h-4 w-4 text-blue-600" />
                                        Baixar Original
                                    </Button>

                                    {ap.status !== 'concluido' ? (
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handleFileUpload(e, ap.id)}
                                            />
                                            <Button 
                                                disabled={isUploading[ap.id]}
                                                className="w-full justify-start gap-3 h-12 rounded-xl bg-amber-600 hover:bg-amber-700 shadow-md group/upload active:scale-[0.98] transition-all"
                                            >
                                                {isUploading[ap.id] ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Upload className="h-4 w-4 group-hover/upload:-translate-y-1 transition-transform" />
                                                )}
                                                {isUploading[ap.id] ? "Enviando..." : "Upload Apostilado"}
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button 
                                            variant="secondary"
                                            className="w-full justify-start gap-3 h-12 rounded-xl"
                                            onClick={() => window.open(ap.documento_apostilado_url, '_blank')}
                                        >
                                            <FileDown className="h-4 w-4 text-green-600" />
                                            Ver Apostilado
                                        </Button>
                                    )}

                                    {ap.status === 'pronto_para_apostilagem' && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleUpdateStatus(ap.id, 'cancelado')}
                                        >
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Cancelar Solicitação
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                    {selectedMember?.apostilamentos.length === 0 && (
                        <div className="py-20 text-center space-y-4 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                            <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground">Nenhum documento aguardando apostila para este membro.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
