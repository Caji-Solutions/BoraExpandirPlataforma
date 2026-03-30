import { vi, describe, it, expect, beforeEach } from 'vitest';
import FinanceiroController from '../financeiro/FinanceiroController';
import ComercialRepository from '../../repositories/ComercialRepository';
import ContratoServicoRepository from '../../repositories/ContratoServicoRepository';
import { supabase } from '../../config/SupabaseClient';
import EmailService from '../../services/EmailService';
import ComposioService from '../../services/ComposioService';
import DNAService from '../../services/DNAService';

vi.mock('../../repositories/ComercialRepository');
vi.mock('../../repositories/ContratoServicoRepository');
vi.mock('../../services/EmailService');
vi.mock('../../services/StripeService');
vi.mock('../../services/MercadoPagoService');
vi.mock('../../services/DNAService');
vi.mock('../../services/ComposioService', () => ({
    default: {
        createCalendarEvent: vi.fn().mockResolvedValue({ success: false }),
        deleteCalendarEvent: vi.fn(),
        updateCalendarEvent: vi.fn()
    }
}));
vi.mock('../../services/NotificationService');
vi.mock('../../utils/calendarHelpers', () => ({
    getSuperAdminId: vi.fn().mockResolvedValue('super-admin-id')
}));

vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn()
    }
}));

describe('FinanceiroController - Aprovação de Comprovante (Lead -> Cliente)', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        req = {
            params: { id: 'agendamento-123' },
            body: { verificado_por: 'admin-123' }
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    });

    it('should convert LEAD to CLIENTE and update appointment status to agendado when comprovante is approved', async () => {
        // Arrange
        const mockAgendamento = {
            id: 'agendamento-123',
            comprovante_url: 'http://test.com/comprovante.jpg',
            pagamento_status: 'em_analise',
            cliente_id: 'cliente-123',
            email: 'test@example.com',
            nome: 'Test Client',
            telefone: '11999999999',
            data_hora: new Date().toISOString()
        };
        
        (ComercialRepository.getAgendamentoById as any).mockResolvedValue(mockAgendamento);
        (ComercialRepository.updateAgendamentoStatus as any).mockResolvedValue(true);

        const mockGte = vi.fn().mockReturnThis();
        const mockLt = vi.fn().mockResolvedValue({ data: [] });
        
        const mockEqAgendamentoUpdate = vi.fn().mockResolvedValue({ error: null });
        const mockUpdateAgendamento = vi.fn().mockReturnValue({ eq: mockEqAgendamentoUpdate });

        const mockSingleClientCheck = vi.fn().mockResolvedValue({ data: { status: 'LEAD' }, error: null });
        
        const mockEqClientUpdate = vi.fn().mockResolvedValue({ error: null });
        const mockUpdateClient = vi.fn().mockReturnValue({ eq: mockEqClientUpdate });

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'agendamentos') {
                return {
                    select: vi.fn().mockReturnThis(),
                    neq: vi.fn().mockReturnThis(),
                    in: vi.fn().mockReturnThis(),
                    gte: mockGte,
                    lt: mockLt,
                    update: mockUpdateAgendamento,
                };
            }
            if (table === 'clientes') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn((key, val) => {
                        return { single: mockSingleClientCheck };
                    }),
                    update: mockUpdateClient
                };
            }
            if (table === 'formularios_cliente') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: null })
                };
            }
        });

        // Act
        await FinanceiroController.aprovarComprovante(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Comprovante aprovado e email com formulário enviado com sucesso!',
            formulario_link: expect.any(String)
        });

        expect(mockUpdateAgendamento).toHaveBeenCalledWith(expect.objectContaining({
            pagamento_status: 'aprovado'
        }));

        expect(mockUpdateClient).toHaveBeenCalledWith(expect.objectContaining({
            status: 'cliente'
        }));

        expect(EmailService.sendFormularioEmail).toHaveBeenCalledTimes(1);
        expect(ComercialRepository.updateAgendamentoStatus).toHaveBeenCalledWith('agendamento-123', 'agendado');
    });

    it('should NOT convert when pagamento_status is not valid (already approved)', async () => {
        // Arrange
        const mockAgendamento = {
            id: 'agendamento-123',
            comprovante_url: 'http://test.com/comprovante.jpg',
            pagamento_status: 'aprovado',
            cliente_id: 'cliente-123'
        };
        
        (ComercialRepository.getAgendamentoById as any).mockResolvedValue(mockAgendamento);
        const mockUpdateClient = vi.fn();

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'clientes') {
                return { update: mockUpdateClient };
            }
            return { update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }) };
        });

        // Act
        await FinanceiroController.aprovarComprovante(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Este comprovante já foi aprovado.' });
        expect(mockUpdateClient).not.toHaveBeenCalled();
    });

    it('should NOT convert LEAD to CLIENTE when comprovante is recusado', async () => {
        // Arrange
        const mockAgendamento = {
            id: 'agendamento-123',
            comprovante_url: 'http://test.com/comprovante.jpg',
            pagamento_status: 'em_analise',
            cliente_id: 'cliente-123'
        };
        
        (ComercialRepository.getAgendamentoById as any).mockResolvedValue(mockAgendamento);

        const mockEqUpdate = vi.fn().mockResolvedValue({ error: null });
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });
        const mockUpdateClient = vi.fn();

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'agendamentos') {
                return {
                    update: mockUpdate
                };
            }
            if (table === 'clientes') {
                return { update: mockUpdateClient };
            }
        });

        req.body.nota = 'Rejected manually';

        // Act
        await FinanceiroController.recusarComprovante(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true
        }));

        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            pagamento_status: 'recusado',
            pagamento_nota_recusa: 'Rejected manually'
        }));

        expect(mockUpdateClient).not.toHaveBeenCalled();
    });
});

