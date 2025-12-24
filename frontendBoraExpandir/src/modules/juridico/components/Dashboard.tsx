import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from '../../../components/ui/Badge';
import { Clock, CheckCircle2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";

const kpiCards = [
  { title: "Total de Processos Abertos", value: "124", color: "bg-blue-500" },
  { title: "Novos Processos (Este Mês)", value: "12", color: "bg-yellow-500" },
  { title: "Compromissos de Hoje", value: "5", color: "bg-red-500" },
];

const priorityTasks = [
  { id: 1, title: "Reunião com Cliente João Silva", time: "14:00", status: "pending" },
  { id: 2, title: "Prazo Visto D7 - Maria Costa", time: "17:00", status: "pending" },
  { id: 3, title: "Enviar documentos - Pedro Santos", time: "Concluído", status: "completed" },
  { id: 4, title: "Análise Cidadania Portuguesa - Ana Lima", time: "Amanhã", status: "pending" },
];

// Mock de processos - em futura integração substituir por fetch/API
const processes = [
  {
    id: "PR-2025-001",
    cliente: "João Silva",
    tipo: "Visto D7",
    status: "em_andamento",
    dataCriacao: new Date("2025-11-01"),
    prazo: new Date("2025-12-01"),
  },
  {
    id: "PR-2025-002",
    cliente: "Maria Costa",
    tipo: "Cidadania Portuguesa",
    status: "pendente",
    dataCriacao: new Date("2025-11-10"),
    prazo: new Date("2026-01-15"),
  },
  {
    id: "PR-2025-003",
    cliente: "Pedro Santos",
    tipo: "Renovação Visto",
    status: "concluido",
    dataCriacao: new Date("2025-10-25"),
    prazo: new Date("2025-11-30"),
  },
  {
    id: "PR-2025-004",
    cliente: "Ana Lima",
    tipo: "Apostila Haia",
    status: "em_andamento",
    dataCriacao: new Date("2025-11-15"),
    prazo: new Date("2025-12-20"),
  },
  {
    id: "PR-2025-005",
    cliente: "Carlos Pereira",
    tipo: "AR - Autorização Residência",
    status: "cancelado",
    dataCriacao: new Date("2025-09-05"),
    prazo: new Date("2025-10-05"),
  },
];

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

function getStatusBadge(status: string) {
  switch (status) {
    case 'concluido':
      return <Badge variant="success">Concluído</Badge>;
    case 'em_andamento':
      return <Badge variant="warning">Em Andamento</Badge>;
    case 'cancelado':
      return <Badge variant="destructive">Cancelado</Badge>;
    case 'pendente':
      return <Badge variant="warning">Pendente</Badge>;
    default:
      return <Badge variant="default">{statusLabels[status] || status}</Badge>;
  }
}

export function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [sortOption, setSortOption] = useState<string>("data_desc");

  const filteredAndSorted = useMemo(() => {
    let list = processes.slice();
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
  }, [statusFilter, sortOption]);
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bem-vinda, Dra. Ana!</h1>
        <p className="text-muted-foreground mt-1">Visão geral dos seus processos e tarefas</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="border-none shadow-lg">
            <CardHeader className={`${kpi.color} text-white rounded-t-lg`}>
              <CardTitle className="text-sm font-medium opacity-90">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-4xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de Processos */}
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Processos</CardTitle>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
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
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data_desc">Data (Mais recente)</SelectItem>
                  <SelectItem value="data_asc">Data (Mais antigo)</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead>Prazo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSorted.map((p) => (
                  <TableRow key={p.id} className="hover:bg-accent/50 cursor-pointer">
                    <TableCell className="font-medium">{p.id}</TableCell>
                    <TableCell>{p.cliente}</TableCell>
                    <TableCell>{p.tipo}</TableCell>
                    <TableCell>
                      {getStatusBadge(p.status)}
                    </TableCell>
                    <TableCell>{p.dataCriacao.toLocaleDateString()}</TableCell>
                    <TableCell>{p.prazo.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {filteredAndSorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum processo encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

        {/* Priority Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Tarefas Prioritárias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-1">
                    {task.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{task.time}</p>
                  </div>
                  <Badge variant={task.status === "completed" ? "secondary" : "default"}>
                    {task.status === "completed" ? "Concluído" : "Pendente"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
 
  );
}
