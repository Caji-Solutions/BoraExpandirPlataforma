import { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  Briefcase, 
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  Mail,
  Phone
} from "lucide-react";

// Tipos
interface Processo {
  id: string;
  clienteNome: string;
  tipoServico: string;
  status: 'em_andamento' | 'pendente' | 'aguardando_cliente' | 'concluido';
  prioridade: 'alta' | 'media' | 'baixa';
  dataInicio: string;
  prazo: string;
  progresso: number; // 0-100
}

interface MembroEquipe {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  especialidade: string;
  dataAdmissao: string;
  disponibilidade: 'disponivel' | 'ocupado' | 'ausente';
  avatar?: string;
  processos: Processo[];
  estatisticas: {
    concluidos: number;
    emAndamento: number;
    pendentes: number;
    taxaSucesso: number;
  };
}

// Mock de dados da equipe com processos
const mockEquipe: MembroEquipe[] = [
  {
    id: "MEM-001",
    nome: "Ana Lucia Ferreira",
    email: "ana.lucia@boraexpandir.com",
    telefone: "+351 912 345 678",
    cargo: "Advogada Sênior",
    especialidade: "Cidadania e Nacionalidade",
    dataAdmissao: "2023-03-15",
    disponibilidade: 'disponivel',
    processos: [
      { id: "PR-001", clienteNome: "João Pedro Silva", tipoServico: "Cidadania Portuguesa", status: 'em_andamento', prioridade: 'alta', dataInicio: "2025-11-01", prazo: "2026-02-01", progresso: 65 },
      { id: "PR-002", clienteNome: "Maria Costa", tipoServico: "Visto D7", status: 'pendente', prioridade: 'media', dataInicio: "2025-12-10", prazo: "2026-03-10", progresso: 30 },
      { id: "PR-003", clienteNome: "Carlos Eduardo", tipoServico: "Autorização Residência", status: 'aguardando_cliente', prioridade: 'baixa', dataInicio: "2025-12-20", prazo: "2026-04-20", progresso: 45 },
      { id: "PR-008", clienteNome: "Fernanda Lima", tipoServico: "Cidadania Italiana", status: 'em_andamento', prioridade: 'alta', dataInicio: "2025-10-15", prazo: "2026-01-15", progresso: 80 },
    ],
    estatisticas: { concluidos: 45, emAndamento: 4, pendentes: 2, taxaSucesso: 94 }
  },
  {
    id: "MEM-002",
    nome: "Ricardo Mendes Santos",
    email: "ricardo.mendes@boraexpandir.com",
    telefone: "+351 923 456 789",
    cargo: "Advogado Pleno",
    especialidade: "Vistos e Imigração",
    dataAdmissao: "2023-08-20",
    disponibilidade: 'ocupado',
    processos: [
      { id: "PR-004", clienteNome: "Ana Paula Oliveira", tipoServico: "Visto D7", status: 'em_andamento', prioridade: 'alta', dataInicio: "2025-11-15", prazo: "2026-02-15", progresso: 50 },
      { id: "PR-005", clienteNome: "Roberto Santos", tipoServico: "Renovação Visto", status: 'em_andamento', prioridade: 'media', dataInicio: "2025-12-01", prazo: "2026-01-30", progresso: 70 },
      { id: "PR-006", clienteNome: "Lucia Ferreira", tipoServico: "Visto D2", status: 'pendente', prioridade: 'alta', dataInicio: "2026-01-02", prazo: "2026-04-02", progresso: 15 },
      { id: "PR-009", clienteNome: "Pedro Almeida", tipoServico: "Visto Tech", status: 'aguardando_cliente', prioridade: 'media', dataInicio: "2025-11-20", prazo: "2026-02-20", progresso: 40 },
      { id: "PR-010", clienteNome: "Mariana Costa", tipoServico: "Visto D7", status: 'em_andamento', prioridade: 'baixa', dataInicio: "2025-10-01", prazo: "2026-01-01", progresso: 90 },
    ],
    estatisticas: { concluidos: 32, emAndamento: 5, pendentes: 3, taxaSucesso: 91 }
  },
  {
    id: "MEM-003",
    nome: "Juliana Ferreira Costa",
    email: "juliana.costa@boraexpandir.com",
    telefone: "+351 934 567 890",
    cargo: "Advogada Júnior",
    especialidade: "Documentação e Apostilas",
    dataAdmissao: "2024-06-01",
    disponibilidade: 'disponivel',
    processos: [
      { id: "PR-007", clienteNome: "Bruno Martins", tipoServico: "Apostila Haia", status: 'em_andamento', prioridade: 'media', dataInicio: "2025-12-15", prazo: "2026-01-15", progresso: 85 },
      { id: "PR-011", clienteNome: "Carla Souza", tipoServico: "Tradução Juramentada", status: 'concluido', prioridade: 'baixa', dataInicio: "2025-11-01", prazo: "2025-12-01", progresso: 100 },
    ],
    estatisticas: { concluidos: 18, emAndamento: 1, pendentes: 1, taxaSucesso: 100 }
  },
  {
    id: "MEM-004",
    nome: "Pedro Almeida Junior",
    email: "pedro.almeida@boraexpandir.com",
    telefone: "+351 945 678 901",
    cargo: "Paralegal",
    especialidade: "Suporte Processual",
    dataAdmissao: "2024-09-15",
    disponibilidade: 'disponivel',
    processos: [
      { id: "PR-012", clienteNome: "Thiago Lima", tipoServico: "Suporte Visto D7", status: 'em_andamento', prioridade: 'baixa', dataInicio: "2025-12-20", prazo: "2026-02-20", progresso: 25 },
    ],
    estatisticas: { concluidos: 8, emAndamento: 1, pendentes: 0, taxaSucesso: 100 }
  },
  {
    id: "MEM-005",
    nome: "Mariana Costa Silva",
    email: "mariana.silva@boraexpandir.com",
    telefone: "+351 956 789 012",
    cargo: "Advogada Pleno",
    especialidade: "Direito Empresarial",
    dataAdmissao: "2023-11-01",
    disponibilidade: 'ausente',
    processos: [
      { id: "PR-013", clienteNome: "Empresa XYZ Ltda", tipoServico: "Constituição Empresa", status: 'aguardando_cliente', prioridade: 'alta', dataInicio: "2025-11-10", prazo: "2026-01-10", progresso: 60 },
      { id: "PR-014", clienteNome: "StartUp ABC", tipoServico: "Visto Empreendedor", status: 'pendente', prioridade: 'media', dataInicio: "2025-12-05", prazo: "2026-03-05", progresso: 10 },
    ],
    estatisticas: { concluidos: 28, emAndamento: 0, pendentes: 2, taxaSucesso: 89 }
  },
];

