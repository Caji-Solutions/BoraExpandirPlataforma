import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Loader2,
  AlertCircle,
  ClipboardCheck,
  Scale,
  HelpCircle,
  Save,
  CheckCircle2,
  Send,
  RotateCcw,
  MapPin,
  Briefcase,
  FileText,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import juridicoService, { ClienteComResponsavel } from "../services/juridicoService";
import { getContratosServicos } from "../../comercial/services/comercialService";

interface CRMFormData {
  // Section 1: Dados do caso
  servico_contratado: string;
  titular_nome: string;
  pedido_para: 'titular_somente' | 'titular_dependentes' | '';
  pedido_para_detalhe: string;
  // Section 2: Onde sera o pedido
  local_solicitacao: 'consulado' | 'espanha' | '';
  consulado_cidade: string;
  cidade_protocolo: string;
  cidade_chegada: string;
  data_chegada: string;
  // Section 3: Tipo de agendamento
  tipo_agendamento: 'data_prevista' | 'data_confirmada' | '';
  // Section 4: Tem Parceiro CAP?
  tem_parceiro_cap: boolean;
  nome_parceiro_cap: string;
}

const initialFormData: CRMFormData = {
  servico_contratado: '',
  titular_nome: '',
  pedido_para: '',
  pedido_para_detalhe: '',
  local_solicitacao: '',
  consulado_cidade: '',
  cidade_protocolo: '',
  cidade_chegada: '',
  data_chegada: '',
  tipo_agendamento: '',
  tem_parceiro_cap: false,
  nome_parceiro_cap: '',
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
  const [currentProcess, setCurrentProcess] = useState<any>(null);
  const [contrato, setContrato] = useState<any>(null);
  const [contratoDependentes, setContratoDependentes] = useState<{nome: string; grau: string}[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      if (selectedCliente) {
        try {
          // Buscar última assessoria, processo e contratos em paralelo
          const [assessoria, processo, contratos] = await Promise.all([
            juridicoService.getLatestAssessoria(selectedCliente.id),
            juridicoService.getProcessoByCliente(selectedCliente.id),
            getContratosServicos(selectedCliente.id)
          ]);

          setCurrentProcess(processo);

          // Encontrar contrato ativo (não-draft ou mais recente)
          const contratoAtivo = contratos?.find((c: any) => !c.is_draft) || contratos?.[0] || null;
          setContrato(contratoAtivo);

          // Extrair dependentes do draft_dados do contrato
          if (contratoAtivo?.draft_dados?.dependentes) {
            const deps = contratoAtivo.draft_dados.dependentes.map((d: any) => ({
              nome: d.nome || '',
              grau: d.grau || d.parentesco || ''
            }));
            setContratoDependentes(deps);
          } else {
            setContratoDependentes([]);
          }

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
              if (dna.servico_contratado) preFilled.servico_contratado = dna.servico_contratado;
              if (dna.pedido_para) preFilled.pedido_para = dna.pedido_para;
              if (dna.pedido_para_detalhe) preFilled.pedido_para_detalhe = dna.pedido_para_detalhe;

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

  // Auto-fill titular when client changes
  useEffect(() => {
    if (selectedCliente) {
      setFormData(prev => ({
        ...prev,
        titular_nome: selectedCliente.nome || '',
      }));
    }
  }, [selectedCliente?.nome]);

  // Auto-fill servico_contratado from catalog service name (produto do agendamento)
  useEffect(() => {
    if (produtoIdParam && catalogServices.length > 0) {
      const servico = catalogServices.find((s: any) => s.id === produtoIdParam);
      if (servico?.nome) {
        setFormData(prev => prev.servico_contratado ? prev : { ...prev, servico_contratado: servico.nome });
      }
    }
  }, [produtoIdParam, catalogServices]);

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

      if (!formData.tipo_agendamento) {
        setError("Por favor, selecione o tipo de agendamento.");
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
        observacoes: '',
        responsavelId: activeProfile.id,
        servicoId: selectedSubserviceId
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

  const handleBackToSelection = () => {
    navigate(-1);
  };

  // FORMULÁRIO DE ASSESSORIA
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
            Voltar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {requiresSubservice && (
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
          )}
          
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

          {contrato && (
            <button
              onClick={() => {
                const url = contrato.contrato_assinado_url || contrato.contrato_gerado_url;
                if (url) window.open(url, '_blank');
              }}
              disabled={!contrato.contrato_assinado_url && !contrato.contrato_gerado_url}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                contrato.contrato_assinado_url || contrato.contrato_gerado_url
                  ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FileText size={16} />
              Exibir Contrato
              <ExternalLink size={14} />
            </button>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border shadow-sm p-8 space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b">
              <ClipboardCheck className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">CRM da Assessoria</h2>
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

            {/* SECTION 1: Dados do caso */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-700">
                <Briefcase size={18} />
                <h3 className="font-black text-xs uppercase tracking-wider">Seção 1 — Dados do Caso (já contratado)</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Processo/serviço contratado (tipo de visto/autorização)</label>
                  <input
                    type="text"
                    value={formData.servico_contratado}
                    onChange={(e) => handleFormChange('servico_contratado', e.target.value)}
                    className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="Ex: Visto D7, Autorização de Residência..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titular (nome completo)</label>
                  <input
                    type="text"
                    value={formData.titular_nome}
                    onChange={(e) => handleFormChange('titular_nome', e.target.value)}
                    className="w-full p-3 bg-blue-50/50 border-2 border-blue-100 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="Preenchido automaticamente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dependente(s) (nome + vínculo)</label>
                  {contratoDependentes.length > 0 ? (
                    <div className="border-2 border-blue-100 rounded-xl overflow-hidden">
                      <div className="grid grid-cols-2 bg-blue-50 border-b border-blue-100">
                        <div className="px-4 py-2 text-xs font-bold text-blue-700 uppercase tracking-wider">Nome</div>
                        <div className="px-4 py-2 text-xs font-bold text-blue-700 uppercase tracking-wider">Vínculo</div>
                      </div>
                      {contratoDependentes.map((dep, idx) => (
                        <div key={idx} className={`grid grid-cols-2 ${idx < contratoDependentes.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          <div className="px-4 py-3 text-sm text-gray-900">{dep.nome}</div>
                          <div className="px-4 py-3 text-sm text-gray-600">{dep.grau}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic p-3 bg-gray-50 rounded-xl">Nenhum dependente encontrado no contrato.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pedido para</label>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleFormChange('pedido_para', 'titular_somente')}
                      className={`py-2.5 px-5 rounded-xl font-bold transition-all border-2 text-sm ${
                        formData.pedido_para === 'titular_somente'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      Titular somente
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormChange('pedido_para', 'titular_dependentes')}
                      className={`py-2.5 px-5 rounded-xl font-bold transition-all border-2 text-sm ${
                        formData.pedido_para === 'titular_dependentes'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      Titular + dependente(s)
                    </button>
                  </div>
                  {formData.pedido_para === 'titular_dependentes' && (
                    <input
                      type="text"
                      value={formData.pedido_para_detalhe}
                      onChange={(e) => handleFormChange('pedido_para_detalhe', e.target.value)}
                      className="w-full mt-3 p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                      placeholder="Detalhe sobre os dependentes incluídos no pedido..."
                    />
                  )}
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION 2: Onde sera o pedido */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-700">
                <MapPin size={18} />
                <h3 className="font-black text-xs uppercase tracking-wider">Seção 2 — Onde será o pedido</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Local de solicitação</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleFormChange('local_solicitacao', 'consulado')}
                      className={`py-2.5 px-5 rounded-xl font-bold transition-all border-2 text-sm ${
                        formData.local_solicitacao === 'consulado'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      Consulado
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormChange('local_solicitacao', 'espanha')}
                      className={`py-2.5 px-5 rounded-xl font-bold transition-all border-2 text-sm ${
                        formData.local_solicitacao === 'espanha'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      Dentro da Espanha
                    </button>
                  </div>
                </div>

                {formData.local_solicitacao === 'consulado' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Qual consulado (cidade/país)</label>
                    <input
                      type="text"
                      value={formData.consulado_cidade}
                      onChange={(e) => handleFormChange('consulado_cidade', e.target.value)}
                      className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                      placeholder="Ex: São Paulo, Brasil"
                    />
                  </div>
                )}

                {formData.local_solicitacao === 'espanha' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cidade prevista para protocolar</label>
                      <input
                        type="text"
                        value={formData.cidade_protocolo}
                        onChange={(e) => handleFormChange('cidade_protocolo', e.target.value)}
                        className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="Onde estarão no momento do pedido"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cidade de chegada inicial (se mencionada)</label>
                      <input
                        type="text"
                        value={formData.cidade_chegada}
                        onChange={(e) => handleFormChange('cidade_chegada', e.target.value)}
                        className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="Opcional"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Selecione o tipo de agendamento</label>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleFormChange('tipo_agendamento', 'data_prevista')}
                      className={`py-2.5 px-5 rounded-xl font-bold transition-all border-2 text-sm ${
                        formData.tipo_agendamento === 'data_prevista'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      Data Prevista
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormChange('tipo_agendamento', 'data_confirmada')}
                      className={`py-2.5 px-5 rounded-xl font-bold transition-all border-2 text-sm ${
                        formData.tipo_agendamento === 'data_confirmada'
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      Data Confirmada
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data prevista de chegada na Espanha</label>
                  <input
                    type="date"
                    value={formData.data_chegada}
                    onChange={(e) => handleFormChange('data_chegada', e.target.value)}
                    className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION 4: Tem Parceiro CAP? */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-blue-700">
                <Users size={18} />
                <h3 className="font-black text-xs uppercase tracking-wider">Tem Parceiro CAP?</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tem_parceiro_cap: true }))}
                    className={`py-2.5 px-5 rounded-xl font-bold transition-all border-2 text-sm ${
                      formData.tem_parceiro_cap === true
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tem_parceiro_cap: false, nome_parceiro_cap: '' }))}
                    className={`py-2.5 px-5 rounded-xl font-bold transition-all border-2 text-sm ${
                      formData.tem_parceiro_cap === false
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                    }`}
                  >
                    Não
                  </button>
                </div>

                {formData.tem_parceiro_cap && (
                  <input
                    type="text"
                    value={formData.nome_parceiro_cap}
                    onChange={(e) => handleFormChange('nome_parceiro_cap', e.target.value)}
                    className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="Nome do parceiro CAP..."
                  />
                )}
              </div>
            </div>

            <div className="pt-8 border-t flex flex-col gap-4">
               <button
                onClick={handleSubmit}
                disabled={isSubmitting || (requiresSubservice && !selectedSubserviceId)}
                className={`w-full py-6 rounded-2xl font-black text-xl uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
                  isSubmitting || (requiresSubservice && !selectedSubserviceId)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-none'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.01] hover:shadow-blue-500/30'
                }`}
              >
                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : <Save size={24} />}
                {isSubmitting ? "Salvando..." : (requiresSubservice && !selectedSubserviceId ? "Selecione um Subserviço" : "Enviar Formulário")}
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

    </div>
  );
}

export default AssessoriaJuridica;
