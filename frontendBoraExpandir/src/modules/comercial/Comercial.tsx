import { useState, useMemo, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from '../../components/ui/Sidebar'
import type { SidebarGroup } from '../../components/ui/Sidebar'
import DashboardVendas from './DashboardVendas'
import CadastroCliente from './CadastroCliente'
import GeracaoContratoNovo from './GeracaoContratoNovo'
import RequerimentoSuperadmin from './RequerimentoSuperadmin'
import AssinaturaDigital from './AssinaturaDigital'
import Comercial1 from './Comercial1'
import LeadsPage from './Leads'
import AgendamentosPage from './Agendamentos'
import GanhosPage from './Ganhos'
import ProximosAgendamentosCard from './components/ProximosAgendamentosCard'
import CadastroRapidoLeadCard from './components/CadastroRapidoLeadCard'
import { Config } from '../../components/ui/Config'
import { Plus, Home, Users, FileText, CreditCard, AlertCircle, PenTool, CheckCircle, Calendar, Settings, Search, Filter, X, DollarSign, Dna } from 'lucide-react'
import { ClientDNAPage } from '../../components/ui/ClientDNA'
import { TimeRangeFilter, filterByTimeRange, type TimeRange } from '../../components/ui/TimeRangeFilter'
import { SortControl, sortData, type SortDirection, type SortOption } from '../../components/ui/SortControl'
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

} from '../../types/comercial'
import Toast, { useToast, ToastContainer } from '../../components/ui/Toast'
import { Badge } from '../../components/ui/Badge'
import comercialService from './services/comercialService'

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
  return (
    <div>
      <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">Dashboard Comercial</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Visão geral das atividades comerciais</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Clientes</h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{clientes.length}</p>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Contratos Ativos</h3>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {contratos.filter(c => c.status === 'assinado').length}
          </p>
        </div>


        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Requerimentos</h3>
            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {requerimentos.filter(r => r.status === 'pendente').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProximosAgendamentosCard agendamentos={agendamentos} />
        <CadastroRapidoLeadCard onSaveLead={onSaveLead} />
      </div>
    </div>
  )
}

function ClientesPage({
  clientes,
  onShowCadastroCliente
}: {
  clientes: Cliente[]
  onShowCadastroCliente: () => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [timeRange, setTimeRange] = useState<TimeRange>('current_month')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)

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
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.documento?.toLowerCase().includes(searchTerm.toLowerCase())
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
        {filteredClientes.length === 0 ? (
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
                  <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{cliente.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{cliente.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{cliente.telefone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{cliente.documento}</td>
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

import { useAuth } from '../../contexts/AuthContext'

export default function Comercial() {
  const { activeProfile } = useAuth()

  // Modals
  const [showCadastroCliente, setShowCadastroCliente] = useState(false)
  const [showGeracaoContrato, setShowGeracaoContrato] = useState(false)
  const [showRequerimento, setShowRequerimento] = useState(false)
  const [contratoParaAssinar, setContratoParaAssinar] = useState<Contrato | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data states
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClientes() {
      try {
        setLoading(true)
        const data = await comercialService.getAllClientes()
        setClientes(data)
      } catch (err) {
        console.error("Erro ao carregar clientes reais:", err);
      } finally {
        setLoading(false)
      }
    }
    fetchClientes()
  }, [])

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])

  useEffect(() => {
    async function fetchAgendamentos() {
      if (!activeProfile?.id) return

      try {
        const data = await comercialService.getAgendamentosByUsuario(activeProfile.id)
        const mapped = data.map((b: any) => ({
          id: b.id,
          cliente_id: b.cliente_id || '',
          cliente: {
            id: b.cliente_id || '',
            nome: b.nome || 'Cliente sem nome',
            email: b.email || '',
            telefone: b.telefone || '',
            documento: '',
            created_at: b.created_at,
            updated_at: b.updated_at
          },
          data: (b.data_hora || '').split('T')[0],
          hora: (b.data_hora || '').includes('T') ? b.data_hora.split('T')[1].substring(0, 5) : '00:00',
          duracao_minutos: b.duracao_minutos || 60,
          produto: b.produto_id || 'Serviço',
          status: b.status as any,
          created_at: b.created_at,
          updated_at: b.updated_at
        }))
        setAgendamentos(mapped)
      } catch (err) {
        console.error("Erro ao carregar agendamentos reais:", err)
      }
    }
    fetchAgendamentos()
  }, [activeProfile?.id])

  const [contratos, setContratos] = useState<Contrato[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [requerimentos, setRequerimentos] = useState<Requerimento[]>([])

  // Handlers
  const handleSaveCliente = async (clienteData: ClienteFormData) => {
    // TODO: Integrar com backend
    const novoCliente: Cliente = {
      id: Math.random().toString(36).substring(7),
      ...clienteData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setClientes(prev => [...prev, novoCliente])
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

  // Configuração da sidebar
  const sidebarGroups: SidebarGroup[] = [
    {
      label: 'Menu Principal',
      items: [
        { label: 'Dashboard', to: '/comercial', icon: Home },
        { label: 'DNA do Cliente', to: '/comercial/dna', icon: Dna },
        { label: 'Agendamento', to: '/comercial/agendamento', icon: Calendar },
        { label: 'Meus Agendamentos', to: '/comercial/meus-agendamentos', icon: Calendar },
        { label: 'Clientes', to: '/comercial/clientes', icon: Users },
        { label: 'Leads', to: '/comercial/leads', icon: Users },
        { label: 'Ganhos', to: '/comercial/ganhos', icon: DollarSign },
        { label: 'Contratos', to: '/comercial/contratos', icon: FileText },
        { label: 'Requerimentos', to: '/comercial/requerimentos', icon: AlertCircle },
        { label: 'Configurações', to: '/comercial/configuracoes', icon: Settings },
      ],
    },
  ]

  const toast = useToast()

  const handleShowGeracaoContrato = () => {
    console.log('Iniciando criação de contrato...')
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
            path="/meus-agendamentos"
            element={<AgendamentosPage agendamentos={agendamentos} />}
          />

          <Route
            path="/clientes"
            element={
              <ClientesPage
                clientes={clientes}
                onShowCadastroCliente={() => setShowCadastroCliente(true)}
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
            path="/contratos"
            element={
              <ContratosPage
                contratos={contratos}
                onShowGeracaoContrato={() => setShowGeracaoContrato(true)}
                onSetContratoParaAssinar={setContratoParaAssinar}
              />
            }
          />
          <Route
            path="/requerimentos"
            element={
              <RequerimentosPage
                requerimentos={requerimentos}
                onShowRequerimento={() => setShowRequerimento(true)}
              />
            }
          />
          <Route
            path="/configuracoes"
            element={<Config />}
          />
          <Route path="/dna" element={<ClientDNAPage />} />
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
