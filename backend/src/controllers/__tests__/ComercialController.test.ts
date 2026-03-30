import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import comercialRoutes from '../../routes/comercial';
import ComercialController from '../comercial/ComercialController';
import ContratoServicoRepository from '../../repositories/ContratoServicoRepository';
import ComercialRepository from '../../repositories/ComercialRepository';
import AdmRepository from '../../repositories/AdmRepository';
import DNAService from '../../services/DNAService';

// Mock dependencias externas
vi.mock('../../repositories/ContratoServicoRepository');
vi.mock('../../repositories/ComercialRepository');
vi.mock('../../repositories/AdmRepository');
vi.mock('../../services/DNAService');
vi.mock('../../services/EmailService');
vi.mock('../../services/NotificationService');
vi.mock('../../services/StripeService');
vi.mock('../../services/MercadoPagoService');
vi.mock('../../services/ComposioService', () => ({
    default: {
        createCalendarEvent: vi.fn().mockResolvedValue({ success: false }),
        deleteCalendarEvent: vi.fn(),
        updateCalendarEvent: vi.fn()
    }
}));
vi.mock('../../services/AutentiqueService');
vi.mock('../../services/HtmlPdfService');
vi.mock('../../utils/calendarHelpers', () => ({
    getSuperAdminId: vi.fn().mockResolvedValue('super-admin-id')
}));

vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'contrato' }, error: null }),
            single: vi.fn().mockResolvedValue({ data: { nome: 'Cliente Teste', email: 'test@test.com', user_id: 'user-123' }, error: null })
        }),
        storage: {
            from: vi.fn().mockReturnValue({
                upload: vi.fn().mockResolvedValue({ data: { path: 'fake/path.pdf' }, error: null }),
                getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://fake-url.com' } })
            })
        }
    }
}));

// Setup do Express app para testes de integracao via supertest
const app = express();
app.use(express.json());
app.use('/api/comercial', comercialRoutes);

