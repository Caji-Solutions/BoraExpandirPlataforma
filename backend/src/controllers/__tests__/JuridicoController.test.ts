import { vi, describe, it, expect, beforeEach } from 'vitest';
import JuridicoController from '../juridico/JuridicoController';
import ComercialRepository from '../../repositories/ComercialRepository';
import JuridicoRepository from '../../repositories/JuridicoRepository';
import NotificationService from '../../services/NotificationService';
import { supabase } from '../../config/SupabaseClient';
import DNAService from '../../services/DNAService';

vi.mock('../../repositories/ComercialRepository');
vi.mock('../../services/NotificationService');
vi.mock('../../services/DNAService');
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

describe('JuridicoController - getRequerimentos', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve retornar lista de requerimentos com status 200', async () => {
        const mockRequerimentos = [
            { id: 'req-1', tipo: 'NIE', status: 'pendente' },
            { id: 'req-2', tipo: 'NIF', status: 'concluido' }
        ];
        (JuridicoRepository.getAllRequerimentos as any).mockResolvedValue(mockRequerimentos);

        const req: any = {};
        const res = makeRes();
        await JuridicoController.getRequerimentos(req, res);

        expect(JuridicoRepository.getAllRequerimentos).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: mockRequerimentos });
    });

    it('deve retornar 500 quando houver erro ao buscar requerimentos', async () => {
        (JuridicoRepository.getAllRequerimentos as any).mockRejectedValue(new Error('db error'));

        const req: any = {};
        const res = makeRes();
        await JuridicoController.getRequerimentos(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Erro ao buscar requerimentos'
        }));
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

// =============================================
// marcarConsultoriaEmAndamento
// =============================================

describe('JuridicoController - marcarConsultoriaEmAndamento', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve retornar 400 se id nao fornecido', async () => {
        const req: any = { params: {} };
        const res = makeRes();
        await JuridicoController.marcarConsultoriaEmAndamento(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 404 se agendamento nao encontrado', async () => {
        const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found', code: 'PGRST116' } });
        const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        (supabase.from as any).mockReturnValue({ select: mockSelect });

        const req: any = { params: { id: 'ag-999' } };
        const res = makeRes();
        await JuridicoController.marcarConsultoriaEmAndamento(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('deve atualizar stage do cliente para em_consultoria quando agendamento tem cliente_id', async () => {
        // Mock para buscar agendamento
        const mockSingle = vi.fn().mockResolvedValue({ data: { cliente_id: 'cli-1' }, error: null });
        const mockEqAg = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqAg });

        // Mock para update do clientes
        const mockEqCliente = vi.fn().mockResolvedValue({ error: null });
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqCliente });

        let agendamentosCallCount = 0;
        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'agendamentos') {
                agendamentosCallCount += 1;
                if (agendamentosCallCount === 1) {
                    return { select: mockSelect };
                }
                return {
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null })
                    })
                };
            }
            if (table === 'clientes') {
                return { update: mockUpdate };
            }
            return {};
        });

        const req: any = { params: { id: 'ag-1' } };
        const res = makeRes();
        await JuridicoController.marcarConsultoriaEmAndamento(req, res);

        expect(supabase.from).toHaveBeenCalledWith('agendamentos');
        expect(supabase.from).toHaveBeenCalledWith('clientes');
        expect(mockUpdate).toHaveBeenCalledWith({ stage: 'em_consultoria' });
        expect(mockEqCliente).toHaveBeenCalledWith('id', 'cli-1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('nao deve atualizar clientes se agendamento nao tem cliente_id', async () => {
        const mockSingle = vi.fn().mockResolvedValue({ data: { cliente_id: null }, error: null });
        const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        let agendamentosCallCount = 0;
        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'agendamentos') {
                agendamentosCallCount += 1;
                if (agendamentosCallCount === 1) {
                    return { select: mockSelect };
                }
                return {
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null })
                    })
                };
            }
            return {};
        });

        const req: any = { params: { id: 'ag-2' } };
        const res = makeRes();
        await JuridicoController.marcarConsultoriaEmAndamento(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(supabase.from).toHaveBeenCalledTimes(2);
    });
});

// =============================================
// marcarConsultoriaRealizada
// =============================================

