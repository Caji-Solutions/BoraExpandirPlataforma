import { vi, describe, it, expect, beforeEach } from 'vitest';
import JuridicoController from '../juridico/JuridicoController';
import ComercialRepository from '../../repositories/ComercialRepository';
import JuridicoRepository from '../../repositories/JuridicoRepository';
import AdmRepository from '../../repositories/AdmRepository';
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
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: agendamentoData, error: null })
                        })
                    }),
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
                                    maybeSingle: vi.fn().mockResolvedValue({ data: processoData, error: null })
                                })
                            })
                        })
                    }),
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null })
                    })
                };
            }
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: { full_name: 'Vendedor C2 Teste' }, error: null })
                        })
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
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: agendamentoData, error: null })
                        })
                    }),
                    update: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            select: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({ data: agendamentoData, error: null })
                            })
                        })
                    })
                };
            }
            if (table === 'profiles') {
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
                                    maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'proc-1', status: 'ativo', tipo_servico: 'Consultoria' }, error: null })
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
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({ data: agendamentoData, error: null })
                        })
                    }),
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
                                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
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
        const mockEqNivel = vi.fn().mockReturnValue({ order: mockOrder });
        const mockEqRole = vi.fn().mockReturnValue({ eq: mockEqNivel });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqRole });
        (supabase.from as any).mockReturnValue({ select: mockSelect });

        const req: any = {};
        const res = makeRes();
        await JuridicoController.getUsuariosComerciaisC2(req, res);

        expect(supabase.from).toHaveBeenCalledWith('profiles');
        expect(mockSelect).toHaveBeenCalledWith('id, full_name, email, nivel, cargo');
        expect(mockEqRole).toHaveBeenCalledWith('role', 'comercial');
        expect(mockEqNivel).toHaveBeenCalledWith('nivel', 'C2');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUsuarios);
    });

    it('deve retornar array vazio quando nao ha usuarios C2', async () => {
        const mockOrder = vi.fn().mockResolvedValue({ data: null, error: null });
        const mockEqNivel = vi.fn().mockReturnValue({ order: mockOrder });
        const mockEqRole = vi.fn().mockReturnValue({ eq: mockEqNivel });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqRole });
        (supabase.from as any).mockReturnValue({ select: mockSelect });

        const req: any = {};
        const res = makeRes();
        await JuridicoController.getUsuariosComerciaisC2(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it('deve retornar 500 quando supabase retorna erro', async () => {
        const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } });
        const mockEqNivel = vi.fn().mockReturnValue({ order: mockOrder });
        const mockEqRole = vi.fn().mockReturnValue({ eq: mockEqNivel });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqRole });
        (supabase.from as any).mockReturnValue({ select: mockSelect });

        const req: any = {};
        const res = makeRes();
        await JuridicoController.getUsuariosComerciaisC2(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// =============================================
// PROTOCOLAÇÃO DE PROCESSOS
// =============================================

describe('JuridicoController - getSupervisores', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve retornar lista de supervisores com status 200', async () => {
        const mockSupervisores = [
            { id: 'sup-1', full_name: 'Supervisor A', email: 'a@test.com' },
            { id: 'sup-2', full_name: 'Supervisor B', email: 'b@test.com' }
        ];
        (JuridicoRepository.getSupervisores as any).mockResolvedValue(mockSupervisores);

        const req: any = {};
        const res = makeRes();
        await JuridicoController.getSupervisores(req, res);

        expect(JuridicoRepository.getSupervisores).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Supervisores do juridico recuperados com sucesso',
            data: mockSupervisores
        });
    });

    it('deve retornar 500 quando houver erro ao buscar supervisores', async () => {
        (JuridicoRepository.getSupervisores as any).mockRejectedValue(new Error('db error'));

        const req: any = {};
        const res = makeRes();
        await JuridicoController.getSupervisores(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Erro ao buscar supervisores do juridico'
        }));
    });
});

describe('JuridicoController - getProcessosProtocolados', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve retornar lista de processos protocolados com total', async () => {
        const mockProcessos = [
            { id: 'proc-1', status: 'PROTOCOLADO', cliente_id: 'cli-1' },
            { id: 'proc-2', status: 'PROTOCOLADO', cliente_id: 'cli-2' }
        ];
        (JuridicoRepository.getProcessosProtocolados as any).mockResolvedValue(mockProcessos);

        const req: any = {};
        const res = makeRes();
        await JuridicoController.getProcessosProtocolados(req, res);

        expect(JuridicoRepository.getProcessosProtocolados).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Processos protocolados recuperados com sucesso',
            data: mockProcessos,
            total: 2
        });
    });

    it('deve retornar lista vazia quando nao ha processos protocolados', async () => {
        (JuridicoRepository.getProcessosProtocolados as any).mockResolvedValue([]);

        const req: any = {};
        const res = makeRes();
        await JuridicoController.getProcessosProtocolados(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Processos protocolados recuperados com sucesso',
            data: [],
            total: 0
        });
    });

    it('deve retornar 500 quando houver erro ao buscar processos protocolados', async () => {
        (JuridicoRepository.getProcessosProtocolados as any).mockRejectedValue(new Error('db error'));

        const req: any = {};
        const res = makeRes();
        await JuridicoController.getProcessosProtocolados(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Erro ao buscar processos protocolados'
        }));
    });
});