describe('ComercialController - Drafts', () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/comercial/contratos', () => {
        it('Deve criar um contrato inicializado como draft (is_draft = true) na etapa 1', async () => {
            // Setup do AdmRepository para passar na validacao do servico
            const mockServico = { id: 'servico-1', tipo: 'fixo', nome: 'Assessoria' };
            (AdmRepository.getServiceById as any).mockResolvedValue(mockServico);

            // Setup do mock para createContrato
            const mockPayload = {
                id: 'mock-contrato-123',
                cliente_id: 'cliente-123',
                servico_id: 'servico-1',
                is_draft: true,
                etapa_fluxo: 1,
                draft_dados: { nome: 'Joao', email: 'joao@test.com' }
            };
            
            (ContratoServicoRepository.createContrato as any).mockResolvedValue(mockPayload);
            (ContratoServicoRepository.getUltimoContratoComDados as any).mockResolvedValue(null);
            (ContratoServicoRepository.getContratoById as any).mockResolvedValue(mockPayload);

            const res = await request(app)
                .post('/api/comercial/contratos')
                .send({
                    cliente_id: 'cliente-123',
                    servico_id: 'servico-1',
                    cliente_nome: 'Joao',
                    cliente_email: 'joao@test.com'
                });

            // Status 201 Created
            expect(res.status).toBe(201);
            expect(res.body.data.is_draft).toBe(true);
            expect(res.body.data.etapa_fluxo).toBe(1);
            
            // Verifica chamadas
            expect(ContratoServicoRepository.createContrato).toHaveBeenCalledTimes(1);
            // Verifica o formato do payload de criacao
            const createCallArg = (ContratoServicoRepository.createContrato as any).mock.calls[0][0];
            expect(createCallArg.is_draft).toBe(true);
            expect(createCallArg.etapa_fluxo).toBe(1);
        });
        
        it('Deve retornar 400 se faltarem campos obrigatorios na criacao do contrato', async () => {
            const res = await request(app)
                .post('/api/comercial/contratos')
                .send({
                    // cliente_id e servico_id faltando
                    cliente_nome: 'Joao'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('cliente_id e servico_id');
        });
    });

    describe('PUT /api/comercial/contratos/:id/draft', () => {
        const mockContratoId = 'contrato-123';
        const mockClienteId = 'cliente-123';

        it('Deve atualizar os dados do draft e chamar o DNAService para merge', async () => {
            // Setup do estado atual do contrato
            const contratoDb = {
                id: mockContratoId,
                cliente_id: mockClienteId,
                is_draft: true,
                etapa_fluxo: 1,
                draft_dados: { nome: 'Joao', telefone: '5511999999999' }
            };
            
            (ContratoServicoRepository.getContratoById as any).mockResolvedValue(contratoDb);
            
            // Setup do update
            const updatedContrato = {
                ...contratoDb,
                etapa_fluxo: 2,
                draft_dados: { nome: 'Joao da Silva', telefone: '5511999999999', documento: '12345678900' }
            };
            (ContratoServicoRepository.updateContrato as any).mockResolvedValue(updatedContrato);
            
            // Setup DNAService
            (DNAService.mergeDNA as any).mockResolvedValue(true);

            // Teste
            const reqPayload = {
                etapa_fluxo: 2,
                draft_dados: { nome: 'Joao da Silva', documento: '12345678900' }
            };

            const res = await request(app)
                .put(`/api/comercial/contratos/${mockContratoId}/draft`)
                .send(reqPayload);

            // Verificacoes
            expect(res.status).toBe(200);
            expect(res.body.data.etapa_fluxo).toBe(2);
            expect(res.body.data.draft_dados.nome).toBe('Joao da Silva');

            // Verifica merge e update do repositorio
            expect(ContratoServicoRepository.updateContrato).toHaveBeenCalledTimes(1);
            const updateCallArgs = (ContratoServicoRepository.updateContrato as any).mock.calls[0];
            expect(updateCallArgs[0]).toBe(mockContratoId);
            expect(updateCallArgs[1].etapa_fluxo).toBe(2);
            // Verifica se o merge manteve o telefone e adicionou o documento
            expect(updateCallArgs[1].draft_dados.telefone).toBe('5511999999999');
            expect(updateCallArgs[1].draft_dados.documento).toBe('12345678900');

            // Verifica as regras de negocio secundarias (DNAService com prioridade MEDIUM)
            expect(DNAService.mergeDNA).toHaveBeenCalledTimes(1);
            expect(DNAService.mergeDNA).toHaveBeenCalledWith(
                mockClienteId, 
                updateCallArgs[1].draft_dados, 
                'MEDIUM'
            );
        });

        it('Deve retornar 404 se o contrato nao existir', async () => {
            (ContratoServicoRepository.getContratoById as any).mockResolvedValue(null);

            const res = await request(app)
                .put('/api/comercial/contratos/invalid-id/draft')
                .send({ etapa_fluxo: 2, draft_dados: {} });

            expect(res.status).toBe(404);
            expect(res.body.message).toContain('n\u00e3o encontrado');
        });

        it('Deve retornar 400 se tentar atualizar um contrato que nao e mais draft', async () => {
            // Contrato is_draft = false
            const contratoFinalizado = {
                id: mockContratoId,
                is_draft: false,
                etapa_fluxo: 4
            };
            (ContratoServicoRepository.getContratoById as any).mockResolvedValue(contratoFinalizado);

            const res = await request(app)
                .put(`/api/comercial/contratos/${mockContratoId}/draft`)
                .send({ draft_dados: { teste: 1 } });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('ja foi finalizado e enviado');

            // Nao deve chamar update e nem DNAService
            expect(ContratoServicoRepository.updateContrato).not.toHaveBeenCalled();
            expect(DNAService.mergeDNA).not.toHaveBeenCalled();
        });

        it('Deve calcular membros_count automaticamente a partir dos dependentes no draft', async () => {
            const contratoDb = {
                id: mockContratoId,
                cliente_id: mockClienteId,
                is_draft: true,
                etapa_fluxo: 2,
                draft_dados: { nome: 'Maria' }
            };

            (ContratoServicoRepository.getContratoById as any).mockResolvedValue(contratoDb);

            const dependentes = [
                { nome: 'Filho 1', parentesco: 'filho' },
                { nome: 'Filho 2', parentesco: 'filho' }
            ];

            const updatedContrato = {
                ...contratoDb,
                etapa_fluxo: 3,
                draft_dados: { nome: 'Maria', dependentes },
                membros_count: 3
            };
            (ContratoServicoRepository.updateContrato as any).mockResolvedValue(updatedContrato);
            (DNAService.mergeDNA as any).mockResolvedValue(true);

            const res = await request(app)
                .put(`/api/comercial/contratos/${mockContratoId}/draft`)
                .send({
                    etapa_fluxo: 3,
                    draft_dados: { dependentes }
                });

            expect(res.status).toBe(200);

            // Verificar que updateContrato recebeu membros_count = 1 (titular) + 2 (dependentes) = 3
            const updateCallArgs = (ContratoServicoRepository.updateContrato as any).mock.calls[0];
            expect(updateCallArgs[1].membros_count).toBe(3);
        });

        it('Nao deve incluir membros_count quando nao ha dependentes no draft', async () => {
            const contratoDb = {
                id: mockContratoId,
                cliente_id: mockClienteId,
                is_draft: true,
                etapa_fluxo: 1,
                draft_dados: { nome: 'Joao' }
            };

            (ContratoServicoRepository.getContratoById as any).mockResolvedValue(contratoDb);

            const updatedContrato = {
                ...contratoDb,
                etapa_fluxo: 2,
                draft_dados: { nome: 'Joao', telefone: '11999999999' }
            };
            (ContratoServicoRepository.updateContrato as any).mockResolvedValue(updatedContrato);
            (DNAService.mergeDNA as any).mockResolvedValue(true);

            const res = await request(app)
                .put(`/api/comercial/contratos/${mockContratoId}/draft`)
                .send({
                    etapa_fluxo: 2,
                    draft_dados: { telefone: '11999999999' }
                });

            expect(res.status).toBe(200);

            const updateCallArgs = (ContratoServicoRepository.updateContrato as any).mock.calls[0];
            expect(updateCallArgs[1].membros_count).toBeUndefined();
        });
    });
});

