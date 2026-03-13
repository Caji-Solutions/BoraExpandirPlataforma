import React, { useState, useRef } from 'react'
import { X, CheckCircle2, Copy, Upload, Loader2, AlertCircle, Check } from 'lucide-react'

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
    usuario_id?: string
    cliente_id?: string
    requer_delegacao?: boolean
    id?: string
  }
  exchangeRate?: number
}

const PIX_CNPJ = '55.218.947/0001-65'

export const AgendamentoConfirmacaoModal: React.FC<AgendamentoConfirmacaoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  payload,
  exchangeRate = 6.27
}) => {
  const [step, setStep] = useState<'method' | 'pix' | 'wise'>('method')
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedPix, setCopiedPix] = useState(false)
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null)
  const [comprovantePreview, setComprovantePreview] = useState<string | null>(null)
  const [uploadingComprovante, setUploadingComprovante] = useState(false)
  const [agendamentoCriado, setAgendamentoCriado] = useState<any>(null)
  const [avisoFormPreenchido, setAvisoFormPreenchido] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

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

  const valorBRL = payload.isEuro
    ? `R$ ${(payload.valor * exchangeRate).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `R$ ${payload.valor.toFixed(2)}`

  const valorEUR = payload.isEuro ? `€ ${payload.valor.toFixed(2)}` : ''

  const frontendUrl = import.meta.env.VITE_FRONTEND_URL?.trim() || window.location.origin

  const buildFormularioLink = (agendamentoId?: string) => {
    const base = agendamentoId
      ? `${frontendUrl}/formulario/consultoria/${agendamentoId}`
      : `${frontendUrl}/formulario/consultoria`
    const params = new URLSearchParams()
    if (payload.nome) params.set('nome', payload.nome)
    if (payload.email) params.set('email', payload.email)
    if (payload.telefone) params.set('telefone', payload.telefone)
    const qs = params.toString()
    return qs ? `${base}?${qs}` : base
  }

  // Define a função de construir a mensagem para pegar o estado mais recente
  const buildMensagemPix = () => {
    const link = buildFormularioLink(agendamentoCriado?.id)
    
    let instructions = ''
    if (avisoFormPreenchido) {
      instructions = `📝 Como você já preencheu nosso formulário anteriormente, agora é só realizar o pagamento para liberarmos seu acesso! 😊`
    } else {
      instructions = `📋 Preencha também o formulário de consultoria:
${link}`
    }

    return `Olá ${payload.nome}! 😊

Seu agendamento de *${payload.produto_nome}* está quase confirmado!

📅 Data: ${data}
🕐 Horário: ${hora}
💰 Valor: ${valorEUR ? `${valorEUR} (${valorBRL})` : valorBRL}

Para confirmar, realize o pagamento via PIX:

🔑 Chave PIX (CNPJ): ${PIX_CNPJ}

Após o pagamento, envie o comprovante aqui no chat.

${instructions}

