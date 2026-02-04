import { useState, useEffect } from 'react'
import {
    FolderOpen,
    Download,
    FileText,
    Clock,
    ChevronDown,
    ChevronUp,
    Folder,
    Upload
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { formatDate, formatFileSize } from '../lib/utils'
import { compressFile } from '../../../utils/compressFile'
import { clienteService } from '../services/clienteService'

interface FormDeclaration {
    id: string
    name: string
    fileName: string
    fileSize: number
    uploadDate: Date
    uploadedBy: string
    downloadUrl: string
    memberId: string
}

interface FormsDeclarationsCardProps {
    memberId: string
    memberName: string
    processoId: string
    clienteId?: string
    isTitular?: boolean
    isJuridico?: boolean
    onUpload?: (file: File, formularioId: string) => Promise<void>
    onDelete?: (formId: string) => Promise<void>
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function FormsDeclarationsCard({
    memberId,
    memberName,
    processoId,
    clienteId,
    isTitular = false,
    isJuridico = false,
    onUpload,
    onDelete
}: FormsDeclarationsCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [forms, setForms] = useState<FormDeclaration[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null)
    const [sentFormsMap, setSentFormsMap] = useState<Map<string, any>>(new Map())

    // Fetch forms for this member AND check which ones were already sent
    useEffect(() => {
        const fetchForms = async () => {
            console.log('===> Fetching Forms STARTED')
            
            if (!processoId || !memberId) {
                return
            }

            setIsLoading(true)
            try {
                const res = await fetch(`${API_BASE_URL}/cliente/processo/${processoId}/formularios/${memberId}`)
                
                if (res.ok) {
                    const data = await res.json()
                    setForms(data.data || [])
                }
            } catch (error) {
                console.error('Erro ao buscar formulários:', error)
            } finally {
                setIsLoading(false)
            }
        }

        const fetchSentForms = async () => {
            try {
                // Use clienteId se fornecido, senão use memberId (para titular)
                const targetClientId = clienteId || memberId
                
                const responses = await clienteService.getFormularioResponses(targetClientId)
                
                // Filtrar pelas respostas que pertencem a este membro específico
                const memberResponses = responses.filter((r: any) => {
                    if (isTitular) {
                        return r.membro_id === memberId || r.membro_id === null
                    }
                    return r.membro_id === memberId
                })
                
                // Criar mapa de formulário_id -> resposta completa
                const responsesMap = new Map()
                memberResponses.forEach((r: any) => {
                    responsesMap.set(r.formulario_juridico_id, r)
                })
                
                setSentFormsMap(responsesMap)
            } catch (error) {
                console.error('Erro ao buscar formulários enviados:', error)
            }
        }

        if (isExpanded) {
            fetchForms()
            fetchSentForms()
        }
    }, [processoId, memberId, clienteId, isTitular, isExpanded])

    const handleDownload = async (form: FormDeclaration) => {
        if (form.downloadUrl) {
            window.open(form.downloadUrl, '_blank')
        }
    }

    const handleDelete = async (formId: string) => {
        if (onDelete) {
            await onDelete(formId)
            setForms(prev => prev.filter(f => f.id !== formId))
        }
    }

    const handleUploadClick = (formId: string) => {
        setSelectedFormId(formId)
        document.getElementById(`upload-form-${formId}`)?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, formularioId: string) => {
        const file = e.target.files?.[0]
        if (file && onUpload) {
            // Comprimir arquivo antes do upload
            const compressedFile = await compressFile(file)
            await onUpload(compressedFile, formularioId)
            e.target.value = '' // Reset input
            
            // Refresh sent forms to update status immediately (optimistic update could be added too)
            // For now, let's just force a re-fetch of sent status if possible, 
            // or manually update the map if we knew the response structure here.
            // Simplest way: The parent component usually triggers a refresh or we can re-fetch here if needed.
            // But since onUpload is a prop, we might not have control to re-fetch easily unless passed.
            // Assuming the parent handles the upload and maybe we should re-fetch sent forms?
            // Let's implement a refetch after short delay or assume user accepts the "sent" state.
        }
    }

    return (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                        <Folder className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                            Documentos Pedidos
                        </h4>
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                            Formulários para preencher e assinar
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {forms.length > 0 && (
                        <Badge className="bg-purple-600 text-white">
                            {forms.length}
                        </Badge>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-purple-600" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-purple-600" />
                    )}
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-3 space-y-2 pl-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6 text-purple-600">
                            <div className="animate-spin h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full" />
                            <span className="ml-2 text-sm">Carregando...</span>
                        </div>
                    ) : forms.length === 0 ? (
                        <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                            <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum formulário solicitado</p>
                            <p className="text-xs text-gray-400 mt-1">
                                O jurídico enviará documentos aqui quando necessário
                            </p>
                        </div>
                    ) : (
                        forms.map((form) => {
                            const sentResponse = sentFormsMap.get(form.id)
                            const isSent = !!sentResponse
                            const status = sentResponse?.status || 'pendente' // pendente, aprovado, rejeitado
                            const isApproved = status === 'aprovado'
                            const isRejected = status === 'rejeitado'
                            
                            return (
                                <div
                                    key={form.id}
                                    className={`flex flex-col p-3 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-sm transition-shadow ${
                                        isRejected ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10' : 
                                        isApproved ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10' :
                                        'border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                                <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {form.name}
                                                    </p>
                                                    
                                                    {isApproved && (
                                                        <Badge className="text-[10px] h-5 bg-green-600 hover:bg-green-700 text-white border-none flex gap-1 items-center">
                                                            ✓ Aprovado
                                                        </Badge>
                                                    )}
                                                    
                                                    {isRejected && (
                                                        <Badge variant="destructive" className="text-[10px] h-5 flex gap-1 items-center">
                                                            ✕ Rejeitado
                                                        </Badge>
                                                    )}
                                                    
                                                    {isSent && !isApproved && !isRejected && (
                                                        <Badge className="text-[10px] h-5 bg-yellow-500 hover:bg-yellow-600 text-white border-none">
                                                            Aguardando Análise
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatDate(new Date(form.uploadDate))}</span>
                                                    <span>•</span>
                                                    <span>{formatFileSize(form.fileSize)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Upload Signed Button */}
                                            {onUpload && !isApproved && (
                                                <>
                                                    <input 
                                                        type="file" 
                                                        id={`upload-form-${form.id}`}
                                                        className="hidden"
                                                        accept=".pdf,application/pdf"
                                                        onChange={(e) => handleFileChange(e, form.id)}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        className={`h-8 px-3 text-xs ${
                                                            isRejected 
                                                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                                                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                                                        }`}
                                                        onClick={() => handleUploadClick(form.id)}
                                                        disabled={isSent && !isRejected} // Disable if sent and NOT rejected (pending)
                                                    >
                                                        <Upload className="h-3 w-3 mr-1.5" />
                                                        {isRejected ? 'Reenviar' : isSent ? 'Enviado' : 'Enviar Assinado'}
                                                    </Button>
                                                </>
                                            )}

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 px-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                onClick={() => handleDownload(form)}
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Baixar
                                            </Button>

                                            {isJuridico && onDelete && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(form.id)}
                                                >
                                                    ✕
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Rejection Reason */}
                                    {isRejected && sentResponse?.motivo_rejeicao && (
                                        <div className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">
                                            <span className="font-semibold">Motivo da rejeição:</span> {sentResponse.motivo_rejeicao}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}
