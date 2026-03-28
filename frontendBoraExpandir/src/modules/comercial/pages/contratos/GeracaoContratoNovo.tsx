import { useState, useMemo, useEffect } from 'react'
import { X, Loader, Check, ArrowRight, Copy, Mail, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { CONTRATOS_PDF_MOCK } from '../../lib/pdfContratos'
import type { Cliente, ContratoFormData } from '../../../../types/comercial'
import Toast, { useToast, ToastContainer } from '@/components/ui/Toast'
import { getConsultoriasCount } from '../../services/comercialService'
import { maskCpfInput, onlyDigits } from '../../../../utils/formatters'

interface GeracaoContratoNovoProps {
  onClose: () => void
  onSave?: (contratoData: ContratoFormData) => Promise<void>
  clientes?: Cliente[]
}

type Etapa = 'selecao' | 'pagamento' | 'review'

interface ContratoState {
  clienteId: string
  templateId: string
  valor: string
  formaPagamento: 'stripe' | 'mercado_pago' | ''
  conteudo: string
  linkPagamento: string
  cpf: string
  email: string
  estadoCivil: string
  consultoriaDescontoSistema: number
  consultoriaDescontoOverride: string
}

const ESTADOS_CIVIS = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'União Estável'
]

const ITEMS_PER_PAGE = 10

function numberToPortuguese(n: number): string {
  if (n === 0) return 'zero'
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

  if (n === 100) return 'cem'
  if (n >= 1000) {
    const mil = Math.floor(n / 1000)
    const rest = n % 1000
    const milStr = mil === 1 ? 'mil' : `${numberToPortuguese(mil)} mil`
    return rest === 0 ? milStr : `${milStr} e ${numberToPortuguese(rest)}`
  }
  if (n >= 100) {
    const rest = n % 100
    return rest === 0 ? hundreds[Math.floor(n / 100)] : `${hundreds[Math.floor(n / 100)]} e ${numberToPortuguese(rest)}`
  }
  if (n >= 20) {
    const rest = n % 10
    return rest === 0 ? tens[Math.floor(n / 10)] : `${tens[Math.floor(n / 10)]} e ${units[rest]}`
  }
  if (n >= 10) return teens[n - 10]
  return units[n]
}


