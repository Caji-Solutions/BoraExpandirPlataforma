
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/modules/shared/components/ui/dialog'
import { Button } from '@/modules/shared/components/ui/button'
import { Checkbox } from '../../../shared/components/ui/checkbox'
import { ScrollArea } from '../../../shared/components/ui/scroll-area'
import { Document } from '../../types'
import { FileText, Send } from 'lucide-react'
import { formatDate } from '../../lib/utils'

interface ApostilamentoModalProps {
    isOpen: boolean
    onClose: () => void
    documents: Document[]
    onSendForApostille: (documentIds: string[]) => void
}

export function ApostilamentoModal({ isOpen, onClose, documents, onSendForApostille }: ApostilamentoModalProps) {
    const [selectedDocs, setSelectedDocs] = useState<string[]>([])

    // Filter documents that are approved AND NOT already apostilled AND NOT already sent
    const eligibleDocuments = documents.filter(
        doc => doc.status === 'approved' && !doc.isApostilled
    )

    const handleToggleDocument = (docId: string) => {
        setSelectedDocs(prev =>
            prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        )
    }

    const handleSend = () => {
        onSendForApostille(selectedDocs)
        setSelectedDocs([])
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Enviar para Apostilamento</DialogTitle>
                    <DialogDescription>
                        Selecione os documentos que deseja enviar para apostilamento.
                        Apenas documentos aprovados e não apostilados aparecem aqui.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {eligibleDocuments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhum documento disponível para apostilamento.
                        </div>
                    ) : (
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-2">
                                {eligibleDocuments.map(doc => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                                    >
                                        <Checkbox
                                            checked={selectedDocs.includes(doc.id)}
                                            onCheckedChange={() => handleToggleDocument(doc.id)}
                                            id={`doc-${doc.id}`}
                                        />
                                        <div className="flex-1">
                                            <label
                                                htmlFor={`doc-${doc.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {doc.name}
                                            </label>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Aprovado em: {formatDate(doc.uploadDate)}
                                            </p>
                                        </div>
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={selectedDocs.length === 0}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:text-white"
                    >
                        <Send className="h-4 w-4" />
                        Enviar Selecionados ({selectedDocs.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
