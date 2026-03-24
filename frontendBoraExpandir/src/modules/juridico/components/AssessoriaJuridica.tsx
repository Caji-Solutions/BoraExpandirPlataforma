import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Loader2, 
  AlertCircle, 
  ChevronRight, 
  ClipboardCheck,
  User,
  Scale,
  PlusCircle,
  HelpCircle,
  Save,
  CheckCircle2,
  Trash2,
  FileSearch,
  Send,
  Calendar,
  RotateCcw
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import juridicoService, { ClienteComResponsavel } from "../services/juridicoService";
import { RequirementRequestModal } from './RequirementRequestModal';

interface Question {
  id: string;
  text: string;
  type: 'yes_no' | 'text' | 'number';
  value: string | boolean | number;
}

export function AssessoriaJuridica() {
  const { activeProfile } = useAuth();
  const [clientes, setClientes] = useState<ClienteComResponsavel[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteComResponsavel[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteComResponsavel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allClientes, setAllClientes] = useState<ClienteComResponsavel[]>([]);
  const [isSearchingAll, setIsSearchingAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Novos estados para o fluxo de duas etapas
  const [viewMode, setViewMode] = useState<'selection' | 'assessment'>('selection');
  const [allSubservices, setAllSubservices] = useState<any[]>([]);
  const [subserviceSearchTerm, setSubserviceSearchTerm] = useState("");
  const [filteredSubservices, setFilteredSubservices] = useState<any[]>([]);
  const [selectedSubserviceId, setSelectedSubserviceId] = useState<string>("");

  // Perguntas de Assessoria
  const [questions, setQuestions] = useState<Question[]>([
    { id: 'proc_ativos', text: 'O cliente possui processos ativos?', type: 'yes_no', value: false },
    { id: 'proc_tipos', text: 'Quais os tipos de processos (Ex: Cível, Trabalhista, etc)?', type: 'text', value: '' },
    { id: 'possui_dependentes', text: 'O cliente possui dependentes?', type: 'yes_no', value: false },
    { id: 'dep_qtd', text: 'Quantos dependentes?', type: 'number', value: 0 },
    { id: 'dep_processos', text: 'Algum dependente possui processo judicial?', type: 'yes_no', value: false },
    { id: 'obs_gerais', text: 'Observações gerais da assessoria', type: 'text', value: '' },
  ]);

  const [catalogServices, setCatalogServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [dependentes, setDependentes] = useState<any[]>([]);
  const [loadingDependentes, setLoadingDependentes] = useState(false);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [reqModalMember, setReqModalMember] = useState<any>(null);
  const [currentProcess, setCurrentProcess] = useState<any>(null);
  const navigate = useNavigate();

  // Estado para o formulário de dependente
  const [depForm, setDepForm] = useState({
    nome: '',
    parentesco: '',
    dataNascimento: '',
    cpf: '',
    rg: '',
    passaporte: '',
    nacionalidade: 'Brasileira',
    email: '',
    telefone: '',
    isAncestral: false
  });

  const fetchDependentes = async () => {
    if (!selectedCliente) {
      setDependentes([]);
      return;
    }

    try {
      setLoadingDependentes(true);
      const data = await juridicoService.getDependentes(selectedCliente.id);
      setDependentes(data || []);
    } catch (err) {
      console.error("Erro ao buscar dependentes:", err);
    } finally {
      setLoadingDependentes(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      fetchDependentes();
      
      if (selectedCliente) {
        try {
          // Buscar última assessoria e processo em paralelo
          const [assessoria, processo] = await Promise.all([
            juridicoService.getLatestAssessoria(selectedCliente.id),
            juridicoService.getProcessoByCliente(selectedCliente.id)
          ]);

          setCurrentProcess(processo);

          if (assessoria) {
            // Mapear respostas de volta para o estado questions
            setQuestions(prev => prev.map(q => ({
              ...q,
              value: assessoria.respostas?.[q.id] !== undefined ? assessoria.respostas[q.id] : q.value
            })));
            
            // Definir o serviço selecionado se existir
            if (assessoria.servico_id) {
              setSelectedServiceId(assessoria.servico_id);
            } else {
              setSelectedServiceId("");
            }
          } else {
            // Resetar se não houver assessoria
            setQuestions(prev => prev.map(q => ({
              ...q,
              value: q.type === 'yes_no' ? false : (q.type === 'number' ? 0 : '')
            })));
            setSelectedServiceId("");
          }
        } catch (err) {
          console.error("Erro ao buscar dados do cliente:", err);
        }
      }
    };
    
    fetchInitialData();
  }, [selectedCliente?.id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!activeProfile?.id) return;
        
        // Buscar agendamentos delegados ao usuário, catálogo, subserviços e TODOS os clientes em paralelo
        const [agendamentosData, servicesData, allClientesData, subservicesData] = await Promise.all([
          juridicoService.getAgendamentosByResponsavel(activeProfile.id),
          juridicoService.getCatalogServices(),
          juridicoService.getAllClientesComResponsavel(),
          juridicoService.getAllSubservices()
        ]);
        
        // Mapear agendamentos para o formato esperado pelo componente, incluindo a data
        const mappedAgendamentos = agendamentosData.map((ag: any) => {
          const cliente = Array.isArray(ag.clientes) ? ag.clientes[0] : ag.clientes;
          return {
            ...cliente,
            agendamento_id: ag.id,
            data_agendamento: ag.data_hora,
            status_agendamento: ag.status
          };
        });
        
        setClientes(mappedAgendamentos);
        setAllClientes(allClientesData);
        setFilteredClientes(mappedAgendamentos);
        setCatalogServices(servicesData);
        setAllSubservices(subservicesData);
        setFilteredSubservices(subservicesData);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeProfile?.id]);

  // Handle auto-selection from URL params
  const [searchParams] = useSearchParams();
  const clienteIdParam = searchParams.get('clienteId');

  useEffect(() => {
    if (clienteIdParam && clientes.length > 0 && !selectedCliente) {
      const target = clientes.find(c => c.id === clienteIdParam);
      if (target) {
        setSelectedCliente(target);
      }
    }
  }, [clienteIdParam, clientes, selectedCliente]);

  useEffect(() => {
    const termLower = searchTerm.trim().toLowerCase();
    
    // Se não tem busca, prioriza os delegados (se existirem), senão mostra todos os globais
    if (!termLower) {
      if (clientes.length > 0) {
        setFilteredClientes(clientes);
        setIsSearchingAll(false);
      } else {
        setFilteredClientes(allClientes);
        setIsSearchingAll(true);
      }
      return;
    }

    // Ao buscar, mergeamos as duas listas para garantir que tudo seja pesquisável
    const combinedBase = [
      ...clientes, 
      ...allClientes.filter(ac => !clientes.some(c => c.id === ac.id))
    ];

    const filtered = combinedBase.filter(c => 
      (c.nome && c.nome.toLowerCase().includes(termLower)) || 
      (c.email && c.email.toLowerCase().includes(termLower))
    );

    console.log(`[Search Logic] Termo: "${termLower}" | Combined Base: ${combinedBase.length} | Filteed: ${filtered.length}`);
    
    setFilteredClientes(filtered);
    
    // Determinamos se a busca resultou apenas em itens globais que NÃO estão nos delegados
    const hasOnlyGlobal = filtered.length > 0 && !filtered.some(f => clientes.some(c => c.id === f.id));
    setIsSearchingAll(hasOnlyGlobal);
  }, [searchTerm, clientes, allClientes]);

  // Filtro de Subserviços
  useEffect(() => {
    if (!subserviceSearchTerm.trim()) {
      setFilteredSubservices(allSubservices);
      return;
    }
    const filtered = allSubservices.filter(s => 
      s.nome.toLowerCase().includes(subserviceSearchTerm.toLowerCase())
    );
    setFilteredSubservices(filtered);
  }, [subserviceSearchTerm, allSubservices]);

  const handleQuestionChange = (id: string, value: any) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, value } : q));
  };

  const handleSubmit = async () => {
    if (!selectedCliente || !activeProfile?.id) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      // Formata as respostas em um objeto chave-valor
      const respostasMap = questions.reduce((acc, q) => {
        acc[q.id] = q.value;
        return acc;
      }, {} as Record<string, any>);

      if (!selectedServiceId) {
        setError("Por favor, selecione um serviço do catálogo.");
        setIsSubmitting(false);
        return;
      }

      const selectedService = catalogServices.find(s => s.id === selectedServiceId);
      const serviceName = selectedService?.name || 'Serviço Jurídico';
      const obsGerais = (questions.find(q => q.id === 'obs_gerais')?.value as string) || '';

      // 1. Criar/Atualizar Assessoria (O BACKEND AGORA TRATA O PROCESSO)
      await juridicoService.createAssessoria({
        clienteId: selectedCliente.id,
        respostas: respostasMap,
        observacoes: obsGerais,
        responsavelId: activeProfile.id,
        servicoId: selectedServiceId
      });

      // 2. Buscar o processo (novo ou atualizado) para atualizar o estado local
      const proc = await juridicoService.getProcessoByCliente(selectedCliente.id);
      setCurrentProcess(proc);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error("Erro ao salvar assessoria:", err);
      setError("Ocorreu um erro ao salvar a assessoria: " + (err.message || "Entre em contato com o suporte."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectCliente = (cliente: ClienteComResponsavel) => {
    setSelectedCliente(cliente);
    setViewMode('assessment');
    window.scrollTo(0, 0);
  };

  const handleBackToSelection = () => {
    setViewMode('selection');
    setSelectedCliente(null);
    setSubserviceSearchTerm("");
  };

  // ETAPA 1: SELEÇÃO DE CLIENTE
  const renderClientSelection = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-inner">
          <Users size={32} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Nova Assessoria Jurídica</h1>
        <p className="text-lg text-gray-500 max-w-lg mx-auto">Busque e selecione um cliente para iniciar o processo de consultoria.</p>
      </div>

      <div className="bg-white rounded-3xl border shadow-xl shadow-blue-900/5 overflow-hidden">
        <div className="p-6 border-b bg-gray-50/50">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Digite o nome ou e-mail do cliente..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none text-lg transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        
        <div className="max-h-[600px] overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {filteredClientes.length > 0 ? (
            filteredClientes.map(cliente => (
              <button
                key={cliente.id}
                onClick={() => handleSelectCliente(cliente)}
                className="w-full text-left p-5 hover:bg-blue-50/50 rounded-2xl transition-all flex items-center justify-between group border-2 border-transparent hover:border-blue-100"
              >
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:text-white transition-all shadow-sm">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                      {cliente.nome}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px] font-bold py-0 h-5">
                          {cliente.client_id || 'CLIENTE'}
                        </Badge>
                      </span>
                      {cliente.data_agendamento && (
                        <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                          <Calendar size={12} />
                          {new Date(cliente.data_agendamento).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-300 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                  <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <Search size={32} />
              </div>
              <div>
                <p className="text-gray-900 font-bold text-lg">Nenhum cliente encontrado</p>
                <p className="text-gray-500 text-sm">Tente buscar por outro nome ou e-mail.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ETAPA 2: FORMULÁRIO DE ASSESSORIA
  const renderAssessoriaForm = () => (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="bg-white rounded-3xl border shadow-lg border-blue-100 overflow-hidden sticky top-4 z-40">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-between text-white">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
              <Scale size={28} />
            </div>
            <div>
              <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1">Assessoria em Andamento</p>
              <h1 className="text-2xl font-bold">Realizando assessoria de: <span className="text-white underline decoration-blue-300/50 underline-offset-4">{selectedCliente?.nome}</span></h1>
            </div>
          </div>
          <button 
            onClick={handleBackToSelection}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all border border-white/20 group backdrop-blur-sm"
          >
            <RotateCcw size={16} className="group-hover:-rotate-45 transition-transform" />
            Mudar Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border shadow-sm p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <HelpCircle size={18} className="font-bold" />
                <h3 className="font-black text-xs uppercase tracking-wider">Selecione o Subserviço</h3>
              </div>
              <p className="text-xs text-gray-500">Busque o serviço específico para este cliente.</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar subserviço..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all"
                  value={subserviceSearchTerm}
                  onChange={(e) => setSubserviceSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar pr-2">
                {filteredSubservices.length > 0 ? (
                  filteredSubservices.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubserviceId(sub.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all border-2 flex items-center justify-between group ${
                        selectedSubserviceId === sub.id 
                          ? 'bg-blue-50 border-blue-600 shadow-sm' 
                          : 'bg-white border-gray-100 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${selectedSubserviceId === sub.id ? 'text-blue-700' : 'text-gray-900'}`}>
                          {sub.nome}
                        </p>
                      </div>
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                        selectedSubserviceId === sub.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-transparent'
                      }`}>
                        <CheckCircle2 size={12} />
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center py-8 text-xs text-gray-400">Nenhum subserviço encontrado.</p>
                )}
              </div>
            </div>
          </div>
          
          {selectedCliente && (
            <div className="bg-blue-50/50 rounded-3xl border border-blue-100 p-6 space-y-4">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-blue-600">Dados do Contato</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                    <Send size={14} />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{selectedCliente.email || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-green-500 shadow-sm border border-blue-100">
                    <HelpCircle size={14} />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{selectedCliente.whatsapp || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border shadow-sm p-8 space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b">
              <ClipboardCheck className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Questionário</h2>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-700 animate-in shake duration-500">
                <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Atenção</p>
                  <p className="text-xs opacity-80">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {questions.map((q) => (
                <div key={q.id} className="space-y-4 group">
                  <label className="text-base font-bold text-gray-800 flex items-center gap-2 group-hover:text-blue-700 transition-colors">
                    {q.text}
                  </label>
                  
                  {q.type === 'yes_no' ? (
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleQuestionChange(q.id, true)}
                        className={`flex-1 py-3 px-6 rounded-2xl font-bold transition-all border-2 ${
                          q.value === true 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                            : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50/30'
                        }`}
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => handleQuestionChange(q.id, false)}
                        className={`flex-1 py-3 px-6 rounded-2xl font-bold transition-all border-2 ${
                          q.value === false 
                            ? 'bg-gray-800 border-gray-800 text-white shadow-lg shadow-gray-200' 
                            : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50/30'
                        }`}
                      >
                        Não
                      </button>
                    </div>
                  ) : q.type === 'number' ? (
                    <input
                      type="number"
                      value={q.value as number}
                      onChange={(e) => handleQuestionChange(q.id, parseInt(e.target.value) || 0)}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-lg font-medium"
                      placeholder="0"
                    />
                  ) : (
                    <textarea
                      value={q.value as string}
                      onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all min-h-[120px] text-lg"
                      placeholder="Descreva aqui..."
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-8 border-t space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Gerenciar Dependentes</h3>
                </div>
              </div>

              {dependentes.length > 0 && (
                <div className="grid grid-cols-1 gap-3">
                  {dependentes.map((dep: any) => (
                    <div key={dep.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900 truncate">{dep.nome_completo}</p>
                            <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 h-4 bg-gray-50">
                              {dep.parentesco}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setReqModalMember({
                              id: dep.id,
                              name: dep.nome_completo,
                              type: dep.parentesco
                            });
                            setIsReqModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 text-xs font-semibold"
                        >
                          <Send className="h-4 w-4" />
                          <span className="hidden sm:inline">Solicitar Docs</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-300 space-y-4">
                <h4 className="text-sm font-bold text-gray-800">Novo Dependente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    value={depForm.nome}
                    onChange={(e) => setDepForm({...depForm, nome: e.target.value})}
                    placeholder="Nome Completo" 
                    className="w-full p-3 bg-white border rounded-xl text-sm" 
                  />
                  <select 
                    value={depForm.parentesco}
                    onChange={(e) => setDepForm({...depForm, parentesco: e.target.value})}
                    className="w-full p-3 bg-white border rounded-xl text-sm"
                  >
                    <option value="">Parentesco...</option>
                    <option value="filho">Filho(a)</option>
                    <option value="conjuge">Cônjuge</option>
                    <option value="pai_mae">Pai/Mãe</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <Button 
                  onClick={async () => {
                    if (!depForm.nome || !depForm.parentesco || !selectedCliente) return;
                    await juridicoService.createDependent(selectedCliente.id, depForm.nome, depForm.parentesco, depForm);
                    setDepForm({
                      nome: '', parentesco: '', dataNascimento: '', cpf: '', rg: '', passaporte: '',
                      nacionalidade: 'Brasileira', email: '', telefone: '', isAncestral: false
                    });
                    fetchDependentes();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Cadastrar Dependente
                </Button>
              </div>
            </div>

            <div className="pt-8 border-t flex flex-col gap-4">
               <button 
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedSubserviceId}
                className={`w-full py-6 rounded-2xl font-black text-xl uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
                  isSubmitting || !selectedSubserviceId
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-none'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.01] hover:shadow-blue-500/30'
                }`}
              >
                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : <Save size={24} />}
                {isSubmitting ? "Salvando..." : (!selectedSubserviceId ? "Selecione um Subserviço" : "Finalizar Assessoria")}
              </button>
              
              {showSuccess && (
                <div className="flex items-center justify-center gap-2 text-green-600 font-bold animate-pulse">
                  <CheckCircle2 size={20} />
                  Assessoria salva com sucesso!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {viewMode === 'selection' ? renderClientSelection() : renderAssessoriaForm()}

      {selectedCliente && (
        <RequirementRequestModal
          isOpen={isReqModalOpen}
          onOpenChange={setIsReqModalOpen}
          clienteId={selectedCliente.id}
          processoId={currentProcess?.id}
          members={[
            { id: selectedCliente.id, name: selectedCliente.nome, type: 'Titular', isTitular: true },
            ...dependentes.map(d => ({ id: d.id, name: d.nome_completo, type: d.parentesco, isTitular: false }))
          ]}
          initialMemberId={reqModalMember?.id}
        />
      )}
    </div>
  );
}

export default AssessoriaJuridica;
