import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Eye,
  Send,
  Stamp,
  Languages,
  Loader2,
  ClipboardList,
  Clock,
  CheckCircle2,
  XOctagon,
  Plus,
  Bell
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../cliente/components/ui/card';
import { cn } from '../../cliente/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from './ui/sonner';
import {
  getFormulariosWithStatus,
  updateFormularioClienteStatus,
  getRequerimentosByCliente,
  updateRequerimentoStatus,
  getDependentes,
  updateDocumentStatus
} from '../services/juridicoService';
import { ReviewActionButtons } from './ReviewActionButtons';
import { RejectModal } from './RejectModal';
import { RequirementRequestModal } from './RequirementRequestModal';
import { clienteService } from '../../cliente/services/clienteService';

// Status do formulário do cliente (resposta)
export type FormularioClienteStatus = 'pendente' | 'aprovado' | 'rejeitado';

// Interface para formulários com status
export interface FormularioWithStatus {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  memberId: string | null;
  downloadUrl: string;
  status: 'waiting' | 'received';
  // Status da resposta do cliente (quando recebida)
  responseStatus?: FormularioClienteStatus;
  motivoRejeicao?: string;
  response: {
    id: string;
    fileName: string;
    downloadUrl: string;
    uploadDate: string;
  } | null;
}

// Tipos para o fluxo de análise
export type AnalysisStage = 'initial_analysis' | 'apostille_check' | 'translation_check' | 'completed';
export type TabType = 'analise_tecnica' | 'apostilamento' | 'traducao' | 'finalizados' | 'requerimentos' | 'formularios';

export interface JuridicoDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'pending' | 'analyzing' | 'rejected' | 'waiting_apostille' | 'analyzing_apostille' | 'waiting_translation' | 'analyzing_translation' | 'approved';
  currentStage: AnalysisStage;
  rejectionReason?: string;
  solicitado_pelo_juridico?: boolean;
  // ... rest of interface
  uploadDate: string;
  history: {
    stage: AnalysisStage;
    status: 'pending' | 'approved' | 'rejected' | 'skipped';
    date?: string;
    notes?: string;
  }[];
}

interface ProcessAnalysisProps {
  clientName: string;
  memberName: string;
  clienteId: string;
  membroId?: string;
  processoId?: string;
  documents: JuridicoDocument[];
  onBack: () => void;
  onUpdateDocument: (docId: string, updates: Partial<JuridicoDocument & { prazo?: number }>, skipFetch?: boolean) => Promise<void>;
}

const STAGES = [
  { id: 'initial_analysis', label: 'Análise Técnica', icon: Eye },
  { id: 'apostille_check', label: 'Apostilamento', icon: Stamp },
  { id: 'translation_check', label: 'Tradução', icon: Languages },
];

