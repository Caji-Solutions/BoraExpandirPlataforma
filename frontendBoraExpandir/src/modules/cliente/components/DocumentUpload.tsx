import { useState, useEffect } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Upload, FileText, AlertCircle, CheckCircle, Clock, X, Trash2, Loader2, RefreshCw } from 'lucide-react'
import { Document as ClientDocument, RequiredDocument } from '../types'
import { cn, formatDate, formatFileSize } from '../lib/utils'

interface PendingUpload {
  file: File
  documentType: string
  documentName: string
  processoId?: string     // ID do processo ao qual o documento pertence
  processoTipo?: string   // Tipo do processo para exibição
}

interface Processo {
  id: string
  tipoServico: string
  status: string
  etapaAtual: number
}

interface DocumentUploadProps {
  clienteId: string
  memberId?: string
  documents: ClientDocument[]
  requiredDocuments?: RequiredDocument[]  // Agora opcional - fallback caso API falhe
  onUploadSuccess?: (data: any) => void
  onDelete: (documentId: string) => void
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// TODO: Substituir por ID do cliente logado quando implementar autenticação
// Este cliente tem processos: Cidadania Portuguesa e Visto D7
const MOCK_CLIENTE_LOGADO_ID = 'a004a6b8-4a03-42e4-94a9-bb62c8238c0c'

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pendente',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-400',
    badge: 'warning' as const,
  },
  analyzing: {
    icon: Clock,
    label: 'Em Análise',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-400',
    badge: 'default' as const,
  },
  approved: {
    icon: CheckCircle,
    label: 'Aprovado',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-400',
    badge: 'success' as const,
  },
  rejected: {
    icon: X,
    label: 'Rejeitado',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-400',
    badge: 'destructive' as const,
  },
  sent_for_apostille: {
    icon: CheckCircle,
    label: 'Enviado p/ Apostila',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-400',
    badge: 'secondary' as const,
  },
}