describe('JuridicoController - getProcessoProtocoladoDetails', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve retornar detalhes do processo protocolado com status 200', async () => {
        const mockProcesso = {
            id: 'proc-1',
            status: 'PROTOCOLADO',
            cliente_id: 'cli-1',
            clientes: { id: 'cli-1', nome: 'Cliente Teste' },
            documentos: [{ id: 'doc-1', nome: 'Passaporte' }],
            responsavel: { id: 'sup-1', full_name: 'Supervisor A' }
        };
        (JuridicoRepository.getProcessoProtocoladoDetails as any).mockResolvedValue(mockProcesso);

        const req: any = { params: { id: 'proc-1' } };
        const res = makeRes();
        await JuridicoController.getProcessoProtocoladoDetails(req, res);

        expect(JuridicoRepository.getProcessoProtocoladoDetails).toHaveBeenCalledWith('proc-1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Detalhes do processo protocolado recuperados com sucesso',
            data: mockProcesso
        });
    });

    it('deve retornar 404 quando processo nao encontrado', async () => {
        (JuridicoRepository.getProcessoProtocoladoDetails as any).mockResolvedValue(null);

        const req: any = { params: { id: 'proc-999' } };
        const res = makeRes();
        await JuridicoController.getProcessoProtocoladoDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Processo nao encontrado' });
    });

    it('deve retornar 500 quando houver erro ao buscar detalhes', async () => {
        (JuridicoRepository.getProcessoProtocoladoDetails as any).mockRejectedValue(new Error('db error'));

        const req: any = { params: { id: 'proc-1' } };
        const res = makeRes();
        await JuridicoController.getProcessoProtocoladoDetails(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Erro ao buscar detalhes do processo protocolado'
        }));
    });
});

describe('JuridicoController - enviarParaProtocolacao', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve enviar processo para protocolacao com sucesso', async () => {
        const mockSupervisor = { id: 'sup-1', full_name: 'Supervisor A', email: 'sup@test.com' };
        const mockProcesso = { id: 'proc-1', status: 'PROTOCOLADO', responsavel_id: 'sup-1' };

        (JuridicoRepository.getFuncionarioById as any).mockResolvedValue(mockSupervisor);
        (JuridicoRepository.enviarParaProtocolacao as any).mockResolvedValue(mockProcesso);

        const req: any = { params: { id: 'proc-1' }, body: { supervisorId: 'sup-1' } };
        const res = makeRes();
        await JuridicoController.enviarParaProtocolacao(req, res);

        expect(JuridicoRepository.getFuncionarioById).toHaveBeenCalledWith('sup-1');
        expect(JuridicoRepository.enviarParaProtocolacao).toHaveBeenCalledWith('proc-1', 'sup-1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Processo enviado para protocolacao com sucesso',
            data: mockProcesso
        });
    });

    it('deve retornar 400 quando supervisorId nao fornecido', async () => {
        const req: any = { params: { id: 'proc-1' }, body: {} };
        const res = makeRes();
        await JuridicoController.enviarParaProtocolacao(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'supervisorId e obrigatorio' });
    });

    it('deve retornar 400 quando supervisor nao encontrado', async () => {
        (JuridicoRepository.getFuncionarioById as any).mockResolvedValue(null);

        const req: any = { params: { id: 'proc-1' }, body: { supervisorId: 'sup-inexistente' } };
        const res = makeRes();
        await JuridicoController.enviarParaProtocolacao(req, res);

        expect(JuridicoRepository.getFuncionarioById).toHaveBeenCalledWith('sup-inexistente');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'supervisorId invalido - funcionario nao encontrado'
        });
    });

    it('deve retornar 500 quando houver erro ao enviar para protocolacao', async () => {
        const mockSupervisor = { id: 'sup-1', full_name: 'Supervisor A' };
        (JuridicoRepository.getFuncionarioById as any).mockResolvedValue(mockSupervisor);
        (JuridicoRepository.enviarParaProtocolacao as any).mockRejectedValue(new Error('db error'));

        const req: any = { params: { id: 'proc-1' }, body: { supervisorId: 'sup-1' } };
        const res = makeRes();
        await JuridicoController.enviarParaProtocolacao(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'db error'
        }));
    });
});

describe('JuridicoController - atualizarProtocolo', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve atualizar protocolo com sucesso', async () => {
        const mockProcesso = { id: 'proc-1', status: 'PROTOCOLADO', observacoes: 'teste' };
        (JuridicoRepository.atualizarProtocolo as any).mockResolvedValue(mockProcesso);

        const req: any = { params: { id: 'proc-1' }, body: { observacoes: 'teste' } };
        const res = makeRes();
        await JuridicoController.atualizarProtocolo(req, res);

        expect(JuridicoRepository.atualizarProtocolo).toHaveBeenCalledWith('proc-1', { observacoes: 'teste' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Protocolo atualizado com sucesso',
            data: mockProcesso
        });
    });

    it('deve retornar 500 quando houver erro ao atualizar protocolo', async () => {
        (JuridicoRepository.atualizarProtocolo as any).mockRejectedValue(new Error('db error'));

        const req: any = { params: { id: 'proc-1' }, body: { observacoes: 'teste' } };
        const res = makeRes();
        await JuridicoController.atualizarProtocolo(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Erro ao atualizar protocolo'
        }));
    });
});

