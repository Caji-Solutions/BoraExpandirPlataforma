import { LayoutDashboard, Users, FolderCog, FileText, CheckCircle2, Settings, Gauge, PieChart, Wallet, HandCoins, BarChart, Home, FolderOpen, FileSearch, CheckSquare } from "lucide-react";
import type { SidebarGroup } from "@/components/ui/Sidebar";

export const admSidebarGroups: SidebarGroup[] = [
  {
    label: "Controle",
    items: [
      { label: "Dashboard", to: "/adm", icon: LayoutDashboard },
      { label: "Gestão de Equipe", to: "/adm/team", icon: Users },
      { label: "Catálogo de Serviços", to: "/adm/services", icon: FolderCog },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { label: "Visão Geral", to: "/adm/financeiro/visao-geral", icon: PieChart },
      { label: "Contas a Receber", to: "/adm/financeiro/contas-receber", icon: Wallet },
      { label: "Comissões", to: "/adm/financeiro/comissoes", icon: HandCoins },
      { label: "Relatórios", to: "/adm/financeiro/relatorios", icon: BarChart },
    ],
  },
  {
    label: "Jurídico",
    items: [
      { label: "Dashboard", to: "/adm/juridico", icon: Home },
      { label: "Processos", to: "/adm/juridico/processos", icon: FolderOpen },
      { label: "Fila de Análise", to: "/adm/juridico/analise", icon: FileSearch },
      { label: "Tarefas", to: "/adm/juridico/tarefas", icon: CheckSquare },
    ],
  },
  {
    label: "Administração",
    items: [
      { label: "Auditoria", to: "/adm/audit", icon: FileText },
      { label: "Aprovações", to: "/adm/approvals", icon: CheckCircle2 },
      { label: "Cockpit do Dono", to: "/adm/cockpit", icon: Gauge },
      { label: "Configurações", to: "/adm/configuracoes", icon: Settings },
    ],
  },
];
