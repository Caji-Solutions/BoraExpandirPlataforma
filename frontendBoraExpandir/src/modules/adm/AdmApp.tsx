import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import ServiceCatalog from "./pages/admin/ServiceCatalog";
import AuditLogs from "./pages/admin/AuditLogs";
import CockpitDoDoNo from "./pages/admin/CockpitDoDoNo";
import AuditoriaAprovacoes from "./pages/admin/AuditoriaAprovacoes";
import GestaoTradutores from "./pages/admin/GestaoTradutores";
import PagamentosAdmin from "./pages/admin/PagamentosAdmin";
import { Config } from "../../components/ui/Config";
import { ClientDNAPage } from "../../components/ui/ClientDNA";

// Importar componentes financeiros
import { FinancialDashboard } from "../financeiro/pages/VisaoGeral";
import { FinancialProcessList } from "../financeiro/pages/FinancialProcessList";
import Comissoes from "../financeiro/pages/Comissoes";
import { Relatorios } from "../financeiro/pages/Relatorios";

// Importar componentes jurídicos
import { Dashboard as JuridicoDashboard } from "../juridico/components/Dashboard";
import { ProcessQueue } from "../juridico/components/ProcessQueue";
import { ProcessTable, ProcessData } from "../juridico/components/ProcessTable";
import { TaskModule } from "../shared/components/TaskModule";

// Mock data para processos jurídicos
const mockJuridicoData: ProcessData[] = [
  {
    id: "1",
    status: "Preparando",
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
    status: "Análise",
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

// Componentes wrapper para rotas jurídicas
const JuridicoProcessos = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">Processos Jurídicos</h1>
    <ProcessTable data={mockJuridicoData} />
  </div>
);

const JuridicoTarefas = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-6">Tarefas Jurídicas</h1>
    <TaskModule currentUser="Admin" />
  </div>
);

const NotFound = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Página não encontrada</h1>
    <p className="text-muted-foreground mt-2">A página que você procura não existe.</p>
  </div>
);

const App = () => (
  <AdminLayout>
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="team" element={<UserManagement />} />
      <Route path="services" element={<ServiceCatalog />} />
      <Route path="tradutores" element={<GestaoTradutores />} />
      <Route path="audit" element={<AuditLogs />} />
      <Route path="cockpit" element={<CockpitDoDoNo />} />
      <Route path="approvals" element={<AuditoriaAprovacoes />} />
      <Route path="dna" element={<ClientDNAPage />} />

      {/* Rotas Financeiras */}
      <Route path="financeiro/visao-geral" element={<FinancialDashboard />} />
      <Route path="financeiro/contas-receber" element={<FinancialProcessList />} />
      <Route path="financeiro/comissoes" element={<Comissoes />} />
      <Route path="financeiro/pagamentos" element={<PagamentosAdmin />} />
      <Route path="financeiro/relatorios" element={<Relatorios />} />

      {/* Rotas Jurídicas */}
      <Route path="juridico" element={<JuridicoDashboard />} />
      <Route path="juridico/processos" element={<JuridicoProcessos />} />
      <Route path="juridico/analise" element={<ProcessQueue onSelectProcess={() => { }} />} />
      <Route path="juridico/tarefas" element={<JuridicoTarefas />} />

      <Route path="configuracoes" element={<Config />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AdminLayout>
);

export default App;