export function ProcessAnalysis({
  clientName,
  memberName,
  clienteId,
  membroId,
  processoId,
  documents: initialDocs,
  onBack,
  onUpdateDocument
}: ProcessAnalysisProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('analise_tecnica');

  // Requerimentos
  const [requerimentos, setRequerimentos] = useState<any[]>([]);
  const [requerimentosLoading, setRequerimentosLoading] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  // Formulários
  const [formularios, setFormularios] = useState<FormularioWithStatus[]>([]);
  const [formulariosLoading, setFormulariosLoading] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  // Selection state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'documento' | 'formulario' | 'requerimento' | null>(null);

  // Documentos
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  // Form rejection state
  const [formRejectModalOpen, setFormRejectModalOpen] = useState(false);
  const [isUpdatingFormStatus, setIsUpdatingFormStatus] = useState(false);

  // Requirement modal
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  const selectedDoc = useMemo(() => initialDocs.find(d => d.id === selectedId), [initialDocs, selectedId]);
  const selectedForm = useMemo(() => formularios.find(f => f.id === selectedId), [formularios, selectedId]);
  const selectedReq = useMemo(() => requerimentos.find(r => r.id === selectedId), [requerimentos, selectedId]);

  // Filtragem unificada baseada no fluxo de trabalho
  const filteredItems = useMemo(() => {
    const allDocs = initialDocs.map(d => ({ ...d, itemType: 'documento' as const }));
    const allForms = formularios.map(f => ({ ...f, itemType: 'formulario' as const }));
    const allReqs = requerimentos.map(r => ({ ...r, itemType: 'requerimento' as const }));

    switch (activeTab) {
      case 'analise_tecnica':
        return allDocs.filter(d =>
          d.currentStage === 'initial_analysis' ||
          d.status === 'pending' ||
          d.status === 'analyzing' ||
          d.status === 'rejected'
        );
      case 'apostilamento':
        return allDocs.filter(d =>
          d.currentStage === 'apostille_check' ||
          d.status === 'waiting_apostille' ||
          d.status === 'analyzing_apostille'
        );
      case 'traducao':
        return allDocs.filter(d =>
          d.currentStage === 'translation_check' ||
          d.status === 'waiting_translation' ||
          d.status === 'analyzing_translation'
        );
      case 'finalizados':
        return allDocs.filter(d =>
          d.currentStage === 'completed' ||
          d.status === 'approved'
        );
      case 'requerimentos':
        return allReqs;
      case 'formularios':
        return allForms;
      default:
        return allDocs;
    }
  }, [activeTab, initialDocs, formularios, requerimentos]);

  // Efeito para garantir seleção ao trocar de aba
  useEffect(() => {
    if (filteredItems.length > 0) {
      const currentExists = filteredItems.find(item => item.id === selectedId);
      if (!selectedId || !currentExists) {
        const first = filteredItems[0];
        setSelectedId(first.id);
        setSelectedItemType(first.itemType || (activeTab === 'formularios' ? 'formulario' : activeTab === 'requerimentos' ? 'requerimento' : 'documento'));
      }
    } else {
      setSelectedId(null);
      setSelectedItemType(null);
    }
  }, [filteredItems, activeTab]);

  // Fetch items when tab changes
  useEffect(() => {
    const fetchFamily = async () => {
      if (!clienteId) return;
      try {
        const deps = await getDependentes(clienteId);
        setFamilyMembers([
          { id: clienteId, name: clientName, type: 'Titular' },
          ...deps.map((d: any) => ({ id: d.id, name: d.nome_completo || d.name, type: d.parentesco || 'Dependente' }))
        ]);
      } catch (e) {
        console.error('Erro ao buscar membros da família:', e);
      }
    };
    fetchFamily();
  }, [clienteId]);

  // Fetch formularios eagerly (so counts work) and requerimentos
  useEffect(() => {
    if (clienteId) {
      const fetchFormularios = async () => {
        setFormulariosLoading(true);
        try {
          const data = await getFormulariosWithStatus(clienteId, membroId);
          setFormularios(data);
        } catch (error) {
          console.error('Erro ao buscar formulários:', error);
        } finally {
          setFormulariosLoading(false);
        }
      };
      fetchFormularios();
    }
  }, [clienteId, membroId]);

  useEffect(() => {
    if (clienteId) {
      const fetchRequerimentos = async () => {
        setRequerimentosLoading(true);
        try {
          const data = await getRequerimentosByCliente(clienteId, membroId);
          setRequerimentos(data);
        } catch (error) {
          console.error('Erro ao buscar requerimentos:', error);
        } finally {
          setRequerimentosLoading(false);
        }
      };
      fetchRequerimentos();
    }
  }, [clienteId, membroId]);

  const PREDEFINED_REASONS = [
    { value: 'ilegivel', label: 'Documento Ilegível' },
    { value: 'invalido', label: 'Documento Inválido/Expirado' },
    { value: 'incompleto', label: 'Documento Incompleto' },
    { value: 'errado', label: 'Documento Incorreto (Outro tipo enviado)' },
    { value: 'outros', label: 'Outros (Especificar)' }
  ];

  const handleConfirmRejection = () => {
    if (!selectedDoc) return;

    const finalReason = rejectionReason === 'outros' ? customReason : PREDEFINED_REASONS.find(r => r.value === rejectionReason)?.label;

    onUpdateDocument(selectedDoc.id, {
      status: 'rejected',
      currentStage: 'initial_analysis',
      rejectionReason: finalReason
    });
    setRejectModalOpen(false);
    setRejectionReason('');
    setCustomReason('');
  };

  const [isUpdatingReqStatus, setIsUpdatingReqStatus] = useState(false);

  const handleUpdateRequerimento = async (status: string, reason?: string) => {
    if (!selectedReq) return;
    setIsUpdatingReqStatus(true);
    try {
      await updateRequerimentoStatus(selectedReq.id, status, reason);
      // Update local state
      setRequerimentos(prev => prev.map(r =>
        r.id === selectedReq.id ? { ...r, status: status, observacoes: reason || r.observacoes } : r
      ));
    } catch (error) {
      console.error('Erro ao atualizar requerimento:', error);
    } finally {
      setIsUpdatingReqStatus(false);
    }
  };
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [prazo, setPrazo] = useState<string>('15');
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const confirmApproval = async () => {
    if (!selectedDoc) return;
    setIsUpdatingStatus(true);

    let updates: Partial<JuridicoDocument> = {};

    if (selectedDoc.currentStage === 'initial_analysis') {
      updates = {
        currentStage: 'apostille_check',
        status: 'waiting_apostille'
      };
    } else if (selectedDoc.currentStage === 'apostille_check') {
      updates = {
        currentStage: 'translation_check',
        status: 'waiting_translation'
      };
    } else if (selectedDoc.currentStage === 'translation_check') {
      updates = {
        currentStage: 'completed',
        status: 'approved'
      };
    }

    await onUpdateDocument(selectedDoc.id, updates);
    setIsUpdatingStatus(false);
    setApproveModalOpen(false);
  };

  const handleConfirmRequest = async () => {
    if (!selectedDoc) return;
    setIsUpdatingStatus(true);
    
    // ID do funcionário jurídico (mockado como no restante do sistema)
    const LAWYER_ID = 'befc50e4-3191-449e-9691-83d4e55dceb2';
    
    try {
      const prazoNum = parseInt(prazo) || 15;
      
      // Define o status em MAIÚSCULO para coincidir com o enum do backend
      let statusFinal = selectedDoc.status.toUpperCase();
      if (selectedDoc.currentStage === 'apostille_check') {
        statusFinal = 'WAITING_APOSTILLE';
      } else if (selectedDoc.currentStage === 'translation_check') {
        statusFinal = 'WAITING_TRANSLATION';
      }
      
      // Chamada direta para o backend que atualiza o status e cria a notificação
      await updateDocumentStatus(
        selectedDoc.id,
        statusFinal,
        undefined, // motivoRejeicao
        true,      // solicitado_pelo_juridico
        prazoNum,
        LAWYER_ID
      );
      
      // Atualiza o estado local via onUpdateDocument para refletir as mudanças na UI
      // Passamos skipBackend: true para o pai saber que NÃO deve chamar o fetch de novo
      await onUpdateDocument(selectedDoc.id, {
        status: statusFinal.toLowerCase() as any,
        solicitado_pelo_juridico: true,
        skipBackend: true
      } as any);

      toast.success("Solicitação e notificação enviadas com sucesso!");
      setRequestModalOpen(false);
    } catch (error) {
      console.error('Erro ao solicitar documento:', error);
      toast.error("Erro ao processar solicitação.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAction = (action: 'reject' | 'request_action' | 'next') => {
    if (!selectedDoc) return;

    if (action === 'reject') {
      setRejectModalOpen(true);
    }
    else if (action === 'next') {
      setApproveModalOpen(true);
    }
    else if (action === 'request_action') {
      setRequestModalOpen(true);
    }
  };

  const getStageIndex = (stage: AnalysisStage) => {
    if (stage === 'completed') return 3;
    return STAGES.findIndex(s => s.id === stage);
  };

  const currentStageIndex = selectedDoc ? getStageIndex(selectedDoc.currentStage) : 0;

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-3rem)] border rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-xl">
        {/* Header com Pipeline Visual */}
        <div className="bg-white dark:bg-gray-800 border-b shrink-0 shadow-sm z-20">
          {/* Row 1: Client Name */}
          <div className="h-14 flex items-center px-6 gap-4 border-b border-gray-100 dark:border-gray-700/50">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="h-9 w-9 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tighter truncate leading-none">
                {clientName}
              </h1>
              <p className="text-[10px] font-bold text-gray-400 tracking-tight truncate mt-0.5">
                {memberName}
              </p>
            </div>
          </div>

          {/* Row 2: Visual Pipeline */}
          <div className="px-6 py-3">
            <div className="flex items-center gap-1">
              {/* Document Pipeline - 4 Stages */}
              {[
                { id: 'analise_tecnica', label: 'Análise Técnica', shortLabel: 'Análise', icon: Eye, color: 'blue', desc: 'Verificar documentos' },
                { id: 'apostilamento', label: 'Apostilamento', shortLabel: 'Apostila', icon: Stamp, color: 'amber', desc: 'Verificar apostila' },
                { id: 'traducao', label: 'Tradução', shortLabel: 'Tradução', icon: Languages, color: 'purple', desc: 'Verificar tradução' },
                { id: 'finalizados', label: 'Finalizados', shortLabel: 'Pronto', icon: CheckCircle2, color: 'green', desc: 'Concluídos' },
              ].map((stage, idx) => {
                const Icon = stage.icon;
                const isActive = activeTab === stage.id;
                let count = 0;
                if (stage.id === 'analise_tecnica') count = initialDocs.filter(d => d.currentStage === 'initial_analysis' || d.status === 'pending' || d.status === 'analyzing' || d.status === 'rejected').length;
                else if (stage.id === 'apostilamento') count = initialDocs.filter(d => d.currentStage === 'apostille_check' || d.status === 'waiting_apostille' || d.status === 'analyzing_apostille').length;
                else if (stage.id === 'traducao') count = initialDocs.filter(d => d.currentStage === 'translation_check' || d.status === 'waiting_translation' || d.status === 'analyzing_translation').length;
                else if (stage.id === 'finalizados') count = initialDocs.filter(d => d.currentStage === 'completed' || d.status === 'approved').length;

                const colorMap: Record<string, { activeBg: string, activeBorder: string, activeText: string, countBg: string }> = {
                  blue: { activeBg: 'bg-blue-50 dark:bg-blue-900/20', activeBorder: 'border-blue-500', activeText: 'text-blue-700 dark:text-blue-400', countBg: 'bg-blue-600' },
                  amber: { activeBg: 'bg-amber-50 dark:bg-amber-900/20', activeBorder: 'border-amber-500', activeText: 'text-amber-700 dark:text-amber-400', countBg: 'bg-amber-600' },
                  purple: { activeBg: 'bg-purple-50 dark:bg-purple-900/20', activeBorder: 'border-purple-500', activeText: 'text-purple-700 dark:text-purple-400', countBg: 'bg-purple-600' },
                  green: { activeBg: 'bg-green-50 dark:bg-green-900/20', activeBorder: 'border-green-500', activeText: 'text-green-700 dark:text-green-400', countBg: 'bg-green-600' },
                };
                const colors = colorMap[stage.color];

                return (
                  <div key={stage.id} className="contents">
                    {idx > 0 && (
                      <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0 mx-0.5" />
                    )}
                    <button
                      onClick={() => setActiveTab(stage.id as TabType)}
                      className={cn(
                        "flex-1 flex items-center gap-3 px-3 py-2 rounded-xl border-2 transition-all duration-200 min-w-0",
                        isActive
                          ? `${colors.activeBg} ${colors.activeBorder} shadow-sm`
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isActive ? colors.countBg + ' text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                      )}>
                        {count > 0 ? (
                          <span className="text-xs font-black">{count}</span>
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-wide truncate",
                          isActive ? colors.activeText : 'text-gray-500'
                        )}>
                          {stage.shortLabel}
                        </p>
                        <p className="text-[9px] text-gray-400 truncate hidden xl:block">{stage.desc}</p>
                      </div>
                    </button>
                  </div>
                );
              })}

              {/* Separator */}
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2 shrink-0" />

              {/* Requerimentos & Formularios */}
              {[
                { id: 'requerimentos', label: 'Requerimentos', icon: Send, color: 'rose', count: requerimentos.length },
                { id: 'formularios', label: 'Formulários', icon: ClipboardList, color: 'slate', count: formularios.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-200 shrink-0",
                      isActive
                        ? tab.color === 'rose'
                          ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-700 dark:text-rose-400 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900/20 border-slate-500 text-slate-700 dark:text-slate-400 shadow-sm'
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-wide hidden xl:inline">{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={cn(
                        "text-[9px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white",
                        tab.color === 'rose' ? 'bg-rose-500' : 'bg-slate-500'
                      )}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Lista Filtrada */}
          <div className="w-85 border-r bg-white dark:bg-gray-800 flex flex-col shrink-0 shadow-lg z-10">
            <div className="p-4 border-b bg-gray-50/50 dark:bg-gray-900/20">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {activeTab === 'formularios' ? 'Formulários do Processo' :
                    activeTab === 'requerimentos' ? 'Requerimentos' :
                      activeTab === 'analise_tecnica' ? 'Análise Técnica' :
                        activeTab === 'apostilamento' ? 'Verificação de Apostila' :
                          activeTab === 'traducao' ? 'Verificação de Tradução' :
                            activeTab === 'finalizados' ? 'Documentos Finalizados' :
                              'Documentos para Revisão'}
                </h3>
                {activeTab === 'requerimentos' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-lg hover:bg-primary/10 hover:text-primary"
                    onClick={() => setIsReqModalOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {(formulariosLoading && activeTab === 'formularios') || (requerimentosLoading && activeTab === 'requerimentos') ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Carregando...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-20 px-8">
                    <div className="h-16 w-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                      <FileText className="h-8 w-8 text-gray-200" />
                    </div>
                    <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Nenhum item nesta categoria</p>
                  </div>
                ) : (
                  filteredItems.map(item => {
                    const isSelected = selectedId === item.id;
                    const type = item.itemType ||
                      (activeTab === 'formularios' ? 'formulario' :
                        activeTab === 'requerimentos' ? 'requerimento' : 'documento');

                    const isReceived = type === 'formulario' && item.status === 'received';
                    const isApproved = (item.status === 'approved' || item.status === 'aprovado' || item.status === 'CONCLUIDO');

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedId(item.id);
                          setSelectedItemType(type);
                        }}
                        className={cn(
                          "p-5 rounded-2xl cursor-pointer transition-all border-2 group relative overflow-hidden",
                          isSelected
                            ? "bg-primary/5 border-primary shadow-xl ring-1 ring-primary/10"
                            : isApproved
                              ? "bg-green-50 border-green-500/50 dark:bg-green-900/20 dark:border-green-600/50 shadow-md"
                              : "bg-white border-gray-100 hover:border-gray-200 dark:bg-gray-800 dark:border-gray-700/50 shadow-sm"
                        )}
                      >
                        {isSelected && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />}
                        {isApproved && !isSelected && (
                          <div className="absolute top-0 left-0 w-2.5 h-full bg-green-500 shadow-[2px_0_10px_rgba(34,197,94,0.3)]" />
                        )}

                        <div className="flex items-start gap-5">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all relative",
                            isSelected
                              ? "bg-primary text-white shadow-lg shadow-primary/30"
                              : isApproved
                                ? "bg-green-600 text-white shadow-lg shadow-green-500/40"
                                : "bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
                          )}>
                            {type === 'formulario' ? <ClipboardList className="h-6 w-6" /> :
                              type === 'requerimento' ? <Send className="h-6 w-6" /> :
                                <FileText className="h-6 w-6" />}
                            {isApproved && !isSelected && (
                              <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-black text-sm truncate leading-tight tracking-tight",
                              isSelected ? "text-gray-900 dark:text-white" :
                                isApproved ? "text-green-900 dark:text-green-100" :
                                  "text-gray-600 dark:text-gray-300"
                            )}>
                              {item.name || item.tipo}
                            </p>
                            <div className="mt-2.5 flex flex-wrap gap-2">
                              {type === 'formulario' ? (
                                <Badge variant={isReceived ? "success" : "warning"} className="text-[10px] font-black uppercase tracking-wider py-0 px-2 flex items-center gap-1">
                                  {isReceived ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                  {isReceived ? 'Recebido' : 'Aguardando'}
                                </Badge>
                              ) : type === 'requerimento' ? (
                                <Badge variant={isApproved ? "success" : "warning"} className="text-[10px] font-black uppercase tracking-wider py-0 px-2 flex items-center gap-1">
                                  {isApproved ? 'Concluído' : item.status}
                                </Badge>
                              ) : (
                                <Badge variant={isApproved ? "success" : "outline"} className={cn(
                                  "text-[9px] font-black uppercase tracking-wider py-0 px-2 border-2",
                                  isApproved ? "bg-green-600 text-white border-transparent" :
                                    (item as JuridicoDocument).status === 'rejected' ? "border-red-500/30 text-red-600" :
                                      "border-gray-200 text-gray-500"
                                )}>
                                  {isApproved ? 'Aprovado' : (item as JuridicoDocument).status.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Área de Revisão Principal */}
          <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900/50">
            {selectedItemType === 'requerimento' ? (
              /* Requirements Review */
              selectedReq ? (
                <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="mb-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200">REQUERIMENTO</Badge>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{selectedReq.tipo}</h2>
                        <p className="text-sm text-gray-500 mt-1">Solicitado em {new Date(selectedReq.created_at || selectedReq.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={selectedReq.status === 'aprovado' || selectedReq.status === 'CONCLUIDO' ? 'success' : 'warning'} className="text-xs font-bold px-4 py-1">
                        {selectedReq.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Observações</Label>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border text-sm text-gray-600 min-h-[100px]">
                          {selectedReq.observacoes || 'Sem observações.'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Documentos Relacionados</Label>
                        <div className="space-y-2">
                          {selectedReq.documentos && selectedReq.documentos.length > 0 ? selectedReq.documentos.map((doc: any) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border text-xs">
                              <span className="font-bold">{doc.tipo}</span>
                              <Badge variant={doc.status === 'APPROVED' ? 'success' : 'outline'}>{doc.status}</Badge>
                            </div>
                          )) : (
                            <p className="text-xs text-gray-400 italic py-4 text-center border border-dashed rounded-xl">Nenhum documento vinculado ainda.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t flex gap-4">
                      <Button
                        onClick={() => handleUpdateRequerimento('aprovado')}
                        disabled={isUpdatingReqStatus || selectedReq.status === 'aprovado' || selectedReq.status === 'CONCLUIDO'}
                        className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-600/20"
                      >
                        {isUpdatingReqStatus ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Aprovar Requerimento'}
                      </Button>
                      <Button
                        onClick={() => handleUpdateRequerimento('rejeitado')}
                        disabled={isUpdatingReqStatus || selectedReq.status === 'aprovado' || selectedReq.status === 'CONCLUIDO'}
                        variant="outline"
                        className="flex-1 h-12 border-2 font-bold rounded-2xl"
                      >
                        Rejeitar / Solicitar Ajuste
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Selecione um requerimento para visualizar
                </div>
              )
            ) : selectedItemType === 'documento' ? (
              /* Documents Review */
              selectedDoc ? (
                <>
                  {/* Document Header & Progress */}
                  <div className="bg-white dark:bg-gray-800 p-6 border-b shrink-0 space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDoc.name}</h2>
                        <p className="text-sm text-gray-500">Enviado em {selectedDoc.uploadDate}</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download Original
                      </Button>
                    </div>

                    {/* Enhanced Stage Stepper */}
                    <div className="relative">
                      <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div
                        className="absolute top-5 left-0 h-1 bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
                      />

                      <div className="flex justify-between relative z-10">
                        {STAGES.map((stage, idx) => {
                          const isCompleted = idx < currentStageIndex || selectedDoc.currentStage === 'completed';
                          const isCurrent = idx === currentStageIndex && selectedDoc.currentStage !== 'completed';
                          const Icon = stage.icon;

                          const stageDescriptions = [
                            'Verificar se o documento est\u00e1 correto e leg\u00edvel',
                            'Verificar se o documento est\u00e1 apostilado',
                            'Verificar se a tradu\u00e7\u00e3o est\u00e1 correta',
                          ];

                          return (
                            <div key={stage.id} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / STAGES.length}%` }}>
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white dark:bg-gray-800",
                                isCompleted ? "border-green-500 text-green-500 bg-green-50 dark:bg-green-900/20" :
                                  isCurrent ? "border-blue-500 text-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30 scale-110" :
                                    "border-gray-300 text-gray-300"
                              )}>
                                {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                              </div>
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-wider",
                                isCompleted ? "text-green-600" :
                                  isCurrent ? "text-blue-600" :
                                    "text-gray-400"
                              )}>
                                {stage.label}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] text-blue-500 font-medium text-center leading-tight max-w-[140px]">
                                  {stageDescriptions[idx]}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div className="flex-1 p-6 overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-950">
                    {selectedDoc.url ? (
                      <div className="w-full h-full max-w-5xl bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <iframe
                          src={selectedDoc.url}
                          className="w-full h-full border-none"
                          title={selectedDoc.name}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                        <div className="h-20 w-20 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-6">
                          <XOctagon className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Documento Indisponível</h3>
                        <p className="text-sm max-w-xs">O cliente ainda não realizou o upload deste documento ou o link de visualização expirou.</p>
                      </div>
                    )}
                  </div>

                  {/* Contextual Actions Footer */}
                  <div className="p-4 bg-white dark:bg-gray-800 border-t flex items-center justify-between gap-4 shrink-0">
                    {selectedDoc.currentStage === 'completed' ? (
                      <div className="flex-1 flex items-center justify-center gap-3 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-500">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-base font-bold text-green-700 dark:text-green-400">Documento Finalizado — Todas as Etapas Concluídas</span>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="destructive"
                          className="flex-1 h-12 text-base shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                          onClick={() => handleAction('reject')}
                        >
                          <XCircle className="w-5 h-5 mr-2" />
                          Rejeitar Documento
                        </Button>

                        {selectedDoc.currentStage === 'apostille_check' && (
                          <Button
                            variant={selectedDoc.solicitado_pelo_juridico ? "outline" : "secondary"}
                            className={cn(
                              "flex-1 h-12 text-base border-2 active:scale-[0.98]",
                              selectedDoc.solicitado_pelo_juridico 
                                ? "bg-white border-amber-200 text-amber-600 cursor-default" 
                                : "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700"
                            )}
                            onClick={selectedDoc.solicitado_pelo_juridico ? undefined : () => handleAction('request_action')}
                          >
                            <Stamp className="w-5 h-5 mr-2" />
                            {selectedDoc.solicitado_pelo_juridico 
                              ? 'Apostilamento já solicitado'
                              : 'Solicitar Apostilamento'
                            }
                          </Button>
                        )}

                        {selectedDoc.currentStage === 'translation_check' && (
                          <Button
                            variant={selectedDoc.solicitado_pelo_juridico ? "outline" : "secondary"}
                            className={cn(
                              "flex-1 h-12 text-base border-2 active:scale-[0.98]",
                              selectedDoc.solicitado_pelo_juridico 
                                ? "bg-white border-purple-200 text-purple-600 cursor-default" 
                                : "bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700"
                            )}
                            onClick={selectedDoc.solicitado_pelo_juridico ? undefined : () => handleAction('request_action')}
                          >
                            <Languages className="w-5 h-5 mr-2" />
                            {selectedDoc.solicitado_pelo_juridico 
                              ? 'Tradução já solicitada'
                              : 'Solicitar Tradução'
                            }
                          </Button>
                        )}

                        <Button
                          className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-green-200 dark:hover:shadow-none active:scale-[0.98]"
                          onClick={() => handleAction('next')}
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          {selectedDoc.currentStage === 'initial_analysis'
                            ? 'Aprovar → Apostilamento'
                            : selectedDoc.currentStage === 'apostille_check'
                              ? 'Aprovado → Tradução'
                              : 'Aprovar → Finalizar'
                          }
                        </Button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Selecione um documento para revisar
                </div>
              )
            ) : (
              /* Forms Review */
              selectedForm ? (
                <>
                  {/* Form Header */}
                  <div className="bg-white dark:bg-gray-800 p-6 border-b shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedForm.name}</h2>
                          {selectedForm.status === 'waiting' ? (
                            <Badge variant="warning" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Aguardando Resposta
                            </Badge>
                          ) : (
                            <Badge variant="success" className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Resposta Recebida
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Enviado em {new Date(selectedForm.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <a href={selectedForm.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                            Download Original
                          </a>
                        </Button>
                        {selectedForm.response && (
                          <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700" asChild>
                            <a href={selectedForm.response.downloadUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                              Download Resposta
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Preview */}
                  <div className="flex-1 p-6 overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-950">
                    {selectedForm.status === 'waiting' ? (
                      <div className="w-full h-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                        <div className="h-20 w-20 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-6">
                          <Clock className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aguardando Resposta</h3>
                        <p className="text-sm max-w-xs">O cliente ainda não enviou este formulário preenchido.</p>
                      </div>
                    ) : selectedForm.response ? (
                      <div className="w-full h-full max-w-5xl bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <iframe
                          src={selectedForm.response.downloadUrl}
                          className="w-full h-full border-none"
                          title={selectedForm.name}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                        <div className="h-20 w-20 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-6">
                          <XOctagon className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Documento Indisponível</h3>
                        <p className="text-sm max-w-xs">O formulário foi marcado como recebido mas o arquivo não foi encontrado.</p>
                      </div>
                    )}
                  </div>

                  {/* Form Action Buttons - only show when response received and not yet approved/rejected */}
                  {selectedForm.status === 'received' && selectedForm.responseStatus !== 'aprovado' && selectedForm.responseStatus !== 'rejeitado' && (
                    <ReviewActionButtons
                      onReject={() => setFormRejectModalOpen(true)}
                      onApprove={async () => {
                        if (!selectedForm.response) return;
                        setIsUpdatingFormStatus(true);
                        try {
                          await updateFormularioClienteStatus(selectedForm.response.id, 'aprovado');
                          // Update local state
                          setFormularios(prev => prev.map(f =>
                            f.id === selectedForm.id
                              ? { ...f, responseStatus: 'aprovado' }
                              : f
                          ));
                        } catch (error) {
                          console.error('Erro ao aprovar formulário:', error);
                        } finally {
                          setIsUpdatingFormStatus(false);
                        }
                      }}
                      loading={isUpdatingFormStatus}
                      approveLabel="Aprovar Formulário"
                      rejectLabel="Rejeitar Formulário"
                      showMiddleButton={false}
                    />
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Selecione um formulário para visualizar
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Documento</DialogTitle>
            <DialogDescription>
              Por favor, informe o motivo da rejeição para que o cliente possa corrigir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da Rejeição</Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um motivo" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_REASONS.map(reason => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {rejectionReason === 'outros' && (
              <div className="space-y-2">
                <Label htmlFor="custom-reason">Descreva o motivo</Label>
                <Textarea
                  id="custom-reason"
                  placeholder="Digite o motivo detalhado..."
                  value={customReason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRejection}
              disabled={!rejectionReason || (rejectionReason === 'outros' && !customReason.trim())}
            >
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Aprovação</DialogTitle>
            <DialogDescription>
              {selectedDoc?.currentStage === 'initial_analysis'
                ? 'Este documento será aprovado na etapa de Análise Técnica. O próximo passo será aguardar o cliente realizar o apostilamento.'
                : selectedDoc?.currentStage === 'apostille_check'
                  ? 'Este documento será aprovado na etapa de Apostilamento. O próximo passo será aguardar o cliente enviar a tradução juramentada.'
                  : 'Este documento será aprovado na etapa de Tradução. Isso concluirá o ciclo de validação deste documento.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)} disabled={isUpdatingStatus}>
              Cancelar
            </Button>
            <Button onClick={confirmApproval} className="bg-green-600 hover:bg-green-700 text-white" disabled={isUpdatingStatus}>
              {isUpdatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Rejection Modal */}
      <RejectModal
        open={formRejectModalOpen}
        onOpenChange={setFormRejectModalOpen}
        onConfirm={async (reason) => {
          if (!selectedForm?.response) return;
          setIsUpdatingFormStatus(true);
          try {
            await updateFormularioClienteStatus(selectedForm.response.id, 'rejeitado', reason);
            // Update local state
            setFormularios(prev => prev.map(f =>
              f.id === selectedForm.id
                ? { ...f, responseStatus: 'rejeitado', motivoRejeicao: reason }
                : f
            ));
            setFormRejectModalOpen(false);
          } catch (error) {
            console.error('Erro ao rejeitar formulário:', error);
          } finally {
            setIsUpdatingFormStatus(false);
          }
        }}
        loading={isUpdatingFormStatus}
        title="Rejeitar Formulário"
        description="Por favor, informe o motivo da rejeição para que o cliente possa corrigir e reenviar."
      />
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Solicitação</DialogTitle>
            <DialogDescription>
              {selectedDoc?.currentStage === 'apostille_check'
                ? 'Isso notificará o cliente para providenciar o apostilamento deste documento. O documento aparecerá na aba "Para Apostilar" do painel do cliente.'
                : 'Isso notificará o cliente para providenciar a tradução juramentada deste documento. O documento aparecerá na aba "Para Traduzir" do painel do cliente.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prazo">Prazo para o Cliente (Dias)</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="prazo"
                  type="text"
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-gray-500">Dias úteis para conclusão</span>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
              <Bell className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Uma notificação automática será enviada ao cliente com as instruções e o prazo definido acima.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestModalOpen(false)} disabled={isUpdatingStatus}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmRequest} 
              className="bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar e Notificar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RequirementRequestModal
        isOpen={isReqModalOpen}
        onOpenChange={setIsReqModalOpen}
        clienteId={clienteId}
        processoId={processoId || ''}
        members={familyMembers}
        onSuccess={() => {
          // Refresh requirements
          if (activeTab === 'requerimentos') {
            getRequerimentosByCliente(clienteId, membroId).then(setRequerimentos);
          }
        }}
      />
    </>
  );
}
