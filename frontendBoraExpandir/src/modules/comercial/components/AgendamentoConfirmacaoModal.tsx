import React, { useState } from 'react'
import { X, CheckCircle2, Copy, Loader2, AlertCircle, Check, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    id?: string
  }
  exchangeRate?: number
}

const PIX_CNPJ = '55.218.947/0001-65'
const WISE_TAG = 'https://wise.com/pay/me/fernandaj101'

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
  const [step, setStep] = useState<'method' | 'pix' | 'cartao' | 'wise'>('method')
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedPix, setCopiedPix] = useState(false)
  const [copiedWise, setCopiedWise] = useState(false)
  const [agendamentoCriado, setAgendamentoCriado] = useState<any>(null)
  const [avisoFormPreenchido, setAvisoFormPreenchido] = useState(false)
  const [metodoConfirmado, setMetodoConfirmado] = useState<'pix' | 'cartao' | 'wise' | null>(null)
  const [cartaoTipo, setCartaoTipo] = useState<'debito' | 'credito' | ''>('')
  const [cartaoParcelas, setCartaoParcelas] = useState('1')
  
  // New state for upload
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  const buildMensagemCartao = () => `Olá ${payload.nome}! 😊

Seu agendamento de *${payload.produto_nome}* está quase confirmado!

📅 Data: ${data}
🕐 Horário: ${hora}
💰 Valor: ${valorEUR ? `${valorEUR} (${valorBRL})` : valorBRL}

Para confirmar, realizaremos o pagamento via *CARTÃO ${cartaoTipo === 'debito' ? 'DÉBITO' : cartaoTipo === 'credito' ? 'CRÉDITO' : ''}*.

Após o pagamento, envie o comprovante aqui no chat.

Obrigado! 🚀
— Equipe Bora Expandir`

  const buildMensagemWise = () => `Olá ${payload.nome}! 😊

Seu agendamento de *${payload.produto_nome}* está quase confirmado!

📅 Data: ${data}
🕐 Horário: ${hora}
💰 Valor: ${valorEUR ? `${valorEUR} (${valorBRL})` : valorBRL}

Para confirmar, realize o pagamento via *Wise* (transferência internacional):

🔗 Link de pagamento: ${WISE_TAG}

Após o pagamento, envie o comprovante aqui no chat.

Assim que o pagamento for confirmado, enviaremos o formulário de consultoria para você preencher! 📋

Obrigado! 🚀
— Equipe Bora Expandir`

  const salvarAgendamento = async (metodo: 'pix' | 'cartao' | 'wise') => {
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
      }

      if (metodo === 'cartao') {
        if (!cartaoTipo) {
          setLocalError('Selecione o tipo do cartão (débito ou crédito).')
          setIsLoading(false)
          return
        }
        requestPayload.cartao_tipo = cartaoTipo
        requestPayload.cartao_parcelas = '1'
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
      // Removed premature onSuccess(responseData) to allow viewing PIX details
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

  const handleSelectCartao = () => {
    setStep('cartao')
    setCartaoTipo('')
    setCartaoParcelas('1')
    setLocalError(null)
    setAgendamentoCriado(null)
    setMetodoConfirmado(null)
  }

  const handleSelectWise = async () => {
    setStep('wise')
    await salvarAgendamento('wise')
  }

  const handleConfirmarCartao = async () => {
    await salvarAgendamento('cartao')
  }

  const handleCopyMessage = async () => {
    const mensagem = metodoConfirmado === 'cartao'
      ? buildMensagemCartao()
      : metodoConfirmado === 'wise'
        ? buildMensagemWise()
        : buildMensagemPix()
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

  const handleCopyWise = async () => {
    try {
      await navigator.clipboard.writeText(WISE_TAG)
      setCopiedWise(true)
      setTimeout(() => setCopiedWise(false), 3000)
    } catch {
      setCopiedWise(true)
      setTimeout(() => setCopiedWise(false), 3000)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setLocalError('O arquivo deve ter no máximo 10MB')
        return
      }
      setComprovanteFile(file)
      setLocalError(null)
    }
  }

  const handleUploadComprovante = async () => {
    if (!comprovanteFile || !agendamentoCriado) return
    
    setIsUploading(true)
    setLocalError(null)
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''
    
    try {
      const formData = new FormData()
      formData.append('file', comprovanteFile)
      formData.append('agendamentoId', agendamentoCriado.id)
      
      const response = await fetch(`${backendUrl}/comercial/agendamento/${agendamentoCriado.id}/comprovante`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body?.message || 'Erro ao enviar comprovante.')
      }
      
      setStep('method') // Reset or stay as needed
      onSuccess(agendamentoCriado)
      onNavigateToAgendamentos()
    } catch (err: any) {
      setLocalError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFinalizar = () => {
    if (comprovanteFile) {
      handleUploadComprovante()
    } else {
      onSuccess(agendamentoCriado)
      onNavigateToAgendamentos()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {step === 'method' ? 'Método de Pagamento' : step === 'pix' ? 'Pagamento via PIX' : step === 'cartao' ? 'Pagamento via Cartão' : 'Pagamento via Wise'}
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
                  onClick={handleSelectCartao}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 bg-gray-50 dark:bg-neutral-800/50 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xl font-bold">
                      💳
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white">Cartão</p>
                      <p className="text-xs text-gray-500">Débito ou crédito com comprovante</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleSelectWise}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 dark:border-neutral-800 hover:border-purple-500 dark:hover:border-purple-500 bg-gray-50 dark:bg-neutral-800/50 hover:bg-purple-50 dark:hover:bg-purple-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 text-xl font-bold">
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

          {(step === 'pix' || step === 'wise' || (step === 'cartao' && agendamentoCriado)) && (
            <div className="space-y-5">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <p className="text-[10px] font-black text-emerald-600">BE</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 dark:text-white">Criando Agendamento</p>
                    <p className="text-xs text-gray-500">Aguarde um momento...</p>
                  </div>
                </div>
              )}

              {!isLoading && !agendamentoCriado && localError && (
                <div className="flex flex-col items-center justify-center py-10 gap-6">
                  <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-white">Falha na Criação</h4>
                    <p className="text-sm text-gray-500 px-4">{localError}</p>
                  </div>
                  <button
                    onClick={() => setStep('method')}
                    className="px-6 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-all shadow-sm"
                  >
                    Tentar Novamente
                  </button>
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

                  {metodoConfirmado === 'cartao' && (
                    <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-200 dark:border-blue-500/20 text-sm text-blue-800 dark:text-blue-300">
                      💳 Cartão {cartaoTipo === 'debito' ? 'Débito' : cartaoTipo === 'credito' ? 'Crédito' : ''} — comprovante obrigatório.
                    </div>
                  )}

                  {metodoConfirmado === 'wise' && (
                    <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-gray-100 dark:border-neutral-800">
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Wisetag (Transferência Internacional)</p>
                      <div className="flex items-center gap-3">
                        <a
                          href={WISE_TAG}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-bold text-purple-600 dark:text-purple-400 underline hover:text-purple-700 dark:hover:text-purple-300 flex-1 truncate transition-colors"
                        >
                          wise.com/pay/me/fernandaj101
                        </a>
                        <button
                          onClick={handleCopyWise}
                          className="px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-bold hover:bg-purple-200 transition-colors flex items-center gap-1"
                        >
                          {copiedWise ? <><Check className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar</>}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      <Upload className="h-4 w-4" />
                      Anexar Comprovante (Opcional)
                    </div>
                    
                    <div 
                      onClick={() => !comprovanteFile && !isUploading && fileInputRef.current?.click()}
                      className={cn(
                        "relative border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer",
                        comprovanteFile 
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10" 
                          : "border-gray-200 dark:border-neutral-800 hover:border-emerald-400 dark:hover:border-emerald-500/40 group"
                      )}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                      />
                      
                      {comprovanteFile ? (
                        <div className="flex flex-col items-center gap-2 w-full text-center">
                           <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400">
                             <Check className="h-6 w-6" />
                           </div>
                           <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">
                             {comprovanteFile.name}
                           </p>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               setComprovanteFile(null);
                             }}
                             className="text-xs text-red-500 hover:underline font-bold mt-1"
                           >
                             Remover arquivo
                           </button>
                        </div>
                      ) : (
                        <>
                          <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-full text-gray-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                            <Upload className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-400 text-center">Clique para anexar o comprovante agora</p>
                          <p className="text-[10px] text-gray-400 font-medium">Você também pode enviar depois na gestão</p>
                        </>
                      )}
                    </div>
                  </div>

                  <details className="group">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors font-medium">
                      Ver pré-visualização da mensagem
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg border text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                      {metodoConfirmado === 'cartao' ? buildMensagemCartao() : metodoConfirmado === 'wise' ? buildMensagemWise() : buildMensagemPix()}
                    </div>
                  </details>

                  <button
                    onClick={handleFinalizar}
                    disabled={isUploading}
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {comprovanteFile ? 'Enviar e Finalizar' : 'Finalizar Sem Comprovante'}
                  </button>
                </>
              )}
            </div>
          )}

          {step === 'cartao' && !agendamentoCriado && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selecione o tipo do cartão para confirmar o agendamento.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo do Cartão *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setCartaoTipo('debito'); setCartaoParcelas('1') }}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      cartaoTipo === 'debito'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/15'
                        : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                    }`}
                  >
                    <p className="font-bold text-sm text-gray-900 dark:text-white">💳 Débito</p>
                    <p className="text-xs text-gray-500 mt-0.5">Pagamento à vista no cartão.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCartaoTipo('credito')}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      cartaoTipo === 'credito'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/15'
                        : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                    }`}
                  >
                    <p className="font-bold text-sm text-gray-900 dark:text-white">💳 Crédito</p>
                    <p className="text-xs text-gray-500 mt-0.5">Pagamento parcelado no crédito.</p>
                  </button>
                </div>
              </div>

              {cartaoTipo && (
                <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  {cartaoTipo === 'debito'
                    ? 'Cartão DÉBITO: o comprovante da transação deverá ser enviado para validação.'
                    : 'Cartão CRÉDITO: o comprovante da transação deverá ser enviado para validação.'}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setStep('method')}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 font-medium"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirmarCartao}
                  disabled={isLoading || !cartaoTipo}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar Cartão
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