describe('ComercialController - cancelarAgendamento com meet_link', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve cancelar agendamento e logar intencao de deletar evento quando meet_link existe', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        (ComercialRepository.getAgendamentoById as any).mockResolvedValue({
            id: 'ag-001',
            status: 'agendado',
            meet_link: 'https://meet.google.com/zzz-yyy-xxx'
        });
        (ComercialRepository.updateAgendamentoStatus as any).mockResolvedValue(true);

        const res = await request(app)
            .post('/api/comercial/agendamento/ag-001/cancelar')
            .send({});

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(ComercialRepository.updateAgendamentoStatus).toHaveBeenCalledWith('ag-001', 'cancelado');

        await new Promise(process.nextTick);

        // Note: console.log foi removido na correção de segurança
        // por isso não verificamos mais se foi chamado

        consoleSpy.mockRestore();
    });

    it('nao deve logar meet_link quando agendamento nao possui link', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        (ComercialRepository.getAgendamentoById as any).mockResolvedValue({
            id: 'ag-002',
            status: 'agendado',
            meet_link: null
        });
        (ComercialRepository.updateAgendamentoStatus as any).mockResolvedValue(true);

        const res = await request(app)
            .post('/api/comercial/agendamento/ag-002/cancelar')
            .send({});

        expect(res.status).toBe(200);
        expect(ComercialRepository.updateAgendamentoStatus).toHaveBeenCalledWith('ag-002', 'cancelado');

        await new Promise(process.nextTick);

        const meetLogCalled = consoleSpy.mock.calls.some(args =>
            args.some(a => typeof a === 'string' && a.includes('meet_link') || a.includes('meet.google.com'))
        );
        expect(meetLogCalled).toBe(false);

        consoleSpy.mockRestore();
    });

    it('deve retornar 400 ao tentar cancelar agendamento ja cancelado', async () => {
        (ComercialRepository.getAgendamentoById as any).mockResolvedValue({
            id: 'ag-003',
            status: 'cancelado',
            meet_link: null
        });

        const res = await request(app)
            .post('/api/comercial/agendamento/ag-003/cancelar')
            .send({});

        expect(res.status).toBe(400);
    });
});

