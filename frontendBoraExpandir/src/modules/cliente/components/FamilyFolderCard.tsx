import { useState, useMemo, useEffect, useCallback } from 'react'
import { Folder, ChevronDown, ChevronUp, Upload, FileText, CheckCircle, AlertCircle, Clock, Trash2, Loader2 } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Document as ClientDocument, RequiredDocument } from '../types'
import { cn, formatDate, formatFileSize } from '../lib/utils'
import { FormsDeclarationsCard } from './FormsDeclarationsCard'
import { compressFile } from '../../../utils/compressFile'
import { clienteService } from '../services/clienteService'
import { UploadConfirmModal } from './UploadConfirmModal'

interface FamilyMember {
  id: string
  name: string
  type: string
  isTitular?: boolean
  clienteId?: string
}

interface FamilyFolderCardProps {
  member: FamilyMember
  documents: ClientDocument[]
  requiredDocuments: RequiredDocument[]
  processoId?: string
  isExpanded: boolean
  onToggle: () => void
  onOpenUploadModal: () => void  // New prop to open initial upload modal
  onUpload: (file: File, documentType: string, memberId: string, documentoId?: string) => Promise<void>
  onDelete: (documentId: string) => void
}

// Stage configuration - WITHOUT "pending" stage
const stages = [
  {
    id: 'rejected',
    label: 'Rejeitados',
    description: 'Documentos que precisam ser corrigidos',
    color: 'red',
    bgColor: 'bg-red-50 dark:bg-red-900/10',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500',
    dotBg: 'bg-red-500',
  },
  {
    id: 'analyzing',
    label: 'Em Análise',
    description: 'Aguardando revisão',
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
    dotBg: 'bg-blue-500',
  },
  {
    id: 'apostille',
    label: 'Para Apostilar',
    description: 'Aprovados que precisam de apostilamento',
    color: 'amber',
    bgColor: 'bg-amber-50 dark:bg-amber-900/10',
    borderColor: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-500',
    dotBg: 'bg-amber-500',
  },
  {
    id: 'translation',
    label: 'Para Traduzir',
    description: 'Apostilados que precisam de tradução',
    color: 'purple',
    bgColor: 'bg-purple-50 dark:bg-purple-900/10',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-500',
    dotBg: 'bg-purple-500',
  },
  {
    id: 'completed',
    label: 'Concluído',
    description: 'Processo completo',
    color: 'green',
    bgColor: 'bg-green-50 dark:bg-green-900/10',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-500',
    dotBg: 'bg-green-500',
  },
]

