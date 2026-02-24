import { useState, useEffect } from "react";
import { Activity, Shield, Library, FileText, Settings, ShieldAlert, Settings2, Users, ChevronDown, ChevronRight, UserCircle, LogOut, Dna, Languages } from "lucide-react";
import { NavLink } from "./NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { useAuth } from "../../../contexts/AuthContext";
import type { UserProfile } from "../../../contexts/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const mainMenuItems = [
  { title: "Dashboard Mestre", url: "/adm", icon: Activity },
  { title: "DNA do Cliente", url: "/adm/dna", icon: Dna },
  { title: "Auditoria & Logs", url: "/adm/audit", icon: FileText },
];

const adminMenuItems = [
  { title: "Cockpit do Dono", url: "/adm/cockpit", icon: Activity },
  { title: "Auditoria & Aprovações", url: "/adm/approvals", icon: ShieldAlert },
  { title: "Configurar Serviços", url: "/adm/services", icon: Settings2 },
  { title: "Gestão de Equipe", url: "/adm/team", icon: Users },
];

interface SectorTeam {
  label: string;
  role: string;
  members: UserProfile[];
  loading: boolean;
  expanded: boolean;
}

const sectorConfig = [
  { label: "Comercial (C1/C2)", role: "comercial", route: "/comercial" },
  { label: "Jurídico", role: "juridico", route: "/juridico" },
  { label: "Administrativo", role: "administrativo", route: "/financeiro" },
  { label: "Tradutor", role: "tradutor", route: "/tradutor" },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const { token, setImpersonatedProfile, impersonatedProfile, logout, profile } = useAuth();
  const navigate = useNavigate();

  const [sectors, setSectors] = useState<SectorTeam[]>(
    sectorConfig.map((s) => ({
      label: s.label,
      role: s.role,
      members: [],
      loading: false,
      expanded: false,
    }))
  );

  const fetchSectorTeam = async (role: string, index: number) => {
    setSectors((prev) =>
      prev.map((s, i) => (i === index ? { ...s, loading: true } : s))
    );

    try {
      const res = await fetch(`${BACKEND_URL}/auth/team/${role}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setSectors((prev) =>
          prev.map((s, i) => (i === index ? { ...s, members: data, loading: false } : s))
        );
      }
    } catch {
      setSectors((prev) =>
        prev.map((s, i) => (i === index ? { ...s, loading: false } : s))
      );
    }
  };

  const toggleSector = (index: number) => {
    setSectors((prev) =>
      prev.map((s, i) => {
        if (i === index) {
          const willExpand = !s.expanded;
          // Fetch on first expand
          if (willExpand && s.members.length === 0 && !s.loading) {
            fetchSectorTeam(s.role, index);
          }
          return { ...s, expanded: willExpand };
        }
        return s;
      })
    );
  };

  const handleImpersonate = (member: UserProfile) => {
    const sector = sectorConfig.find((s) => s.role === member.role);
    setImpersonatedProfile(member);
    if (sector) {
      navigate(sector.route);
    }
  };

  const handleStopImpersonating = () => {
    setImpersonatedProfile(null);
    navigate("/adm");
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="px-6 py-4 border-b border-sidebar-border">
          <h1 className="text-lg font-semibold text-sidebar-foreground">
            {open ? "Admin Portal" : "AP"}
          </h1>
          {open && profile && (
            <p className="text-xs text-sidebar-foreground/50 mt-1 truncate">
              {profile.full_name}
            </p>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 px-6">
            Controle Mestre
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/adm"}
                      className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary"
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 px-6">
            Administração
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/adm"}
                      className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium border-l-2 border-sidebar-primary"
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Setores com membros */}
        {open && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60 px-6">
              Setores
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 space-y-1">
                {sectors.map((sector, index) => (
                  <div key={sector.role}>
                    <button
                      onClick={() => toggleSector(index)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
                    >
                      {sector.expanded ? (
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span className="font-medium">{sector.label}</span>
                      {sector.members.length > 0 && (
                        <span className="ml-auto text-xs text-sidebar-foreground/40 bg-sidebar-accent px-1.5 py-0.5 rounded">
                          {sector.members.length}
                        </span>
                      )}
                    </button>

                    {sector.expanded && (
                      <div className="ml-4 mt-1 space-y-0.5">
                        {sector.loading ? (
                          <div className="px-3 py-2 text-xs text-sidebar-foreground/40">
                            Carregando...
                          </div>
                        ) : sector.members.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-sidebar-foreground/40 italic">
                            Nenhum membro
                          </div>
                        ) : (
                          sector.members.map((member) => (
                            <button
                              key={member.id}
                              onClick={() => handleImpersonate(member)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 rounded-md transition-colors"
                              title={`Ver como ${member.full_name}`}
                            >
                              <UserCircle className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{member.full_name}</span>
                              {member.is_supervisor && (
                                <span className="text-amber-500 text-xs">★</span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Botão de sair */}
        {open && (
          <div className="mt-auto px-6 py-4 border-t border-sidebar-border">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