describe('ComercialController - Isolamento de contratos por dono', () => {
    function makeRes() {
        return {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Deve retornar 401 ao listar contratos sem userId autenticado', async () => {
        const req: any = { userId: null, query: {} };
        const res = makeRes();

        await ComercialController.getContratosServicos(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(ContratoServicoRepository.getContratos).not.toHaveBeenCalled();
    });

    it('Deve ignorar usuarioId da query e forcar filtro pelo userId autenticado', async () => {
        const req: any = {
            userId: 'owner-123',
            query: {
                usuarioId: 'outro-usuario',
                clienteId: 'cliente-123',
                isDraft: 'false'
            }
        };
        const res = makeRes();

        (ContratoServicoRepository.getContratos as any).mockResolvedValue([
            { id: 'contrato-1', usuario_id: 'owner-123' }
        ]);

        await ComercialController.getContratosServicos(req, res);

        expect(ContratoServicoRepository.getContratos).toHaveBeenCalledWith({
            clienteId: 'cliente-123',
            isDraft: false,
            usuarioId: 'owner-123'
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Deve retornar 403 ao buscar contrato que pertence a outro usuario', async () => {
        const req: any = { userId: 'owner-123', params: { id: 'contrato-1' } };
        const res = makeRes();

        (ContratoServicoRepository.getContratoById as any).mockResolvedValue({
            id: 'contrato-1',
            usuario_id: 'owner-999'
        });

        await ComercialController.getContratoServicoById(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Acesso negado a contrato de outro usuário' });
    });

    it('Deve permitir buscar contrato do proprio usuario autenticado', async () => {
        const req: any = { userId: 'owner-123', params: { id: 'contrato-1' } };
        const res = makeRes();

        const contrato = {
            id: 'contrato-1',
            usuario_id: 'owner-123',
            cliente_id: 'cliente-123'
        };
        (ContratoServicoRepository.getContratoById as any).mockResolvedValue(contrato);

        await ComercialController.getContratoServicoById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: contrato });
    });
});

describe('ComercialController - Comprovante', () => {
    const mockContratoId = 'contrato-123';
    
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Deve retornar 400 se o arquivo nao for enviado', async () => {
        const res = await request(app)
            .post(`/api/comercial/contratos/${mockContratoId}/comprovante`);
        
        expect(res.status).toBe(400);
        expect(res.body.message).toContain('obrigatório');
    });

    it('Deve validar se o contrato existe', async () => {
        (ContratoServicoRepository.getContratoById as any).mockResolvedValue(null);

        const res = await request(app)
            .post(`/api/comercial/contratos/${mockContratoId}/comprovante`)
            .attach('file', Buffer.from('test'), 'test.pdf');
        
        expect(res.status).toBe(404);
        expect(res.body.message).toContain('não encontrado');
    });

    it('Deve rejeitar documento se a assinatura nao estiver aprovada', async () => {
        (ContratoServicoRepository.getContratoById as any).mockResolvedValue({
            id: mockContratoId,
            assinatura_status: 'pendente',
            pagamento_status: 'pendente'
        });

        const res = await request(app)
            .post(`/api/comercial/contratos/${mockContratoId}/comprovante`)
            .attach('file', Buffer.from('test'), 'test.pdf');

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('ainda não aprovado');
    });

    it('Deve rejeitar se pagamento_status nao for pendente ou recusado', async () => {
        (ContratoServicoRepository.getContratoById as any).mockResolvedValue({
            id: mockContratoId,
            assinatura_status: 'aprovado',
            pagamento_status: 'em_analise'
        });

        const res = await request(app)
            .post(`/api/comercial/contratos/${mockContratoId}/comprovante`)
            .attach('file', Buffer.from('test'), 'test.pdf');

        expect(res.status).toBe(409);
        expect(res.body.message).toContain('Ja existe');
    });

    it('Deve fazer upload e atualizar status corretamente na jornada feliz', async () => {
        (ContratoServicoRepository.getContratoById as any).mockResolvedValue({
            id: mockContratoId,
            assinatura_status: 'aprovado',
            pagamento_status: 'pendente',
            cliente_id: 'cliente-123'
        });

        const { supabase } = await import('../../config/SupabaseClient');
        (supabase.from('contratos_servicos').maybeSingle as any).mockResolvedValue({ data: { id: mockContratoId }, error: null });

        (ContratoServicoRepository.updateContrato as any).mockResolvedValue({
            id: mockContratoId,
            cliente_id: 'cliente-123',
            pagamento_status: 'em_analise'
        });

        const NotificationService = (await import('../../services/NotificationService')).default;

        const res = await request(app)
            .post(`/api/comercial/contratos/${mockContratoId}/comprovante`)
            .attach('file', Buffer.from('fake-pdf-content'), 'comprovante.pdf');
        
        expect(res.status).toBe(200);
        expect(res.body.data.pagamento_status).toBe('em_analise');
        
        expect(supabase.storage.from).toHaveBeenCalledWith('documentos');
        expect(supabase.storage.from('documentos').upload).toHaveBeenCalled();
        
        expect(ContratoServicoRepository.updateContrato).toHaveBeenCalled();

        expect(NotificationService.createNotification).toHaveBeenCalled();
    });
});

