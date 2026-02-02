import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { ScrollArea } from '../../shared/components/ui/scroll-area'
import { ApprovedDocument, TranslatedDocument } from '../types'
import { FileText, Download, Send, CheckCircle, Upload, X, File } from 'lucide-react'
import { Badge } from './ui/badge'
import { formatDate } from '../lib/utils'

interface TraducaoModalProps {
    isOpen: boolean
    onClose: () => void
    member: { id: string, name: string, type: string }
    approvedDocuments: ApprovedDocument[]
    translatedDocuments: TranslatedDocument[]
    onUploadTranslation: (file: File, approvedDocumentId: string, targetLanguage: string) => void
    onRequestQuote: (documentIds: string[], targetLanguages: string[]) => void
}

const LANGUAGES = {
    PT: 'Português',
    EN: 'Inglês',
    ES: 'Espanhol',
    FR: 'Francês',
    IT: 'Italiano',
    DE: 'Alemão',
    JA: 'Japonês',
    ZH: 'Chinês',
}

export function TraducaoModal({
    isOpen,
    onClose,
    member,
    approvedDocuments,
    translatedDocuments,
    onUploadTranslation,
    onRequestQuote
}: TraducaoModalProps) {
    const [targetLanguage, setTargetLanguage] = useState<string>('EN')
    const [selectedDocs, setSelectedDocs] = useState<string[]>([])
    const [uploadingDocId, setUploadingDocId] = useState<string | null>(null)

    // Filter approved documents for this member that are apostilled
    const eligibleDocuments = approvedDocuments.filter(doc =>
        // Assuming ApprovedDocument has memberId, or we infer from clientId if single client. 
        // Since mock data doesn't have memberId on ApprovedDocument yet, we might need to rely on name matching or adding memberId.
        // user requirement: "somente os documentos marcados pelo juridico como já apostilados"
        doc.isApostilled
        // && doc.memberId === member.id // TODO: Add memberId to ApprovedDocument
    )

    const handleToggleDoc = (docId: string) => {
        setSelectedDocs(prev => prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId])
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadingDocId(docId)
            onUploadTranslation(file, docId, targetLanguage)
            setUploadingDocId(null)
            e.target.value = ''
        }
    }

    const handleRequestQuote = () => {
        if (selectedDocs.length > 0) {
            onRequestQuote(selectedDocs, [targetLanguage])
            setSelectedDocs([])
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Tradução: {member.name}</DialogTitle>
                    <DialogDescription>
                        Gerencie a tradução dos documentos apostilados de {member.type}.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2 space-y-4">

                    {/* Language Selector */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <label className="text-sm font-medium">Idioma de destino:</label>
                        <select
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-3 py-1.5 text-sm"
                        >
                            {Object.entries(LANGUAGES).map(([code, name]) => (
                                <option key={code} value={code}>{name}</option>
                            ))}
                        </select>
                    </div>

                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                            {eligibleDocuments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Nenhum documento apostilado encontrado para este membro.
                                </div>
                            ) : (
                                eligibleDocuments.map((doc) => {
                                    const translations = translatedDocuments.filter(t => t.approvedDocumentId === doc.id)
                                    const isTranslated = translations.some(t => t.targetLanguage === targetLanguage)
                                    const isSelected = selectedDocs.includes(doc.id)

                                    return (
                                        <div
                                            key={doc.id}
                                            className={`flex flex-col p-4 rounded-lg border transition-colors ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleDoc(doc.id)}
                                                        disabled={isTranslated}
                                                        className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <div>
                                                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                                                            {doc.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Apostilado em {formatDate(doc.approvalDate)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {isTranslated ? (
                                                        <Badge variant="success" className="flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" /> Traduzido ({targetLanguage})
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="warning">Aguardando Tradução</Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            {isSelected && !isTranslated && (
                                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                                    <div className="text-xs text-gray-500">
                                                        Selecione para pedir orçamento
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-400">ou envie a tradução pronta:</span>
                                                        <input
                                                            type="file"
                                                            id={`upload-trans-${doc.id}`}
                                                            className="hidden"
                                                            onChange={(e) => handleFileUpload(e, doc.id)}
                                                            accept=".pdf,application/pdf"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs gap-1"
                                                            onClick={() => document.getElementById(`upload-trans-${doc.id}`)?.click()}
                                                        >
                                                            <Upload className="h-3 w-3" /> Upload Tradução
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Translations List */}
                                            {translations.length > 0 && (
                                                <div className="mt-3 pl-7 space-y-2">
                                                    {translations.map(t => (
                                                        <div key={t.id} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-3 w-3 text-blue-500" />
                                                                <span>{t.fileName}</span>
                                                                <Badge variant="outline" className="text-[10px] h-4">{t.targetLanguage}</Badge>
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                <Download className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="text-xs text-gray-500">
                        {selectedDocs.length} documentos selecionados para orçamento
                    </div>
                    <Button
                        onClick={handleRequestQuote}
                        disabled={selectedDocs.length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Solicitar Orçamento
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
