import { vi, describe, it, expect, beforeEach } from 'vitest';
import JuridicoController from '../JuridicoController';
import ComercialRepository from '../../repositories/ComercialRepository';
import NotificationService from '../../services/NotificationService';
import { supabase } from '../../config/SupabaseClient';

vi.mock('../../repositories/ComercialRepository');
vi.mock('../../services/NotificationService');
vi.mock('../../repositories/JuridicoRepository');
vi.mock('../../repositories/AdmRepository');

vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn()
    }
}));

function makeRes() {
    return {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    };
}

// =============================================
// Task 005 - verificarFormularioPreenchido
// =============================================

describe('JuridicoController - verificarFormularioPreenchido', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve retornar 400 se clienteId nao fornecido', async () => {
        const req: any = { params: {} };
        const res = makeRes();
        await JuridicoController.verificarFormularioPreenchido(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar preenchido=true quando formulario existe', async () => {
        const mockLimit = vi.fn().mockResolvedValue({ data: [{ id: 'form-1' }], error: null });
        const mockNot = vi.fn().mockReturnValue({ limit: mockLimit });
        const mockEq = vi.fn().mockReturnValue({ not: mockNot });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        (supabase.from as any).mockReturnValue({ select: mockSelect });

        const req: any = { params: { clienteId: 'cli-1' } };
        const res = makeRes();
        await JuridicoController.verificarFormularioPreenchido(req, res);

        expect(supabase.from).toHaveBeenCalledWith('formularios_cliente');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ preenchido: true });
    });

    it('deve retornar preenchido=false quando formulario nao existe', async () => {
        const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
        const mockNot = vi.fn().mockReturnValue({ limit: mockLimit });
        const mockEq = vi.fn().mockReturnValue({ not: mockNot });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        (supabase.from as any).mockReturnValue({ select: mockSelect });

        const req: any = { params: { clienteId: 'cli-2' } };
        const res = makeRes();
        await JuridicoController.verificarFormularioPreenchido(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ preenchido: false });
    });

    it('deve retornar 500 quando supabase retorna erro', async () => {
        const mockLimit = vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } });
        const mockNot = vi.fn().mockReturnValue({ limit: mockLimit });
        const mockEq = vi.fn().mockReturnValue({ not: mockNot });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        (supabase.from as any).mockReturnValue({ select: mockSelect });

        const req: any = { params: { clienteId: 'cli-3' } };
        const res = makeRes();
        await JuridicoController.verificarFormularioPreenchido(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// =============================================
// Task 005 - pedidoReagendamento
// =============================================

describe('JuridicoController - pedidoReagendamento', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve retornar 400 se agendamentoId ou mensagem faltarem', async () => {
        const req: any = { body: { agendamentoId: 'ag-1' } }; // falta mensagem
        const res = makeRes();
        await JuridicoController.pedidoReagendamento(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 404 se agendamento nao encontrado', async () => {
        (ComercialRepository.getAgendamentoById as any).mockResolvedValue(null);
        const req: any = { body: { agendamentoId: 'ag-999', mensagem: 'Preciso reagendar' } };
        const res = makeRes();
        await JuridicoController.pedidoReagendamento(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deve atualizar status para reagendar e criar notificacao', async () => {
        (ComercialRepository.getAgendamentoById as any).mockResolvedValue({
            id: 'ag-1',
            cliente_id: 'cli-1',
            status: 'confirmado'
        });

        const mockEq = vi.fn().mockResolvedValue({ error: null });
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
        (supabase.from as any).mockReturnValue({ update: mockUpdate });
        (NotificationService.createNotification as any).mockResolvedValue(true);

        const req: any = { body: { agendamentoId: 'ag-1', mensagem: 'Preciso reagendar por motivo X' } };
        const res = makeRes();
        await JuridicoController.pedidoReagendamento(req, res);

        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            pedido_reagendamento: true,
            mensagem_reagendamento: 'Preciso reagendar por motivo X',
            status: 'reagendar'
        }));
        expect(mockEq).toHaveBeenCalledWith('id', 'ag-1');
        expect(NotificationService.createNotification).toHaveBeenCalledWith(expect.objectContaining({
            clienteId: 'cli-1',
            titulo: 'Pedido de Reagendamento'
        }));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('nao deve criar notificacao se agendamento nao tem cliente_id', async () => {
        (ComercialRepository.getAgendamentoById as any).mockResolvedValue({
            id: 'ag-2',
            cliente_id: null,
            status: 'agendado'
        });

        const mockEq = vi.fn().mockResolvedValue({ error: null });
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
        (supabase.from as any).mockReturnValue({ update: mockUpdate });

        const req: any = { body: { agendamentoId: 'ag-2', mensagem: 'Reagendar' } };
        const res = makeRes();
        await JuridicoController.pedidoReagendamento(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(NotificationService.createNotification).not.toHaveBeenCalled();
    });

    it('deve retornar 500 quando update falha', async () => {
        (ComercialRepository.getAgendamentoById as any).mockResolvedValue({
            id: 'ag-3',
            cliente_id: 'cli-3',
            status: 'agendado'
        });

        const mockEq = vi.fn().mockResolvedValue({ error: { message: 'constraint error' } });
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
        (supabase.from as any).mockReturnValue({ update: mockUpdate });

        const req: any = { body: { agendamentoId: 'ag-3', mensagem: 'Reagendar urgente' } };
        const res = makeRes();
        await JuridicoController.pedidoReagendamento(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