// =============================================
// Contract creation - Stage progression logic
// =============================================

describe('ComercialController - Contract Stage Progression', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Deve mover cliente para aguardando_assessoria quando e o primeiro contrato', async () => {
        const mockServico = { id: 'servico-1', tipo: 'fixo', nome: 'Assessoria' };
        (AdmRepository.getServiceById as any).mockResolvedValue(mockServico);

        const mockPayload = {
            id: 'contrato-new',
            cliente_id: 'cliente-first',
            servico_id: 'servico-1',
            is_draft: true,
            etapa_fluxo: 1,
            draft_dados: {}
        };

        (ContratoServicoRepository.createContrato as any).mockResolvedValue(mockPayload);
        (ContratoServicoRepository.getUltimoContratoComDados as any).mockResolvedValue(null);
        (ContratoServicoRepository.getContratoById as any).mockResolvedValue(mockPayload);

        // Mock supabase para retornar count=1 (primeiro contrato) e lidar com updates
        const { supabase: supabaseMock } = await import('../../config/SupabaseClient');
        const mockClienteUpdateEq = vi.fn().mockResolvedValue({ error: null });
        const mockClienteUpdate = vi.fn().mockReturnValue({ eq: mockClienteUpdateEq });
        const mockProcessoUpdateEq = vi.fn().mockResolvedValue({ error: null });
        const mockProcessoUpdate = vi.fn().mockReturnValue({ eq: mockProcessoUpdateEq });

        (supabaseMock.from as any).mockImplementation((table: string) => {
            if (table === 'contratos_servicos') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ count: 1, error: null })
                    })
                };
            }
            if (table === 'clientes') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { id: 'cliente-first', nome: 'Teste', email: 'a@b.com', whatsapp: '11999' }, error: null })
                        })
                    }),
                    update: mockClienteUpdate
                };
            }
            if (table === 'processos') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockReturnValue({
                                    single: vi.fn().mockResolvedValue({ data: { id: 'proc-1' }, error: null })
                                })
                            })
                        })
                    }),
                    update: mockProcessoUpdate
                };
            }
            if (table === 'catalogo_servicos') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: mockServico, error: null })
                        })
                    })
                };
            }
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null })
            };
        });

        const res = await request(app)
            .post('/api/comercial/contratos')
            .send({
                cliente_id: 'cliente-first',
                servico_id: 'servico-1'
            });

        expect(res.status).toBe(201);
        expect(mockClienteUpdate).toHaveBeenCalledWith({ stage: 'aguardando_assessoria', status: 'aguardando_assessoria' });
        expect(mockProcessoUpdate).toHaveBeenCalledWith(expect.objectContaining({
            status: 'aguardando_assessoria',
            tipo_servico: 'Assessoria',
            servico_id: 'servico-1'
        }));
    });
});

