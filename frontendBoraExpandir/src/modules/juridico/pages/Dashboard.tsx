import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card';
import { Badge } from '@/modules/shared/components/ui/badge';
import { Progress } from '@/modules/shared/components/ui/progress';
import {
  Scale,
  Users,
  CalendarCheck,
  Clock,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Video,
  User,
  Briefcase,
  Calendar,
  ChevronRight,
  Activity,
  BarChart3,
} from "lucide-react";
import juridicoService, { Processo } from "../services/juridicoService";
import { useAuth } from "../../../contexts/AuthContext";
import { parseBackendDate, formatHoraOnly } from "../../../utils/dateUtils";

// Helpers
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmado': return 'bg-emerald-500';
    case 'agendado': return 'bg-blue-500';
    case 'realizado': return 'bg-green-600';
    case 'cancelado': return 'bg-red-500';
    case 'pendente': return 'bg-amber-500';
    default: return 'bg-gray-400';
  }
};

const getStatusLabel = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmado': return 'Confirmado';
    case 'agendado': return 'Agendado';
    case 'realizado': return 'Realizado';
    case 'cancelado': return 'Cancelado';
    case 'pendente': return 'Pendente';
    case 'em_andamento': return 'Em Andamento';
    case 'concluido': return 'Concluido';
    default: return status || 'N/A';
  }
};

const getProcessStatusBadge = (status: string) => {
  const s = status?.toLowerCase();
  switch (s) {
    case 'concluido': return <Badge className="bg-green-100 text-green-700 border-none text-[10px]">Concluido</Badge>;
    case 'em_andamento': case 'preparando': case 'analise':
      return <Badge className="bg-amber-100 text-amber-700 border-none text-[10px]">Em Andamento</Badge>;
    case 'cancelado': return <Badge className="bg-red-100 text-red-700 border-none text-[10px]">Cancelado</Badge>;
    case 'clientes_c2': return <Badge className="bg-slate-100 text-slate-700 border-none text-[10px]">Pos Consultoria</Badge>;
    default: return <Badge className="bg-blue-100 text-blue-700 border-none text-[10px]">{getStatusLabel(s)}</Badge>;
  }
};

