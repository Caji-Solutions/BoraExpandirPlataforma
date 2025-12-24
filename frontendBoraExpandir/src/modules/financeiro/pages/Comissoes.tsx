import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../../../components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { TrendingUp, Users, DollarSign, Calendar, ArrowUpRight } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending";
  totalReferrals: number;
  lastMonthReferrals: number;
  totalCommission: number;
  lastMonthCommission: number;
  pendingCommission: number;
  email: string;
  joinDate: string;
}

const mockPartners: Partner[] = [
  {
    id: "1",
    name: "Dr. Carlos Mendes",
    status: "active",
    totalReferrals: 45,
    lastMonthReferrals: 8,
    totalCommission: 67500.0,
    lastMonthCommission: 12000.0,
    pendingCommission: 4500.0,
    email: "carlos.mendes@example.com",
    joinDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Dra. Maria Silva",
    status: "active",
    totalReferrals: 62,
    lastMonthReferrals: 12,
    totalCommission: 93000.0,
    lastMonthCommission: 18000.0,
    pendingCommission: 7500.0,
    email: "maria.silva@example.com",
    joinDate: "2023-08-20",
  },
  {
    id: "3",
    name: "João Pedro Santos",
    status: "active",
    totalReferrals: 28,
    lastMonthReferrals: 5,
    totalCommission: 42000.0,
    lastMonthCommission: 7500.0,
    pendingCommission: 3000.0,
    email: "joao.santos@example.com",
    joinDate: "2024-03-10",
  },
  {
    id: "4",
    name: "Ana Paula Costa",
    status: "inactive",
    totalReferrals: 15,
    lastMonthReferrals: 0,
    totalCommission: 22500.0,
    lastMonthCommission: 0,
    pendingCommission: 0,
    email: "ana.costa@example.com",
    joinDate: "2023-11-05",
  },
  {
    id: "5",
    name: "Roberto Almeida",
    status: "pending",
    totalReferrals: 3,
    lastMonthReferrals: 3,
    totalCommission: 0,
    lastMonthCommission: 0,
    pendingCommission: 4500.0,
    email: "roberto.almeida@example.com",
    joinDate: "2024-10-28",
  },
];

const getStatusBadge = (status: Partner["status"]) => {
  const variants = {
    active: { label: "Ativo", variant: "success" as const },
    inactive: { label: "Inativo", variant: "secondary" as const },
    pending: { label: "Pendente", variant: "warning" as const },
  } as const;

  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Comissoes = () => {
  const totalStats = {
    activePartners: mockPartners.filter((p) => p.status === "active").length,
    totalReferrals: mockPartners.reduce((sum, p) => sum + p.totalReferrals, 0),
    totalPaid: mockPartners.reduce((sum, p) => sum + p.totalCommission, 0),
    totalPending: mockPartners.reduce((sum, p) => sum + p.pendingCommission, 0),
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Comissões de Parceiros</h2>
        <p className="text-muted-foreground mt-2">Gerencie e acompanhe as comissões dos parceiros indicadores</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parceiros Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.activePartners}</div>
            <p className="text-xs text-muted-foreground">de {mockPartners.length} parceiros totais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicações Totais</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {mockPartners.reduce((sum, p) => sum + p.lastMonthReferrals, 0)} no último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalStats.totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(mockPartners.reduce((sum, p) => sum + p.lastMonthCommission, 0))} no último mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalStats.totalPending)}</div>
            <p className="text-xs text-muted-foreground">aguardando pagamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Parceiros</CardTitle>
          <CardDescription>Visão detalhada de todos os parceiros e suas comissões</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parceiro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Indicações Total</TableHead>
                <TableHead className="text-center">Último Mês</TableHead>
                <TableHead className="text-right">Total Recebido</TableHead>
                <TableHead className="text-right">Último Mês</TableHead>
                <TableHead className="text-right">A Receber</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPartners.map((partner) => (
                <TableRow key={partner.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{partner.name}</span>
                      <span className="text-xs text-muted-foreground">{partner.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(partner.status)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-semibold">{partner.totalReferrals}</span>
                      <Users className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {partner.lastMonthReferrals > 0 ? (
                        <>
                          <span className="font-medium text-green-600">{partner.lastMonthReferrals}</span>
                          <ArrowUpRight className="h-3 w-3 text-green-600" />
                        </>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(partner.totalCommission)}</TableCell>
                  <TableCell className="text-right">
                    {partner.lastMonthCommission > 0 ? (
                      <span className="font-medium text-green-600">{formatCurrency(partner.lastMonthCommission)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {partner.pendingCommission > 0 ? (
                      <span className="font-semibold text-amber-600">{formatCurrency(partner.pendingCommission)}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Comissoes;