// =============================================
// Contract Draft - Client data sync
// =============================================

describe('ComercialController - Draft Client Data Sync', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Deve sincronizar email, estado_civil e CPF (11 digitos) para a tabela clientes', async () => {
        const mockContratoId = 'contrato-sync';
        const mockClienteId = 'cliente-sync';

        const contratoDb = {
            id: mockContratoId,
            cliente_id: mockClienteId,
            is_draft: true,
            etapa_fluxo: 2,
            draft_dados: { nome: 'Maria' }
        };

        (ContratoServicoRepository.getContratoById as any).mockResolvedValue(contratoDb);

        const updatedContrato = {
            ...contratoDb,
            etapa_fluxo: 3,
            draft_dados: {
                nome: 'Maria',
                email: 'maria@test.com',
                estado_civil: 'casada',
                documento: '123.456.789-09'
            }
        };
        (ContratoServicoRepository.updateContrato as any).mockResolvedValue(updatedContrato);
        (DNAService.mergeDNA as any).mockResolvedValue(true);

        // Mock supabase para capturar o update na tabela clientes
        const { supabase: supabaseMock } = await import('../../config/SupabaseClient');
        const mockClienteEq = vi.fn().mockResolvedValue({ error: null });
        const mockClienteUpdate = vi.fn().mockReturnValue({ eq: mockClienteEq });

        (supabaseMock.from as any).mockImplementation((table: string) => {
            if (table === 'clientes') {
                return { update: mockClienteUpdate };
            }
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null })
            };
        });

        const res = await request(app)
            .put(`/api/comercial/contratos/${mockContratoId}/draft`)
            .send({
                etapa_fluxo: 3,
                draft_dados: {
                    email: 'maria@test.com',
                    estado_civil: 'casada',
                    documento: '123.456.789-09'
                }
            });

        expect(res.status).toBe(200);
        expect(mockClienteUpdate).toHaveBeenCalledWith({
            email: 'maria@test.com',
            estado_civil: 'casada',
            cpf: '12345678909'
        });
        expect(mockClienteEq).toHaveBeenCalledWith('id', mockClienteId);
    });

    it('Nao deve sincronizar CPF se documento nao tem 11 digitos', async () => {
        const contratoDb = {
            id: 'contrato-no-cpf',
            cliente_id: 'cliente-no-cpf',
            is_draft: true,
            etapa_fluxo: 2,
            draft_dados: { nome: 'Joao' }
        };

        (ContratoServicoRepository.getContratoById as any).mockResolvedValue(contratoDb);
        (ContratoServicoRepository.updateContrato as any).mockResolvedValue({
            ...contratoDb,
            etapa_fluxo: 3,
            draft_dados: { nome: 'Joao', email: 'joao@test.com', documento: 'AB123456' }
        });
        (DNAService.mergeDNA as any).mockResolvedValue(true);

        const { supabase: supabaseMock } = await import('../../config/SupabaseClient');
        const mockClienteEq = vi.fn().mockResolvedValue({ error: null });
        const mockClienteUpdate = vi.fn().mockReturnValue({ eq: mockClienteEq });

        (supabaseMock.from as any).mockImplementation((table: string) => {
            if (table === 'clientes') {
                return { update: mockClienteUpdate };
            }
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null })
            };
        });

        const res = await request(app)
            .put('/api/comercial/contratos/contrato-no-cpf/draft')
            .send({
                etapa_fluxo: 3,
                draft_dados: { email: 'joao@test.com', documento: 'AB123456' }
            });

        expect(res.status).toBe(200);
        // Deve sincronizar apenas email, sem CPF
        expect(mockClienteUpdate).toHaveBeenCalledWith({ email: 'joao@test.com' });
    });
});

