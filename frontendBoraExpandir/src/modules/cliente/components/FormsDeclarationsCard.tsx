import { useState, useEffect } from 'react'
import {
    FolderOpen,
    Download,
    FileText,
    Clock,
    ChevronDown,
    ChevronUp,
    Folder
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { formatDate, formatFileSize } from '../lib/utils'

interface FormDeclaration {
    id: string
    name: string
    fileName: string
    fileSize: number
    uploadDate: Date
    uploadedBy: string
    downloadUrl: string
    memberId: string
}

interface FormsDeclarationsCardProps {
    memberId: string
    memberName: string
    processoId: string
    isJuridico?: boolean
    onUpload?: (file: File, memberId: string) => Promise<void>
    onDelete?: (formId: string) => Promise<void>
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function FormsDeclarationsCard({
    memberId,
    memberName,
    processoId,
    isJuridico = false,
    onUpload,
    onDelete
}: FormsDeclarationsCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [forms, setForms] = useState<FormDeclaration[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Fetch forms for this member
    useEffect(() => {
        const fetchForms = async () => {
            if (!processoId || !memberId) return

            setIsLoading(true)
            try {
                const res = await fetch(`${API_BASE_URL}/cliente/processo/${processoId}/formularios/${memberId}`)
                if (res.ok) {
                    const data = await res.json()
                    setForms(data.data || [])
                }
            } catch (error) {
                console.error('Erro ao buscar formulários:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (isExpanded) {
            fetchForms()
        }
    }, [processoId, memberId, isExpanded])

    const handleDownload = async (form: FormDeclaration) => {
        if (form.downloadUrl) {
            window.open(form.downloadUrl, '_blank')
        }
    }

    const handleDelete = async (formId: string) => {
        if (onDelete) {
            await onDelete(formId)
            setForms(prev => prev.filter(f => f.id !== formId))
        }
    }

    return (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                        <Folder className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                            Formulários e Declarações
                        </h4>
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                            Documentos enviados pelo jurídico
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {forms.length > 0 && (
                        <Badge className="bg-purple-600 text-white">
                            {forms.length}
                        </Badge>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-purple-600" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-purple-600" />
                    )}
                </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-3 space-y-2 pl-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6 text-purple-600">
                            <div className="animate-spin h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full" />
                            <span className="ml-2 text-sm">Carregando...</span>
                        </div>
                    ) : forms.length === 0 ? (
                        <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                            <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhum formulário disponível ainda</p>
                            <p className="text-xs text-gray-400 mt-1">
                                O jurídico enviará documentos aqui quando necessário
                            </p>
                        </div>
                    ) : (
                        forms.map((form) => (
                            <div
                                key={form.id}
                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                        <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                                            {form.name}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <Clock className="h-3 w-3" />
                                            <span>{formatDate(form.uploadDate)}</span>
                                            <span>•</span>
                                            <span>{formatFileSize(form.fileSize)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 px-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                        onClick={() => handleDownload(form)}
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        Baixar
                                    </Button>

                                    {isJuridico && onDelete && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(form.id)}
                                        >
                                            ✕
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
