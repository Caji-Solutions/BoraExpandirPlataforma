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

  // Filter documents for this member
  const memberDocs = useMemo(() => documents.filter(d => d.memberId === member.id), [documents, member.id])

  // Check if member has sent ANY documents (first time flow)
  const hasSentDocuments = memberDocs.length > 0

  // Calculate stats
  const stats = useMemo(() => {
    const rejected = memberDocs.filter(d => d.status === 'rejected').length
    const analyzing = memberDocs.filter(d => d.status === 'analyzing' || d.status === 'sent_for_apostille' || d.status === 'pending').length
    const approved = memberDocs.filter(d => d.status === 'approved').length
    
    // Para apostilar: approved but not apostilled
    const toApostille = memberDocs.filter(d => d.status === 'approved' && !d.isApostilled).length
    // Para traduzir: approved and apostilled but not translated
    const toTranslate = memberDocs.filter(d => d.status === 'approved' && d.isApostilled && !d.isTranslated).length
    // Completed: approved, apostilled and translated
    const completed = memberDocs.filter(d => d.status === 'approved' && d.isApostilled && d.isTranslated).length

    return { rejected, analyzing, approved, toApostille, toTranslate, completed }
  }, [memberDocs])

  const hasRejected = stats.rejected > 0

  // Categorize documents by stage
  const getDocumentsForStage = (stageId: string) => {
    switch (stageId) {
      case 'rejected':
        // Only rejected documents
        return requiredDocuments
          .filter(req => {
            const doc = memberDocs.find(d => d.type === req.type)
            return doc?.status === 'rejected'
          })
          .map(req => {
            const doc = memberDocs.find(d => d.type === req.type)
            return { ...req, _document: doc }
          })

      case 'analyzing':
        return requiredDocuments.filter(req => {
          const doc = memberDocs.find(d => d.type === req.type)
          return doc?.status === 'analyzing' || doc?.status === 'sent_for_apostille' || doc?.status === 'pending'
        }).map(req => ({ ...req, _document: memberDocs.find(d => d.type === req.type) }))

      case 'apostille':
        return requiredDocuments.filter(req => {
          const doc = memberDocs.find(d => d.type === req.type)
          return doc?.status === 'approved' && !doc.isApostilled
        }).map(req => ({ ...req, _document: memberDocs.find(d => d.type === req.type) }))

      case 'translation':
        return requiredDocuments.filter(req => {
          const doc = memberDocs.find(d => d.type === req.type)
          return doc?.status === 'approved' && doc.isApostilled && !doc.isTranslated
        }).map(req => ({ ...req, _document: memberDocs.find(d => d.type === req.type) }))

      case 'completed':
        return requiredDocuments.filter(req => {
          const doc = memberDocs.find(d => d.type === req.type)
          return doc?.status === 'approved' && doc.isApostilled && doc.isTranslated
        }).map(req => ({ ...req, _document: memberDocs.find(d => d.type === req.type) }))

      default:
        return []
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingType(type)
      await onUpload(file, type, member.id)
    } catch (error) {
      console.error("Upload failed", error)
    } finally {
      setUploadingType(null)
      e.target.value = ''
    }
  }

  const handleDrop = async (e: React.DragEvent, type: string) => {
    e.preventDefault()
    setDragOver(null)
    
    const file = e.dataTransfer.files[0]
    if (!file) return

    try {
      setUploadingType(type)
      await onUpload(file, type, member.id)
    } catch (error) {
      console.error("Upload failed", error)
    } finally {
      setUploadingType(null)
    }
  }

  // Handle card click - open modal if no docs, toggle if has docs
  const handleCardClick = () => {
    if (!hasSentDocuments) {
      onOpenUploadModal()
    } else {
      onToggle()
    }
  }

  // Filter stages to only show those with documents (hide empty rejected stage)
  const visibleStages = stages.filter(stage => {
    const docs = getDocumentsForStage(stage.id)
    // Always show non-rejected stages, only show rejected if has docs
    return stage.id !== 'rejected' || docs.length > 0
  })

  return (
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
      {hasSentDocuments && (
        <div className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50/50 dark:bg-gray-900/20">
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
                                      <div className="flex items-center gap-2 mb-1">
                                        <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                          {item.name}
                                        </span>
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
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-8 text-xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                        >
                                          Solicitar Apostilamento
                                        </Button>
                                      )}

                                      {/* Translation stage action */}
                                      {stage.id === 'translation' && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-8 text-xs bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                        >
                                          Solicitar Tradução
                                        </Button>
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
      )}
    </Card>
  )
}