export function Dashboard() {
  const { activeProfile } = useAuth();
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<Processo[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = activeProfile?.role === 'super_admin';

  useEffect(() => {
    async function fetchData() {
      if (!activeProfile?.id) return;
      try {
        setLoading(true);
        const [procData, statsData, agData] = await Promise.all([
          isSuperAdmin
            ? juridicoService.getProcessos()
            : juridicoService.getProcessosByResponsavel(activeProfile.id),
          juridicoService.getEstatisticas(),
          isSuperAdmin
            ? juridicoService.getAgendamentos()
            : juridicoService.getAgendamentosByResponsavel(activeProfile.id),
        ]);
        setProcesses(procData);
        setStats(statsData);
        setAgendamentos(agData || []);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard juridico:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeProfile?.id, activeProfile?.role, isSuperAdmin]);

  // Computed data
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const agendamentosHoje = useMemo(() => {
    return agendamentos.filter(a => {
      if (!a.data_hora) return false;
      const d = parseBackendDate(a.data_hora);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return dStr === todayStr;
    }).sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
  }, [agendamentos, todayStr]);

  const proximosAgendamentos = useMemo(() => {
    return agendamentos
      .filter(a => {
        if (!a.data_hora) return false;
        const d = parseBackendDate(a.data_hora);
        return d >= today && a.status !== 'realizado' && a.status !== 'cancelado';
      })
      .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
      .slice(0, 5);
  }, [agendamentos, today]);

  const consultoriasRealizadas = agendamentos.filter(a => a.status === 'realizado').length;
  const consultoriasPendentes = agendamentos.filter(a => a.status === 'confirmado' || a.status === 'agendado' || a.status === 'pendente').length;

  const pipelineData = useMemo(() => {
    const stages = [
      { id: 'aguardando_consultoria', label: 'Aguardando Consultoria', color: 'bg-amber-500' },
      { id: 'em_consultoria', label: 'Em Consultoria', color: 'bg-yellow-500' },
      { id: 'clientes_c2', label: 'Pos Consultoria', color: 'bg-slate-500' },
      { id: 'aguardando_assessoria', label: 'Aguardando Assessoria', color: 'bg-green-500' },
      { id: 'assessoria_andamento', label: 'Assessoria em Andamento', color: 'bg-blue-500' },
      { id: 'assessoria_finalizada', label: 'Finalizado', color: 'bg-emerald-600' },
    ];
    const total = processes.length || 1;
    return stages.map(s => ({
      ...s,
      count: processes.filter(p => p.status === s.id).length,
      percent: Math.round((processes.filter(p => p.status === s.id).length / total) * 100),
    }));
  }, [processes]);

  const recentProcesses = useMemo(() => {
    return [...processes]
      .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
      .slice(0, 6);
  }, [processes]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-gray-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-gray-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
            {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
            {getGreeting()}, {activeProfile?.full_name?.split(' ')[0]}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-lg">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Sistema Operacional</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Scale className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Processos</span>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {isSuperAdmin ? (stats?.total || processes.length) : processes.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Total ativo</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Activity className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Andamento</span>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {isSuperAdmin
                ? (stats?.em_andamento || processes.filter(p => ['em_andamento', 'analise', 'preparando'].includes(p.status)).length)
                : processes.filter(p => ['em_andamento', 'analise', 'preparando'].includes(p.status)).length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Em progresso</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CalendarCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Realizadas</span>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">{consultoriasRealizadas}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Consultorias concluidas</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 lg:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pendentes</span>
            </div>
            <p className="text-3xl font-bold text-foreground tracking-tight">{consultoriasPendentes}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Aguardando atendimento</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Agendamentos + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">

        {/* Agendamentos de Hoje - 3 cols */}
        <Card className="lg:col-span-3 border border-gray-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm font-bold">Agendamentos de Hoje</CardTitle>
              </div>
              <button
                onClick={() => navigate('/juridico/meus-agendamentos')}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                Ver todos <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {agendamentosHoje.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CalendarCheck className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum agendamento para hoje</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Seus proximos compromissos aparecerao aqui</p>
              </div>
            ) : (
              <div className="space-y-2">
                {agendamentosHoje.map((ag, i) => {
                  const hora = ag.data_hora ? formatHoraOnly(parseBackendDate(ag.data_hora)) : '--:--';
                  const isRealizado = ag.status === 'realizado';
                  return (
                    <div
                      key={ag.id || i}
                      className={`flex items-center gap-4 p-3 rounded-xl border transition-all hover:shadow-sm cursor-pointer ${
                        isRealizado
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30'
                          : 'bg-gray-50 dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl ${
                        isRealizado ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        <span className="text-lg font-bold leading-none">{hora.split(':')[0]}</span>
                        <span className="text-[10px] font-medium opacity-80">{hora.split(':')[1]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{ag.nome || 'Cliente'}</p>
                          {isRealizado && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{ag.produto_nome || 'Consultoria'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {ag.meet_link && (
                          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <Video className="h-3 w-3 text-emerald-600" />
                          </div>
                        )}
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(ag.status)}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline de Clientes - 2 cols */}
        <Card className="lg:col-span-2 border border-gray-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-sm font-bold">Pipeline de Clientes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {pipelineData.map((stage) => (
              <div key={stage.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{stage.label}</span>
                  <span className="text-xs font-bold text-muted-foreground">{stage.count}</span>
                </div>
                <div className="relative h-2 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${stage.color}`}
                    style={{ width: `${Math.max(stage.percent, stage.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate('/juridico/dna')}
              className="w-full mt-2 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Users className="h-3.5 w-3.5" /> Ver DNA dos Clientes
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Proximas Consultas + Processos Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">

        {/* Proximas Consultas */}
        <Card className="border border-gray-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-sm font-bold">Proximas Consultas</CardTitle>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {proximosAgendamentos.length} agendada{proximosAgendamentos.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {proximosAgendamentos.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhuma consulta agendada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {proximosAgendamentos.map((ag, i) => {
                  const d = ag.data_hora ? parseBackendDate(ag.data_hora) : null;
                  return (
                    <div key={ag.id || i} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-neutral-800 last:border-0">
                      <div className="text-center w-12">
                        <p className="text-lg font-bold text-foreground leading-none">{d ? d.getDate() : '--'}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">
                          {d ? d.toLocaleDateString('pt-BR', { month: 'short' }) : ''}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-gray-200 dark:bg-neutral-700" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{ag.nome || 'Cliente'}</p>
                        <p className="text-[10px] text-muted-foreground">{d ? formatHoraOnly(d) : '--:--'} - {ag.produto_nome || 'Consultoria'}</p>
                      </div>
                      <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${getStatusColor(ag.status)}`} />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processos Recentes */}
        <Card className="border border-gray-200 dark:border-neutral-800 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600" />
                <CardTitle className="text-sm font-bold">Processos Recentes</CardTitle>
              </div>
              <button
                onClick={() => navigate('/juridico/processos')}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                Ver todos <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentProcesses.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhum processo encontrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentProcesses.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-neutral-800 last:border-0">
                    <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {(p as any).clientes?.nome || 'Cliente'}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {p.tipo_servico || 'Sem servico'} - {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {getProcessStatusBadge(p.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/juridico/meus-agendamentos')}
          className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-800/30 rounded-xl transition-all group"
        >
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Agendamentos</span>
          <ArrowRight className="h-3 w-3 text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          onClick={() => navigate('/juridico/dna')}
          className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/30 rounded-xl transition-all group"
        >
          <Users className="h-4 w-4 text-indigo-600" />
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">DNA Clientes</span>
          <ArrowRight className="h-3 w-3 text-indigo-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          onClick={() => navigate('/juridico/processos')}
          className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-950/40 border border-slate-200 dark:border-slate-800/30 rounded-xl transition-all group"
        >
          <FileText className="h-4 w-4 text-slate-600" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-400">Processos</span>
          <ArrowRight className="h-3 w-3 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          onClick={() => navigate('/juridico/tarefas')}
          className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-800/30 rounded-xl transition-all group"
        >
          <CheckCircle2 className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Tarefas</span>
          <ArrowRight className="h-3 w-3 text-amber-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}