export function DocumentUpload({ clienteId, memberId, documents, requiredDocuments: fallbackDocuments = [], onUploadSuccess, onDelete }: DocumentUploadProps) {
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Estados para buscar documentos da API
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>(fallbackDocuments)
  const [processos, setProcessos] = useState<Processo[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Buscar documentos requeridos da API
  // TODO: Usar clienteId do usuário logado quando implementar autenticação
  const fetchDocumentosRequeridos = async () => {
    setIsLoadingDocs(true)
    setLoadError(null)

    try {
      // Usando MOCK_CLIENTE_LOGADO_ID temporariamente até implementar login
      const response = await fetch(`${API_BASE_URL}/cliente/${MOCK_CLIENTE_LOGADO_ID}/documentos-requeridos`)

      if (!response.ok) {
        throw new Error('Erro ao buscar documentos requeridos')
      }

      const result = await response.json()

      // Mapear os dados da API para o formato esperado pelo componente
      const docsFromApi: RequiredDocument[] = result.data.map((doc: any) => ({
        type: doc.type,
        name: doc.name,
        description: doc.description,
        required: doc.required,
        examples: doc.examples,
        processoId: doc.processoId,
        processoTipo: doc.processoTipo,
      }))
      console.log(docsFromApi)

      setRequiredDocuments(docsFromApi)
      setProcessos(result.processos || [])

      console.log('Documentos requeridos carregados:', docsFromApi.length)
      console.log('Processos do cliente:', result.processos)
    } catch (error: any) {
      console.error('Erro ao buscar documentos requeridos:', error)
      setLoadError(error.message || 'Erro ao carregar documentos')
      // Usar fallback se disponível
      if (fallbackDocuments.length > 0) {
        setRequiredDocuments(fallbackDocuments)
      }
    } finally {
      setIsLoadingDocs(false)
    }
  }

  // Buscar documentos ao montar o componente
  useEffect(() => {
    if (clienteId) {
      fetchDocumentosRequeridos()
    }
  }, [clienteId])

  const getDocumentName = (type: string): string => {
    const reqDoc = requiredDocuments.find(doc => doc.type === type)
    return reqDoc?.name || type
  }

  const handleDrop = (e: React.DragEvent, documentType: string, processoId?: string, processoTipo?: string) => {
    e.preventDefault()
    setDragOver(null)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setPendingUpload({
        file: files[0],
        documentType,
        documentName: getDocumentName(documentType),
        processoId,
        processoTipo
      })
      setShowConfirmModal(true)
      setUploadError(null)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, documentType: string, processoId?: string, processoTipo?: string) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setPendingUpload({
        file: files[0],
        documentType,
        documentName: getDocumentName(documentType),
        processoId,
        processoTipo
      })
      setShowConfirmModal(true)
      setUploadError(null)
    }
    e.target.value = ''
  }

  const handleConfirmUpload = async () => {
    if (!pendingUpload) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', pendingUpload.file)
      formData.append('clienteId', clienteId)
      formData.append('documentType', pendingUpload.documentType)

      // Adiciona processoId se existir
      if (pendingUpload.processoId) {
        formData.append('processoId', pendingUpload.processoId)
      }

      if (memberId) {
        formData.append('memberId', memberId)
      }

      if (memberId) {
        formData.append('memberId', memberId)
      }

      if (memberId) {
        formData.append('memberId', memberId)
      }

      const response = await fetch(`${API_BASE_URL}/cliente/uploadDoc`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao enviar documento')
      }

      // Sucesso - fechar modal e notificar
      setPendingUpload(null)
      setShowConfirmModal(false)
      onUploadSuccess?.(result.data)
    } catch (error: any) {
      console.error('Erro no upload:', error)
      setUploadError(error.message || 'Erro ao enviar documento. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancelUpload = () => {
    setPendingUpload(null)
    setShowConfirmModal(false)
    setUploadError(null)
  }

  const getDocumentForType = (type: string) => {
    // Se memberId estiver definido, filtra também por ele.
    // Caso contrário (retrocompatibilidade), pega qualquer documento do tipo.
    // Mas para o novo fluxo, o memberId é crucial.
    return documents.find(doc => doc.type === type && (memberId ? doc.memberId === memberId : true))
  }

  // Contadores de status
  const pendingCount = requiredDocuments.filter(req => {
    const doc = getDocumentForType(req.type)
    return !doc || doc.status === 'pending'
  }).length
  const analyzingCount = documents.filter(doc => doc.status === 'analyzing').length
  const approvedCount = documents.filter(doc => doc.status === 'approved').length
  const rejectedCount = documents.filter(doc => doc.status === 'rejected').length

  // Loading state para busca inicial de documentos
  if (isLoadingDocs) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Carregando documentos requeridos...</p>
        </div>
      </div>
    )
  }

  // Estado de erro ao buscar documentos
  if (loadError && requiredDocuments.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 dark:text-red-300 font-medium">{loadError}</p>
          <button
            onClick={fetchDocumentosRequeridos}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload de Documentos</h2>
        <p className="text-gray-600 dark:text-gray-400">Envie os documentos necessários para o seu processo.</p>
      </div>

      {/* Processos do Cliente */}
      {processos.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">Seus Processos Ativos</h3>
          <div className="flex flex-wrap gap-2">
            {processos.map((processo) => (
              <div
                key={processo.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border shadow-sm"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  processo.status === 'em_analise' ? 'bg-blue-500' :
                    processo.status === 'pendente_documentos' ? 'bg-yellow-500' :
                      processo.status === 'concluido' ? 'bg-green-500' : 'bg-gray-400'
                )} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {processo.tipoServico}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Etapa {processo.etapaAtual}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{requiredDocuments.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pendentes</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{analyzingCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Em Análise</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Aprovados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Upload de Documentos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {requiredDocuments.map((reqDoc) => {
          const uploadedDoc = getDocumentForType(reqDoc.type)
          const config = uploadedDoc ? statusConfig[uploadedDoc.status] : null
          const StatusIcon = config?.icon || Upload

          return (
            <div
              key={reqDoc.type}
              id={`upload-${reqDoc.type}`}
              className={cn(
                "relative bg-white dark:bg-gray-800 rounded-xl border-2 overflow-hidden transition-all duration-300 hover:shadow-lg group",
                uploadedDoc ? config?.borderColor : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
              )}
            >
              {/* Header do Card */}
              <div className={cn(
                "p-3 border-b",
                uploadedDoc ? config?.bgColor : "bg-gray-50 dark:bg-gray-800/50"
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-lg shrink-0",
                    uploadedDoc ? config?.bgColor : "bg-gray-100 dark:bg-gray-700"
                  )}>
                    <StatusIcon className={cn(
                      "h-4 w-4",
                      uploadedDoc ? config?.color : "text-gray-500 dark:text-gray-400"
                    )} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {reqDoc.name}
                    </h3>
                    {reqDoc.processoTipo && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 truncate mt-0.5">
                        {reqDoc.processoTipo}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {reqDoc.required && (
                    <Badge variant="secondary" className="text-xs">Obrigatório</Badge>
                  )}
                  {uploadedDoc && config && (
                    <Badge variant={config.badge} className="text-xs">
                      {config.label}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Área de Conteúdo do Card */}
              <div className="p-3">
                {uploadedDoc ? (
                  // Documento já carregado
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
                          {uploadedDoc.fileName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(uploadedDoc.uploadDate)}
                          {uploadedDoc.fileSize && ` • ${formatFileSize(uploadedDoc.fileSize)}`}
                        </p>
                      </div>
                    </div>

                    {/* Motivo de Rejeição */}
                    {uploadedDoc.status === 'rejected' && uploadedDoc.rejectionReason && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-red-800 dark:text-red-200 font-medium text-xs">Rejeitado</p>
                          <p className="text-red-700 dark:text-red-300 text-xs mt-1 line-clamp-2">
                            {uploadedDoc.rejectionReason}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Ações */}
                    {uploadedDoc.status !== 'approved' && (
                      <div className="flex gap-2">
                        <input
                          type="file"
                          id={`file-${reqDoc.type}-replace`}
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => handleFileInput(e, reqDoc.type, reqDoc.processoId, reqDoc.processoTipo)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => document.getElementById(`file-${reqDoc.type}-replace`)?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Substituir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDelete(uploadedDoc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {uploadedDoc.status === 'approved' && (
                      <div className="text-center py-2">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Documento aprovado
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Área de Upload
                  <div
                    className={cn(
                      "h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-3 transition-all cursor-pointer",
                      dragOver === reqDoc.type
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                    )}
                    onDrop={(e) => handleDrop(e, reqDoc.type, reqDoc.processoId, reqDoc.processoTipo)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOver(reqDoc.type)
                    }}
                    onDragLeave={() => setDragOver(null)}
                    onClick={() => document.getElementById(`file-${reqDoc.type}`)?.click()}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                      dragOver === reqDoc.type
                        ? "bg-blue-100 dark:bg-blue-800"
                        : "bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-800"
                    )}>
                      <Upload className={cn(
                        "h-5 w-5 transition-colors",
                        dragOver === reqDoc.type
                          ? "text-blue-600"
                          : "text-gray-400 dark:text-gray-500 group-hover:text-blue-600"
                      )} />
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      Arraste ou clique
                    </p>

                    <input
                      type="file"
                      id={`file-${reqDoc.type}`}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => handleFileInput(e, reqDoc.type, reqDoc.processoId, reqDoc.processoTipo)}
                    />
                  </div>
                )}
              </div>

              {/* Exemplos aceitos (opcional) */}
              {reqDoc.examples && reqDoc.examples.length > 0 && !uploadedDoc && (
                <div className="px-4 pb-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-200 text-xs mb-2">
                      Exemplos aceitos:
                    </h4>
                    <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                      {reqDoc.examples.slice(0, 3).map((example, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full shrink-0"></div>
                          <span className="truncate">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal de Confirmação de Upload */}
      {showConfirmModal && pendingUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={!isUploading ? handleCancelUpload : undefined}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">
                    {isUploading ? 'Enviando...' : 'Confirmar Envio'}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {isUploading ? 'Aguarde enquanto enviamos o documento' : 'Verifique se o documento está correto'}
                  </p>
                </div>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-4">
              {/* Campo de Destino */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                  Campo de destino:
                </p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {pendingUpload.documentName}
                </p>
                {pendingUpload.processoTipo && (
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Processo: {pendingUpload.processoTipo}
                  </p>
                )}
              </div>

              {/* Arquivo Selecionado */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">
                  Arquivo selecionado:
                </p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-lg shrink-0">
                    <FileText className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {pendingUpload.file.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(pendingUpload.file.size)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensagem de Erro */}
              {uploadError && (
                <div className="flex items-start gap-2 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-sm">{uploadError}</p>
                </div>
              )}

              {/* Aviso */}
              {!uploadError && (
                <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-sm">
                    Certifique-se de que o documento selecionado corresponde ao campo indicado acima.
                  </p>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
              <Button
                variant="outline"
                onClick={handleCancelUpload}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmUpload}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Envio
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
