import { Eye } from "lucide-react";
import { Badge } from "./ui/badge";
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
                                        <Badge variant="outline" className="font-normal rounded-full px-3">
                                            <div className="w-2 h-2 rounded-full bg-orange-400 mr-2" />
                                            {row.status}
                                        </Badge>
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
