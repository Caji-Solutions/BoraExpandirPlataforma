import React, { useState } from 'react'
import { X, CheckCircle2, Copy, Loader2, AlertCircle, Check } from 'lucide-react'

interface AgendamentoConfirmacaoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (responseData: any) => void
  onError: (message: string) => void
  onNavigateToAgendamentos: () => void
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
    usuario_id?: string
    cliente_id?: string
    requer_delegacao?: boolean
    id?: string
  }
  exchangeRate?: number
}

const PIX_CNPJ = '55.218.947/0001-65'

const parseMoney = (value: string): number | null => {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return Number(parsed.toFixed(2))
}

export const AgendamentoConfirmacaoModal: React.FC<AgendamentoConfirmacaoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  onNavigateToAgendamentos,
  payload,
  exchangeRate = 6.27
}) => {
  const [step, setStep] = useState<'method' | 'pix' | 'boleto' | 'wise'>('method')
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedPix, setCopiedPix] = useState(false)
  const [agendamentoCriado, setAgendamentoCriado] = useState<any>(null)
  const [avisoFormPreenchido, setAvisoFormPreenchido] = useState(false)
  const [metodoConfirmado, setMetodoConfirmado] = useState<'pix' | 'boleto' | null>(null)
  const [boletoEntrada, setBoletoEntrada] = useState('')
  const [boletoParcela, setBoletoParcela] = useState('')
  const [boletoQtdParcelas, setBoletoQtdParcelas] = useState('1')

  if (!isOpen) return null

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return {
        data: date.toLocaleDateString('pt-BR'),
        hora: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    } catch {
      return { data: isoString, hora: '' }
    }
  }

  const { data, hora } = formatDateTime(payload.data_hora)
  const valorBRL = payload.isEuro
    ? `R$ ${(payload.valor * exchangeRate).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `R$ ${payload.valor.toFixed(2)}`
  const valorEUR = payload.isEuro ? `€ ${payload.valor.toFixed(2)}` : ''

  const buildMensagemPix = () => `Olá ${payload.nome}! 😊

Seu agendamento de *${payload.produto_nome}* está quase confirmado!

📅 Data: ${data}
🕐 Horário: ${hora}
💰 Valor: ${valorEUR ? `${valorEUR} (${valorBRL})` : valorBRL}

Para confirmar, realize o pagamento via PIX:

🔑 Chave PIX (CNPJ): ${PIX_CNPJ}

Após o pagamento, envie o comprovante aqui no chat.

Assim que o pagamento for confirmado, enviaremos o formulário de consultoria para você preencher! 📋

Obrigado! 🚀
— Equipe Bora Expandir`

  const buildMensagemBoleto = () => `Olá ${payload.nome}! 😊

Seu agendamento de *${payload.produto_nome}* foi criado com pagamento via *BOLETO*.

📅 Data: ${data}
🕐 Horário: ${hora}
💳 Entrada: R$ ${Number(parseMoney(boletoEntrada) || 0).toFixed(2)}
🧾 Parcelas futuras: ${boletoQtdParcelas}x de R$ ${Number(parseMoney(boletoParcela) || 0).toFixed(2)}

Envie o comprovante do pagamento da entrada para análise do financeiro.
Após aprovação, o acesso do cliente será liberado normalmente.

