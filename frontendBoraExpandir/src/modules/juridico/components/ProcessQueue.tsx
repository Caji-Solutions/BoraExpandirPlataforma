import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom';
import { FileText, User, ChevronRight, Folder, ChevronLeft, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from '../../../components/ui/Badge';
import { Card } from "../../cliente/components/ui/card";
import { ProcessAnalysis, JuridicoDocument, AnalysisStage } from './ProcessAnalysis';
import juridicoService, { Processo } from '../services/juridicoService';
import { FormsDeclarationsSection } from './FormsDeclarationsSection';
import { ProcessMemberCard } from './ProcessMemberCard';


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
    hasRequirement: boolean;
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
    const [searchParams] = useSearchParams();
    const [processes, setProcesses] = useState<Process[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<Process | null>(null);
    const [selectedFolderDocs, setSelectedFolderDocs] = useState<any[]>([]); // Raw backend documents
    const [dependents, setDependents] = useState<any[]>([]); // To resolve names
    const [selectedMember, setSelectedMember] = useState<{ name: string, id?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'todos',
        serviceType: 'todos'
    });

    // Helper function to map Backend Process to Frontend Process View
    const mapProcessoToView = (p: Processo): Process => {
        const docs = p.documentos || [];
        const total = docs.length;

        // Concluídos: Status APPROVED e flags de apostilamento/tradução (se aplicável ao fluxo, mas assumindo fluxo completo aqui)
        // Ou simplificando: Status APPROVED e (apostilado=true e traduzido=true)
        const completed = docs.filter(d =>
            d.status === 'APPROVED' && d.apostilado && d.traduzido
        ).length;

        // Em análise: Status iniciados com ANALYZING
        const analyzing = docs.filter(d =>
            d.status && (
                d.status === 'ANALYZING' ||
                d.status === 'ANALYZING_APOSTILLE' ||
                d.status === 'ANALYZING_TRANSLATION'
            )
        ).length;

        // Aguardando Ação (Pendentes): PENDING, REJECTED, ou WAITING_*
        const waitingAction = docs.filter(d =>
            !d.status ||
            d.status === 'PENDING' ||
            d.status === 'REJECTED' ||
            d.status.startsWith('WAITING')
        ).length;

        // Manter contagens específicas para visualização detalhada se necessário
        const apostilled = docs.filter(d => d.apostilado).length;
        const translated = docs.filter(d => d.traduzido).length;

        // Determine status based on some logic, or use backend status if it matches
        let status: Process['status'] = 'pending_client';
        if (p.status === 'NOVO') status = 'new';
        if (p.status === 'PRONTO') status = 'ready';
        // Se todos concluídos e total > 0 -> Ready? (Can refine this later)

        return {
            id: p.id,
            clientName: p.clientes?.nome || 'Cliente Desconhecido',
            clientId: p.cliente_id,
            serviceType: p.tipo_servico || 'Serviço',
            currentStage: p.etapa_atual?.toString() || '1',
            totalStages: 4,
            status: status,
            waitingTime: 0,
            documentsTotal: total,
            documentsApproved: completed, // Mapping "Approved" visual to "Completed"
            documentsPending: waitingAction, // Mapping "Pending" visual to "Waiting Action"
            documentsAnalyzing: analyzing,
            documentsApostilled: apostilled,
            documentsTranslated: translated,
            hasRequirement: p.requerimentos ? p.requerimentos.length > 0 : false
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

                // Auto-select process from URL
                const processId = searchParams.get('processoId');
                if (processId) {
                    const process = mapped.find(p => p.id === processId);
                    if (process) {
                        setSelectedFolder(process);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch processes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProcesses();
    }, [searchParams]);

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

    const serviceTypes = useMemo(() => {
        return Array.from(new Set(processes.map(p => p.serviceType)));
    }, [processes]);

    const filteredProcesses = useMemo(() => {
        return processes.filter(p => {
            const matchesSearch = 
                p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = filters.status === 'todos' || p.status === filters.status;
            const matchesService = filters.serviceType === 'todos' || p.serviceType === filters.serviceType;
            
            return matchesSearch && matchesStatus && matchesService;
        });
    }, [processes, searchTerm, filters]);



    // Derived Members
    const members = useMemo(() => {
        // 1. Initialize with Titular and Dependents
        const initialMembers: any[] = [];

        const createMemberObj = (id: string, name: string, type: string, isTitular: boolean) => ({
            id, name, type, isTitular,
            docs: 0,
            waitingAction: 0, // Aguardam Ação
            analyzing: 0,     // Em Análise
            completed: 0,     // Concluídos
            status: []
        });

        if (selectedFolder) {
            // Add Titular
            initialMembers.push(createMemberObj(
                selectedFolder.clientId,
                selectedFolder.clientName || 'Titular',
                'Titular',
                true
            ));

            // Add fetched dependents
            dependents.forEach(dep => {
                initialMembers.push(createMemberObj(
                    dep.id,
                    dep.nome_completo || dep.name,
                    dep.parentesco ? (dep.parentesco.charAt(0).toUpperCase() + dep.parentesco.slice(1)) : 'Dependente',
                    false
                ));
            });
        }

        // 2. Map Documents to Members
        return selectedFolderDocs.reduce((acc: any[], doc: any) => {
            // Use dependente_id if present, otherwise it's the titular (cliente_id)
            let memberId = doc.dependente_id || selectedFolder?.clientId;

            let member = acc.find((m: any) => m.id === memberId);

            if (!member) {
                // Fallback for members not in dependents list
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
                member = createMemberObj(memberId, memberName, memberType, isTitular);
                acc.push(member);
            }

            // Count stats
            member.docs++;

            const status = doc.status || 'PENDING';
            const statusLower = status.toLowerCase();

            if (statusLower === 'analyzing' || statusLower === 'analyzing_apostille' || statusLower === 'analyzing_translation') {
                member.analyzing++;
            }
            else if (statusLower === 'approved' && doc.apostilado && doc.traduzido) {
                member.completed++;
            }
            else if (statusLower === 'rejected' || statusLower.startsWith('waiting') || statusLower === 'pending') {
                member.waitingAction++;
            }

            member.status.push(doc.status);

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

                // Map status to visual stage flow
                if (status.includes('apostille')) {
                    stage = 'apostille_check';
                } else if (status.includes('translation')) {
                    stage = 'translation_check';
                } else if (status === 'approved') {
                    // Only fully completed if flags are set, but strictly 'approved' status usually comes last
                    if (doc.apostilado && doc.traduzido) {
                        stage = 'completed';
                    } else {
                        // Intermediate approved states? 
                        // If approved but not apostilled -> waiting apostille (should be status waiting_apostille)
                        // If approved logic is handled by status string, we trust status.
                        // Fallback: if 'approved' generic, treat as completed for stage visualization?
                        stage = 'completed';
                    }
                }

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
                clienteId={selectedFolder.clientId}
                membroId={selectedMember.id !== selectedFolder.clientId ? selectedMember.id : undefined}
                processoId={selectedFolder.id}
                documents={memberDocs}
                onBack={() => setSelectedMember(null)}
                onUpdateDocument={async (id, updates) => {
                    // Optimistic update
                    const newStatus = updates.status?.toUpperCase();
                    try {
                        await juridicoService.updateDocumentStatus(
                            id,
                            newStatus || '',
                            updates.rejectionReason
                        );

                        // Update local list
                        const updatedRaw = selectedFolderDocs.map(d => d.id === id ? { ...d, status: newStatus } : d);
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

                <div className="absolute top-8 right-8">
                     <Button 
                        onClick={() => setIsFormModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Enviar Documentos
                    </Button>
                </div>

                {/* Header for Member List */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">
                        <div className="col-span-4 text-left px-12">Membro do Processo</div>
                        <div className="col-span-2">Parentesco</div>
                        <div className="col-span-4">Status dos Documentos</div>
                        <div className="col-span-2">Ações</div>
                    </div>

                    <div className="divide-y divide-border">
                        {members.length > 0 ? members.map((member: any, idx: number) => (
                            <ProcessMemberCard 
                                key={idx}
                                member={member}
                                onClick={() => setSelectedMember(member)}
                            />
                        )) : (
                            <div className="py-12 text-center text-muted-foreground">
                                <User className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                <p>Nenhum documento encontrado para este processo.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Formulários e Declarações - Fixed Bottom Section */}
                <div className="mt-8">
                    <FormsDeclarationsSection
                        processoId={selectedFolder.id}
                        clienteId={selectedFolder.clientId}
                        clientName={selectedFolder.clientName}
                        members={members.map((m: any) => ({
                            id: m.id,
                            name: m.name,
                            type: m.type
                        }))}
                        isOpen={isFormModalOpen}
                        onOpenChange={setIsFormModalOpen}
                        hideTrigger={true}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Fila de Trabalho</h1>
                        <p className="text-muted-foreground mt-1">Gestão de processos e acompanhamento jurídico</p>
                    </div>
                    <div className="flex gap-3">
                        {loading && <span className="text-sm text-muted-foreground animate-pulse self-center">Carregando...</span>}
                        <Badge variant="outline" className="text-sm px-4 py-2 bg-background shadow-sm border-gray-200">
                            {filteredProcesses.length} processos
                        </Badge>
                    </div>
                </div>

                {/* Filters and Search - Matching Client Aesthetic */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Status do Processo</label>
                            <select
                                value={filters.status}
                                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                                className="w-full bg-muted/30 border border-border px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer appearance-none"
                            >
                                <option value="todos">Todos os Status</option>
                                <option value="new">Novo</option>
                                <option value="pending_client">Pendente</option>
                                <option value="ready">Pronto</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tipo de Serviço</label>
                            <select
                                value={filters.serviceType}
                                onChange={e => setFilters(f => ({ ...f, serviceType: e.target.value }))}
                                className="w-full bg-muted/30 border border-border px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer appearance-none"
                            >
                                <option value="todos">Todos os Serviços</option>
                                {serviceTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
                        <input
                            type="text"
                            placeholder="Buscar por nome do cliente ou ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-muted/50 border-2 border-transparent focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 shadow-inner text-base"
                        />
                        {(searchTerm || filters.status !== 'todos' || filters.serviceType !== 'todos') && (
                            <button 
                                onClick={() => {
                                    setSearchTerm('')
                                    setFilters({ status: 'todos', serviceType: 'todos' })
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-primary hover:underline"
                            >
                                Limpar Busca
                            </button>
                        )}
                    </div>
                </div>

                {/* Process List - Table Header */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">
                        <div className="col-span-1">ID</div>
                        <div className="col-span-3 text-left">Cliente</div>
                        <div className="col-span-2">Serviço</div>
                        <div className="col-span-3">Documentos</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-2">Ações</div>
                    </div>

                    <div className="divide-y divide-border">
                        {filteredProcesses.map((process) => (
                            <div
                                key={process.id}
                                className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-muted/30 cursor-pointer group"
                                onClick={() => setSelectedFolder(process)}
                            >
                                <div className="col-span-1 text-center">
                                    <span className="text-xs font-mono text-muted-foreground">{process.clientId.substring(0, 4)}...</span>
                                </div>
                                <div className="col-span-3 flex items-center gap-3 text-left">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <Folder className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-foreground">{process.clientName}</div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-[10px] text-muted-foreground font-mono">ID: {process.clientId}</div>
                                            {process.hasRequirement && (
                                                <Badge variant="destructive" className="animate-pulse text-[7px] px-1 py-0 h-3 leading-none min-w-[50px] flex items-center justify-center">
                                                    REQUERIMENTO
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2 text-center text-xs font-medium">
                                    {process.serviceType}
                                </div>
                                <div className="col-span-3">
                                    <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
                                        <div className="bg-amber-50/50 dark:bg-amber-900/10 p-1 rounded border border-amber-100/50">
                                            <span className="block font-bold text-amber-600 text-sm">{process.documentsPending}</span>
                                            <span className="text-muted-foreground uppercase opacity-70">Aguardam</span>
                                        </div>
                                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-1 rounded border border-blue-100/50">
                                            <span className="block font-bold text-blue-600 text-sm">{process.documentsAnalyzing}</span>
                                            <span className="text-muted-foreground uppercase opacity-70">Análise</span>
                                        </div>
                                        <div className="bg-green-50/50 dark:bg-green-900/10 p-1 rounded border border-green-100/50">
                                            <span className="block font-bold text-green-600 text-sm">{process.documentsApproved}</span>
                                            <span className="text-muted-foreground uppercase opacity-70">Feito</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-1 text-center">
                                    {/* Minimalist Status Indicator */}
                                    <div className={`w-3 h-3 rounded-full mx-auto ${
                                        process.status === 'ready' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 
                                        process.status === 'new' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 
                                        'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                    }`} />
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    <Button 
                                        size="sm"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-bold h-8 px-4 rounded-xl shadow-sm group-hover:scale-105 transition-all"
                                    >
                                        Acessar Processo
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {filteredProcesses.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-4 opacity-10" />
                                <p>Nenhum processo encontrado na fila.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
