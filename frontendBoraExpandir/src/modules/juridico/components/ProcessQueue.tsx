import { Clock, FileText, User, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from '../../../components/ui/Badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export interface Process {
  id: string;
  clientName: string;
  clientId: string;
  serviceType: string;
  currentStage: string;
  totalStages: number;
  status: "new" | "pending_client" | "ready";
  waitingTime: number;
  documentsTotal: number;
  documentsApproved: number;
}

// Dados mock para demonstração
const mockProcesses: Process[] = [
  {
    id: "1",
    clientName: "João Silva",
    clientId: "CLI001",
    serviceType: "Visto D7",
    currentStage: "2",
    totalStages: 4,
    status: "new",
    waitingTime: 2,
    documentsTotal: 5,
    documentsApproved: 3,
  },
  {
    id: "2",
    clientName: "Maria Santos",
    clientId: "CLI002",
    serviceType: "Nómada Digital",
    currentStage: "1",
    totalStages: 4,
    status: "pending_client",
    waitingTime: 28,
    documentsTotal: 6,
    documentsApproved: 2,
  },
  {
    id: "3",
    clientName: "Carlos Oliveira",
    clientId: "CLI003",
    serviceType: "Visto D2",
    currentStage: "3",
    totalStages: 4,
    status: "ready",
    waitingTime: 1,
    documentsTotal: 4,
    documentsApproved: 4,
  },
];

const StatusBadge = ({ status }: { status: Process["status"] }) => {
  const variants = {
    new: { label: "Novo", variant: "destructive" as const },
    pending_client: { label: "Pendente", variant: "warning" as const },
    ready: { label: "Pronto", variant: "success" as const },
  };

  const { label, variant } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
};

const SLAIndicator = ({ hours }: { hours: number }) => {
  let colorClass = "text-sla-ok";
  if (hours > 24) colorClass = "text-sla-critical font-semibold";
  else if (hours > 12) colorClass = "text-sla-warning";

  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      <Clock className="h-4 w-4" />
      <span className="text-sm">
        {hours < 1 ? `${Math.round(hours * 60)} min` : `${hours}h`}
      </span>
    </div>
  );
};

interface ProcessQueueProps {
  onSelectProcess?: (process: Process) => void;
}

export function ProcessQueue({ onSelectProcess }: ProcessQueueProps) {
  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fila de Trabalho</h1>
          <p className="text-muted-foreground mt-1">
            Processos aguardando revisão jurídica
          </p>
        </div>
        <Badge variant="outline" className="text-base px-4 py-2">
          {mockProcesses.length} processos ativos
        </Badge>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[120px]">Estado</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead className="text-center">Etapa</TableHead>
              <TableHead className="text-center">Documentos</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProcesses.map((process) => (
              <TableRow
                key={process.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onSelectProcess?.(process)}
              >
                <TableCell>
                  <StatusBadge status={process.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{process.clientName}</div>
                      <div className="text-sm text-muted-foreground">
                        {process.clientId}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{process.serviceType}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="border border-border bg-transparent">
                    {process.currentStage}/{process.totalStages}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-success font-medium">
                      {process.documentsApproved}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span>{process.documentsTotal}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <SLAIndicator hours={process.waitingTime} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProcess?.(process);
                    }}
                  >
                    Rever
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
