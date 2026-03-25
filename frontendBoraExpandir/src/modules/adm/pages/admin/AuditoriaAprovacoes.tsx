import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card';
import { Button } from '@/modules/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";
import { Badge } from '@/modules/shared/components/ui/badge';
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface PendingRequest {
  id: string;
  requester: string;
  type: string;
  description: string;
  date: string;
  status: "pending" | "approved" | "denied";
}

interface SecurityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  severity: "info" | "warning" | "critical";
}

const mockRequests: PendingRequest[] = [
  {
    id: "1",
    requester: "Vendedor Lucas",
    type: "Desconto",
    description: "Pediu 15% OFF para Cliente X (Visto D7)",
    date: "23/11/2024 10:30",
    status: "pending",
  },
  {
    id: "2",
    requester: "Marina Costa",
    type: "Exceção",
    description: "Solicitou pular etapa 2 para Cliente Y (urgência)",
    date: "23/11/2024 09:15",
    status: "pending",
  },
  {
    id: "3",
    requester: "Carlos Santos",
    type: "Reembolso",
    description: "Pediu reembolso de R$ 1.200 para Cliente Z",
    date: "22/11/2024 16:45",
    status: "pending",
  },
];

const mockSecurityLogs: SecurityLog[] = [
  {
    id: "1",
    timestamp: "23/11/2024 14:23",
    user: "Dra. Ana Silva",
    action: "Excluiu documento",
    target: "Passaporte do processo #123",
    severity: "critical",
  },
  {
    id: "2",
    timestamp: "23/11/2024 13:15",
    user: "Carlos Santos",
    action: "Alterou status",
    target: "Cliente João Silva - para 'Aprovado'",
    severity: "warning",
  },
  {
    id: "3",
    timestamp: "23/11/2024 12:00",
    user: "Marina Costa",
    action: "Acessou dados sensíveis",
    target: "Relatório financeiro completo",
    severity: "info",
  },
  {
    id: "4",
    timestamp: "23/11/2024 11:30",
    user: "Vendedor Lucas",
    action: "Tentou acessar",
    target: "Painel de configurações (bloqueado)",
    severity: "warning",
  },
  {
    id: "5",
    timestamp: "23/11/2024 10:05",
    user: "Dra. Ana Silva",
    action: "Exportou dados",
    target: "Lista de clientes ativos",
    severity: "info",
  },
];

export default function AuditoriaAprovacoes() {
  const [requests, setRequests] = useState<PendingRequest[]>(mockRequests);

  const handleApprove = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: "approved" as const } : req
    ));
  };

  const handleDeny = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: "denied" as const } : req
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-status-error/10 text-status-error border-status-error/20";
      case "warning":
        return "bg-status-warning/10 text-status-warning border-status-warning/20";
      default:
        return "bg-status-info/10 text-status-info border-status-info/20";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Auditoria & Aprovações</h1>
        <p className="text-muted-foreground mt-2">
          Controle de exceções e monitoramento de segurança
        </p>
      </div>

      {/* Section 1: Pending Approvals */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-status-warning" />
            Solicitações Pendentes
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Aprovações necessárias do proprietário
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Solicitante</TableHead>
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground">Descrição</TableHead>
                <TableHead className="text-muted-foreground">Data</TableHead>
                <TableHead className="text-muted-foreground text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    {request.requester}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-border">
                      {request.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground max-w-md">
                    {request.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {request.date}
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === "pending" ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="bg-status-success hover:bg-status-success/90 text-white"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeny(request.id)}
                          className="bg-status-error hover:bg-status-error/90"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Negar
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        variant={request.status === "approved" ? "default" : "destructive"}
                        className={
                          request.status === "approved"
                            ? "bg-status-success"
                            : "bg-status-error"
                        }
                      >
                        {request.status === "approved" ? "Aprovado" : "Negado"}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section 2: Security Logs */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Log de Segurança</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ações sensíveis e tentativas de acesso
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Timestamp</TableHead>
                <TableHead className="text-muted-foreground">Usuário</TableHead>
                <TableHead className="text-muted-foreground">Ação</TableHead>
                <TableHead className="text-muted-foreground">Alvo</TableHead>
                <TableHead className="text-muted-foreground">Severidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSecurityLogs.map((log) => (
                <TableRow key={log.id} className="border-border">
                  <TableCell className="text-muted-foreground text-sm font-mono">
                    {log.timestamp}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {log.user}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {log.action}
                  </TableCell>
                  <TableCell className="text-foreground max-w-md">
                    {log.target}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getSeverityColor(log.severity)}
                    >
                      {log.severity === "critical"
                        ? "Crítico"
                        : log.severity === "warning"
                        ? "Alerta"
                        : "Info"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
