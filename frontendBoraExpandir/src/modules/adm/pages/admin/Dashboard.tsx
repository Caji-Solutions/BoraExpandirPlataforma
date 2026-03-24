import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/modules/shared/components/ui/card";
import { Users, FileText, TrendingUp, Activity, Calendar, ExternalLink, CheckCircle, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";

export default function Dashboard() {
  const { activeProfile } = useAuth();
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState("");
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);

  useEffect(() => {
    if (activeProfile?.id) {
      checkCalendarConnection();
    }
  }, [activeProfile?.id]);

  const checkCalendarConnection = async () => {
    try {
      setIsLoadingCalendar(true);
      const url = `${import.meta.env.VITE_URL_BACKEND || 'http://localhost:4000'}/api/calendar/status?userId=${activeProfile?.id}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.isConnected) {
         setIsCalendarConnected(true);
         setCalendarEmail(data.connection?.email || 'Google Calendar Integrado');
      } else {
         setIsCalendarConnected(false);
      }
    } catch (e) {
      console.error(e);
      setIsCalendarConnected(false);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Deseja desconectar sua conta do Google Calendar?")) return;
    try {
      setIsLoadingCalendar(true);
      const url = `${import.meta.env.VITE_URL_BACKEND || 'http://localhost:4000'}/api/calendar/disconnect?userId=${activeProfile?.id}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setIsCalendarConnected(false);
        setCalendarEmail("");
      } else {
        alert("Erro ao desconectar: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao remover a desconexão");
    } finally {
      setIsLoadingCalendar(false);
    }
  };
  
  const stats = [
    {
      title: "Usuários Ativos",
      value: "24",
      change: "+3 este mês",
      icon: Users,
      color: "text-role-sales",
    },
    {
      title: "Processos em Andamento",
      value: "142",
      change: "+12 esta semana",
      icon: FileText,
      color: "text-status-info",
    },
    {
      title: "Taxa de Sucesso",
      value: "94.2%",
      change: "+2.1% vs mês anterior",
      icon: TrendingUp,
      color: "text-status-success",
    },
    {
      title: "Atividade Hoje",
      value: "38",
      change: "ações registradas",
      icon: Activity,
      color: "text-status-warning",
    },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
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
        ))}
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
            {[
              { user: "Dra. Ana Silva", action: "atualizou documento", time: "2 min atrás" },
              { user: "Carlos Santos", action: "criou novo cliente", time: "15 min atrás" },
              { user: "Marina Costa", action: "finalizou processo", time: "1 hora atrás" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
