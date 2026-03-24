import { FileText, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/modules/shared/components/ui/button'
import { Document as ClientDocument } from '../../types'
import { cn } from '../../lib/utils'

interface QuoteRequestModalProps {
  isOpen: boolean
  document: ClientDocument
  documentName: string
  isApostille: boolean
  isRequestingQuote: boolean
  requestedSuccessfully: boolean
  onRequestApostille: () => void
  onRequestTranslation: () => void
  onClose: () => void
}

export function QuoteRequestModal({
  isOpen,
  document: doc,
  documentName,
  isApostille,
  isRequestingQuote,
  requestedSuccessfully,
  onRequestApostille,
  onRequestTranslation,
  onClose,
}: QuoteRequestModalProps) {
  if (!isOpen) return null

  const colorClass = isApostille ? 'from-amber-600 to-amber-700' : 'from-purple-600 to-purple-700'
  const bgColorClass = isApostille
    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
  const textColorClass = isApostille
    ? 'text-amber-900 dark:text-amber-100'
    : 'text-purple-900 dark:text-purple-100'
  const fileIconColorClass = isApostille
    ? 'text-amber-700 dark:text-amber-300'
    : 'text-purple-700 dark:text-purple-300'
  const confirmBtnClass = isApostille
    ? 'bg-amber-600 hover:bg-amber-700'
    : 'bg-purple-600 hover:bg-purple-700'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !isRequestingQuote && onClose()}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {!requestedSuccessfully ? (
          <>
            {/* Header */}
            <div className={cn('p-6 bg-gradient-to-r', colorClass)}>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isApostille ? 'Solicitar Apostila' : 'Solicitar Tradução'}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">
                    {isApostille ? 'Orçamento para apostilamento' : 'Orçamento de tradução juramentada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className={cn('border rounded-xl p-4', bgColorClass)}>
                <p className={cn('text-sm font-medium', textColorClass)}>
                  Você está solicitando um orçamento de {isApostille ? 'apostila' : 'tradução'} para o documento:
                </p>
                <div className={cn('mt-2 flex items-center gap-2', fileIconColorClass)}>
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-bold">{documentName}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nossa equipe jurídica irá analisar o documento e retornar com um orçamento e prazo.
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={isRequestingQuote}>
                Cancelar
              </Button>
              <Button
                onClick={isApostille ? onRequestApostille : onRequestTranslation}
                className={cn('text-white', confirmBtnClass)}
                disabled={isRequestingQuote}
              >
                {isRequestingQuote ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Confirmar Solicitação
              </Button>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Solicitação Enviada!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Seu pedido de orçamento foi registrado com sucesso. Nossa equipe entrará em contato em breve.
            </p>
            <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700 text-white">
              Entendido
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
