import React, { useState } from 'react'
import { X, Save, User, Mail, Phone, FileText, MapPin, CheckCircle2, Copy, ExternalLink, Key } from 'lucide-react'
import type { ClienteFormData } from '../../types/comercial'

interface CadastroClienteProps {
  onClose: () => void
  onSave: (cliente: ClienteFormData) => Promise<any>
  initialData?: any
  initialSuccessData?: any
}

export default function CadastroCliente({ onClose, onSave, initialData, initialSuccessData }: CadastroClienteProps) {
  const [formData, setFormData] = useState<ClienteFormData>(initialData || {
    nome: '',
    email: '',
    telefone: '',
    whatsapp: '',
    documento: '',
    endereco: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<any | null>(initialSuccessData || null)
  const [copied, setCopied] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [copiedPass, setCopiedPass] = useState(false)

  // Sincroniza dados iniciais se chegarem de forma assíncrona
  React.useEffect(() => {
    if (initialSuccessData) {
      setSuccessData(initialSuccessData)
    }
  }, [initialSuccessData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validate = (): string | null => {
    if (!formData.nome.trim()) return 'Nome é obrigatório'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'E-mail inválido'
    if (formData.telefone.replace(/\D/g, '').length < 10) return 'Telefone inválido'
    // const docDigits = formData.documento.replace(/\D/g, '')
    // if (docDigits.length !== 11 && docDigits.length !== 14) return 'CPF/CNPJ inválido'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await onSave(formData)
      setSuccessData(result)
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyMessage = () => {
    if (!successData) return

    const message = `Olá ${formData.nome}! Seu acesso à plataforma BoraExpandir foi criado com sucesso. 🚀\n\n` +
      `Acesse em: https://plataforma.boraexpandir.pt\n` +
      `Login: ${successData.loginInfo.email}\n` +
      `Senha Temporária: ${successData.loginInfo.password}\n\n` +
      `Ao entrar, recomendamos que altere sua senha no menu de configurações.`

    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenWhatsApp = () => {
    if (!successData) return
    const message = encodeURIComponent(`Olá ${formData.nome}! Seu acesso à plataforma BoraExpandir foi criado com sucesso. 🚀\n\n` +
      `Acesse em: https://plataforma.boraexpandir.pt\n` +
      `Login: ${successData.loginInfo.email}\n` +
      `Senha Temporária: ${successData.loginInfo.password}`)
    
    const whatsappNumber = (formData.whatsapp || '').replace(/\D/g, '')
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappLink, '_blank')
  }

  if (successData) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300">
          <div className="bg-emerald-600 p-8 text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-1 tracking-tight">Cadastro Concluído!</h2>
            <p className="text-emerald-100 text-sm font-medium">O cliente foi registrado e o acesso criado.</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Dados de Acesso</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-gray-500 uppercase">E-mail / Login</p>
                      <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">{successData.loginInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-emerald-600" />
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-500 uppercase">Senha Temporária</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-bold text-gray-900 dark:text-white bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded inline-block">
                          {showPass ? successData.loginInfo.password : successData.loginInfo.password.replace(/./g, '•')}
                        </p>
                        <button 
                          onClick={() => setShowPass(!showPass)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded text-gray-400"
                        >
                          {showPass ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(successData.loginInfo.password)
                            setCopiedPass(true)
                            setTimeout(() => setCopiedPass(false), 2000)
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded text-emerald-600"
                          title="Copiar senha"
                        >
                          {copiedPass ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCopyMessage}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white dark:bg-neutral-800 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all active:scale-[0.98]"
              >
                {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                {copied ? 'Copiado!' : 'Copiar Mensagem Acesso'}
              </button>
              
              <button
                onClick={handleOpenWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <ExternalLink className="h-5 w-5" />
                Enviar via WhatsApp
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors py-2 uppercase tracking-widest font-bold"
            >
              Fechar Visualização
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-neutral-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cadastrar Novo Cliente</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: João Silva"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                  Telefone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(11) 98888-7777"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                  WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="(11) 98888-7777"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                  CPF/CNPJ
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                Endereço
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-6 h-5 w-5 text-gray-400" />
                <textarea
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Rua, número, bairro, cidade - UF"
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-4 border-2 border-gray-200 dark:border-neutral-700 rounded-xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all active:scale-[0.98]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] px-4 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Salvando...' : 'Salvar e Gerar Acesso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
