
import { useState } from 'react'
import { Folder, FileText } from 'lucide-react'
import { Card, CardContent } from '@/modules/shared/components/ui/card'
import { Client, Document } from '../../types'
import { ApostilamentoModal } from './ApostilamentoModal'

interface ApostilamentoProps {
    client: Client
    documents: Document[]
    onSendForApostille: (documentIds: string[]) => void
}

export function Apostilamento({ client, documents, onSendForApostille }: ApostilamentoProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Calcule quantos documentos estão prontos para apostilar (o badge da pasta)
    const readyForApostilleCount = documents.filter(
        doc => doc.status === 'approved' && !doc.isApostilled
    ).length

    // Calcule quantos já foram enviados
    const sentCount = documents.filter(doc => doc.status === 'sent_for_apostille').length

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Apostilamento</h1>
                <p className="text-muted-foreground">
                    Gerencie o apostilamento dos seus documentos.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pasta do Cliente */}
                <Card
                    className="max-w-[250px] cursor-pointer hover:shadow-md transition-all group border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10"
                    onClick={() => setIsModalOpen(true)}
                >
                    <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                        <div className="relative">
                            <Folder className="h-16 w-16 text-blue-500 group-hover:text-blue-600 transition-colors" />
                            {readyForApostilleCount > 0 && (
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white dark:border-gray-900">
                                    {readyForApostilleCount}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{client.name}</h3>
                            <p className="text-sm text-muted-foreground">Clique para ver documentos</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Enviados (Feedback visual) */}
            {sentCount > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Enviados para Apostilamento</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents
                            .filter(doc => doc.status === 'sent_for_apostille')
                            .map(doc => (
                                <div key={doc.id} className="flex items-center p-4 bg-white dark:bg-neutral-800 rounded-lg border border-border">
                                    <FileText className="h-8 w-8 text-blue-500 mr-3" />
                                    <div>
                                        <p className="font-medium">{doc.name}</p>
                                        <p className="text-xs text-muted-foreground">Aguardando processamento</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            <ApostilamentoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                documents={documents}
                onSendForApostille={onSendForApostille}
            />
        </div>
    )
}
