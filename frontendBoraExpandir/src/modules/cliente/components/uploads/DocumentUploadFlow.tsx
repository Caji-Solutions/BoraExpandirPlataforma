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
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            },
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
            <div className="max-w-4xl mx-auto px-4 space-y-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Envio de Documentos</h2>
                </div>

                <Card className="relative overflow-hidden border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-yellow-400/5" />
                    <CardContent className="relative z-10 p-6 sm:p-12">
                        <div className="flex flex-col items-center justify-center text-center space-y-6">
                            <div className="p-4 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 rounded-2xl shadow-md">
                                <AlertCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                            </div>

                            <div className="space-y-3 max-w-xl">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-600 dark:from-amber-300 dark:to-yellow-300 bg-clip-text text-transparent">
                                    Realize a Assessoria para Iniciar seu Processo
                                </h3>
                                <p className="text-base text-amber-800 dark:text-amber-300 leading-relaxed">
                                    A área de documentos estará disponível após você realizar sua assessoria jurídica inicial e contratar o processo completo.
                                </p>
                            </div>

                            <div className="pt-2">
                                <Link
                                    to="/cliente/processo"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    <span>Acompanhar Processo</span>
                                    <ArrowRight className="w-5 h-5" />
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
