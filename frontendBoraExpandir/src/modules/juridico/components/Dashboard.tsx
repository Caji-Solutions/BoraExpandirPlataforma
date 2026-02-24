import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from '../../../components/ui/Badge';
import { Clock, CheckCircle2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import juridicoService, { Processo } from "../services/juridicoService";
import { useAuth } from "../../../contexts/AuthContext";

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

function getStatusBadge(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'concluido':
      return <Badge variant="success">Concluído</Badge>;
    case 'em_andamento':
    case 'preparando':
    case 'analise':
      return <Badge variant="warning">Em Andamento</Badge>;
    case 'cancelado':
      return <Badge variant="destructive">Cancelado</Badge>;
    case 'pendente':
      return <Badge variant="warning">Pendente</Badge>;
    default:
      return <Badge variant="default">{statusLabels[s] || status}</Badge>;
  }
}

export function Dashboard() {
  const { activeProfile } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [sortOption, setSortOption] = useState<string>("data_desc");
  const [processes, setProcesses] = useState<Processo[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!activeProfile?.id) return;
      
      try {
        setLoading(true);
        const isSuperAdmin = activeProfile?.role === 'super_admin';
        
        const [procData, statsData] = await Promise.all([
          isSuperAdmin 
            ? juridicoService.getProcessos() 
            : juridicoService.getProcessosByResponsavel(activeProfile.id),
          juridicoService.getEstatisticas()
        ]);
        setProcesses(procData);
        setStats(statsData);
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard jurídico:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeProfile?.id, activeProfile?.role]);

  const kpiCards = useMemo(() => [
    { 
      title: "Total de Processos", 
      value: activeProfile?.role === 'super_admin' ? (stats?.total || processes.length) : processes.length, 
      color: "bg-blue-600" 
    },
    { 
      title: "Em Andamento", 
      value: activeProfile?.role === 'super_admin' 
        ? (stats?.em_andamento || processes.filter(p => p.status === 'em_andamento' || p.status === 'analise' || p.status === 'preparando').length)
        : processes.filter(p => p.status === 'em_andamento' || p.status === 'analise' || p.status === 'preparando').length, 
      color: "bg-amber-500" 
    },
    { 
      title: "Prazos Próximos", 
      value: activeProfile?.role === 'super_admin' ? (stats?.prazos_proximos || 0) : 0, 
      color: "bg-rose-500" 
    },
  ], [stats, processes, activeProfile?.role]);

  const filteredAndSorted = useMemo(() => {
    let list = processes.map(p => ({
        id: p.id,
        cliente: p.clientes?.nome || "Cliente Desconhecido",
        tipo: p.tipo_servico || "N/A",
        status: p.status,
        dataCriacao: new Date(p.criado_em),
        prazo: p.delegado_em ? new Date(p.delegado_em) : new Date(p.criado_em), // Fallback
    }));

    if (statusFilter !== "todos") {
      list = list.filter((p) => p.status === statusFilter);
    }

    list.sort((a, b) => {
      switch (sortOption) {
        case "data_asc":
          return a.dataCriacao.getTime() - b.dataCriacao.getTime();
        case "data_desc":
          return b.dataCriacao.getTime() - a.dataCriacao.getTime();
        case "status":
          return a.status.localeCompare(b.status);
        case "cliente":
          return a.cliente.localeCompare(b.cliente);
        default:
          return 0;
      }
    });
    return list;
  }, [processes, statusFilter, sortOption]);

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Carregando dados reais...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Bem-vind{activeProfile?.role === 'super_admin' ? 'o' : 'a'}, {activeProfile?.full_name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
            {activeProfile?.role === 'super_admin' ? 'Visão global operacional do Jurídico' : 'Visão geral dos seus processos e tarefas'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="border-none shadow-md overflow-hidden bg-card">
            <div className={`h-1.5 ${kpi.color}`} />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de Processos */}
      <Card className="shadow-md border-neutral-200 dark:border-neutral-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle className="text-xl font-bold">Processos em Foco</CardTitle>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">STATUS:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">ORDEM:</span>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[180px] h-9 text-xs">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data_desc">Data (Recente)</SelectItem>
                  <SelectItem value="data_asc">Data (Antigo)</SelectItem>
                  <SelectItem value="cliente">Nome Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-bold">ID</TableHead>
                  <TableHead className="font-bold">Cliente</TableHead>
                  <TableHead className="font-bold">Serviço</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Criação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSorted.map((p) => (
                  <TableRow key={p.id} className="hover:bg-accent/50 transition-colors border-b">
                    <TableCell className="font-mono text-xs">{p.id.split('-')[0]}</TableCell>
                    <TableCell className="font-medium">{p.cliente}</TableCell>
                    <TableCell>{p.tipo}</TableCell>
                    <TableCell>
                      {getStatusBadge(p.status)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.dataCriacao.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {filteredAndSorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      Nenhum processo real encontrado no banco de dados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

