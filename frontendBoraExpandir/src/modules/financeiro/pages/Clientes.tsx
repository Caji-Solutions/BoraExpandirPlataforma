import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/modules/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/components/ui/card";
import { Button } from "@/modules/shared/components/ui/button";
import { Input } from "@/modules/shared/components/ui/input";
import { Search, Plus, Filter, FileSpreadsheet, Loader2 } from "lucide-react";

interface Cliente {
    id: string;
    nomeCompleto: string;
    cpf: string;
    passaporte: string;
    lugarNascimento: string;
    nacionalidade: string;
    estadoCivil: string;
    profissao: string;
    paisNascimento: string;
    dataNascimento?: string;
    status?: string;
}

export function Clientes() {
    const [searchTerm, setSearchTerm] = useState("");
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() || '';

    const fetchClientes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${backendUrl}/cliente/clientes`);
            if (!response.ok) throw new Error('Erro ao buscar clientes');
            
            const result = await response.json();
            const all = result.data || [];

            // Filtrar somente registros com status 'cliente'
            const onlyClients: Cliente[] = all
                .filter((c: any) => c.status?.toUpperCase() === 'CLIENTE')
                .map((c: any) => {
                    const dna = c.perfil_unificado?.data || {};
                    return {
                        id: c.id,
                        nomeCompleto: c.nome || dna.nome || 'Sem Nome',
                        cpf: c.documento || dna.cpf || dna.documento || '-',
                        passaporte: dna.passaporte || '-',
                        lugarNascimento: dna.local_nascimento || dna.lugarNascimento || '-',
                        nacionalidade: dna.nacionalidade || '-',
                        estadoCivil: dna.estado_civil || dna.estadoCivil || '-',
                        profissao: dna.profissao || '-',
                        paisNascimento: dna.pais_nascimento || dna.paisNascimento || 'Brasil',
                        status: c.status
                    };
                });
            
            setClientes(onlyClients);
        } catch (err) {
            console.error('Erro ao carregar base de clientes:', err);
        } finally {
            setLoading(false);
        }
    }, [backendUrl]);

    useEffect(() => {
        fetchClientes();
    }, [fetchClientes]);

    const filteredClientes = useMemo(() => {
        return clientes.filter(cliente =>
            cliente.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.cpf.includes(searchTerm) ||
            cliente.passaporte.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clientes, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Base de Clientes</h1>
                    <p className="text-muted-foreground mt-2">
                        Gerencie as informações detalhadas de todos os clientes
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrar
                    </Button>
                    <Button variant="outline">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Cliente
                    </Button>
                </div>
            </div>

            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium">Tabela de Clientes</CardTitle>
                    <div className="relative max-w-sm mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por nome, CPF ou passaporte..."
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
                                    <TableHead className="font-semibold text-foreground">Nome Completo</TableHead>
                                    <TableHead className="font-semibold text-foreground">CPF</TableHead>
                                    <TableHead className="font-semibold text-foreground">Passaporte</TableHead>
                                    <TableHead className="font-semibold text-foreground">Lugar de Nascimento</TableHead>
                                    <TableHead className="font-semibold text-foreground">Nacionalidade</TableHead>
                                    <TableHead className="font-semibold text-foreground">Estado Civil</TableHead>
                                    <TableHead className="font-semibold text-foreground">Profissao</TableHead>
                                    <TableHead className="font-semibold text-foreground">País de Nascimento</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                                                <p className="text-muted-foreground">Carregando base de clientes...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredClientes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                                            Nenhum cliente encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredClientes.map((cliente) => (
                                        <TableRow key={cliente.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium text-foreground">{cliente.nomeCompleto}</TableCell>
                                            <TableCell className="text-muted-foreground">{cliente.cpf}</TableCell>
                                            <TableCell className="text-muted-foreground">{cliente.passaporte}</TableCell>
                                            <TableCell className="text-muted-foreground">{cliente.lugarNascimento || "-"}</TableCell>
                                            <TableCell className="text-muted-foreground capitalize">{cliente.nacionalidade}</TableCell>
                                            <TableCell className="text-muted-foreground capitalize">{cliente.estadoCivil}</TableCell>
                                            <TableCell className="text-muted-foreground capitalize">{cliente.profissao}</TableCell>
                                            <TableCell className="text-muted-foreground">{cliente.paisNascimento}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground text-center">
                        Mostrando {filteredClientes.length} de {clientes.length} registros
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
