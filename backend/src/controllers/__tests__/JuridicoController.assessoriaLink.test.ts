import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock de dependencias
vi.mock('../../repositories/JuridicoRepository');
vi.mock('../../repositories/ClienteRepository');
vi.mock('../../services/EmailService');
vi.mock('../../services/NotificationService');
vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })
    }
}));

import JuridicoRepository from '../../repositories/JuridicoRepository';

function makeRes() {
    return {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    };
}

describe('JuridicoController - Assessoria-Agendamento Linking', () => {
    let JuridicoController: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();

        // Re-apply mocks
        vi.mock('../../repositories/JuridicoRepository');
        vi.mock('../../repositories/ClienteRepository');
        vi.mock('../../services/EmailService');
        vi.mock('../../services/NotificationService');

        const mod = await import('../juridico/JuridicoController');
        JuridicoController = mod.default;
    });

    // ========================================
    // FLUXO: createAssessoria passa agendamentoId
    // ========================================
    describe('createAssessoria - agendamentoId', () => {
        it('Deve passar agendamentoId para o repository ao criar assessoria', async () => {
            const mockAssessoria = {
                id: 'assessoria-1',
                cliente_id: 'cliente-1',
                agendamento_id: 'agendamento-1',
                respostas: { pergunta: 'resposta' }
            };

            const juridicoRepoMod = await import('../../repositories/JuridicoRepository');
            (juridicoRepoMod.default.createAssessoria as any).mockResolvedValue(mockAssessoria);
            (juridicoRepoMod.default.syncProcessoFromAssessoria as any) = vi.fn().mockResolvedValue(undefined);

            const req: any = {
                body: {
                    clienteId: 'cliente-1',
                    membroId: 'membro-1',
                    respostas: { pergunta: 'resposta' },
                    observacoes: 'Teste',
                    servicoId: 'servico-1',
                    subservicoId: null,
                    agendamentoId: 'agendamento-1'
                },
                user: { id: 'user-1' }
            };
            const res = makeRes();

            await JuridicoController.createAssessoria(req, res);

            expect(juridicoRepoMod.default.createAssessoria).toHaveBeenCalledWith(
                expect.objectContaining({
                    agendamentoId: 'agendamento-1'
                })
            );
        });

        it('Deve aceitar assessoria sem agendamentoId (campo opcional)', async () => {
            const mockAssessoria = {
                id: 'assessoria-2',
                cliente_id: 'cliente-1',
                respostas: { pergunta: 'resposta' }
            };

            const juridicoRepoMod = await import('../../repositories/JuridicoRepository');
            (juridicoRepoMod.default.createAssessoria as any).mockResolvedValue(mockAssessoria);
            (juridicoRepoMod.default.syncProcessoFromAssessoria as any) = vi.fn().mockResolvedValue(undefined);

            const req: any = {
                body: {
                    clienteId: 'cliente-1',
                    respostas: { pergunta: 'resposta' },
                    // agendamentoId ausente
                },
                user: { id: 'user-1' }
            };
            const res = makeRes();

            await JuridicoController.createAssessoria(req, res);

            expect(juridicoRepoMod.default.createAssessoria).toHaveBeenCalledWith(
                expect.objectContaining({
                    agendamentoId: null
                })
            );
        });
    });

});
