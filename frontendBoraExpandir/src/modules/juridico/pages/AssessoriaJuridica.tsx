import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Loader2,
  AlertCircle,
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
  RotateCcw,
  MapPin,
  FileText,
  MessageSquare,
  AlertTriangle,
  ListChecks,
  Briefcase
} from "lucide-react";
import { Badge } from '@/modules/shared/components/ui/badge';
import { Button } from "@/components/ui/Button";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import juridicoService, { ClienteComResponsavel } from "../services/juridicoService";
import { RequirementRequestModal } from '../components/RequirementRequestModal';

interface CRMFormData {
  // Section 1: Dados do caso
  servico_contratado: string;
  titular_nome: string;
  dependentes_info: string;
  pedido_para: 'titular_somente' | 'titular_dependentes' | '';
  pedido_para_detalhe: string;
  // Section 2: Onde sera o pedido
  local_solicitacao: 'consulado' | 'espanha' | '';
  consulado_cidade: string;
  cidade_protocolo: string;
  cidade_chegada: string;
  data_chegada: string;
  // Section 3: Resumo consultoria
  resumo_executivo: string;
  // Section 4: Documentos e orientacoes
  docs_titular: string;
  docs_dependentes: string;
  orientacoes_praticas: string;
  // Section 5: Duvidas e respostas
  duvidas_cliente: string;
  respostas_dadas: string;
  // Section 6: Pontos fracos e prazos
  pontos_fracos: string;
  prazos_delicados: string;
  // Section 7: Proximos passos
  proximos_cliente: string;
  proximos_equipe: string;
  // Section 8: Resumo 1 linha
  resumo_1_linha: string;
}

