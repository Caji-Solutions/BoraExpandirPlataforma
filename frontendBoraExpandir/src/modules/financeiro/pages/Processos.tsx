
import React from 'react';

import { ProcessTable, ProcessData } from "../../juridico/components/ProcessTable";

const mockFinanceiroData: ProcessData[] = [
    {
        id: "1",
        status: "Pendente",
        fase: 1,
        processo: 101,
        cliente: { nome: "Empresa X" },
        servico: "Consultoria Mensal",
        tipo: "Fatura",
        dataProtocolo: "20/12/2024",
        prazoResposta: 5,
        observacao: "Cobrança enviada",
        valorAcao: "1.500,00 €",
        responsavel: "Ana Souza"
    }
];

export function Processos() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Processos Financeiros</h1>
            <ProcessTable data={mockFinanceiroData} />
        </div>
    );
}
