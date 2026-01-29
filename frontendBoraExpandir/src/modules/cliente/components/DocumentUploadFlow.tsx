import { FamilyFolders } from './FamilyFolders'
import { Document as ClientDocument, RequiredDocument } from '../types'

interface DocumentUploadFlowProps {
    clienteId: string
    clientName: string
    processoId?: string
    processType?: string
    familyMembers: {id: string, name: string, type: string}[]
    documents: ClientDocument[]
    requiredDocuments: RequiredDocument[]
    onUploadSuccess?: (data: any) => void
    onDelete: (documentId: string) => void
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function DocumentUploadFlow({
    clienteId,
    clientName,
    processoId,
    processType,
    familyMembers,
    documents,
    requiredDocuments,
    onUploadSuccess,
    onDelete
}: DocumentUploadFlowProps) {

    const handleUpload = async (file: File, documentType: string, memberId: string) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('clienteId', clienteId)
        formData.append('documentType', documentType)
        formData.append('memberId', memberId)
        
        if (processoId) {
            formData.append('processoId', processoId)
        }
        
        // memberName removido para usar apenas IDs na estrutura de pastas

        const response = await fetch(`${API_BASE_URL}/cliente/uploadDoc`, {
            method: 'POST',
            body: formData
        })

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || 'Erro ao enviar documento')
        }

        onUploadSuccess?.({ ...result.data, memberId })
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Envio de Documentos</h2>
                    {processType && (
                        <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                            {processType}
                        </span>
                    )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    Clique na pasta do familiar para ver e enviar os documentos solicitados.
                </p>
            </div>

            <FamilyFolders
                clienteId={clienteId}
                clientName={clientName}
                members={familyMembers}
                documents={documents}
                requiredDocuments={requiredDocuments}
                onUpload={handleUpload}
                onDelete={onDelete}
            />
        </div>
    )
}
