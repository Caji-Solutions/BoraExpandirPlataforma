import React, { useEffect, useState } from 'react'
import { X, Clock, FileText, AlertCircle, Loader2, Check, Send } from 'lucide-react'
import { Document as ClientDocument } from '../types'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { traducoesService } from '../../tradurora/services/traducoesService'
import { clienteService } from '../services/clienteService'
import { cn, formatDateSimple } from '../lib/utils'

interface ApostilleQuoteModalProps {
  documentoId: string
  documentoNome: string
  clienteEmail?: string
  isOpen: boolean
  onClose: () => void
  allDocuments?: ClientDocument[]
  onPaymentSuccess?: () => void
}

export function ApostilleQuoteModal({
  documentoId,
  documentoNome,
  clienteEmail = '',
  isOpen,
  onClose,
  allDocuments = [],
  onPaymentSuccess
}: ApostilleQuoteModalProps) {
  const [candidateDocuments, setCandidateDocuments] = useState<ClientDocument[]>([])
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      initializeFlow()
    }
  }, [isOpen, documentoId])

  const initializeFlow = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Documentos para apostila: APENAS os que estão aguardando apostila
      const candidates = allDocuments.filter(d => {
        const s = d.status?.toLowerCase()
        return s === 'waiting_apostille' || d.id === documentoId
      })

      setCandidateDocuments(candidates)
      
      // Seleciona inicialmente o documento que abriu o modal e outros que já estão na fase de espera
      const initialSelection = new Set<string>()
      initialSelection.add(documentoId)
      
      candidates.forEach(d => {
        if (d.status?.toLowerCase() === 'waiting_apostille') {
          initialSelection.add(d.id)
        }
      })
      
      setSelectedDocIds(initialSelection)
      
    } catch (err: any) {
      console.error('Erro ao inicializar fluxo de apostila:', err)
      setError('Não foi possível carregar os detalhes.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDocument = (id: string) => {
    const newSelection = new Set(selectedDocIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedDocIds(newSelection)
  }



  const handleAction = async () => {
    if (selectedDocIds.size === 0) return

    try {
      setIsProcessing(true)
      setError(null)
      
      const docsToSolicit = Array.from(selectedDocIds)
      
      console.log('Iniciando solicitação de Apostila:', docsToSolicit)
      
      // The backend expects a single documentoId per request based on ApostilamentoController.solicitar
      for (const docId of docsToSolicit) {
        const doc = candidateDocuments.find(d => d.id === docId)
        await clienteService.solicitarApostilamento(docId, doc?.fileUrl || '', `Solicitação de apostila para ${doc?.fileName || doc?.name}`)
      }
      
      setIsSuccess(true)

      if (onPaymentSuccess) {
        onPaymentSuccess()
      }

    } catch (err: any) {
      console.error('Erro ao solicitar apostila:', err)
      setError(err.message || 'Erro ao processar sua solicitação.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-amber-50/50 dark:bg-amber-900/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Send className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Solicitar Apostila</h3>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{documentoNome}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <p className="text-sm text-gray-500">Carregando detalhes...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {isSuccess ? (
                <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                  <div className="mb-6 flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Solicitação Enviada!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-[280px] mx-auto text-sm">
                    Seu pedido de apostilamento foi registrado com sucesso. Nossa equipe entrará em contato em breve.
                  </p>
                  <Button
                    onClick={onClose}
                    className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    Entendido
                  </Button>
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col items-center text-center space-y-1">
                      <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Orçamento de Apostilamento</span>
                      <span className="text-sm text-gray-500 max-w-[250px]">
                        Nossa equipe jurídica analisará os documentos selecionados e retornará com os valores e prazos.
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Documentos para Apostila</h4>
                      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">
                        {selectedDocIds.size} selecionado(s)
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {candidateDocuments.map((doc) => {
                        const isSelected = selectedDocIds.has(doc.id)
                        
                        return (
                          <div 
                            key={doc.id}
                            onClick={() => toggleDocument(doc.id)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                              isSelected 
                                ? "bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800"
                                : "bg-white border-gray-100 dark:bg-gray-800"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-5 w-5 rounded border flex items-center justify-center",
                                isSelected ? "bg-amber-600 border-amber-600" : "bg-white border-gray-300"
                              )}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
                                {doc.fileName || doc.name}
                              </span>
                            </div>
                            <div className="text-right">
                              <FileText className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed text-center">
                      Ao solicitar, um registro será criado em nossa fila administrativa. Você será notificado assim que o orçamento estiver pronto para aprovação.
                    </p>
                  </div>

                  <Button 
                    onClick={handleAction}
                    disabled={isProcessing || selectedDocIds.size === 0}
                    className="w-full h-14 rounded-xl text-lg font-black bg-amber-600 hover:bg-amber-700 text-white shadow-lg active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        SOLICITAR APOSTILA
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