describe('JuridicoController - marcarConsultoriaRealizada', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve retornar 400 se id nao fornecido', async () => {
        const req: any = { params: {}, body: {} };
        const res = makeRes();
        await JuridicoController.marcarConsultoriaRealizada(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve marcar agendamento como realizado e mover cliente para clientes_c2 via processo', async () => {
        const agendamentoData = {
            id: 'ag-1',
            cliente_id: 'cli-1',
            produto_nome: 'Consultoria Espanha',
            status: 'realizado'
        };

        const processoData = {
            id: 'proc-1',
            status: 'em_consultoria',
            tipo_servico: null
        };

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'agendamentos') {
                return {
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({ data: agendamentoData, error: null })
                            })
                        })
                    })
                };
            }
            if (table === 'processos') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockReturnValue({
                                    single: vi.fn().mockResolvedValue({ data: processoData, error: null })
                                })
                            })
                        })
                    }),
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null })
                    })
                };
            }
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
                update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
            };
        });

        (NotificationService.createNotification as any).mockResolvedValue(true);

        const req: any = { params: { id: 'ag-1' }, body: { vendedorId: 'vend-c2-1' } };
        const res = makeRes();
        await JuridicoController.marcarConsultoriaRealizada(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Consultoria finalizada com sucesso.' });
        expect(NotificationService.createNotification).toHaveBeenCalledWith(expect.objectContaining({
            clienteId: 'cli-1',
            titulo: 'Consultoria Realizada'
        }));
    });

    it('deve salvar vendedor C2 no DNA quando vendedorId fornecido', async () => {
        const agendamentoData = {
            id: 'ag-1',
            cliente_id: 'cli-1',
            produto_nome: 'Consultoria',
            status: 'realizado'
        };

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'agendamentos') {
                return {
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({ data: agendamentoData, error: null })
                            })
                        })
                    })
                };
            }
            if (table === 'usuarios') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { full_name: 'Vendedor C2 Teste' }, error: null })
                        })
                    })
                };
            }
            if (table === 'processos') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockReturnValue({
                                    single: vi.fn().mockResolvedValue({ data: { id: 'proc-1', status: 'ativo', tipo_servico: 'Consultoria' }, error: null })
                                })
                            })
                        })
                    }),
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null })
                    })
                };
            }
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
                update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
            };
        });

        (DNAService.mergeDNA as any).mockResolvedValue(true);
        (NotificationService.createNotification as any).mockResolvedValue(true);

        const req: any = { params: { id: 'ag-1' }, body: { vendedorId: 'vend-c2-1' } };
        const res = makeRes();
        await JuridicoController.marcarConsultoriaRealizada(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(DNAService.mergeDNA).toHaveBeenCalledWith(
            'cli-1',
            { vendedor_c2_id: 'vend-c2-1', vendedor_c2_nome: 'Vendedor C2 Teste' },
            'HIGH'
        );
    });

    it('deve fazer fallback para update direto em clientes quando nao ha processo', async () => {
        const agendamentoData = {
            id: 'ag-1',
            cliente_id: 'cli-1',
            produto_nome: 'Consultoria',
            status: 'realizado'
        };

        const mockClienteUpdate = vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
        });

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'agendamentos') {
                return {
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({ data: agendamentoData, error: null })
                            })
                        })
                    })
                };
            }
            if (table === 'processos') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            order: vi.fn().mockReturnValue({
                                limit: vi.fn().mockReturnValue({
                                    single: vi.fn().mockResolvedValue({ data: null, error: null })
                                })
                            })
                        })
                    })
                };
            }
            if (table === 'clientes') {
                return { update: mockClienteUpdate };
            }
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null })
            };
        });

        (NotificationService.createNotification as any).mockResolvedValue(true);

        const req: any = { params: { id: 'ag-1' }, body: { vendedorId: 'vend-c2-1' } };
        const res = makeRes();
        await JuridicoController.marcarConsultoriaRealizada(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockClienteUpdate).toHaveBeenCalledWith({ stage: 'clientes_c2' });
    });
});

// =============================================
// getUsuariosComerciaisC2
// =============================================

describe('JuridicoController - getUsuariosComerciaisC2', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve retornar lista de usuarios comerciais C2 ativos', async () => {
        const mockUsuarios = [
            { id: 'u-1', full_name: 'Ana Silva', email: 'ana@test.com', nivel: 'C2', cargo: 'C2' },
            { id: 'u-2', full_name: 'Bruno Costa', email: 'bruno@test.com', nivel: 'C2', cargo: 'C2' }
        ];

        const mockOrder = vi.fn().mockResolvedValue({ data: mockUsuarios, error: null });
        const mockEqStatus = vi.fn().mockReturnValue({ order: mockOrder });
        const mockEqNivel = vi.fn().mockReturnValue({ eq: mockEqStatus });
        const mockEqSetor = vi.fn().mockReturnValue({ eq: mockEqNivel });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSetor });
        (supabase.from as any).mockReturnValue({ select: mockSelect });

        const req: any = {};
        const res = makeRes();
        await JuridicoController.getUsuariosComerciaisC2(req, res);

        expect(supabase.from).toHaveBeenCalledWith('usuarios');
        expect(mockSelect).toHaveBeenCalledWith('id, full_name, email, nivel, cargo');
        expect(mockEqSetor).toHaveBeenCalledWith('setor', 'comercial');
        expect(mockEqNivel).toHaveBeenCalledWith('nivel', 'C2');
        expect(mockEqStatus).toHaveBeenCalledWith('status', 'active');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUsuarios);
    });

    it('deve retornar array vazio quando nao ha usuarios C2', async () => {
        const mockOrder = vi.fn().mockResolvedValue({ data: null, error: null });
        const mockEqStatus = vi.fn().mockReturnValue({ order: mockOrder });
        const mockEqNivel = vi.fn().mockReturnValue({ eq: mockEqStatus });
        const mockEqSetor = vi.fn().mockReturnValue({ eq: mockEqNivel });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSetor });
        (supabase.from as any).mockReturnValue({ select: mockSelect });

        const req: any = {};
        const res = makeRes();
        await JuridicoController.getUsuariosComerciaisC2(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('deve retornar 500 quando supabase retorna erro', async () => {
        const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } });
        const mockEqStatus = vi.fn().mockReturnValue({ order: mockOrder });
        const mockEqNivel = vi.fn().mockReturnValue({ eq: mockEqStatus });
        const mockEqSetor = vi.fn().mockReturnValue({ eq: mockEqNivel });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSetor });
        (supabase.from as any).mockReturnValue({ select: mockSelect });

        const req: any = {};
        const res = makeRes();
        await JuridicoController.getUsuariosComerciaisC2(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
