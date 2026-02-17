import React, { useEffect, useState } from 'react'
import { X, CreditCard, Clock, FileText, AlertCircle, Loader2, Check } from 'lucide-react'
import { Document as ClientDocument } from '../types'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { traducoesService } from '../../tradurora/services/traducoesService'
import { clienteService } from '../services/clienteService'
import { cn, formatDateSimple } from '../lib/utils'

interface TranslationQuoteModalProps {
  documentoId: string
  documentoNome: string
  clienteEmail?: string
  isOpen: boolean
  onClose: () => void
  allDocuments?: ClientDocument[]
  onPaymentSuccess?: () => void
}

export function TranslationQuoteModal({
  documentoId,
  documentoNome,
  clienteEmail = '',
  isOpen,
  onClose,
  allDocuments = [],
  onPaymentSuccess
}: TranslationQuoteModalProps) {
  const [allBudgets, setAllBudgets] = useState<Record<string, any>>({})
  const [candidateDocuments, setCandidateDocuments] = useState<ClientDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [requestedSuccessfully, setRequestedSuccessfully] = useState(false)
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
      setRequestedSuccessfully(false)
      
      const candidates = allDocuments.filter(d => d.id === documentoId)
      setCandidateDocuments(candidates)
      
      const budget = await traducoesService.getOrcamentoByDocumento(documentoId)
      if (budget) {
        setAllBudgets({ [documentoId]: budget })
      }
      
    } catch (err: any) {
      console.error('Erro ao inicializar fluxo de tradução:', err)
      setError('Não foi possível carregar os detalhes.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async () => {
    try {
      setIsProcessing(true)
      const budget = allBudgets[documentoId]

      if (budget) {
        // Fluxo de PAGAMENTO (já tem orçamento)
        const checkout = await traducoesService.createCheckoutSession({
          documentoIds: [documentoId],
          email: clienteEmail || 'cliente@exemplo.com',
          successUrl: window.location.href.split('?')[0] + '?payment=success',
          cancelUrl: window.location.href.split('?')[0] + '?payment=cancel'
        })

        if (checkout?.checkoutUrl) {
          window.location.href = checkout.checkoutUrl
          return
        }
      } else {
        // Fluxo de SOLICITAÇÃO (não tem orçamento)
        await clienteService.updateDocumentoStatus(documentoId, 'WAITING_TRANSLATION_QUOTE')
        setRequestedSuccessfully(true)
      }
    } catch (err: any) {
      console.error('Erro no fluxo de tradução:', err)
      alert(err.message || 'Erro ao processar sua solicitação.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-purple-50/50 dark:bg-purple-900/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Pagamento de Tradução</h3>
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
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-sm text-gray-500">Aguarde...</p>
            </div>
          ) : requestedSuccessfully ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
               <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
               </div>
               <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Solicitação Enviada!</h4>
                  <p className="text-sm text-gray-500 mt-2">Nossa equipe analisará seu documento e enviará o orçamento em breve.</p>
               </div>
               <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700 text-white">Fechar</Button>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col items-center text-center space-y-1">
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Valor da Tradução</span>
                  <span className="text-4xl font-black text-gray-900 dark:text-white">
                    {allBudgets[documentoId] 
                      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(allBudgets[documentoId].preco_atualizado || allBudgets[documentoId].valor_orcamento)
                      : 'Sob consulta'}
                  </span>
                </div>
                
                {allBudgets[documentoId]?.prazo_entrega && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-center gap-2 items-center text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Entrega: {formatDateSimple(allBudgets[documentoId].prazo_entrega)}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed text-center">
                  {allBudgets[documentoId] 
                    ? "O orçamento foi aprovado. Você pode prosseguir com o pagamento para iniciar a tradução."
                    : "As traduções juramentadas dependem da análise do volume de texto. Solicite uma cotação gratuita."}
                </p>
              </div>

              <Button 
                onClick={handleAction}
                disabled={isProcessing}
                className={cn(
                  "w-full h-14 rounded-xl text-lg font-black text-white shadow-lg active:scale-[0.98] flex items-center justify-center gap-3",
                  allBudgets[documentoId] ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {allBudgets[documentoId] ? (
                       <>
                         <CreditCard className="h-5 w-5" />
                         PAGAR AGORA
                       </>
                    ) : (
                      <>
                        <Clock className="h-5 w-5" />
                        SOLICITAR COTAÇÃO
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
