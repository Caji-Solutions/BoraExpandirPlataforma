import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface Movement {
    id: string;
    processo: string;
    data: string;
    tipoMovimento: string;
    descricao: string;
    cliente: string;
    email: string;
}

const mockMovements: Movement[] = [
    {
        id: "1",
        processo: "Railson Rames Sou...",
        data: "02/07/2025",
        tipoMovimento: "Pedido Protocolado",
        descricao: "",
        cliente: "Railson Rames Sou...",
        email: "railson@msn.com",
    },
    {
        id: "2",
        processo: "Railson Rames Sou...",
        data: "08/07/2025",
        tipoMovimento: "Subsanación",
        descricao: "",
        cliente: "Railson Rames Sou...",
        email: "railson@msn.com",
    },
    {
        id: "3",
        processo: "Railson Rames Sou...",
        data: "",
        tipoMovimento: "",
        descricao: "",
        cliente: "Railson Rames Sou...",
        email: "railson@msn.com",
    },
];

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
                                        Nenhum movimento encontrado.
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
