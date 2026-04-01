import { useState } from "react";
import { Activity, Shield, Library, FileText, Settings, ShieldAlert, Settings2, Users, ChevronDown, ChevronRight, UserCircle, LogOut, Dna, Languages, CreditCard, PieChart, BarChart, HandCoins, Wallet, Target, Menu, X } from "lucide-react";
import { NavLink } from "./NavLink";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "../../../contexts/AuthContext";
import type { UserProfile } from "../../../contexts/AuthContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const mainMenuItems = [
  { title: "Dashboard Mestre", url: "/adm", icon: Activity },
  { title: "DNA do Cliente", url: "/adm/dna", icon: Dna },
];

const adminMenuItems = [
  { title: "Meus Contratos", url: "/adm/contratos", icon: FileText },
  { title: "Configurar Serviços", url: "/adm/services", icon: Settings2 },
  { title: "Gestão de Equipe", url: "/adm/team", icon: Users },
  { title: "Metas Comerciais", url: "/adm/metas", icon: Target },
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

interface AdminSidebarProps {
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export function AdminSidebar({ sidebarOpen = false, setSidebarOpen }: AdminSidebarProps) {
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
    <>
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setSidebarOpen?.(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 shrink-0 border-r bg-sidebar border-sidebar-border text-sidebar-foreground flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0 z-30" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="px-6 py-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between gap-2 mb-2">
            <img
              src="/assets/bora-logo.png"
              alt="BoraExpandir"
              className="h-14 w-auto max-w-full"
            />
            <button
              onClick={() => setSidebarOpen?.(false)}
              className="md:hidden p-1 rounded hover:bg-sidebar-accent transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <h1 className="text-lg font-semibold text-sidebar-foreground">Admin Portal</h1>
          {profile && (
            <p className="text-xs text-sidebar-foreground/50 mt-1 truncate">
              {profile.full_name}
            </p>
          )}
        </div>

        {/* Impersonation Banner - Super Admin like another user */}
        {impersonatedProfile && (
          <div className="mx-3 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-xs text-amber-600 font-medium">Visualizando como:</p>
            <p className="text-sm text-amber-700 font-semibold truncate">
              {impersonatedProfile.full_name}
            </p>
            <button
              onClick={handleStopImpersonating}
              className="mt-2 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium transition-colors"
            >
              Voltar ao Admin
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
          {/* Main Menu */}
          <div>
            <div className="px-4 py-2 text-xs uppercase tracking-wide text-sidebar-foreground/60 font-semibold">
              Controle Mestre
            </div>
            <ul className="space-y-1">
              {mainMenuItems.map((item) => (
                <li key={item.title}>
                  <NavLink
                    to={item.url}
                    end={item.url === "/adm"}
                    className="flex items-center gap-3 px-4 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin Menu */}
          <div>
            <div className="px-4 py-2 text-xs uppercase tracking-wide text-sidebar-foreground/60 font-semibold">
              Administração
            </div>
            <ul className="space-y-1">
              {adminMenuItems.map((item) => (
                <li key={item.title}>
                  <NavLink
                    to={item.url}
                    end={item.url === "/adm"}
                    className="flex items-center gap-3 px-4 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Sectors with members */}
          <div>
            <div className="px-4 py-2 text-xs uppercase tracking-wide text-sidebar-foreground/60 font-semibold">
              Setores
            </div>
            <div className="space-y-1">
              {sectors.map((sector, index) => (
                <div key={sector.role}>
                  <button
                    onClick={() => toggleSector(index)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
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
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 rounded-md transition-colors"
                            title={`Ver como ${member.full_name}`}
                          >
                            <UserCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{member.full_name}{member.nivel ? ` (${member.nivel})` : ''}</span>
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
          </div>
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-sidebar-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
