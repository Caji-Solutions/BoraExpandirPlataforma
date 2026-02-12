import React, { useEffect, useState } from 'react'
import { X, CreditCard, Clock, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { traducoesService } from '../../tradurora/services/traducoesService'
import { formatDate, formatDateSimple } from '../lib/utils'

interface ClientOrcamentoModalProps {
  documentoId: string
  documentoNome: string
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess?: () => void
}

export function ClientOrcamentoModal({
  documentoId,
  documentoNome,
  isOpen,
  onClose,
  onPaymentSuccess
}: ClientOrcamentoModalProps) {
  const [orcamento, setOrcamento] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && documentoId) {
      fetchOrcamento()
    }
  }, [isOpen, documentoId])

  const fetchOrcamento = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await traducoesService.getOrcamentoByDocumento(documentoId)
      setOrcamento(data)
    } catch (err: any) {
      console.error('Erro ao buscar orçamento:', err)
      setError('Não foi possível carregar os detalhes do orçamento.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!orcamento?.id) return

    try {
      setIsProcessing(true)
      // Chamar o serviço real para aprovar o orçamento no banco
      await traducoesService.aprovarOrcamento(orcamento.id, documentoId)
      
      alert('Orçamento aprovado e pagamento confirmado com sucesso!')
      
      if (onPaymentSuccess) {
        onPaymentSuccess()
      }
      onClose()
    } catch (err: any) {
      console.error('Erro ao aprovar orçamento:', err)
      alert(err.message || 'Erro ao processar aprovação do orçamento.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Orçamento de Tradução</h3>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{documentoNome}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Buscando detalhes do orçamento...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : orcamento ? (
            <div className="space-y-6">
              {/* Resumo de Valores */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col items-center text-center space-y-1">
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Valor Total</span>
                  <span className="text-4xl font-black text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.valor_orcamento)}
                  </span>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] uppercase font-bold tracking-tighter">Prazo de Entrega</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatDateSimple(orcamento.prazo_entrega)}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-gray-400">
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none">
                        Pronto para Iniciar
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {orcamento.observacoes && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Observações do Tradutor</h4>
                  <div className="p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-50 dark:border-blue-900/20">
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">
                      "{orcamento.observacoes}"
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-14 rounded-xl text-lg font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    PROCESSANDO...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    APROVAR E PAGAR
                  </>
                )}
              </Button>
              
              <p className="text-[10px] text-center text-gray-400 px-4">
                Ao clicar em aprovar, o processo de tradução será iniciado imediatamente após a confirmação do pagamento.
              </p>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Nenhum detalhe de orçamento disponível.</p>
          )}
        </div>
      </div>
    </div>
  )
}
