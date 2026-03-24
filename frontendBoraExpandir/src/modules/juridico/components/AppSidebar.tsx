import { Home, FolderOpen, FileSearch, CheckSquare, DollarSign, Settings, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/modules/shared/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/shared/components/ui/avatar";
import { Button } from "@/modules/shared/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const menuItems = [
  { title: "Início", icon: Home, id: "home" },
  { title: "Meus Processos", icon: FolderOpen, id: "processes" },
  { title: "Fila de Análise", icon: FileSearch, id: "analysis" },
  { title: "Tarefas", icon: CheckSquare, id: "tasks" },
  { title: "Financeiro", icon: DollarSign, id: "finance" },
  { title: "Configurações", icon: Settings, id: "settings" },
];

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout?: () => void;
}

export function AppSidebar({ activeView, onViewChange, onLogout }: AppSidebarProps) {
  return (
    <Sidebar className="border-r bg-sidebar">
      <SidebarContent>
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-sidebar-foreground">Portal Jurídico</h2>
          <p className="text-xs text-muted-foreground mt-1">Sistema de Imigração</p>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
                    className="w-full"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://ui-avatars.com/api/?name=Ana+Silva&background=0D8ABC&color=fff" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">Dra. Ana Silva</p>
              <p className="text-xs text-muted-foreground truncate">Jurídico</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={() => onLogout?.()} aria-label="Sair da sessão">
              <LogOut />
              Sair
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
