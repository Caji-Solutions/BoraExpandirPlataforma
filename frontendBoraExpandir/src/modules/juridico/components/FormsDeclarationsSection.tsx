import { useState, useEffect } from 'react'
import {
    Folder,
    Upload,
    FileText,
    Trash2,
    Clock,
    ChevronUp,
    ChevronDown,
    Users,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from '../../../components/ui/Badge'
import { formatFileSize } from '../../cliente/lib/utils'

interface FormDeclaration {
    id: string
    name: string
    fileName: string
    fileSize: number
    uploadDate: Date
    memberId: string
    memberName: string
    downloadUrl: string
}

interface FamilyMember {
    id: string
    name: string
    type: string
}

interface FormsDeclarationsSectionProps {
    processoId: string
    clienteId: string
    clientName: string
    members: FamilyMember[]
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function FormsDeclarationsSection({
    processoId,
    clienteId,
    clientName,
    members
}: FormsDeclarationsSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const [forms, setForms] = useState<FormDeclaration[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [selectedMemberId, setSelectedMemberId] = useState<string>('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [uploadSuccess, setUploadSuccess] = useState(false)

    // Fetch all forms for this processo
    useEffect(() => {
        const fetchForms = async () => {
            if (!processoId) return

            setIsLoading(true)
            try {
                const res = await fetch(`${API_BASE_URL}/cliente/processo/${processoId}/formularios`)
                if (res.ok) {
                    const data = await res.json()
                    // Map member names
                    const formsWithNames = (data.data || []).map((f: any) => ({
                        ...f,
                        memberName: members.find(m => m.id === f.memberId)?.name || 'Desconhecido'
                    }))
                    setForms(formsWithNames)
                }
            } catch (error) {
                console.error('Erro ao buscar formulários:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchForms()
    }, [processoId, members])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate PDF
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                setUploadError('Apenas arquivos PDF são aceitos!')
                return
            }
            setSelectedFile(file)
            setUploadError(null)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile || !selectedMemberId) {
            setUploadError('Selecione um membro e um arquivo')
            return
        }

        setIsUploading(true)
        setUploadError(null)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('processoId', processoId)
            formData.append('clienteId', clienteId)
            formData.append('memberId', selectedMemberId)

            const res = await fetch(`${API_BASE_URL}/cliente/processo/${processoId}/formularios`, {
                method: 'POST',
                body: formData
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.message || 'Erro ao enviar formulário')
            }

            // Add to list
            setForms(prev => [...prev, {
                id: result.data?.id || Date.now().toString(),
                name: selectedFile.name.replace('.pdf', ''),
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                uploadDate: new Date(),
                memberId: selectedMemberId,
                memberName: members.find(m => m.id === selectedMemberId)?.name || 'Desconhecido',
                downloadUrl: result.data?.downloadUrl || ''
            }])

            setUploadSuccess(true)
            setTimeout(() => {
                setUploadSuccess(false)
                setShowUploadModal(false)
                setSelectedFile(null)
                setSelectedMemberId('')
            }, 1500)

        } catch (error: any) {
            setUploadError(error.message || 'Erro ao enviar formulário')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDelete = async (formId: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/cliente/processo/${processoId}/formularios/${formId}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                setForms(prev => prev.filter(f => f.id !== formId))
            }
        } catch (error) {
            console.error('Erro ao deletar formulário:', error)
        }
    }

    return (
        <>
            {/* Main Section - Fixed at bottom */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10">
                {/* Header */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                            <Folder className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100 text-sm">
                                Formulários e Declarações
                            </h4>
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                                Envie documentos para o cliente
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {forms.length > 0 && (
                            <Badge className="bg-purple-600 text-white text-xs">
                                {forms.length}
                            </Badge>
                        )}
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-purple-600" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-purple-600" />
                        )}
                    </div>
                </button>

                {/* Content */}
                {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                        {/* Upload Button */}
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Enviar Formulário para Cliente
                        </Button>

                        {/* Forms List */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-4 text-purple-600">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                <span className="text-sm">Carregando...</span>
                            </div>
                        ) : forms.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-2">
                                Nenhum formulário enviado ainda
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {forms.map((form) => (
                                    <div
                                        key={form.id}
                                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileText className="h-4 w-4 text-purple-500 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white truncate text-xs">
                                                    {form.name}
                                                </p>
                                                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {form.memberName}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(form.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => !isUploading && setShowUploadModal(false)}
                    />

                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                                    <Upload className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        Enviar Formulário
                                    </h3>
                                    <p className="text-purple-100 text-sm mt-1">
                                        Para: {clientName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {uploadSuccess ? (
                                <div className="py-8 text-center">
                                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Formulário Enviado!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Member Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Destinatário
                                        </label>
                                        <select
                                            value={selectedMemberId}
                                            onChange={(e) => setSelectedMemberId(e.target.value)}
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="">Selecione um membro...</option>
                                            {members.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name} ({m.type})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* File Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Arquivo PDF
                                        </label>
                                        <div
                                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                                            onClick={() => document.getElementById('form-upload-input')?.click()}
                                        >
                                            {selectedFile ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <FileText className="h-8 w-8 text-purple-500" />
                                                    <div className="text-left">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {selectedFile.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatFileSize(selectedFile.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">
                                                        Clique para selecionar um arquivo PDF
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            id="form-upload-input"
                                            className="hidden"
                                            accept=".pdf,application/pdf"
                                            onChange={handleFileSelect}
                                        />
                                    </div>

                                    {/* Error */}
                                    {uploadError && (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                            <p className="text-sm text-red-700 dark:text-red-300">{uploadError}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        {!uploadSuccess && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowUploadModal(false)}
                                    disabled={isUploading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || !selectedMemberId || isUploading}
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Enviar Formulário
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
