import { Eye } from "lucide-react";
import { Badge } from '../../../components/ui/Badge';
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
    responsavel: string;
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

export function ProcessTable({ data, onRowClick }: ProcessTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tabela de Processos</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Status</TableHead>
                                <TableHead>Fase</TableHead>
                                <TableHead>Processo</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Serviço</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Data de Protocolo</TableHead>
                                <TableHead>Prazo para Resposta</TableHead>
                                <TableHead>Observação</TableHead>
                                <TableHead>Valor da Ação</TableHead>
                                <TableHead>Responsável</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="cursor-pointer hover:bg-muted/50 border-b last:border-0"
                                    onClick={() => onRowClick?.(row)}
                                >
                                    <TableCell className="font-medium">
                                        {getStatusBadge(row.status)}
                                    </TableCell>
                                    <TableCell>{row.fase}</TableCell>
                                    <TableCell>{row.processo}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {/* Placeholder for avatar if needed */}
                                            <span>{row.cliente.nome}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{row.servico}</TableCell>
                                    <TableCell>{row.tipo}</TableCell>
                                    <TableCell>{row.dataProtocolo || '-'}</TableCell>
                                    <TableCell>
                                        <span className={row.prazoResposta === 0 ? "text-red-500 font-bold" : ""}>
                                            {row.prazoResposta}
                                        </span>
                                    </TableCell>
                                    <TableCell>{row.observacao || '0'}</TableCell>
                                    <TableCell>{row.valorAcao}</TableCell>
                                    <TableCell>{row.responsavel}</TableCell>
                                </TableRow>
                            ))}
                            {data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={11} className="text-center h-24 text-muted-foreground">
                                        Nenhum processo encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
