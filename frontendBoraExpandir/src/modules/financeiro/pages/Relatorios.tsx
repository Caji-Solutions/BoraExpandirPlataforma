import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";

// Mock Data
const metrics = {
    novosProcessos: { count: 1, value: 1.0 },
    metaAnual: { meta: 120000.0, realizado: 0.0 },
};

const monthlyData = [
    { month: "01/2025", novos: 0, valorNovos: 0, meta: 10000, realizado: 0 },
    { month: "02/2025", novos: 0, valorNovos: 0, meta: 10000, realizado: 0 },
    { month: "03/2025", novos: 0, valorNovos: 0, meta: 10000, realizado: 0 },
    { month: "04/2025", novos: 0, valorNovos: 0, meta: 10000, realizado: 0 },
    { month: "05/2025", novos: 0, valorNovos: 0, meta: 10000, realizado: 0 },
    { month: "06/2025", novos: 0, valorNovos: 0, meta: 10000, realizado: 0 },
    { month: "07/2025", novos: 0, valorNovos: 0, meta: 10000, realizado: 0 },
    { month: "08/2025", novos: 0, valorNovos: 0, meta: 10000, realizado: 0 },
    { month: "09/2025", novos: 0, valorNovos: 0, meta: 10000, realizado: 0 },
    { month: "10/2025", novos: 0, valorNovos: 0, meta: 10000, realizado: 0 },
    { month: "11/2025", novos: 0, valorNovos: 0, meta: 10000, realizado: 0 },
    { month: "12/2025", novos: 0, valorNovos: 0, meta: 10000, realizado: 0 },
];

const pendingValues = [
    { client: "Ana Paula Lima Dos Santos", ref: "Total Ana Paula Lima Dos Santos", value: 250.0 },
    { client: "Antônio Marcos Viana Antunes", ref: "Total Antônio Marcos Viana Antunes", value: 450.0 },
    { client: "Camile Khristime Souza Da S", ref: "Total Camile Khristime Souza Da S", value: 450.0 },
    { client: "Clistenes Fernandes Dos Reis", ref: "Total Clistenes Fernandes Dos Reis", value: 1600.0 },
    { client: "Cristiane Germano Paes", ref: "Total Cristiane Germano Paes", value: 600.0 },
];

export function Relatorios() {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);

    const percentRealizado =
        metrics.metaAnual.meta > 0
            ? (metrics.metaAnual.realizado / metrics.metaAnual.meta) * 100
            : 0;

    return (
        <div className="flex-1 space-y-6 p-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Relatório</h2>
                <div className="flex gap-2">
                    {/* Placeholder for Filters if needed */}
                </div>
            </div>

            {/* Metrics Section */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Novos Processos Card */}
                <Card className="overflow-hidden">
                    <div className="bg-muted px-6 py-2 border-b text-sm font-semibold text-center">
                        Novos Processos
                    </div>
                    <div className="grid grid-cols-2 text-center divide-x">
                        <div className="p-4 bg-[#0f766e] text-white">
                            <div className="text-xs uppercase opacity-80">Novos Processos</div>
                            <div className="text-xl font-bold">{metrics.novosProcessos.count}</div>
                        </div>
                        <div className="p-4 bg-muted/50">
                            <div className="text-xs uppercase text-muted-foreground">Valor</div>
                            <div className="text-xl font-bold">{formatCurrency(metrics.novosProcessos.value)}</div>
                        </div>
                    </div>
                </Card>

                {/* Meta Anual Card */}
                <Card className="overflow-hidden">
                    <div className="bg-muted px-6 py-2 border-b text-sm font-semibold text-center">
                        Meta Anual
                    </div>
                    <div className="grid grid-cols-3 text-center divide-x">
                        <div className="p-4 bg-[#0f766e] text-white">
                            <div className="text-xs uppercase opacity-80">Meta</div>
                            <div className="text-lg font-bold">{formatCurrency(metrics.metaAnual.meta)}</div>
                        </div>
                        <div className="p-4 bg-[#0f766e] text-white">
                            <div className="text-xs uppercase opacity-80">Realizado</div>
                            <div className="text-lg font-bold">{formatCurrency(metrics.metaAnual.realizado)}</div>
                        </div>
                        <div className="p-4 bg-[#0f766e] text-white">
                            <div className="text-xs uppercase opacity-80">% Realizado</div>
                            <div className="text-lg font-bold">{percentRealizado.toFixed(2)}%</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-gray-500 font-medium">Novos Processos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="novos" name="Novos Processos" stroke="#0f766e" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="valorNovos" name="Valor Novos Processos" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-gray-500 font-medium">Faturamentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="realizado" name="Realizado" stroke="#0f766e" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="meta" name="Meta" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Tables Section */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Tabela de Metas - Takes up 2 columns */}
                <Card className="col-span-2">
                    <CardHeader className="py-3 bg-[#0f766e] text-white rounded-t-lg">
                        <CardTitle className="text-sm font-medium">Tabela de Metas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-[#0f766e]">
                                <TableRow className="border-none hover:bg-[#0f766e]">
                                    <TableHead className="text-white">Referência</TableHead>
                                    <TableHead className="text-white">Meta</TableHead>
                                    <TableHead className="text-white">Realizado</TableHead>
                                    <TableHead className="text-white text-right"># Novos</TableHead>
                                    <TableHead className="text-white text-right">Valor Novos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monthlyData.map((row) => (
                                    <TableRow key={row.month} className="even:bg-muted/50 hover:bg-muted">
                                        <TableCell className="font-medium">{row.month}</TableCell>
                                        <TableCell>{formatCurrency(row.meta)}</TableCell>
                                        <TableCell>{formatCurrency(row.realizado)}</TableCell>
                                        <TableCell className="text-right">{row.novos}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(row.valorNovos)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Valor Pendente Table */}
                <Card className="col-span-1">
                    <CardHeader className="py-3 bg-[#0f766e] text-white rounded-t-lg">
                        <div className="flex justify-between w-full">
                            <span className="text-sm font-medium">Cliente</span>
                            <span className="text-sm font-medium">Valor Pendente</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableBody>
                                {pendingValues.map((row, idx) => (
                                    <React.Fragment key={idx}>
                                        <TableRow className="bg-white border-b hover:bg-gray-50">
                                            <TableCell className="py-2 text-xs font-semibold text-gray-700">
                                                <span className="inline-block w-2 h-2 bg-gray-400 mr-2 rounded-sm"></span>
                                                {row.client}
                                            </TableCell>
                                            <TableCell className="py-2 text-right text-xs">{formatCurrency(row.value)}</TableCell>
                                        </TableRow>
                                        <TableRow className="bg-gray-200/50 border-b hover:bg-gray-200">
                                            <TableCell className="py-2 text-xs pl-8 text-white">{row.ref}</TableCell>
                                            <TableCell className="py-2 text-right text-xs font-semibold">{formatCurrency(row.value)}</TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))}
                                {/* Total Row */}
                                <TableRow className="bg-[#0f766e]/10 border-t-2 border-[#0f766e]">
                                    <TableCell className="py-3 text-sm font-bold text-[#0f766e]">
                                        Total Geral
                                    </TableCell>
                                    <TableCell className="py-3 text-right text-sm font-bold text-[#0f766e]">
                                        {formatCurrency(pendingValues.reduce((acc, curr) => acc + curr.value, 0))}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
