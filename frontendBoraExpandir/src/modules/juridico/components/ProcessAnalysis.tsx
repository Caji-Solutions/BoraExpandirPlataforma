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
  Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../cliente/components/ui/card';
import { cn } from '../../cliente/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { 
    getFormulariosWithStatus, 
    updateFormularioClienteStatus,
    getRequerimentosByCliente,
    updateRequerimentoStatus,
    getDependentes
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
export type TabType = 'documentos' | 'formularios' | 'requerimentos' | 'pendentes' | 'analise' | 'espera' | 'aprovados';

export interface JuridicoDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'pending' | 'analyzing' | 'rejected' | 'waiting_apostille' | 'analyzing_apostille' | 'waiting_translation' | 'analyzing_translation' | 'approved';
  currentStage: AnalysisStage;
  rejectionReason?: string;
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
  onUpdateDocument: (docId: string, updates: Partial<JuridicoDocument>) => void;
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
  const [activeTab, setActiveTab] = useState<TabType>('documentos');
  
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

  // Filtragem unificada
  const filteredItems = useMemo(() => {
    const allDocs = initialDocs.map(d => ({ ...d, itemType: 'documento' as const }));
    const allForms = formularios.map(f => ({ ...f, itemType: 'formulario' as const }));
    const allReqs = requerimentos.map(r => ({ ...r, itemType: 'requerimento' as const }));

    if (activeTab === 'documentos') return allDocs;
    if (activeTab === 'formularios') return allForms;
    if (activeTab === 'requerimentos') return allReqs;
    
    // Combine all for status-based tabs
    const combined = [...allDocs, ...allForms, ...allReqs];

    return combined.filter((item: any) => {
      const type = item.itemType;
      
      if (type === 'documento') {
        const doc = item as JuridicoDocument;
        switch(activeTab) {
          case 'pendentes': return (!doc.url || doc.status === 'pending');
          case 'analise': return ['analyzing', 'analyzing_apostille', 'analyzing_translation'].includes(doc.status);
          case 'espera': return ['waiting_apostille', 'waiting_translation', 'rejected'].includes(doc.status);
          case 'aprovados': return doc.status === 'approved';
          default: return false;
        }
      } 
      
      if (type === 'formulario') {
        const form = item as FormularioWithStatus;
        switch(activeTab) {
          case 'pendentes': return form.status === 'waiting';
          case 'analise': return form.status === 'received' && (!form.responseStatus || form.responseStatus === 'pendente');
          case 'espera': return form.responseStatus === 'rejeitado';
          case 'aprovados': return form.responseStatus === 'aprovado';
          default: return false;
        }
      }

      if (type === 'requerimento') {
        const req = item;
        const status = (req.status || '').toLowerCase();
        switch(activeTab) {
          case 'pendentes': return status === 'pendente' && (!req.documentos || req.documentos.length === 0);
          case 'analise': return status === 'em_analise' || (status === 'pendente' && req.documentos?.length > 0);
          case 'espera': return status === 'aguardando_cliente' || status === 'rejeitado';
          case 'aprovados': return status === 'aprovado' || status === 'concluido';
          default: return false;
        }
      }

      return false;
    });
  }, [activeTab, initialDocs, formularios, requerimentos]);

  // Efeito para garantir seleção ao trocar de aba
  useEffect(() => {
    if (filteredItems.length > 0) {
      // Se nada selecionado ou o selecionado não está na lista filtrada, seleciona o primeiro
      const currentExists = filteredItems.find(item => item.id === selectedId);
      if (!selectedId || !currentExists) {
        const first = filteredItems[0];
        setSelectedId(first.id);
        setSelectedItemType(first.itemType || (activeTab === 'documentos' ? 'documento' : activeTab === 'formularios' ? 'formulario' : 'requerimento'));
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

  useEffect(() => {
    if (activeTab === 'formularios' && clienteId) {
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
    
    if (activeTab === 'requerimentos' && clienteId) {
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
  }, [activeTab, clienteId, membroId]);

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

  const handleAction = (action: 'reject' | 'request_action' | 'next') => {
    if (!selectedDoc) return;

    if (action === 'reject') {
      setRejectModalOpen(true);
    } 
    else if (action === 'next') {
      setApproveModalOpen(true);
    } 
    else if (action === 'request_action') {
      let updates: Partial<JuridicoDocument> = {};
      // Solicitar ação da etapa (meio)
      if (selectedDoc.currentStage === 'apostille_check') {
        updates = { status: 'waiting_apostille' };
        // Notifica cliente para apostilar
      } else if (selectedDoc.currentStage === 'translation_check') {
        updates = { status: 'waiting_translation' };
        // Notifica cliente para traduzir
      }
      onUpdateDocument(selectedDoc.id, updates);
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
      {/* Header Unificado Premium */}
      <div className="bg-white dark:bg-gray-800 border-b shrink-0 shadow-sm z-20">
        <div className="h-16 flex items-center px-6 justify-between gap-8">
          {/* Lado Esquerdo: Nome e Voltar */}
          <div className="flex items-center gap-4 shrink-0">
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

          {/* Centro/Direita: Seletores (Abas) */}
          <div className="flex-1 flex items-center justify-end overflow-x-auto no-scrollbar gap-1">
            {[
              { id: 'documentos', label: 'Docs', icon: FileText },
              { id: 'formularios', label: 'Forms', icon: ClipboardList },
              { id: 'requerimentos', label: 'Reqs', icon: Send },
              { id: 'pendentes', label: 'Pendentes', icon: AlertCircle },
              { id: 'analise', label: 'Análise', icon: Eye },
              { id: 'espera', label: 'Espera', icon: Clock },
              { id: 'aprovados', label: 'Ok', icon: CheckCircle2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "flex items-center gap-2 px-4 h-10 font-black text-[9px] uppercase tracking-widest transition-all rounded-xl",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-gray-400")} />
                  <span className="hidden xl:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contador Rápido */}
          <div className="hidden lg:flex items-center pl-4 border-l border-gray-100 shrink-0">
             <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-3 py-1 rounded-lg">
                {filteredItems.length}
             </Badge>
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
                <div className="bg-white dark:bg-gray-800 p-6 border-b shrink-0 space-y-6">
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

                  {/* Progress Bar */}
                  <div className="relative">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-0 rounded-full" />
                      <div 
                          className="absolute top-1/2 left-0 h-1 bg-green-500 -z-0 rounded-full transition-all duration-500" 
                          style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
                      />
                      
                      <div className="flex justify-between relative z-10">
                          {STAGES.map((stage, idx) => {
                              const isCompleted = idx < currentStageIndex || selectedDoc.currentStage === 'completed';
                              const isCurrent = idx === currentStageIndex && selectedDoc.currentStage !== 'completed';
                              const Icon = stage.icon;

                              return (
                                  <div key={stage.id} className="flex flex-col items-center gap-2">
                                      <div className={cn(
                                          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white dark:bg-gray-800",
                                          isCompleted ? "border-green-500 text-green-500 bg-green-50 dark:bg-green-900/20" :
                                          isCurrent ? "border-blue-500 text-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30 scale-110" :
                                          "border-gray-300 text-gray-300"
                                      )}>
                                          {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                      </div>
                                      <span className={cn(
                                          "text-xs font-semibold uppercase tracking-wider",
                                          isCompleted ? "text-green-600" :
                                          isCurrent ? "text-blue-600" :
                                          "text-gray-400"
                                      )}>
                                          {stage.label}
                                      </span>
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

                {/* Actions Footer */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t flex items-center justify-between gap-4 shrink-0">
                  <Button 
                      variant="destructive" 
                      className="flex-1 h-12 text-base shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                      onClick={() => handleAction('reject')}
                      disabled={selectedDoc.currentStage === 'completed'}
                  >
                      <XCircle className="w-5 h-5 mr-2" />
                      Rejeitar Documento
                  </Button>

                  <Button 
                      variant="secondary"
                      className="flex-1 h-12 text-base border-2 bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white dark:border-gray-600 active:scale-[0.98]"
                      onClick={() => handleAction('request_action')}
                      disabled={selectedDoc.currentStage === 'initial_analysis' || selectedDoc.currentStage === 'completed'}
                  >
                      <AlertCircle className="w-5 h-5 mr-2" />
                      {selectedDoc.currentStage === 'apostille_check' ? 'Solicitar Apostilamento' :
                       selectedDoc.currentStage === 'translation_check' ? 'Solicitar Tradução' :
                       'Solicitar Ação'}
                  </Button>

                  <Button 
                      className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-green-200 dark:hover:shadow-none active:scale-[0.98]"
                      onClick={() => handleAction('next')}
                      disabled={selectedDoc.currentStage === 'completed'}
                  >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {selectedDoc.currentStage === 'completed' ? 'Finalizado' : 'Aprovar / Próxima Etapa'}
                  </Button>
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
