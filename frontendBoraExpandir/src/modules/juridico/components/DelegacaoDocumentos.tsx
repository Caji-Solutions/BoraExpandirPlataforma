import { useState, useEffect } from "react";
import { 
  FileText, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Filter,
  Search,
  UserPlus,
  Eye,
  Loader2,
  RefreshCw
} from "lucide-react";
import { ModalDelegacao, type MembroEquipe } from "./ModalDelegacao";
import { getProcessos, getFuncionariosJuridico, type Processo, type FuncionarioJuridico } from "../services/juridicoService";

// Componente de Status
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pendente_documentos: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Pendente Docs' },
    em_analise: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Em Análise' },
    aguardando_cliente: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Aguardando Cliente' },
    concluido: { bg: 'bg-green-100', text: 'text-green-700', label: 'Concluído' },
    cancelado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
  };
  const { bg, text, label } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${bg} ${text}`}>
      {label}
    </span>
  );
}

// Componente de Disponibilidade para uso na lista de equipe
function DisponibilidadeBadge({ disponibilidade }: { disponibilidade: MembroEquipe['disponibilidade'] }) {
  const config = {
    disponivel: { bg: 'bg-green-500', label: 'Disponível' },
    ocupado: { bg: 'bg-yellow-500', label: 'Ocupado' },
    ausente: { bg: 'bg-gray-400', label: 'Ausente' },
  };
  const { bg } = config[disponibilidade];
  return (
    <span className={`w-2.5 h-2.5 rounded-full ${bg}`} title={config[disponibilidade].label} />
  );
}

// Adaptar Processo para o formato do Modal  
function adaptProcessoParaModal(processo: Processo) {
  return {
    id: processo.id,
    clienteNome: processo.clientes?.nome || 'Cliente não identificado',
    clienteId: processo.cliente_id,
    tipoServico: processo.tipo_servico,
    documentos: processo.documentos || [],
    dataSubmissao: processo.created_at,
    prioridade: 'media' as const,
    delegadoPara: processo.responsavel?.full_name || null,
    status: processo.responsavel_id ? 'delegado' as const : 'aguardando_delegacao' as const,
  };
}

// Adaptar FuncionarioJuridico para MembroEquipe
function adaptFuncionarioParaMembro(func: FuncionarioJuridico): MembroEquipe {
  return {
    id: func.id,
    nome: func.full_name || 'Sem nome',
    cargo: 'Equipe Jurídica',
    processosAtivos: 0, // TODO: buscar da API
    disponibilidade: 'disponivel' as const,
  };
}

export function DelegacaoDocumentos() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [membrosEquipe, setMembrosEquipe] = useState<MembroEquipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);
  const [showDelegacaoModal, setShowDelegacaoModal] = useState(false);

  // Buscar dados da API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [processosData, funcionariosData] = await Promise.all([
        getProcessos(),
        getFuncionariosJuridico()
      ]);
      setProcessos(processosData);
      setMembrosEquipe(funcionariosData.map(adaptFuncionarioParaMembro));
    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrar processos
  const processosFiltrados = processos.filter(proc => {
    const isDelegado = proc.responsavel_id !== null;
    const matchStatus = 
      filtroStatus === 'todos' || 
      (filtroStatus === 'delegado' && isDelegado) ||
      (filtroStatus === 'aguardando_delegacao' && !isDelegado) ||
      proc.status === filtroStatus;
    
    const nomeCliente = proc.clientes?.nome || '';
    const matchSearch = 
      nomeCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.tipo_servico.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchStatus && matchSearch;
  });

  // Estatísticas
  const aguardandoDelegacao = processos.filter(p => !p.responsavel_id).length;
  const delegados = processos.filter(p => p.responsavel_id !== null).length;
  const emAnalise = processos.filter(p => p.status === 'em_analise').length;

  // Callback após delegação
  const handleDelegacao = (processoId: string, membroId: string) => {
    // Recarregar dados para refletir a mudança
    fetchData();
    setShowDelegacaoModal(false);
    setSelectedProcesso(null);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Carregando processos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-orange-600 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Área exclusiva para Supervisores</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Delegação de Processos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e delegue os processos para a equipe jurídica
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aguardando Delegação</p>
              <p className="text-2xl font-bold text-orange-600">{aguardandoDelegacao}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Delegados</p>
              <p className="text-2xl font-bold text-blue-600">{delegados}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Análise</p>
              <p className="text-2xl font-bold text-purple-600">{emAnalise}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Processos</p>
              <p className="text-2xl font-bold text-gray-700">{processos.length}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="aguardando_delegacao">Aguardando Delegação</option>
              <option value="delegado">Delegado</option>
              <option value="em_analise">Em Análise</option>
              <option value="pendente_documentos">Pendente Docs</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Processos */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Etapa</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delegado Para</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processosFiltrados.map((processo) => (
                <tr key={processo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{processo.clientes?.nome || 'N/A'}</p>
                      <p className="text-sm text-gray-500 font-mono">{processo.cliente_id.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{processo.tipo_servico}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">
                      Etapa {processo.etapa_atual}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={processo.status} />
                  </td>
                  <td className="px-6 py-4">
                    {processo.responsavel ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {processo.responsavel.full_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="text-gray-700">{processo.responsavel.full_name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Não delegado</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedProcesso(processo);
                          setShowDelegacaoModal(true);
                        }}
                        disabled={processo.responsavel_id !== null}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          processo.responsavel_id === null
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <UserPlus className="h-4 w-4" />
                        Delegar
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {processosFiltrados.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum processo encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </div>

      {/* Equipe Disponível */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipe Jurídica</h2>
        {membrosEquipe.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {membrosEquipe.map((membro) => (
              <div 
                key={membro.id} 
                className="p-4 border rounded-lg border-green-200 bg-green-50/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {membro.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{membro.nome}</p>
                        <DisponibilidadeBadge disponibilidade={membro.disponibilidade} />
                      </div>
                      <p className="text-sm text-gray-500">{membro.cargo}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p>Nenhum funcionário do jurídico cadastrado</p>
            <p className="text-sm text-gray-400 mt-1">Adicione funcionários com role 'juridico' na tabela profiles</p>
          </div>
        )}
      </div>

      {/* Modal de Delegação */}
      {selectedProcesso && (
        <ModalDelegacao
          isOpen={showDelegacaoModal}
          documento={adaptProcessoParaModal(selectedProcesso)}
          membrosEquipe={membrosEquipe}
          onClose={() => {
            setShowDelegacaoModal(false);
            setSelectedProcesso(null);
          }}
          onDelegar={handleDelegacao}
        />
      )}
    </div>
  );
}

export default DelegacaoDocumentos;
