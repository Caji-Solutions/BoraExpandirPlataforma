import { vi, describe, it, expect, beforeEach } from 'vitest';
import ClienteController from '../ClienteController';
import { supabase } from '../../config/SupabaseClient';

vi.mock('../../repositories/ClienteRepository');
vi.mock('../../repositories/JuridicoRepository');
vi.mock('../../repositories/AdmRepository');
vi.mock('../../repositories/ContratoServicoRepository');
vi.mock('../../services/NotificationService');
vi.mock('../../config/documentosConfig', () => ({
    getDocumentosPorTipoServico: vi.fn(),
    DocumentoRequeridoConfig: {}
}));
vi.mock('../../utils/normalizers', () => ({
    normalizeCpf: vi.fn((v: string) => v),
    normalizePhone: vi.fn((v: string) => v)
}));
vi.mock('bcryptjs', () => ({
    default: { genSalt: vi.fn(), hash: vi.fn() },
    genSalt: vi.fn(),
    hash: vi.fn()
}));

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
// Save Timezone - ClienteController.saveTimezone
// =============================================

describe('ClienteController - saveTimezone', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve retornar 400 se clienteId nao fornecido', async () => {
        const req: any = { body: { timezone: 'America/Sao_Paulo' } };
        const res = makeRes();
        await ClienteController.saveTimezone(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 400 se timezone nao fornecido', async () => {
        const req: any = { body: { clienteId: 'cli-1' } };
        const res = makeRes();
        await ClienteController.saveTimezone(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve criar perfil_unificado quando nao existe (insert)', async () => {
        // select().eq().single() retorna erro (perfil nao existe)
        const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
        const mockEqSelect = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSelect });

        // insert retorna sucesso
        const mockInsert = vi.fn().mockResolvedValue({ error: null });

        (supabase.from as any).mockReturnValue({
            select: mockSelect,
            insert: mockInsert
        });

        const req: any = { body: { clienteId: 'cli-1', timezone: 'Europe/Madrid' } };
        const res = makeRes();
        await ClienteController.saveTimezone(req, res);

        expect(mockInsert).toHaveBeenCalledWith([{
            cliente_id: 'cli-1',
            data: { timezone_preference: 'Europe/Madrid' }
        }]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, timezone: 'Europe/Madrid' });
    });

    it('deve atualizar perfil_unificado existente preservando dados anteriores (update)', async () => {
        const existingData = { nome_completo: 'Joao Silva', telefone: '5511999' };

        // select().eq().single() retorna perfil existente
        const mockSingle = vi.fn().mockResolvedValue({
            data: { data: existingData },
            error: null
        });
        const mockEqSelect = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSelect });

        // update().eq() retorna sucesso
        const mockEqUpdate = vi.fn().mockResolvedValue({ error: null });
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

        (supabase.from as any).mockReturnValue({
            select: mockSelect,
            update: mockUpdate
        });

        const req: any = { body: { clienteId: 'cli-2', timezone: 'America/Sao_Paulo' } };
        const res = makeRes();
        await ClienteController.saveTimezone(req, res);

        expect(mockUpdate).toHaveBeenCalledWith({
            data: {
                nome_completo: 'Joao Silva',
                telefone: '5511999',
                timezone_preference: 'America/Sao_Paulo'
            }
        });
        expect(mockEqUpdate).toHaveBeenCalledWith('cliente_id', 'cli-2');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, timezone: 'America/Sao_Paulo' });
    });

    it('deve retornar 500 se insert falhar', async () => {
        const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
        const mockEqSelect = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSelect });

        const mockInsert = vi.fn().mockResolvedValue({ error: { message: 'insert failed' } });

        (supabase.from as any).mockReturnValue({
            select: mockSelect,
            insert: mockInsert
        });

        const req: any = { body: { clienteId: 'cli-3', timezone: 'Europe/Lisbon' } };
        const res = makeRes();
        await ClienteController.saveTimezone(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('deve retornar 500 se update falhar', async () => {
        const mockSingle = vi.fn().mockResolvedValue({
            data: { data: { existing: 'value' } },
            error: null
        });
        const mockEqSelect = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSelect });

        const mockEqUpdate = vi.fn().mockResolvedValue({ error: { message: 'update failed' } });
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

        (supabase.from as any).mockReturnValue({
            select: mockSelect,
            update: mockUpdate
        });

        const req: any = { body: { clienteId: 'cli-4', timezone: 'UTC' } };
        const res = makeRes();
        await ClienteController.saveTimezone(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('deve preservar data existente como objeto vazio quando perfil.data e null', async () => {
        const mockSingle = vi.fn().mockResolvedValue({
            data: { data: null },
            error: null
        });
        const mockEqSelect = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSelect });

        const mockEqUpdate = vi.fn().mockResolvedValue({ error: null });
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });

        (supabase.from as any).mockReturnValue({
            select: mockSelect,
            update: mockUpdate
        });

        const req: any = { body: { clienteId: 'cli-5', timezone: 'America/Buenos_Aires' } };
        const res = makeRes();
        await ClienteController.saveTimezone(req, res);

        expect(mockUpdate).toHaveBeenCalledWith({
            data: { timezone_preference: 'America/Buenos_Aires' }
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
