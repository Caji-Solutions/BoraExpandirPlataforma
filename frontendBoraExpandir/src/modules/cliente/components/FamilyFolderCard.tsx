import { useState, useMemo } from 'react'
import { Folder, ChevronDown, ChevronUp, Upload, FileText, CheckCircle, AlertCircle, Clock, Trash2, Loader2 } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Document as ClientDocument, RequiredDocument } from '../types'
import { cn, formatDate, formatFileSize } from '../lib/utils'

interface FamilyMember {
  id: string
  name: string
  type: string
  isTitular?: boolean
}

interface FamilyFolderCardProps {
  member: FamilyMember
  documents: ClientDocument[]
  requiredDocuments: RequiredDocument[]
  isExpanded: boolean
  onToggle: () => void
  onOpenUploadModal: () => void  // New prop to open initial upload modal
  onUpload: (file: File, documentType: string, memberId: string) => Promise<void>
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
  const [pendingUpload, setPendingUpload] = useState<{
    file: File
    documentType: string
    documentName: string
  } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Filter documents for this member
  const memberDocs = useMemo(() => documents.filter(d => d.memberId === member.id), [documents, member.id])


  // Determine the stage of a document
  const getDocStage = (doc: ClientDocument) => {
    if (doc.status === 'rejected') return 'rejected'
    if (doc.status === 'pending') return 'analyzing'
    if (doc.status === 'approved') {
        if (!doc.isApostilled) return 'apostille'
        if (!doc.isTranslated) return 'translation'
        return 'completed'
    }
    return 'analyzing'
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

  // Calculate stats
  const stats = useMemo(() => {
      const s = {
          rejected: 0,
          analyzing: 0,
          apostille: 0,
          translation: 0,
          completed: 0
      }
      memberDocs.forEach(doc => {
          const stage = getDocStage(doc)
          if (stage in s) {
              s[stage as keyof typeof s]++
          }
      })
      return s
  }, [memberDocs])

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

    setPendingUpload({
        file,
        documentType: type,
        documentName: getDocumentName(type)
    })
    setShowConfirmModal(true)
    setUploadError(null)
    
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault()
    setDragOver(null)
    
    const file = e.dataTransfer.files[0]
    if (!file) return

    setPendingUpload({
        file,
        documentType: type,
        documentName: getDocumentName(type)
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
      
      await onUpload(pendingUpload.file, pendingUpload.documentType, member.id)
      
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
                              onChange={(e) => handleFileSelect(e, item.type)}
                              disabled={isUploading}
                            />
                            <Button
                              size="sm"
                              className="h-9 px-4 text-xs font-bold gap-2 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                              onClick={() => document.getElementById(inputId)?.click()}
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
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                    {item.name}
                                  </span>
                                  {item.required && (
                                    <Badge variant="secondary" className="text-[10px] h-5">Obrigatório</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <input
                              type="file"
                              id={inputId}
                              className="hidden"
                              onChange={(e) => handleFileSelect(e, item.type)}
                              disabled={isUploading}
                            />
                            <Button
                              size="sm"
                              className="h-9 px-4 text-xs font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                              onClick={() => document.getElementById(inputId)?.click()}
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
                                        onChange={(e) => handleFileSelect(e, item.type)}
                                        disabled={isUploading}
                                      />

                                      {/* Rejected stage actions */}
                                      {stage.id === 'rejected' && (
                                        <Button
                                          size="sm"
                                          className="h-8 text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white"
                                          onClick={() => document.getElementById(inputId)?.click()}
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
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                          >
                                            Solicitar Apostilamento
                                          </Button>
                                          <Button
                                            size="sm"
                                            className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                                            onClick={() => document.getElementById(inputId)?.click()}
                                          >
                                            <Upload className="h-3 w-3" />
                                            Upload
                                          </Button>
                                        </div>
                                      )}

                                      {/* Translation stage action */}
                                      {stage.id === 'translation' && (
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 text-xs bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                          >
                                            Solicitar Tradução
                                          </Button>
                                          <Button
                                            size="sm"
                                            className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                                            onClick={() => document.getElementById(inputId)?.click()}
                                          >
                                            <Upload className="h-3 w-3" />
                                            Upload 
                                          </Button>
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

    </Card>
    
    {/* Modal de Confirmação de Upload */}
    {showConfirmModal && pendingUpload && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={!isUploading ? handleCancelUpload : undefined}
        />
        
        {/* Modal Content */}
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-xl">
                  {isUploading ? 'Enviando Documento...' : 'Confirmar Envio'}
                </h3>
                <p className="text-blue-100 text-sm mt-1">
                  {isUploading ? 'Aguarde enquanto processamos seu arquivo' : 'Verifique os detalhes antes de enviar'}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            
            {/* Campo/Documento Alvo */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Documento Solicitado
              </label>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    {pendingUpload.documentName}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
                    Para: {member.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Arquivo Selecionado */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Arquivo Selecionado
              </label>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center gap-4">
                <div className="h-10 w-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                   <span className="text-xs font-bold text-gray-500 uppercase">
                     {pendingUpload.file.name.split('.').pop()}
                   </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate" title={pendingUpload.file.name}>
                    {pendingUpload.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(pendingUpload.file.size)}
                  </p>
                </div>
              </div>
            </div>

            {/* Alert/Warning Area */}
            {uploadError ? (
               <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-3">
                 <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                 <p className="text-sm text-red-700 dark:text-red-300">
                   {uploadError}
                 </p>
               </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Certifique-se que o arquivo está legível e completo. Arquivos ilegíveis podem atrasar seu processo.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancelUpload}
              disabled={isUploading}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmUpload}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-none min-w-[140px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Confirmar Envio
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