const initialFormData: CRMFormData = {
  servico_contratado: '',
  titular_nome: '',
  dependentes_info: '',
  pedido_para: '',
  pedido_para_detalhe: '',
  local_solicitacao: '',
  consulado_cidade: '',
  cidade_protocolo: '',
  cidade_chegada: '',
  data_chegada: '',
  resumo_executivo: '',
  docs_titular: '',
  docs_dependentes: '',
  orientacoes_praticas: '',
  duvidas_cliente: '',
  respostas_dadas: '',
  pontos_fracos: '',
  prazos_delicados: '',
  proximos_cliente: '',
  proximos_equipe: '',
  resumo_1_linha: '',
};

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
  
  const [allSubservices, setAllSubservices] = useState<any[]>([]);
  const [subserviceSearchTerm, setSubserviceSearchTerm] = useState("");
  const [filteredSubservices, setFilteredSubservices] = useState<any[]>([]);
  const [selectedSubserviceId, setSelectedSubserviceId] = useState<string>("");
  const [requiresSubservice, setRequiresSubservice] = useState<boolean>(true);

  // CRM Form state
  const [formData, setFormData] = useState<CRMFormData>({ ...initialFormData });

  const [catalogServices, setCatalogServices] = useState<any[]>([]); // kept for fetchData compatibility
  const [dependentes, setDependentes] = useState<any[]>([]);
  const [loadingDependentes, setLoadingDependentes] = useState(false);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [reqModalMember, setReqModalMember] = useState<any>(null);
  const [currentProcess, setCurrentProcess] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
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
            // Mapear respostas de volta para o CRM form
            const respostas = assessoria.respostas || {};
            setFormData(prev => ({
              ...prev,
              ...Object.keys(prev).reduce((acc, key) => {
                if (respostas[key] !== undefined) {
                  acc[key as keyof CRMFormData] = respostas[key];
                }
                return acc;
              }, {} as Partial<CRMFormData>),
            }));

            if (assessoria.servico_id) {
              setSelectedSubserviceId(assessoria.servico_id);
            } else {
              setSelectedSubserviceId("");
            }
          } else {
            // No existing assessoria - try to pre-fill from client DNA
            const dna = selectedCliente.perfil_unificado?.data;
            if (dna) {
              const preFilled: Partial<CRMFormData> = {};
              // Map DNA fields from Consultoria form / Contract Creation
              if (dna.local_solicitacao) preFilled.local_solicitacao = dna.local_solicitacao;
              if (dna.consulado_cidade) preFilled.consulado_cidade = dna.consulado_cidade;
              if (dna.cidade_protocolo) preFilled.cidade_protocolo = dna.cidade_protocolo;
              if (dna.cidade_chegada) preFilled.cidade_chegada = dna.cidade_chegada;
              if (dna.data_chegada) preFilled.data_chegada = dna.data_chegada;
              if (dna.resumo_executivo) preFilled.resumo_executivo = dna.resumo_executivo;
              if (dna.servico_contratado) preFilled.servico_contratado = dna.servico_contratado;
              if (dna.pedido_para) preFilled.pedido_para = dna.pedido_para;
              if (dna.pedido_para_detalhe) preFilled.pedido_para_detalhe = dna.pedido_para_detalhe;
              if (dna.pontos_fracos) preFilled.pontos_fracos = dna.pontos_fracos;
              if (dna.prazos_delicados) preFilled.prazos_delicados = dna.prazos_delicados;
              if (dna.docs_titular) preFilled.docs_titular = dna.docs_titular;
              if (dna.docs_dependentes) preFilled.docs_dependentes = dna.docs_dependentes;
              if (dna.orientacoes_praticas) preFilled.orientacoes_praticas = dna.orientacoes_praticas;

              setFormData(prev => ({ ...initialFormData, ...preFilled }));
            } else {
              setFormData({ ...initialFormData });
            }
            setSelectedSubserviceId("");
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
  const produtoIdParam = searchParams.get('produtoId');
  const agendamentoIdParam = searchParams.get('agendamentoId');

  useEffect(() => {
    if (clienteIdParam && !selectedCliente) {
      // Try delegated clients first, then all clients
      const target = clientes.find(c => c.id === clienteIdParam)
        || allClientes.find(c => c.id === clienteIdParam);
      if (target) {
        setSelectedCliente(target);
      }
    }
  }, [clienteIdParam, clientes, allClientes, selectedCliente]);

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

  // Filtro de Subserviços (por produto do agendamento + busca textual)
  useEffect(() => {
    // First, filter by product if we have a produtoId from the appointment
    let base = allSubservices;
    if (produtoIdParam) {
      const filtered = allSubservices.filter(s => s.servico?.id === produtoIdParam || s.servico_id === produtoIdParam);
      // Only apply filter if there are matching subservices, otherwise show all
      if (filtered.length > 0) {
        base = filtered;
      }
    }

    // Then apply text search
    if (!subserviceSearchTerm.trim()) {
      setFilteredSubservices(base);
      return;
    }
    const filtered = base.filter(s =>
      s.nome.toLowerCase().includes(subserviceSearchTerm.toLowerCase())
    );
    setFilteredSubservices(filtered);
  }, [subserviceSearchTerm, allSubservices, produtoIdParam]);

  // Determine if subservice selection is required for the current product
  useEffect(() => {
    if (produtoIdParam && allSubservices.length > 0) {
      const productSubservices = allSubservices.filter(
        s => s.servico?.id === produtoIdParam || s.servico_id === produtoIdParam
      );
      const hasSubservices = productSubservices.length > 0;
      setRequiresSubservice(hasSubservices);
      // Auto-select if only one subservice exists and none is selected yet
      if (hasSubservices && productSubservices.length === 1 && !selectedSubserviceId) {
        setSelectedSubserviceId(productSubservices[0].id);
      }
    } else {
      setRequiresSubservice(false);
    }
  }, [allSubservices, produtoIdParam]);

  const handleFormChange = (field: keyof CRMFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-fill titular and dependentes when client/dependentes change
  useEffect(() => {
    if (selectedCliente) {
      setFormData(prev => ({
        ...prev,
        titular_nome: selectedCliente.nome || '',
        dependentes_info: dependentes.map(d => `${d.nome_completo} (${d.parentesco})`).join(', '),
      }));
    }
  }, [selectedCliente?.nome, dependentes]);

  const handleSubmit = async () => {
    if (!selectedCliente || !activeProfile?.id) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      if (requiresSubservice && !selectedSubserviceId) {
        setError("Por favor, selecione um subserviço.");
        setIsSubmitting(false);
        return;
      }

      if (!formData.resumo_1_linha.trim()) {
        setError("O campo 'Resumo em 1 linha' (Seção 8) é obrigatório.");
        setIsSubmitting(false);
        return;
      }

      // Include consultant name in the form data
      const respostasMap: Record<string, any> = {
        ...formData,
        consultora_nome: activeProfile?.full_name || '',
      };

      // 1. Criar/Atualizar Assessoria (O BACKEND AGORA TRATA O PROCESSO)
      await juridicoService.createAssessoria({
        clienteId: selectedCliente.id,
        respostas: respostasMap,
        observacoes: formData.resumo_executivo,
        responsavelId: activeProfile.id,
        servicoId: selectedSubserviceId
      });

      // 2. Marcar assessoria como em andamento (atualiza stage do cliente)
      if (agendamentoIdParam) {
        await juridicoService.marcarAssessoriaEmAndamento(agendamentoIdParam);
      }

      // 3. Buscar o processo (novo ou atualizado) para atualizar o estado local
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

  const handleBackToSelection = () => {
    navigate(-1);
  };

  // FORMULÁRIO DE ASSESSORIA
  const renderAssessoriaForm = () => {
    const steps = [
      { id: 1, title: 'Serviço & Local', icon: <Briefcase size={18} /> },
      { id: 2, title: 'Resumo & Docs', icon: <FileText size={18} /> },
      { id: 3, title: 'Dúvidas & Prazos', icon: <MessageSquare size={18} /> },
      { id: 4, title: 'Dependentes & Finalizar', icon: <Users size={18} /> }
    ];

    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
        <div className="bg-white rounded-3xl border shadow-lg border-blue-100 overflow-hidden sticky top-4 z-40">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-indigo-700 flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                <Scale size={20} className="sm:hidden" />
                <Scale size={28} className="hidden sm:block" />
              </div>
              <div>
                <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-0.5 sm:mb-1">Assessoria em Andamento</p>
                <h1 className="text-sm sm:text-2xl font-bold leading-tight">
                  <span className="hidden sm:inline">Realizando assessoria de: </span>
                  <span className="text-white underline decoration-blue-300/50 underline-offset-4">{selectedCliente?.nome}</span>
                </h1>
              </div>
            </div>
            <button 
              onClick={handleBackToSelection}
              className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-white/20 group backdrop-blur-sm"
            >
              <RotateCcw size={14} className="group-hover:-rotate-45 transition-transform" />
              Voltar
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-2xl border shadow-sm p-3 sm:p-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] sm:min-w-0">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  disabled={step.id > currentStep && !formData.resumo_1_linha && currentStep < 4}
                  className={`flex flex-col items-center gap-2 group transition-all ${
                    currentStep === step.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
                    currentStep === step.id 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' 
                      : (currentStep > step.id ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-400')
                  }`}>
                    {currentStep > step.id ? <CheckCircle2 size={16} /> : step.id}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${
                    currentStep === step.id ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-100 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {requiresSubservice && currentStep === 1 && (
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

                <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar pr-2 text-start">
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
            )}
            
            {selectedCliente && (
              <div className="bg-blue-50/50 rounded-3xl border border-blue-100 p-6 space-y-4">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-blue-600">Dados do Contato</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                      <Send size={14} />
                    </div>
                    <p className="text-sm font-medium text-gray-700 break-all">{selectedCliente.email || 'N/A'}</p>
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
            <div className="bg-white rounded-3xl border shadow-sm p-5 sm:p-8 space-y-8 min-h-[400px]">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-700 animate-in shake duration-500">
                  <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Atenção</p>
                    <p className="text-xs opacity-80">{error}</p>
                  </div>
                </div>
              )}

              {/* STEP 1: Serviço & Local */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Briefcase size={18} />
                      <h3 className="font-black text-xs uppercase tracking-wider">Seção 1 — Dados do Caso</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Serviço/visto contratado</label>
                        <input
                          type="text"
                          value={formData.servico_contratado}
                          onChange={(e) => handleFormChange('servico_contratado', e.target.value)}
                          className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm"
                          placeholder="Ex: Visto D7, Autorização de Residência..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Pedido para</label>
                        <div className="flex gap-2 sm:gap-3 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleFormChange('pedido_para', 'titular_somente')}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 text-xs ${
                              formData.pedido_para === 'titular_somente'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                            }`}
                          >
                            Titular somente
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormChange('pedido_para', 'titular_dependentes')}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 text-xs ${
                              formData.pedido_para === 'titular_dependentes'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                            }`}
                          >
                            Titular + Dep(s)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-700">
                      <MapPin size={18} />
                      <h3 className="font-black text-xs uppercase tracking-wider">Seção 2 — Onde será o pedido</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Local de solicitação</label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleFormChange('local_solicitacao', 'consulado')}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 text-xs ${
                              formData.local_solicitacao === 'consulado'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-gray-100 text-gray-600'
                            }`}
                          >
                            Consulado
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFormChange('local_solicitacao', 'espanha')}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 text-xs ${
                              formData.local_solicitacao === 'espanha'
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-gray-100 text-gray-600'
                            }`}
                          >
                            Dentro da Espanha
                          </button>
                        </div>
                      </div>

                      {formData.local_solicitacao === 'consulado' && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Qual consulado</label>
                          <input
                            type="text"
                            value={formData.consulado_cidade}
                            onChange={(e) => handleFormChange('consulado_cidade', e.target.value)}
                            className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-sm"
                            placeholder="Cidade/País"
                          />
                        </div>
                      )}

                      {formData.local_solicitacao === 'espanha' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Cidade prevista protocolo</label>
                            <input
                              type="text"
                              value={formData.cidade_protocolo}
                              onChange={(e) => handleFormChange('cidade_protocolo', e.target.value)}
                              className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Data chegada Espanha</label>
                        <input
                          type="date"
                          value={formData.data_chegada}
                          onChange={(e) => handleFormChange('data_chegada', e.target.value)}
                          className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Resumo & Docs */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-700">
                      <FileText size={18} />
                      <h3 className="font-black text-xs uppercase tracking-wider">Seção 3 — Resumo Consultoria</h3>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Resumo executivo (bullet points)</label>
                      <textarea
                        value={formData.resumo_executivo}
                        onChange={(e) => handleFormChange('resumo_executivo', e.target.value)}
                        className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all min-h-[150px] text-sm"
                        placeholder={"- Orientação 1\n- Orientação 2..."}
                      />
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-700">
                      <FileSearch size={18} />
                      <h3 className="font-black text-xs uppercase tracking-wider">Seção 4 — Documentos & Orientações</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Docs TITULAR</label>
                        <textarea
                          value={formData.docs_titular}
                          onChange={(e) => handleFormChange('docs_titular', e.target.value)}
                          className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 min-h-[100px] text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Orientações práticas</label>
                        <textarea
                          value={formData.orientacoes_praticas}
                          onChange={(e) => handleFormChange('orientacoes_praticas', e.target.value)}
                          className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 min-h-[100px] text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Dúvidas & Prazos */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-700">
                      <MessageSquare size={18} />
                      <h3 className="font-black text-xs uppercase tracking-wider">Seção 5 — Dúvidas do Cliente</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Principais Dúvidas</label>
                        <textarea
                          value={formData.duvidas_cliente}
                          onChange={(e) => handleFormChange('duvidas_cliente', e.target.value)}
                          className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 min-h-[120px] text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Respostas/Orientações dadas</label>
                        <textarea
                          value={formData.respostas_dadas}
                          onChange={(e) => handleFormChange('respostas_dadas', e.target.value)}
                          className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 min-h-[120px] text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle size={18} />
                      <h3 className="font-black text-xs uppercase tracking-wider">Seção 6 — Pontos Fracos & Prazos</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Pontos Fracos do Caso</label>
                        <textarea
                          value={formData.pontos_fracos}
                          onChange={(e) => handleFormChange('pontos_fracos', e.target.value)}
                          className="w-full p-4 bg-amber-50/50 border-2 border-amber-100 rounded-xl focus:bg-white focus:border-amber-500 min-h-[100px] text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Prazos Delicados</label>
                        <textarea
                          value={formData.prazos_delicados}
                          onChange={(e) => handleFormChange('prazos_delicados', e.target.value)}
                          className="w-full p-4 bg-amber-50/50 border-2 border-amber-100 rounded-xl focus:bg-white focus:border-amber-500 min-h-[100px] text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Dependentes & Finalizar */}
              {currentStep === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-700">
                      <ListChecks size={18} />
                      <h3 className="font-black text-xs uppercase tracking-wider">Seção 7 — Próximos Passos</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">O que o cliente deve fazer</label>
                        <textarea
                          value={formData.proximos_cliente}
                          onChange={(e) => handleFormChange('proximos_cliente', e.target.value)}
                          className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 min-h-[100px] text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-red-600">
                      <ClipboardCheck size={18} />
                      <h3 className="font-black text-xs uppercase tracking-wider">Seção 8 — Resumo Obrigatório</h3>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase leading-tight">
                        Formato: [Tipo] | Titular: [nome] | Deps: [nomes] | Pedido: [local] | Chegada: [data]
                      </label>
                      <textarea
                        value={formData.resumo_1_linha}
                        onChange={(e) => handleFormChange('resumo_1_linha', e.target.value)}
                        className="w-full p-4 bg-red-50/30 border-2 border-red-200 rounded-xl focus:bg-white focus:border-red-500 min-h-[80px] text-sm font-bold"
                        placeholder={`Ex: Visto D7 | Titular: João...`}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-sm text-gray-900">Dependentes</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {dependentes.map((dep: any) => (
                        <div key={dep.id} className="flex items-center justify-between p-3 bg-gray-50 border rounded-xl">
                          <p className="text-xs font-bold text-gray-800">{dep.nome_completo} ({dep.parentesco})</p>
                          <button
                            onClick={() => {
                              setReqModalMember({ id: dep.id, name: dep.nome_completo, type: dep.parentesco });
                              setIsReqModalOpen(true);
                            }}
                            className="text-blue-600 text-[10px] font-bold uppercase flex items-center gap-1"
                          >
                            <Send size={12} /> Docs
                          </button>
                        </div>
                      ))}
                      
                      <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            value={depForm.nome}
                            onChange={(e) => setDepForm({...depForm, nome: e.target.value})}
                            placeholder="Nome" 
                            className="p-2.5 bg-white border rounded-lg text-xs" 
                          />
                          <select 
                            value={depForm.parentesco}
                            onChange={(e) => setDepForm({...depForm, parentesco: e.target.value})}
                            className="p-2.5 bg-white border rounded-lg text-xs"
                          >
                            <option value="">Parentesco...</option>
                            <option value="filho">Filho(a)</option>
                            <option value="conjuge">Cônjuge</option>
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
                          className="w-full bg-blue-600 h-10 text-xs font-bold"
                        >
                          + Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="pt-8 flex items-center justify-between gap-4">
                <button
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  className={`flex-1 py-4 rounded-xl font-bold text-sm transition-all border-2 ${
                    currentStep === 1 
                      ? 'invisible' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  Anterior
                </button>
                
                {currentStep < 4 ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (requiresSubservice && !selectedSubserviceId)}
                    className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
                      isSubmitting || (requiresSubservice && !selectedSubserviceId)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02]'
                    }`}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={20} />}
                    {isSubmitting ? "Salvando..." : "Finalizar Porto"}
                  </button>
                )}
              </div>
              
              {showSuccess && (
                <div className="flex items-center justify-center gap-2 text-green-600 font-bold animate-pulse text-sm">
                  <CheckCircle2 size={16} />
                  Assessoria salva com sucesso!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500 mb-4" />
          <p className="text-gray-500">Carregando dados...</p>
        </div>
      ) : !selectedCliente ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-bold text-gray-900">Nenhum cliente selecionado</h2>
          <p className="text-gray-500">Acesse esta página a partir do modal de agendamentos para iniciar uma assessoria.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
          >
            Voltar
          </button>
        </div>
      ) : renderAssessoriaForm()}

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
