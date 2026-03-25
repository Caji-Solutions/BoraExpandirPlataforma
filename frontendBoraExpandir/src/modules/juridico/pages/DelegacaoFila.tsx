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
  RefreshCw,
  Calendar,
  FileSearch
} from "lucide-react";
import { ModalDelegacao, type MembroEquipe } from "../components/ModalDelegacao";
import { ModalDetalhesItem } from "../components/ModalDetalhesItem";
import juridicoService, { type Processo, type FuncionarioJuridico } from "../services/juridicoService";
import { Badge } from '@/modules/shared/components/ui/badge';
import { Button } from '@/modules/shared/components/ui/button';

// Componente de Status
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    waiting_delegation: { bg: 'bg-red-100', text: 'text-red-700', label: 'Aguardando Delegação' },
    pendente_documentos: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Pendente Docs' },
    em_analise: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Em Análise' },
    aguardando_cliente: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Aguardando Cliente' },
    concluido: { bg: 'bg-green-100', text: 'text-green-700', label: 'Concluído' },
    cancelado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
    confirmado: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmado' },
    agendado: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Agendado' },
  };
  const { bg, text, label } = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${bg} ${text}`}>
      {label}
    </span>
  );
}

// Adaptar Item para o formato do Modal  
function adaptParaModal(item: any) {
  if (item._tipoFila === 'agendamento') {
    return {
      id: item.id,
      clienteNome: item.clientes?.nome || item.nome || 'Cliente não identificado',
      clienteId: item.clientes?.client_id || item.cliente_id || 'N/A',
      tipoServico: item.catalogo_servicos?.nome || item.produto_nome || item.tipo_servico,
      documentos: [], // Agendamentos podem não ter documentos ainda
      dataSubmissao: item.data_hora || item.criado_em,
      prioridade: 'media' as const,
      delegadoPara: item.responsavel?.full_name || null,
      status: item.responsavel_juridico_id ? 'delegado' as const : 'aguardando_delegacao' as const,
      tipo: 'agendamento' as const
    };
  }

  return {
    id: item.id,
    clienteNome: item.clientes?.nome || 'Cliente não identificado',
    clienteId: item.clientes?.client_id || item.cliente_id,
    tipoServico: item.tipo_servico,
    documentos: item.documentos || [],
    dataSubmissao: item.criado_em,
    prioridade: 'media' as const,
    delegadoPara: item.responsavel?.full_name || null,
    status: (item.responsavel_id || item.status !== 'waiting_delegation') ? 'delegado' as const : 'aguardando_delegacao' as const,
    tipo: 'processo' as const
  };
}

// Adaptar FuncionarioJuridico para MembroEquipe
function adaptFuncionarioParaMembro(func: FuncionarioJuridico): MembroEquipe {
  return {
    id: func.id,
    nome: func.full_name || 'Sem nome',
    cargo: 'Equipe Jurídica',
    processosAtivos: 0, // No backend real isso seria calculado
    disponibilidade: 'disponivel' as const,
    horario_trabalho: func.horario_trabalho
  };
}

export default function DelegacaoFila() {
  const [items, setItems] = useState<any[]>([]);
  const [membrosEquipe, setMembrosEquipe] = useState<MembroEquipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filtroStatus, setFiltroStatus] = useState<string>('aguardando_delegacao');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showDelegacaoModal, setShowDelegacaoModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Buscar dados da API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [processosData, agendamentosData, funcionariosData] = await Promise.all([
        juridicoService.getProcessos(),
        juridicoService.getAgendamentosDelegacao(),
        juridicoService.getFuncionariosJuridico()
      ]);

      console.log('--- DEBUG DELEGACAO FILA ---');
      console.log('Processos:', processosData);
      console.log('Agendamentos:', agendamentosData);
      console.log('Funcionarios:', funcionariosData);
      console.log('----------------------------');

      const processosMarcados = processosData.map(p => ({ ...p, _tipoFila: 'processo' }));
      const agendamentosMarcados = agendamentosData.map(a => ({ ...a, _tipoFila: 'agendamento' }));

      setItems([...processosMarcados, ...agendamentosMarcados]);
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

  // Filtrar itens
  const itensFiltrados = items.filter(item => {
    const isProcesso = item._tipoFila === 'processo';
    const responsavelId = isProcesso ? item.responsavel_id : item.responsavel_juridico_id;
    const status = item.status;
    
    // Lógica de "aguardando delegação"
    const isAguardando = isProcesso 
      ? (!responsavelId || status === 'waiting_delegation')
      : (!responsavelId || status === 'confirmado');
    
    // Lógica de "delegado"
    const isDelegado = isProcesso
      ? (responsavelId !== null && status !== 'waiting_delegation')
      : (responsavelId !== null);

    const matchStatus = 
      filtroStatus === 'todos' || 
      (filtroStatus === 'aguardando_delegacao' && isAguardando) ||
      (filtroStatus === 'delegado' && isDelegado) ||
      status === filtroStatus;
    
    const nomeCliente = item.clientes?.nome || item.nome || '';
    const tipoServico = item.tipo_servico || item.produto_nome || '';
    const clienteCodigo = item.clientes?.client_id || '';
    const matchSearch = 
      nomeCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tipoServico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clienteCodigo.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchStatus && matchSearch;
  });

  // Estatísticas
  const aguardandoDelegacao = items.filter(item => {
    const isProcesso = item._tipoFila === 'processo';
    const responsavelId = isProcesso ? item.responsavel_id : item.responsavel_juridico_id;
    const status = item.status;
    return isProcesso 
      ? (!responsavelId || status === 'waiting_delegation')
      : (!responsavelId || status === 'confirmado');
  }).length;

  const delegados = items.filter(item => {
    const isProcesso = item._tipoFila === 'processo';
    const responsavelId = isProcesso ? item.responsavel_id : item.responsavel_juridico_id;
    const status = item.status;
    return isProcesso
      ? (responsavelId !== null && status !== 'waiting_delegation')
      : (responsavelId !== null);
  }).length;

  // Callback após delegação
  const handleDelegacao = () => {
    fetchData();
    setShowDelegacaoModal(false);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Carregando fila de delegação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mb-2">
            <AlertCircle className="h-4 w-4" />
            Supervisão Jurídica
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Fila de Delegação</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Atribua responsáveis aos processos que aguardam delegação.
          </p>
        </div>
        <Button 
          onClick={fetchData} 
          variant="outline" 
          className="rounded-2xl border-2 h-12 px-6 flex gap-2 font-bold hover:bg-muted transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Fila
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border-none shadow-xl rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Clock className="h-16 w-16" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Aguardando Delegação</p>
          <p className="text-4xl font-black mt-2 text-red-500">{aguardandoDelegacao}</p>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="destructive" className="rounded-full px-2 py-0 text-[10px]">Ação Necessária</Badge>
          </div>
        </div>

        <div className="bg-card border-none shadow-xl rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <UserPlus className="h-16 w-16" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Processos Delegados</p>
          <p className="text-4xl font-black mt-2 text-primary">{delegados}</p>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px]">Em Andamento</Badge>
          </div>
        </div>

        <div className="bg-card border-none shadow-xl rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <FileText className="h-16 w-16" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total de Solicitações</p>
          <p className="text-4xl font-black mt-2 text-foreground">{items.length}</p>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px]">Volume Total</Badge>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card border-none shadow-2xl rounded-3xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Status da Fila</label>
            <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value)}
                className="w-full bg-muted/50 border-2 border-transparent focus:border-primary/20 p-3 rounded-2xl text-sm font-bold focus:outline-none transition-all cursor-pointer appearance-none"
            >
                <option value="todos">Todos os Processos</option>
                <option value="aguardando_delegacao">Somente Aguardando Delegação</option>
                <option value="delegado">Somente Delegados</option>
                <option value="em_analise">Em Análise</option>
                <option value="concluido">Concluídos</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Busca Rápida</label>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
                <input
                    type="text"
                    placeholder="Nome do cliente ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 p-3 bg-muted/50 border-2 border-transparent focus:border-primary/20 rounded-2xl focus:outline-none transition-all shadow-inner font-medium"
                />
            </div>
          </div>
        </div>
      </div>

      {/* Process List */}
      <div className="bg-card border-none shadow-2xl rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 border-b">
                <th className="text-left px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cliente</th>
                <th className="text-left px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Serviço Solicitado</th>
                <th className="text-center px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="text-left px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Responsável</th>
                <th className="text-right px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {itensFiltrados.map((item) => {
                const isProcesso = item._tipoFila === 'processo';
                const responsavelId = isProcesso ? item.responsavel_id : item.responsavel_juridico_id;
                const status = item.status;
                const isAguardando = isProcesso 
                  ? (!responsavelId || status === 'waiting_delegation')
                  : (!responsavelId || status === 'confirmado');

                return (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">{item.clientes?.nome || item.nome || 'N/A'}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">ID: {item.clientes?.client_id || item.cliente_id || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                        {isProcesso ? <FileText className="h-4 w-4 text-muted-foreground" /> : <Calendar className="h-4 w-4 text-muted-foreground" />}
                        <div className="flex flex-col">
                          <span>{item.catalogo_servicos?.nome || item.tipo_servico || item.produto_nome}</span>
                          {item.formularios_cliente?.[0] && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-bold uppercase">
                                {item.formularios_cliente[0].pais_destino || 'N/A'}
                              </span>
                              <span className="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100 font-bold uppercase truncate max-w-[150px]">
                                {item.formularios_cliente[0].objetivo_imigracao || 'N/A'}
                              </span>
                            </div>
                          )}
                          {!isProcesso && item.data_hora && (
                            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {new Date(item.data_hora).toLocaleString('pt-BR', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-6 py-5">
                      {item.responsavel ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                            <span className="text-primary text-xs font-black">
                              {item.responsavel.full_name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-foreground/80">{item.responsavel.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic font-medium px-3 py-1 bg-muted/50 rounded-full">Não Atribuído</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      {isAguardando ? (
                        <Button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDelegacaoModal(true);
                          }}
                          className="rounded-xl text-xs font-black uppercase tracking-widest px-6 h-10 shadow-lg shadow-primary/20 transition-all active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Delegar
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDetailsModal(true);
                          }}
                          variant="outline"
                          className="rounded-xl text-xs font-black uppercase tracking-widest px-6 h-10 border-2 hover:bg-muted transition-all active:scale-95"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detalhes
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {itensFiltrados.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="bg-muted/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <FileSearch className="h-10 w-10 text-muted-foreground opacity-30" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground/40">Nenhum item nesta fila</p>
              <p className="text-sm text-muted-foreground mt-1">Sua fila de trabalho está em dia!</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Delegação */}
      {selectedItem && (
        <ModalDelegacao
          isOpen={showDelegacaoModal}
          documento={adaptParaModal(selectedItem)}
          membrosEquipe={membrosEquipe}
          onClose={() => {
            setShowDelegacaoModal(false);
            setSelectedItem(null);
          }}
          onDelegar={handleDelegacao}
        />
      )}

      {/* Modal de Detalhes */}
      {selectedItem && (
        <ModalDetalhesItem
          isOpen={showDetailsModal}
          item={selectedItem}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}
