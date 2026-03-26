
import React from 'react';

import { ProcessTable, ProcessData } from "../../juridico/components/ProcessTable";

// TODO: dados mock - usar query real de processos
const mockFinanceiroData: ProcessData[] = [];

export function Processos() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Processos Financeiros</h1>
            {mockFinanceiroData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <svg className="h-12 w-12 opacity-50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-lg">Em desenvolvimento - Sem processos</span>
                </div>
            ) : (
                <ProcessTable data={mockFinanceiroData} />
            )}
        </div>
    );
}
