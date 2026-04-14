import { useState, useMemo, useEffect, useCallback } from 'react'
import { Card } from '@/modules/shared/components/ui/card'
import { Document as ClientDocument, RequiredDocument } from '../../types'
import { cn } from '../../lib/utils'
import { FormsDeclarationsCard } from '../forms/FormsDeclarationsCard'
import { compressFile } from '../../../../utils/compressFile'
import { clienteService } from '../../services/clienteService'
import { UploadConfirmModal } from '../uploads/UploadConfirmModal'
import { ApostilleQuoteModal } from '../services/ApostilleQuoteModal'
import { TranslationQuoteModal } from '../services/TranslationPaymentModal'
import { QuoteRequestModal } from '../services/QuoteRequestModal'
import { RequirementsCard } from '../forms/RequirementsCard'
import { FolderCardHeader } from './FolderCardHeader'
import { RejectedDocumentsList } from '../uploads/RejectedDocumentsList'
import { PendingDocumentsList } from '../uploads/PendingDocumentsList'
import { DocumentTimeline } from './DocumentTimeline'
import { PdfWarningModal } from '../uploads/PdfWarningModal'

interface FamilyMember {
  id: string
  name: string
  email?: string
  type: string
  isTitular?: boolean
  clienteId?: string
}

interface FamilyFolderCardProps {
  member: FamilyMember
  documents: ClientDocument[]
  requiredDocuments: RequiredDocument[]
  processoId?: string
  isExpanded: boolean
  onToggle: () => void
  onOpenUploadModal: () => void  // New prop to open initial upload modal
  onUpload: (file: File, documentType: string, memberId: string, documentoId?: string) => Promise<void>
  requerimentos?: any[]
  onDelete: (documentId: string) => void
  onRefresh?: () => void
}

// Stage configuration - WITHOUT "pending" stage
const stages = [
  {
    id: 'rejected',
    label: 'Rejeitados',
    description: 'Documentos que precisam ser corrigidos',
    color: 'red',
    bgColor: 'bg-red-50 dark:bg-red-900/10',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-500',
    dotBg: 'bg-red-500',
  },
  {
    id: 'analyzing',
    label: 'Em Análise',
    description: 'Aguardando revisão',
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
    dotBg: 'bg-blue-500',
  },
  {
    id: 'apostille',
    label: 'Para Apostilar',
    description: 'Aprovados que precisam de apostilamento',
    color: 'amber',
    bgColor: 'bg-amber-50 dark:bg-amber-900/10',
    borderColor: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-500',
    dotBg: 'bg-amber-500',
  },
  {
    id: 'translation',
    label: 'Para Traduzir',
    description: 'Apostilados que precisam de tradução',
    color: 'purple',
    bgColor: 'bg-purple-50 dark:bg-purple-900/10',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-500',
    dotBg: 'bg-purple-500',
  },
  {
    id: 'completed',
    label: 'Concluído',
    description: 'Processo completo',
    color: 'green',
    bgColor: 'bg-green-50 dark:bg-green-900/10',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-500',
    dotBg: 'bg-green-500',
  },
]

