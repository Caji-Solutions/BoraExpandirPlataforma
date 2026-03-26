import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import comercialRoutes from '../../routes/comercial';
import ComercialController from '../ComercialController';
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
            single: vi.fn().mockResolvedValue({ data: { nome: 'Cliente Teste', email: 'test@test.com' }, error: null })
        })
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
        expect(ComercialRepository.updateAgendamentoStatus).not.toHaveBeenCalled();
    });
});
