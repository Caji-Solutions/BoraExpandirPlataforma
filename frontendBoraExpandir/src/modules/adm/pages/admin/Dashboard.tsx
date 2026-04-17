import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared/components/ui/card';
import { Users, FileText, TrendingUp, Activity, Calendar, ExternalLink, CheckCircle, LogOut, Loader2, DollarSign } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";
import { admService, DashboardStats } from "../../services/admService";

export default function Dashboard() {
  const { activeProfile } = useAuth();
  const location = useLocation();
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState("");
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (activeProfile?.id) {
      checkCalendarConnection();
      loadStats();
    }
  }, [activeProfile?.id, location.pathname]);

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await admService.getDashboardStats();
      setStatsData(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const checkCalendarConnection = async () => {
    try {
      setIsLoadingCalendar(true);
      const url = `${import.meta.env.VITE_URL_BACKEND || 'http://localhost:4000'}/api/calendar/status?userId=${activeProfile?.id}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Falha ao verificar conexão (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (data?.success === true && data?.isConnected === true) {
         setIsCalendarConnected(true);
         setCalendarEmail(data.connection?.email || 'Google Calendar Integrado');
      } else {
         setIsCalendarConnected(false);
         setCalendarEmail("");
      }
    } catch (e) {
      console.error(e);
      setIsCalendarConnected(false);
      setCalendarEmail("");
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const handleDisconnect = async () => {
    if (!activeProfile?.id) {
      alert("Usuário não identificado para desconexão.");
      return;
    }

    if (!window.confirm("Deseja desconectar sua conta do Google Calendar?")) return;

    try {
      setIsLoadingCalendar(true);
      const url = `${import.meta.env.VITE_URL_BACKEND || 'http://localhost:4000'}/api/calendar/disconnect?userId=${activeProfile?.id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(`Falha na desconexão (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (data?.success === true) {
        setIsCalendarConnected(false);
        setCalendarEmail("");
        await checkCalendarConnection();
      } else {
        setIsCalendarConnected(false);
        setCalendarEmail("");
        alert("Erro ao desconectar: " + (data?.message || data?.error || 'Erro desconhecido'));
      }
    } catch (e: any) {
      console.error(e);
      alert("Erro ao remover a conexão: " + (e?.message || 'Erro desconhecido'));
    } finally {
      setIsLoadingCalendar(false);
    }
  };
  
  const stats = [
    {
      title: "Novos Clientes",
      value: statsData?.novos_clientes.atual.toString() || "0",
      change: `+${statsData?.novos_clientes.atual || 0} este mês`,
      icon: Users,
      color: "text-role-sales",
    },
    {
      title: "Processos Ativos",
      value: (statsData?.processos_ativos || 0).toString(),
      change: "Em andamento",
      icon: FileText,
      color: "text-status-info",
    },
    {
      title: "Faturamento",
      value: `R$ ${(statsData?.faturamento.atual || 0).toLocaleString('pt-BR')}`,
      change: "Dados financeiros",
      icon: DollarSign,
      color: "text-status-success",
    },
    {
      title: "Comissões a Pagar",
      value: `R$ ${(statsData?.comissoes.aRealizar || 0).toLocaleString('pt-BR')}`,
      change: "Pendentes",
      icon: Activity,
      color: "text-status-warning",
    },
  ];

  const recentActivity = statsData?.recent_activity || [];

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Mestre</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral do sistema e métricas principais
          </p>
        </div>
        
        {isLoadingCalendar ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Verificando...</span>
          </div>
        ) : isCalendarConnected ? (
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 text-sm font-medium rounded-lg">
              <CheckCircle className="h-4 w-4" />
              {calendarEmail}
            </div>
            <button
              onClick={handleDisconnect}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
              title="Desconectar Calendar"
            >
              <LogOut className="h-4 w-4" />
              Desconectar
            </button>
          </div>
        ) : (
          <a 
            href={`${import.meta.env.VITE_URL_BACKEND || 'http://localhost:4000'}/api/calendar/connect?userId=${activeProfile?.id}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Calendar className="h-4 w-4" />
            Conectar Google Calendar
            <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card border-border animate-pulse">
              <CardHeader className="h-12" />
              <CardContent className="h-20" />
            </Card>
          ))
        ) : (
          stats.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Atividade Recente</CardTitle>
          <CardDescription className="text-muted-foreground">
            Últimas ações no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatActivityTime(activity.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade recente registrada.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
