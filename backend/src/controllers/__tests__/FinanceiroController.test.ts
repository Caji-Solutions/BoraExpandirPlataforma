import { vi, describe, it, expect, beforeEach } from 'vitest';
import FinanceiroController from '../FinanceiroController';
import ComercialRepository from '../../repositories/ComercialRepository';
import { supabase } from '../../config/SupabaseClient';
import EmailService from '../../services/EmailService';

vi.mock('../../repositories/ComercialRepository');
vi.mock('../../services/EmailService');
vi.mock('../../services/StripeService');
vi.mock('../../services/MercadoPagoService');
vi.mock('../../services/ComposioService');
vi.mock('../../services/NotificationService');

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
