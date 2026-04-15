import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Loader2, Users, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import comercialService from '../../services/comercialService'
import { useAuth } from '../../../../contexts/AuthContext'
import Toast, { useToast, ToastContainer } from '@/components/ui/Toast'
import type { Cliente } from '@/types/comercial'

interface LocationState {
  servicoId: string;
  servicoNome: string;
  subservicoId?: string;
  subservicoNome?: string;
}

const ITEMS_PER_PAGE = 10

export default function SelecaoLeadCliente() {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeProfile } = useAuth()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selectedClienteId, setSelectedClienteId] = useState('')

  const state = location.state as LocationState | null

  // Filters
  const [filters, setFilters] = useState({
    id: '',
    nome: '',
    prioridade: 'todos' as 'todos' | 'high' | 'medium' | 'low',
  })
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!state?.servicoId) {
      navigate('/comercial/servicos')
      return
    }

    const fetchClientes = async () => {
      try {
        setLoading(true)
        const clientesData = await comercialService.getAllClientes()
        setClientes(clientesData || [])
      } catch (err) {
        console.error('Erro ao carregar clientes:', err)
        toast.error('Erro ao carregar lista de clientes')
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [state, navigate])

  // Separate and filter
  const filteredClientes = useMemo(() => {
    const clientesAtivos = clientes.filter((c) => c.status !== 'LEAD')
    const leads = clientes.filter((c) => c.status === 'LEAD')
    const all = [...clientesAtivos, ...leads]

    return all.filter(c => {
      const matchesId = !filters.id || c.id.toLowerCase().includes(filters.id.toLowerCase()) || (c.client_id && c.client_id.toLowerCase().includes(filters.id.toLowerCase()))
      const matchesNome = !filters.nome || c.nome.toLowerCase().includes(filters.nome.toLowerCase())
      return matchesId && matchesNome
    })
  }, [clientes, filters])

  const totalPages = Math.max(1, Math.ceil(filteredClientes.length / ITEMS_PER_PAGE))
  const paginatedClientes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredClientes.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredClientes, currentPage])

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const handleConfirmarContrato = async () => {
    if (!state?.servicoId || !selectedClienteId) {
      toast.warning('Selecione um cliente ou lead para prosseguir')
      return
    }

    try {
      setCreating(true)
      const res = await comercialService.createContratoServico({
        cliente_id: selectedClienteId,
        servico_id: state.servicoId,
        usuario_id: activeProfile?.id || undefined,
        subservico_id: state.subservicoId,
        subservico_nome: state.subservicoNome
      })
      const contrato = res?.data || res

      toast.success('Rascunho criado, redirecionando para formulário...')
      if (contrato?.id) {
        navigate(`/comercial/contratos/assessoria/${contrato.id}`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao criar contrato')
    } finally {
      setCreating(false)
    }
  }

  const selectedCliente = clientes.find(c => c.id === selectedClienteId)
  const hasActiveFilters = filters.id || filters.nome || filters.prioridade !== 'todos'

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!state) return null

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/comercial/servicos')}
        className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para serviços
      </button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Selecionar Cliente/Lead</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Para quem este contrato será gerado?
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 space-y-6">
        {/* Resumo do Serviço */}
        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Serviço Selecionado</h3>
          <p className="text-blue-900 dark:text-blue-200 font-medium">
            {state.servicoNome}
            {state.subservicoNome && ` - ${state.subservicoNome}`}
          </p>
        </div>

        {/* Filtros */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Filtrar e selecionar
          </label>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">ID Cliente</label>
              <input
                value={filters.id}
                onChange={e => setFilters(f => ({ ...f, id: e.target.value }))}
                placeholder="Ex: 001"
                className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nome</label>
              <input
                value={filters.nome}
                onChange={e => setFilters(f => ({ ...f, nome: e.target.value }))}
                placeholder="Filtrar por nome..."
                className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Prioridade</label>
              <select
                value={filters.prioridade}
                onChange={e => setFilters(f => ({ ...f, prioridade: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="todos">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
            <div className="flex items-end">
              {hasActiveFilters && (
                <button
                  onClick={() => setFilters({ id: '', nome: '', prioridade: 'todos' })}
                  className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {filteredClientes.length} resultado{filteredClientes.length !== 1 ? 's' : ''} encontrado{filteredClientes.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Lista de Clientes */}
        <div className="border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Telefone</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
              {paginatedClientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 dark:text-gray-500">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                paginatedClientes.map(c => {
                  const isLead = c.status === 'LEAD'
                  const isSelected = selectedClienteId === c.id
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedClienteId(c.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-emerald-500'
                          : isLead
                            ? 'bg-amber-50/50 dark:bg-amber-500/5 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                            : 'hover:bg-gray-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                          isLead
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                            : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {isLead ? '👤 Lead' : '👥 Cliente'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.nome}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{c.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{c.telefone || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {isSelected && <Check size={18} className="text-emerald-600 dark:text-emerald-400 mx-auto" />}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {filteredClientes.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredClientes.length)} de {filteredClientes.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-30 transition"
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
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                      currentPage === pageNum
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-30 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Cliente selecionado resumo */}
        {selectedCliente && (
          <div className={`p-4 rounded-xl border ${
            selectedCliente.status === 'LEAD'
              ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20'
              : 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
          }`}>
            <p className={`text-sm font-semibold ${
              selectedCliente.status === 'LEAD'
                ? 'text-amber-800 dark:text-amber-400'
                : 'text-emerald-800 dark:text-emerald-400'
            }`}>
              Selecionado: {selectedCliente.nome} ({selectedCliente.status === 'LEAD' ? 'Lead' : 'Cliente'})
            </p>
          </div>
        )}

        <button
          onClick={handleConfirmarContrato}
          disabled={!selectedClienteId || creating}
          className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
        >
          {creating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Criando rascunho...
            </>
          ) : (
            <>
              Continuar para Rascunho
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </>
          )}
        </button>
      </div>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
