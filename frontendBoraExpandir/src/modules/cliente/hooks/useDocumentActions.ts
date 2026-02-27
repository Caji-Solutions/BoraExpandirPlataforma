import { useState, useMemo, useEffect, useCallback } from 'react'
import { Document as ClientDocument, RequiredDocument } from '../types'
import { compressFile } from '../../../utils/compressFile'
import { clienteService } from '../services/clienteService'

interface FamilyMember {
    id: string
    name: string
    email?: string
    type: string
    isTitular?: boolean
    clienteId?: string
}

interface UseDocumentActionsProps {
    member: FamilyMember
    documents: ClientDocument[]
    requiredDocuments: RequiredDocument[]
    processoId?: string
    requerimentos?: any[]
    onUpload: (file: File, documentType: string, memberId: string, documentoId?: string) => Promise<void>
    onRefresh?: () => void
}

export function useDocumentActions({
    member,
    documents,
    requiredDocuments,
    processoId,
    requerimentos = [],
    onUpload,
    onRefresh,
}: UseDocumentActionsProps) {
    const [uploadingType, setUploadingType] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState<string | null>(null)

    // Modal States
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [showPdfWarning, setShowPdfWarning] = useState(false)
    const [pendingInputId, setPendingInputId] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [pendingUpload, setPendingUpload] = useState<{
        file: File
        documentType: string
        documentName: string
        isReplacement?: boolean
        documentoId?: string
    } | null>(null)

    const [showQuoteModal, setShowQuoteModal] = useState(false)
    const [selectedDocForQuote, setSelectedDocForQuote] = useState<ClientDocument | null>(null)
    const [isRequestingQuote, setIsRequestingQuote] = useState(false)
    const [requestedSuccessfully, setRequestedSuccessfully] = useState(false)

    const [showClientQuoteModal, setShowClientQuoteModal] = useState(false)
    const [selectedDocForClientQuote, setSelectedDocForClientQuote] = useState<ClientDocument | null>(null)

    // Estado para armazenar IDs de formulários já enviados
    const [sentFormularioIds, setSentFormularioIds] = useState<Set<string>>(new Set())

    // Forms count for the tab badge
    const [formsCount, setFormsCount] = useState(0)

    // Filter documents for this member
    const memberDocs = useMemo(() => documents.filter(d => d.memberId === member.id), [documents, member.id])

    // Buscar formulários já enviados
    const fetchSentForms = useCallback(async () => {
        try {
            const responses = await clienteService.getFormularioResponses(member.clienteId || member.id)
            const memberResponses = responses.filter((r: any) => {
                if (member.isTitular) {
                    return r.membro_id === member.id || r.membro_id === null
                }
                return r.membro_id === member.id
            })
            const ids = new Set<string>(memberResponses.map((r: any) => r.formulario_juridico_id as string))
            setSentFormularioIds(ids)
        } catch (error) {
            console.error('Erro ao buscar formulários enviados:', error)
        }
    }, [member.id, member.clienteId, member.isTitular])

    useEffect(() => {
        fetchSentForms()
    }, [fetchSentForms])

    // Fetch forms count for the tab badge
    useEffect(() => {
        if (!processoId || !member.id) return
        const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
        fetch(`${API_BASE_URL}/cliente/processo/${processoId}/formularios/${member.id}`)
            .then(res => res.ok ? res.json() : { data: [] })
            .then(data => setFormsCount((data.data || []).length))
            .catch(() => setFormsCount(0))
    }, [processoId, member.id])

    // Determine the stage of a document
    const getDocStage = (doc: ClientDocument) => {
        const status = doc.status?.toLowerCase()
        if (status === 'rejected') return 'rejected'
        const isWaitingQuote = status === 'waiting_quote_approval'
        if (status?.includes('apostille') || (status === 'approved' && !doc.isApostilled) || (isWaitingQuote && !doc.isApostilled)) {
            return 'apostille'
        }
        if (status?.includes('translation') || (isWaitingQuote && doc.isApostilled) || (status === 'approved' && doc.isApostilled && !doc.isTranslated)) {
            return 'translation'
        }
        if (status === 'approved' && doc.isApostilled && doc.isTranslated) {
            return 'completed'
        }
        if (status === 'pending') return 'requested_pending'
        return 'analyzing'
    }

    const docIsWaitingApostille = (doc: ClientDocument) => {
        return getDocStage(doc) === 'apostille'
    }

    const getDocumentsForStage = (stageId: string) => {
        return memberDocs
            .filter(doc => {
                const docStage = getDocStage(doc)
                if (docStage !== stageId) return false
                
                // Filtro de visibilidade para o cliente
                // Abas de fluxo (apostila/tradução) só mostram se o jurídico solicitou explicitamente
                if (stageId === 'apostille' || stageId === 'translation') {
                    // Verificação robusta: aceita true ou 1 (caso venha do banco como número)
                    const foiSolicitado = doc.solicitado_pelo_juridico === true || 
                                        (doc.solicitado_pelo_juridico as any) === 1 ||
                                        (doc.solicitado_pelo_juridico as any) === 'true';
                    return foiSolicitado;
                }
                
                return true
            })
            .map(doc => {
                const reqDoc = requiredDocuments.find(r => r.type === doc.type)
                return {
                    type: doc.type,
                    name: reqDoc ? reqDoc.name : (doc.fileName || doc.type),
                    description: reqDoc?.description,
                    _document: doc,
                    required: !!reqDoc,
                    solicitado_pelo_juridico: doc.solicitado_pelo_juridico
                }
            })
    }

    // Calculate pending documents (required but not uploaded + requested by juridico)
    const pendingDocs = useMemo(() => {
        const uploadedTypes = new Set(
            memberDocs
                .filter(d => d.status?.toLowerCase() !== 'pending' && d.status?.toLowerCase() !== 'rejected')
                .map(d => d.type)
        )

        const missing = requiredDocuments
            .filter(req => !uploadedTypes.has(req.type))
            .map(req => ({
                ...req,
                required: true,
                _isRequested: false,
            }))

        const requested = memberDocs
            .filter(d => {
                const status = d.status?.toLowerCase();
                // Inclui se o status for explicitamente 'pending'
                if (status === 'pending' && !d.requerimento_id) return true;
                
                // OU se foi solicitado pelo jurídico e está aguardando ação de fluxo
                const foiSolicitado = d.solicitado_pelo_juridico === true || 
                                    (d.solicitado_pelo_juridico as any) === 1 || 
                                    (d.solicitado_pelo_juridico as any) === 'true';
                
                if (foiSolicitado && (status === 'waiting_apostille' || status === 'waiting_translation')) {
                    return true;
                }

                return false;
            })
            .map(doc => {
                const reqDoc = requiredDocuments.find(r => r.type === doc.type)
                return {
                    type: doc.type,
                    name: reqDoc ? reqDoc.name : doc.name,
                    description: reqDoc?.description || 'Documento solicitado pela equipe jurídica.',
                    required: reqDoc?.required || false,
                    _document: doc,
                    _isRequested: true,
                }
            })

        return [...missing, ...requested]
    }, [memberDocs, requiredDocuments])

    // Count pending requirements
    const pendingRequirementsCount = useMemo(() => {
        return requerimentos.filter(r => r.status === 'pendente').length
    }, [requerimentos])

    // Calculate counts for each tab
    const tabCounts = useMemo(() => {
        const counts: Record<string, number> = {
            pending: pendingDocs.length,
            analyzing: getDocumentsForStage('analyzing').length,
            rejected: getDocumentsForStage('rejected').length,
            apostille: getDocumentsForStage('apostille').length,
            translation: getDocumentsForStage('translation').length,
            completed: getDocumentsForStage('completed').length,
            forms: formsCount,
            requirements: requerimentos.length,
        }
        return counts
    }, [memberDocs, pendingDocs, requiredDocuments, formsCount, requerimentos])

    const getDocumentName = (type: string) => {
        const doc = requiredDocuments.find(r => r.type === type)
        return doc ? doc.name : type
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setUploadError('Apenas arquivos PDF são aceitos. Por favor, selecione um arquivo .pdf')
            setShowConfirmModal(true)
            e.target.value = ''
            return
        }

        setPendingUpload({
            file,
            documentType: type,
            documentName: getDocumentName(type),
            isReplacement: !!memberDocs.find(d => d.type === type),
            documentoId: memberDocs.find(d => d.type === type)?.id,
        })
        setShowConfirmModal(true)
        setUploadError(null)
        e.target.value = ''
    }

    const handleUploadClick = (inputId: string) => {
        setPendingInputId(inputId)
        setShowPdfWarning(true)
    }

    const handleConfirmPdfWarning = () => {
        setShowPdfWarning(false)
        if (pendingInputId) {
            document.getElementById(pendingInputId)?.click()
            setPendingInputId(null)
        }
    }

    const handleCancelPdfWarning = () => {
        setShowPdfWarning(false)
        setPendingInputId(null)
    }

    const handleDrop = (e: React.DragEvent, type: string) => {
        e.preventDefault()
        setDragOver(null)
        const file = e.dataTransfer.files[0]
        if (!file) return
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setUploadError('Apenas arquivos PDF são aceitos. Por favor, selecione um arquivo .pdf')
            setShowConfirmModal(true)
            return
        }
        setPendingUpload({
            file,
            documentType: type,
            documentName: getDocumentName(type),
            isReplacement: !!memberDocs.find(d => d.type === type),
            documentoId: memberDocs.find(d => d.type === type)?.id,
        })
        setShowConfirmModal(true)
        setUploadError(null)
    }

    const handleConfirmUpload = async () => {
        if (!pendingUpload) return
        try {
            setIsUploading(true)
            setUploadError(null)
            setUploadingType(pendingUpload.documentType)
            await onUpload(pendingUpload.file, pendingUpload.documentType, member.id, pendingUpload.documentoId)
            await fetchSentForms()
            setShowConfirmModal(false)
            setPendingUpload(null)
        } catch (error: any) {
            console.error('Upload failed', error)
            setUploadError(error.message || 'Erro ao enviar documento. Tente novamente.')
        } finally {
            setIsUploading(false)
            setUploadingType(null)
        }
    }

    const handleCancelUpload = () => {
        setShowConfirmModal(false)
        setPendingUpload(null)
        setUploadError(null)
    }

    const handleFormResponseUpload = async (file: File, formularioId: string) => {
        try {
            setIsUploading(true)
            setUploadError(null)
            const compressedFile = await compressFile(file)
            const formData = new FormData()
            formData.append('file', compressedFile)
            const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
            const response = await fetch(`${API_BASE_URL}/cliente/formularios/${formularioId}/response`, {
                method: 'POST',
                body: formData,
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erro ao enviar formulário assinado')
            }
            await fetchSentForms()
            alert('Formulário assinado enviado com sucesso!')
        } catch (error: any) {
            console.error('Erro ao enviar formulário:', error)
            alert(error.message || 'Erro ao enviar formulário assinado')
        } finally {
            setIsUploading(false)
        }
    }

    const handleRequestTranslation = async () => {
        if (!selectedDocForQuote) return
        try {
            setIsRequestingQuote(true)
            await clienteService.updateDocumentoStatus(selectedDocForQuote.id, 'WAITING_TRANSLATION_QUOTE')
            setRequestedSuccessfully(true)
        } catch (error: any) {
            console.error('Erro ao solicitar tradução:', error)
            alert(error.message || 'Erro ao solicitar tradução')
        } finally {
            setIsRequestingQuote(false)
        }
    }

    const handleRequestApostille = async () => {
        if (!selectedDocForQuote) return
        try {
            setIsRequestingQuote(true)
            await clienteService.updateDocumentoStatus(selectedDocForQuote.id, 'WAITING_APOSTILLE_QUOTE')
            setRequestedSuccessfully(true)
        } catch (error: any) {
            console.error('Erro ao solicitar apostila:', error)
            alert(error.message || 'Erro ao solicitar apostila')
        } finally {
            setIsRequestingQuote(false)
        }
    }

    const handleCloseQuoteModal = () => {
        if (requestedSuccessfully) {
            if (onRefresh) {
                onRefresh()
            } else {
                window.location.reload()
            }
        }
        setShowQuoteModal(false)
        setSelectedDocForQuote(null)
        setRequestedSuccessfully(false)
    }

    return {
        // Data
        memberDocs,
        pendingDocs,
        tabCounts,
        pendingRequirementsCount,

        // Stage helpers
        getDocStage,
        getDocumentsForStage,
        getDocumentName,
        docIsWaitingApostille,

        // Upload state
        uploadingType,
        dragOver,
        setDragOver,
        isUploading,
        uploadError,

        // Upload handlers
        handleFileSelect,
        handleUploadClick,
        handleDrop,
        handleConfirmUpload,
        handleCancelUpload,
        handleFormResponseUpload,

        // PDF Warning modal
        showPdfWarning,
        handleConfirmPdfWarning,
        handleCancelPdfWarning,

        // Upload confirm modal
        showConfirmModal,
        pendingUpload,

        // Quote modal
        showQuoteModal,
        setShowQuoteModal,
        selectedDocForQuote,
        setSelectedDocForQuote,
        isRequestingQuote,
        requestedSuccessfully,
        handleRequestTranslation,
        handleRequestApostille,
        handleCloseQuoteModal,

        // Client quote modal (apostille/translation payment)
        showClientQuoteModal,
        setShowClientQuoteModal,
        selectedDocForClientQuote,
        setSelectedDocForClientQuote,
    }
}
