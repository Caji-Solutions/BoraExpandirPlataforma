import React from 'react';
import { Eye, Settings2 } from "lucide-react";
import { Badge } from '../../../components/ui/Badge';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

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

function getStatusBadge(status: string) {
    const statusLower = status.toLowerCase();
    
    // Mapeamento de status comuns
    if (statusLower.includes('concluído') || statusLower.includes('aprovado') || statusLower.includes('finalizado')) {
        return <Badge variant="success">{status}</Badge>;
    }
    if (statusLower.includes('pendente') || statusLower.includes('aguardando') || statusLower.includes('em andamento')) {
        return <Badge variant="warning">{status}</Badge>;
    }
    if (statusLower.includes('cancelado') || statusLower.includes('rejeitado') || statusLower.includes('atrasado')) {
        return <Badge variant="destructive">{status}</Badge>;
    }
    
    // Status padrão - azul da marca
    return <Badge variant="default">{status}</Badge>;
}

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { ProcessAction } from "./ProcessAction";
import { DocumentRequestModal } from "./DocumentRequestModal";

export function ProcessTable({ data, onRowClick }: ProcessTableProps) {
    const [actionProcess, setActionProcess] = React.useState<ProcessData | null>(null);
    const [docRequestProcess, setDocRequestProcess] = React.useState<ProcessData | null>(null);

    return (
        <>
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                {/* Header row matching list style */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-center">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-3 text-left">Cliente</div>
                    <div className="col-span-3">Serviço</div>
                    <div className="col-span-2">Data Protocolo</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2 text-right px-4">Ações</div>
                </div>

                <div className="divide-y divide-border">
                    {data.map((row) => (
                        <div
                            key={row.id}
                            className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-muted/30 cursor-pointer group"
                            onClick={() => onRowClick?.(row)}
                        >
                            <div className="col-span-1 text-center">
                                <span className="text-xs font-mono text-muted-foreground">{row.id.substring(0, 4)}</span>
                            </div>
                            
                            <div className="col-span-3 flex items-center gap-3 text-left">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="text-primary text-[10px] font-bold">
                                        {row.cliente.nome.charAt(0)}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-foreground truncate">{row.cliente.nome}</div>
                                    <div className="text-[10px] text-muted-foreground">{row.tipo}</div>
                                </div>
                            </div>

                            <div className="col-span-3 text-center text-xs font-medium text-foreground truncate">
                                {row.servico}
                            </div>

                            <div className="col-span-2 text-center text-xs text-muted-foreground">
                                {row.dataProtocolo || '---'}
                            </div>

                            <div className="col-span-1 flex justify-center">
                                {/* Minimalist dot indicator or simplified badge */}
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                        row.status.toLowerCase().includes('conclu') ? 'bg-green-500' :
                                        row.status.toLowerCase().includes('pendente') ? 'bg-amber-500' :
                                        'bg-blue-500'
                                    }`} />
                                    <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[60px] uppercase">
                                        {row.status}
                                    </span>
                                </div>
                            </div>

                            <div className="col-span-2 flex justify-end">
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-8 px-4 text-[10px] font-bold rounded-xl bg-background border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        setActionProcess(row);
                                    }}
                                >
                                    <Settings2 className="h-3 w-3" />
                                    Ações
                                </Button>
                            </div>
                        </div>
                    ))}
                    {data.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            <p className="text-sm">Nenhum processo encontrado na fila.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Ações Preparado */}
            <Dialog open={!!actionProcess} onOpenChange={(open) => !open && setActionProcess(null)}>
                <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent shadow-none">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Ações do Processo</DialogTitle>
                    </DialogHeader>
                    {actionProcess && (
                        <div className="bg-background rounded-3xl overflow-hidden shadow-2xl border border-border">
                            <div className="p-6 bg-muted/30 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Settings2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-foreground">Ações: {actionProcess.cliente.nome}</h2>
                                        <p className="text-xs text-muted-foreground">Gerencie o processo ID: {actionProcess.id.substring(0, 8)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Informações do Serviço restauradas aqui, já que saíram do componente genérico */}
                                <div className="bg-muted/50 rounded-2xl p-4 border border-border space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium uppercase tracking-wider">Serviço</span>
                                        <span className="font-bold text-primary">{actionProcess.servico}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium uppercase tracking-wider">Protocolo</span>
                                        <span className="font-bold">{actionProcess.dataProtocolo || '---'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground font-medium uppercase tracking-wider">Status Atual</span>
                                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 border-blue-200">
                                            {actionProcess.status}
                                        </Badge>
                                    </div>
                                </div>

                                <ProcessAction 
                                    clienteId={actionProcess.clienteId} 
                                    processoId={actionProcess.id}
                                    onActionClick={(action) => {
                                        if (action === 'solicitar_documentos') {
                                            setDocRequestProcess(actionProcess);
                                            setActionProcess(null);
                                        } else {
                                            console.log(`Executing ${action} for ${actionProcess.id}`);
                                            setActionProcess(null);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <DocumentRequestModal 
                isOpen={!!docRequestProcess}
                onOpenChange={(open) => !open && setDocRequestProcess(null)}
                clienteId={docRequestProcess?.clienteId || ''}
                processoId={docRequestProcess?.id}
            />
        </>
    );
}
