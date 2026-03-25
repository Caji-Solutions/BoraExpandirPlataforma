import { useState } from "react";
import { ExternalLink, Send, CheckCircle, FileText, FileSignature, Calendar, DollarSign, Mail, Receipt, AlertCircle, Clock } from "lucide-react";
import { Badge } from '@/modules/shared/components/ui/badge';
import { Button } from "@/modules/shared/components/ui/button";
import { Progress } from "@/modules/shared/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/modules/shared/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/shared/components/ui/table";
import { Card, CardContent } from "@/modules/shared/components/ui/card";
import { Input } from "@/modules/shared/components/ui/input";
import { Label } from "@/modules/shared/components/ui/label";

interface FinancialProcess {
  id: string;
  contratoId: string;
  cliente: string;
  servico: string;
  valorTotal: number;
  valorEntrada: number;
  dataVencimentoEntrada: string;
  progressoPagamento: number;
  totalParcelas: number;
  parcelasPagas: number;
  proximoVencimento: string;
  valorProximaParcela: number;
  status: "em_dia" | "atrasado" | "aguardando" | "a_vencer";
}

interface Installment {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: "pago" | "atrasado" | "pendente" | "a_vencer";
  dataPagamento?: string;
}

// Função para verificar se uma data está na semana atual
function isWithinCurrentWeek(dateStr: string): boolean {
  // Parse date in DD/MM/YYYY format
  const [day, month, year] = dateStr.split("/").map(Number);
  const targetDate = new Date(year, month - 1, day);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get start of current week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  // Get end of current week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return targetDate >= startOfWeek && targetDate <= endOfWeek;
}

// Função para obter o status visual real da parcela
function getVisualStatus(installment: Installment): Installment["status"] {
  if (installment.status === "pago") return "pago";
  if (installment.status === "atrasado") return "atrasado";
  
  // Se pendente, verifica se vence nessa semana
  if (installment.status === "pendente" && isWithinCurrentWeek(installment.vencimento)) {
    return "a_vencer";
  }
  
  return installment.status;
}

// Função para obter o status visual real do processo
function getProcessVisualStatus(process: FinancialProcess): FinancialProcess["status"] {
  if (process.status === "atrasado") return "atrasado";
  if (process.status === "aguardando") return "aguardando";
  
  // Se em_dia, verifica se o próximo vencimento está na semana atual
  if (process.status === "em_dia" && isWithinCurrentWeek(process.proximoVencimento)) {
    return "a_vencer";
  }
  
  return process.status;
}

const processes: FinancialProcess[] = [
  {
    id: "1",
    contratoId: "CTR-2024-001",
    cliente: "Carlos Mendes",
    servico: "Visto D7",
    valorTotal: 5000,
    valorEntrada: 2000,
    dataVencimentoEntrada: "10/10/2024",
    progressoPagamento: 50,
    totalParcelas: 4,
    parcelasPagas: 2,
    proximoVencimento: getDateInCurrentWeek(1), // Vence amanhã - será "A Vencer"
    valorProximaParcela: 1250,
    status: "em_dia",
  },
  {
    id: "2",
    contratoId: "CTR-2024-002",
    cliente: "Ana Paula Costa",
    servico: "Cidadania Portuguesa",
    valorTotal: 8000,
    valorEntrada: 3000,
    dataVencimentoEntrada: "15/10/2024",
    progressoPagamento: 37.5,
    totalParcelas: 4,
    parcelasPagas: 1,
    proximoVencimento: "20/11/2024",
    valorProximaParcela: 2000,
    status: "atrasado",
  },
  {
    id: "3",
    contratoId: "CTR-2024-003",
    cliente: "Roberto Silva",
    servico: "Green Card EB-2",
    valorTotal: 12000,
    valorEntrada: 4000,
    dataVencimentoEntrada: "01/12/2024",
    progressoPagamento: 0,
    totalParcelas: 6,
    parcelasPagas: 0,
    proximoVencimento: "01/12/2024",
    valorProximaParcela: 2000,
    status: "aguardando",
  },
  {
    id: "4",
    contratoId: "CTR-2024-004",
    cliente: "Fernanda Lima",
    servico: "Visto E-2",
    valorTotal: 9500,
    valorEntrada: 3500,
    dataVencimentoEntrada: "20/08/2024",
    progressoPagamento: 65,
    totalParcelas: 5,
    parcelasPagas: 3,
    proximoVencimento: getDateInCurrentWeek(3), // Vence em 3 dias - será "A Vencer"
    valorProximaParcela: 1500,
    status: "em_dia",
  },
  {
    id: "5",
    contratoId: "CTR-2024-005",
    cliente: "Pedro Almeida",
    servico: "Cidadania Italiana",
    valorTotal: 7200,
    valorEntrada: 2400,
    dataVencimentoEntrada: "10/07/2024",
    progressoPagamento: 80,
    totalParcelas: 4,
    parcelasPagas: 3,
    proximoVencimento: "25/03/2026",
    valorProximaParcela: 1800,
    status: "em_dia",
  },
];

