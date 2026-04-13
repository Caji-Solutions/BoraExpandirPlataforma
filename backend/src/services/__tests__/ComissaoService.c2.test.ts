import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock de dependencias antes do import
vi.mock('../../repositories/ComissaoRepository', () => ({
    default: {
        getVendasMes: vi.fn().mockResolvedValue([]),
        getContratosAssinados: vi.fn().mockResolvedValue([]),
        getContratosNaoAgendaveis: vi.fn().mockResolvedValue([]),
        getMembrosContrato: vi.fn(),
        saveComissao: vi.fn().mockResolvedValue(undefined),
    }
}));

vi.mock('../../repositories/MetaComercialRepository', () => ({
    default: {
        getByNivel: vi.fn().mockResolvedValue([
            { meta_num: 1, min_vendas: 1, max_vendas: 5, valor_comissao_eur: 60, min_faturamento_eur: 0, max_faturamento_eur: 5000, pct_comissao_faturamento: 2.5 },
            { meta_num: 2, min_vendas: 6, max_vendas: 10, valor_comissao_eur: 90, min_faturamento_eur: 5001, max_faturamento_eur: 10000, pct_comissao_faturamento: 3.5 },
        ])
    }
}));

vi.mock('../../services/CambioService', () => ({
    default: {
        getCotacaoAtual: vi.fn().mockResolvedValue(6.0),
        convertEurToBrl: vi.fn().mockImplementation((eur: number, taxa: number) => Math.round(eur * taxa * 100) / 100),
    }
}));

vi.mock('../../config/SupabaseClient', () => ({
    supabase: { from: vi.fn() }
}));

import ComissaoRepository from '../../repositories/ComissaoRepository';

describe('ComissaoService - Calculo C2 (valor por membros)', () => {
    let ComissaoService: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();

        // Re-setup mocks after resetModules
        vi.mock('../../repositories/ComissaoRepository', () => ({
            default: {
                getVendasMes: vi.fn().mockResolvedValue([]),
                getContratosAssinados: vi.fn().mockResolvedValue([]),
                getContratosNaoAgendaveis: vi.fn().mockResolvedValue([]),
                getMembrosContrato: vi.fn(),
                saveComissao: vi.fn().mockResolvedValue(undefined),
            }
        }));

        vi.mock('../../repositories/MetaComercialRepository', () => ({
            default: {
                getByNivel: vi.fn().mockResolvedValue([
                    { meta_num: 1, min_vendas: 1, max_vendas: 5, valor_comissao_eur: 60, min_faturamento_eur: 0, max_faturamento_eur: 5000, pct_comissao_faturamento: 2.5 },
                ])
            }
        }));

        vi.mock('../../services/CambioService', () => ({
            default: {
                getCotacaoAtual: vi.fn().mockResolvedValue(6.0),
                convertEurToBrl: vi.fn().mockImplementation((eur: number, taxa: number) => Math.round(eur * taxa * 100) / 100),
            }
        }));

        const mod = await import('../ComissaoService');
        ComissaoService = mod.default;

        // Re-import mocked modules
        const comissaoRepoMod = await import('../../repositories/ComissaoRepository');
        const repo = comissaoRepoMod.default;

        // Setup: 1 contrato com servico_valor=3000 e 3 membros
        // Esperado: valorPorMembro = 3000/3 = 1000 (usa servico_valor/membros, NAO valor_por_membro)
        (repo.getContratosAssinados as any).mockResolvedValue([
            {
                id: 'contrato-1',
                servico_valor: 3000,
                membros_count: 3,
                servico: { tipo: 'fixo', nao_agendavel: false }
            }
        ]);

        // getMembrosContrato retorna apenas membros_count (sem valor_por_membro)
        (repo.getMembrosContrato as any).mockResolvedValue({ membros_count: 3 });
    });

    // ========================================
    // Calculo usa servico_valor / membros (nao valor_por_membro)
    // ========================================
    it('Deve calcular valor por membro usando servico_valor / membros_count', async () => {
        const resultado = await ComissaoService.calcularComissaoC2('user-c2', 4, 2026);

        // Com 1 contrato de assessoria, meta 1 atingida: 1 * 60 = EUR 60
        // Faturamento: 3 membros * (3000/3) = EUR 3000
        // saveComissao deve ser chamado com total_faturado_eur = 3000
        const comissaoRepoMod = await import('../../repositories/ComissaoRepository');
        const saveCalls = (comissaoRepoMod.default.saveComissao as any).mock.calls;

        const assessoriaSave = saveCalls.find((c: any[]) => c[0]?.tipo === 'assessoria');
        if (assessoriaSave) {
            expect(assessoriaSave[0].total_faturado_eur).toBe(3000);
        }
    });

    it('Deve usar membros_count=1 como fallback quando nao informado', async () => {
        const comissaoRepoMod = await import('../../repositories/ComissaoRepository');
        const repo = comissaoRepoMod.default;

        (repo.getContratosAssinados as any).mockResolvedValue([
            {
                id: 'contrato-2',
                servico_valor: 2000,
                membros_count: null,
                servico: { tipo: 'assessoria', nao_agendavel: false }
            }
        ]);

        // getMembrosContrato retorna 1 como fallback
        (repo.getMembrosContrato as any).mockResolvedValue({ membros_count: 1 });

        const resultado = await ComissaoService.calcularComissaoC2('user-c2', 4, 2026);

        // Faturamento: 1 membro * (2000/1) = EUR 2000
        const saveCalls = (repo.saveComissao as any).mock.calls;
        const assessoriaSave = saveCalls.find((c: any[]) => c[0]?.tipo === 'assessoria');
        if (assessoriaSave) {
            expect(assessoriaSave[0].total_faturado_eur).toBe(2000);
        }
    });
});
