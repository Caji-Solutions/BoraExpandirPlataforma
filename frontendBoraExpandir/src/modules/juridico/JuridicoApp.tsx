import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Home, FolderOpen, FileSearch, CheckSquare, Settings, Dna, Clock, FileCheck } from "lucide-react";
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
import juridicoService, { Processo } from "./services/juridicoService";

import { ProcessTable, ProcessData } from "./components/ProcessTable";
import { useAuth } from "../../contexts/AuthContext";
import { TaskModule } from "../shared/components/TaskModule";

const MeusProcessos = () => {
  const { activeProfile } = useAuth();
  const [processes, setProcesses] = useState<ProcessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyProcesses = async () => {
      try {
        setLoading(true);
        if (!activeProfile?.id) return;
        
        const data = await juridicoService.getProcessosByResponsavel(activeProfile.id);
        
        const mapped: ProcessData[] = data.map((p: Processo) => ({
          id: p.id,
          clienteId: p.cliente_id,
          status: p.status,
          fase: p.etapa_atual,
          processo: parseInt(p.id.split('-')[0]) || 0,
          cliente: { nome: p.clientes?.nome || 'Cliente Desconhecido' },
          servico: p.tipo_servico,
          tipo: 'Processo Jurídico',
          dataProtocolo: p.criado_em ? new Date(p.criado_em).toLocaleDateString() : 'N/A',
          valorAcao: '---',
          observacao: p.observacoes || '',
          hasRequirement: p.requerimentos && p.requerimentos.length > 0
        }));
        
        setProcesses(mapped);
      } catch (err) {
        console.error("Failed to fetch personal processes", err);
        setError("Não foi possível carregar seus processos.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProcesses();
  }, [activeProfile?.id]);

  if (loading) return (
    <div className="p-8 text-center animate-pulse">
      <p className="text-muted-foreground">Carregando seus processos...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-500">
      <p>{error}</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Meus Processos</h1>
        <p className="text-muted-foreground">Gestão dos seus casos em andamento</p>
      </div>
      <ProcessTable 
        data={processes} 
      />
    </div>
  );
};

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
        { label: "Meus Processos", to: "/juridico/processos", icon: FolderOpen },
        { label: "Fila de Análise", to: "/juridico/analise", icon: FileSearch },
        ...(isSupervisor ? [{ label: "Processos Protocolados", to: "/juridico/protocolados", icon: FileCheck }] : []),
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
            <Route path="processos" element={<MeusProcessos />} />
            <Route
              path="analise"
              element={
                <ProcessQueue />
              }
            />
            <Route path="tarefas" element={<Tarefas />} />
            <Route path="dna" element={<ClientDNAPage />} />
            <Route path="assessoria" element={<AssessoriaJuridica />} />
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
