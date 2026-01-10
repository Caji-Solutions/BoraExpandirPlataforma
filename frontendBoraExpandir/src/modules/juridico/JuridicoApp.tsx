import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Home, FolderOpen, FileSearch, CheckSquare, DollarSign, Settings, Users, FileStack } from "lucide-react";
import { Sidebar } from "../../components/ui/Sidebar";
import type { SidebarGroup } from "../../components/ui/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { ProcessQueue } from "./components/ProcessQueue";
import { ReviewPanel } from "./components/ReviewPanel";
import { Config } from "../../components/ui/Config";
import { DelegacaoDocumentos } from "./components/DelegacaoDocumentos";
import { EquipeJuridica } from "./components/EquipeJuridica";

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

const MeusProcessos = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">Meus Processos</h1>
    <ProcessTable data={mockJuridicoData} />
  </div>
);

import { TaskModule } from "../shared/components/TaskModule";

const Tarefas = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">Tarefas</h1>
    {/* Simulating logged in user: Carlos Lima */}
    <TaskModule currentUser="Carlos Lima" />
  </div>
);

const Financeiro = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Financeiro</h1>
    <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
  </div>
);

const Index = () => {
  const [selectedProcess, setSelectedProcess] = useState<{
    clientName: string;
    visaType: string;
  } | null>(null);

  // Configuração da sidebar seguindo o padrão do projeto
  // Itens exclusivos para supervisor são adicionados condicionalmente
  const sidebarGroups: SidebarGroup[] = [
    {
      label: "Menu Principal",
      items: [
        { label: "Início", to: "/juridico", icon: Home },
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
        { label: "Financeiro", to: "/juridico/financeiro", icon: DollarSign },
        { label: "Configurações", to: "/juridico/configuracoes", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar groups={sidebarGroups} />

      <main className="ml-64 p-6">
        {/* Badge de Supervisor */}
        {USUARIO_LOGADO.isSupervisor && (
          <div className="mb-4 flex items-center gap-2">
            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
              👑 Supervisor
            </span>
            <span className="text-sm text-muted-foreground">
              Logado como {USUARIO_LOGADO.nome}
            </span>
          </div>
        )}

        {selectedProcess && (
          <div className="border-b bg-muted/30 p-4 -m-6 mb-6">
            <button
              onClick={() => setSelectedProcess(null)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              ← Voltar para Fila de Análise
            </button>
          </div>
        )}

        {selectedProcess ? (
          <ReviewPanel
            clientName={selectedProcess.clientName}
            visaType={selectedProcess.visaType}
          />
        ) : (
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="processos" element={<MeusProcessos />} />
            <Route
              path="analise"
              element={
                <ProcessQueue
                  onSelectProcess={(process) =>
                    setSelectedProcess({
                      clientName: process.clientName,
                      visaType: process.serviceType,
                    })
                  }
                />
              }
            />
            <Route path="tarefas" element={<Tarefas />} />
            <Route path="financeiro" element={<Financeiro />} />
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
        )}
      </main>
    </div>
  );
};

export { Index as JuridicoApp };
export default Index;