Obrigado! 🚀
— Equipe Bora Expandir`

  const salvarAgendamento = async (metodo: 'pix' | 'boleto') => {
    setIsLoading(true)
    setLocalError(null)

    const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''
    if (!backendUrl) {
      setLocalError('URL do backend não configurada.')
      setIsLoading(false)
      return
    }

    try {
      const isEditing = !!payload.id
      const method = isEditing ? 'PUT' : 'POST'
      const endpoint = isEditing ? `${backendUrl}/comercial/agendamento/${payload.id}` : `${backendUrl}/comercial/agendamento`

      const requestPayload: Record<string, any> = {
        ...payload,
        status: 'pendente',
        metodo_pagamento: metodo,
        requer_delegacao: payload.requer_delegacao
      }

      if (metodo === 'boleto') {
        const entrada = parseMoney(boletoEntrada)
        const parcela = parseMoney(boletoParcela)
        const qtd = Number(boletoQtdParcelas)

        if (!entrada || !parcela || !qtd || qtd < 1 || qtd > 3) {
          setLocalError('Preencha corretamente os campos do boleto (entrada, valor das parcelas e quantidade de 1 a 3).')
          setIsLoading(false)
          return
        }

        requestPayload.boleto_valor_entrada = entrada
        requestPayload.boleto_valor_parcela = parcela
        requestPayload.boleto_quantidade_parcelas = qtd
      }

      if (isEditing) delete requestPayload.id

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      })

      if (response.status === 409) {
        const body = await response.json().catch(() => ({}))
        setLocalError(body?.message || 'Este horário não está mais disponível.')
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        setLocalError(body?.message || 'Não foi possível salvar o agendamento.')
        setIsLoading(false)
        return
      }

      const responseData = await response.json()
      setAgendamentoCriado(responseData)
      setMetodoConfirmado(metodo)
      if (responseData.aviso_formulario_preenchido) setAvisoFormPreenchido(true)
      onSuccess(responseData)
      setIsLoading(false)
    } catch {
      setLocalError('Erro de conexão com o servidor.')
      setIsLoading(false)
    }
  }

  const handleSelectPix = async () => {
    setStep('pix')
    await salvarAgendamento('pix')
  }

  const handleSelectBoleto = () => {
    setStep('boleto')
    setLocalError(null)
    setAgendamentoCriado(null)
    setMetodoConfirmado(null)
  }

  const handleConfirmarBoleto = async () => {
    await salvarAgendamento('boleto')
  }

  const handleCopyMessage = async () => {
    const mensagem = metodoConfirmado === 'boleto' ? buildMensagemBoleto() : buildMensagemPix()
    try {
      await navigator.clipboard.writeText(mensagem)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = mensagem
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_CNPJ)
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 3000)
    } catch {
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 3000)
    }
  }

  const handleFinalizar = () => onNavigateToAgendamentos()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {step === 'method' ? 'Método de Pagamento' : step === 'pix' ? 'Pagamento via PIX' : step === 'boleto' ? 'Pagamento via Boleto' : 'Wise'}
          </h3>
          {step === 'method' && (
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          )}
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

          {step === 'method' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Selecione como o cliente irá realizar o pagamento:
              </p>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={handleSelectPix}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-gray-50 dark:bg-neutral-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 text-xl font-bold">
                      P
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white">PIX (Chave CNPJ)</p>
                      <p className="text-xs text-gray-500">Transferência via PIX — Confirmação manual</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleSelectBoleto}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 hover:border-amber-500 dark:hover:border-amber-500 bg-gray-50 dark:bg-neutral-800/50 hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 text-xl font-bold">
                      B
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white">Boleto</p>
                      <p className="text-xs text-gray-500">Entrada + parcelas futuras (1 a 3)</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setStep('wise')}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 bg-gray-50 dark:bg-neutral-800/50 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xl font-bold">
                      W
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white">Wise</p>
                      <p className="text-xs text-gray-500">Transferência internacional via Wise</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {(step === 'pix' || (step === 'boleto' && agendamentoCriado)) && (
            <div className="space-y-5">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                  <p className="text-sm text-gray-500">Criando agendamento...</p>
                </div>
              )}

              {!isLoading && agendamentoCriado && (
                <>
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-sm border border-emerald-100 dark:border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Agendamento criado! Copie a mensagem e envie ao lead na Kommo.</span>
                  </div>

                  {avisoFormPreenchido && (
                    <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-lg text-sm border border-amber-100 dark:border-amber-500/20">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>Este lead já preencheu o formulário anteriormente. Não é necessário enviar o link novamente.</span>
                    </div>
                  )}

                  {metodoConfirmado === 'pix' && (
                    <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Chave PIX (CNPJ)</p>
                      <div className="flex items-center gap-3">
                        <code className="text-xl font-bold text-gray-900 dark:text-white tracking-wider flex-1">{PIX_CNPJ}</code>
                        <button
                          onClick={handleCopyPix}
                          className="px-3 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold hover:bg-emerald-200 transition-colors flex items-center gap-1"
                        >
                          {copiedPix ? <><Check className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {metodoConfirmado === 'boleto' && (
                    <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4 border border-amber-200 dark:border-amber-500/20 text-sm text-amber-800 dark:text-amber-300">
                      Entrada: R$ {Number(parseMoney(boletoEntrada) || 0).toFixed(2)} | Parcelas: {boletoQtdParcelas}x de R$ {Number(parseMoney(boletoParcela) || 0).toFixed(2)}
                    </div>
                  )}

                  <button
                    onClick={handleCopyMessage}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-neutral-700 hover:border-emerald-400 dark:hover:border-emerald-600 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    {copied ? (
                      <><Check className="h-5 w-5 text-emerald-600" /> Mensagem copiada!</>
                    ) : (
                      <><Copy className="h-5 w-5" /> Copiar mensagem</>
                    )}
                  </button>

                  <details className="group" open>
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                      Ver pré-visualização da mensagem
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg border text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                      {metodoConfirmado === 'boleto' ? buildMensagemBoleto() : buildMensagemPix()}
                    </div>
                  </details>

                  <button
                    onClick={handleFinalizar}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Finalizar Agendamento
                  </button>
                </>
              )}
            </div>
          )}

          {step === 'boleto' && !agendamentoCriado && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Preencha os dados do boleto para criar o agendamento.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor da Entrada</label>
                <input
                  type="text"
                  value={boletoEntrada}
                  onChange={(e) => setBoletoEntrada(e.target.value)}
                  placeholder="Ex.: 500,00"
                  className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor das Parcelas</label>
                <input
                  type="text"
                  value={boletoParcela}
                  onChange={(e) => setBoletoParcela(e.target.value)}
                  placeholder="Ex.: 300,00"
                  className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantidade de Parcelas</label>
                <select
                  value={boletoQtdParcelas}
                  onChange={(e) => setBoletoQtdParcelas(e.target.value)}
                  className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 bg-white dark:bg-neutral-800 text-sm"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setStep('method')}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-medium"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirmarBoleto}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar Boleto
                </button>
              </div>
            </div>
          )}

          {step === 'wise' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 p-3 rounded-lg text-sm border border-blue-100 dark:border-blue-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>A integração com Wise será implementada em breve.</span>
              </div>
              <button
                onClick={() => { setStep('method'); setLocalError(null) }}
                className="w-full py-3 rounded-xl border-2 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all text-sm"
              >
                Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
