import { useState } from "react";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";
import { Badge } from '@/modules/shared/components/ui/badge';
import { Button } from '@/modules/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/modules/shared/components/ui/sheet";

interface Process {
  id: number;
  cliente: string;
  tipoVisto: string;
  etapa: string;
  diasEspera: number;
  status: "pendente" | "analise" | "rejeitado";
}

interface Document {
  nome: string;
  status: "aprovado" | "pendente" | "rejeitado";
}

// TODO: dados mock - usar query real de processos e documentos
const processes: Process[] = [];
const documents: Document[] = [];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "aprovado":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "pendente":
      return <Clock className="h-4 w-4 text-warning" />;
    case "rejeitado":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "aprovado":
      return <Badge className="bg-success text-success-foreground">Aprovado</Badge>;
    case "pendente":
      return <Badge className="bg-warning text-warning-foreground">Pendente</Badge>;
    case "rejeitado":
      return <Badge variant="destructive">Rejeitado</Badge>;
    default:
      return null;
  }
};

export function ProcessQueue() {
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Fila de Processos</h1>
        <p className="text-muted-foreground mt-1">Gerencie e analise documentos dos clientes</p>
      </div>

      <div className="rounded-lg border bg-card">
        {processes.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Em desenvolvimento - Nenhum processo na fila</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo de Visto</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Dias em Espera</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processes.map((process) => (
                <TableRow
                  key={process.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedProcess(process)}
                >
                  <TableCell>{getStatusIcon(process.status)}</TableCell>
                  <TableCell className="font-medium">{process.cliente}</TableCell>
                  <TableCell>{process.tipoVisto}</TableCell>
                  <TableCell>{process.etapa}</TableCell>
                  <TableCell>{process.diasEspera} dias</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProcess(process);
                      }}
                    >
                      Analisar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Document Analysis Drawer */}
      <Sheet open={!!selectedProcess} onOpenChange={() => setSelectedProcess(null)}>
        <SheetContent side="right" className="w-full sm:max-w-4xl p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Documentação - {selectedProcess?.cliente}</SheetTitle>
            <SheetDescription>{selectedProcess?.tipoVisto}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
            {/* Checklist */}
            <div className="p-6 border-r overflow-y-auto">
              <h3 className="font-semibold text-lg mb-4">Lista de Documentos</h3>
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedDoc?.nome === doc.nome
                        ? "bg-primary/10 border-primary"
                        : "bg-card hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(doc.status)}
                        <span className="font-medium">{doc.nome}</span>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Viewer */}
            <div className="p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {selectedDoc?.nome || "Selecione um documento"}.pdf
                </span>
              </div>
              <div className="flex-1 rounded-lg bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-24 w-24 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Visualização do Documento</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="border-t p-4 bg-card">
            <div className="flex gap-3 justify-end">
              <Button variant="outline" className="flex-1 md:flex-none">
                Rejeitar Documento
              </Button>
              <Button className="flex-1 md:flex-none bg-success hover:bg-success/90 text-success-foreground">
                Aprovar & Próximo
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
