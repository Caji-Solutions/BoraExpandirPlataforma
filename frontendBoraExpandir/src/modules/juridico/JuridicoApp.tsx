import { Routes, Route, Navigate } from "react-router-dom";
import { Home, FileSearch, CheckSquare, Settings, Dna, Clock, FileCheck, FileText } from "lucide-react";
import { Sidebar } from "@/components/ui/Sidebar";
import type { SidebarGroup } from "@/components/ui/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { ProcessQueue } from "./components/ProcessQueue";
import { ReviewPanel } from "./components/ReviewPanel";
import { Config } from "@/components/ui/Config";
import { AssessoriaJuridica } from "./pages/AssessoriaJuridica";
import { ProcessosProtocolados } from "./pages/ProcessosProtocolados";
import { ProcessoProtocoladoDetalhes } from "./pages/ProcessoProtocoladoDetalhes";
import { MeusAgendamentos } from "../../components/MeusAgendamentos";
import { ClientDNAPage } from "@/components/ui/ClientDNA";
import { AssessoriaDiretaJuridicoPage } from "./pages/AssessoriaDiretaJuridicoPage";
import { AssessoriaDiretaDetail } from "./pages/AssessoriaDiretaDetail";

import { useAuth } from "../../contexts/AuthContext";
import { TaskModule } from "../shared/components/TaskModule";

const Tarefas = () => {
  const { activeProfile } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Tarefas</h1>
      <TaskModule currentUser={activeProfile?.full_name || "Usuário"} />
    </div>
  );
};

const Index = () => {
  const { activeProfile } = useAuth();

  const isSupervisor = activeProfile?.is_supervisor || activeProfile?.role === 'super_admin';

  const sidebarGroups: SidebarGroup[] = [
    {
      label: "Menu Principal",
      items: [
        { label: "Início", to: "/juridico", icon: Home },
        { label: "DNA do Cliente", to: "/juridico/dna", icon: Dna },
        { label: "Fila de Análise", to: "/juridico/analise", icon: FileSearch },
        ...(isSupervisor ? [{ label: "Processos Protocolados", to: "/juridico/protocolados", icon: FileCheck }] : []),
        { label: "Assessoria Direta", to: "/juridico/assessoria-direta", icon: FileText },
        { label: "Tarefas", to: "/juridico/tarefas", icon: CheckSquare },
        { label: "Agendamentos", to: "/juridico/meus-agendamentos", icon: Clock },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar groups={sidebarGroups} />

      <main className="ml-64 p-6 text-foreground">

        <Routes>
            <Route index element={<Dashboard />} />
            <Route
              path="analise"
              element={
                <ProcessQueue />
              }
            />
            <Route path="tarefas" element={<Tarefas />} />
            <Route path="dna" element={<ClientDNAPage />} />
            <Route path="assessoria" element={<AssessoriaJuridica />} />
            <Route path="assessoria-direta" element={<AssessoriaDiretaJuridicoPage />} />
            <Route path="assessoria-direta/:id" element={<AssessoriaDiretaDetail />} />
            <Route path="protocolados" element={<ProcessosProtocolados />} />
            <Route path="protocolado/:id" element={<ProcessoProtocoladoDetalhes />} />
            <Route path="meus-agendamentos" element={<MeusAgendamentos userId={activeProfile?.id} />} />

            <Route path="configuracoes" element={<Config />} />


            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
      </main>
    </div>
  );
};

export { Index as JuridicoApp };
export default Index;
