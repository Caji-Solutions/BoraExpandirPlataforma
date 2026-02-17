import React, { useEffect, useState } from 'react'
import { X, CreditCard, Clock, FileText, AlertCircle, Loader2, Check } from 'lucide-react'
import { Document as ClientDocument } from '../types'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { traducoesService } from '../../tradurora/services/traducoesService'
import { clienteService } from '../services/clienteService'
import { cn, formatDate, formatDateSimple } from '../lib/utils'

interface ClientOrcamentoModalProps {
  documentoId: string
  documentoNome: string
  clienteEmail?: string
  isOpen: boolean
  onClose: () => void
  allDocuments?: ClientDocument[]
  onPaymentSuccess?: () => void
  tipo?: 'traducao' | 'apostila'
}

export function ClientOrcamentoModal({
  documentoId,
  documentoNome,
  clienteEmail = '',
  isOpen,
  onClose,
  allDocuments = [],
  onPaymentSuccess,
  tipo = 'traducao'
}: ClientOrcamentoModalProps) {
  const [orcamento, setOrcamento] = useState<any>(null)
  const [allBudgets, setAllBudgets] = useState<Record<string, any>>({})
  const [candidateDocuments, setCandidateDocuments] = useState<ClientDocument[]>([])
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && (documentoId || tipo === 'apostila')) {
      initializeFlow()
    }
  }, [isOpen, documentoId, tipo])

  const initializeFlow = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      let candidates: ClientDocument[] = []
      
      if (tipo === 'apostila') {
        candidates = allDocuments.filter(d => {
          const s = d.status?.toLowerCase()
          return s === 'waiting_apostille' || s === 'waiting_quote_approval' || d.id === documentoId
        })
      } else if (tipo === 'traducao') {
        candidates = allDocuments.filter(d => d.id === documentoId)
      } else {
        candidates = allDocuments.filter(d => d.id === documentoId)
      }

      setCandidateDocuments(candidates)
      
      const budgetsMap: Record<string, any> = {}
      await Promise.all(candidates.map(async (doc) => {
        try {
          const budget = await traducoesService.getOrcamentoByDocumento(doc.id)
          if (budget) {
            budgetsMap[doc.id] = budget
          }
        } catch (e) {
          console.error(`Erro ao buscar orçamento para doc ${doc.id}:`, e)
        }
      }))

      setAllBudgets(budgetsMap)
      
      const initialSelection = new Set<string>()
      candidates.forEach(d => {
        if (budgetsMap[d.id] && (d.id === documentoId || (tipo === 'apostila' && d.status?.toLowerCase() === 'waiting_quote_approval'))) {
          initialSelection.add(d.id)
        }
      })

      if (initialSelection.size === 0) {
        const firstWithBudget = candidates.find(d => budgetsMap[d.id])
        if (firstWithBudget) initialSelection.add(firstWithBudget.id)
      }
      
      setSelectedDocIds(initialSelection)

      const refId = Array.from(initialSelection)[0] || Object.keys(budgetsMap)[0]
      if (refId && budgetsMap[refId]) {
        setOrcamento(budgetsMap[refId])
      }
      
    } catch (err: any) {
      console.error('Erro ao inicializar fluxo de orçamento:', err)
      setError('Não foi possível carregar os detalhes do orçamento.')
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

  const calculateTotal = () => {
    return Array.from(selectedDocIds).reduce((acc, id) => {
      const budget = allBudgets[id]
      if (budget) return acc + (budget.preco_atualizado || budget.valor_orcamento)
      const mockValue = tipo === 'apostila' ? 180 : 250
      return acc + mockValue
    }, 0)
  }

  const handlePayment = async () => {
    if (selectedDocIds.size === 0) return

    try {
      setIsProcessing(true)
      console.log('Iniciando handlePayment. Selecionados:', Array.from(selectedDocIds))
      
      const docsToPay = Array.from(selectedDocIds).filter(id => {
        const budget = allBudgets[id]
        const doc = candidateDocuments.find(d => d.id === id)
        console.log(`Documento ${id}: HasBudget=${!!budget}, Status=${doc?.status}`)
        // Se tem orçamento e é um status que aceita pagamento (ou se estamos forçando pagamento)
        return budget && (
          doc?.status?.toLowerCase() === 'waiting_quote_approval' || 
          doc?.status?.toLowerCase() === 'approved' ||
          doc?.status?.toLowerCase() === 'waiting_apostille' ||
          doc?.status?.toLowerCase() === 'waiting_translation'
        )
      })

      const docsToRequest = Array.from(selectedDocIds).filter(id => !allBudgets[id])

      console.log('Docs to Pay:', docsToPay)
      console.log('Docs to Request:', docsToRequest)

      // 1. Processar solicitações de orçamento (sem pagamento)
      if (docsToRequest.length > 0) {
        console.log('Solicitando orçamentos para:', docsToRequest)
        const requestPromises = docsToRequest.map(id => {
            const newStatus = 'ANALYZING_APOSTILLE'
            return clienteService.updateDocumentoStatus(id, newStatus)
        })
        await Promise.all(requestPromises)
      }

      // 2. Processar Pagamento via Stripe (para quem tem orçamento)
      if (docsToPay.length > 0) {
        console.log('Chamando createCheckoutSession para:', docsToPay)
        const checkout = await traducoesService.createCheckoutSession({
          documentoIds: docsToPay,
          email: clienteEmail || 'cliente@exemplo.com',
          successUrl: window.location.href + '?payment=success',
          cancelUrl: window.location.href + '?payment=cancel'
        })

        console.log('Resultado checkout:', checkout)

        if (checkout?.checkoutUrl) {
          console.log('Redirecionando para:', checkout.checkoutUrl)
          window.location.href = checkout.checkoutUrl
          return
        } else {
          console.error('CheckoutUrl não encontrado no objeto:', checkout)
        }
      }

      if (onPaymentSuccess) onPaymentSuccess()
      onClose()
    } catch (err: any) {
      console.error('Erro ao processar pagamento:', err)
      alert(err.message || 'Erro ao processar sua solicitação.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {tipo === 'traducao' ? 'Orçamento de Tradução' : 'Solicitar Apostila'}
              </h3>
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
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Carregando detalhes...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : (candidateDocuments.length > 0) ? (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col items-center text-center space-y-1">
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                    {tipo === 'apostila' ? 'Valor Total Estimado' : 'Valor Total'}
                  </span>
                  <span className="text-4xl font-black text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal())}
                  </span>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] uppercase font-bold tracking-tighter">Prazo</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {orcamento ? formatDateSimple(orcamento.prazo_entrega) : 'Sob análise'}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-gray-400">
                      <Badge className={cn(
                        "border-none",
                        selectedDocIds.size > 0 && Array.from(selectedDocIds).every(id => allBudgets[id])
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {selectedDocIds.size > 0 && Array.from(selectedDocIds).every(id => allBudgets[id]) 
                          ? 'Pronto para Pagamento' 
                          : 'Aguardando Orçamento'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Documentos Selecionados</h4>
                  <Badge variant="outline" className="text-[10px] py-0 border-blue-200 text-blue-600 bg-blue-50/50">
                    {selectedDocIds.size} selecionado(s)
                  </Badge>
                </div>
                
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                  {candidateDocuments.map((doc) => {
                    const isSelected = selectedDocIds.has(doc.id)
                    const budget = allBudgets[doc.id]
                    const isReady = !!budget && doc.status?.toLowerCase() === 'waiting_quote_approval'
                    
                    return (
                      <div 
                        key={doc.id}
                        onClick={() => toggleDocument(doc.id)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                          isSelected 
                            ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800 shadow-sm"
                            : "bg-white border-gray-100 hover:border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                            isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                          )}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
                              {doc.fileName || doc.name}
                            </span>
                            {!isReady && (
                              <span className="text-[10px] text-gray-500 uppercase font-medium">
                                {doc.status?.toLowerCase().includes('quote') ? 'Solicitação enviada' : 'Aguardando Solicitação'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {budget ? (
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.preco_atualizado || budget.valor_orcamento)}
                            </span>
                          ) : (
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-gray-400">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tipo === 'apostila' ? 180 : 250)}
                                </span>
                                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">(Est.)</span>
                              </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {orcamento?.observacoes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Observações</h4>
                  <div className="p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-50 dark:border-blue-900/20">
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">"{orcamento.observacoes}"</p>
                  </div>
                </div>
              )}

              <Button 
                onClick={handlePayment}
                disabled={isProcessing || selectedDocIds.size === 0}
                className="w-full h-14 rounded-xl text-lg font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    {selectedDocIds.size > 0 && Array.from(selectedDocIds).some(id => allBudgets[id]) 
                      ? 'IR PARA PAGAMENTO' 
                      : 'CONFIRMAR SOLICITAÇÃO'}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Nenhum documento disponível.</p>
          )}
        </div>
      </div>
    </div>
  )
}
