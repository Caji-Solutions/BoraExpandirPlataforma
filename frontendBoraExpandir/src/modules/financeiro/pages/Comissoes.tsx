import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared/components/ui/card';
import { Badge } from '@/modules/shared/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/modules/shared/components/ui/table";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  Building2, 
  Handshake,
  Filter,
  Search,
  Download,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TimeRangeFilter, TimeRange } from "@/components/ui/TimeRangeFilter";

// Tipos
type TipoComissionado = 'parceiro' | 'funcionario';
type StatusComissao = 'active' | 'inactive' | 'pending';

interface Comissionado {
  id: string;
  name: string;
  tipo: TipoComissionado;
  status: StatusComissao;
  cargo?: string; // Para funcionários
  departamento?: string; // Para funcionários
  totalReferrals: number;
  lastMonthReferrals: number;
  totalCommission: number;
  lastMonthCommission: number;
  pendingCommission: number;
  email: string;
  joinDate: string;
}

// Mock Data - Parceiros
const mockParceiros: Comissionado[] = [
  {
    id: "p1",
    name: "Dr. Carlos Mendes",
    tipo: "parceiro",
    status: "active",
    totalReferrals: 45,
    lastMonthReferrals: 8,
    totalCommission: 67500.0,
    lastMonthCommission: 12000.0,
    pendingCommission: 4500.0,
    email: "carlos.mendes@example.com",
    joinDate: "2024-01-15",
  },
  {
    id: "p2",
    name: "Dra. Maria Silva",
    tipo: "parceiro",
    status: "active",
    totalReferrals: 62,
    lastMonthReferrals: 12,
    totalCommission: 93000.0,
    lastMonthCommission: 18000.0,
    pendingCommission: 7500.0,
    email: "maria.silva@example.com",
    joinDate: "2023-08-20",
  },
  {
    id: "p3",
    name: "João Pedro Santos",
    tipo: "parceiro",
    status: "active",
    totalReferrals: 28,
    lastMonthReferrals: 5,
    totalCommission: 42000.0,
    lastMonthCommission: 7500.0,
    pendingCommission: 3000.0,
    email: "joao.santos@example.com",
    joinDate: "2024-03-10",
  },
  {
    id: "p4",
    name: "Ana Paula Costa",
    tipo: "parceiro",
    status: "inactive",
    totalReferrals: 15,
    lastMonthReferrals: 0,
    totalCommission: 22500.0,
    lastMonthCommission: 0,
    pendingCommission: 0,
    email: "ana.costa@example.com",
    joinDate: "2023-11-05",
  },
  {
    id: "p5",
    name: "Roberto Almeida",
    tipo: "parceiro",
    status: "pending",
    totalReferrals: 3,
    lastMonthReferrals: 3,
    totalCommission: 0,
    lastMonthCommission: 0,
    pendingCommission: 4500.0,
    email: "roberto.almeida@example.com",
    joinDate: "2024-10-28",
  },
];

// Mock Data - Funcionários Internos
const mockFuncionarios: Comissionado[] = [
  {
    id: "f1",
    name: "Lucas Oliveira",
    tipo: "funcionario",
    status: "active",
    cargo: "Consultor Comercial",
    departamento: "Vendas",
    totalReferrals: 85,
    lastMonthReferrals: 15,
    totalCommission: 127500.0,
    lastMonthCommission: 22500.0,
    pendingCommission: 8500.0,
    email: "lucas.oliveira@empresa.com",
    joinDate: "2022-05-10",
  },
  {
    id: "f2",
    name: "Fernanda Lima",
    tipo: "funcionario",
    status: "active",
    cargo: "Gerente de Contas",
    departamento: "Comercial",
    totalReferrals: 120,
    lastMonthReferrals: 18,
    totalCommission: 180000.0,
    lastMonthCommission: 27000.0,
    pendingCommission: 12000.0,
    email: "fernanda.lima@empresa.com",
    joinDate: "2021-02-15",
  },
  {
    id: "f3",
    name: "Ricardo Souza",
    tipo: "funcionario",
    status: "active",
    cargo: "Analista de Negócios",
    departamento: "Vendas",
    totalReferrals: 55,
    lastMonthReferrals: 10,
    totalCommission: 82500.0,
    lastMonthCommission: 15000.0,
    pendingCommission: 6000.0,
    email: "ricardo.souza@empresa.com",
    joinDate: "2023-01-20",
  },
  {
    id: "f4",
    name: "Camila Ferreira",
    tipo: "funcionario",
    status: "pending",
    cargo: "Consultora Jr.",
    departamento: "Vendas",
    totalReferrals: 12,
    lastMonthReferrals: 4,
    totalCommission: 0,
    lastMonthCommission: 0,
    pendingCommission: 6000.0,
    email: "camila.ferreira@empresa.com",
    joinDate: "2024-10-01",
  },
];

