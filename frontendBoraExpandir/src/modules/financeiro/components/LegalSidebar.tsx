import { LayoutDashboard, Files, CalendarClock, Users, PieChart, Wallet, HandCoins, BarChart, Settings, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Badge } from "@/modules/shared/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/modules/shared/components/ui/sidebar";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  badge?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "OPERACIONAL",
    items: [
      { title: "Início", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "FINANCEIRO",
    items: [
      { title: "Visão Geral", url: "/financeiro", icon: PieChart },
      { title: "Contas a Receber", url: "/contas-receber", icon: Wallet },
      { title: "Comissões", url: "/comissoes", icon: HandCoins },
    ],
  },
  {
    label: "SISTEMA",
    items: [
      { title: "Relatórios", url: "/relatorios", icon: BarChart },
      { title: "Configurações", url: "/configuracoes", icon: Settings },
    ],
  },
];

export function LegalSidebar() {
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-semibold tracking-wide px-4 py-3">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="flex items-center gap-3 px-4 py-2.5 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge className="bg-warning text-warning-foreground hover:bg-warning">
                            {item.badge}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 text-sidebar-foreground">
          <div className="flex-1">
            <p className="text-sm font-medium">Dra. Ana Silva</p>
            <p className="text-xs text-sidebar-foreground/70">OAB/SP 123.456</p>
          </div>
          <button className="p-2 hover:bg-sidebar-accent rounded-md transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