export function FamilyFolderCard({
  member,
  documents,
  requiredDocuments,
  processoId,
  isExpanded,
  onToggle,
  onOpenUploadModal,
  onUpload,
  requerimentos,
  onDelete,
  onRefresh
}: FamilyFolderCardProps) {
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

  // Utility to check if apostille is paid
  const isApostillePaid = useCallback((d: ClientDocument) => {
    if (!d.orcamentos || d.orcamentos.length === 0) return false;
    const isPaid = d.orcamentos.some((o: any) => {
      const s = o.status?.toLowerCase();
      const obs = o.observacoes?.toLowerCase() || '';
      const type = o.tipo?.toLowerCase() || '';
      const matchStatus = ['pendente_verificacao', 'aprovado', 'approved', 'pago'].includes(s);
      const matchType = obs.includes('apostila') || type === 'apostilagem';
      return matchStatus && matchType;
    });
    // console.log(`[DEBUG] Documento ${d.id} (${d.type}) isApostillePaid: ${isPaid}`);
    return isPaid;
  }, []);

  // Utility to check if translation is paid
  const isTranslationPaid = useCallback((d: ClientDocument) => {
    if (!d.orcamentos || d.orcamentos.length === 0) {
       // if (d.status?.toLowerCase() === 'rejected') console.log(`[DEBUG_REJECTED] Documento ${d.id} Sem orçamentos.`);
       return false;
    }
    const isPaid = d.orcamentos.some((o: any) => {
      const s = o.status?.toLowerCase();
      const obs = o.observacoes?.toLowerCase() || '';
      const type = o.tipo?.toLowerCase() || '';
      const matchStatus = ['pendente_verificacao', 'aprovado', 'approved', 'pago'].includes(s);
      const matchType = obs.includes('tradução') || obs.includes('traducao') || type === 'traducao';
      
      if (d.status?.toLowerCase() === 'rejected') {
          console.log(`[DEBUG_REJECTED_DETAIL] Doc: ${d.id}, Orc: ${o.id}, Status: ${o.status} (match: ${matchStatus}), Tipo: ${o.tipo} (match: ${type === 'traducao'}), MatchType: ${matchType}`);
      }
      return matchStatus && matchType;
    });
    return isPaid;
  }, []);

  // Filter documents for this member
  const memberDocs = useMemo(() => documents.filter(d => d.memberId === member.id), [documents, member.id])

  // Buscar formulários já enviados no carregamento
  const fetchSentForms = useCallback(async () => {
    try {
      console.log('[DEBUG] Buscando formularios enviados para o cliente:', member.clienteId || member.id)
      const responses = await clienteService.getFormularioResponses(member.clienteId || member.id)
      
      // Filtrar pelas respostas que pertencem especificamente a este membro
      // Importante: Para o titular (main client), as respostas no banco podem ter membro_id nulo
      const memberResponses = responses.filter((r: any) => {
          if (member.isTitular) {
              return r.membro_id === member.id || r.membro_id === null;
          }
          return r.membro_id === member.id;
      })
      console.log(`[DEBUG] IDs enviados pelo membro ${member.id}:`, memberResponses.map((r: any) => r.formulario_juridico_id))

      // Extrair IDs dos formulários jurídicos associados
      const ids = new Set<string>(memberResponses.map((r: any) => r.formulario_juridico_id as string))
      setSentFormularioIds(ids)
    } catch (error) {
      console.error('Erro ao buscar formularios enviados:', error)
    }
  }, [member.id, member.clienteId, member.isTitular])

  // Efeito para buscar formulários quando expandido
  useEffect(() => {
    if (isExpanded) {
      fetchSentForms()
    }
  }, [isExpanded, fetchSentForms])


  // Determine the stage of a document
  const getDocStage = (doc: ClientDocument) => {
    const status = doc.status?.toLowerCase();

    if (status === 'rejected') {
        const transPaid = isTranslationPaid(doc);
        const apostPaid = isApostillePaid(doc);
        console.log(`[DEBUG_STAGE] Doc: ${doc.id}, Status: ${status}, transPaid: ${transPaid}, apostPaid: ${apostPaid}`);
        
        if (transPaid) return 'translation';
        if (apostPaid) return 'apostille';
        
        return 'rejected'
    }

    // If it's waiting for quote approval, check if it's for apostille or translation
    const isWaitingQuote = status === 'waiting_quote_approval';

    // Stage Apostille: documents ready for or in apostille process
    if (status?.includes('apostille') || (status === 'approved' && !doc.isApostilled) || (isWaitingQuote && !doc.isApostilled)) {
      return 'apostille';
    }
    
    // Stage Translation: documents ready for or in translation process
    if (status?.includes('translation') || (isWaitingQuote && doc.isApostilled) || (status === 'approved' && doc.isApostilled && !doc.isTranslated)) {
      return 'translation';
    }
    
    if (status === 'approved' && doc.isApostilled && doc.isTranslated) {
      return 'completed';
    }

    if (status === 'pending') return 'requested_pending';

    return 'analyzing';
  }

  const docIsWaitingApostille = (doc: ClientDocument) => {
    return getDocStage(doc) === 'apostille';
  }

  const getDocumentsForStage = (stageId: string) => {
    return memberDocs
      .filter(doc => getDocStage(doc) === stageId)
      .map(doc => {
        const reqDoc = requiredDocuments.find(r => r.type === doc.type)
        return {
          type: doc.type,
          name: reqDoc ? reqDoc.name : (doc.fileName || doc.type),
          description: reqDoc?.description,
          _document: doc,
          required: !!reqDoc
        }
      })
  }

  // Calculate pending documents (required but not uploaded + requested by juridico)
  const pendingDocs = useMemo(() => {
    const uploadedTypes = new Set(memberDocs.filter(d => d.status?.toLowerCase() !== 'pending').map(d => d.type))
    
    // 1. Missing required documents
    const missing = requiredDocuments
      .filter(req => !uploadedTypes.has(req.type))
      .map(req => ({
        ...req,
        required: true,
        _isRequested: false
      }))

    // 2. Documents requested by Juridico (status = pending)
    const requested = memberDocs
      .filter(d => d.status?.toLowerCase() === 'pending')
      .map(doc => {
        const reqDoc = requiredDocuments.find(r => r.type === doc.type)
        return {
          type: doc.type,
          name: reqDoc ? reqDoc.name : doc.name, // Use mapped name if available
          description: reqDoc?.description || 'Documento solicitado pela equipe jurídica.',
          required: reqDoc?.required || false,
          _document: doc,
          _isRequested: true
        }
      })

    return [...missing, ...requested]
  }, [memberDocs, requiredDocuments])

  // Calculate stats for the three main categories
  const stats = useMemo(() => {
    const s = {
      rejected: 0,
      analyzing: 0,      // Documents under legal/juridico review
      apostille: 0,
      translation: 0,
      completed: 0,      // Fully processed (approved + apostilled + translated)
      waitingAction: 0   // Documents waiting for client action (upload)
    }

    memberDocs.forEach(doc => {
      const stage = getDocStage(doc);
      const statusLower = doc.status?.toLowerCase() || '';
      
      const isApostilleWaitingAction = stage === 'apostille' && 
        ['waiting_apostille', 'approved', 'waiting_quote_approval', 'aguardando_pagamento'].includes(statusLower);
      
      const isTranslationWaitingAction = stage === 'translation' && 
        ['waiting_translation', 'approved', 'waiting_quote_approval', 'aguardando_pagamento'].includes(statusLower);

      if (stage === 'rejected') {
        s.rejected++;
        s.waitingAction++;
      } else if (stage === 'analyzing') {
        s.analyzing++;
      } else if (stage === 'apostille') {
        s.apostille++;
        if (isApostilleWaitingAction) s.waitingAction++;
      } else if (stage === 'translation') {
        s.translation++;
        if (isTranslationWaitingAction) s.waitingAction++;
      } else if (stage === 'completed') {
        s.completed++;
      }
    })

    // Add pending (missing) docs to waitingAction
    s.waitingAction += pendingDocs.length;

    return s
  }, [memberDocs, pendingDocs])

  // Calculate if this specific member has any pending requirement
  const hasPendingRequirement = useMemo(() => {
    if (!requerimentos) return false
    return requerimentos.some(req => 
      req.status === 'pendente' && 
      req.documentos?.some((doc: any) => (doc.dependente_id || doc.cliente_id) === member.id && doc.status === 'PENDING')
    )
  }, [requerimentos, member.id])

  const hasSentDocuments = memberDocs.length > 0
  const hasRejected = stats.rejected > 0 || hasPendingRequirement
  const hasPending = pendingDocs.length > 0


  const getDocumentName = (type: string) => {
    const doc = requiredDocuments.find(r => r.type === type)
    return doc ? doc.name : type
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate PDF
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
      documentoId: memberDocs.find(d => d.type === type)?.id
    })
    setShowConfirmModal(true)
    setUploadError(null)

    e.target.value = ''
  }

  // Handle upload button click - show PDF warning first
  const handleUploadClick = (inputId: string) => {
    setPendingInputId(inputId)
    setShowPdfWarning(true)
  }

  // Confirm PDF warning and open file picker
  const handleConfirmPdfWarning = () => {
    setShowPdfWarning(false)
    if (pendingInputId) {
      document.getElementById(pendingInputId)?.click()
      setPendingInputId(null)
    }
  }

  // Cancel PDF warning
  const handleCancelPdfWarning = () => {
    setShowPdfWarning(false)
    setPendingInputId(null)
  }

  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault()
    setDragOver(null)

    const file = e.dataTransfer.files[0]
    if (!file) return

    // Validate PDF
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
      documentoId: memberDocs.find(d => d.type === type)?.id
    })
    setShowConfirmModal(true)
    setUploadError(null)
  }

  const handleConfirmUpload = async () => {
    if (!pendingUpload) return

    try {
      setIsUploading(true)
      setUploadError(null)
      // We set uploadingType just for compatibility if needed elsewhere, 
      // but the modal now blocks interaction so it's less critical.
      setUploadingType(pendingUpload.documentType)

      await onUpload(pendingUpload.file, pendingUpload.documentType, member.id, pendingUpload.documentoId)

      // Refresh list of sent forms before closing
      await fetchSentForms()

      // Success
      setShowConfirmModal(false)
      setPendingUpload(null)

    } catch (error: any) {
      console.error("Upload failed", error)
      setUploadError(error.message || "Erro ao enviar documento. Tente novamente.")
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

  // Handler passed to FormsDeclarationsCard for uploading signed forms
  const handleFormResponseUpload = async (file: File, formularioId: string) => {
    try {
      setIsUploading(true)
      setUploadError(null)

      // Comprimir arquivo antes do upload
      const compressedFile = await compressFile(file)

      const formData = new FormData()
      formData.append('file', compressedFile)

      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
      const response = await fetch(`${API_BASE_URL}/cliente/formularios/${formularioId}/response`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao enviar formulário assinado')
      }

      const result = await response.json()
      console.log('Formulario assinado enviado com sucesso:', result)
      
      // Atualizar lista de formulários enviados
      await fetchSentForms()
      
      // Show success (you could add a toast notification here)
      alert('Formulário assinado enviado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao enviar formulario:', error)
      setUploadError(error.message || 'Erro ao enviar formulário assinado')
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
      console.error('Erro ao solicitar traducao:', error)
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

  // Handle card click - now always toggles
  const handleCardClick = () => {
    onToggle()
  }

  // Filter stages to only show those with documents (exclude rejected as it will be shown separately)
  const visibleStages = stages.filter(stage => {
    const docs = getDocumentsForStage(stage.id)
    return stage.id !== 'rejected' && docs.length > 0
  })

  return (
    <>
      <Card
        className={cn(
          "transition-all duration-300 border-2",
          isExpanded ? "overflow-visible" : "overflow-hidden",
          hasRejected ? 'border-red-500 dark:border-red-600 shadow-lg shadow-red-500/10' : 'border-gray-200 dark:border-gray-700',
          isExpanded && !hasRejected && 'shadow-lg'
        )}
      >
        <FolderCardHeader
          member={member}
          isExpanded={isExpanded}
          hasSentDocuments={hasSentDocuments}
          hasRejected={hasRejected}
          stats={stats}
          onClick={handleCardClick}
        />

        {/* Expanded Content - Timeline - Only if has documents */}
        <div className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50/50 dark:bg-gray-900/20 space-y-8">
            {/* Rejected Documents Section */}
            <RejectedDocumentsList
              rejectedDocs={stats.rejected > 0 ? getDocumentsForStage('rejected') : []}
              memberId={member.id}
              uploadingType={uploadingType}
              onUploadClick={handleUploadClick}
              onFileSelect={handleFileSelect}
            />

            {/* Pending Documents Section */}
            <PendingDocumentsList
              pendingDocs={pendingDocs}
              memberId={member.id}
              memberDocs={memberDocs}
              uploadingType={uploadingType}
              hasVisibleStages={visibleStages.length > 0}
              onUploadClick={handleUploadClick}
              onFileSelect={handleFileSelect}
            />

            {/* Timeline Container */}
            <DocumentTimeline
              visibleStages={visibleStages}
              memberId={member.id}
              uploadingType={uploadingType}
              dragOver={dragOver}
              isRequestingQuote={isRequestingQuote}
              getDocumentsForStage={getDocumentsForStage}
              onUploadClick={handleUploadClick}
              onFileSelect={handleFileSelect}
              onDrop={handleDrop}
              onDragOver={setDragOver}
              onDragLeave={() => setDragOver(null)}
              onDelete={onDelete}
              onOpenApostilleQuote={(doc) => {
                setSelectedDocForClientQuote(doc)
                setShowClientQuoteModal(true)
              }}
              onOpenTranslationQuote={(doc) => {
                setSelectedDocForQuote(doc)
                setShowQuoteModal(true)
              }}
              onOpenClientQuote={(doc) => {
                setSelectedDocForClientQuote(doc)
                setShowClientQuoteModal(true)
              }}
            />

          </div>
        </div>

        {/* Formulários e Declarações Section */}
        {processoId && (
          <div className="px-4 pb-2">
            <FormsDeclarationsCard
              memberId={member.id}
              memberName={member.name}
              processoId={processoId}
              clienteId={member.clienteId}
              isTitular={member.isTitular}
              onUpload={handleFormResponseUpload}
            />

            <RequirementsCard
              clienteId={member.clienteId || member.id}
              processoId={processoId}
              membroId={member.id}
              initialRequirements={requerimentos}
            />
          </div>
        )}

      </Card>

      {/* Modal de Confirmação de Upload */}
      {pendingUpload && (
        <UploadConfirmModal
          isOpen={showConfirmModal}
          onClose={handleCancelUpload}
          onConfirm={handleConfirmUpload}
          isUploading={isUploading}
          uploadError={uploadError}
          pendingUpload={{
            file: pendingUpload.file,
            documentName: pendingUpload.documentName,
            isReplacement: pendingUpload.isReplacement,
            targetName: member.name
          }}
        />
      )}

      {/* PDF Warning Modal */}
      <PdfWarningModal
        isOpen={showPdfWarning}
        onConfirm={handleConfirmPdfWarning}
        onCancel={handleCancelPdfWarning}
      />

      {/* Modal de Solicitação de Orçamento */}
      {showQuoteModal && selectedDocForQuote && (
        <QuoteRequestModal
          isOpen={showQuoteModal}
          document={selectedDocForQuote}
          documentName={selectedDocForQuote.fileName || getDocumentName(selectedDocForQuote.type)}
          isApostille={docIsWaitingApostille(selectedDocForQuote)}
          isRequestingQuote={isRequestingQuote}
          requestedSuccessfully={requestedSuccessfully}
          onRequestApostille={handleRequestApostille}
          onRequestTranslation={handleRequestTranslation}
          onClose={handleCloseQuoteModal}
        />
      )}
      {/* Modal de Apostila */}
      {showClientQuoteModal && selectedDocForClientQuote && docIsWaitingApostille(selectedDocForClientQuote) && (
        <ApostilleQuoteModal
          documentoId={selectedDocForClientQuote.id}
          documentoNome={selectedDocForClientQuote.fileName || getDocumentName(selectedDocForClientQuote.type)}
          clienteEmail={member.email || ''}
          isOpen={showClientQuoteModal}
          allDocuments={memberDocs}
          onClose={() => {
            setShowClientQuoteModal(false)
            setSelectedDocForClientQuote(null)
          }}
          onPaymentSuccess={() => {
            if (onRefresh) onRefresh()
            else window.location.reload()
          }}
        />
      )}

      {/* Modal de Tradução */}
      {showClientQuoteModal && selectedDocForClientQuote && !docIsWaitingApostille(selectedDocForClientQuote) && (
        <TranslationQuoteModal
          documentoId={selectedDocForClientQuote.id}
          documentoNome={selectedDocForClientQuote.fileName || getDocumentName(selectedDocForClientQuote.type)}
          clienteEmail={member.email || ''}
          isOpen={showClientQuoteModal}
          allDocuments={memberDocs}
          onClose={() => {
            setShowClientQuoteModal(false)
            setSelectedDocForClientQuote(null)
          }}
          onPaymentSuccess={() => {
            if (onRefresh) onRefresh()
            else window.location.reload()
          }}
        />
      )}
    </>
  )
}
