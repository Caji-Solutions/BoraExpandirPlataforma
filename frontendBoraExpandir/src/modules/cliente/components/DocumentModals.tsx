import {
    FileText,
    CheckCircle,
    AlertCircle,
    Upload,
    Loader2,
} from 'lucide-react'
import { Button } from './ui/button'
import { Document as ClientDocument } from '../types'
import { cn } from '../lib/utils'
import { UploadConfirmModal } from './UploadConfirmModal'
import { ApostilleQuoteModal } from './ApostilleQuoteModal'
import { TranslationQuoteModal } from './TranslationPaymentModal'

interface DocumentModalsProps {
    memberName: string
    memberEmail: string
    memberDocs: ClientDocument[]

    // Upload confirm
    showConfirmModal: boolean
    onCancelUpload: () => void
    onConfirmUpload: () => void
    isUploading: boolean
    uploadError: string | null
    pendingUpload: {
        file: File
        documentType: string
        documentName: string
        isReplacement?: boolean
        documentoId?: string
    } | null

    // PDF warning
    showPdfWarning: boolean
    onConfirmPdfWarning: () => void
    onCancelPdfWarning: () => void

    // Quote request
    showQuoteModal: boolean
    selectedDocForQuote: ClientDocument | null
    isRequestingQuote: boolean
    requestedSuccessfully: boolean
    onRequestApostille: () => void
    onRequestTranslation: () => void
    onCloseQuoteModal: () => void
    getDocumentName: (type: string) => string
    docIsWaitingApostille: (doc: ClientDocument) => boolean

    // Client quote modals (apostille/translation payment)
    showClientQuoteModal: boolean
    selectedDocForClientQuote: ClientDocument | null
    onCloseClientQuoteModal: () => void
    onPaymentSuccess: () => void
}

export function DocumentModals({
    memberName,
    memberEmail,
    memberDocs,
    showConfirmModal,
    onCancelUpload,
    onConfirmUpload,
    isUploading,
    uploadError,
    pendingUpload,
    showPdfWarning,
    onConfirmPdfWarning,
    onCancelPdfWarning,
    showQuoteModal,
    selectedDocForQuote,
    isRequestingQuote,
    requestedSuccessfully,
    onRequestApostille,
    onRequestTranslation,
    onCloseQuoteModal,
    getDocumentName,
    docIsWaitingApostille,
    showClientQuoteModal,
    selectedDocForClientQuote,
    onCloseClientQuoteModal,
    onPaymentSuccess,
}: DocumentModalsProps) {
    return (
        <>
            {/* Upload Confirm Modal */}
            {pendingUpload && (
                <UploadConfirmModal
                    isOpen={showConfirmModal}
                    onClose={onCancelUpload}
                    onConfirm={onConfirmUpload}
                    isUploading={isUploading}
                    uploadError={uploadError}
                    pendingUpload={{
                        file: pendingUpload.file,
                        documentName: pendingUpload.documentName,
                        isReplacement: pendingUpload.isReplacement,
                        targetName: memberName,
                    }}
                />
            )}

            {/* PDF Warning Modal */}
            {showPdfWarning && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onCancelPdfWarning}
                    />
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <Button variant="outline" onClick={onCancelPdfWarning} className="border-gray-300 dark:border-gray-600">
                                Cancelar
                            </Button>
                            <Button onClick={onConfirmPdfWarning} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Upload className="h-4 w-4 mr-2" />
                                Entendi, Selecionar PDF
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Request Modal */}
            {showQuoteModal && selectedDocForQuote && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => !isRequestingQuote && onCloseQuoteModal()}
                    />
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {!requestedSuccessfully ? (
                            (() => {
                                const isApostille = docIsWaitingApostille(selectedDocForQuote)
                                const colorClass = isApostille ? 'from-amber-600 to-amber-700' : 'from-purple-600 to-purple-700'
                                const bgColorClass = isApostille ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                                const textColorClass = isApostille ? 'text-amber-900 dark:text-amber-100' : 'text-purple-900 dark:text-purple-100'
                                const fileIconColorClass = isApostille ? 'text-amber-700 dark:text-amber-300' : 'text-purple-700 dark:text-purple-300'

                                return (
                                    <>
                                        <div className={cn('p-6 bg-gradient-to-r', colorClass)}>
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                                                    <FileText className="h-7 w-7 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">
                                                        {isApostille ? 'Solicitar Apostila' : 'Solicitar Tradução'}
                                                    </h3>
                                                    <p className="text-white/80 text-sm mt-1">
                                                        {isApostille ? 'Orçamento para apostilamento' : 'Orçamento de tradução juramentada'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className={cn('border rounded-xl p-4', bgColorClass)}>
                                                <p className={cn('text-sm font-medium', textColorClass)}>
                                                    Você está solicitando um orçamento de {isApostille ? 'apostila' : 'tradução'} para o documento:
                                                </p>
                                                <div className={cn('mt-2 flex items-center gap-2', fileIconColorClass)}>
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="font-bold">{selectedDocForQuote.fileName || getDocumentName(selectedDocForQuote.type)}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Nossa equipe jurídica irá analisar o documento e retornar com um orçamento e prazo.
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                                            <Button variant="outline" onClick={() => onCloseQuoteModal()} disabled={isRequestingQuote}>
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={isApostille ? onRequestApostille : onRequestTranslation}
                                                className={cn('text-white', isApostille ? 'bg-amber-600 hover:bg-amber-700' : 'bg-purple-600 hover:bg-purple-700')}
                                                disabled={isRequestingQuote}
                                            >
                                                {isRequestingQuote ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                )}
                                                Confirmar Solicitação
                                            </Button>
                                        </div>
                                    </>
                                )
                            })()
                        ) : (
                            <div className="p-8 text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Solicitação Enviada!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Seu pedido de orçamento foi registrado com sucesso. Nossa equipe entrará em contato em breve.
                                </p>
                                <Button
                                    onClick={onCloseQuoteModal}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Entendido
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Apostille Quote Modal */}
            {showClientQuoteModal && selectedDocForClientQuote && docIsWaitingApostille(selectedDocForClientQuote) && (
                <ApostilleQuoteModal
                    documentoId={selectedDocForClientQuote.id}
                    documentoNome={selectedDocForClientQuote.fileName || getDocumentName(selectedDocForClientQuote.type)}
                    clienteEmail={memberEmail}
                    isOpen={showClientQuoteModal}
                    allDocuments={memberDocs}
                    onClose={onCloseClientQuoteModal}
                    onPaymentSuccess={onPaymentSuccess}
                />
            )}

            {/* Translation Quote Modal */}
            {showClientQuoteModal && selectedDocForClientQuote && !docIsWaitingApostille(selectedDocForClientQuote) && (
                <TranslationQuoteModal
                    documentoId={selectedDocForClientQuote.id}
                    documentoNome={selectedDocForClientQuote.fileName || getDocumentName(selectedDocForClientQuote.type)}
                    clienteEmail={memberEmail}
                    isOpen={showClientQuoteModal}
                    allDocuments={memberDocs}
                    onClose={onCloseClientQuoteModal}
                    onPaymentSuccess={onPaymentSuccess}
                />
            )}
        </>
    )
}
