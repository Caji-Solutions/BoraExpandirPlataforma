import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { RequiredDocument } from '../types'
import { Upload, FileText, CheckCircle, X, Loader2, AlertCircle } from 'lucide-react'
import { cn, formatFileSize } from '../lib/utils'

interface InitialUploadModalProps {
    isOpen: boolean
    onClose: () => void
    member: { id: string, name: string, type: string }
    requiredDocuments: RequiredDocument[]
    onUpload: (file: File, documentType: string, memberId: string) => Promise<void>
}

interface UploadedFile {
    type: string
    file: File
    status: 'pending' | 'uploading' | 'success' | 'error'
    error?: string
}

export function InitialUploadModal({
    isOpen,
    onClose,
    member,
    requiredDocuments,
    onUpload
}: InitialUploadModalProps) {
    const [uploadedFiles, setUploadedFiles] = useState<Map<string, UploadedFile>>(new Map())
    const [dragOver, setDragOver] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPdfWarning, setShowPdfWarning] = useState(false)
    const [pendingInputId, setPendingInputId] = useState<string | null>(null)
    const [pdfError, setPdfError] = useState<string | null>(null)

    // Count required docs
    const requiredCount = requiredDocuments.filter(d => d.required).length
    const uploadedRequiredCount = Array.from(uploadedFiles.values()).filter(
        f => (f.status === 'success' || f.status === 'pending' || f.status === 'uploading') && requiredDocuments.find(d => d.type === f.type)?.required
    ).length
    const allRequiredUploaded = uploadedRequiredCount >= requiredCount

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate PDF
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setPdfError('Apenas arquivos PDF são aceitos!')
            e.target.value = ''
            return
        }

        setPdfError(null)
        setUploadedFiles(prev => {
            const next = new Map(prev)
            next.set(docType, { type: docType, file, status: 'pending' })
            return next
        })
        e.target.value = ''
    }

    const handleDrop = (e: React.DragEvent, docType: string) => {
        e.preventDefault()
        setDragOver(null)

        const file = e.dataTransfer.files[0]
        if (!file) return

        // Validate PDF
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setPdfError('Apenas arquivos PDF são aceitos!')
            return
        }

        setPdfError(null)
        setUploadedFiles(prev => {
            const next = new Map(prev)
            next.set(docType, { type: docType, file, status: 'pending' })
            return next
        })
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

    const removeFile = (docType: string) => {
        setUploadedFiles(prev => {
            const next = new Map(prev)
            next.delete(docType)
            return next
        })
    }

    const handleSubmitAll = async () => {
        setIsSubmitting(true)

        // Get all pending files
        const pendingFiles = Array.from(uploadedFiles.entries()).filter(
            ([_, f]) => f.status === 'pending'
        )

        // Upload each file
        for (const [docType, fileData] of pendingFiles) {
            // Mark as uploading
            setUploadedFiles(prev => {
                const next = new Map(prev)
                next.set(docType, { ...fileData, status: 'uploading' })
                return next
            })

            try {
                await onUpload(fileData.file, docType, member.id)

                // Mark as success
                setUploadedFiles(prev => {
                    const next = new Map(prev)
                    next.set(docType, { ...fileData, status: 'success' })
                    return next
                })
            } catch (error: any) {
                // Mark as error
                setUploadedFiles(prev => {
                    const next = new Map(prev)
                    next.set(docType, { ...fileData, status: 'error', error: error.message })
                    return next
                })
            }
        }

        setIsSubmitting(false)

        // Check if all successful
        const allSuccess = Array.from(uploadedFiles.values()).every(f => f.status === 'success')
        if (allSuccess && uploadedFiles.size === requiredDocuments.length) {
            onClose()
        }
    }

    const getFileForType = (type: string) => uploadedFiles.get(type)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Upload className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                Enviar Documentos: {member.name}
                            </DialogTitle>
                            <DialogDescription>
                                Envie todos os documentos necessários para {member.type}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="px-1 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Progresso de envio
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                            {uploadedRequiredCount} de {requiredCount} obrigatórios
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                            style={{ width: `${(uploadedRequiredCount / requiredCount) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Documents List */}
                <div className="flex-1 overflow-y-auto px-1 space-y-3">
                    {requiredDocuments.map((doc) => {
                        const uploadedFile = getFileForType(doc.type)
                        const inputId = `initial-upload-${member.id}-${doc.type}`
                        const isDraggedOver = dragOver === doc.type

                        return (
                            <div
                                key={doc.type}
                                className={cn(
                                    "p-4 rounded-xl border-2 transition-all",
                                    uploadedFile?.status === 'success'
                                        ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10'
                                        : uploadedFile?.status === 'error'
                                            ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10'
                                            : isDraggedOver
                                                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                )}
                                onDrop={(e) => handleDrop(e, doc.type)}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(doc.type) }}
                                onDragLeave={() => setDragOver(null)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {doc.name}
                                            </h4>
                                            {doc.required && (
                                                <Badge variant="secondary" className="text-[10px]">
                                                    Obrigatório
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">
                                            {doc.description}
                                        </p>

                                        {/* Upload Area or Uploaded File */}
                                        {uploadedFile ? (
                                            <div className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg",
                                                uploadedFile.status === 'success'
                                                    ? 'bg-green-100 dark:bg-green-900/30'
                                                    : uploadedFile.status === 'error'
                                                        ? 'bg-red-100 dark:bg-red-900/30'
                                                        : 'bg-gray-100 dark:bg-gray-800'
                                            )}>
                                                {uploadedFile.status === 'uploading' ? (
                                                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin shrink-0" />
                                                ) : uploadedFile.status === 'success' ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                                                ) : uploadedFile.status === 'error' ? (
                                                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                                                ) : (
                                                    <FileText className="h-5 w-5 text-gray-500 shrink-0" />
                                                )}

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                        {uploadedFile.file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(uploadedFile.file.size)}
                                                        {uploadedFile.status === 'success' && ' • Pronto para envio'}
                                                        {uploadedFile.status === 'error' && ` • ${uploadedFile.error}`}
                                                    </p>
                                                </div>

                                                {uploadedFile.status !== 'uploading' && uploadedFile.status !== 'success' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                                                        onClick={() => removeFile(doc.type)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <div
                                                className={cn(
                                                    "h-16 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all",
                                                    isDraggedOver
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50'
                                                )}
                                                onClick={() => handleUploadClick(inputId)}
                                            >
                                                <Upload className={cn(
                                                    "h-5 w-5",
                                                    isDraggedOver ? 'text-blue-600' : 'text-gray-400'
                                                )} />
                                                <span className="text-sm text-gray-500">
                                                    Arraste ou clique para selecionar
                                                </span>
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            id={inputId}
                                            className="hidden"
                                            accept=".pdf"
                                            onChange={(e) => handleFileSelect(e, doc.type)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer */}
                <div className="border-t pt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        {allRequiredUploaded ? (
                            <span className="text-green-600 font-medium flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Todos os documentos obrigatórios selecionados
                            </span>
                        ) : (
                            `Selecione todos os ${requiredCount} documentos obrigatórios`
                        )}
                    </p>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmitAll}
                            disabled={!allRequiredUploaded || isSubmitting || uploadedFiles.size === 0}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Enviar Documentos
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>

            {/* PDF Warning Modal */}
            {showPdfWarning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancelPdfWarning} />
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                                    <FileText className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Formato de Arquivo</h3>
                                    <p className="text-blue-100 text-sm mt-1">Informação importante</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-amber-900 dark:text-amber-100">Somente arquivos PDF são aceitos!</p>
                                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Certifique-se de que seu documento está no formato <span className="font-bold">.PDF</span>.</p>
                                    </div>
                                </div>
                            </div>
                            {pdfError && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                    <p className="text-sm text-red-700 dark:text-red-300">{pdfError}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t flex justify-end gap-3">
                            <Button variant="outline" onClick={handleCancelPdfWarning}>Cancelar</Button>
                            <Button onClick={handleConfirmPdfWarning} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Upload className="h-4 w-4 mr-2" />
                                Entendi, Selecionar PDF
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Dialog>
    )
}