describe('FinanceiroController - aprovarComprovanteContrato (Lead -> Cliente + Onboarding)', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        req = {
            params: { id: 'contrato-123' },
            body: { verificado_por: 'admin-123' }
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    });

    it('deve converter LEAD, atualizar DNA e enviar onboarding quando aprovar contrato', async () => {
        (ContratoServicoRepository.getContratoById as any).mockResolvedValue({
            id: 'contrato-123',
            cliente_id: 'cliente-123',
            usuario_id: null,
            pagamento_status: 'em_analise',
            pagamento_comprovante_url: 'https://files.test/comprovante.png',
            metodo_pagamento: 'pix',
            servico_nome: 'Assessoria Premium',
            cliente: { status: null, nome: null, email: null, whatsapp: null },
            servico: { nome: 'Assessoria Premium' }
        });
        (ContratoServicoRepository.updateContrato as any).mockResolvedValue({ id: 'contrato-123' });

        let clientesCallCount = 0;
        let profilesCallCount = 0;
        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'clientes') {
                clientesCallCount += 1;
                if (clientesCallCount === 1) {
                    return {
                        select: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                maybeSingle: vi.fn().mockResolvedValue({
                                    data: {
                                        status: 'LEAD',
                                        nome: 'Cliente Contrato',
                                        email: 'cliente@teste.com',
                                        whatsapp: '11999990000'
                                    },
                                    error: null
                                })
                            })
                        })
                    };
                }

                return {
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null })
                    })
                };
            }

            if (table === 'profiles') {
                profilesCallCount += 1;

                if (profilesCallCount === 1) {
                    return {
                        select: vi.fn().mockReturnValue({
                            ilike: vi.fn().mockReturnValue({
                                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
                            })
                        })
                    };
                }

                return {
                    insert: vi.fn().mockResolvedValue({ error: null })
                };
            }

            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null })
                })
            };
        });

        (DNAService.mergeDNA as any).mockResolvedValue(true);
        (EmailService.sendWelcomeEmail as any).mockResolvedValue(true);

        await FinanceiroController.aprovarComprovanteContrato(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(DNAService.mergeDNA).toHaveBeenCalledWith(
            'cliente-123',
            { servico_inicial: 'Assessoria Premium' },
            'HIGH'
        );
        expect(EmailService.sendWelcomeEmail).toHaveBeenCalledTimes(1);
        expect(EmailService.sendWelcomeEmail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'cliente@teste.com',
            email: 'cliente@teste.com'
        }));
    });

    it('nao deve executar onboarding quando cliente nao for LEAD', async () => {
        (ContratoServicoRepository.getContratoById as any).mockResolvedValue({
            id: 'contrato-123',
            cliente_id: 'cliente-123',
            usuario_id: null,
            pagamento_status: 'em_analise',
            pagamento_comprovante_url: 'https://files.test/comprovante.png',
            metodo_pagamento: 'pix',
            servico_nome: 'Assessoria Premium',
            cliente: {
                status: 'cliente',
                nome: 'Cliente Ativo',
                email: 'ativo@teste.com',
                whatsapp: '11999990000'
            },
            servico: { nome: 'Assessoria Premium' }
        });
        (ContratoServicoRepository.updateContrato as any).mockResolvedValue({ id: 'contrato-123' });
        (supabase.from as any).mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
            })
        });

        await FinanceiroController.aprovarComprovanteContrato(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(DNAService.mergeDNA).not.toHaveBeenCalled();
        expect(EmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });
});

