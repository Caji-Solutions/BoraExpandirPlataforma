import { useState, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  CreditCard,
  FileText
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Agendamento } from '../../types/comercial'
import { Badge } from '../../components/ui/Badge'
import { TimeRangeFilter, filterByTimeRange, type TimeRange } from '../../components/ui/TimeRangeFilter'
import { SortControl, sortData, type SortDirection, type SortOption } from '../../components/ui/SortControl'

interface AgendamentosProps {
  agendamentos: Agendamento[]
}

export default function Agendamentos({ agendamentos }: AgendamentosProps) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [sortBy, setSortBy] = useState('data')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)

  const sortOptions: SortOption[] = [
    { value: 'data', label: 'Data' },
    { value: 'cliente.nome', label: 'Cliente' },
    { value: 'status', label: 'Status' },
    { value: 'produto', label: 'Produto' },
  ]

  const filteredAgendamentos = useMemo(() => {
    let filtered = agendamentos.filter(
      item =>
        item.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cliente?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.produto.toLowerCase().includes(searchTerm.toLowerCase())
    )

    filtered = filterByTimeRange(filtered, timeRange)
    return sortData(filtered, sortBy, sortDirection)
  }, [agendamentos, searchTerm, timeRange, sortBy, sortDirection])

  const handleSortChange = (newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy)
    setSortDirection(newDirection)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmado':
      case 'realizado':
        return <Badge variant="success" className="capitalize">{status}</Badge>
      case 'agendado':
      case 'pendente':
        return <Badge variant="warning" className="capitalize">{status}</Badge>
      case 'cancelado':
        return <Badge variant="destructive" className="capitalize">{status}</Badge>
      default:
        return <Badge variant="secondary" className="capitalize">{status}</Badge>
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meus Agendamentos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas vendas e compromissos agendados</p>
        </div>
        <button
          onClick={() => navigate('/comercial/agendamento')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-emerald-600/20"
        >
          <Calendar className="h-5 w-5" />
          Novo Agendamento
        </button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente ou produto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${showFilters
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300'
              : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700'
              }`}
          >
            {showFilters ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
            <span className="hidden sm:inline">{showFilters ? 'Fechar' : 'Filtros'}</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
            <SortControl
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
              options={sortOptions}
            />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {filteredAgendamentos.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-neutral-700 border-b border-gray-200 dark:border-neutral-600">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data / Hora</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {filteredAgendamentos.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                          {item.cliente?.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{item.cliente?.nome}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{item.cliente?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {new Date(item.data).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {item.hora} ({item.duracao_minutos} min)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-1">{item.produto}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/comercial/agendamento/${item.id}`)}
                        className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        title="Editar agendamento"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {filteredAgendamentos.length > 0 && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Mostrando {filteredAgendamentos.length} de {agendamentos.length} agendamentos
        </p>
      )}
    </div>
  )
}