// =============================================
// getConsultoriasCount
// =============================================

describe('ComercialController - getConsultoriasCount', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Deve retornar contagem de consultorias e valor de desconto', async () => {
        const { supabase: supabaseMock } = await import('../../config/SupabaseClient');

        (supabaseMock.from as any).mockImplementation(() => ({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ count: 3, error: null })
                })
            })
        }));

        const res = await request(app)
            .get('/api/comercial/consultorias-count/cliente-123');

        expect(res.status).toBe(200);
        expect(res.body.data.total_consultorias).toBe(3);
        expect(res.body.data.valor_desconto).toBe(150);
        expect(res.body.data.valor_por_consultoria).toBe(50);
    });

    it('Deve retornar desconto zero quando nao ha consultorias realizadas', async () => {
        const { supabase: supabaseMock } = await import('../../config/SupabaseClient');

        (supabaseMock.from as any).mockImplementation(() => ({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ count: 0, error: null })
                })
            })
        }));

        const res = await request(app)
            .get('/api/comercial/consultorias-count/cliente-456');

        expect(res.status).toBe(200);
        expect(res.body.data.total_consultorias).toBe(0);
        expect(res.body.data.valor_desconto).toBe(0);
    });

    it('Deve retornar 500 quando supabase retorna erro', async () => {
        const { supabase: supabaseMock } = await import('../../config/SupabaseClient');

        (supabaseMock.from as any).mockImplementation(() => ({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ count: null, error: { message: 'db error' } })
                })
            })
        }));

        const res = await request(app)
            .get('/api/comercial/consultorias-count/cliente-err');

        expect(res.status).toBe(500);
    });
});

// =============================================
// getPosConsultoria (direct method calls - requires auth context)
// =============================================

