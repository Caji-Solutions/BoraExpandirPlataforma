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
  XOctagon
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
import { getFormulariosWithStatus, updateFormularioClienteStatus } from '../services/juridicoService';
import { ReviewActionButtons } from './ReviewActionButtons';
import { RejectModal } from './RejectModal';

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
export type TabType = 'documentos' | 'formularios' | 'pendentes' | 'aprovados' | 'analise' | 'espera';

export interface JuridicoDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'analyzing' | 'rejected' | 'waiting_apostille' | 'analyzing_apostille' | 'waiting_translation' | 'analyzing_translation' | 'approved';
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
  documents: initialDocs, 
  onBack,
  onUpdateDocument 
}: ProcessAnalysisProps) {
  // Tab state: 'documentos' | 'formularios' | 'pendentes' | 'aprovados' | 'analise' | 'espera'
  const [activeTab, setActiveTab] = useState<TabType>('documentos');
  
  // Formulários com status
  const [formularios, setFormularios] = useState<FormularioWithStatus[]>([]);
  const [formulariosLoading, setFormulariosLoading] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocs[0]?.id);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  
  // Form rejection state
  const [formRejectModalOpen, setFormRejectModalOpen] = useState(false);
  const [isUpdatingFormStatus, setIsUpdatingFormStatus] = useState(false);
  
  const selectedDoc = initialDocs.find(d => d.id === selectedDocId) || initialDocs[0];
  const selectedForm = formularios.find(f => f.id === selectedFormId);

  // Filtragem unificada
  const filteredItems = useMemo(() => {
    if (activeTab === 'formularios') return formularios;
    
    return initialDocs.filter(doc => {
      switch(activeTab) {
        case 'documentos': return true;
        case 'pendentes': return doc.status === 'rejected';
        case 'aprovados': return doc.status === 'approved';
        case 'analise': return ['analyzing', 'analyzing_apostille', 'analyzing_translation'].includes(doc.status);
        case 'espera': return ['waiting_apostille', 'waiting_translation'].includes(doc.status);
        default: return true;
      }
    });
  }, [activeTab, initialDocs, formularios]);

  // Efeito para garantir seleção ao trocar de aba
  useEffect(() => {
    if (filteredItems.length > 0) {
      if (activeTab === 'formularios') {
        if (!selectedFormId || !filteredItems.find(f => f.id === selectedFormId)) {
          setSelectedFormId(filteredItems[0].id);
        }
      } else {
        if (!selectedDocId || !filteredItems.find(d => d.id === selectedDocId)) {
          setSelectedDocId(filteredItems[0].id);
        }
      }
    }
  }, [filteredItems, activeTab]);

  // Fetch formulários when tab changes to 'forms'
  useEffect(() => {
    if (activeTab === 'formularios' && clienteId) {
      const fetchFormularios = async () => {
        setFormulariosLoading(true);
        try {
          const data = await getFormulariosWithStatus(clienteId, membroId);
          setFormularios(data);
          if (data.length > 0 && !selectedFormId) {
            setSelectedFormId(data[0].id);
          }
        } catch (error) {
          console.error('Erro ao buscar formulários:', error);
        } finally {
          setFormulariosLoading(false);
        }
      };
      fetchFormularios();
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
      {/* Header Premium com Abas */}
      <div className="bg-white dark:bg-gray-800 border-b shrink-0 shadow-sm z-20">
        <div className="h-20 flex items-center px-8 justify-between">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onBack} 
              className="h-11 w-11 rounded-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                {clientName}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-gray-500">
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] border-primary/20 bg-primary/5 text-primary py-0.5">
                  Fila de Análise Jurídica
                </Badge>
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <p className="text-xs font-bold tracking-tight">
                  {memberName}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-white font-bold px-3 py-1">
              {filteredItems.length} {activeTab === 'formularios' ? 'Formulários' : 'Documentos'}
            </Badge>
          </div>
        </div>

        {/* Barra de Abas de Filtragem */}
        <div className="px-8 flex gap-1 overflow-x-auto no-scrollbar border-t bg-gray-50/30 dark:bg-gray-900/10">
          {[
            { id: 'documentos', label: 'Documentos', icon: FileText },
            { id: 'formularios', label: 'Formulários', icon: ClipboardList },
            { id: 'pendentes', label: 'Documentos Pendentes', icon: AlertCircle },
            { id: 'aprovados', label: 'Documentos Aprovados', icon: CheckCircle2 },
            { id: 'analise', label: 'Em Análise', icon: Eye },
            { id: 'espera', label: 'Em Espera', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-4 font-black text-[10px] uppercase tracking-widest transition-all relative border-b-2",
                  isActive 
                    ? "text-primary border-primary bg-primary/5" 
                    : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-100/50"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-gray-400")} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Lista Filtrada */}
        <div className="w-85 border-r bg-white dark:bg-gray-800 flex flex-col shrink-0 shadow-lg z-10">
          <div className="p-4 border-b bg-gray-50/50 dark:bg-gray-900/20">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {activeTab === 'formularios' ? 'Formulários do Processo' : 'Documentos para Revisão'}
              </h3>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {formulariosLoading && activeTab === 'formularios' ? (
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
                  const isSelected = activeTab === 'formularios' ? selectedFormId === item.id : selectedDocId === item.id;
                  const isReceived = 'status' in item && item.status === 'received';
                  const isApproved = 'status' in item && item.status === 'approved';
                  
                  return (
                    <div 
                      key={item.id}
                      onClick={() => activeTab === 'formularios' ? setSelectedFormId(item.id) : setSelectedDocId(item.id)}
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
                          {activeTab === 'formularios' ? <ClipboardList className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
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
                            {item.name}
                          </p>
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {activeTab === 'formularios' ? (
                              <Badge variant={isReceived ? "success" : "warning"} className="text-[10px] font-black uppercase tracking-wider py-0 px-2 flex items-center gap-1">
                                {isReceived ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                {isReceived ? 'Recebido' : 'Aguardando'}
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
          {activeTab !== 'formularios' ? (
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

                {/* Document Preview (Mock) */}
                <div className="flex-1 p-6 overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-xl border flex flex-col items-center justify-center text-gray-400">
                      <FileText className="h-24 w-24 mb-4 opacity-20" />
                      <p>Visualização do Documento</p>
                      <p className="text-sm opacity-60">(Integração com visualizador de PDF aqui)</p>
                  </div>
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
                <div className="flex-1 p-6 overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-xl border flex flex-col items-center justify-center text-gray-400">
                    {selectedForm.status === 'waiting' ? (
                      <>
                        <Clock className="h-24 w-24 mb-4 opacity-20" />
                        <p className="text-lg font-medium">Aguardando Resposta do Cliente</p>
                        <p className="text-sm opacity-60 mt-2">O cliente ainda não enviou o formulário preenchido</p>
                      </>
                    ) : selectedForm.responseStatus === 'aprovado' ? (
                      <>
                        <CheckCircle className="h-24 w-24 mb-4 opacity-20 text-green-400" />
                        <p className="text-lg font-medium text-green-600">Formulário Aprovado</p>
                        <p className="text-sm opacity-60 mt-2">
                          Recebido em {new Date(selectedForm.response!.uploadDate).toLocaleDateString()}
                        </p>
                        <Button className="mt-4 bg-green-600 hover:bg-green-700" asChild>
                          <a href={selectedForm.response!.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Visualizar Resposta
                          </a>
                        </Button>
                      </>
                    ) : selectedForm.responseStatus === 'rejeitado' ? (
                      <>
                        <XOctagon className="h-24 w-24 mb-4 opacity-20 text-red-400" />
                        <p className="text-lg font-medium text-red-600">Formulário Rejeitado</p>
                        {selectedForm.motivoRejeicao && (
                          <p className="text-sm text-red-500 mt-2">
                            Motivo: {selectedForm.motivoRejeicao}
                          </p>
                        )}
                        <Button className="mt-4 bg-red-600 hover:bg-red-700" asChild>
                          <a href={selectedForm.response!.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Visualizar Resposta
                          </a>
                        </Button>
                      </>
                    ) : (
                      <>
                        <ClipboardList className="h-24 w-24 mb-4 opacity-20 text-purple-400" />
                        <p className="text-lg font-medium text-purple-600">Resposta Recebida</p>
                        <p className="text-sm opacity-60 mt-2">
                          Recebido em {new Date(selectedForm.response!.uploadDate).toLocaleDateString()}
                        </p>
                        <Button className="mt-4 bg-purple-600 hover:bg-purple-700" asChild>
                          <a href={selectedForm.response!.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Visualizar Resposta
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
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
    </>
  );
}
