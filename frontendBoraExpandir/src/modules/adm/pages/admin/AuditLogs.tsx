import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from '../../../../components/ui/Badge';
import { Search, Calendar } from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  details: string;
}

const mockLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2024-01-15 14:32:10",
    user: "Dra. Ana Silva",
    action: "Deletou Documento",
    target: "Cliente: João Santos",
    details: "Documento: Passaporte.pdf",
  },
  {
    id: "2",
    timestamp: "2024-01-15 14:15:22",
    user: "Carlos Santos",
    action: "Criou Cliente",
    target: "Cliente: Maria Costa",
    details: "Novo cliente adicionado ao sistema",
  },
  {
    id: "3",
    timestamp: "2024-01-15 13:45:33",
    user: "Marina Costa",
    action: "Atualizou Status",
    target: "Processo: #1234",
    details: "Status alterado: Em Análise → Aprovado",
  },
  {
    id: "4",
    timestamp: "2024-01-15 12:30:45",
    user: "Dra. Ana Silva",
    action: "Upload de Documento",
    target: "Cliente: Pedro Lima",
    details: "Documento: Certidão.pdf",
  },
  {
    id: "5",
    timestamp: "2024-01-15 11:20:15",
    user: "Carlos Santos",
    action: "Alterou Permissões",
    target: "Usuário: João Admin",
    details: "Adicionou permissão: Gerenciar Serviços",
  },
];

const getActionBadge = (action: string) => {
  if (action.includes("Deletou")) return <Badge variant="destructive">{action}</Badge>;
  if (action.includes("Criou")) return <Badge variant="success">{action}</Badge>;
  if (action.includes("Atualizou") || action.includes("Upload"))
    return <Badge variant="default">{action}</Badge>;
  return <Badge variant="warning">{action}</Badge>;
};

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [logs] = useState<AuditLog[]>(mockLogs);

  const filteredLogs = logs.filter(
    (log) =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Auditoria & Logs</h1>
        <p className="text-muted-foreground mt-2">
          Histórico completo de atividades do sistema
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-foreground">Registro de Atividades</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário ou ação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-input border-border text-foreground"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-border text-foreground"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Timestamp</TableHead>
                <TableHead className="text-muted-foreground">Usuário</TableHead>
                <TableHead className="text-muted-foreground">Ação</TableHead>
                <TableHead className="text-muted-foreground">Alvo</TableHead>
                <TableHead className="text-muted-foreground">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow className="border-border">
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.timestamp}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{log.user}</TableCell>
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell className="text-foreground">{log.target}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
