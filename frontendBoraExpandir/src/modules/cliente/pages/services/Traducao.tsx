import { useState } from 'react'
import { FamilyFolders } from '../../components/documents/FamilyFolders'
// import { TraducaoModal } from '../../components/services/TraducaoModal'
import { TraducaoModal } from '../../components/services/TraducaoModal'
import { Document, RequiredDocument, ApprovedDocument, TranslatedDocument } from '../../types'

interface TraduzaoProps {
    clienteId: string
    clientName: string
    members: { id: string, name: string, type: string }[]
    documents: Document[]
    requiredDocuments: RequiredDocument[]
    approvedDocuments: ApprovedDocument[]
    translatedDocuments: TranslatedDocument[]
    onUploadTranslation: (file: File, approvedDocumentId: string, targetLanguage: string) => void
    onRequestQuote: (documentIds: string[], targetLanguages: string[]) => void
}

export function Traducao({
    clienteId,
    clientName,
    members,
    documents,
    requiredDocuments,
    approvedDocuments,
    translatedDocuments,
    onUploadTranslation,
    onRequestQuote,
}: TraduzaoProps) {
    const [selectedMember, setSelectedMember] = useState<{ id: string, name: string, type: string } | null>(null)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tradução de Documentos</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Gerencie a tradução dos seus documentos apostilados. Selecione uma pasta para ver os detalhes.
                </p>
            </div>

            <FamilyFolders
                clienteId={clienteId}
                clientName={clientName}
                members={members}
                documents={documents}
                requiredDocuments={requiredDocuments}
                onMemberClick={setSelectedMember}
                onUpload={async () => {}} // Traducao uses its own upload logic via TraducaoModal
                onDelete={() => {}} // Traducao doesn't delete here
            />

            {selectedMember && (
                <TraducaoModal
                    isOpen={!!selectedMember}
                    onClose={() => setSelectedMember(null)}
                    member={selectedMember}
                    approvedDocuments={approvedDocuments}
                    translatedDocuments={translatedDocuments}
                    onUploadTranslation={onUploadTranslation}
                    onRequestQuote={onRequestQuote}
                />
            )}
        </div>
    )
}