describe('ComercialController - getPosConsultoria', () => {
    function makeRes() {
        return {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Deve retornar 401 quando userId nao esta presente', async () => {
        const req: any = { userId: null, user: {} };
        const res = makeRes();
        await ComercialController.getPosConsultoria(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('Deve retornar 403 quando usuario nao e C2 comercial nem super_admin', async () => {
        const { supabase: supabaseMock } = await import('../../config/SupabaseClient');

        (supabaseMock.from as any).mockImplementation((table: string) => {
            if (table === 'usuarios') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { nivel: 'C1', setor: 'comercial', role: 'comercial' },
                                error: null
                            })
                        })
                    })
                };
            }
            return {};
        });

        const req: any = { userId: 'user-c1', user: { role: 'comercial' } };
        const res = makeRes();
        await ComercialController.getPosConsultoria(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('Deve retornar agendamentos realizados para usuario C2 comercial (vendedor + delegados por processo)', async () => {
        const { supabase: supabaseMock } = await import('../../config/SupabaseClient');

        const mockAgendamentosVendedor = [
            {
                id: 'ag-1',
                produto_nome: 'Consultoria Espanha',
                data_hora: '2026-03-28T18:00:00Z',
                criado_em: '2026-03-20',
                clientes: { id: 'cli-1', client_id: 'C001', nome: 'Maria', email: 'maria@test.com', whatsapp: '11999' }
            }
        ];

        const mockAgendamentosDelegados = [
            {
                id: 'ag-2',
                produto_nome: 'Consultoria Portugal',
                data_hora: '2026-03-29T18:00:00Z',
                criado_em: '2026-03-21',
                clientes: { id: 'cli-2', client_id: 'C002', nome: 'Joao', email: 'joao@test.com', whatsapp: '11888' }
            },
            {
                id: 'ag-1',
                produto_nome: 'Consultoria Espanha',
                data_hora: '2026-03-28T18:00:00Z',
                criado_em: '2026-03-20',
                clientes: { id: 'cli-1', client_id: 'C001', nome: 'Maria', email: 'maria@test.com', whatsapp: '11999' }
            }
        ];

        let agendamentosCallCount = 0;
        (supabaseMock.from as any).mockImplementation((table: string) => {
            if (table === 'usuarios') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { nivel: 'C2', setor: 'comercial', role: 'comercial' },
                                error: null
                            })
                        })
                    })
                };
            }
            if (table === 'processos') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockResolvedValue({
                                data: [{ cliente_id: 'cli-2' }],
                                error: null
                            })
                        })
                    })
                };
            }
            if (table === 'agendamentos') {
                agendamentosCallCount += 1;

                if (agendamentosCallCount === 1) {
                    return {
                        select: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                eq: vi.fn().mockReturnValue({
                                    order: vi.fn().mockResolvedValue({ data: mockAgendamentosVendedor, error: null })
                                })
                            })
                        })
                    };
                }

                return {
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                order: vi.fn().mockResolvedValue({ data: mockAgendamentosDelegados, error: null })
                            })
                        })
                    })
                };
            }
            return {};
        });

        const req: any = { userId: 'user-c2', user: { role: 'comercial' } };
        const res = makeRes();
        await ComercialController.getPosConsultoria(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: expect.arrayContaining([
                expect.objectContaining({ id: 'ag-1', produto_nome: 'Consultoria Espanha' })
            ])
        });
        expect(res.json).toHaveBeenCalledWith({
            data: expect.arrayContaining([
                expect.objectContaining({ id: 'ag-2', produto_nome: 'Consultoria Portugal' })
            ])
        });
        const responsePayload = (res.json as any).mock.calls[0][0];
        expect(responsePayload.data).toHaveLength(2);
    });

    it('Deve permitir fallback de permissao via req.user quando usuario nao e encontrado na tabela usuarios', async () => {
        const { supabase: supabaseMock } = await import('../../config/SupabaseClient');

        (supabaseMock.from as any).mockImplementation((table: string) => {
            if (table === 'usuarios') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: { message: 'not found' }
                            })
                        })
                    })
                };
            }
            if (table === 'processos') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockResolvedValue({
                                data: [],
                                error: null
                            })
                        })
                    })
                };
            }
            if (table === 'agendamentos') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                order: vi.fn().mockResolvedValue({ data: [], error: null })
                            })
                        })
                    })
                };
            }
            return {};
        });

        const req: any = { userId: 'user-c2', user: { role: 'comercial', cargo: 'C2' } };
        const res = makeRes();
        await ComercialController.getPosConsultoria(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: [] });
    });

    it('Deve permitir acesso para super_admin independente do nivel', async () => {
        const { supabase: supabaseMock } = await import('../../config/SupabaseClient');

        (supabaseMock.from as any).mockImplementation((table: string) => {
            if (table === 'usuarios') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { nivel: null, setor: 'admin', role: 'super_admin' },
                                error: null
                            })
                        })
                    })
                };
            }
            if (table === 'agendamentos') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                order: vi.fn().mockResolvedValue({ data: [], error: null })
                            })
                        })
                    })
                };
            }
            if (table === 'processos') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockResolvedValue({
                                data: [],
                                error: null
                            })
                        })
                    })
                };
            }
            return {};
        });

        const req: any = { userId: 'admin-1', user: { role: 'super_admin' } };
        const res = makeRes();
        await ComercialController.getPosConsultoria(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: [] });
    });
});