// Componentes auxiliares
function StatusBadge({ status }: { status: Processo['status'] }) {
  const config = {
    em_andamento: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Em Andamento' },
    pendente: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendente' },
    aguardando_cliente: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Aguardando Cliente' },
    concluido: { bg: 'bg-green-100', text: 'text-green-700', label: 'Concluído' },
  };
  const { bg, text, label } = config[status];
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${bg} ${text}`}>{label}</span>;
}

function PrioridadeBadge({ prioridade }: { prioridade: Processo['prioridade'] }) {
  const config = {
    alta: { color: 'text-red-500', label: '●' },
    media: { color: 'text-yellow-500', label: '●' },
    baixa: { color: 'text-green-500', label: '●' },
  };
  return <span className={`${config[prioridade].color} text-lg`} title={`Prioridade ${prioridade}`}>{config[prioridade].label}</span>;
}

function DisponibilidadeBadge({ disponibilidade }: { disponibilidade: MembroEquipe['disponibilidade'] }) {
  const config = {
    disponivel: { bg: 'bg-green-500', text: 'Disponível' },
    ocupado: { bg: 'bg-yellow-500', text: 'Ocupado' },
    ausente: { bg: 'bg-gray-400', text: 'Ausente' },
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${config[disponibilidade].bg}`} />
      <span className="text-sm text-gray-600">{config[disponibilidade].text}</span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all ${
          value >= 80 ? 'bg-green-500' :
          value >= 50 ? 'bg-blue-500' :
          value >= 25 ? 'bg-yellow-500' :
          'bg-red-500'
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

// Componente de Membro Expansível
function MembroCard({ membro }: { membro: MembroEquipe }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const processosAtivos = membro.processos.filter(p => p.status !== 'concluido');

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      {/* Header do Card - Clicável */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
            membro.disponibilidade === 'disponivel' ? 'bg-gradient-to-br from-green-500 to-green-600' :
            membro.disponibilidade === 'ocupado' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
            'bg-gradient-to-br from-gray-400 to-gray-500'
          }`}>
            {membro.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          
          {/* Info */}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-lg">{membro.nome}</h3>
              <DisponibilidadeBadge disponibilidade={membro.disponibilidade} />
            </div>
            <p className="text-gray-500">{membro.cargo} • {membro.especialidade}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Estatísticas Rápidas */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="font-bold text-blue-600">{processosAtivos.length}</p>
              <p className="text-gray-500 text-xs">Ativos</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-green-600">{membro.estatisticas.concluidos}</p>
              <p className="text-gray-500 text-xs">Concluídos</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-purple-600">{membro.estatisticas.taxaSucesso}%</p>
              <p className="text-gray-500 text-xs">Sucesso</p>
            </div>
          </div>

          {/* Ícone de Expansão */}
          <div className={`p-2 rounded-lg transition-all ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
        </div>
      </button>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className="border-t bg-gray-50">
          {/* Info de Contato */}
          <div className="p-4 border-b bg-white flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              {membro.email}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              {membro.telefone}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400" />
              Desde {new Date(membro.dataAdmissao).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
            </div>
          </div>

          {/* Lista de Processos */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-gray-500" />
                Processos Atribuídos ({membro.processos.length})
              </h4>
            </div>

            {membro.processos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>Nenhum processo atribuído</p>
              </div>
            ) : (
              <div className="space-y-3">
                {membro.processos.map((processo) => (
                  <div 
                    key={processo.id}
                    className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <PrioridadeBadge prioridade={processo.prioridade} />
                          <span className="font-medium text-gray-900">{processo.clienteNome}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-500">{processo.id}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{processo.tipoServico}</p>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Início: {new Date(processo.dataInicio).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Prazo: {new Date(processo.prazo).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={processo.status} />
                        <div className="w-24">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progresso</span>
                            <span className="font-medium">{processo.progresso}%</span>
                          </div>
                          <ProgressBar value={processo.progresso} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estatísticas Detalhadas */}
          <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600">{membro.estatisticas.concluidos}</p>
                <p className="text-xs text-gray-500">Concluídos</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-600">{membro.estatisticas.emAndamento}</p>
                <p className="text-xs text-gray-500">Em Andamento</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <AlertCircle className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-yellow-600">{membro.estatisticas.pendentes}</p>
                <p className="text-xs text-gray-500">Pendentes</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <TrendingUp className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-600">{membro.estatisticas.taxaSucesso}%</p>
                <p className="text-xs text-gray-500">Taxa de Sucesso</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function EquipeJuridica() {
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState<string>('todos');

  // Filtrar equipe
  const equipeFiltrada = mockEquipe.filter(membro => 
    filtroDisponibilidade === 'todos' || membro.disponibilidade === filtroDisponibilidade
  );

  // Estatísticas gerais
  const totalProcessos = mockEquipe.reduce((acc, m) => acc + m.processos.length, 0);
  const totalConcluidos = mockEquipe.reduce((acc, m) => acc + m.estatisticas.concluidos, 0);
  const disponiveis = mockEquipe.filter(m => m.disponibilidade === 'disponivel').length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-orange-600 mb-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Área exclusiva para Supervisores</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Equipe Jurídica</h1>
        <p className="text-muted-foreground mt-1">
          Visualize a carga de trabalho e processos de cada membro da equipe
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Membros</p>
              <p className="text-2xl font-bold text-gray-700">{mockEquipe.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Disponíveis</p>
              <p className="text-2xl font-bold text-green-600">{disponiveis}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Processos Ativos</p>
              <p className="text-2xl font-bold text-blue-600">{totalProcessos}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Concluídos</p>
              <p className="text-2xl font-bold text-green-600">{totalConcluidos}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Filtrar por disponibilidade:</span>
        <div className="flex gap-2">
          {['todos', 'disponivel', 'ocupado', 'ausente'].map((filtro) => (
            <button
              key={filtro}
              onClick={() => setFiltroDisponibilidade(filtro)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filtroDisponibilidade === filtro
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filtro === 'todos' ? 'Todos' : 
               filtro === 'disponivel' ? 'Disponíveis' :
               filtro === 'ocupado' ? 'Ocupados' : 'Ausentes'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Membros */}
      <div className="space-y-4">
        {equipeFiltrada.map((membro) => (
          <MembroCard key={membro.id} membro={membro} />
        ))}

        {equipeFiltrada.length === 0 && (
          <div className="text-center py-12 bg-white border rounded-xl">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum membro encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Tente ajustar o filtro de disponibilidade</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EquipeJuridica;
