import { useState, useMemo, useEffect } from 'react'
import { 
  DollarSign, 
  Search, 
  Filter, 
  Upload, 
  Check, 
  X, 
  FileText, 
  User, 
  Users, 
  Languages,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react'
import { Badge } from '@/modules/shared/components/ui/badge'
import { financeiroService, Commission } from '../../services/financeiroService'

// Tipos
type TipoBeneficiario = 'funcionario' | 'parceiro' | 'tradutor'
type StatusPagamento = 'pendente' | 'processando' | 'pago'

interface ComissaoPendente {
  id: string
  beneficiarioId: string
  beneficiarioNome: string
  beneficiarioTipo: TipoBeneficiario
  descricao: string
  valorComissao: number
  percentual: number
  dataVenda: string
  status: StatusPagamento
  comprovante?: string
  dataPagamento?: string
}

const tipoConfig: Record<TipoBeneficiario, { label: string; icon: typeof User; color: string }> = {
  funcionario: { 
    label: 'Funcionário', 
    icon: User, 
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' 
  },
  parceiro: { 
    label: 'Parceiro', 
    icon: Users, 
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10' 
  },
  tradutor: { 
    label: 'Tradutor', 
    icon: Languages, 
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' 
  },
}

const statusConfig: Record<StatusPagamento, { label: string; variant: 'default' | 'warning' | 'success' }> = {
  pendente: { label: 'Pendente', variant: 'warning' },
  processando: { label: 'Processando', variant: 'default' },
  pago: { label: 'Pago', variant: 'success' },
}

export default function PagamentosAdmin() {
  const [comissoes, setComissoes] = useState<ComissaoPendente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoBeneficiario | 'todos'>('todos')
  const [filtroStatus, setFiltroStatus] = useState<StatusPagamento | 'todos'>('todos')
  
  useEffect(() => {
    loadCommissions()
  }, [])

  const loadCommissions = async () => {
    try {
      setLoading(true)
      const data = await financeiroService.getCommissions()
      const mapped = data.map(c => ({
        id: c.id,
        beneficiarioId: c.usuario_id,
        beneficiarioNome: c.usuario?.full_name || 'Desconhecido',
        beneficiarioTipo: 'tradutor' as TipoBeneficiario,
        descricao: `Comissão ${c.mes}/${c.ano}`,
        valorComissao: c.valor_comissao_brl,
        percentual: 0,
        dataVenda: c.created_at,
        status: c.status === 'pago' ? 'pago' : 'pendente',
      })) as ComissaoPendente[]
      setComissoes(mapped)
    } catch (error) {
      console.error('Erro ao carregar comissoes:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Estado do modal de pagamento
  const [modalPagamento, setModalPagamento] = useState<{
    isOpen: boolean
    comissao: ComissaoPendente | null
  }>({ isOpen: false, comissao: null })
  const [comprovante, setComprovante] = useState<File | null>(null)
  const [processando, setProcessando] = useState(false)

  // Modal de visualizar comprovante
  const [modalComprovante, setModalComprovante] = useState<{
    isOpen: boolean
    comissao: ComissaoPendente | null
  }>({ isOpen: false, comissao: null })

  // Filtrar comissões
  const comissoesFiltradas = useMemo(() => {
    return comissoes.filter(c => {
      const matchSearch = 
        c.beneficiarioNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchTipo = filtroTipo === 'todos' || c.beneficiarioTipo === filtroTipo
      const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus
      return matchSearch && matchTipo && matchStatus
    })
  }, [comissoes, searchTerm, filtroTipo, filtroStatus])

  // Métricas
  const totalPendente = comissoes.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.valorComissao, 0)
  const totalProcessando = comissoes.filter(c => c.status === 'processando').reduce((sum, c) => sum + c.valorComissao, 0)
  const totalPago = comissoes.filter(c => c.status === 'pago').reduce((sum, c) => sum + c.valorComissao, 0)
  const qtdPendente = comissoes.filter(c => c.status === 'pendente').length

  // Abrir modal de pagamento
  const handleAbrirPagamento = (comissao: ComissaoPendente) => {
    setModalPagamento({ isOpen: true, comissao })
    setComprovante(null)
  }

  // Processar pagamento
  const handleConfirmarPagamento = async () => {
    if (!modalPagamento.comissao || !comprovante) return
    
    setProcessando(true)
    
    try {
      await financeiroService.confirmCommissionPayment(modalPagamento.comissao.id)
      
      setComissoes(prev => prev.map(c => 
        c.id === modalPagamento.comissao?.id
          ? {
              ...c,
              status: 'pago' as StatusPagamento,
              comprovante: `COMP-${new Date().getFullYear()}-${c.id}`,
              dataPagamento: new Date().toISOString()
            }
          : c
      ))
      
      setModalPagamento({ isOpen: false, comissao: null })
      setComprovante(null)
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error)
    } finally {
      setProcessando(false)
    }
  }

  // Handler de seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setComprovante(e.target.files[0])
    }
  }

  return (
    <div className="p-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pagamento de Comissões
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie e pague comissões de funcionários, parceiros e tradutores
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Pendentes */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</h3>
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {qtdPendente} pagamentos aguardando
          </p>
        </div>

        {/* Processando */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Processando</h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            R$ {totalProcessando.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Em andamento
          </p>
        </div>

        {/* Total Pago */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pago</h3>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
            Comissões quitadas
          </p>
        </div>

        {/* Total Geral */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/80">Total Geral</h3>
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            R$ {(totalPendente + totalProcessando + totalPago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-white/70 mt-2">
            {comissoes.length} comissões registradas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, descrição ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filtro por Tipo */}
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as TipoBeneficiario | 'todos')}
          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="todos">Todos os tipos</option>
          <option value="funcionario">Funcionários</option>
          <option value="parceiro">Parceiros</option>
          <option value="tradutor">Tradutores</option>
        </select>

        {/* Filtro por Status */}
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as StatusPagamento | 'todos')}
          className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="todos">Todos os status</option>
          <option value="pendente">Pendentes</option>
          <option value="processando">Processando</option>
          <option value="pago">Pagos</option>
        </select>
      </div>

      {/* Tabela de Comissões */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-neutral-700/50 border-b border-gray-200 dark:border-neutral-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Beneficiário</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Descrição</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Valor</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Data Venda</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
              {comissoesFiltradas.map((comissao) => {
                const TipoIcon = tipoConfig[comissao.beneficiarioTipo].icon
                return (
                  <tr key={comissao.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{comissao.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{comissao.beneficiarioNome}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tipoConfig[comissao.beneficiarioTipo].color}`}>
                        <TipoIcon className="h-3.5 w-3.5" />
                        {tipoConfig[comissao.beneficiarioTipo].label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={comissao.descricao}>
                        {comissao.descricao}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        R$ {comissao.valorComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ({comissao.percentual}%)
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {new Date(comissao.dataVenda).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={statusConfig[comissao.status].variant}>
                        {statusConfig[comissao.status].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {comissao.status === 'pago' && comissao.comprovante ? (
                          <button
                            onClick={() => setModalComprovante({ isOpen: true, comissao })}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition"
                            title="Ver comprovante"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        ) : comissao.status === 'pendente' ? (
                          <button
                            onClick={() => handleAbrirPagamento(comissao)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition"
                          >
                            <DollarSign className="h-4 w-4" />
                            Pagar
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Em processamento</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {comissoesFiltradas.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-700/30">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Exibindo {comissoesFiltradas.length} de {comissoes.length} comissões
            </p>
          </div>
        )}

        {comissoesFiltradas.length === 0 && (
          <div className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma comissão encontrada
            </p>
          </div>
        )}
      </div>

      {/* Modal de Pagamento */}
      {modalPagamento.isOpen && modalPagamento.comissao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                  <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Registrar Pagamento
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {modalPagamento.comissao.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalPagamento({ isOpen: false, comissao: null })}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Dados do Beneficiário */}
              <div className="bg-gray-50 dark:bg-neutral-700/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Beneficiário</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {modalPagamento.comissao.beneficiarioNome}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tipo</span>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tipoConfig[modalPagamento.comissao.beneficiarioTipo].color}`}>
                    {tipoConfig[modalPagamento.comissao.beneficiarioTipo].label}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Descrição</span>
                  <span className="text-sm text-gray-900 dark:text-white text-right max-w-[200px]">
                    {modalPagamento.comissao.descricao}
                  </span>
                </div>
              </div>

              {/* Valor */}
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Valor a Pagar</p>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  R$ {modalPagamento.comissao.valorComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Comissão de {modalPagamento.comissao.percentual}%
                </p>
              </div>

              {/* Upload de Comprovante */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Anexar Comprovante de Pagamento
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-neutral-600 rounded-xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="comprovante-input"
                  />
                  <label htmlFor="comprovante-input" className="cursor-pointer">
                    {comprovante ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <FileText className="h-6 w-6" />
                        <span className="font-medium">{comprovante.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Clique para selecionar ou arraste o arquivo
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          PDF, JPG ou PNG (máx. 5MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-700/30 rounded-b-2xl">
              <button
                onClick={() => setModalPagamento({ isOpen: false, comissao: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarPagamento}
                disabled={!comprovante || processando}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition"
              >
                {processando ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Confirmar Pagamento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualizar Comprovante */}
      {modalComprovante.isOpen && modalComprovante.comissao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                  <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Comprovante de Pagamento
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {modalComprovante.comissao.comprovante}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalComprovante({ isOpen: false, comissao: null })}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Beneficiário</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {modalComprovante.comissao.beneficiarioNome}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Valor Pago</p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    R$ {modalComprovante.comissao.valorComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Data do Pagamento</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {modalComprovante.comissao.dataPagamento 
                      ? new Date(modalComprovante.comissao.dataPagamento).toLocaleDateString('pt-BR')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID da Comissão</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {modalComprovante.comissao.id}
                  </p>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-neutral-700/50 rounded-xl p-8 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Comprovante anexado
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {modalComprovante.comissao.comprovante}.pdf
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-700/30 rounded-b-2xl">
              <button
                onClick={() => setModalComprovante({ isOpen: false, comissao: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded-lg transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