// Função auxiliar para obter data formatada da semana atual (para mock)
function getDateInCurrentWeek(daysFromToday: number = 2): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const installments: Installment[] = [
  {
    id: "1",
    descricao: "Entrada",
    valor: 2500,
    vencimento: "05/09/2024",
    status: "pago",
    dataPagamento: "05/09/2024",
  },
  {
    id: "2",
    descricao: "Parcela 1",
    valor: 1800,
    vencimento: "05/10/2024",
    status: "pago",
    dataPagamento: "03/10/2024",
  },
  {
    id: "3",
    descricao: "Parcela 2",
    valor: 1800,
    vencimento: "05/11/2024",
    status: "pago",
    dataPagamento: "05/11/2024",
  },
  {
    id: "4",
    descricao: "Parcela 3",
    valor: 1500,
    vencimento: "10/12/2024",
    status: "atrasado",
  },
  {
    id: "5",
    descricao: "Parcela 4",
    valor: 1500,
    vencimento: "05/01/2025",
    status: "atrasado",
  },
  {
    id: "6",
    descricao: "Parcela 5",
    valor: 1200,
    vencimento: getDateInCurrentWeek(0), // Vence hoje
    status: "pendente", // Será exibido como "A Vencer"
  },
  {
    id: "7",
    descricao: "Parcela 6",
    valor: 1200,
    vencimento: getDateInCurrentWeek(2), // Vence em 2 dias
    status: "pendente", // Será exibido como "A Vencer"
  },
  {
    id: "8",
    descricao: "Parcela 7",
    valor: 1200,
    vencimento: getDateInCurrentWeek(5), // Vence em 5 dias (ainda na semana)
    status: "pendente", // Será exibido como "A Vencer"
  },
  {
    id: "9",
    descricao: "Parcela 8",
    valor: 1500,
    vencimento: "15/02/2026",
    status: "pendente",
  },
  {
    id: "10",
    descricao: "Parcela Final",
    valor: 2000,
    vencimento: "15/03/2026",
    status: "pendente",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "em_dia":
      return <Badge variant="success">Em Dia</Badge>;
    case "atrasado":
      return <Badge variant="destructive">Atrasado</Badge>;
    case "aguardando":
      return <Badge variant="secondary">Aguardando Início</Badge>;
    case "a_vencer":
      return <Badge variant="warning">A Vencer</Badge>;
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
    case "a_vencer":
      return "⏰";
    case "pendente":
      return "🕒";
    default:
      return "";
  }
}

