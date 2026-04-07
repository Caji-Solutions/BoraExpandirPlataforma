import { useState, useMemo, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../contexts/AuthContext'
import { Sidebar } from '@/components/ui/Sidebar'
import type { SidebarGroup } from '@/components/ui/Sidebar'
import DashboardVendas from './DashboardVendas'
import CadastroCliente from '../cadastro/CadastroCliente'
import GeracaoContratoNovo from '../contratos/GeracaoContratoNovo'
import RequerimentoSuperadmin from '../RequerimentoSuperadmin'
import AssinaturaDigital from '../contratos/AssinaturaDigital'
import Comercial1 from './Comercial1'
import LeadsPage from './Leads'
import AgendamentosPage from '@/modules/comercial/pages/agendamentos/Agendamentos'
import { AgendamentoEditPage } from '../agendamentos/AgendamentoEditPage'
import GanhosPage from '../financeiro/Ganhos'
import ComissaoColaborador from '../financeiro/ComissaoColaborador'
import SupervisorComercialPage from '../supervisor/SupervisorComercialPage'
import ServicosComerciais from './ServicosComerciais'
import SelecaoLeadCliente from '../cadastro/SelecaoLeadCliente'
import ContratosFixosPage from '../contratos/ContratosFixosPage'
import ContratoServicoDetailPage from '../contratos/ContratoServicoDetailPage'
import PosConsultoria from '../PosConsultoria'
import AssessoriaDiretaPage from '../AssessoriaDiretaPage'
import FormularioAssessoriaPage from '../FormularioAssessoriaPage'
import ProximosAgendamentosCard from '../../components/ProximosAgendamentosCard'
import CadastroRapidoLeadCard from '../../components/CadastroRapidoLeadCard'
import { Config } from '@/components/ui/Config'
import { Plus, Home, Users, FileText, CreditCard, AlertCircle, PenTool, CheckCircle, Calendar, Settings, Search, Filter, X, DollarSign, Dna, ClipboardCheck } from 'lucide-react'
import { ClientDNAPage } from '@/components/ui/ClientDNA'
import { TimeRangeFilter, filterByTimeRange, type TimeRange } from '@/components/ui/TimeRangeFilter'
import { SortControl, sortData, type SortDirection, type SortOption } from '@/components/ui/SortControl'
import { catalogService } from '../../../adm/services/catalogService'
import type {
  Cliente,
  ClienteFormData,
  Contrato,
  ContratoFormData,
  Requerimento,
  RequerimentoFormData,
  Lead,
  LeadFormData,
  Agendamento,
  AgendamentoFormData

} from '../../../types/comercial'
import Toast, { useToast, ToastContainer } from '@/components/ui/Toast'
import { Badge } from '@/modules/shared/components/ui/badge'
import comercialService from '../../services/comercialService'
import { extractLocalTimeMapping } from '../../../../utils/dateUtils'

// Componentes de página
function DashboardPage({
  clientes,
  contratos,
  requerimentos,
  agendamentos,
  onShowCadastroCliente,
  onSaveLead,
  leads
}: {
  clientes: Cliente[]
  contratos: Contrato[]
  requerimentos: Requerimento[]
  agendamentos: Agendamento[]
  onShowCadastroCliente: () => void
  onSaveLead: (leadData: LeadFormData) => void
  leads: Lead[]
}) {
  const { activeProfile } = useAuth()
  const navigate = useNavigate()
  const nivel = activeProfile?.nivel || 'C1'
  const isC2 = nivel === 'C2' || activeProfile?.role === 'super_admin'
  const firstName = activeProfile?.full_name?.split(' ')[0] || 'Vendedor'

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Agendamentos de hoje
  const agendamentosHoje = agendamentos.filter(a => a.data === todayStr)
    .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))

  // Proximos agendamentos (futuros, nao realizados/cancelados)
  const proximosAg = agendamentos
    .filter(a => {
      if (!a.data) return false
      return a.data >= todayStr && a.status !== 'realizado' && a.status !== 'cancelado'
    })
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .slice(0, 5)

  // Metricas
  const consultoriasAgendadas = agendamentos.filter(a => a.status === 'confirmado' || a.status === 'agendado').length
  const consultoriasRealizadas = agendamentos.filter(a => a.status === 'realizado').length
  const pagamentosAprovados = agendamentos.filter(a => a.pagamento_status === 'aprovado').length

  // C2 specific
  const contratosAtivos = contratos.filter(c => c.status !== 'cancelado').length
  const requerimentosPendentes = requerimentos.filter(r => r.status === 'pendente').length

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-emerald-500'
      case 'agendado': return 'bg-blue-500'
      case 'realizado': return 'bg-green-600'
      case 'cancelado': return 'bg-red-500'
      case 'pendente': return 'bg-amber-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-1">
            {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">
            {isC2 ? 'Painel completo — Consultorias, Assessorias e Contratos' : 'Painel de Consultorias'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
            isC2 ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40'
                 : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40'
          }`}>
            Nivel {nivel}
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className={`grid gap-3 lg:gap-4 ${isC2 ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4'}`}>
        <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Clientes</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{clientes.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Carteira ativa</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Agendadas</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{consultoriasAgendadas}</p>
          <p className="text-[11px] text-gray-500 mt-1">Consultorias ativas</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Realizadas</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{consultoriasRealizadas}</p>
          <p className="text-[11px] text-gray-500 mt-1">Consultorias concluidas</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <CreditCard className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pagamentos</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{pagamentosAprovados}</p>
          <p className="text-[11px] text-gray-500 mt-1">Aprovados</p>
        </div>

        {isC2 && (
          <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <PenTool className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Contratos</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{contratosAtivos}</p>
            <p className="text-[11px] text-gray-500 mt-1">Ativos</p>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">
        {/* Agendamentos Hoje - 3 cols */}
        <div className="lg:col-span-3 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Agendamentos de Hoje</h3>
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-neutral-700 px-2 py-0.5 rounded-md">{agendamentosHoje.length}</span>
            </div>
            <button
              onClick={() => navigate('/comercial/meus-agendamentos')}
              className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todos <span className="text-xs">›</span>
            </button>
          </div>
          <div className="p-4">
            {agendamentosHoje.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Calendar className="h-10 w-10 text-gray-200 dark:text-neutral-700 mb-3" />
                <p className="text-sm font-medium text-gray-400">Nenhum agendamento para hoje</p>
                <button
                  onClick={() => navigate('/comercial/servicos')}
                  className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Agendar consulta
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {agendamentosHoje.map((ag, i) => (
                  <div key={ag.id || i} className={`flex items-center gap-4 p-3 rounded-xl border transition-all hover:shadow-sm ${
                    ag.status === 'realizado'
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30'
                      : 'bg-gray-50 dark:bg-neutral-900 border-gray-100 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800'
                  }`}>
                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl text-white ${
                      ag.status === 'realizado' ? 'bg-green-500' : 'bg-blue-600'
                    }`}>
                      <span className="text-sm font-bold leading-none">{(ag.hora || '--:--').split(':')[0]}</span>
                      <span className="text-[9px] font-medium opacity-80">{(ag.hora || '--:--').split(':')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{ag.cliente?.nome || 'Cliente'}</p>
                      <p className="text-xs text-gray-500 truncate">{ag.produto || 'Consultoria'}</p>
                    </div>
                    <div className={`h-2 w-2 rounded-full shrink-0 ${getStatusDot(ag.status)}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar direito - 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Proximas consultas */}
          <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-700 flex items-center gap-2">
              <Settings className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Proximas Consultas</h3>
            </div>
            <div className="p-4">
              {proximosAg.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Nenhuma consulta agendada</p>
              ) : (
                <div className="space-y-2">
                  {proximosAg.map((ag, i) => {
                    const d = ag.data ? new Date(ag.data + 'T12:00:00') : null
                    return (
                      <div key={ag.id || i} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-neutral-700 last:border-0">
                        <div className="text-center w-10">
                          <p className="text-base font-bold text-gray-900 dark:text-white leading-none">{d ? d.getDate() : '--'}</p>
                          <p className="text-[9px] text-gray-400 font-medium uppercase">{d ? d.toLocaleDateString('pt-BR', { month: 'short' }) : ''}</p>
                        </div>
                        <div className="h-7 w-px bg-gray-200 dark:bg-neutral-700" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{ag.cliente?.nome || 'Cliente'}</p>
                          <p className="text-[10px] text-gray-400">{ag.hora || '--:--'} - {ag.produto || 'Consultoria'}</p>
                        </div>
                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${getStatusDot(ag.status)}`} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* C2: Contratos e Requerimentos */}
          {isC2 && (
            <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Contratos Recentes</h3>
                </div>
                <button onClick={() => navigate('/comercial/contratos')} className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700">
                  Ver todos ›
                </button>
              </div>
              <div className="p-4">
                {contratos.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhum contrato</p>
                ) : (
                  <div className="space-y-2">
                    {contratos.slice(0, 4).map((c) => (
                      <div key={c.id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-neutral-700 last:border-0">
                        <div className="p-2 bg-gray-100 dark:bg-neutral-700 rounded-lg">
                          <FileText className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{c.cliente?.nome || 'Cliente'}</p>
                          <p className="text-[10px] text-gray-400 truncate">{c.titulo || 'Servico'}</p>
                        </div>
                        <Badge className={`text-[9px] border-none ${
                          c.status === 'assinado' ? 'bg-green-100 text-green-700' :
                          c.status === 'rascunho' ? 'bg-gray-100 text-gray-600' :
                          'bg-blue-100 text-blue-700'
                        }`}>{c.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* C2: Requerimentos pendentes */}
          {isC2 && requerimentosPendentes > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">{requerimentosPendentes} requerimento{requerimentosPendentes > 1 ? 's' : ''} pendente{requerimentosPendentes > 1 ? 's' : ''}</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400">Precisam de atencao</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`grid gap-3 ${isC2 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
        <button onClick={() => navigate('/comercial/servicos')} className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-800/30 rounded-xl transition-all group">
          <Plus className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Novo Agendamento</span>
        </button>
        <button onClick={() => navigate('/comercial/leads')} className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/30 rounded-xl transition-all group">
          <Users className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Leads</span>
        </button>
        <button onClick={() => navigate('/comercial/dna')} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-950/40 border border-slate-200 dark:border-slate-800/30 rounded-xl transition-all group">
          <Dna className="h-4 w-4 text-slate-600" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-400">DNA Clientes</span>
        </button>
        <button onClick={() => navigate('/comercial/comissoes')} className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-800/30 rounded-xl transition-all group">
          <DollarSign className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Comissoes</span>
        </button>
        {isC2 && (
          <button onClick={() => navigate('/comercial/contratos')} className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/30 rounded-xl transition-all group">
            <PenTool className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">Contratos</span>
          </button>
        )}
      </div>
    </div>
  )
}

function ClientesPage({
  onShowCadastroCliente,
  onRowClick
}: {
  onShowCadastroCliente: () => void
  onRowClick: (cliente: Cliente) => void
}) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function fetchClientes() {
      try {
        setLoading(true)
        const data = await comercialService.getAllClientes()
        setClientes(data.filter((c: any) => c.status === 'cliente'))
      } catch (err) {
        console.error('Erro ao buscar clientes:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchClientes()
  }, [])

  const sortOptions: SortOption[] = [
    { value: 'nome', label: 'Nome' },
    { value: 'created_at', label: 'Data de Cadastro' },
    { value: 'email', label: 'E-mail' },
    { value: 'documento', label: 'Documento' },
  ]

  const filteredClientes = useMemo(() => {
    // First filter by search term
    let filtered = clientes.filter(
      cliente =>
        (cliente.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (cliente.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (cliente.documento?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )

    // Then filter by time range
    filtered = filterByTimeRange(filtered, timeRange)

    // Finally sort
    return sortData(filtered, sortBy, sortDirection)
  }, [clientes, searchTerm, timeRange, sortBy, sortDirection])

  const handleSortChange = (newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy)
    setSortDirection(newDirection)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Clientes</h1>
        <p className="text-gray-600 dark:text-gray-400">Gerencie seus clientes cadastrados</p>
      </div>

      {/* Barra de Ações */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou documento..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${showFilters
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300'
              : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700'
              }`}
          >
            {showFilters ? (
              <>
                <X className="h-5 w-5" />
                <span className="hidden sm:inline">Fechar</span>
              </>
            ) : (
              <>
                <Filter className="h-5 w-5" />
                <span className="hidden sm:inline">Filtros</span>
              </>
            )}
          </button>

          <button
            onClick={onShowCadastroCliente}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Painel de Filtros Colapsável */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-800/50 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimeRangeFilter
              value={timeRange}
              onChange={setTimeRange}
            />
            <SortControl
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
              options={sortOptions}
            />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Carregando clientes...</p>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-700 border-b border-gray-200 dark:border-neutral-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">E-mail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Documento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {filteredClientes.map(cliente => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                    onClick={() => onRowClick(cliente)}
                    title="Clique para ver credenciais de acesso"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                          {cliente.nome.charAt(0).toUpperCase()}
                        </div>
                        {cliente.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{cliente.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{cliente.whatsapp || (cliente as any).telefone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {cliente.documento || '-'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contador */}
      {filteredClientes.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Exibindo {filteredClientes.length} de {clientes.length} clientes
        </div>
      )}
    </div>
  )
}

function ContratosPage({
  contratos,
  onShowGeracaoContrato,
  onSetContratoParaAssinar
}: {
  contratos: Contrato[]
  onShowGeracaoContrato: () => void
  onSetContratoParaAssinar: (contrato: Contrato) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contratos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie contratos e assinaturas digitais</p>
        </div>
        <button
          onClick={onShowGeracaoContrato}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Contrato
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
        {contratos.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhum contrato criado ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-neutral-700">
            {contratos.map(contrato => (
              <div key={contrato.id} className="p-6 hover:bg-gray-50 dark:hover:bg-neutral-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{contrato.titulo}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{contrato.cliente?.nome}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Valor: <strong className="text-gray-900 dark:text-white">R$ {contrato.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </span>
                      <Badge variant={
                        contrato.status === 'assinado' ? 'success' :
                          contrato.status === 'aguardando_assinatura' ? 'warning' :
                            contrato.status === 'rascunho' ? 'secondary' :
                              'destructive'
                      }>
                        {contrato.status}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => onSetContratoParaAssinar(contrato)}
                    disabled={contrato.status === 'assinado' || contrato.status === 'cancelado'}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <PenTool className="h-4 w-4" />
                    Assinar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


function RequerimentosPage({
  requerimentos,
  onShowRequerimento
}: {
  requerimentos: Requerimento[]
  onShowRequerimento: () => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Requerimentos ao Superadmin</h1>
          <p className="text-gray-600 dark:text-gray-400">Envie solicitações e acompanhe status</p>
        </div>
        <button
          onClick={onShowRequerimento}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Requerimento
        </button>
      </div>

      {requerimentos.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Nenhum requerimento enviado ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requerimentos.map(req => (
            <div
              key={req.id}
              className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Header com Badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Badge variant={
                    req.status === 'aprovado' ? 'success' :
                      req.status === 'pendente' ? 'warning' :
                        'destructive'
                  }>
                    {req.status}
                  </Badge>
                </div>
                <div className={`p-2 rounded-lg ${req.tipo === 'aprovacao_contrato' ? 'bg-blue-50 dark:bg-blue-500/10' :
                  req.tipo === 'ajuste_valor' ? 'bg-purple-50 dark:bg-purple-500/10' :
                    req.tipo === 'cancelamento' ? 'bg-red-50 dark:bg-red-500/10' :
                      'bg-gray-50 dark:bg-gray-500/10'
                  }`}>
                  <AlertCircle className={`h-5 w-5 ${req.tipo === 'aprovacao_contrato' ? 'text-blue-600 dark:text-blue-400' :
                    req.tipo === 'ajuste_valor' ? 'text-purple-600 dark:text-purple-400' :
                      req.tipo === 'cancelamento' ? 'text-red-600 dark:text-red-400' :
                        'text-gray-600 dark:text-gray-400'
                    }`} />
                </div>
              </div>

              {/* Título */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {req.titulo}
              </h3>

              {/* Tipo */}
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 uppercase tracking-wide">
                {req.tipo.replace(/_/g, ' ')}
              </p>

              {/* Descrição */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
                {req.descricao}
              </p>

              {/* Resposta do Admin */}
              {req.resposta_admin && (
                <div className="mt-auto p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-100 dark:border-blue-500/20">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Resposta do Admin:
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200 line-clamp-2">
                    {req.resposta_admin}
                  </p>
                </div>
              )}

              {/* Data */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-700">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(req.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Comercial() {
  const { activeProfile } = useAuth()

  // Modals
  const [showCadastroCliente, setShowCadastroCliente] = useState(false)
  const [showGeracaoContrato, setShowGeracaoContrato] = useState(false)
  const [showRequerimento, setShowRequerimento] = useState(false)
  const [contratoParaAssinar, setContratoParaAssinar] = useState<Contrato | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedClientDetail, setSelectedClientDetail] = useState<any | null>(null)
  const [clientCredentials, setClientCredentials] = useState<any | null>(null)
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false)

  // Data states
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [clientesData, processosData, requerimentosData] = await Promise.all([
          comercialService.getAllClientes(),
          comercialService.getAllProcessos(),
          comercialService.getAllRequerimentos()
        ])

        // Clientes filtrados (sem leads)
        setClientes(clientesData.filter((c: any) => c.status === 'cliente'))

        // Contratos vindos de processos
        setContratos(processosData.map((p: any) => ({
          id: p.id,
          cliente_id: p.cliente_id,
          titulo: p.tipo_servico,
          descricao: '',
          valor: 0,
          status: p.status,
          template_tipo: 'outro',
          conteudo_html: '',
          cliente: {
            id: p.cliente_id,
            nome: p.clientes?.nome || 'Cliente'
          },
          created_at: p.criado_em,
          updated_at: p.atualizado_em
        })))

        // Requerimentos reais
        setRequerimentos(requerimentosData.map((r: any) => ({
          id: r.id,
          comercial_usuario_id: r.criador_id || '',
          titulo: r.tipo,
          tipo: r.tipo,
          descricao: r.observacoes || '',
          status: r.status,
          created_at: r.criado_em,
          updated_at: r.atualizado_em
        })))

      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])

  const fetchAgendamentos = async () => {
    if (!activeProfile?.id) return

    try {
      const [data, catalog] = await Promise.all([
        comercialService.getAgendamentosByUsuario(activeProfile.id),
        catalogService.getCatalogServices().catch(() => [])
      ])

      const catalogMap = new Map(catalog.map((s: any) => [s.id, s.nome || s.name]))

      const mapped = data.map((b: any) => {
        // Formatação universal isolada em utilitário coberto por teste para prevenir shifts de +3h
        const { dataStr, horaStr } = extractLocalTimeMapping(b.data_hora);

        return {
          id: b.id,
          cliente_id: b.cliente_id || '',
          cliente: {
            id: b.cliente_id || '',
            client_id: b.cliente?.client_id || '',
            nome: b.nome || 'Cliente sem nome',
            email: b.email || '',
            telefone: b.telefone || '',
            documento: '',
            created_at: b.created_at,
            updated_at: b.updated_at
          },
          data: dataStr,
          hora: horaStr,
          duracao_minutos: b.duracao_minutos || 60,
          produto: catalogMap.get(b.produto_id) || b.produto_id || 'Serviço',
          produto_id: b.produto_id || '',
          status: b.status as any,
          cliente_is_user: b.cliente_is_user,
          pagamento_status: b.pagamento_status || null,
          comprovante_url: b.comprovante_url || null,
          conflito_horario: b.conflito_horario || false,
          created_at: b.created_at,
          updated_at: b.updated_at
        }
      })
      setAgendamentos(mapped)
    } catch (err) {
      console.error("Erro ao carregar agendamentos reais:", err)
    }
  }

  useEffect(() => {
    fetchAgendamentos()
  }, [activeProfile?.id])

  const [contratos, setContratos] = useState<Contrato[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [requerimentos, setRequerimentos] = useState<Requerimento[]>([])

  // Handlers
  const handleSaveCliente = async (clienteData: ClienteFormData) => {
    try {
      const response = await comercialService.register(clienteData)
      const novoCliente: Cliente = {
        ...response,
        created_at: response.criado_em || new Date().toISOString(),
        updated_at: response.atualizado_em || new Date().toISOString(),
      }
      setClientes(prev => [novoCliente, ...prev])
      return response // Retorna a resposta completa incluindo loginInfo
    } catch (err: any) {
      console.error('Erro ao salvar cliente:', err)
      throw err
    }
  }

  const handleSaveContrato = async (contratoData: ContratoFormData) => {
    // TODO: Integrar com backend
    const novoContrato: Contrato = {
      id: Math.random().toString(36).substring(7),
      ...contratoData,
      status: 'rascunho',
      cliente: clientes.find(c => c.id === contratoData.cliente_id),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setContratos(prev => [...prev, novoContrato])
  }


  const handleSaveRequerimento = async (reqData: RequerimentoFormData) => {
    // TODO: Integrar com backend
    const novoRequerimento: Requerimento = {
      id: Math.random().toString(36).substring(7),
      ...reqData,
      comercial_usuario_id: 'usuario-atual-id',
      status: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setRequerimentos(prev => [...prev, novoRequerimento])
  }

  const handleAssinarContrato = async (contratoId: string, assinadoPor: string, tipo: 'cliente' | 'empresa') => {
    // TODO: Integrar com backend para salvar assinatura digital
    console.log('Assinando contrato:', { contratoId, assinadoPor, tipo })

    setContratos(prev => prev.map(c =>
      c.id === contratoId
        ? { ...c, status: 'assinado' as const }
        : c
    ))
  }

  const handleSaveLead = async (leadData: LeadFormData) => {
    // TODO: Integrar com backend
    const novoLead: Lead = {
      id: Math.random().toString(36).substring(7),
      ...leadData,
      status: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setLeads(prev => [...prev, novoLead])
    toast.success('Lead cadastrado com sucesso!', 3)
  }

  // Configuração da sidebar (C1 nao ve Assessoria nem Contratos)
  const nivel = activeProfile?.nivel || 'C1'
  const isC1 = nivel === 'C1'

  const isSupervisor = activeProfile?.is_supervisor || false

  const isC2 = nivel === 'C2' || activeProfile?.role === 'super_admin'

  const sidebarItems = [
    { label: 'Dashboard', to: '/comercial', icon: Home },
    { label: 'DNA do Cliente', to: '/comercial/dna', icon: Dna },
    { label: 'Leads', to: '/comercial/leads', icon: Users },
    ...(!isSupervisor ? [
      { label: 'Servicos', to: '/comercial/servicos', icon: FileText },
      { label: 'Meus Agendamentos', to: '/comercial/meus-agendamentos', icon: Calendar },
      { label: 'Assessoria Direta', to: '/comercial/assessoria-direta', icon: ClipboardCheck },
    ] : []),
    { label: 'Minhas Comissoes', to: '/comercial/comissoes', icon: DollarSign },
    ...(!isC1 && !isSupervisor ? [
      { label: 'Contratos', to: '/comercial/contratos', icon: FileText },
    ] : []),
    ...(isC2 && !isSupervisor ? [
      { label: 'Pos-Consultoria', to: '/comercial/pos-consultoria', icon: ClipboardCheck },
    ] : []),
  ]

  const sidebarGroups: SidebarGroup[] = [
    {
      label: 'Menu Principal',
      items: sidebarItems,
    },
    ...(isSupervisor ? [{
      label: 'Supervisão',
      items: [
        { label: 'Minha Equipe', to: '/comercial/supervisor', icon: Users },
      ],
    }] : []),
  ]

  const toast = useToast()

  const handleShowGeracaoContrato = () => {
    console.log('Iniciando criacao de contrato...')
    console.log(toast.info('hahahah', 10))
    toast.info('Iniciando criação de contrato...', 10)
    setShowGeracaoContrato(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar groups={sidebarGroups} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Hamburger toggle button - fixed in header for mobile */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                clientes={clientes}
                contratos={contratos}
                requerimentos={requerimentos}
                agendamentos={agendamentos}
                onShowCadastroCliente={() => setShowCadastroCliente(true)}
                onSaveLead={handleSaveLead}
                leads={leads}
              />
            }
          />
          <Route
            path="/agendamento"
            element={<Comercial1 />}
          />
          <Route
            path="/agendamento/:id"
            element={<AgendamentoEditPage />}
          />
          <Route
            path="/meus-agendamentos"
            element={<AgendamentosPage agendamentos={agendamentos} onRefresh={fetchAgendamentos} />}
          />

          <Route
            path="/clientes"
            element={
              <ClientesPage
                onShowCadastroCliente={() => setShowCadastroCliente(true)}
                onRowClick={async (c) => {
                  setClientCredentials(null)
                  setSelectedClientDetail(c)
                  setIsLoadingCredentials(true)
                  try {
                    const creds = await comercialService.getClienteCredentials(c.email!)
                    setClientCredentials(creds)
                  } catch (e) {
                    console.error(e)
                    setClientCredentials({ email: c.email, password: 'Erro ao recuperar' })
                  } finally {
                    setIsLoadingCredentials(false)
                  }
                }}
              />
            }
          />
          <Route
            path="/leads"
            element={<LeadsPage />}
          />
          <Route
            path="/ganhos"
            element={<GanhosPage />}
          />
          <Route
            path="/comissoes"
            element={<ComissaoColaborador />}
          />
          <Route
            path="/contratos"
            element={<ContratosFixosPage />}
          />
          <Route
            path="/contratos/:id"
            element={<ContratoServicoDetailPage />}
          />
          <Route
            path="/contratos/assessoria/:id"
            element={<FormularioAssessoriaPage />}
          />
          <Route
            path="/servicos"
            element={<ServicosComerciais />}
          />
          <Route
            path="/selecao-lead-cliente"
            element={<SelecaoLeadCliente />}
          />
          <Route path="/dna" element={<ClientDNAPage />} />
          {isSupervisor && (
            <Route path="/supervisor" element={<SupervisorComercialPage />} />
          )}
          <Route path="/assessoria-direta" element={<AssessoriaDiretaPage />} />
          {isC2 && (
            <Route path="/pos-consultoria" element={<PosConsultoria />} />
          )}
          <Route path="*" element={<Navigate to="/comercial" replace />} />
        </Routes>
      </main>

      {/* Modals */}
      {showCadastroCliente && (
        <CadastroCliente
          onClose={() => setShowCadastroCliente(false)}
          onSave={handleSaveCliente}
        />
      )}

      {selectedClientDetail && (
        <CadastroCliente
          onClose={() => {
            setSelectedClientDetail(null)
            setClientCredentials(null)
          }}
          onSave={handleSaveCliente}
          initialData={selectedClientDetail}
          initialSuccessData={clientCredentials ? {
            loginInfo: {
              email: clientCredentials.email,
              password: clientCredentials.password || 'Não disponível'
            }
          } : isLoadingCredentials ? {
            loginInfo: {
              email: selectedClientDetail.email,
              password: 'Carregando...'
            }
          } : null}
        />
      )}

      {showGeracaoContrato && (
        <GeracaoContratoNovo
          onClose={() => setShowGeracaoContrato(false)}
          onSave={handleSaveContrato}
          clientes={clientes}
        />
      )}


      {showRequerimento && (
        <RequerimentoSuperadmin
          onClose={() => setShowRequerimento(false)}
          onSave={handleSaveRequerimento}
        />
      )}

      {contratoParaAssinar && (
        <AssinaturaDigital
          contrato={contratoParaAssinar}
          onClose={() => setContratoParaAssinar(null)}
          onAssinar={handleAssinarContrato}
        />
      )}

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