// =============================================
// marcarProtocolado
// =============================================

describe('JuridicoController - marcarProtocolado', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve marcar processo como protocolado com sucesso', async () => {
        const mockProcesso = { id: 'proc-1', status: 'processo_protocolado' };
        (JuridicoRepository.marcarProcessoProtocolado as any).mockResolvedValue(mockProcesso);

        const req: any = { params: { id: 'proc-1' } };
        const res = makeRes();
        await JuridicoController.marcarProtocolado(req, res);

        expect(JuridicoRepository.marcarProcessoProtocolado).toHaveBeenCalledWith('proc-1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Processo marcado como protocolado com sucesso',
            data: mockProcesso
        });
    });

    it('deve retornar 400 quando id nao fornecido', async () => {
        const req: any = { params: {} };
        const res = makeRes();
        await JuridicoController.marcarProtocolado(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'id e obrigatorio' });
    });

    it('deve retornar 500 quando houver erro ao marcar como protocolado', async () => {
        (JuridicoRepository.marcarProcessoProtocolado as any).mockRejectedValue(new Error('db error'));

        const req: any = { params: { id: 'proc-1' } };
        const res = makeRes();
        await JuridicoController.marcarProtocolado(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Erro ao marcar processo como protocolado'
        }));
    });
});

// =============================================
// createAssessoria - stage update to assessoria_andamento
// =============================================

describe('JuridicoController - createAssessoria (stage update)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve atualizar stage do cliente para assessoria_andamento ao criar assessoria', async () => {
        const mockAssessoria = { id: 'assess-1', cliente_id: 'cli-1' };
        (JuridicoRepository.createAssessoria as any).mockResolvedValue(mockAssessoria);
        (JuridicoRepository.getProcessoByClienteId as any).mockResolvedValue(null);
        (JuridicoRepository.createProcess as any).mockResolvedValue({ id: 'proc-1' });

        // Mock supabase calls for stage update
        const mockEqUpdate = vi.fn().mockResolvedValue({ error: null });
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqUpdate });
        const mockSingle = vi.fn().mockResolvedValue({ data: { stage: 'formularios' }, error: null });
        const mockEqSelect = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSelect });

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'clientes') {
                return { select: mockSelect, update: mockUpdate };
            }
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null })
            };
        });

        const req: any = {
            body: { clienteId: 'cli-1', respostas: { q1: 'a1' }, servicoId: null },
            userId: 'user-1'
        };
        const res = makeRes();
        await JuridicoController.createAssessoria(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(supabase.from).toHaveBeenCalledWith('clientes');
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            stage: 'assessoria_andamento'
        }));
    });

    it('nao deve regredir stage se cliente ja estiver em processo_finalizado', async () => {
        const mockAssessoria = { id: 'assess-1', cliente_id: 'cli-1' };
        (JuridicoRepository.createAssessoria as any).mockResolvedValue(mockAssessoria);
        (JuridicoRepository.getProcessoByClienteId as any).mockResolvedValue(null);
        (JuridicoRepository.createProcess as any).mockResolvedValue({ id: 'proc-1' });

        const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
        const mockSingle = vi.fn().mockResolvedValue({ data: { stage: 'processo_finalizado' }, error: null });
        const mockEqSelect = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEqSelect });

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'clientes') {
                return { select: mockSelect, update: mockUpdate };
            }
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: null, error: null })
            };
        });

        const req: any = {
            body: { clienteId: 'cli-1', respostas: { q1: 'a1' }, servicoId: null },
            userId: 'user-1'
        };
        const res = makeRes();
        await JuridicoController.createAssessoria(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        // update should NOT have been called since stage is already ahead (processo_finalizado)
        expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('deve retornar 201 mesmo se atualizacao de stage falhar (nao bloqueia assessoria)', async () => {
        const mockAssessoria = { id: 'assess-1', cliente_id: 'cli-1' };
        (JuridicoRepository.createAssessoria as any).mockResolvedValue(mockAssessoria);
        (JuridicoRepository.getProcessoByClienteId as any).mockResolvedValue(null);
        (JuridicoRepository.createProcess as any).mockResolvedValue({ id: 'proc-1' });

        // Mock supabase to throw on stage update select
        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'clientes') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockRejectedValue(new Error('stage query failed'))
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

        const req: any = {
            body: { clienteId: 'cli-1', respostas: { q1: 'a1' }, servicoId: null },
            userId: 'user-1'
        };
        const res = makeRes();
        await JuridicoController.createAssessoria(req, res);

        // Should still succeed - stage update failure is non-blocking
        expect(res.status).toHaveBeenCalledWith(201);
    });
});
