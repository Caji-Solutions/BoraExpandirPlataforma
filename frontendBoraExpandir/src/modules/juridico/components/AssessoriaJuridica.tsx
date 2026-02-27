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
  Send
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import juridicoService, { ClienteComResponsavel } from "../services/juridicoService";
import { RequirementRequestModal } from './RequirementRequestModal';
import { Badge } from "../../../components/ui/Badge";
import { Button } from "./ui/button";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
        
        // Buscar clientes e catálogo em paralelo
        // O usuário solicitou que todos os clientes sejam exibidos aqui
        const [clientesData, servicesData] = await Promise.all([
          juridicoService.getAllClientesComResponsavel(),
          juridicoService.getCatalogServices()
        ]);
        
        setClientes(clientesData);
        setFilteredClientes(clientesData);
        setCatalogServices(servicesData);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeProfile?.id, activeProfile?.role]);

  useEffect(() => {
    const filtered = clientes.filter(c => 
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClientes(filtered);
  }, [searchTerm, clientes]);

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

      const obsGerais = (questions.find(q => q.id === 'obs_gerais')?.value as string) || '';

      await juridicoService.createAssessoria({
        clienteId: selectedCliente.id,
        respostas: respostasMap,
        observacoes: obsGerais,
        responsavelId: activeProfile.id,
        servicoId: selectedServiceId
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error("Erro ao salvar assessoria:", err);
      setError("Ocorreu um erro ao salvar a assessoria: " + (err.message || "Entre em contato com o suporte."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando seus clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Criar Assessoria Jurídica</h1>
        <p className="text-muted-foreground mt-1">Selecione um cliente para iniciar o questionário de assessoria.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Clientes */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar cliente..."
                  className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100">
              {filteredClientes.length > 0 ? (
                filteredClientes.map(cliente => (
                  <button
                    key={cliente.id}
                    onClick={() => setSelectedCliente(cliente)}
                    className={`w-full text-left p-4 hover:bg-blue-50 transition-colors flex items-center justify-between group ${selectedCliente?.id === cliente.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${selectedCliente?.id === cliente.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${selectedCliente?.id === cliente.id ? 'text-blue-700' : 'text-gray-900'}`}>
                          {cliente.nome}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{cliente.email}</p>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${selectedCliente?.id === cliente.id ? 'text-blue-600 translate-x-1' : 'text-gray-300 group-hover:text-gray-400'}`} />
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">Nenhum cliente encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulário de Assessoria */}
        <div className="lg:col-span-2">
          {selectedCliente ? (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                    <Scale className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Assessoria: {selectedCliente.nome}</h2>
                    <p className="text-sm text-blue-700 font-medium">Preencha os detalhes judiciais abaixo</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8 flex-grow">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold">Atenção</p>
                      <p className="text-xs opacity-90">{error}</p>
                    </div>
                  </div>
                )}

                {/* Seletor de Serviço */}
                <div className="pb-6 border-b">
                  <div className="flex items-center gap-2 mb-4">
                    <Scale className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Serviço em Avaliação</h3>
                  </div>
                  <div className="max-w-md">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Selecione o Serviço do Catálogo</label>
                    <select 
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    >
                      <option value="">Selecione um serviço...</option>
                      {catalogServices.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} {service.value ? `- €${service.value}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Seção de Dependentes */}
                <div className="pt-6 border-t mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      Dependentes do Cliente
                    </h3>
                  </div>

                  {/* Lista de Dependentes Atual */}
                  {dependentes.length > 0 ? (
                    <div className="mb-6 grid grid-cols-1 gap-3">
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
                                {dep.is_ancestral_direto && (
                                  <Badge variant="default" className="text-[9px] uppercase font-bold py-0 h-4 bg-purple-100 text-purple-700 hover:bg-purple-100 border-none">
                                    Ancestral
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                {dep.cpf && <p className="text-[10px] text-gray-400">CPF: {dep.cpf}</p>}
                                {dep.data_nascimento && <p className="text-[10px] text-gray-400">Nascimento: {new Date(dep.data_nascimento).toLocaleDateString()}</p>}
                                {dep.email && <p className="text-[10px] text-gray-400">Email: {dep.email}</p>}
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
                              title="Solicitar Documentos"
                            >
                              <Send className="h-4 w-4" />
                              <span className="hidden sm:inline">Solicitar Docs</span>
                            </button>
                            
                            {currentProcess && (
                              <button
                                onClick={() => navigate(`/juridico/analise?processoId=${currentProcess.id}`)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2 text-xs font-semibold"
                                title="Ver na Fila de Análise"
                              >
                                <FileSearch className="h-4 w-4" />
                                <span className="hidden sm:inline">Ver Fila</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !loadingDependentes && (
                    <div className="mb-6 p-8 text-center bg-gray-50/50 border border-dashed rounded-xl">
                      <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Nenhum dependente cadastrado.</p>
                    </div>
                  )}

                  {loadingDependentes && dependentes.length === 0 && (
                    <div className="flex items-center justify-center p-12 text-sm text-gray-400 mb-6 bg-gray-50/50 rounded-xl border border-dashed">
                      <Loader2 className="h-5 w-5 animate-spin mr-3" />
                      Carregando dependentes...
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Adicionar Novo Dependente</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Nome Completo</label>
                        <input 
                          type="text" 
                          value={depForm.nome}
                          onChange={(e) => setDepForm({...depForm, nome: e.target.value})}
                          placeholder="Nome" 
                          className="w-full p-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Parentesco</label>
                        <select 
                          value={depForm.parentesco}
                          onChange={(e) => setDepForm({...depForm, parentesco: e.target.value})}
                          className="w-full p-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Selecione...</option>
                          <option value="filho">Filho(a)</option>
                          <option value="conjuge">Cônjuge</option>
                          <option value="pai_mae">Pai/Mãe</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Data de Nascimento</label>
                        <input 
                          type="date" 
                          value={depForm.dataNascimento}
                          onChange={(e) => setDepForm({...depForm, dataNascimento: e.target.value})}
                          className="w-full p-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">CPF</label>
                        <input 
                          type="text" 
                          value={depForm.cpf}
                          onChange={(e) => setDepForm({...depForm, cpf: e.target.value})}
                          placeholder="000.000.000-00" 
                          className="w-full p-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">RG</label>
                        <input 
                          type="text" 
                          value={depForm.rg}
                          onChange={(e) => setDepForm({...depForm, rg: e.target.value})}
                          placeholder="RG" 
                          className="w-full p-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Passaporte</label>
                        <input 
                          type="text" 
                          value={depForm.passaporte}
                          onChange={(e) => setDepForm({...depForm, passaporte: e.target.value})}
                          placeholder="Passaporte" 
                          className="w-full p-2 bg-gray-50 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 px-1 py-2">
                      <input 
                        type="checkbox" 
                        id="new_dep_is_ancestral" 
                        checked={depForm.isAncestral}
                        onChange={(e) => setDepForm({...depForm, isAncestral: e.target.checked})}
                        className="h-4 w-4 text-blue-600 rounded cursor-pointer" 
                      />
                      <label htmlFor="new_dep_is_ancestral" className="text-sm font-medium text-gray-700 select-none cursor-pointer">É ancestral direto?</label>
                    </div>

                    <button 
                      onClick={async () => {
                        if (depForm.nome && depForm.parentesco && selectedCliente) {
                          try {
                            await juridicoService.createDependent(
                              selectedCliente.id, 
                              depForm.nome, 
                              depForm.parentesco,
                              {
                                documento: depForm.cpf,
                                dataNascimento: depForm.dataNascimento,
                                rg: depForm.rg,
                                passaporte: depForm.passaporte,
                                nacionalidade: depForm.nacionalidade,
                                email: depForm.email,
                                telefone: depForm.telefone,
                                isAncestralDireto: depForm.isAncestral
                              }
                            );
                            
                            // Reset formulário
                            setDepForm({
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

                            alert('Dependente cadastrado com sucesso!');
                            fetchDependentes();
                          } catch (err) {
                            alert('Erro ao cadastrar dependente');
                          }
                        } else {
                          alert('Preencha os campos obrigatórios (Nome e Parentesco)');
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Cadastrar Dependente
                    </button>
                  </div>
                </div>

                <div className="space-y-8 mt-10">
                  {questions.map((q) => (
                    <div key={q.id} className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-blue-500" />
                        {q.text}
                      </label>
                      
                      {q.type === 'yes_no' && (
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleQuestionChange(q.id, true)}
                            className={`px-6 py-2 rounded-lg text-sm font-medium border transition-all ${q.value === true ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50'}`}
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => handleQuestionChange(q.id, false)}
                            className={`px-6 py-2 rounded-lg text-sm font-medium border transition-all ${q.value === false ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-50'}`}
                          >
                            Não
                          </button>
                        </div>
                      )}

                      {q.type === 'text' && (
                        <textarea
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px] text-sm"
                          placeholder="Digite aqui..."
                          value={q.value as string}
                          onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                        />
                      )}

                      {q.type === 'number' && (
                        <input
                          type="number"
                          className="w-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                          value={q.value as number}
                          onChange={(e) => handleQuestionChange(q.id, parseInt(e.target.value) || 0)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {showSuccess && (
                    <div className="flex items-center gap-2 text-green-600 animate-in fade-in slide-in-from-left-2 transition-all">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Salvo com sucesso!</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedCliente(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Salvar Assessoria
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-20 text-center space-y-4">
              <div className="p-4 bg-white rounded-full shadow-sm border">
                <ClipboardCheck className="h-10 w-10 text-gray-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Nenhum cliente selecionado</h3>
                <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
                  Selecione um cliente da lista à esquerda para começar a consultoria jurídica.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedCliente && currentProcess && (
        <RequirementRequestModal
          isOpen={isReqModalOpen}
          onOpenChange={setIsReqModalOpen}
          clienteId={selectedCliente.id}
          processoId={currentProcess.id}
          members={[
            { id: selectedCliente.id, name: selectedCliente.nome, type: 'Titular', isTitular: true },
            ...dependentes.map(d => ({ id: d.id, name: d.nome_completo, type: d.parentesco, isTitular: false }))
          ]}
          initialMemberId={reqModalMember?.id}
          onSuccess={() => {
            alert('Requerimento criado com sucesso!');
          }}
        />
      )}
    </div>
  );
}

export default AssessoriaJuridica;
