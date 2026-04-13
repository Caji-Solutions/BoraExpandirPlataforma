import { vi, describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../../config/SupabaseClient';

vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn()
    }
}));

vi.mock('../../services/ComposioService', () => ({
    default: {
        createCalendarEvent: vi.fn(),
        deleteCalendarEvent: vi.fn()
    }
}));

vi.mock('../../utils/calendarHelpers', () => ({
    getSuperAdminId: vi.fn().mockResolvedValue('super-admin-id')
}));

// Captura o callback do cron sem agendar execucao real
let cronCallback: (() => Promise<void>) | null = null;
vi.mock('node-cron', () => ({
    default: {
        schedule: vi.fn((_pattern: string, cb: () => Promise<void>) => {
            cronCallback = cb;
        })
    }
}));

// Importar startCronJobs depois dos mocks (vi.mock e hoisted, mas a atribuicao de cronCallback precisa acontecer ao importar)
async function loadAndRunCron() {
    // Re-importar para garantir que o mock ja esta no lugar
    const { startCronJobs } = await import('../cronJobs');
    startCronJobs();
    if (cronCallback) {
        await cronCallback();
    }
}

const pastDate = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 min atras (dentro da janela de 1h)

function buildSupabaseMock(agendamentos: any[], opts?: { formularioExiste?: boolean }) {
    let updateCalls: any[] = [];
    const formularioData = opts?.formularioExiste ? { id: 'form-mock' } : null;

    (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'agendamentos') {
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockResolvedValue({ data: agendamentos, error: null }),
                update: vi.fn().mockImplementation((data: any) => {
                    updateCalls.push(data);
                    return { eq: vi.fn().mockResolvedValue({ error: null }) };
                })
            };
        }
        if (table === 'formularios_cliente') {
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: formularioData, error: null })
                })
            };
        }
        return {};
    });

    return { getUpdateCalls: () => updateCalls };
}

describe('cronJobs - cancelamento automatico de agendamentos', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();
        cronCallback = null;
    });

    it('deve cancelar agendamento sem formulario com menos de 1h de antecedencia', async () => {
        const { getUpdateCalls } = buildSupabaseMock([{
            id: 'ag-001',
            status: 'agendado',
            cliente_is_user: false,
            data_hora: pastDate,
            meet_link: null,
            pagamento_status: 'pendente',
            observacoes: null
        }]);

        await loadAndRunCron();

        const updates = getUpdateCalls();
        expect(updates.length).toBeGreaterThan(0);
        expect(updates[0].status).toBe('cancelado');
    });

    it('deve poupar agendamento com formulario preenchido (cliente_is_user=true)', async () => {
        const { getUpdateCalls } = buildSupabaseMock([{
            id: 'ag-002',
            status: 'agendado',
            cliente_is_user: true,
            data_hora: pastDate,
            meet_link: null,
            pagamento_status: 'pendente',
            observacoes: null
        }], { formularioExiste: true });

        await loadAndRunCron();

        const updates = getUpdateCalls();
        expect(updates.length).toBe(0);
    });

    it('deve poupar agendamento com mais de 1h no futuro', async () => {
        const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
        const { getUpdateCalls } = buildSupabaseMock([{
            id: 'ag-003',
            status: 'agendado',
            cliente_is_user: false,
            data_hora: futureDate,
            meet_link: null,
            pagamento_status: 'pendente',
            observacoes: null
        }]);

        await loadAndRunCron();

        const updates = getUpdateCalls();
        expect(updates.length).toBe(0);
    });

    it('deve poupar agendamento com pagamento_status=aprovado mesmo sem formulario (Task 006)', async () => {
        const { getUpdateCalls } = buildSupabaseMock([{
            id: 'ag-005',
            status: 'agendado',
            cliente_is_user: false,
            data_hora: pastDate,
            meet_link: null,
            pagamento_status: 'aprovado',
            observacoes: null
        }]);

        await loadAndRunCron();

        const updates = getUpdateCalls();
        expect(updates.length).toBe(0);
    });

    it('deve logar intencao de deletar evento ao cancelar agendamento com meet_link', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        buildSupabaseMock([{
            id: 'ag-004',
            status: 'agendado',
            cliente_is_user: false,
            data_hora: pastDate,
            meet_link: 'https://meet.google.com/meet-link-xxx',
            pagamento_status: 'pendente',
            observacoes: null
        }]);

        await loadAndRunCron();

        const meetLogCalled = consoleSpy.mock.calls.some(args =>
            args.some(a => typeof a === 'string' && (a.includes('meet.google.com') || a.includes('meet_link')))
        );
        expect(meetLogCalled).toBe(true);

        consoleSpy.mockRestore();
    });
});