describe('FinanceiroController - Google Meet gerado ao confirmar agendamento', () => {
    let req: any;
    let res: any;

    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    beforeEach(() => {
        vi.clearAllMocks();
        req = {
            params: { id: 'agendamento-123' },
            body: { verificado_por: 'admin-123' }
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    });

    function buildSupabaseMock({ formularioData = { id: 'form-1' }, meetLink = null }: { formularioData?: any; meetLink?: string | null } = {}) {
        const mockEqAgUpdate = vi.fn().mockResolvedValue({ error: null });
        const mockUpdateAgendamento = vi.fn().mockReturnValue({ eq: mockEqAgUpdate });

        const mockSingleClientCheck = vi.fn().mockResolvedValue({ data: { status: 'LEAD' }, error: null });
        const mockEqClientUpdate = vi.fn().mockResolvedValue({ error: null });
        const mockUpdateClient = vi.fn().mockReturnValue({ eq: mockEqClientUpdate });

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'agendamentos') {
                return {
                    select: vi.fn().mockReturnThis(),
                    neq: vi.fn().mockReturnThis(),
                    in: vi.fn().mockReturnThis(),
                    gte: vi.fn().mockReturnThis(),
                    lt: vi.fn().mockResolvedValue({ data: [] }),
                    update: mockUpdateAgendamento,
                };
            }
            if (table === 'clientes') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnValue({ single: mockSingleClientCheck }),
                    update: mockUpdateClient
                };
            }
            if (table === 'formularios_cliente') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: formularioData })
                };
            }
        });
    }

    it('deve gerar Meet link quando formulario ja preenchido e pagamento aprovado', async () => {
        const mockAgendamento = {
            id: 'agendamento-123',
            comprovante_url: 'http://test.com/comprovante.jpg',
            pagamento_status: 'em_analise',
            cliente_id: 'cliente-123',
            email: 'test@example.com',
            nome: 'Test Client',
            telefone: '11999999999',
            data_hora: futureDate,
            duracao_minutos: 60,
            meet_link: null
        };

        (ComercialRepository.getAgendamentoById as any).mockResolvedValue(mockAgendamento);
        (ComercialRepository.updateAgendamentoStatus as any).mockResolvedValue(true);
        (ComercialRepository.updateMeetLink as any).mockResolvedValue(true);
        (ComposioService.createCalendarEvent as any).mockResolvedValue({
            success: true,
            eventLink: 'https://meet.google.com/xxx-yyy-zzz'
        });

        buildSupabaseMock({ formularioData: { id: 'form-1' } });

        await FinanceiroController.aprovarComprovante(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(ComercialRepository.updateAgendamentoStatus).toHaveBeenCalledWith('agendamento-123', 'confirmado');
        expect(ComposioService.createCalendarEvent).toHaveBeenCalledTimes(1);
        expect(ComercialRepository.updateMeetLink).toHaveBeenCalledWith(
            'agendamento-123',
            'https://meet.google.com/xxx-yyy-zzz'
        );
    });

    it('nao deve gerar Meet link se meet_link ja existir', async () => {
        const mockAgendamento = {
            id: 'agendamento-123',
            comprovante_url: 'http://test.com/comprovante.jpg',
            pagamento_status: 'em_analise',
            cliente_id: 'cliente-123',
            email: 'test@example.com',
            nome: 'Test Client',
            telefone: '11999999999',
            data_hora: futureDate,
            duracao_minutos: 60,
            meet_link: 'https://meet.google.com/existing'
        };

        (ComercialRepository.getAgendamentoById as any).mockResolvedValue(mockAgendamento);
        (ComercialRepository.updateAgendamentoStatus as any).mockResolvedValue(true);

        buildSupabaseMock({ formularioData: { id: 'form-1' } });

        await FinanceiroController.aprovarComprovante(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(ComercialRepository.updateAgendamentoStatus).toHaveBeenCalledWith('agendamento-123', 'confirmado');
        expect(ComposioService.createCalendarEvent).not.toHaveBeenCalled();
    });

    it('nao deve gerar Meet link quando formulario nao preenchido (fluxo normal de email)', async () => {
        const mockAgendamento = {
            id: 'agendamento-123',
            comprovante_url: 'http://test.com/comprovante.jpg',
            pagamento_status: 'em_analise',
            cliente_id: 'cliente-123',
            email: 'test@example.com',
            nome: 'Test Client',
            telefone: '11999999999',
            data_hora: futureDate,
            duracao_minutos: 60,
            meet_link: null
        };

        (ComercialRepository.getAgendamentoById as any).mockResolvedValue(mockAgendamento);
        (ComercialRepository.updateAgendamentoStatus as any).mockResolvedValue(true);

        buildSupabaseMock({ formularioData: null });

        await FinanceiroController.aprovarComprovante(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(ComercialRepository.updateAgendamentoStatus).toHaveBeenCalledWith('agendamento-123', 'agendado');
        expect(ComposioService.createCalendarEvent).not.toHaveBeenCalled();
        expect(EmailService.sendFormularioEmail).toHaveBeenCalledTimes(1);
    });
});
