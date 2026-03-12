import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Briefcase,
  AlertCircle, 
  Clock, 
  User, 
  X,
  CreditCard
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import juridicoService from "../modules/juridico/services/juridicoService"; // Keeping the service reference for now
import { Badge } from "./ui/Badge";
import { formatDate } from "../modules/cliente/lib/utils";
import { CalendarPicker } from "./ui/CalendarPicker";

type TabType = 'consultorias' | 'assessorias';

const HORARIOS_DISPONIVEIS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', 
  '17:00', '18:00'
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
  
  // Modal de Detalhes
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const effectiveUserId = userId || activeProfile?.id;

  const getLocalDateString = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      } catch(e) { console.warn("Erro carregando funcionarios", e) }
      
      if (activeTab === 'consultorias') {
        const data = await juridicoService.getAgendamentos();
        console.log("DEBUG: Consultorias (API Response):", data);
        const dataArr = Array.isArray(data) ? data : (data ? [data] : []);
        console.log("DEBUG: Consultorias (Array):", dataArr);
        
        // Filtrar consultorias: apenas itens que NÃO requerem delegação jurídica
        const filtered = dataArr.filter((item: any) => {
          const req = item.requer_delegacao;
          console.log(`DEBUG: Item ${item.id} - requer_delegacao: ${req} (${typeof req})`);
          return !req;
        });
        console.log("DEBUG: Consultorias (Filtered):", filtered);
        setConsultorias(filtered);
      } else if (activeTab === 'assessorias' && effectiveUserId) {
        // Buscar agendamentos que foram delegados a este responsável
        const data = await juridicoService.getAgendamentosByResponsavel(effectiveUserId);
        console.log("DEBUG: Assessorias (API Response):", data);
        const dataArr = Array.isArray(data) ? data : (data ? [data] : []);
        console.log("DEBUG: Assessorias (Array):", dataArr);
        setAssessorias(dataArr);
      }
    } catch (err: any) {
      console.error("Erro ao carregar agendamentos:", err);
      setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, effectiveUserId]);

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
      case 'aprovado':
      case 'confirmado':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Confirmado</Badge>;
      case 'pendente':
      case 'agendado':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Agendado</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Cancelado</Badge>;
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

  // Função auxiliar para calcular conflitos e duração nos slots
  const getItemParaHorario = (hora: string) => {
    // Garantir que a comparação seja feita com datas no mesmo fuso (Local)
    const [h, m] = hora.split(':').map(Number);
    const inicioSlot = new Date(dataSelecionada);
    inicioSlot.setHours(h, m, 0, 0);
    const inicioSlotTime = inicioSlot.getTime();
    
    const found = itemsDoDia.find(item => {
      const timeValue = item.data_hora || item.criado_em;
      if (!timeValue) return false;
      const inicioAgendamento = new Date(timeValue);
      const duracao = item.duracao_minutos || 60;
      const fimAgendamento = new Date(inicioAgendamento.getTime() + duracao * 60000);
      
      // Margem de erro de 1 minuto para evitar bugs de arredondamento
      const match = inicioAgendamento.getTime() <= (inicioSlotTime + 60000) && inicioSlotTime < fimAgendamento.getTime();
      return match;
    });

    if (found) console.log(`DEBUG: Slot ${hora} ocupado por:`, found.id, "Início:", new Date(found.data_hora || found.criado_em).toLocaleTimeString());
    return found;
  };

  const isInicioAgendamento = (hora: string, item: any) => {
    const timeValue = item.data_hora || item.criado_em;
    if (!item || !timeValue) return false;
    const d = new Date(timeValue);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}` === hora;
  };

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
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'consultorias' 
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Consultorias
          </button>
          <button
            onClick={() => setActiveTab('assessorias')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'assessorias' 
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
              disablePastDates={false}
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
                        return (
                          <div 
                            key={hora}
                            className={`py-3 px-3 rounded-xl flex flex-col items-center justify-center border border-dashed opacity-50 ${
                              activeTab === 'consultorias' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-400' : 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 text-indigo-400'
                            }`}
                          >
                             <div className="flex items-center gap-1.5 text-sm"><Clock className="h-4 w-4 opacity-50"/> {hora}</div>
                             <span className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-70">Ocupado</span>
                          </div>
                        )
                     }

                     const nomeCliente = activeTab === 'consultorias' 
                       ? itemNoHorario.nome 
                       : (itemNoHorario.clientes?.nome || 'Assessoria');

                     return (
                       <button
                         key={hora}
                         onClick={() => setSelectedItem(itemNoHorario)}
                         className={`py-3 px-3 rounded-xl font-medium border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-start gap-1.5 w-full text-left overflow-hidden ${
                           activeTab === 'consultorias' 
                             ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20' 
                             : 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                         }`}
                       >
                         <div className="flex items-center justify-between w-full opacity-90 text-sm">
                           <div className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> {hora}</div>
                           <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-md">
                             {itemNoHorario.duracao_minutos || 60}m
                           </span>
                         </div>
                         <div className="text-xs font-bold truncate w-full px-0.5 mt-0.5">
                           {nomeCliente}
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
                      <Clock className="h-4 w-4 opacity-60"/> 
                      <span>{hora}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup / Modal de Detalhes */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-neutral-700 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-800/50">
               <div>
                 <h2 className="text-lg font-bold text-gray-900 dark:text-white">Detalhes do Agendamento</h2>
                 <p className="text-sm text-gray-500 mt-0.5">ID: {selectedItem.id}</p>
               </div>
               <button 
                 onClick={() => setSelectedItem(null)}
                 className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
               >
                 <X className="h-5 w-5" />
               </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Serviço / Produto</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {activeTab === 'consultorias' ? selectedItem.produto_nome : (selectedItem.servico_nome || 'Assessoria Jurídica')}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(activeTab === 'consultorias' ? selectedItem.status : 'confirmado')}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-gray-100 dark:border-neutral-800">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center gap-1.5"><Calendar className="h-3 w-3"/> Data</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                       {selectedItem.data_hora || selectedItem.criado_em ? new Date(selectedItem.data_hora || selectedItem.criado_em).toLocaleDateString('pt-BR') : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-gray-100 dark:border-neutral-800">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center gap-1.5"><Clock className="h-3 w-3"/> Horário</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                       {selectedItem.data_hora || selectedItem.criado_em ? new Date(selectedItem.data_hora || selectedItem.criado_em).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : '—'}
                       <span className="text-xs text-gray-500 ml-1">({selectedItem.duracao_minutos || 60}m)</span>
                    </p>
                  </div>
               </div>

               {/* Seção Condicional: Informações de Assessoria (Chamada) */}
               {activeTab === 'assessorias' && selectedItem.respostas && (
                 <div className="pt-4 border-t border-gray-100 dark:border-neutral-700">
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-3">Informações da Chamada</p>
                    <div className="space-y-4">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
                             <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Processos Ativos?</p>
                             <p className="text-sm font-medium">{selectedItem.respostas.proc_ativos ? 'Sim' : 'Não'}</p>
                          </div>
                          <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
                             <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Possui Dependentes?</p>
                             <p className="text-sm font-medium">{selectedItem.respostas.possui_dependentes ? 'Sim' : 'Não'}</p>
                          </div>
                       </div>
                       
                       {selectedItem.respostas.proc_tipos && (
                         <div className="p-3 bg-gray-50 dark:bg-neutral-900/50 rounded-xl border border-gray-100 dark:border-neutral-800">
                           <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Tipos de Processos</p>
                           <p className="text-sm">{selectedItem.respostas.proc_tipos}</p>
                         </div>
                       )}

                       {selectedItem.respostas.possui_dependentes && (
                          <div className="p-3 bg-gray-50 dark:bg-neutral-900/50 rounded-xl border border-gray-100 dark:border-neutral-800">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Qtd. Dependentes / Processos Dep.</p>
                            <p className="text-sm font-medium">
                              {selectedItem.respostas.dep_qtd || 0} dependente(s) {selectedItem.respostas.dep_processos ? '(Algum possui processo)' : '(Nenhum possui processo)'}
                            </p>
                          </div>
                       )}
                    </div>
                 </div>
               )}

               <div className="pt-4 border-t border-gray-100 dark:border-neutral-700">
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-3">Dados do Cliente</p>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-400 block mb-0.5">Nome</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                         {activeTab === 'consultorias' ? selectedItem.nome : (selectedItem.clientes?.nome || '—')}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="overflow-hidden">
                        <span className="text-xs text-gray-400 block mb-0.5">E-mail</span>
                        <p className="font-medium text-gray-900 dark:text-white truncate" title={selectedItem.email || selectedItem.clientes?.email}>
                           {selectedItem.email || selectedItem.clientes?.email || '—'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block mb-0.5">Telefone</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                           {selectedItem.telefone || selectedItem.clientes?.whatsapp || selectedItem.clientes?.telefone || '—'}
                        </p>
                      </div>
                    </div>
                  </div>
               </div>

               {selectedItem.observacoes && (
                 <div className="pt-4 border-t border-gray-100 dark:border-neutral-700">
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">Observações / Notas</p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700/30 p-3 rounded-xl">
                      <p className="text-sm text-yellow-800 dark:text-yellow-500 italic">
                        "{selectedItem.observacoes}"
                      </p>
                    </div>
                 </div>
               )}

               <div className="pt-4 border-t border-gray-100 dark:border-neutral-700 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider block mb-1">Responsável pela Consultoria</span>
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
                       <p className="font-medium text-blue-900 dark:text-blue-100 italic">
                         {(() => {
                           const respId = selectedItem.responsavel_juridico_id;
                           if (!respId) return 'Aguardando Atribuição';
                           const user = usuariosSistema.find(u => u.id === respId);
                           if (user) return user.full_name;
                           if (activeProfile?.id === respId) return activeProfile?.full_name;
                           return `Usuário (${respId.substring(0,8)})`;
                         })()}
                       </p>
                       {!selectedItem.responsavel_juridico_id && activeTab === 'consultorias' && (
                         <button 
                           onClick={handleAssign}
                           disabled={isAssigning}
                           className="mt-2 w-full py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                         >
                           {isAssigning ? 'Atribuindo...' : 'Realizar Consultoria'}
                         </button>
                       )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider block mb-1">Agendado / Criado Por</span>
                    <div className="bg-gray-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-gray-100 dark:border-neutral-800">
                       <p className="font-medium text-gray-900 dark:text-white">
                         {(() => {
                           const creatorId = selectedItem.usuario_id || selectedItem.responsavel_id;
                           const user = usuariosSistema.find(u => u.id === creatorId);
                           if (user) return user.full_name;
                           if (activeProfile?.id === creatorId) return activeProfile?.full_name;
                           return creatorId ? `Usuário (${creatorId.substring(0,8)})` : 'Sistema';
                         })()}
                       </p>
                       <p className="text-xs text-gray-500 truncate mt-0.5">
                         {(() => {
                           const creatorId = selectedItem.usuario_id || selectedItem.responsavel_id;
                           const user = usuariosSistema.find(u => u.id === creatorId);
                           if (user?.email) return user.email;
                           if (activeProfile?.id === creatorId) return activeProfile?.email;
                           return '';
                         })()}
                       </p>
                    </div>
                  </div>
               </div>
               
               <div className="pt-4 border-t border-gray-100 dark:border-neutral-700">
                  <div className="grid grid-cols-2 gap-4">
                    {(selectedItem.valor || selectedItem.pagamento_status) && (
                      <div>
                        <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider block mb-1">Pagamento (Valor)</span>
                        <p className="text-sm font-medium flex items-center gap-1 text-gray-900 dark:text-white">
                           <CreditCard className="h-3.5 w-3.5 text-gray-400"/>
                           {selectedItem.metodo_pagamento || selectedItem.pagamento_status || '—'} 
                           {selectedItem.valor && (
                             <span className="text-emerald-600 dark:text-emerald-400 ml-1 font-bold">R$ {Number(selectedItem.valor).toFixed(2)}</span>
                           )}
                        </p>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-neutral-700 bg-gray-50/80 dark:bg-neutral-900/50 flex flex-col sm:flex-row justify-between gap-3">
               <div>
                  {activeTab === 'consultorias' && (
                    <button 
                      onClick={() => navigate(`/juridico/assessoria?clienteId=${selectedItem.cliente_id}`)}
                      className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                    >
                      <Briefcase className="h-4 w-4" />
                      Iniciar Consultoria
                    </button>
                  )}
               </div>
               <button 
                 onClick={() => setSelectedItem(null)}
                 className="px-6 py-2.5 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
               >
                 Fechar
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MeusAgendamentos;
