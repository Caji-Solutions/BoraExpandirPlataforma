import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card';
import { TrendingUp, DollarSign, AlertTriangle, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { admService, FluxoCaixaItem, DashboardStats } from "../../services/admService";

export default function CockpitDoDoNo() {
  const [chartData, setChartData] = useState<FluxoCaixaItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fluxo, dashboardStats] = await Promise.all([
        admService.getFluxoCaixa(6),
        admService.getDashboardStats()
      ]);
      setChartData(fluxo);
      setStats(dashboardStats);
    } catch (error) {
      console.error('Erro ao carregar dados do cockpit:', error);
    } finally {
      setLoading(false);
    }
  };

  const lucroEst = stats ? (stats.faturamento.atual - stats.comissoes.aRealizar) : 0;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cockpit do Dono</h1>
        <p className="text-muted-foreground mt-2">
          Visão executiva de lucratividade e riscos operacionais
        </p>
      </div>

      {/* Top Row - Profitability Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Lucro Líquido (Est.)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-status-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `R$ ${lucroEst.toLocaleString('pt-BR')}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receita menos comissões e custos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Contas a Receber
            </CardTitle>
            <DollarSign className="h-4 w-4 text-status-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `R$ ${stats?.contas_receber.toLocaleString('pt-BR')}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Faturas pendentes de clientes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Processos em Risco (SLA)
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-error">5</div>
            <p className="text-xs text-muted-foreground mt-1">
              Atenção necessária
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Receita vs Despesas Operacionais</CardTitle>
          <p className="text-sm text-muted-foreground">
            Últimos 6 meses - Análise de fluxo financeiro
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#374151' }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#374151' }}
                stroke="#9ca3af"
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="receita" 
                stroke="#1e3a8a" 
                strokeWidth={3}
                name="Receita"
                dot={{ r: 5, fill: '#1e3a8a', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
              <Line 
                type="monotone" 
                dataKey="despesas" 
                stroke="#ef4444" 
                strokeWidth={3}
                name="Despesas"
                dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
