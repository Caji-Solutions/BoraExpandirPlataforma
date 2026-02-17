import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Home, FolderOpen, FileSearch, CheckSquare, Settings, Users, FileStack, Dna } from "lucide-react";
import { Sidebar } from "../../components/ui/Sidebar";
import type { SidebarGroup } from "../../components/ui/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { ProcessQueue } from "./components/ProcessQueue";
import { ReviewPanel } from "./components/ReviewPanel";
import { Config } from "../../components/ui/Config";
import { DelegacaoDocumentos } from "./components/DelegacaoDocumentos";
import { EquipeJuridica } from "./components/EquipeJuridica";
import { ClientDNAPage } from "../../components/ui/ClientDNA";
import juridicoService, { Processo } from "./services/juridicoService";

import { ProcessTable, ProcessData } from "./components/ProcessTable";

// Simulação: Usuário logado é Supervisor
// Em produção, isso viria do contexto de autenticação
const USUARIO_LOGADO = {
  nome: "Dr. Carlos Lima",
  cargo: "Supervisor Jurídico",
  isSupervisor: true, // Altere para false para testar como usuário comum
};

const mockJuridicoData: ProcessData[] = [
  {
    id: "1",
    clienteId: "1",
    status: "pendente",
    fase: 1,
    processo: 1,
    cliente: { nome: "João Silva" },
    servico: "Familiar de Esp...",
    tipo: "Pedido",
    dataProtocolo: 0,
    prazoResposta: 0,
    observacao: "0",
    valorAcao: "1,00 €",
  },
  {
    id: "2",
    clienteId: "2",
    status: "pendente",
    fase: 2,
    processo: 2,
    cliente: { nome: "Maria Santos" },
    servico: "Visto D7",
    tipo: "Renovação",
    dataProtocolo: "12/12/2024",
    prazoResposta: 15,
    observacao: "Aguardando documentação",
    valorAcao: "500,00 €",
  }
];

  const MeusProcessos = () => {
    const [processes, setProcesses] = useState<ProcessData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchMyProcesses = async () => {
        try {
          setLoading(true);
          // Simulated Lawyer ID for Carlos Lima
          const LAWER_ID = '41f21e5c-dd93-4592-9470-e043badc3a18';
          const data = await juridicoService.getProcessosByResponsavel(LAWER_ID);
          
          const mapped: ProcessData[] = data.map((p: Processo) => ({
            id: p.id,
            clienteId: p.cliente_id,
            status: p.status,
            fase: p.etapa_atual,
            processo: parseInt(p.id.split('-')[0]) || 0,
            cliente: { nome: p.clientes?.nome || 'Cliente Desconhecido' },
            servico: p.tipo_servico,
            tipo: 'Processo Jurídico',
            dataProtocolo: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A',
            valorAcao: '---',
            observacao: p.observacoes || ''
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
    }, []);

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

import { TaskModule } from "../shared/components/TaskModule";

const Tarefas = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">Tarefas</h1>
    {/* Simulating logged in user: Carlos Lima */}
    <TaskModule currentUser="Carlos Lima" />
  </div>
);



const Index = () => {

  // Configuração da sidebar seguindo o padrão do projeto
  // Itens exclusivos para supervisor são adicionados condicionalmente
  const sidebarGroups: SidebarGroup[] = [
    {
      label: "Menu Principal",
      items: [
        { label: "Início", to: "/juridico", icon: Home },
        { label: "DNA do Cliente", to: "/juridico/dna", icon: Dna },
        { label: "Meus Processos", to: "/juridico/processos", icon: FolderOpen },
        { label: "Fila de Análise", to: "/juridico/analise", icon: FileSearch },
        { label: "Tarefas", to: "/juridico/tarefas", icon: CheckSquare },
      ],
    },
    // Grupo exclusivo para Supervisores
    ...(USUARIO_LOGADO.isSupervisor ? [{
      label: "Supervisão",
      items: [
        { label: "Delegação de Documentos", to: "/juridico/delegacao", icon: FileStack },
        { label: "Equipe Jurídica", to: "/juridico/equipe", icon: Users },
      ],
    }] : []),
    {
      label: "Sistema",
      items: [
        { label: "Configurações", to: "/juridico/configuracoes", icon: Settings },
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

            <Route path="configuracoes" element={<Config />} />

            {/* Rotas exclusivas para Supervisores */}
            {USUARIO_LOGADO.isSupervisor && (
              <>
                <Route path="delegacao" element={<DelegacaoDocumentos />} />
                <Route path="equipe" element={<EquipeJuridica />} />
              </>
            )}

            <Route path="*" element={<Navigate to="." replace />} />
          </Routes>
      </main>
    </div>
  );
};

export { Index as JuridicoApp };
export default Index;