export function FamilyFolderCard({
  member,
  documents,
  requiredDocuments,
  processoId,
  isExpanded,
  onToggle,
  onOpenUploadModal,
  onUpload,
  onDelete
}: FamilyFolderCardProps) {
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  // Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showPdfWarning, setShowPdfWarning] = useState(false)
  const [pendingInputId, setPendingInputId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [pendingUpload, setPendingUpload] = useState<{
    file: File
    documentType: string
    documentName: string
    isReplacement?: boolean
    documentoId?: string
  } | null>(null)
  
  // Estado para armazenar IDs de formulários já enviados
  const [sentFormularioIds, setSentFormularioIds] = useState<Set<string>>(new Set())

  // Filter documents for this member
  const memberDocs = useMemo(() => documents.filter(d => d.memberId === member.id), [documents, member.id])

  // Buscar formulários já enviados no carregamento
  const fetchSentForms = useCallback(async () => {
    try {
      console.log('[DEBUG] Buscando formulários enviados para o cliente:', member.clienteId || member.id)
      const responses = await clienteService.getFormularioResponses(member.clienteId || member.id)
      
      // Filtrar pelas respostas que pertencem especificamente a este membro
      // Importante: Para o titular (main client), as respostas no banco podem ter membro_id nulo
      const memberResponses = responses.filter((r: any) => {
          if (member.isTitular) {
              return r.membro_id === member.id || r.membro_id === null;
          }
          return r.membro_id === member.id;
      })
      console.log(`[DEBUG] IDs enviados pelo membro ${member.id}:`, memberResponses.map((r: any) => r.formulario_juridico_id))

      // Extrair IDs dos formulários jurídicos associados
      const ids = new Set<string>(memberResponses.map((r: any) => r.formulario_juridico_id as string))
      setSentFormularioIds(ids)
    } catch (error) {
      console.error('Erro ao buscar formulários enviados:', error)
    }
  }, [member.id, member.clienteId, member.isTitular])

  // Efeito para buscar formulários quando expandido
  useEffect(() => {
    if (isExpanded) {
      fetchSentForms()
    }
  }, [isExpanded, fetchSentForms])


  // Determine the stage of a document
  const getDocStage = (doc: ClientDocument) => {
    const status = doc.status?.toLowerCase();

    if (status === 'rejected') return 'rejected';

    // Se está em qualquer sub-etapa de apostilamento ou aprovado sem apostila
    if (status?.includes('apostille') || (status === 'approved' && !doc.isApostilled)) {
      return 'apostille';
    }

    // Se está em qualquer sub-etapa de tradução ou aprovado com apostila mas sem tradução
    if (status?.includes('translation') || (status === 'approved' && doc.isApostilled && !doc.isTranslated)) {
      return 'translation';
    }

    if (status === 'approved' && doc.isApostilled && doc.isTranslated) {
      return 'completed';
    }

    return 'analyzing';
  }

  const getDocumentsForStage = (stageId: string) => {
    return memberDocs
      .filter(doc => getDocStage(doc) === stageId)
      .map(doc => {
        const reqDoc = requiredDocuments.find(r => r.type === doc.type)
        return {
          type: doc.type,
          name: reqDoc ? reqDoc.name : (doc.fileName || doc.type),
          description: reqDoc?.description,
          _document: doc,
          required: !!reqDoc
        }
      })
  }

  // Calculate pending documents (required but not uploaded)
  const pendingDocs = useMemo(() => {
    const uploadedTypes = new Set(memberDocs.map(d => d.type))
    return requiredDocuments
      .filter(req => !uploadedTypes.has(req.type))
      .map(req => ({
        ...req,
        required: true
      }))
  }, [memberDocs, requiredDocuments])

  // Calculate stats for the three main categories
  const stats = useMemo(() => {
    const s = {
      rejected: 0,
      analyzing: 0,      // Documents under legal/juridico review
      apostille: 0,
      translation: 0,
      completed: 0,      // Fully processed (approved + apostilled + translated)
      waitingAction: 0   // Documents waiting for client action (upload)
    }

    memberDocs.forEach(doc => {
      const statusLower = doc.status?.toLowerCase() || '';

      // Em Análise: Any "analyzing" status
      if (statusLower === 'analyzing' || statusLower === 'analyzing_apostille' || statusLower === 'analyzing_translation') {
        s.analyzing++;
      }
      // Concluídos: Fully approved AND apostilled AND translated
      else if (statusLower === 'approved' && doc.isApostilled && doc.isTranslated) {
        s.completed++;
      }
      // Aguardam Ação: Rejected or waiting for upload
      else if (statusLower === 'rejected') {
        s.rejected++;
        s.waitingAction++;
      }
      else if (statusLower === 'waiting_apostille' || statusLower === 'waiting_translation') {
        s.waitingAction++;
      }
      // Stages for internal tracking
      const stage = getDocStage(doc);
      if (stage === 'apostille') s.apostille++;
      if (stage === 'translation') s.translation++;
    })

    // Add pending (missing) docs to waitingAction
    s.waitingAction += pendingDocs.length;

    return s
  }, [memberDocs, pendingDocs])

  const hasSentDocuments = memberDocs.length > 0
  const hasRejected = stats.rejected > 0
  const hasPending = pendingDocs.length > 0


  const getDocumentName = (type: string) => {
    const doc = requiredDocuments.find(r => r.type === type)
    return doc ? doc.name : type
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Apenas arquivos PDF são aceitos. Por favor, selecione um arquivo .pdf')
      setShowConfirmModal(true)
      e.target.value = ''
      return
    }

    setPendingUpload({
      file,
      documentType: type,
      documentName: getDocumentName(type),
      isReplacement: !!memberDocs.find(d => d.type === type),
      documentoId: memberDocs.find(d => d.type === type)?.id
    })
    setShowConfirmModal(true)
    setUploadError(null)

    e.target.value = ''
  }

  // Handle upload button click - show PDF warning first
  const handleUploadClick = (inputId: string) => {
    setPendingInputId(inputId)
    setShowPdfWarning(true)
  }

  // Confirm PDF warning and open file picker
  const handleConfirmPdfWarning = () => {
    setShowPdfWarning(false)
    if (pendingInputId) {
      document.getElementById(pendingInputId)?.click()
      setPendingInputId(null)
    }
  }

  // Cancel PDF warning
  const handleCancelPdfWarning = () => {
    setShowPdfWarning(false)
    setPendingInputId(null)
  }

  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault()
    setDragOver(null)

    const file = e.dataTransfer.files[0]
    if (!file) return

    // Validate PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Apenas arquivos PDF são aceitos. Por favor, selecione um arquivo .pdf')
      setShowConfirmModal(true)
      return
    }

    setPendingUpload({
      file,
      documentType: type,
      documentName: getDocumentName(type),
      isReplacement: !!memberDocs.find(d => d.type === type),
      documentoId: memberDocs.find(d => d.type === type)?.id
    })
    setShowConfirmModal(true)
    setUploadError(null)
  }

  const handleConfirmUpload = async () => {
    if (!pendingUpload) return

    try {
      setIsUploading(true)
      setUploadError(null)
      // We set uploadingType just for compatibility if needed elsewhere, 
      // but the modal now blocks interaction so it's less critical.
      setUploadingType(pendingUpload.documentType)

      await onUpload(pendingUpload.file, pendingUpload.documentType, member.id, pendingUpload.documentoId)

      // Refresh list of sent forms before closing
      await fetchSentForms()

      // Success
      setShowConfirmModal(false)
      setPendingUpload(null)

    } catch (error: any) {
      console.error("Upload failed", error)
      setUploadError(error.message || "Erro ao enviar documento. Tente novamente.")
    } finally {
      setIsUploading(false)
      setUploadingType(null)
    }
  }

  const handleCancelUpload = () => {
    setShowConfirmModal(false)
    setPendingUpload(null)
    setUploadError(null)
  }

  // Handler passed to FormsDeclarationsCard for uploading signed forms
  const handleFormResponseUpload = async (file: File, formularioId: string) => {
    try {
      setIsUploading(true)
      setUploadError(null)

      // Comprimir arquivo antes do upload
      const compressedFile = await compressFile(file)

      const formData = new FormData()
      formData.append('file', compressedFile)

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const response = await fetch(`${API_BASE_URL}/cliente/formularios/${formularioId}/response`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao enviar formulário assinado')
      }

      const result = await response.json()
      console.log('Formulário assinado enviado com sucesso:', result)
      
      // Atualizar lista de formulários enviados
      await fetchSentForms()
      
      // Show success (you could add a toast notification here)
      alert('Formulário assinado enviado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao enviar formulário:', error)
      setUploadError(error.message || 'Erro ao enviar formulário assinado')
      alert(error.message || 'Erro ao enviar formulário assinado')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle card click - now always toggles
  const handleCardClick = () => {
    onToggle()
  }

  // Filter stages to only show those with documents (exclude rejected as it will be shown separately)
  const visibleStages = stages.filter(stage => {
    const docs = getDocumentsForStage(stage.id)
    return stage.id !== 'rejected' && docs.length > 0
  })

  return (
    <>
      <Card
        className={cn(
          "transition-all duration-300 border-2",
          isExpanded ? "overflow-visible" : "overflow-hidden",
          hasRejected ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700',
          isExpanded && 'shadow-lg'
        )}
      >
        {/* Header - Always visible */}
        <div
          className={cn(
            "sticky top-0 z-10 p-4 cursor-pointer transition-colors border-b backdrop-blur-sm",
            !hasSentDocuments
              ? 'bg-gray-50/95 dark:bg-gray-900/90'
              : hasRejected
                ? 'bg-red-50/95 dark:bg-red-900/90'
                : 'bg-white/95 dark:bg-gray-800/95',
            "hover:bg-gray-50 dark:hover:bg-gray-700/50"
          )}
          onClick={handleCardClick}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Folder Icon */}
              <div className={cn(
                "p-3 rounded-xl",
                !hasSentDocuments
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : hasRejected
                    ? 'bg-red-100 dark:bg-red-900/30'
                    : 'bg-blue-50 dark:bg-blue-900/20'
              )}>
                <Folder className={cn(
                  "h-8 w-8",
                  !hasSentDocuments
                    ? 'text-gray-400'
                    : hasRejected
                      ? 'text-red-500'
                      : 'text-blue-500'
                )} />
              </div>

              {/* Member Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{member.name}</h3>
                  {member.isTitular && (
                    <Badge variant="default" className="text-[10px] px-2 py-0.5 bg-blue-600 hover:bg-blue-700">
                      Titular
                    </Badge>
                  )}
                  {!hasSentDocuments && (
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                      Pendente envio
                    </Badge>
                  )}
                  {hasRejected && (
                    <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
                      Ação Necessária
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{member.type}</p>
              </div>
            </div>

            {/* Stats + Expand Icon */}
            <div className="flex items-center gap-6">
              {/* Mini Stats - Only show if has documents */}
              {hasSentDocuments && (
                <div className="hidden sm:flex items-center gap-4 text-sm">
                  {stats.rejected > 0 && (
                    <>
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-red-600">{stats.rejected}</span>
                        <span className="text-[10px] text-gray-400">Rejeitados</span>
                      </div>
                      <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                    </>
                  )}
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-amber-600">{stats.waitingAction}</span>
                    <span className="text-[10px] text-gray-400">Aguardam Ação</span>
                  </div>
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-blue-600">{stats.analyzing}</span>
                    <span className="text-[10px] text-gray-400">Em Análise</span>
                  </div>
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-green-600">{stats.completed}</span>
                    <span className="text-[10px] text-gray-400">Concluídos</span>
                  </div>
                </div>

              )}

              {/* Icon - Upload for new, Expand for existing */}
              <div className={cn(
                "p-2 rounded-full transition-colors",
                !hasSentDocuments
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : isExpanded
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
              )}>
                {!hasSentDocuments ? (
                  <Upload className="h-5 w-5 text-blue-600" />
                ) : isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-blue-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content - Timeline - Only if has documents */}
        <div className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50/50 dark:bg-gray-900/20 space-y-8">
            {/* Rejected Documents Header - Outside Timeline */}
            {stats.rejected > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    Documentos Rejeitados
                  </Badge>
                  <p className="text-xs text-gray-500 italic">Corrija os documentos abaixo para prosseguir</p>
                </div>

                <div className="grid gap-3">
                  {getDocumentsForStage('rejected').map((item: any, idx: number) => {
                    const doc = item._document
                    const inputId = `file-${member.id}-${item.type}-rejected`
                    const isUploading = uploadingType === item.type

                    return (
                      <div
                        key={'rejected-' + item.type + idx}
                        className="p-4 rounded-xl border-2 border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30">
                                  <FileText className="h-4 w-4 text-red-500" />
                                </div>
                                <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                  {item.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 ml-2">
                                <Badge
                                  variant="default"
                                  className={cn(
                                    "text-[10px] px-1.5 py-0 border-none text-white flex items-center gap-1",
                                    doc?.isApostilled
                                      ? "bg-green-600 hover:bg-green-700"
                                      : "bg-gray-300"
                                  )}
                                >
                                  <CheckCircle className={cn("h-3 w-3", doc?.isApostilled ? "opacity-100" : "opacity-50")} />
                                  Apostilado
                                </Badge>
                                <Badge
                                  variant="default"
                                  className={cn(
                                    "text-[10px] px-1.5 py-0 border-none text-white flex items-center gap-1",
                                    doc?.isTranslated
                                      ? "bg-green-600 hover:bg-green-700"
                                      : "bg-gray-300"
                                  )}
                                >
                                  <CheckCircle className={cn("h-3 w-3", doc?.isTranslated ? "opacity-100" : "opacity-50")} />
                                  Traduzido
                                </Badge>
                              </div>
                            </div>

                            {doc && (
                              <p className="text-xs text-gray-500 ml-9">
                                {doc.fileName} • {formatDate(doc.uploadDate)}
                              </p>
                            )}

                            {doc?.rejectionReason && (
                              <div className="mt-2 ml-9 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30 flex items-start gap-3 w-fit max-w-[80%]">
                                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-bold text-red-800 dark:text-red-400">Motivo da recusa:</p>
                                  <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{doc.rejectionReason}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 shrink-0">
                            <input
                              type="file"
                              id={inputId}
                              className="hidden"
                              accept=".pdf,application/pdf"
                              onChange={(e) => handleFileSelect(e, item.type)}
                              disabled={isUploading}
                            />
                            <Button
                              size="sm"
                              className="h-9 px-4 text-xs font-bold gap-2 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                              onClick={() => handleUploadClick(inputId)}
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Upload className="h-3 w-3" />
                              )}
                              REENVIAR DOCUMENTO
                            </Button>

                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Visual Separator */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-gray-50 dark:bg-gray-900 px-3 text-xs font-medium text-gray-400 uppercase tracking-widest">
                      Fluxo do Processo
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Documents Header - Outside Timeline (For Initial Upload) */}
            {hasPending && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700 border-gray-300">
                    Documentos Pendentes
                  </Badge>
                  <p className="text-xs text-gray-500 italic">Envie os documentos abaixo para iniciar o processo</p>
                </div>

                <div className="grid gap-3">
                  {pendingDocs.map((item: any, idx: number) => {
                    const inputId = `file-${member.id}-${item.type}-pending`
                    const isUploading = uploadingType === item.type
                    
                    // Verificar se já existe um documento deste tipo no banco
                    const existingDoc = memberDocs.find(d => d.type === item.type)
                    const wasAlreadySent = !!existingDoc

                    return (
                      <div
                        key={'pending-' + item.type + idx}
                        className="p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                                <Upload className="h-5 w-5 text-gray-500" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                    {item.name}
                                  </span>
                                  {item.required && (
                                    <Badge variant="secondary" className="text-[10px] h-5">Obrigatório</Badge>
                                  )}
                                  {wasAlreadySent && (
                                    <Badge className="text-[10px] h-5 bg-orange-500 hover:bg-orange-600 text-white">
                                      📄 Já Enviado
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                {wasAlreadySent && (
                                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                                    ⚠️ Este documento será substituído ao enviar novamente
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <input
                              type="file"
                              id={inputId}
                              className="hidden"
                              accept=".pdf,application/pdf"
                              onChange={(e) => handleFileSelect(e, item.type)}
                              disabled={isUploading}
                            />
                            <Button
                              size="sm"
                              className="h-9 px-4 text-xs font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                              onClick={() => handleUploadClick(inputId)}
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Upload className="h-3 w-3" />
                              )}
                              ENVIAR
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Visual Separator if there are other stages */}
                {visibleStages.length > 0 && (
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-gray-50 dark:bg-gray-900 px-3 text-xs font-medium text-gray-400 uppercase tracking-widest">
                        Documentos Enviados
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timeline Container */}
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-amber-300 via-purple-300 to-green-300" />

              {/* Stages */}
              <div className="space-y-6">
                {visibleStages.map((stage) => {
                  const stageDocs = getDocumentsForStage(stage.id)
                  const isEmpty = stageDocs.length === 0

                  return (
                    <div key={stage.id} className="relative pl-10">
                      {/* Stage Dot */}
                      <div className={cn(
                        "absolute left-2 w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 shadow-sm",
                        stage.dotBg,
                        isEmpty && 'opacity-30'
                      )} />

                      {/* Stage Content */}
                      <div className={cn(
                        "rounded-xl border p-4 transition-all",
                        stage.bgColor,
                        stage.borderColor,
                        isEmpty && 'opacity-50'
                      )}>
                        {/* Stage Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className={cn("font-semibold text-sm", `text-${stage.color}-700 dark:text-${stage.color}-400`)}>
                              {stage.label}
                            </h4>
                            <Badge variant="secondary" className="text-[10px]">
                              {stageDocs.length}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">{stage.description}</p>
                        </div>

                        {/* Documents in this stage */}
                        {stageDocs.length > 0 ? (
                          <div className="space-y-2">
                            {stageDocs.map((item: any, idx: number) => {
                              const doc = item._document
                              const isRejected = doc?.status === 'rejected'
                              const inputId = `file-${member.id}-${item.type}`
                              const isUploading = uploadingType === item.type
                              const isDraggedOver = dragOver === item.type

                              return (
                                <div
                                  key={item.type + idx}
                                  className={cn(
                                    "p-3 rounded-lg border bg-white dark:bg-gray-800 transition-all",
                                    isRejected ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700',
                                    isDraggedOver && 'ring-2 ring-blue-400 border-blue-400'
                                  )}
                                  onDrop={(e) => handleDrop(e, item.type)}
                                  onDragOver={(e) => { e.preventDefault(); setDragOver(item.type) }}
                                  onDragLeave={() => setDragOver(null)}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-3 mb-1">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                                          <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                            {item.name}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                          <Badge
                                            variant="default"
                                            className={cn(
                                              "text-[9px] px-1 py-0 border-none text-white flex items-center gap-1",
                                              doc?.isApostilled
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-gray-300"
                                            )}
                                          >
                                            <CheckCircle className={cn("h-2.5 w-2.5", doc?.isApostilled ? "opacity-100" : "opacity-50")} />
                                            Apostilado
                                          </Badge>
                                          <Badge
                                            variant="default"
                                            className={cn(
                                              "text-[9px] px-1 py-0 border-none text-white flex items-center gap-1",
                                              doc?.isTranslated
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-gray-300"
                                            )}
                                          >
                                            <CheckCircle className={cn("h-2.5 w-2.5", doc?.isTranslated ? "opacity-100" : "opacity-50")} />
                                            Traduzido
                                          </Badge>
                                        </div>
                                      </div>

                                      {/* File info if exists */}
                                      {doc && (
                                        <p className="text-xs text-gray-500 ml-6">
                                          {doc.fileName} • {formatDate(doc.uploadDate)}
                                          {doc.fileSize && ` • ${formatFileSize(doc.fileSize)}`}
                                        </p>
                                      )}

                                      {/* Rejection reason */}
                                      {isRejected && doc.rejectionReason && (
                                        <div className="mt-2 ml-6 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                                          <div className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                              <p className="text-xs font-medium text-red-700 dark:text-red-400">Motivo da recusa:</p>
                                              <p className="text-xs text-red-600 dark:text-red-300">{doc.rejectionReason}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                      <input
                                        type="file"
                                        id={inputId}
                                        className="hidden"
                                        accept=".pdf,application/pdf"
                                        onChange={(e) => handleFileSelect(e, item.type)}
                                        disabled={isUploading}
                                      />

                                      {/* Rejected stage actions */}
                                      {stage.id === 'rejected' && (
                                        <Button
                                          size="sm"
                                          className="h-8 text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white"
                                          onClick={() => handleUploadClick(inputId)}
                                          disabled={isUploading}
                                        >
                                          {isUploading ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <Upload className="h-3 w-3" />
                                          )}
                                          Corrigir
                                        </Button>
                                      )}

                                      {/* Apostille stage action */}
                                      {stage.id === 'apostille' && (
                                        <div className="flex gap-2">
                                          {(doc?.status === 'waiting_apostille' || doc?.status === 'approved') ? (
                                            <Button
                                              size="sm"
                                              className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                                              onClick={() => handleUploadClick(inputId)}
                                              disabled={isUploading}
                                            >
                                              <Upload className="h-3 w-3" />
                                              Upload Apostila
                                            </Button>
                                          ) : (
                                            <div className="flex items-center gap-1 text-amber-600 text-xs font-medium px-2 py-1 bg-amber-50 rounded-full">
                                              <Clock className="h-4 w-4" />
                                              <span>Em Análise</span>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Translation stage action */}
                                      {stage.id === 'translation' && (
                                        <div className="flex gap-2">
                                          {(doc?.status === 'waiting_translation' || (doc?.status === 'approved' && doc.isApostilled)) ? (
                                            <Button
                                              size="sm"
                                              className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                                              onClick={() => handleUploadClick(inputId)}
                                              disabled={isUploading}
                                            >
                                              <Upload className="h-3 w-3" />
                                              Upload Tradução
                                            </Button>
                                          ) : (
                                            <div className="flex items-center gap-1 text-purple-600 text-xs font-medium px-2 py-1 bg-purple-50 rounded-full">
                                              <Clock className="h-4 w-4" />
                                              <span>Em Análise</span>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Completed stage - just show check */}
                                      {stage.id === 'completed' && (
                                        <div className="flex items-center gap-1 text-green-600 text-xs font-medium px-2 py-1 bg-green-50 rounded-full">
                                          <CheckCircle className="h-4 w-4" />
                                          <span>Verificado</span>
                                        </div>
                                      )}

                                      {/* Analyzing stage - show clock */}
                                      {stage.id === 'analyzing' && (
                                        <div className="flex items-center gap-1 text-blue-600 text-xs font-medium px-2 py-1 bg-blue-50 rounded-full">
                                          <Clock className="h-4 w-4" />
                                          <span>Aguardando</span>
                                        </div>
                                      )}

                                      {/* Delete button for rejected docs */}
                                      {doc && doc.status === 'rejected' && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                          onClick={() => onDelete(doc.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Nenhum documento nesta etapa</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Formulários e Declarações Section */}
        {processoId && (
          <FormsDeclarationsCard
            memberId={member.id}
            memberName={member.name}
            processoId={processoId}
            clienteId={member.clienteId}
            isTitular={member.isTitular}
            onUpload={handleFormResponseUpload}
          />
        )}

      </Card>

      {/* Modal de Confirmação de Upload */}
      {pendingUpload && (
        <UploadConfirmModal
          isOpen={showConfirmModal}
          onClose={handleCancelUpload}
          onConfirm={handleConfirmUpload}
          isUploading={isUploading}
          uploadError={uploadError}
          pendingUpload={{
            file: pendingUpload.file,
            documentName: pendingUpload.documentName,
            isReplacement: pendingUpload.isReplacement,
            targetName: member.name
          }}
        />
      )}

      {/* PDF Warning Modal */}
      {showPdfWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancelPdfWarning}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Formato de Arquivo
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">
                    Informação importante
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 dark:text-amber-100">
                      Somente arquivos PDF são aceitos!
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Por favor, certifique-se de que seu documento está no formato <span className="font-bold">.PDF</span> antes de enviar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">Dicas para digitalizar seu documento:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Use um aplicativo de scanner no celular (ex: CamScanner, Adobe Scan)</li>
                  <li>Certifique-se de que o documento está legível</li>
                  <li>Salve o arquivo em formato PDF</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCancelPdfWarning}
                className="border-gray-300 dark:border-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmPdfWarning}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Entendi, Selecionar PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