export function FinancialProcessList() {
  const [selectedProcess, setSelectedProcess] = useState<FinancialProcess | null>(null);
  const [installmentsList, setInstallmentsList] = useState<Installment[]>(installments);
  
  // Modal states
  const [reenviarModal, setReenviarModal] = useState(false);
  const [darBaixaModal, setDarBaixaModal] = useState(false);
  const [notaFiscalModal, setNotaFiscalModal] = useState(false);
  
  // Selected installment for actions
  const [selectedInstallment, setSelectedInstallment] = useState<string | null>(null);
  const [dataPagamento, setDataPagamento] = useState("");

  // Get pending installments (not paid)
  const pendingInstallments = installmentsList.filter(i => i.status !== "pago");
  
  // Format date for display
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Handle dar baixa
  const handleDarBaixa = () => {
    if (!selectedInstallment || !dataPagamento) return;
    
    setInstallmentsList((prev) =>
      prev.map((inst) =>
        inst.id === selectedInstallment
          ? { ...inst, status: "pago" as const, dataPagamento: formatDateForDisplay(dataPagamento) }
          : inst
      )
    );
    
    setDarBaixaModal(false);
    setSelectedInstallment(null);
    setDataPagamento("");
  };

  // Handle reenviar cobranca
  const handleReenviarCobranca = () => {
    if (!selectedInstallment) return;
    // Here you would integrate with your email/notification service
    alert(`Cobrança reenviada para a parcela selecionada!`);
    setReenviarModal(false);
    setSelectedInstallment(null);
  };

  // Handle visualizar nota fiscal
  const handleVisualizarNota = (tipo: "parcela" | "total") => {
    // Here you would integrate with your invoice service
    if (tipo === "total") {
      alert(`Abrindo nota fiscal do contrato completo...`);
    } else if (selectedInstallment) {
      const parcela = installmentsList.find(i => i.id === selectedInstallment);
      alert(`Abrindo nota fiscal da ${parcela?.descricao}...`);
    }
    setNotaFiscalModal(false);
    setSelectedInstallment(null);
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Contas a Receber</h2>
        <p className="text-muted-foreground mt-2">Acompanhe o status de pagamento de todos os processos</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Contrato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Progresso Pagamento</TableHead>
                <TableHead>Próximo Vencimento</TableHead>
                <TableHead className="text-right">Valor Próxima Parcela</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processes.map((process) => {
                const visualStatus = getProcessVisualStatus(process);
                return (
                  <TableRow
                    key={process.id}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      visualStatus === "a_vencer" ? "bg-amber-50/50" : ""
                    }`}
                    onClick={() => setSelectedProcess(process)}
                  >
                    <TableCell className="font-mono text-sm font-medium text-blue-600">{process.contratoId}</TableCell>
                    <TableCell>{getStatusBadge(visualStatus)}</TableCell>
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
                    <TableCell className={
                      visualStatus === "atrasado" 
                        ? "text-destructive font-semibold" 
                        : visualStatus === "a_vencer"
                          ? "text-amber-600 font-semibold"
                          : ""
                    }>
                      {process.proximoVencimento}
                      {visualStatus === "a_vencer" && (
                        <span className="ml-1 text-xs">⏰</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      R$ {process.valorProximaParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      {selectedProcess && (
        <Dialog open={!!selectedProcess} onOpenChange={() => setSelectedProcess(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Extrato Financeiro - {selectedProcess.cliente}</DialogTitle>
              <DialogDescription>Detalhamento de pagamentos e parcelas</DialogDescription>
            </DialogHeader>

            {/* Contract Info Section */}
            <div className="mt-6 space-y-4">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileSignature className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-lg text-blue-900">Dados do Contrato</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">ID do Contrato</p>
                      <p className="text-lg font-bold font-mono text-blue-700">{selectedProcess.contratoId}</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Valor Total</p>
                      <p className="text-lg font-bold font-mono text-foreground">
                        R$ {selectedProcess.valorTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Entry Info Section */}
              <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-semibold text-lg text-emerald-900">Dados da Entrada</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/70 rounded-lg p-3 border border-emerald-100">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Valor da Entrada</p>
                      <p className="text-lg font-bold font-mono text-emerald-700">
                        R$ {selectedProcess.valorEntrada.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 border border-emerald-100">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Data de Vencimento</p>
                      </div>
                      <p className="text-lg font-bold font-mono text-emerald-700">{selectedProcess.dataVencimentoEntrada}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Section */}
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
                          { minimumFractionDigits: 2 },
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
                {installmentsList.map((installment) => {
                  const visualStatus = getVisualStatus(installment);
                  return (
                    <Card
                      key={installment.id}
                      className={`${visualStatus === "atrasado"
                        ? "border-destructive bg-destructive/5"
                        : visualStatus === "pago"
                          ? "border-success/30 bg-success/5"
                          : visualStatus === "a_vencer"
                            ? "border-amber-400 bg-amber-50"
                            : ""
                        }`}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getInstallmentIcon(visualStatus)}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{installment.descricao}</p>
                                {visualStatus === "a_vencer" && (
                                  <Badge variant="warning" className="text-xs">A Vencer</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Vence em {installment.vencimento}
                                {visualStatus === "atrasado" && (
                                  <span className="text-destructive font-semibold ml-2">(Atrasado)</span>
                                )}
                                {visualStatus === "a_vencer" && (
                                  <span className="text-amber-600 font-semibold ml-2">(Vence esta semana!)</span>
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
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600"
                  onClick={() => setReenviarModal(true)}
                  disabled={pendingInstallments.length === 0}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Reenviar Cobrança
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-green-600 hover:text-white hover:border-green-600"
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    setDataPagamento(today);
                    setDarBaixaModal(true);
                  }}
                  disabled={pendingInstallments.length === 0}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Dar Baixa Manual
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-purple-600 hover:text-white hover:border-purple-600"
                  onClick={() => setNotaFiscalModal(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Visualizar Nota Fiscal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Reenviar Cobrança */}
      <Dialog open={reenviarModal} onOpenChange={setReenviarModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Reenviar Cobrança
            </DialogTitle>
            <DialogDescription>
              Selecione a parcela para reenviar a cobrança ao cliente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {pendingInstallments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>Não há parcelas pendentes para reenviar cobrança.</p>
              </div>
            ) : (
              pendingInstallments.map((installment) => (
                <Card
                  key={installment.id}
                  className={`cursor-pointer transition-all hover:border-blue-400 ${
                    selectedInstallment === installment.id ? "border-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => setSelectedInstallment(installment.id)}
                >
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{installment.descricao}</p>
                        <p className="text-sm text-muted-foreground">Vence em {installment.vencimento}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono">
                          R$ {installment.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        {installment.status === "atrasado" && (
                          <Badge variant="destructive" className="text-xs">Atrasado</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setReenviarModal(false); setSelectedInstallment(null); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleReenviarCobranca}
              disabled={!selectedInstallment}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Reenviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Dar Baixa Manual */}
      <Dialog open={darBaixaModal} onOpenChange={setDarBaixaModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Dar Baixa Manual
            </DialogTitle>
            <DialogDescription>
              Selecione a parcela e informe a data do pagamento recebido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Parcela Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Selecione a Parcela</Label>
              {pendingInstallments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>Não há parcelas pendentes para dar baixa.</p>
                </div>
              ) : (
                pendingInstallments.map((installment) => (
                  <Card
                    key={installment.id}
                    className={`cursor-pointer transition-all hover:border-green-400 ${
                      selectedInstallment === installment.id ? "border-green-500 bg-green-50" : ""
                    }`}
                    onClick={() => setSelectedInstallment(installment.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{installment.descricao}</p>
                          <p className="text-sm text-muted-foreground">Vence em {installment.vencimento}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono text-green-600">
                            R$ {installment.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                          {installment.status === "atrasado" && (
                            <Badge variant="destructive" className="text-xs">Atrasado</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Data de Pagamento */}
            {selectedInstallment && (
              <div className="space-y-2">
                <Label htmlFor="dataPagamento" className="text-sm font-medium">
                  Data do Pagamento
                </Label>
                <Input
                  id="dataPagamento"
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setDarBaixaModal(false); setSelectedInstallment(null); setDataPagamento(""); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleDarBaixa}
              disabled={!selectedInstallment || !dataPagamento}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Baixa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nota Fiscal */}
      <Dialog open={notaFiscalModal} onOpenChange={setNotaFiscalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-600" />
              Visualizar Nota Fiscal
            </DialogTitle>
            <DialogDescription>
              Escolha se deseja ver a nota de uma parcela específica ou do contrato completo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Opção: Contrato Completo */}
            <Card
              className="cursor-pointer transition-all hover:border-purple-400 border-2"
              onClick={() => handleVisualizarNota("total")}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Nota Fiscal do Contrato</p>
                    <p className="text-sm text-muted-foreground">Visualizar nota completa do contrato</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Separador */}
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground">ou selecione uma parcela</span>
              <div className="flex-1 border-t" />
            </div>

            {/* Lista de Parcelas */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {installmentsList.map((installment) => (
                <Card
                  key={installment.id}
                  className={`cursor-pointer transition-all hover:border-purple-400 ${
                    selectedInstallment === installment.id ? "border-purple-500 bg-purple-50" : ""
                  }`}
                  onClick={() => setSelectedInstallment(installment.id)}
                >
                  <CardContent className="py-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>{getInstallmentIcon(installment.status)}</span>
                        <p className="font-medium text-sm">{installment.descricao}</p>
                      </div>
                      <p className="font-mono text-sm">
                        R$ {installment.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setNotaFiscalModal(false); setSelectedInstallment(null); }}>
              Cancelar
            </Button>
            <Button
              onClick={() => handleVisualizarNota("parcela")}
              disabled={!selectedInstallment}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Nota da Parcela
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
