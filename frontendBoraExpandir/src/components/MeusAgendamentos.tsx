import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Briefcase,
  AlertCircle,
  CheckSquare,
  Clock,
  User,
  X,
  CreditCard,
  Copy,
  Video,
  CalendarClock,
  FileText,
  Fingerprint,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import juridicoService from "../modules/juridico/services/juridicoService"; // Keeping the service reference for now
import { catalogService, Service } from "../modules/adm/services/catalogService";
import { Badge } from '@/modules/shared/components/ui/badge';
import { CalendarPicker } from "@/components/ui/CalendarPicker";
import { parseBackendDate, formatHoraOnly, getBrtDateKey, getBrtHhMm } from "../utils/dateUtils";
import { PedidoReagendamentoModal } from "../modules/juridico/components/PedidoReagendamentoModal";

type TabType = 'consultorias' | 'assessorias';

const HORARIOS_DISPONIVEIS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

interface MeusAgendamentosProps {
  userId?: string;
  title?: string;
  description?: string;
}

export function MeusAgendamentos({ userId, title = "Agendamentos", description = "Gerencie suas consultorias e assessorias jurídicas." }: MeusAgendamentosProps) {
  const navigate = useNavigate();
  const { activeProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('consultorias');
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());

  const [consultorias, setConsultorias] = useState<any[]>([]);
  const [assessorias, setAssessorias] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuariosSistema, setUsuariosSistema] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Checks de Segurança
  const [hasFormulario, setHasFormulario] = useState<boolean | null>(null);
  const [checkingSecurity, setCheckingSecurity] = useState(false);
  const [isReagendamentoOpen, setIsReagendamentoOpen] = useState(false);
  const [isMarkingRealizada, setIsMarkingRealizada] = useState(false);
  const [isMarkingEmAndamento, setIsMarkingEmAndamento] = useState(false);
  const [hasStartedConsultoria, setHasStartedConsultoria] = useState(false);
  const [selectedVendedorId, setSelectedVendedorId] = useState<string>('');
  const [usuariosComerciaisC2, setUsuariosComerciaisC2] = useState<any[]>([]);
  const [isLoadingUsuariosC2, setIsLoadingUsuariosC2] = useState(false);
  const [cachedProfiles, setCachedProfiles] = useState<Record<string, string>>({});
  const [servicosCatalogo, setServicosCatalogo] = useState<Service[]>([]);
  const [isC2SelectionOpen, setIsC2SelectionOpen] = useState(false);
  const [c2SearchQuery, setC2SearchQuery] = useState('');

  const effectiveUserId = userId || activeProfile?.id;

  // Para strings BRT do backend (sem Z/offset): extrai data direto da string,
  // evitando qualquer dependência do timezone do browser.
  // Para objetos Date do CalendarPicker: usa timezone local (o calendário é local).
  const getLocalDateString = (date: Date | string) => {
    return getBrtDateKey(date);
  };


  const occupancyData = (activeTab === 'consultorias' ? consultorias : assessorias).reduce((acc: Record<string, number>, item) => {
    const timeValue = item.data_hora || item.criado_em;
    if (!timeValue) return acc;
    const dateKey = getLocalDateString(timeValue);

    // Count occupied slots for this day
    const dayItems = (activeTab === 'consultorias' ? consultorias : assessorias).filter(i => {
      const iTime = i.data_hora || i.criado_em;
      return iTime && getLocalDateString(iTime) === dateKey;
    });

    // Total slots is HORARIOS_DISPONIVEIS.length (10)
    acc[dateKey] = dayItems.length / HORARIOS_DISPONIVEIS.length;
    return acc;
  }, {});


  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch usuarios for mapping IDs to Names
      try {
        const usuarios = await juridicoService.getFuncionariosJuridico();
        setUsuariosSistema(usuarios);
      } catch (e) { console.warn("Erro carregando funcionarios", e) }

      if (activeTab === 'consultorias') {
        const data = await juridicoService.getAgendamentos();
        console.log("DEBUG: Consultorias (API Response):", data);
        const dataArr = Array.isArray(data) ? data : (data ? [data] : []);
        console.log("DEBUG: Consultorias (Array):", dataArr);

        // Mostrar apenas agendamentos aprovados de tipo 'agendavel' na aba de consultoria
        const catalogData = await catalogService.getCatalogServices();
        const typeMap: Record<string, string> = {};
        catalogData.forEach(s => { typeMap[s.id] = s.type; });

        const filtered = dataArr
          .filter((item: any) => item.pagamento_status === 'aprovado')
          .filter((item: any) => {
            const serviceType = typeMap[item.produto_id];
            return serviceType === 'agendavel' || !serviceType;
          })
          .map((item: any) => item);
        console.log("DEBUG: Consultorias (Total):", filtered.length);
        setConsultorias(filtered);
      } else if (activeTab === 'assessorias' && effectiveUserId) {
        // Buscar agendamentos que foram delegados a este responsável
        console.log(`DEBUG: Buscando agendamentos (${activeTab}) para user: ${effectiveUserId}`);
        const data: any = await juridicoService.getAgendamentosByResponsavel(effectiveUserId);

        console.log(`DEBUG: Dados recebidos da API (${activeTab}):`, data);

        let dataArr: any[] = [];
        if (data && !Array.isArray(data) && data.status === 'success') {
          dataArr = Array.isArray(data.data) ? data.data : (data.data ? [data.data] : []);
        } else {
          dataArr = Array.isArray(data) ? data : (data ? [data] : []);
        }

        // Filtrar apenas serviços do tipo 'fixo' (Contratos/Assessorias)
        const catalogData = await catalogService.getCatalogServices();
        const typeMap: Record<string, string> = {};
        catalogData.forEach(s => { typeMap[s.id] = s.type; });

        const filteredAssessorias = dataArr.filter((item: any) => {
          const serviceType = typeMap[item.produto_id] || typeMap[item.servico_id];
          return serviceType === 'fixo';
        });

        console.log("DEBUG: Assessorias (Array):", filteredAssessorias);
        setAssessorias(filteredAssessorias);
      }

      // Buscar catálogo de serviços para mapear nomes
      const catalog = await catalogService.getCatalogServices();
      setServicosCatalogo(catalog);

    } catch (err: any) {
      console.error("ERRO FATAL (fetchData):", err);
      setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Efeito para verificar segurança quando um item é selecionado
  useEffect(() => {
    if (selectedItem) {
      console.log("DEBUG: Item Selecionado (Raw):", JSON.stringify(selectedItem, null, 2));

      const checkSecurity = async () => {
        try {
          setCheckingSecurity(true);
          setHasFormulario(null); // Reset

          const clienteId = activeTab === 'consultorias' ? selectedItem.cliente_id : selectedItem.cliente_id;

          if (clienteId) {
            console.log(`DEBUG: Verificando formularios para cliente: ${clienteId}`);
            if (activeTab === 'consultorias') {
              let preenchido = false;
              try {
                preenchido = await juridicoService.verificarFormularioPreenchido(clienteId);
              } catch (apiError) {
                console.warn("Ignorando erro 401 na API, usando fallback cliente_is_user", apiError);
              }
              setHasFormulario(preenchido || !!selectedItem.cliente_is_user);
            } else {
              setHasFormulario(!!selectedItem.respostas);
            }
          } else {
            console.warn("DEBUG: Item selecionado nao possui cliente_id!");
            setHasFormulario(false);
          }

          // Verificar nome de quem agendou se não estiver no cache
          const creatorId = selectedItem.usuario_id || selectedItem.responsavel_id;
          if (creatorId && !usuariosSistema.find(u => u.id === creatorId) && !cachedProfiles[creatorId]) {
            console.log(`DEBUG: Buscando nome do criador ID: ${creatorId}`);
            const profile = await juridicoService.getProfileById(creatorId);
            if (profile) {
              setCachedProfiles(prev => ({ ...prev, [creatorId]: profile.full_name }));
            }
          }

        } catch (e) {
          console.error("DEBUG: Erro ao verificar seguranca:", e);
        } finally {
          setCheckingSecurity(false);
        }
      };

      checkSecurity();
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchData();
  }, [activeTab, effectiveUserId]);

  useEffect(() => {
    let isMounted = true;

    const fetchUsuariosComerciais = async () => {
      try {
        setIsLoadingUsuariosC2(true);
        const usuarios = await juridicoService.getUsuariosComerciaisC2();
        if (isMounted) {
          setUsuariosComerciaisC2(Array.isArray(usuarios) ? usuarios : []);
        }
      } catch (err) {
        console.warn('Erro ao carregar vendedores C2:', err);
        if (isMounted) {
          setUsuariosComerciaisC2([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingUsuariosC2(false);
        }
      }
    };

    fetchUsuariosComerciais();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedItem) {
      setHasStartedConsultoria(false);
      setSelectedVendedorId('');
      return;
    }

    setHasStartedConsultoria(selectedItem.status === 'em_consultoria');
    setSelectedVendedorId(selectedItem.vendedor_id || '');
  }, [selectedItem?.id, selectedItem?.status, selectedItem?.vendedor_id]);

  const handleAssign = async () => {
    if (!selectedItem || !activeProfile?.id) return;

    try {
      setIsAssigning(true);
      await juridicoService.atribuirResponsavelAgendamento(selectedItem.id, activeProfile.id);

      // Refresh current item data and list
      await fetchData();

      // Update selectedItem to show new responsible
      setSelectedItem((prev: any) => ({
        ...prev,
        responsavel_juridico_id: activeProfile.id
      }));

    } catch (err: any) {
      console.error("Erro ao atribuir consultoria:", err);
      alert("Erro ao atribuir consultoria: " + (err.message || "Tente novamente mais tarde."));
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmado':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Confirmado</Badge>;
      case 'agendado':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Agendado</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Cancelado</Badge>;
      case 'aguardando_verificacao':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">Aguardando Verificação</Badge>;
      case 'realizado':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Realizado</Badge>;
      case 'conflito':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Conflito</Badge>;
      case 'em_consultoria':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">Em Consultoria</Badge>;
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  // Filtrar os dados pelo dia selecionado
  const dataSelecionadaIso = getLocalDateString(dataSelecionada);

  const itemsDoDia = (activeTab === 'consultorias' ? consultorias : assessorias).filter(item => {
    if (!item.data_hora && !item.criado_em) return false;
    const dateStr = getLocalDateString(item.data_hora || item.criado_em);
    return dateStr === dataSelecionadaIso;
  });

  console.log("DEBUG: Renderizando grade para:", dataSelecionadaIso);
  console.log("DEBUG: Items filtrados para o dia:", JSON.stringify(itemsDoDia));

  const hhMmToMinutes = (hhMm: string) => {
    const [h, m] = hhMm.split(':').map(Number);
    return (h * 60) + m;
  };

  // Função auxiliar para calcular conflitos e duração nos slots (sempre em BRT)
  const getItemParaHorario = (hora: string) => {
    const slotMinutes = hhMmToMinutes(hora);

    return itemsDoDia.find(item => {
      const timeValue = item.data_hora || item.criado_em;
      if (!timeValue) return false;

      const itemMinutes = hhMmToMinutes(getBrtHhMm(timeValue));
      const duracao = item.duracao_minutos || 60;

      return itemMinutes < slotMinutes + 60 && slotMinutes < itemMinutes + duracao;
    });
  };

  // Este é o slot de início se o agendamento começa dentro da janela de hora do slot
  const isInicioAgendamento = (hora: string, item: any) => {
    const timeValue = item.data_hora || item.criado_em;
    if (!item || !timeValue) return false;

    const slotMinutes = hhMmToMinutes(hora);
    const itemMinutes = hhMmToMinutes(getBrtHhMm(timeValue));

    return itemMinutes >= slotMinutes && itemMinutes < slotMinutes + 60;
  };

  const isIniciarConsultoriaDisabled = !selectedItem
    || selectedItem.pagamento_status !== 'aprovado'
    || isMarkingEmAndamento
    || hasStartedConsultoria;

  const isRealizadaDisabled = !selectedItem
    || isMarkingRealizada
    || selectedItem.status === 'realizado';

  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-800 p-2 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
        <div className="flex bg-gray-100 dark:bg-neutral-900 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('consultorias')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'consultorias'
              ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
          >
            <Calendar className="h-4 w-4" />
            Consultorias
          </button>
          <button
            onClick={() => setActiveTab('assessorias')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === 'assessorias'
              ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
          >
            <Briefcase className="h-4 w-4" />
            Assessorias
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Coluna Esquerda: Calendário */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <CalendarPicker
              onDateSelect={setDataSelecionada}
              selectedDate={dataSelecionada}
              disabledDates={[]}
              occupancyData={occupancyData}
            />
          </div>
        </div>

        {/* Coluna Direita: Grade de Horários */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm p-6 min-h-[500px]">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Horários em {dataSelecionada.toLocaleDateString('pt-BR')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {itemsDoDia.length} agendamento(s) encontrado(s) para este dia
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeTab === 'consultorias' && (
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-200 dark:border-emerald-800">
                    40 min
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-muted-foreground">Carregando horários...</p>
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                {HORARIOS_DISPONIVEIS.map((hora) => {
                  const itemNoHorario = getItemParaHorario(hora);
                  const isOcupado = !!itemNoHorario;

                  if (isOcupado) {
                    const isInicio = isInicioAgendamento(hora, itemNoHorario);
                    if (!isInicio) {
                      const contRealizado = itemNoHorario.status === 'realizado';
                      return (
                        <button
                          key={hora}
                          onClick={() => setSelectedItem(itemNoHorario)}
                          className={`py-3 px-3 rounded-xl flex flex-col items-center justify-center border border-dashed opacity-50 transition-all hover:opacity-100 hover:shadow-md ${contRealizado ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-400' :
                            activeTab === 'consultorias' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-400' : 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 text-indigo-400'
                            }`}
                        >
                          <div className="flex items-center gap-1.5 text-sm"><Clock className="h-4 w-4 opacity-50" /> {hora}</div>
                          <span className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-70">Ocupado</span>
                        </button>
                      )
                    }

                    const nomeCliente = activeTab === 'consultorias'
                      ? itemNoHorario.nome
                      : (itemNoHorario.clientes?.nome || 'Assessoria');

                    const isRealizado = itemNoHorario.status === 'realizado';
                    return (
                      <button
                        key={hora}
                        onClick={() => setSelectedItem(itemNoHorario)}
                        className={`py-3 px-3 rounded-xl font-medium border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-start gap-1.5 w-full text-left overflow-hidden ${isRealizado
                          ? 'bg-green-600 text-white border-green-500 shadow-green-500/20'
                          : activeTab === 'consultorias'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
                            : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                          }`}
                      >
                        <div className="flex items-center justify-between w-full opacity-90 text-sm">
                          <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {hora}</div>
                          <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-md">
                            {itemNoHorario.duracao_minutos || 60}m
                          </span>
                        </div>
                        <div className="text-xs font-bold truncate w-full px-0.5 mt-0.5">
                          {nomeCliente}
                        </div>
                        <div className="text-[10px] opacity-80 truncate w-full px-0.5 font-semibold">
                          {itemNoHorario.produto?.nome || servicosCatalogo.find(s => s.id === itemNoHorario.produto_id)?.name || 'Consultoria'}
                        </div>
                      </button>
                    )
                  }

                  // Livre
                  return (
                    <div
                      key={hora}
                      className="py-4 px-3 rounded-xl font-medium border border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-800/30 text-gray-500 dark:text-neutral-400 flex items-center justify-center gap-2 cursor-default"
                    >
                      <Clock className="h-4 w-4 opacity-60" />
                      <span>{hora}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Agendamento */}
      {selectedItem && !isC2SelectionOpen && createPortal(
        <div className="fixed inset-0 z-[1000] w-screen h-screen bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" style={{ animation: 'slideUp 0.25s ease-out' }}>

            {/* Header compacto */}
            <div className="sticky top-0 z-30 px-6 py-4 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex justify-between items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">Detalhes do Agendamento</h2>
                  <div className="shrink-0">
                    {getStatusBadge(activeTab === 'consultorias' ? selectedItem.status : 'confirmado')}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider truncate">
                    {selectedItem.id?.substring(0, 8)}...
                  </p>
                  <button
                    onClick={() => {
                      const currentArea = window.location.pathname.split('/')[1] || 'juridico';
                      const targetId = selectedItem.cliente_id || selectedItem.id;
                      navigate(`/${currentArea}/dna?clienteId=${targetId}&area=${currentArea}`);
                    }}
                    className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:text-blue-700 transition-colors shrink-0"
                  >
                    <Fingerprint className="h-3 w-3" />
                    DNA do Cliente
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="ml-3 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body scrollable */}
            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-neutral-800">
              <div className="px-6 py-5 space-y-5">

                {/* Servico + Data/Hora */}
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase font-semibold tracking-widest mb-1.5">Servico Agendado</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                    {activeTab === 'consultorias'
                      ? (selectedItem.produto?.nome || selectedItem.produto_nome || servicosCatalogo.find((s: any) => s.id === selectedItem.produto_id)?.name || 'Consultoria')
                      : (selectedItem.produto?.nome || selectedItem.produto_nome || selectedItem.servico_nome || servicosCatalogo.find((s: any) => s.id === selectedItem.produto_id)?.name || 'Assessoria Juridica')}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-3.5 w-3.5 text-blue-500" />
                      <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Data</p>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedItem.data_hora || selectedItem.criado_em
                        ? parseBackendDate(selectedItem.data_hora || selectedItem.criado_em).toLocaleDateString('pt-BR', {
                          timeZone: 'America/Sao_Paulo',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                        : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Horario</p>
                    </div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {(() => {
                        const timeValue = selectedItem.data_hora || selectedItem.criado_em;
                        if (!timeValue) return '—';
                        return formatHoraOnly(timeValue);
                      })()}
                      <span className="text-xs text-gray-400 font-medium ml-1.5">({selectedItem.duracao_minutos || 40}min)</span>
                    </p>
                  </div>
                </div>

                {/* Google Meet */}
                {selectedItem.meet_link && (
                  <a href={selectedItem.meet_link} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-xl p-4 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500 rounded-lg text-white shadow-sm">
                        <Video className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Google Meet</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Sala de Videoconferencia</p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg group-hover:bg-emerald-600 transition-colors shadow-sm">
                      Entrar
                    </span>
                  </a>
                )}

                {/* Estado de Seguranca */}
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase font-semibold tracking-widest mb-3 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" /> Verificacoes
                  </p>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedItem.pagamento_status === 'aprovado'
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30'
                      : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30'
                      }`}>
                      <div className={`p-1.5 rounded-lg text-white ${selectedItem.pagamento_status === 'aprovado' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                        {selectedItem.pagamento_status === 'aprovado' ? <CheckSquare className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">Autorizacao Financeira</p>
                        <p className="text-[10px] font-medium text-gray-500 dark:text-neutral-400">
                          {selectedItem.pagamento_status === 'aprovado' ? 'Pagamento confirmado' : 'Aguardando compensacao'}
                        </p>
                      </div>
                    </div>

                    {activeTab === 'consultorias' && selectedItem.status !== 'realizado' && (
                      <div className="rounded-xl border border-blue-200 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-950/20">
                        <button
                          onClick={async () => {
                            if (!selectedItem) return;
                            try {
                              setIsMarkingEmAndamento(true);
                              await juridicoService.marcarConsultoriaEmAndamento(selectedItem.id);
                              setHasStartedConsultoria(true);
                              setSelectedItem((prev: any) => prev ? { ...prev, status: 'em_consultoria' } : prev);
                              const targetId = selectedItem.cliente_id || selectedItem.id;
                              navigate(`/juridico/dna?clienteId=${targetId}&tab=formularios&refresh=${Date.now()}`);
                            } catch (err: any) {
                              console.warn('Erro ao marcar em andamento:', err);
                            } finally {
                              setIsMarkingEmAndamento(false);
                            }
                          }}
                          disabled={isIniciarConsultoriaDisabled}
                          className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex justify-center items-center gap-2 ${
                            !isIniciarConsultoriaDisabled
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Briefcase className="h-3.5 w-3.5" />
                          {isMarkingEmAndamento ? 'Iniciando...' : hasStartedConsultoria ? 'Em Consultoria' : 'Iniciar Consultoria'}
                        </button>
                      </div>
                    )}

                    {activeTab === 'consultorias' && (
                      <div className={`rounded-xl border transition-all ${checkingSecurity ? 'bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 animate-pulse' :
                        hasFormulario ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/30'
                        }`}>
                        <div className="flex items-center gap-3 p-3">
                          <div className={`p-1.5 rounded-lg text-white ${checkingSecurity ? 'bg-gray-400' : hasFormulario ? 'bg-blue-500' : 'bg-rose-500'}`}>
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-white">Coleta de Informacoes</p>
                            <p className="text-[10px] font-medium text-gray-500 dark:text-neutral-400">
                              {checkingSecurity ? 'Verificando...' : hasFormulario ? 'Formulario preenchido' : 'Dados pendentes'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'assessorias' && selectedItem.status !== 'realizado' && (
                      <div className="rounded-xl border border-blue-200 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-950/20">
                        <button
                          onClick={async () => {
                            if (!selectedItem) return;
                            const targetId = selectedItem.cliente_id || selectedItem.id;
                            const pId = selectedItem.produto_id || selectedItem.servico_id || '';
                            try {
                              setIsMarkingEmAndamento(true);
                              await juridicoService.marcarAssessoriaEmAndamento(selectedItem.id);
                              navigate(`/juridico/assessoria?clienteId=${targetId}&produtoId=${pId}&agendamentoId=${selectedItem.id}`);
                            } catch (err: any) {
                              console.warn('Erro ao marcar assessoria em andamento:', err);
                            } finally {
                              setIsMarkingEmAndamento(false);
                            }
                          }}
                          className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                          <Briefcase className="h-3.5 w-3.5" />
                          {isMarkingEmAndamento ? 'Iniciando...' : 'Iniciar Atendimento'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Identidade do Cliente */}
                <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl p-4">
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase font-semibold tracking-widest mb-3">Identidade do Cliente</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium mb-0.5">Nome</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {activeTab === 'consultorias' ? selectedItem.nome : (selectedItem.clientes?.nome || '—')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium mb-0.5">Telefone</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {selectedItem.telefone || selectedItem.clientes?.whatsapp || selectedItem.clientes?.telefone || '—'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-gray-400 font-medium mb-0.5">E-mail</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {selectedItem.email || selectedItem.clientes?.email || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Extra Context: Assessorias */}
                {activeTab === 'assessorias' && selectedItem.respostas && (
                  <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl p-4">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-widest mb-3">Informacao Rapida</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-xs font-medium text-gray-500">Processos Ativos</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{selectedItem.respostas.proc_ativos ? 'SIM' : 'NAO'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-neutral-800">
                        <span className="text-xs font-medium text-gray-500">Dependentes</span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{selectedItem.respostas.possui_dependentes ? 'SIM' : 'NAO'}</span>
                      </div>
                      {selectedItem.respostas.proc_tipos && (
                        <div className="pt-1">
                          <span className="text-[10px] font-medium text-gray-400 block mb-1">Tipos Cadastrados</span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">{selectedItem.respostas.proc_tipos}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Observacoes */}
                {selectedItem.observacoes && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4">
                    <p className="text-[10px] text-amber-600 uppercase font-semibold tracking-widest mb-2">Observacoes</p>
                    <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed italic">
                      "{selectedItem.observacoes}"
                    </p>
                  </div>
                )}

                {/* Registrado por */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Registrado por</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {(() => {
                        const creatorId = selectedItem.usuario_id || selectedItem.responsavel_id;
                        const user = usuariosSistema.find(u => u.id === creatorId);
                        if (user?.full_name) return user.full_name;
                        if (activeProfile?.id === creatorId) return activeProfile?.full_name;
                        if (cachedProfiles[creatorId]) return cachedProfiles[creatorId];
                        return creatorId ? 'Equipe Interna' : 'Sistema Automatico';
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer com acoes */}
            <div className="sticky bottom-0 z-40 px-6 py-4 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-950">
              <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                {activeTab === 'consultorias' && (
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => {
                        setSelectedVendedorId('');
                        setC2SearchQuery('');
                        setIsC2SelectionOpen(true);
                      }}
                      disabled={isRealizadaDisabled}
                      className="w-full px-4 py-3 font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      {isMarkingRealizada ? 'Salvando...' : 'Realizada'}
                    </button>
                  </div>
                )}

                {activeTab === 'assessorias' && (
                  <>


                    <button
                      onClick={async () => {
                        if (!selectedItem) return;
                        try {
                          setIsMarkingRealizada(true);
                          await juridicoService.marcarConsultoriaRealizada(selectedItem.id);
                          toast.success('Assessoria marcada como realizada.');
                          setSelectedItem(null);
                          fetchData();
                        } catch (err: any) {
                          toast.error('Erro ao marcar assessoria: ' + (err.response?.data?.message || err.message));
                        } finally {
                          setIsMarkingRealizada(false);
                        }
                      }}
                      disabled={isMarkingRealizada || selectedItem.status === 'realizado'}
                      className="flex-1 px-4 py-3 font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      {isMarkingRealizada ? 'Salvando...' : 'Realizada'}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setIsReagendamentoOpen(true)}
                  className="px-4 py-3 font-bold text-xs bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <CalendarClock className="h-3.5 w-3.5" /> Reagendar
                </button>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          `}</style>
        </div>,
        document.body
      )}

      {/* Modal de Selecao de Vendedor C2 */}
      {isC2SelectionOpen && selectedItem && createPortal(
        <div className="fixed inset-0 z-[1100] w-screen h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]" style={{ animation: 'slideUp 0.25s ease-out' }}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Selecionar Vendedor C2</h2>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Selecione o vendedor responsavel por esta consultoria</p>
            </div>

            {/* Search */}
            <div className="px-6 py-3 border-b border-gray-100 dark:border-neutral-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou e-mail..."
                  value={c2SearchQuery}
                  onChange={(e) => setC2SearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de usuarios */}
            <div className="overflow-y-auto flex-1 px-3 py-2">
              {(() => {
                const filtered = usuariosComerciaisC2.filter((u) => {
                  if (!c2SearchQuery) return true;
                  const q = c2SearchQuery.toLowerCase();
                  return (
                    (u.full_name || u.nome || '').toLowerCase().includes(q) ||
                    (u.email || '').toLowerCase().includes(q)
                  );
                });
                if (filtered.length === 0) {
                  return (
                    <div className="py-10 text-center">
                      <p className="text-sm text-gray-400">Nenhum usuario encontrado</p>
                    </div>
                  );
                }
                return filtered.map((usuario) => (
                  <button
                    key={usuario.id}
                    onClick={() => setSelectedVendedorId(usuario.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 text-left ${
                      selectedVendedorId === usuario.id
                        ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50'
                        : 'hover:bg-gray-50 dark:hover:bg-neutral-900 border border-transparent'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold truncate ${selectedVendedorId === usuario.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                        {usuario.full_name || usuario.nome || 'Sem nome'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">{usuario.email || '—'}</p>
                    </div>
                    {selectedVendedorId === usuario.id && (
                      <CheckSquare className="h-4 w-4 text-blue-500 shrink-0" />
                    )}
                  </button>
                ));
              })()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-neutral-800 flex gap-3">
              <button
                onClick={() => {
                  setIsC2SelectionOpen(false);
                  setSelectedVendedorId('');
                  setC2SearchQuery('');
                }}
                className="flex-1 px-4 py-3 font-bold text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!selectedItem || !selectedVendedorId) return;
                  try {
                    setIsMarkingRealizada(true);
                    await juridicoService.marcarConsultoriaRealizada(selectedItem.id, selectedVendedorId);
                    toast.success('Consultoria marcada como realizada e cliente movido para Pos Consultoria.');
                    setIsC2SelectionOpen(false);
                    setSelectedItem(null);
                    setSelectedVendedorId('');
                    setC2SearchQuery('');
                    fetchData();
                  } catch (err: any) {
                    toast.error('Erro ao marcar consultoria: ' + (err.response?.data?.message || err.message));
                  } finally {
                    setIsMarkingRealizada(false);
                  }
                }}
                disabled={!selectedVendedorId || isMarkingRealizada}
                className="flex-1 px-4 py-3 font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                {isMarkingRealizada ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          `}</style>
        </div>,
        document.body
      )}

      {selectedItem && (
        <PedidoReagendamentoModal
          isOpen={isReagendamentoOpen}
          onClose={() => setIsReagendamentoOpen(false)}
          agendamento={selectedItem}
          onSucesso={() => {
            setIsReagendamentoOpen(false);
            setSelectedItem(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

export default MeusAgendamentos;


