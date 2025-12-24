import { useState } from "react";
import { ExternalLink, Send, CheckCircle, FileText } from "lucide-react";
import { Badge } from '../../../components/ui/Badge';
import { Button } from "../../../components/ui/Button";
import { Progress } from "../../../components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Card, CardContent } from "../../../components/ui/card";

interface FinancialProcess {
  id: string;
  cliente: string;
  servico: string;
  valorTotal: number;
  progressoPagamento: number;
  totalParcelas: number;
  parcelasPagas: number;
  proximoVencimento: string;
  status: "em_dia" | "atrasado" | "aguardando";
}

interface Installment {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: "pago" | "atrasado" | "pendente";
  dataPagamento?: string;
}

const processes: FinancialProcess[] = [
  {
    id: "1",
    cliente: "Carlos Mendes",
    servico: "Visto D7",
    valorTotal: 5000,
    progressoPagamento: 50,
    totalParcelas: 4,
    parcelasPagas: 2,
    proximoVencimento: "25/11/2024",
    status: "em_dia",
  },
  {
    id: "2",
    cliente: "Ana Paula Costa",
    servico: "Cidadania Portuguesa",
    valorTotal: 8000,
    progressoPagamento: 37.5,
    totalParcelas: 4,
    parcelasPagas: 1,
    proximoVencimento: "20/11/2024",
    status: "atrasado",
  },
  {
    id: "3",
    cliente: "Roberto Silva",
    servico: "Green Card EB-2",
    valorTotal: 12000,
    progressoPagamento: 0,
    totalParcelas: 6,
    parcelasPagas: 0,
    proximoVencimento: "01/12/2024",
    status: "aguardando",
  },
];

const installments: Installment[] = [
  {
    id: "1",
    descricao: "Entrada",
    valor: 2000,
    vencimento: "10/10/2024",
    status: "pago",
    dataPagamento: "10/10/2024",
  },
  {
    id: "2",
    descricao: "Parcela 2",
    valor: 1500,
    vencimento: "10/11/2024",
    status: "atrasado",
  },
  {
    id: "3",
    descricao: "Parcela 3",
    valor: 1500,
    vencimento: "10/12/2024",
    status: "pendente",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'em_dia':
      return <Badge variant="success">Em Dia</Badge>;
    case 'atrasado':
      return <Badge variant="destructive">Atrasado</Badge>;
    case 'aguardando':
      return <Badge variant="secondary">Aguardando Início</Badge>;
    default:
      return null;
  }
}

function getInstallmentIcon(status: string) {
  switch (status) {
    case "pago":
      return "✅";
    case "atrasado":
      return "⚠️";
    case "pendente":
      return "🕒";
    default:
      return "";
  }
}

export function FinancialProcessList() {
  const [selectedProcess, setSelectedProcess] = useState<FinancialProcess | null>(null);

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Contas a Receber</h2>
        <p className="text-muted-foreground mt-2">
          Acompanhe o status de pagamento de todos os processos
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead>Progresso Pagamento</TableHead>
                  <TableHead>Próximo Vencimento</TableHead>
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
                    <TableCell>{getStatusBadge(process.status)}</TableCell>
                    <TableCell className="font-medium">{process.cliente}</TableCell>
                    <TableCell>{process.servico}</TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      R$ {process.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={process.progressoPagamento} className="h-2 w-24" />
                        <span className="text-sm text-muted-foreground">
                          {process.parcelasPagas}/{process.totalParcelas} Parcelas
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={process.status === "atrasado" ? "text-destructive font-semibold" : ""}>
                      {process.proximoVencimento}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProcess(process);
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver Extrato
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      {/* Transaction Details Drawer */}
      <Sheet open={!!selectedProcess} onOpenChange={() => setSelectedProcess(null)}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          {selectedProcess && (
            <>
              <SheetHeader>
                <SheetTitle>Extrato Financeiro - {selectedProcess.cliente}</SheetTitle>
                <SheetDescription>Detalhamento de pagamentos e parcelas</SheetDescription>
              </SheetHeader>

              {/* Summary Section */}
              <div className="mt-6 space-y-4">
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
                        <p className="text-xl font-bold font-mono text-foreground">
                          R$ {selectedProcess.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Valor Pago</p>
                        <p className="text-xl font-bold font-mono text-success">
                          R${" "}
                          {((selectedProcess.valorTotal * selectedProcess.progressoPagamento) / 100).toLocaleString(
                            "pt-BR",
                            { minimumFractionDigits: 2 }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Restante</p>
                        <p className="text-xl font-bold font-mono text-warning">
                          R${" "}
                          {(
                            selectedProcess.valorTotal -
                            (selectedProcess.valorTotal * selectedProcess.progressoPagamento) / 100
                          ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Installment List */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Histórico de Parcelas</h3>
                  {installments.map((installment) => (
                    <Card
                      key={installment.id}
                      className={`${
                        installment.status === "atrasado"
                          ? "border-destructive bg-destructive/5"
                          : installment.status === "pago"
                          ? "border-success/30 bg-success/5"
                          : ""
                      }`}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getInstallmentIcon(installment.status)}</span>
                            <div>
                              <p className="font-semibold">{installment.descricao}</p>
                              <p className="text-sm text-muted-foreground">
                                Vence em {installment.vencimento}
                                {installment.status === "atrasado" && (
                                  <span className="text-destructive font-semibold ml-2">(Atrasado)</span>
                                )}
                              </p>
                              {installment.dataPagamento && (
                                <p className="text-sm text-success mt-1">Pago em {installment.dataPagamento}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold font-mono text-lg">
                              R$ {installment.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Reenviar Cobrança
                  </Button>
                  <Button variant="outline" className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Dar Baixa Manual
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Visualizar Nota Fiscal
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