Obrigado! 🚀
— Equipe Bora Expandir`
  }

  const handleSelectPix = async () => {
    setStep('pix')
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

      const requestPayload = {
        ...payload,
        status: 'pendente',
        metodo_pagamento: 'pix',
        requer_delegacao: payload.requer_delegacao
      }

      // Remover ID do payload stringificado se for edição, já que está na URL
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
      if (responseData.aviso_formulario_preenchido) {
        setAvisoFormPreenchido(true)
      }
      setIsLoading(false)
    } catch (err) {
      setLocalError('Erro de conexão com o servidor.')
      setIsLoading(false)
    }
  }

  const handleSelectWise = () => {
    setStep('wise')
    // Wise será implementado futuramente
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(buildMensagemPix())
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = buildMensagemPix()
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setComprovanteFile(file)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => setComprovantePreview(ev.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        setComprovantePreview(null)
      }
    }
  }

  const handleUploadComprovante = async () => {
    if (!comprovanteFile || !agendamentoCriado) return

    setUploadingComprovante(true)
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''

    try {
      const formData = new FormData()
      formData.append('comprovante', comprovanteFile)
      formData.append('agendamento_id', agendamentoCriado.id)
      if (payload.cliente_id) {
        formData.append('cliente_id', payload.cliente_id)
      }

      const response = await fetch(`${backendUrl}/formulario/comprovante`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar comprovante')
      }

      setUploadingComprovante(false)
      onSuccess(agendamentoCriado)
    } catch (err) {
      setUploadingComprovante(false)
      setLocalError('Erro ao enviar comprovante. Tente novamente.')
    }
  }

  const handleFinalizar = () => {
    onSuccess(agendamentoCriado || {})
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {step === 'method' ? 'Método de Pagamento' : step === 'pix' ? 'Pagamento via PIX' : 'Wise'}
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

          {/* ==================== STEP 1: Escolher Método ==================== */}
          {step === 'method' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Selecione como o cliente irá realizar o pagamento:
              </p>

              <div className="grid grid-cols-1 gap-4">
                {/* Opção PIX */}
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
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-neutral-600 group-hover:border-emerald-500 flex items-center justify-center transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-emerald-500 transition-colors" />
                  </div>
                </button>

                {/* Opção Wise */}
                <button
                  onClick={handleSelectWise}
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
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-neutral-600 group-hover:border-blue-500 flex items-center justify-center transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-blue-500 transition-colors" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 2: PIX ==================== */}
          {step === 'pix' && (
            <div className="space-y-5">
              {/* Loading state */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                  <p className="text-sm text-gray-500">Criando agendamento...</p>
                </div>
              )}

              {/* Conteúdo após agendamento criado */}
              {!isLoading && agendamentoCriado && (
                <>
                  {/* Sucesso */}
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-sm border border-emerald-100 dark:border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Agendamento criado! Copie a mensagem e envie ao lead na Kommo.</span>
                  </div>

                  {/* Aviso de formulário já preenchido */}
                  {avisoFormPreenchido && (
                    <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-lg text-sm border border-amber-100 dark:border-amber-500/20">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>⚠️ <strong>Este lead já preencheu o formulário anteriormente.</strong> Não é necessário enviar o link do formulário novamente.</span>
                    </div>
                  )}

                  {/* Chave PIX */}
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

                  {/* Copiar Mensagem Padrão (inclui o link do formulário) */}
                  <button
                    onClick={handleCopyMessage}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-neutral-700 hover:border-emerald-400 dark:hover:border-emerald-600 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    {copied ? (
                      <><Check className="h-5 w-5 text-emerald-600" /> Mensagem copiada!</>
                    ) : (
                      <><Copy className="h-5 w-5" /> Copiar mensagem + link do formulário</>
                    )}
                  </button>

                  {/* Pré-visualização da mensagem */}
                  <details className="group" open>
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                      Ver pré-visualização da mensagem
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg border text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                      {buildMensagemPix()}
                    </div>
                  </details>

                  {/* Upload de Comprovante */}
                  <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl p-5 border border-gray-100 dark:border-neutral-800">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                      📎 Upload do Comprovante de Pagamento
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {comprovanteFile ? (
                      <div className="space-y-3">
                        {comprovantePreview && (
                          <img src={comprovantePreview} alt="Comprovante" className="w-full max-h-48 object-contain rounded-lg border" />
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="flex-1 truncate">{comprovanteFile.name}</span>
                          <button
                            onClick={() => { setComprovanteFile(null); setComprovantePreview(null) }}
                            className="text-red-500 hover:text-red-700 text-xs underline"
                          >
                            Remover
                          </button>
                        </div>
                        <button
                          onClick={handleUploadComprovante}
                          disabled={uploadingComprovante}
                          className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {uploadingComprovante ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                          ) : (
                            <><Upload className="h-4 w-4" /> Enviar Comprovante</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-6 border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-600 transition-all flex flex-col items-center gap-2"
                      >
                        <Upload className="h-8 w-8 opacity-40" />
                        <span className="text-sm font-medium">Clique para anexar o comprovante</span>
                        <span className="text-xs opacity-60">JPG, PNG, WebP ou PDF (máx. 10MB)</span>
                      </button>
                    )}
                  </div>

                  {/* Botão Finalizar */}
                  <button
                    onClick={handleFinalizar}
                    className="w-full py-3 rounded-xl border-2 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all text-sm"
                  >
                    Finalizar
                  </button>
                </>
              )}

              {/* Estado sem agendamento e sem loading (erro já existente) */}
              {!isLoading && !agendamentoCriado && (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-4">Não foi possível criar o agendamento.</p>
                  <button
                    onClick={() => { setStep('method'); setLocalError(null) }}
                    className="px-6 py-2 rounded-xl border-2 border-gray-200 dark:border-neutral-700 text-gray-600 font-bold hover:bg-gray-50 transition-all text-sm"
                  >
                    Voltar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================== STEP 2: Wise (Placeholder) ==================== */}
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
