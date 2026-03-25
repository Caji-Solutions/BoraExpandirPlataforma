
import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/modules/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card';
import { Button } from '@/modules/shared/components/ui/button';
import { Input } from '@/modules/shared/components/ui/input';
import { Search, Plus, Filter, FileSpreadsheet, Users } from "lucide-react";

interface Titularidade {
    id: string;
    titular: string;
    grupoDependencia: string;
    observacoes: string;
    isTitularRow?: boolean;
}

const mockTitularidades: Titularidade[] = [
    {
        id: "1",
        titular: "Ana Paula Lima Dos Santos",
        grupoDependencia: "Ana Paula Lima Dos Santos",
        observacoes: "Não consta no contrato.",
        isTitularRow: true
    },
    {
        id: "2",
        titular: "Andeecleebson Xeineeclee Fabiano Roques",
        grupoDependencia: "Andeecleebson Xeineeclee Fabiano Roques",
        observacoes: "Titular + 1 dependente",
        isTitularRow: true
    },
    {
        id: "3",
        titular: "Antônio Marcos Viana Antunes",
        grupoDependencia: "Antônio Marcos Viana Antunes",
        observacoes: "Não.",
        isTitularRow: true
    },
    {
        id: "4",
        titular: "Camile Khristime Souza Da Silva",
        grupoDependencia: "Camile Khristime Souza Da Silva",
        observacoes: "Não.",
        isTitularRow: true
    },
    {
        id: "5",
        titular: "Clistenes Fernandes Dos Reis",
        grupoDependencia: "Clistenes Fernandes Dos Reis",
        observacoes: "Sim, 4 dependentes.",
        isTitularRow: true
    },
    {
        id: "6",
        titular: "Cristiane Germano Paes",
        grupoDependencia: "Cristiane Germano Paes",
        observacoes: "",
        isTitularRow: true
    },
    // Example of Grouping based on the image: Diego Campos Fontenele
    {
        id: "8",
        titular: "Diego Campos Fontenele",
        grupoDependencia: "Alba Moreira Fontenele",
        observacoes: "Não.",
        isTitularRow: true
    },
    {
        id: "9",
        titular: "Diego Campos Fontenele",
        grupoDependencia: "Diego Campos Fontenele",
        observacoes: "Sim, 2 dependentes.",
        isTitularRow: false
    },
    {
        id: "10",
        titular: "Elsie Barros Vales",
        grupoDependencia: "Elsie Barros Vales",
        observacoes: "",
        isTitularRow: true
    },
    {
        id: "11",
        titular: "Erenildo Pereira de Souza",
        grupoDependencia: "Erenildo Pereira de Souza",
        observacoes: "Titular + 3 Dependentes",
        isTitularRow: true
    },
    // Example of grouping: Manoel Queiroz Neto
    {
        id: "32",
        titular: "Manoel Queiroz Neto",
        grupoDependencia: "Açucena da Anunciação Queiroz",
        observacoes: "2 Titulares + 1 Dependente",
        isTitularRow: true
    },
    {
        id: "33",
        titular: "Manoel Queiroz Neto",
        grupoDependencia: "Manoel Queiroz Neto",
        observacoes: "2 Titulares + 1 Dependente",
        isTitularRow: false
    },
    // Example of grouping: Mara Alzira Pereira Domingues
    {
        id: "34",
        titular: "Mara Alzira Pereira Domingues",
        grupoDependencia: "Gustavo Martins Domingues",
        observacoes: "1 Titular + 1 Dependente",
        isTitularRow: true
    },
    {
        id: "35",
        titular: "Mara Alzira Pereira Domingues",
        grupoDependencia: "Mara Alzira Pereira Domingues",
        observacoes: "1 Titular + 1 Dependente",
        isTitularRow: false
    }
];

export function Titularidades() {
    const [searchTerm, setSearchTerm] = useState("");
    const [titularidades] = useState<Titularidade[]>(mockTitularidades);

    const filteredTitularidades = titularidades.filter(item =>
        item.titular.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.grupoDependencia.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Titularidades e Dependências</h1>
                    <p className="text-muted-foreground mt-2">
                        Gerencie os grupos familiares e dependências contratuais
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrar
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Titularidade
                    </Button>
                </div>
            </div>

            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium">Lista de Titularidades</CardTitle>
                    <div className="relative max-w-sm mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por titular ou dependente..."
                            className="pl-9 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold text-foreground w-[30%]">Titular</TableHead>
                                    <TableHead className="font-semibold text-foreground w-[30%]">Grupo de Dependência</TableHead>
                                    <TableHead className="font-semibold text-foreground w-[40%]">Observações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTitularidades.map((item, index) => {
                                    // Logic to show Titular only on first row of group if adjacent
                                    const showTitular = index === 0 || item.titular !== filteredTitularidades[index - 1].titular;

                                    return (
                                        <TableRow key={item.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium text-foreground align-top">
                                                {showTitular ? (
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        {item.titular}
                                                    </div>
                                                ) : null}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {item.grupoDependencia}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {item.observacoes}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
