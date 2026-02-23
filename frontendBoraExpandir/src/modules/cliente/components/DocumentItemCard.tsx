import {
    FileText,
    CheckCircle,
    AlertCircle,
    Clock,
    Upload,
    Trash2,
    Loader2,
    DollarSign,
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Document as ClientDocument } from '../types'
import { cn, formatDate, formatFileSize } from '../lib/utils'

interface DocumentItemCardProps {
    item: any
    stageId: string
    idx: number
    memberId: string
    uploadingType: string | null
    dragOver: string | null
    setDragOver: (type: string | null) => void
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>, type: string) => void
    onUploadClick: (inputId: string) => void
    onDrop: (e: React.DragEvent, type: string) => void
    onDelete: (documentId: string) => void
    onOpenQuoteModal: (doc: ClientDocument) => void
    onOpenClientQuoteModal: (doc: ClientDocument) => void
    isRequestingQuote: boolean
}

export function DocumentItemCard({
    item,
    stageId,
    idx,
    memberId,
    uploadingType,
    dragOver,
    setDragOver,
    onFileSelect,
    onUploadClick,
    onDrop,
    onDelete,
    onOpenQuoteModal,
    onOpenClientQuoteModal,
    isRequestingQuote,
}: DocumentItemCardProps) {
    const doc = item._document as ClientDocument | undefined
    const inputId = `file-${memberId}-${item.type}-${stageId}-${idx}`
    const isCurrentUploading = uploadingType === item.type
    const isDraggedOver = dragOver === item.type
    const isRejected = stageId === 'rejected'

    return (
        <div
            className={cn(
                'p-4 rounded-xl border bg-white dark:bg-gray-800 transition-all shadow-sm hover:shadow-md',
                isRejected ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700',
                isDraggedOver && 'ring-2 ring-blue-400 border-blue-400'
            )}
            onDrop={(e) => onDrop(e, item.type)}
            onDragOver={(e) => { e.preventDefault(); setDragOver(item.type) }}
            onDragLeave={() => setDragOver(null)}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                'p-1.5 rounded-lg',
                                isRejected ? 'bg-red-50 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'
                            )}>
                                <FileText className={cn('h-4 w-4', isRejected ? 'text-red-500' : 'text-gray-400')} />
                            </div>
                            <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                {item._isRequested ? `Pendente: ${item.name}` : item.name}
                            </span>
                        </div>

                        {/* Badges */}
                        {item.required && stageId === 'pending' && (
                            <Badge variant="secondary" className="text-[10px] h-5">Obrigatório</Badge>
                        )}
                        {item._isRequested && (
                            <Badge className="text-[10px] h-5 bg-amber-500 hover:bg-amber-600 text-white">
                                ⚠️ Solicitado
                            </Badge>
                        )}
                        {doc && stageId !== 'pending' && (
                            <div className="flex items-center gap-1.5 ml-2">
                                <Badge
                                    variant="default"
                                    className={cn(
                                        'text-[9px] px-1.5 py-0 border-none text-white flex items-center gap-1',
                                        doc?.isApostilled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300'
                                    )}
                                >
                                    <CheckCircle className={cn('h-2.5 w-2.5', doc?.isApostilled ? 'opacity-100' : 'opacity-50')} />
                                    Apostilado
                                </Badge>
                                <Badge
                                    variant="default"
                                    className={cn(
                                        'text-[9px] px-1.5 py-0 border-none text-white flex items-center gap-1',
                                        doc?.isTranslated ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300'
                                    )}
                                >
                                    <CheckCircle className={cn('h-2.5 w-2.5', doc?.isTranslated ? 'opacity-100' : 'opacity-50')} />
                                    Traduzido
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Description for pending */}
                    {stageId === 'pending' && item.description && (
                        <p className="text-xs text-gray-500 mt-0.5 ml-9">{item.description}</p>
                    )}

                    {/* File info */}
                    {doc && stageId !== 'pending' && (
                        <p className="text-xs text-gray-500 ml-9">
                            {doc.fileName} • {formatDate(doc.uploadDate)}
                            {doc.fileSize && ` • ${formatFileSize(doc.fileSize)}`}
                        </p>
                    )}

                    {/* Rejection reason */}
                    {isRejected && doc?.rejectionReason && (
                        <div className="mt-2 ml-9 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30 flex items-start gap-3 w-fit max-w-[80%]">
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-red-800 dark:text-red-400">Motivo da recusa:</p>
                                <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{doc.rejectionReason}</p>
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
                        disabled={isCurrentUploading}
                    />

                    {/* Pending / Rejected → Upload button */}
                    {(stageId === 'pending' || stageId === 'rejected') && (
                        <Button
                            size="sm"
                            className={cn(
                                'h-9 px-4 text-xs font-bold gap-2 text-white shadow-sm',
                                isRejected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                            )}
                            onClick={() => onUploadClick(inputId)}
                            disabled={isCurrentUploading}
                        >
                            {isCurrentUploading ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Upload className="h-3 w-3" />
                            )}
                            {isRejected ? 'REENVIAR' : 'ENVIAR'}
                        </Button>
                    )}

                    {/* Analyzing → Clock badge */}
                    {stageId === 'analyzing' && (
                        <div className="flex items-center gap-1 text-blue-600 text-xs font-medium px-2 py-1 bg-blue-50 rounded-full">
                            <Clock className="h-4 w-4" />
                            <span>Aguardando</span>
                        </div>
                    )}

                    {/* Apostille stage actions */}
                    {stageId === 'apostille' && doc && (
                        <div className="flex gap-2">
                            {(doc.status === 'waiting_apostille' || doc.status === 'approved') ? (
                                <>
                                    <Button
                                        size="sm"
                                        className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                                        onClick={() => onUploadClick(inputId)}
                                        disabled={isCurrentUploading}
                                    >
                                        <Upload className="h-3 w-3" />
                                        Upload Apostila
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs border-amber-200 hover:bg-amber-50 text-amber-700 gap-1.5"
                                        onClick={() => onOpenClientQuoteModal(doc)}
                                        disabled={isCurrentUploading || isRequestingQuote}
                                    >
                                        <FileText className="h-3 w-3" />
                                        Solicitar Apostila
                                    </Button>
                                </>
                            ) : doc.status?.toLowerCase() === 'waiting_quote_approval' ? (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white gap-1.5"
                                        onClick={() => onOpenClientQuoteModal(doc)}
                                    >
                                        <DollarSign className="h-3 w-3" />
                                        Ver Orçamento
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs border-gray-300 gap-1.5 hover:bg-gray-50 bg-white"
                                        onClick={() => onUploadClick(inputId)}
                                        disabled={isCurrentUploading}
                                    >
                                        <Upload className="h-3 w-3" />
                                        Substituir
                                    </Button>
                                </div>
                            ) : doc.status?.toLowerCase() === 'waiting_apostille_quote' ? (
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

                    {/* Translation stage actions */}
                    {stageId === 'translation' && doc && (
                        <div className="flex gap-2">
                            {(doc.status === 'waiting_translation' || (doc.status === 'approved' && doc.isApostilled)) ? (
                                <Button
                                    size="sm"
                                    className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                                    onClick={() => onUploadClick(inputId)}
                                    disabled={isCurrentUploading}
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

                            {(doc.status === 'waiting_translation' || (doc.status === 'approved' && doc.isApostilled)) && doc.status !== 'waiting_translation_quote' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs border-purple-200 hover:bg-purple-50 text-purple-700 gap-1.5"
                                    onClick={() => onOpenQuoteModal(doc)}
                                    disabled={isCurrentUploading || isRequestingQuote}
                                >
                                    <FileText className="h-3 w-3" />
                                    Solicitar Tradução
                                </Button>
                            )}

                            {doc.status?.toLowerCase() === 'waiting_quote_approval' && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white gap-1.5"
                                        onClick={() => onOpenClientQuoteModal(doc)}
                                    >
                                        <DollarSign className="h-3 w-3" />
                                        Ver Orçamento
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs border-gray-300 gap-1.5 hover:bg-gray-50 bg-white"
                                        onClick={() => onUploadClick(inputId)}
                                        disabled={isCurrentUploading}
                                    >
                                        <Upload className="h-3 w-3" />
                                        Substituir
                                    </Button>
                                </div>
                            )}

                            {doc.status?.toLowerCase() === 'waiting_translation_quote' && (
                                <div className="flex items-center gap-1 text-purple-600 text-xs font-medium px-2 py-1 bg-purple-50 rounded-full">
                                    <Clock className="h-4 w-4" />
                                    <span>Orçamento Solicitado</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Completed → Check badge */}
                    {stageId === 'completed' && (
                        <div className="flex items-center gap-1 text-green-600 text-xs font-medium px-2 py-1 bg-green-50 rounded-full">
                            <CheckCircle className="h-4 w-4" />
                            <span>Verificado</span>
                        </div>
                    )}

                    {/* Delete for rejected */}
                    {doc && stageId === 'rejected' && (
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
}
