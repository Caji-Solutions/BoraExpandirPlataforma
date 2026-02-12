import React, { useState } from 'react'
import { X, CheckCircle2, ChevronLeft, CreditCard, Loader2, AlertCircle } from 'lucide-react'

interface AgendamentoConfirmacaoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (responseData: any) => void
  onError: (message: string) => void
  payload: {
    nome: string
    email: string
    telefone: string
    data_hora: string
    produto_id: string
    produto_nome: string
    valor: number
    isEuro?: boolean
    duracao_minutos: number
    status: string
  }
  exchangeRate?: number
}

export const AgendamentoConfirmacaoModal: React.FC<AgendamentoConfirmacaoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  payload,
  exchangeRate = 6.27
}) => {
  const [step, setStep] = useState<'platform' | 'summary'>('platform')
  const [selectedPlatform, setSelectedPlatform] = useState<'mercado_pago' | 'stripe' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSelectPlatform = (platform: 'mercado_pago' | 'stripe') => {
    setSelectedPlatform(platform)
    setStep('summary')
  }

  const handleConfirm = async () => {
    if (!selectedPlatform) return

    setIsLoading(true)
    setLocalError(null)

    const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''
    
    // Payload comum base
    const basePayload = {
      ...payload,
      plataforma_pagamento: selectedPlatform
    }

    if (!backendUrl) {
      console.warn('DEBUG MODAL: BACKEND_URL NÃO ENCONTRADO! Usando fallback mock local.')
      setTimeout(() => {
        setIsLoading(false)
        const mockResponse = {
          success: true,
          checkoutUrl: `https://pay.MOCK-FALLBACK-${selectedPlatform}.com/mock_${Date.now()}`
        }
        console.log('DEBUG MODAL: Enviando resposta mock:', mockResponse)
        onSuccess(mockResponse)
      }, 1000)
      return
    }

    try {
      let response: Response

      if (selectedPlatform === 'mercado_pago') {
        // Lógica específica para Mercado Pago
        console.log('Iniciando processamento via Mercado Pago...')
        response = await fetch(`${backendUrl}/comercial/agendamento/mercadopago`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(basePayload),
        })
      } else if (selectedPlatform === 'stripe') {
        // Lógica específica para Stripe
        console.log('Iniciando processamento via Stripe...')
        // Exemplo: caso o stripe use um endpoint diferente ou precise de ajuste no payload
        response = await fetch(`${backendUrl}/comercial/agendamento/stripe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...basePayload,
            stripe_specific_flag: true // Exemplo de campo específico
          }),
        })
        console.log('DEBUG MODAL: Resposta JSON bruta do backend:', response)
      } else {
        throw new Error('Plataforma não suportada')
      }

      if (response.status === 409) {
        const body = await response.json().catch(() => ({}))
        const msg = body?.message || 'Este horário não está mais disponível.'
        setLocalError(msg)
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        const msg = body?.message || 'Não foi possível completar o agendamento.'
        setLocalError(msg)
        setIsLoading(false)
        return
      }

      const responseData = await response.json().catch(() => ({}))
      console.log('DEBUG MODAL: Resposta JSON bruta do backend:', responseData)
      setIsLoading(false)
      onSuccess(responseData)
    } catch (err) {
      console.error('Erro ao salvar agendamento:', err)
      setLocalError('Erro de conexão com o servidor. Tente novamente.')
      setIsLoading(false)
    }
  }

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return {
        data: date.toLocaleDateString('pt-BR'),
        hora: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    } catch (e) {
      return { data: isoString, hora: '' }
    }
  }

  const { data, hora } = formatDateTime(payload.data_hora)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {step === 'platform' ? 'Escolha a plataforma' : 'Confirme seu agendamento'}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {localError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">Houve um problema</p>
                <p>{localError}</p>
              </div>
            </div>
          )}

          {step === 'platform' ? (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Selecione qual provedor de pagamento você deseja utilizar para este agendamento:
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => handleSelectPlatform('mercado_pago')}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-gray-50 dark:bg-neutral-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white">Mercado Pago</p>
                      <p className="text-xs text-gray-500">Cartão de Crédito, PIX, Boleto</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-neutral-600 group-hover:border-emerald-500 flex items-center justify-center transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-emerald-500 transition-colors" />
                  </div>
                </button>

                <button
                  onClick={() => handleSelectPlatform('stripe')}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-gray-50 dark:bg-neutral-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white">Stripe</p>
                      <p className="text-xs text-gray-500">Pagamentos Internacionais, Cartão</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-neutral-600 group-hover:border-emerald-500 flex items-center justify-center transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-emerald-500 transition-colors" />
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl p-5 border border-gray-100 dark:border-neutral-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Produto</p>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{payload.produto_nome}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Valor</p>
                    {payload.isEuro ? (
                      <div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">€ {payload.valor.toFixed(2)}</p>
                        <p className="text-[10px] text-gray-500">Aprox. R$ {(payload.valor * exchangeRate).toFixed(2)}</p>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-gray-900 dark:text-white">R$ {payload.valor.toFixed(2)}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Data e Hora</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{data} às {hora}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Duração</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{payload.duracao_minutos} minutos</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Lead</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{payload.nome}</p>
                    <p className="text-xs text-gray-500">{payload.email} • {payload.telefone}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-sm border border-emerald-100 dark:border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Plataforma selecionada: <strong>{selectedPlatform === 'mercado_pago' ? 'Mercado Pago' : 'Stripe'}</strong></span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('platform')}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading || !selectedPlatform}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:bg-emerald-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Confirmar Agendamento'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
