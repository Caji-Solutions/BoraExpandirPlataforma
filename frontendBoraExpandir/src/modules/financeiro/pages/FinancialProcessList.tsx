import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Badge } from '@/modules/shared/components/ui/badge';
import { Button } from '@/modules/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/modules/shared/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";
import { Card, CardContent } from '@/modules/shared/components/ui/card';

interface ContaReceberParcela {
  id: string;
  numero_parcela: number;
  quantidade_parcelas: number;
  valor: number;
  data_vencimento: string;
  status: string;
  status_visual: "pago" | "em_analise" | "recusado" | "atrasado" | "pendente";
  comprovante_url?: string | null;
  nota_recusa?: string | null;
}

interface ContaReceberProcesso {
  id: string;
  origem_tipo: "agendamento" | "contrato";
  origem_id: string;
  servico_nome: string;
  pagador_nome: string;
  vendedor_nome: string;
  quantidade_parcelas: number;
  parcelas_pagas: number;
  valor_entrada: number;
  valor_parcela: number;
  dia_cobranca: number;
  status_geral: "em_dia" | "atrasado" | "em_analise" | "recusado";
  proxima_parcela: ContaReceberParcela | null;
  parcelas: ContaReceberParcela[];
}

function getStatusBadge(status: ContaReceberProcesso["status_geral"]) {
  switch (status) {
    case "em_dia":
      return <Badge variant="success">Em Dia</Badge>;
    case "atrasado":
      return <Badge variant="destructive">Atrasado</Badge>;
    case "em_analise":
      return <Badge variant="warning">Em Análise</Badge>;
    case "recusado":
      return <Badge variant="secondary">Recusado</Badge>;
    default:
      return <Badge variant="secondary">—</Badge>;
  }
}

function getParcelaBadge(status: ContaReceberParcela["status_visual"]) {
  switch (status) {
    case "pago":
      return <Badge variant="success">Pago</Badge>;
    case "atrasado":
      return <Badge variant="destructive">Atrasado</Badge>;
    case "em_analise":
      return <Badge variant="warning">Em Análise</Badge>;
    case "recusado":
      return <Badge variant="secondary">Recusado</Badge>;
    default:
      return <Badge variant="outline">Pendente</Badge>;
  }
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function FinancialProcessList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processes, setProcesses] = useState<ContaReceberProcesso[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<ContaReceberProcesso | null>(null);

  const fetchContasReceber = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/financeiro/contas-receber`);
      if (!response.ok) throw new Error("Erro ao carregar contas a receber");
      const json = await response.json();
      setProcesses(Array.isArray(json.data) ? json.data : []);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar contas a receber");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContasReceber();
  }, []);

  const totalAberto = useMemo(() => {
    return processes.reduce((acc, process) => {
      const aberto = process.parcelas
        .filter((p) => p.status !== "pago")
        .reduce((sum, p) => sum + Number(p.valor || 0), 0);
      return acc + aberto;
    }, 0);
  }, [processes]);

  const formatCurrency = (value: number) => {
    return `R$ ${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contas a Receber</h2>
          <p className="text-muted-foreground mt-2">
            Parcelas de boleto por serviço, com vendedor, pagador, dia de cobrança e vencimentos.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-muted-foreground tracking-wider">Total em aberto</p>
          <p className="text-2xl font-bold">{formatCurrency(totalAberto)}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={fetchContasReceber}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Pagador</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead className="text-right">Entrada</TableHead>
                <TableHead className="text-right">Valor Parcela</TableHead>
                <TableHead>Dia Cobrança</TableHead>
                <TableHead>Próx. Vencimento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Nenhuma parcela de boleto encontrada.
                  </TableCell>
                </TableRow>
              )}
              {processes.map((process) => (
                <TableRow key={process.id}>
                  <TableCell className="font-mono text-xs">
                    {process.origem_tipo === "contrato" ? "Contrato" : "Consultoria"} #{process.origem_id.slice(0, 8)}
                    <div className="text-[11px] text-muted-foreground mt-1">{process.servico_nome}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(process.status_geral)}</TableCell>
                  <TableCell>{process.vendedor_nome || "—"}</TableCell>
                  <TableCell>{process.pagador_nome || "—"}</TableCell>
                  <TableCell>{process.parcelas_pagas}/{process.quantidade_parcelas}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(process.valor_entrada)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(process.valor_parcela)}</TableCell>
                  <TableCell>Dia {process.dia_cobranca}</TableCell>
                  <TableCell>
                    {process.proxima_parcela
                      ? `${formatDate(process.proxima_parcela.data_vencimento)} (${process.proxima_parcela.numero_parcela}/${process.proxima_parcela.quantidade_parcelas})`
                      : "Quitado"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProcess(process)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedProcess && (
        <Dialog open={!!selectedProcess} onOpenChange={() => setSelectedProcess(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Extrato de Parcelas - {selectedProcess.pagador_nome}
              </DialogTitle>
              <DialogDescription>
                {selectedProcess.servico_nome} • {selectedProcess.origem_tipo === "contrato" ? "Contrato" : "Consultoria"} #{selectedProcess.origem_id.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground uppercase">Vendedor</p>
                <p className="font-semibold">{selectedProcess.vendedor_nome || "—"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground uppercase">Entrada</p>
                <p className="font-semibold">{formatCurrency(selectedProcess.valor_entrada)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground uppercase">Valor Parcela</p>
                <p className="font-semibold">{formatCurrency(selectedProcess.valor_parcela)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground uppercase">Dia Cobrança</p>
                <p className="font-semibold">Dia {selectedProcess.dia_cobranca}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {selectedProcess.parcelas.map((parcela) => (
                <Card key={parcela.id}>
                  <CardContent className="pt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        Parcela {parcela.numero_parcela}/{parcela.quantidade_parcelas}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {formatDate(parcela.data_vencimento)}
                      </p>
                      {parcela.nota_recusa && (
                        <p className="text-xs text-red-600 mt-1">{parcela.nota_recusa}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">{formatCurrency(parcela.valor)}</p>
                      <div className="mt-1">{getParcelaBadge(parcela.status_visual)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
