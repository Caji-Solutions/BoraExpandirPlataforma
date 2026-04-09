import { FileText, CheckCircle, AlertCircle, Clock, Upload, Loader2, Trash2, DollarSign, Download } from 'lucide-react'
import { Badge } from '@/modules/shared/components/ui/badge'
import { Button } from '@/modules/shared/components/ui/button'
import { Document as ClientDocument } from '../../types'
import { cn, formatDate, formatFileSize, downloadFile } from '../../lib/utils'

interface Stage {
  id: string
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  iconColor: string
  dotBg: string
}

interface DocumentTimelineProps {
  visibleStages: Stage[]
  memberId: string
  uploadingType: string | null
  dragOver: string | null
  isRequestingQuote: boolean
  getDocumentsForStage: (stageId: string) => { type: string; _document: ClientDocument; name: string }[]
  onUploadClick: (inputId: string) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>, type: string) => void
  onDrop: (e: React.DragEvent, type: string) => void
  onDragOver: (type: string) => void
  onDragLeave: () => void
  onDelete: (id: string) => void
  onOpenApostilleQuote: (doc: ClientDocument) => void
  onOpenTranslationQuote: (doc: ClientDocument) => void
  onOpenClientQuote: (doc: ClientDocument) => void
}

export function DocumentTimeline({
  visibleStages,
  memberId,
  uploadingType,
  dragOver,
  isRequestingQuote,
  getDocumentsForStage,
  onUploadClick,
  onFileSelect,
  onDrop,
  onDragOver,
  onDragLeave,
  onDelete,
  onOpenApostilleQuote,
  onOpenTranslationQuote,
  onOpenClientQuote,
}: DocumentTimelineProps) {
  if (visibleStages.length === 0) return null

  return (
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
              <div
                className={cn(
                  "absolute left-2 w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 shadow-sm",
                  stage.dotBg,
                  isEmpty && 'opacity-30'
                )}
              />

              {/* Stage Content */}
              <div
                className={cn(
                  "rounded-xl border p-4 transition-all",
                  stage.bgColor,
                  stage.borderColor,
                  isEmpty && 'opacity-50'
                )}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className={cn('font-semibold text-sm', `text-${stage.color}-700 dark:text-${stage.color}-400`)}>
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
                      const inputId = `file-${memberId}-${item.type}`
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
                          onDrop={(e) => onDrop(e, item.type)}
                          onDragOver={(e) => {
                            e.preventDefault()
                            onDragOver(item.type)
                          }}
                          onDragLeave={onDragLeave}
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
                                      doc?.isApostilled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300'
                                    )}
                                  >
                                    <CheckCircle className={cn("h-2.5 w-2.5", doc?.isApostilled ? 'opacity-100' : 'opacity-50')} />
                                    Apostilado
                                  </Badge>
                                  <Badge
                                    variant="default"
                                    className={cn(
                                      "text-[9px] px-1 py-0 border-none text-white flex items-center gap-1",
                                      doc?.isTranslated ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300'
                                    )}
                                  >
                                    <CheckCircle className={cn("h-2.5 w-2.5", doc?.isTranslated ? 'opacity-100' : 'opacity-50')} />
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
                                onChange={(e) => onFileSelect(e, item.type)}
                                disabled={isUploading}
                              />

                              {/* Rejected stage actions */}
                              {stage.id === 'rejected' && (
                                <Button
                                  size="sm"
                                  className="h-8 text-xs gap-1.5 bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => onUploadClick(inputId)}
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
                                  {doc?.status === 'waiting_apostille' || doc?.status === 'approved' ? (
                                    <>
                                      <Button
                                        size="sm"
                                        className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                                        onClick={() => onUploadClick(inputId)}
                                        disabled={isUploading}
                                      >
                                        <Upload className="h-3 w-3" />
                                        Upload Apostila
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs border-amber-200 hover:bg-amber-50 text-amber-700 gap-1.5"
                                        onClick={() => onOpenClientQuote(doc)}
                                        disabled={isUploading || isRequestingQuote}
                                      >
                                        <FileText className="h-3 w-3" />
                                        Solicitar Apostila
                                      </Button>
                                    </>
                                  ) : doc?.status?.toLowerCase() === 'waiting_quote_approval' ? (
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white gap-1.5"
                                        onClick={() => onOpenClientQuote(doc)}
                                      >
                                        <DollarSign className="h-3 w-3" />
                                        Ver Orçamento
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs border-gray-300 gap-1.5 hover:bg-gray-50 bg-white"
                                        onClick={() => onUploadClick(inputId)}
                                        disabled={isUploading}
                                      >
                                        <Upload className="h-3 w-3" />
                                        Substituir
                                      </Button>
                                    </div>
                                  ) : doc?.status?.toLowerCase() === 'waiting_apostille_quote' ? (
                                    <div className="flex items-center gap-1 text-amber-600 text-xs font-medium px-2 py-1 bg-amber-50 rounded-full">
                                      <Clock className="h-4 w-4" />
                                      <span>Orçamento Solicitado</span>
                                    </div>
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
                                  {doc?.status === 'waiting_translation' || (doc?.status === 'approved' && doc.isApostilled) ? (
                                    <Button
                                      size="sm"
                                      className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                                      onClick={() => onUploadClick(inputId)}
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

                                  {/* Translate Request Quote Button */}
                                  {(doc?.status === 'waiting_translation' || (doc?.status === 'approved' && doc.isApostilled)) &&
                                    doc?.status !== 'waiting_translation_quote' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs border-purple-200 hover:bg-purple-50 text-purple-700 gap-1.5"
                                        onClick={() => onOpenTranslationQuote(doc)}
                                        disabled={isUploading || isRequestingQuote}
                                      >
                                        <FileText className="h-3 w-3" />
                                        Solicitar Tradução
                                      </Button>
                                    )}

                                  {/* WAITING_QUOTE_APPROVAL stage actions */}
                                  {doc?.status?.toLowerCase() === 'waiting_quote_approval' && (
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white gap-1.5"
                                        onClick={() => onOpenClientQuote(doc)}
                                      >
                                        <DollarSign className="h-3 w-3" />
                                        Ver Orçamento
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs border-gray-300 gap-1.5 hover:bg-gray-50 bg-white"
                                        onClick={() => onUploadClick(inputId)}
                                        disabled={isUploading}
                                      >
                                        <Upload className="h-3 w-3" />
                                        Substituir
                                      </Button>
                                    </div>
                                  )}

                                  {doc?.status?.toLowerCase() === 'waiting_translation_quote' && (
                                    <div className="flex items-center gap-1 text-purple-600 text-xs font-medium px-2 py-1 bg-purple-50 rounded-full">
                                      <Clock className="h-4 w-4" />
                                      <span>Orçamento Solicitado</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Completed stage - show check & download */}
                              {stage.id === 'completed' && (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium px-2 py-1 bg-green-50 rounded-full">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Verificado</span>
                                  </div>
                                  {doc?.fileUrl && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-xs border-green-200 hover:bg-green-50 text-green-700 gap-1.5"
                                      onClick={() => downloadFile(doc.fileUrl!, doc.name)}
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      BAIXAR
                                    </Button>
                                  )}
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
  )
}
