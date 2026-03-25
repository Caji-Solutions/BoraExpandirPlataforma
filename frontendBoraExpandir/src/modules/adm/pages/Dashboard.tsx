import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/modules/shared/components/ui/card';
import { Users, FileText, TrendingUp, Activity } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      title: "Usuários Ativos",
      value: "24",
      change: "+3 este mês",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Processos em Andamento",
      value: "142",
      change: "+12 esta semana",
      icon: FileText,
      color: "text-blue-500",
    },
    {
      title: "Taxa de Sucesso",
      value: "94.2%",
      change: "+2.1% vs mês anterior",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Atividade Hoje",
      value: "38",
      change: "ações registradas",
      icon: Activity,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Mestre</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral do sistema e métricas principais
        </p>
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