// Combinar todos
const allComissionados = [...mockParceiros, ...mockFuncionarios];

const getStatusBadge = (status: StatusComissao) => {
  const variants = {
    active: { label: "Ativo", variant: "success" as const },
    inactive: { label: "Inativo", variant: "secondary" as const },
    pending: { label: "Pendente", variant: "warning" as const },
  } as const;

  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getTipoBadge = (tipo: TipoComissionado) => {
  if (tipo === 'parceiro') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
        <Handshake className="h-3 w-3" />
        Parceiro
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
      <Building2 className="h-3 w-3" />
      Funcionário
    </span>
  );
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

type FiltroTipo = 'todos' | 'parceiros' | 'funcionarios';
type FiltroStatus = 'todos' | 'active' | 'inactive' | 'pending';

const Comissoes = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('current_month');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'todos' | 'parceiros' | 'funcionarios'>('todos');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar dados
  const dadosFiltrados = useMemo(() => {
    let data = allComissionados;

    // Filtrar por tipo (via tab)
    if (activeTab === 'parceiros') {
      data = data.filter(c => c.tipo === 'parceiro');
    } else if (activeTab === 'funcionarios') {
      data = data.filter(c => c.tipo === 'funcionario');
    }

    // Filtrar por status
    if (filtroStatus !== 'todos') {
      data = data.filter(c => c.status === filtroStatus);
    }

    // Filtrar por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.email.toLowerCase().includes(term)
      );
    }

    return data;
  }, [activeTab, filtroStatus, searchTerm]);

  // Estatísticas por tipo
  const statsParceiros = useMemo(() => {
    const parceiros = mockParceiros;
    return {
      total: parceiros.length,
      ativos: parceiros.filter(p => p.status === 'active').length,
      totalPago: parceiros.reduce((sum, p) => sum + p.totalCommission, 0),
      pendente: parceiros.reduce((sum, p) => sum + p.pendingCommission, 0),
      indicacoes: parceiros.reduce((sum, p) => sum + p.totalReferrals, 0),
    };
  }, []);

  const statsFuncionarios = useMemo(() => {
    const funcionarios = mockFuncionarios;
    return {
      total: funcionarios.length,
      ativos: funcionarios.filter(f => f.status === 'active').length,
      totalPago: funcionarios.reduce((sum, f) => sum + f.totalCommission, 0),
      pendente: funcionarios.reduce((sum, f) => sum + f.pendingCommission, 0),
      indicacoes: funcionarios.reduce((sum, f) => sum + f.totalReferrals, 0),
    };
  }, []);

  const statsGeral = useMemo(() => {
    return {
      totalPago: statsParceiros.totalPago + statsFuncionarios.totalPago,
      pendente: statsParceiros.pendente + statsFuncionarios.pendente,
      totalComissionados: statsParceiros.total + statsFuncionarios.total,
      indicacoesTotal: statsParceiros.indicacoes + statsFuncionarios.indicacoes,
    };
  }, [statsParceiros, statsFuncionarios]);

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Comissões</h2>
          <p className="text-muted-foreground mt-2">
            Gerencie comissões de parceiros e funcionários internos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-400' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-neutral-600 dark:text-gray-300 dark:hover:bg-neutral-800'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros - Colapsável */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Time Range Filter */}
            <div className="w-full md:w-48">
              <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
            </div>
            
            {/* Status Filter */}
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="inline h-4 w-4 mr-1" />
                Status
              </label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="todos">Todos</option>
                <option value="active">Ativos</option>
                <option value="pending">Pendentes</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Search className="inline h-4 w-4 mr-1" />
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
          
          {/* Botão Limpar Filtros */}
          {(filtroStatus !== 'todos' || searchTerm || timeRange !== 'current_month') && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
              <button
                onClick={() => {
                  setFiltroStatus('todos');
                  setSearchTerm('');
                  setTimeRange('current_month');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                ✕ Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards de Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-white/20">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-white/80 mb-1">Total Pago</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(statsGeral.totalPago)}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-white/20">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-white/80 mb-1">A Pagar</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(statsGeral.pendente)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-white/20">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-white/80 mb-1">Comissionados</p>
          <p className="text-2xl font-bold text-white">{statsGeral.totalComissionados}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-white/20">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-sm text-white/80 mb-1">Indicações Total</p>
          <p className="text-2xl font-bold text-white">{statsGeral.indicacoesTotal}</p>
        </div>
      </div>

      {/* Cards Comparativos: Parceiros vs Funcionários */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card Parceiros */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border-2 border-purple-200 dark:border-purple-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <Handshake className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Parceiros Externos</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{statsParceiros.ativos} ativos de {statsParceiros.total}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pago</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(statsParceiros.totalPago)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pendente</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(statsParceiros.pendente)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Indicações</p>
              <p className="text-lg font-bold text-purple-600">{statsParceiros.indicacoes}</p>
            </div>
          </div>
        </div>

        {/* Card Funcionários */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Funcionários Internos</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{statsFuncionarios.ativos} ativos de {statsFuncionarios.total}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pago</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(statsFuncionarios.totalPago)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pendente</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(statsFuncionarios.pendente)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Indicações</p>
              <p className="text-lg font-bold text-blue-600">{statsFuncionarios.indicacoes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex gap-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('todos')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'todos'
              ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Todos ({allComissionados.length})
        </button>
        <button
          onClick={() => setActiveTab('parceiros')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'parceiros'
              ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Handshake className="h-4 w-4" />
          Parceiros ({mockParceiros.length})
        </button>
        <button
          onClick={() => setActiveTab('funcionarios')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'funcionarios'
              ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Funcionários ({mockFuncionarios.length})
        </button>
      </div>

      {/* Tabela de Comissionados */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'todos' && 'Todos os Comissionados'}
            {activeTab === 'parceiros' && 'Parceiros Externos'}
            {activeTab === 'funcionarios' && 'Funcionários Internos'}
          </CardTitle>
          <CardDescription>
            {dadosFiltrados.length} registro(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Indicações</TableHead>
                <TableHead className="text-right">Total Recebido</TableHead>
                <TableHead className="text-right">Último Mês</TableHead>
                <TableHead className="text-right">A Receber</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dadosFiltrados.map((comissionado) => (
                <TableRow key={comissionado.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{comissionado.name}</span>
                      <span className="text-xs text-muted-foreground">{comissionado.email}</span>
                      {comissionado.cargo && (
                        <span className="text-xs text-blue-600">{comissionado.cargo}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTipoBadge(comissionado.tipo)}</TableCell>
                  <TableCell>{getStatusBadge(comissionado.status)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-semibold">{comissionado.totalReferrals}</span>
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {comissionado.lastMonthReferrals > 0 && (
                        <span className="text-xs text-green-600 flex items-center">
                          +{comissionado.lastMonthReferrals}
                          <ArrowUpRight className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(comissionado.totalCommission)}
                  </TableCell>
                  <TableCell className="text-right">
                    {comissionado.lastMonthCommission > 0 ? (
                      <span className="font-medium text-green-600">
                        {formatCurrency(comissionado.lastMonthCommission)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {comissionado.pendingCommission > 0 ? (
                      <span className="font-semibold text-amber-600">
                        {formatCurrency(comissionado.pendingCommission)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {dadosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum resultado encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Comissoes;
