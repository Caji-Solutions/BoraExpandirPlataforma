import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    ChevronLeft, 
    ChevronRight, 
    ChevronDown,
    ChevronUp,
    CheckCircle2, 
    Circle,
    Info
} from "lucide-react";
import { Badge } from '../../../components/ui/Badge';
import { Button } from "./ui/button";
import juridicoService from "../services/juridicoService";
import { toast } from "./ui/sonner";

export interface ProcessData {
    id: string;
    clienteId: string;
    status: string;
    fase: number;
    processo: number;
    cliente: {
        nome: string;
        avatar?: string;
    };
    servico: string;
    tipo: string;
    dataProtocolo?: string | number;
    prazoResposta?: number;
    observacao?: string;
    valorAcao: string;
}

interface ProcessTableProps {
    data: ProcessData[];
    onRowClick?: (process: ProcessData) => void;
}

export function ProcessTable({ data }: ProcessTableProps) {
    const [expandedId, setExpandedId] = React.useState<string | null>(null);
    const [localData, setLocalData] = React.useState<ProcessData[]>(data);
    const [searchParams] = useSearchParams();

    React.useEffect(() => {
        setLocalData(data);
        
        // Auto-expand card if ID is in URL
        const expandId = searchParams.get('expand');
        if (expandId) {
            setExpandedId(expandId);
        }
    }, [data, searchParams]);

    const handleUpdateEtapa = async (processId: string, currentFase: number, delta: number) => {
        const novaEtapa = currentFase + delta;
        if (novaEtapa < 1 || novaEtapa > 4) return;

        try {
            await juridicoService.updateProcessEtapa(processId, novaEtapa);
            setLocalData(prev => prev.map(p => 
                p.id === processId ? { ...p, fase: novaEtapa } : p
            ));
            toast.success("Etapa atualizada com sucesso");
        } catch (error) {
            toast.error("Erro ao atualizar etapa");
        }
    }

    const phases = [
        { id: 1, label: "Iniciado" },
        { id: 2, label: "Documentação" },
        { id: 3, label: "Consultoria" },
        { id: 4, label: "Imigração" }
    ];

    return (
        <div className="space-y-4">
            {localData.map((row) => {
                const isExpanded = expandedId === row.id;
                
                return (
                    <div 
                        key={row.id}
                        className={`bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary/20 shadow-md' : 'hover:shadow-md'}`}
                    >
                        {/* Card Header (Visible initially) */}
                        <div 
                            className="grid grid-cols-12 gap-4 px-6 py-5 items-center cursor-pointer group"
                            onClick={() => setExpandedId(isExpanded ? null : row.id)}
                        >
                            <div className="col-span-1 text-center font-mono text-xs text-muted-foreground bg-muted/30 py-1 rounded-md">
                                #{row.id.substring(0, 4)}
                            </div>
                            
                            <div className="col-span-4 flex items-center gap-3 text-left">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <span className="text-primary text-xs font-bold">
                                        {row.cliente.nome.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-all">
                                        {row.cliente.nome}
                                    </div>
                                    <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{row.servico}</div>
                                </div>
                            </div>

                            <div className="col-span-3 text-center">
                                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                                    row.status.toLowerCase().includes('conclu') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    row.status.toLowerCase().includes('pendente') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                    {row.status}
                                </span>
                            </div>

                            <div className="col-span-3 flex flex-col items-center justify-center gap-1">
                                <div className="flex gap-1">
                                    {phases.map((p) => (
                                        <div 
                                            key={p.id} 
                                            className={`w-4 h-1 rounded-full ${row.fase >= p.id ? 'bg-primary' : 'bg-muted'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                                    Fase {row.fase}: {phases.find(p => p.id === row.fase)?.label}
                                </span>
                            </div>

                            <div className="col-span-1 flex justify-end">
                                <div className="p-1 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors">
                                    {isExpanded ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                </div>
                            </div>
                        </div>

                        {/* Expanded Content (Status & Navigation) */}
                        {isExpanded && (
                            <div className="px-6 pb-6 pt-2 bg-muted/10 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="max-w-3xl mx-auto py-4 space-y-8">
                                    <div className="flex justify-between items-center bg-background p-4 rounded-xl border border-border shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Info className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Controle de Etapas</h3>
                                                <p className="text-[10px] text-muted-foreground/70 font-medium">Gerencie o progresso do processo jurídico</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-9 rounded-xl text-[10px] font-bold bg-background hover:bg-muted"
                                                disabled={row.fase <= 1}
                                                onClick={() => handleUpdateEtapa(row.id, row.fase, -1)}
                                            >
                                                <ChevronLeft className="h-3 w-3 mr-1" /> Retroceder
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="h-9 rounded-xl text-[10px] font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95"
                                                disabled={row.fase >= 4}
                                                onClick={() => handleUpdateEtapa(row.id, row.fase, 1)}
                                            >
                                                Avançar <ChevronRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <div className="relative flex justify-between px-6 pt-2">
                                        <div className="absolute top-[21px] left-10 right-10 h-0.5 bg-muted -z-0" />
                                        
                                        {phases.map((phase) => {
                                            const isActive = row.fase === phase.id;
                                            const isCompleted = row.fase > phase.id;
                                            
                                            return (
                                                <div key={phase.id} className="flex flex-col items-center gap-3 group relative z-10">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                                                        isActive ? 'border-primary bg-background ring-8 ring-primary/5 shadow-xl scale-110' : 
                                                        isCompleted ? 'border-primary bg-primary text-white' : 
                                                        'border-border bg-background text-muted-foreground'
                                                    }`}>
                                                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : 
                                                         isActive ? <Circle className="h-5 w-5 fill-primary text-primary animate-pulse" /> :
                                                         <span className="text-xs font-bold">{phase.id}</span>}
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${
                                                        isActive ? 'text-primary' : 'text-muted-foreground'
                                                    }`}>
                                                        {phase.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            
            {localData.length === 0 && (
                <div className="bg-muted/30 border-2 border-dashed border-border rounded-2xl py-20 text-center">
                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="h-6 w-6 text-muted-foreground opacity-50" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground tracking-tight">Capa de processo vazia</p>
                    <p className="text-[10px] text-muted-foreground/60 uppercase font-black mt-1">Nenhum processo jurídico atribuído</p>
                </div>
            )}
        </div>
    );
}
