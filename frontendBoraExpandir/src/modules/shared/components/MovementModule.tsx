import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from '@/modules/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card';
import { Input } from '@/modules/shared/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/modules/shared/components/ui/table";
import { ScrollArea, ScrollBar } from '@/modules/shared/components/ui/scroll-area';

interface Movement {
    id: string;
    processo: string;
    data: string;
    tipoMovimento: string;
    descricao: string;
    cliente: string;
    email: string;
}

// TODO: dados mock - usar query real de movimentos
// Dados serão carregados da API
const mockMovements: Movement[] = [];

export function MovementModule() {
    const [filterText, setFilterText] = useState("");

    const filteredMovements = mockMovements.filter((mov) =>
        mov.processo.toLowerCase().includes(filterText.toLowerCase()) ||
        mov.cliente.toLowerCase().includes(filterText.toLowerCase()) ||
        mov.tipoMovimento.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Tabela de Movimentos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="p-4 border-b">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <ScrollArea className="w-full">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Processo</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Tipo do Movimento</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>E-mail</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMovements.length === 0 && mockMovements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Search className="h-8 w-8 opacity-50" />
                                            <span>Em desenvolvimento - Nenhum movimento registrado</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {filteredMovements.map((mov) => (
                                        <TableRow key={mov.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal bg-muted">
                                                    {mov.processo}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{mov.data}</TableCell>
                                            <TableCell>
                                                {mov.tipoMovimento && (
                                                    <Badge variant="secondary" className="font-normal">
                                                        {mov.tipoMovimento}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{mov.descricao}</TableCell>
                                            <TableCell className="text-sm">{mov.cliente}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{mov.email}</TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredMovements.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                Nenhum resultado encontrado para a busca.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            )}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
