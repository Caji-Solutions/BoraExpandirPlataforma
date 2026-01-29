import { useState, useEffect, useMemo } from 'react'
import { FileText, User, ChevronRight, Folder, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from '../../../components/ui/Badge';
import { Card } from "../../cliente/components/ui/card";
import { ProcessAnalysis, JuridicoDocument, AnalysisStage } from './ProcessAnalysis';
import juridicoService, { Processo } from '../services/juridicoService';

export interface Process {
  id: string;
  clientName: string;
  clientId: string;
  serviceType: string;
  currentStage: string;
  totalStages: number;
  status: "new" | "pending_client" | "ready";
  waitingTime: number;
  documentsTotal: number;
  documentsApproved: number;
  documentsPending: number;
  documentsAnalyzing: number;
  documentsApostilled: number;
  documentsTranslated: number;
}

const StatusBadge = ({ status }: { status: Process["status"] }) => {
  const variants = {
    new: { label: "Novo", variant: "destructive" as const },
    pending_client: { label: "Pendente", variant: "warning" as const },
    ready: { label: "Pronto", variant: "success" as const },
  };

  const { label, variant } = variants[status] || { label: status, variant: "secondary" };
  return <Badge variant={variant} className="absolute top-3 right-3">{label}</Badge>;
};

interface ProcessQueueProps {
  onSelectProcess?: (process: Process) => void;
}

export function ProcessQueue({ onSelectProcess }: ProcessQueueProps) {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Process | null>(null);
  const [selectedFolderDocs, setSelectedFolderDocs] = useState<any[]>([]); // Raw backend documents
  const [dependents, setDependents] = useState<any[]>([]); // To resolve names
  const [selectedMember, setSelectedMember] = useState<{name: string, id?: string} | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper function to map Backend Process to Frontend Process View
  const mapProcessoToView = (p: Processo): Process => {
      const docs = p.documentos || [];
      const total = docs.length;
      
      const approved = docs.filter(d => d.status === 'APPROVED').length;
      const analyzing = docs.filter(d => d.status?.startsWith('ANALYZING') || d.status === 'PENDING_REVIEW').length; 
      const pending = docs.filter(d => !d.status || d.status === 'PENDING').length;
      const apostilled = docs.filter(d => d.status?.includes('APOSTILLE')).length; // Loose check based on behavior
      const translated = docs.filter(d => d.status?.includes('TRANSLATION')).length;

      // Determine status based on some logic, or use backend status if it matches
      let status: Process['status'] = 'pending_client';
      if (p.status === 'NOVO') status = 'new';
      if (p.status === 'PRONTO') status = 'ready';
      
      return {
          id: p.id,
          clientName: p.clientes?.nome || 'Cliente Desconhecido',
          clientId: p.cliente_id,
          serviceType: p.tipo_servico || 'Serviço',
          currentStage: p.etapa_atual?.toString() || '1',
          totalStages: 4, // Fixed for now or from backend
          status: status, 
          waitingTime: 0, // Calculate from created_at
          documentsTotal: total,
          documentsApproved: approved,
          documentsPending: pending,
          documentsAnalyzing: analyzing,
          documentsApostilled: apostilled,
          documentsTranslated: translated
      };
  };

  useEffect(() => {
    const fetchProcesses = async () => {
        setLoading(true);
        try {
            // Simulated Lawyer ID from user request
            const LAWYER_ID = '41f21e5c-dd93-4592-9470-e043badc3a18';
            const data = await juridicoService.getProcessosByResponsavel(LAWYER_ID);
            const mapped = data.map(mapProcessoToView);
            setProcesses(mapped);
        } catch (error) {
            console.error("Failed to fetch processes", error);
        } finally {
            setLoading(false);
        }
    };
    fetchProcesses();
  }, []);

  // Fetch Documents and Dependents when Folder Selected
  useEffect(() => {
    if (!selectedFolder) return;

    const fetchData = async () => {
        try {
            const [docs, deps] = await Promise.all([
                juridicoService.getDocumentosByProcesso(selectedFolder.id),
                juridicoService.getDependentes(selectedFolder.clientId)
            ]);
            setSelectedFolderDocs(docs);
            setDependents(deps);
        } catch (error) {
            console.error(error);
        }
    }
    fetchData();
  }, [selectedFolder]);



  // Derived Members
  const members = useMemo(() => {
      // 1. Initialize with Titular and Dependents
      const initialMembers: any[] = [];
      
      if (selectedFolder) {
          // Add Titular
          initialMembers.push({
              id: selectedFolder.clientId,
              name: selectedFolder.clientName || 'Titular',
              type: 'Titular',
              isTitular: true,
              docs: 0,
              pending: 0,
              status: []
          });

          // Add fetched dependents
          dependents.forEach(dep => {
              initialMembers.push({
                  id: dep.id,
                  name: dep.nome_completo || dep.name,
                  type: dep.parentesco ? (dep.parentesco.charAt(0).toUpperCase() + dep.parentesco.slice(1)) : 'Dependente',
                  isTitular: false,
                  docs: 0,
                  pending: 0,
                  status: []
              });
          });
      }

      // 2. Map Documents to Members
      return selectedFolderDocs.reduce((acc: any[], doc: any) => {
          // Use dependente_id if present, otherwise it's the titular (cliente_id)
          let memberId = doc.dependente_id || selectedFolder?.clientId;
          
          let existing = acc.find((m: any) => m.id === memberId);
          const isPending = doc.status === 'PENDING' || !doc.status;

          if (existing) {
              existing.docs++;
              if (isPending) existing.pending++;
              existing.status.push(doc.status);
          } else {
               // Fallback for members not in dependents list (legacy documents?)
               let memberName = '...';
               let memberType = 'Dependente';
               let isTitular = false;

               if (!doc.dependente_id) {
                    memberName = selectedFolder?.clientName || 'Titular';
                    memberType = 'Titular';
                    isTitular = true;
               } else {
                    if (doc.storage_path) {
                        const parts = doc.storage_path.split('/');
                        if (parts.length > 2) {
                            memberName = parts[1].replace(/_/g, ' ');
                        }
                    }
               }

               acc.push({
                   id: memberId,
                   name: memberName,
                   type: memberType,
                   isTitular: isTitular,
                   docs: 1,
                   pending: isPending ? 1 : 0,
                   status: [doc.status]
               });
          }
          return acc;
      }, initialMembers);
  }, [selectedFolder, selectedFolderDocs, dependents]);


  // Sort members: titular first, then alphabetically
  members.sort((a, b) => {
      if (a.isTitular) return -1;
      if (b.isTitular) return 1;
      return a.name.localeCompare(b.name);
  });

  const getFilteredDocsForMember = (memberId: string): JuridicoDocument[] => {
      // Filter raw docs and map to JuridicoDocument
       return selectedFolderDocs
        .filter(doc => {
            // Match by dependente_id (if null, it belongs to titular which is clientId)
            const docMemberId = doc.dependente_id || selectedFolder?.clientId;
            return docMemberId === memberId;
        })
        .map(doc => {
            // Map Backend Status directly to lower case or specific logic
            const status = doc.status ? doc.status.toLowerCase() : 'pending';
            
            let stage: AnalysisStage = 'initial_analysis';
            if (status.includes('apostille')) stage = 'apostille_check';
            if (status.includes('translation')) stage = 'translation_check';
            if (status === 'approved') stage = 'completed';

            return {
                id: doc.id,
                name: doc.nome_original || doc.tipo,
                type: doc.tipo,
                url: doc.public_url || '',
                status: status as any,
                currentStage: stage,
                uploadDate: new Date(doc.criado_em).toLocaleDateString(),
                history: []
            }
        });
  };

  if (selectedMember && selectedFolder) {
    const memberDocs = getFilteredDocsForMember(selectedMember.id || selectedFolder.clientId);
    
    return (
      <ProcessAnalysis 
        clientName={selectedFolder.clientName}
        memberName={selectedMember.name}
        documents={memberDocs} 
        onBack={() => setSelectedMember(null)}
        onUpdateDocument={async (id, updates) => {
             // Optimistic update
             const newStatus = updates.status?.toUpperCase();
             try {
                await juridicoService.updateDocumentStatus(
                    id, 
                    newStatus || '', 
                    updates.status === 'rejected' ? 'Rejeitado pelo jurídico' : undefined
                );

                // Update local list
                 const updatedRaw = selectedFolderDocs.map(d => d.id === id ? {...d, status: newStatus} : d);
                 setSelectedFolderDocs(updatedRaw);

             } catch (e) {
                 console.error("Failed to update status", e);
             }
        }}
      />
    )
  }

  if (selectedFolder) {
    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center gap-4 mb-6">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    className="-ml-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedFolder(null)}
                >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Voltar para Fila
                </Button>
                <div>
                     <h1 className="text-2xl font-bold tracking-tight">{selectedFolder.clientName}</h1>
                     <p className="text-muted-foreground text-sm flex items-center gap-2">
                        {selectedFolder.serviceType}
                        <span className="w-1 h-1 rounded-full bg-gray-400" />
                        ID: {selectedFolder.clientId}
                     </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.length > 0 ? members.map((member: any, idx: number) => (
                     <Card 
                        key={idx}
                        className="p-6 cursor-pointer hover:shadow-md transition-all border-l-4 border-l-blue-500 group relative overflow-hidden"
                        onClick={() => setSelectedMember(member)}
                     >

                        
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <Badge variant="outline">{member.type}</Badge>
                        </div>

                        <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{member.docs} Documentos no total</p>

                        <div className="space-y-2">
                             <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Pendentes de Upload</span>
                                <span className="font-medium text-orange-600">{member.pending}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Para Análise</span>
                                <span className="font-medium text-blue-600">
                                    {member.docs - member.pending}
                                </span>
                            </div>
                        </div>

                        <Button className="w-full mt-4 bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-none justify-between group-hover:translate-x-1 transition-all">
                             Ver Documentos
                             <ChevronRight className="h-4 w-4" />
                        </Button>
                     </Card>
                )) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        Nenhum documento encontrado para este processo.
                    </div>
                )}
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fila de Trabalho</h1>
          <p className="text-muted-foreground mt-1">
            Processos aguardando revisão jurídica
          </p>
        </div>
        <div className="flex gap-3">
             {loading && <span className="text-sm text-muted-foreground animate-pulse">Carregando...</span>}
            <Badge variant="outline" className="text-base px-4 py-2">
            {processes.length} processos
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {processes.map((process) => (
          <Card
            key={process.id}
            className="group relative cursor-pointer hover:shadow-lg transition-all duration-300 border-t-4 border-t-primary overflow-visible"
            onClick={() => setSelectedFolder(process)}
          >
            <div className="p-6">
                <StatusBadge status={process.status} />
                
                <div className="mb-6 mt-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                         <Folder className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-1">{process.clientName}</h3>
                     <p className="text-sm text-muted-foreground">{process.serviceType}</p>
                     <p className="text-xs text-muted-foreground mt-1 font-mono">ID: {process.clientId.substring(0,8)}...</p>
                </div>

                <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Total
                        </span>
                        <span className="font-medium">{process.documentsTotal} docs</span>
                    </div>
                    
                    <div className="h-px bg-gray-200 dark:bg-gray-700" />
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                             <span className="block text-blue-600 font-bold text-lg">{process.documentsAnalyzing}</span>
                             <span className="text-muted-foreground">Em Análise</span>
                        </div>
                         <div>
                             <span className="block text-green-600 font-bold text-lg">{process.documentsApproved}</span>
                             <span className="text-muted-foreground">Aprovados</span>
                        </div>
                        <div>
                             <span className="block text-amber-600 font-bold text-lg">{process.documentsApostilled}</span>
                             <span className="text-muted-foreground">Apostilados</span>
                        </div>
                         <div>
                             <span className="block text-purple-600 font-bold text-lg">{process.documentsTranslated}</span>
                             <span className="text-muted-foreground">Traduzidos</span>
                        </div>
                    </div>
                </div>

            </div>
            
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </Card>
        ))}
        {!loading && processes.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
                Nenhum processo encontrado na fila.
            </div>
        )}
      </div>
    </div>
  );
}