export default function GeracaoContratoNovo({ onClose, onSave, clientes }: GeracaoContratoNovoProps) {
  const [etapa, setEtapa] = useState<Etapa>('selecao')
  const [loading, setLoading] = useState(false)
  const [contrato, setContrato] = useState<ContratoState>({
    clienteId: '',
    templateId: '',
    valor: '',
    formaPagamento: '',
    conteudo: '',
    linkPagamento: '',
    cpf: '',
    email: '',
    estadoCivil: '',
    consultoriaDescontoSistema: 0,
    consultoriaDescontoOverride: '',
  })
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const toast = useToast()

  // Filters
  const [filters, setFilters] = useState({
    id: '',
    nome: '',
    servico: '',
    prioridade: 'todos' as 'todos' | 'high' | 'medium' | 'low',
  })
  const [currentPage, setCurrentPage] = useState(1)

  const clientesDisponiveis = clientes || []

  // Separate leads and clients
  const leads = useMemo(() => clientesDisponiveis.filter(c => c.status === 'LEAD'), [clientesDisponiveis])
  const clientesAtivos = useMemo(() => clientesDisponiveis.filter(c => c.status !== 'LEAD'), [clientesDisponiveis])

  // Filtered list combining both
  const filteredClientes = useMemo(() => {
    const all = [...clientesAtivos, ...leads]
    return all.filter(c => {
      const matchesId = !filters.id || c.id.toLowerCase().includes(filters.id.toLowerCase()) || (c.client_id && c.client_id.toLowerCase().includes(filters.id.toLowerCase()))
      const matchesNome = !filters.nome || c.nome.toLowerCase().includes(filters.nome.toLowerCase())
      return matchesId && matchesNome
    })
  }, [clientesAtivos, leads, filters])

  const totalPages = Math.max(1, Math.ceil(filteredClientes.length / ITEMS_PER_PAGE))
  const paginatedClientes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredClientes.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredClientes, currentPage])

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const clienteSelecionado = clientesDisponiveis.find(c => c.id === contrato.clienteId)
  const templateSelecionado = CONTRATOS_PDF_MOCK.find(t => t.id === contrato.templateId)
  const isLead = clienteSelecionado?.status === 'LEAD'

  // Fetch consultancy discount when client is selected
  useEffect(() => {
    if (!contrato.clienteId) return
    getConsultoriasCount(contrato.clienteId)
      .then(data => {
        setContrato(prev => ({ ...prev, consultoriaDescontoSistema: data.valor_desconto }))
      })
      .catch(() => {
        setContrato(prev => ({ ...prev, consultoriaDescontoSistema: 0 }))
      })
  }, [contrato.clienteId])

  // Pre-fill email from selected client
  useEffect(() => {
    if (clienteSelecionado) {
      setContrato(prev => ({
        ...prev,
        email: prev.email || clienteSelecionado.email || '',
        cpf: prev.cpf || (clienteSelecionado.documento ? onlyDigits(clienteSelecionado.documento) : ''),
      }))
    }
  }, [clienteSelecionado])

  const consultoriaDescontoFinal = contrato.consultoriaDescontoOverride
    ? parseFloat(contrato.consultoriaDescontoOverride) || 0
    : contrato.consultoriaDescontoSistema

  const consultoriaDescontoExtenso = consultoriaDescontoFinal > 0
    ? `${consultoriaDescontoFinal} (${numberToPortuguese(Math.round(consultoriaDescontoFinal))} euros)`
    : '0 (zero)'

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!contrato.clienteId) errors.clienteId = 'Selecione um cliente'
    if (!contrato.templateId) errors.templateId = 'Selecione um tipo de contrato'
    if (!contrato.valor) errors.valor = 'Informe o valor'
    if (!contrato.email?.trim()) errors.email = 'Informe o email'
    if (!contrato.estadoCivil) errors.estadoCivil = 'Selecione o estado civil'

    const cpfDigits = onlyDigits(contrato.cpf)
    if (!cpfDigits) {
      errors.cpf = 'Informe o CPF'
    } else if (cpfDigits.length !== 11) {
      errors.cpf = 'CPF deve ter exatamente 11 dígitos'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleGerarContrato = async () => {
    if (!validateForm()) {
      toast.warning('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (!templateSelecionado || !clienteSelecionado) {
        throw new Error('Template ou cliente inválido')
      }

      const conteudo = templateSelecionado.gerar(
        {
          nome: clienteSelecionado.nome,
          email: contrato.email,
          telefone: clienteSelecionado.telefone,
          endereco: clienteSelecionado.endereco,
          cidade: '',
          estado: '',
        },
        {
          valorTotal: contrato.valor,
          formaPagamento: 'A definir',
        }
      )

      setContrato(prev => ({ ...prev, conteudo }))
      setEtapa('pagamento')
      toast.success('Contrato gerado com sucesso!')
    } catch (err) {
      console.error('Erro:', err)
      toast.error('Erro ao gerar contrato')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmarPagamento = () => {
    if (!contrato.formaPagamento) {
      toast.warning('Selecione uma plataforma de pagamento')
      return
    }

    const linkFake = `https://${contrato.formaPagamento}.com/pay/${Math.random().toString(36).substring(7)}`
    setContrato(prev => ({ ...prev, linkPagamento: linkFake }))
    setEtapa('review')
  }

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copiado para a área de transferência!')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleEnviarCliente = async () => {
    if (!onSave) return

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const contratoData: ContratoFormData = {
        cliente_id: contrato.clienteId,
        titulo: `Contrato - ${templateSelecionado?.nome}`,
        descricao: `Contrato ${templateSelecionado?.nome} com valor de R$ ${contrato.valor}`,
        valor: parseFloat(contrato.valor),
        template_tipo: (templateSelecionado?.id as any) || 'servico',
        conteudo_html: contrato.conteudo,
      }

      // Save lead data if contracting party is a LEAD
      if (isLead && clienteSelecionado) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || ''
        const token = localStorage.getItem('auth_token')
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) headers.Authorization = `Bearer ${token}`
        const updatePayload: Record<string, any> = {}
        if (contrato.email) updatePayload.email = contrato.email
        if (contrato.cpf) updatePayload.cpf = onlyDigits(contrato.cpf)
        if (contrato.estadoCivil) updatePayload.estado_civil = contrato.estadoCivil

        if (Object.keys(updatePayload).length > 0) {
          await fetch(`${backendUrl}/cliente/clientes/${contrato.clienteId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(updatePayload)
          }).catch(err => console.error('Erro ao salvar dados do lead:', err))
        }
      }

      await onSave(contratoData)
      toast.success('Contrato enviado ao cliente com sucesso!')
      onClose()
    } catch (err) {
      console.error('Erro:', err)
      toast.error('Erro ao enviar contrato')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCliente = (clienteId: string) => {
    setContrato(prev => ({ ...prev, clienteId, email: '', cpf: '' }))
    setValidationErrors(prev => ({ ...prev, clienteId: '' }))
  }

  const allRequiredFilled = contrato.clienteId && contrato.templateId && contrato.valor && contrato.email?.trim() && contrato.estadoCivil && onlyDigits(contrato.cpf).length === 11

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">

          {/* Header com Etapas */}
          <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 z-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Gerar Contrato</h2>
              <button onClick={onClose} className="hover:bg-white/20 p-2 rounded transition text-white">
                <X size={24} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-between text-white text-sm">
              <div className={`flex items-center gap-2 ${etapa === 'selecao' ? 'font-bold' : 'opacity-70'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${etapa === 'selecao' ? 'bg-white text-emerald-600' : 'bg-white/30'}`}>1</div>
                <span className="hidden sm:inline">Cliente & Contrato</span>
                <span className="sm:hidden">Cliente</span>
              </div>
              <ArrowRight size={16} className={etapa !== 'selecao' ? '' : 'opacity-30'} />
              <div className={`flex items-center gap-2 ${etapa === 'pagamento' ? 'font-bold' : 'opacity-70'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${['pagamento', 'review'].includes(etapa) ? 'bg-white text-emerald-600' : 'bg-white/30'}`}>2</div>
                <span className="hidden sm:inline">Pagamento</span>
                <span className="sm:hidden">Pag.</span>
              </div>
              <ArrowRight size={16} className={etapa === 'review' ? '' : 'opacity-30'} />
              <div className={`flex items-center gap-2 ${etapa === 'review' ? 'font-bold' : 'opacity-70'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${etapa === 'review' ? 'bg-white text-emerald-600' : 'bg-white/30'}`}>3</div>
                <span className="hidden sm:inline">Review</span>
                <span className="sm:hidden">Fim</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* ETAPA 1: SELEÇÃO */}
            {etapa === 'selecao' && (
              <div className="space-y-6">

                {/* Client Selection with Filters */}
                <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-gray-800 text-lg">Selecionar Cliente *</h3>
                  {validationErrors.clienteId && <p className="text-red-500 text-sm">{validationErrors.clienteId}</p>}

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">ID Cliente</label>
                      <input
                        value={filters.id}
                        onChange={e => setFilters(f => ({ ...f, id: e.target.value }))}
                        placeholder="Ex: 001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nome</label>
                      <input
                        value={filters.nome}
                        onChange={e => setFilters(f => ({ ...f, nome: e.target.value }))}
                        placeholder="Filtrar por nome..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Prioridade</label>
                      <select
                        value={filters.prioridade}
                        onChange={e => setFilters(f => ({ ...f, prioridade: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="todos">Todas</option>
                        <option value="high">Alta</option>
                        <option value="medium">Média</option>
                        <option value="low">Baixa</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      {(filters.id || filters.nome || filters.prioridade !== 'todos') && (
                        <button
                          onClick={() => setFilters({ id: '', nome: '', servico: '', prioridade: 'todos' })}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                        >
                          Limpar Filtros
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Client List */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Nome</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Telefone</th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedClientes.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                              Nenhum cliente encontrado
                            </td>
                          </tr>
                        ) : (
                          paginatedClientes.map(c => {
                            const cIsLead = c.status === 'LEAD'
                            const isSelected = contrato.clienteId === c.id
                            return (
                              <tr
                                key={c.id}
                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50 border-l-4 border-emerald-500' : cIsLead ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-gray-50'}`}
                                onClick={() => handleSelectCliente(c.id)}
                              >
                                <td className="px-4 py-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${cIsLead ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {cIsLead ? '👤 Lead' : '👥 Cliente'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 font-medium text-gray-900">{c.nome}</td>
                                <td className="px-4 py-2 text-gray-600">{c.email || '—'}</td>
                                <td className="px-4 py-2 text-gray-600">{c.telefone || '—'}</td>
                                <td className="px-4 py-2 text-center">
                                  {isSelected && <Check size={18} className="text-emerald-600 mx-auto" />}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {filteredClientes.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredClientes.length)} de {filteredClientes.length}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) pageNum = i + 1
                          else if (currentPage <= 3) pageNum = i + 1
                          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                          else pageNum = currentPage - 2 + i
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${currentPage === pageNum ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* CPF */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">CPF *</label>
                    <input
                      type="text"
                      value={maskCpfInput(contrato.cpf)}
                      onChange={(e) => {
                        const digits = onlyDigits(e.target.value).slice(0, 11)
                        setContrato(prev => ({ ...prev, cpf: digits }))
                        if (digits.length === 11) setValidationErrors(prev => ({ ...prev, cpf: '' }))
                      }}
                      placeholder="000.000.000-00"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${validationErrors.cpf ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {validationErrors.cpf && <p className="text-red-500 text-xs mt-1">{validationErrors.cpf}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={contrato.email}
                      onChange={(e) => {
                        setContrato(prev => ({ ...prev, email: e.target.value }))
                        if (e.target.value.trim()) setValidationErrors(prev => ({ ...prev, email: '' }))
                      }}
                      placeholder="email@exemplo.com"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${validationErrors.email ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
                  </div>

                  {/* Estado Civil */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estado Civil *</label>
                    <select
                      value={contrato.estadoCivil}
                      onChange={(e) => {
                        setContrato(prev => ({ ...prev, estadoCivil: e.target.value }))
                        if (e.target.value) setValidationErrors(prev => ({ ...prev, estadoCivil: '' }))
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${validationErrors.estadoCivil ? 'border-red-400' : 'border-gray-300'}`}
                    >
                      <option value="">Selecione...</option>
                      {ESTADOS_CIVIS.map(ec => (
                        <option key={ec} value={ec}>{ec}</option>
                      ))}
                    </select>
                    {validationErrors.estadoCivil && <p className="text-red-500 text-xs mt-1">{validationErrors.estadoCivil}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Valor */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valor (R$) *
                    </label>
                    <input
                      type="number"
                      value={contrato.valor}
                      onChange={(e) => {
                        setContrato(prev => ({ ...prev, valor: e.target.value }))
                        if (e.target.value) setValidationErrors(prev => ({ ...prev, valor: '' }))
                      }}
                      placeholder="0,00"
                      step="0.01"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${validationErrors.valor ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {validationErrors.valor && <p className="text-red-500 text-xs mt-1">{validationErrors.valor}</p>}
                  </div>

                  {/* Template */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de Contrato *
                    </label>
                    <select
                      value={contrato.templateId}
                      onChange={(e) => {
                        setContrato(prev => ({ ...prev, templateId: e.target.value }))
                        if (e.target.value) setValidationErrors(prev => ({ ...prev, templateId: '' }))
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${validationErrors.templateId ? 'border-red-400' : 'border-gray-300'}`}
                    >
                      <option value="">Selecione...</option>
                      {CONTRATOS_PDF_MOCK.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.nome}
                        </option>
                      ))}
                    </select>
                    {validationErrors.templateId && <p className="text-red-500 text-xs mt-1">{validationErrors.templateId}</p>}
                  </div>

                  {/* Consultancy Discount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valor da Consultoria a Abater
                    </label>
                    <div className="space-y-2">
                      <div className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700">
                        <span className="font-medium">Sistema:</span> {consultoriaDescontoExtenso}
                      </div>
                      <input
                        type="number"
                        value={contrato.consultoriaDescontoOverride}
                        onChange={(e) => setContrato(prev => ({ ...prev, consultoriaDescontoOverride: e.target.value }))}
                        placeholder="Sobrescrever valor (opcional)"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Informações do Cliente Selecionado */}
                {clienteSelecionado && (
                  <div className={`border rounded-lg p-4 ${isLead ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                    <h3 className={`font-semibold mb-3 ${isLead ? 'text-amber-900' : 'text-blue-900'}`}>
                      Dados do {isLead ? 'Lead' : 'Cliente'} Selecionado
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 font-medium">Nome:</p>
                        <p className={`${isLead ? 'text-amber-900' : 'text-blue-900'} break-words`}>{clienteSelecionado.nome}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Email:</p>
                        <p className={`${isLead ? 'text-amber-900' : 'text-blue-900'} break-all`}>{clienteSelecionado.email || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Telefone:</p>
                        <p className={isLead ? 'text-amber-900' : 'text-blue-900'}>{clienteSelecionado.telefone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">Status:</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${isLead ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isLead ? '👤 Lead' : '👥 Cliente'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botão Próximo */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGerarContrato}
                    disabled={loading || !allRequiredFilled}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <ArrowRight size={20} />
                        Próximo
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2: PAGAMENTO */}
            {etapa === 'pagamento' && (
              <div className="space-y-6">
                {/* Resumo do Contrato */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h3 className="font-semibold text-emerald-900 mb-3">Resumo do Contrato</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p><strong>Cliente:</strong> {clienteSelecionado?.nome}</p>
                    <p><strong>Template:</strong> {templateSelecionado?.nome}</p>
                    <p><strong>Valor:</strong> R$ {parseFloat(contrato.valor).toFixed(2)}</p>
                    <p><strong>Desconto Consultoria:</strong> {consultoriaDescontoExtenso}</p>
                    <p><strong>CPF:</strong> {maskCpfInput(contrato.cpf)}</p>
                    <p><strong>Estado Civil:</strong> {contrato.estadoCivil}</p>
                  </div>
                </div>

                {/* Seleção de Plataforma de Pagamento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Selecione a Plataforma de Pagamento *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Stripe */}
                    <button
                      onClick={() => setContrato(prev => ({ ...prev, formaPagamento: 'stripe' }))}
                      className={`p-6 border-2 rounded-lg transition flex items-center gap-4 ${
                        contrato.formaPagamento === 'stripe'
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-300 hover:border-emerald-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${contrato.formaPagamento === 'stripe' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        💳
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Stripe</p>
                        <p className="text-sm text-gray-600">Cartão de crédito/débito</p>
                      </div>
                      {contrato.formaPagamento === 'stripe' && (
                        <Check size={20} className="ml-auto text-emerald-600" />
                      )}
                    </button>

                    {/* Mercado Pago */}
                    <button
                      onClick={() => setContrato(prev => ({ ...prev, formaPagamento: 'mercado_pago' }))}
                      className={`p-6 border-2 rounded-lg transition flex items-center gap-4 ${
                        contrato.formaPagamento === 'mercado_pago'
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-300 hover:border-emerald-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${contrato.formaPagamento === 'mercado_pago' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        💰
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Mercado Pago</p>
                        <p className="text-sm text-gray-600">Múltiplas formas de pagamento</p>
                      </div>
                      {contrato.formaPagamento === 'mercado_pago' && (
                        <Check size={20} className="ml-auto text-emerald-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Botões de Navegação */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEtapa('selecao')}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={handleConfirmarPagamento}
                    disabled={!contrato.formaPagamento}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={20} />
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3: REVIEW */}
            {etapa === 'review' && (
              <div className="space-y-6">
                {/* Resumo Final */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dados do Contrato */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Detalhes do Contrato</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p><strong>Cliente:</strong> {clienteSelecionado?.nome} {isLead && <span className="text-amber-600 font-bold">(Lead)</span>}</p>
                      <p><strong>Email:</strong> {contrato.email}</p>
                      <p><strong>CPF:</strong> {maskCpfInput(contrato.cpf)}</p>
                      <p><strong>Estado Civil:</strong> {contrato.estadoCivil}</p>
                      <p><strong>Template:</strong> {templateSelecionado?.nome}</p>
                      <p><strong>Valor:</strong> R$ {parseFloat(contrato.valor).toFixed(2)}</p>
                      <p><strong>Desconto Consultoria:</strong> {consultoriaDescontoExtenso}</p>
                      <p><strong>Plataforma:</strong> {contrato.formaPagamento === 'stripe' ? 'Stripe' : 'Mercado Pago'}</p>
                    </div>
                  </div>

                  {/* Link de Pagamento */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3">Link de Pagamento</h3>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={contrato.linkPagamento}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border border-green-200 rounded text-sm font-mono text-green-800"
                        />
                        <button
                          onClick={() => handleCopyToClipboard(contrato.linkPagamento, 'link')}
                          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                      {copiedField === 'link' && (
                        <p className="text-xs text-green-700 font-semibold">Copiado!</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview do Contrato */}
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Prévia do Contrato</h3>
                  </div>
                  <div className="bg-white p-6 h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-700 leading-relaxed">
                      {contrato.conteudo}
                    </pre>
                  </div>
                </div>

                {/* Template de Email para Cliente */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail size={20} className="text-orange-600" />
                    <h3 className="font-semibold text-orange-900">Email para Enviar ao Cliente</h3>
                  </div>
                  <div className="bg-white border border-orange-200 rounded p-4 space-y-2 text-sm">
                    <p><strong>Assunto:</strong> Contrato - {templateSelecionado?.nome}</p>
                    <p><strong>Corpo:</strong></p>
                    <p className="text-gray-700 whitespace-pre-wrap">
{`Olá ${clienteSelecionado?.nome},

Segue em anexo o contrato para sua análise e assinatura.

💳 Link para Pagamento:
${contrato.linkPagamento}

Plataforma: ${contrato.formaPagamento === 'stripe' ? 'Stripe' : 'Mercado Pago'}
Valor: R$ ${parseFloat(contrato.valor).toFixed(2)}

Qualquer dúvida, estou à disposição!

Atenciosamente`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const emailText = `${clienteSelecionado?.nome},\n\nLink: ${contrato.linkPagamento}\nValor: R$ ${parseFloat(contrato.valor).toFixed(2)}`
                      handleCopyToClipboard(emailText, 'email')
                    }}
                    className="mt-3 w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <Copy size={18} />
                    Copiar Email {copiedField === 'email' && '✅'}
                  </button>
                </div>

                {/* Botões Finais */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEtapa('pagamento')}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={handleEnviarCliente}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail size={20} />
                        Enviar ao Cliente
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </>
  )
}
