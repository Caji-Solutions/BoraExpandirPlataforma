import { FamilyFolders } from '../documents/FamilyFolders'
import { Document as ClientDocument, RequiredDocument } from '../../types'
import { compressFile } from '../../../../utils/compressFile'
import { Card, CardContent } from '@/modules/shared/components/ui/card'
import { AlertCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface DocumentUploadFlowProps {
    clienteId: string
    clientName: string
    processoId?: string
    processType?: string
    familyMembers: { id: string, name: string, type: string }[]
    documents: ClientDocument[]
    requiredDocuments: RequiredDocument[]
    requerimentos?: any[]
    onUploadSuccess?: (data: any) => void
    onDelete: (documentId: string) => void
    agendamentos?: any[]
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

export function DocumentUploadFlow({
    clienteId,
    clientName,
    processoId,
    processType,
    familyMembers,
    documents,
    requiredDocuments,
    requerimentos = [],
    onUploadSuccess,
    onDelete,
    agendamentos = []
}: DocumentUploadFlowProps) {

    // Verificar se o processo foi iniciado
    const processNotStarted = !processoId
    const hasConsultation = agendamentos.some(a =>
        String(a.produto_nome || '').toLowerCase().includes('consultoria')
    )
    const consultationCompleted = agendamentos.some(a =>
        String(a.produto_nome || '').toLowerCase().includes('consultoria') && a.status === 'realizado'
    )
    const noDocuments = documents.length === 0

    // Se não há processo, não há consultoria realizada, e não há documentos
    const shouldShowEmptyState = processNotStarted && !consultationCompleted && noDocuments

    const handleUpload = async (file: File, documentType: string, memberId: string, documentoId?: string) => {
        // Comprimir arquivo antes do upload
        //const compressedFile = await compressFile(file)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('clienteId', clienteId)
        formData.append('documentType', documentType)
        formData.append('memberId', memberId)

        if (processoId) {
            formData.append('processoId', processoId)
        }

        if (documentoId) {
            formData.append('documentoId', documentoId)
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

    // Se o processo não foi iniciado, mostrar tela vazia
    if (shouldShowEmptyState) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Envio de Documentos</h2>
                </div>

                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 shadow-sm">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-200">
                                    Realize a Consultoria para Iniciar seu Processo
                                </h3>
                                <p className="text-sm text-amber-800 dark:text-amber-300 max-w-md">
                                    A área de documentos estará disponível após você realizar sua consultoria jurídica inicial e contratar o processo completo.
                                </p>
                            </div>

                            <div className="pt-4">
                                <Link
                                    to="/cliente/processo"
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition"
                                >
                                    <span>Acompanhar Processo</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
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
                processoId={processoId}
                members={familyMembers}
                documents={documents}
                requiredDocuments={requiredDocuments}
                requerimentos={requerimentos}
                onUpload={handleUpload}
                onDelete={onDelete}
            />
        </div>
    )
}
