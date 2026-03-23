import { vi, describe, it, expect, beforeEach } from 'vitest';
import CalendarController from '../CalendarController';
import composioService from '../../services/ComposioService';

vi.mock('../../services/ComposioService', () => ({
    default: {
        createCalendarEvent: vi.fn(),
        updateCalendarEvent: vi.fn(),
        deleteCalendarEvent: vi.fn(),
        getConnectionUrl: vi.fn(),
        getConnectionDetails: vi.fn(),
        disconnectCalendar: vi.fn()
    }
}));

function makeRes() {
    return {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        redirect: vi.fn(),
        send: vi.fn()
    };
}

// =============================================
// Task 003 / 005_UI / Composio - CalendarController
// =============================================

describe('CalendarController - createEvent validacoes', () => {
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        res = makeRes();
    });

    it('deve retornar 400 se campos obrigatorios faltarem', async () => {
        const req: any = { body: { userId: 'u1', summary: 'Test' } }; // faltando startTime e endTime
        await CalendarController.createEvent(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('deve retornar 400 se datas forem invalidas', async () => {
        const req: any = {
            body: {
                userId: 'u1',
                summary: 'Test',
                startTime: 'invalid-date',
                endTime: 'also-invalid'
            }
        };
        await CalendarController.createEvent(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.stringContaining('inválid') })
        );
    });

    it('deve retornar 400 se endTime for anterior a startTime', async () => {
        const now = new Date();
        const past = new Date(now.getTime() - 3600000);
        const req: any = {
            body: {
                userId: 'u1',
                summary: 'Test',
                startTime: now.toISOString(),
                endTime: past.toISOString()
            }
        };
        await CalendarController.createEvent(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.stringContaining('posterior') })
        );
    });

    it('deve chamar ComposioService e retornar 200 em caso de sucesso', async () => {
        const start = new Date(Date.now() + 3600000);
        const end = new Date(start.getTime() + 3600000);
        (composioService.createCalendarEvent as any).mockResolvedValue({
            success: true,
            eventId: 'ev-1',
            eventLink: 'https://meet.google.com/abc'
        });

        const req: any = {
            body: {
                userId: 'u1',
                summary: 'Consultoria',
                startTime: start.toISOString(),
                endTime: end.toISOString()
            }
        };
        await CalendarController.createEvent(req, res);
        expect(composioService.createCalendarEvent).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe('CalendarController - updateEvent validacoes', () => {
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        res = makeRes();
    });

    it('deve retornar 400 se userId ou eventId faltarem', async () => {
        const req: any = { params: {}, body: {} };
        await CalendarController.updateEvent(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar 400 se datas de update forem invalidas', async () => {
        const req: any = {
            params: { eventId: 'ev-1' },
            body: { userId: 'u1', startTime: 'bad', endTime: 'bad' }
        };
        await CalendarController.updateEvent(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve chamar ComposioService.updateCalendarEvent com dados corretos', async () => {
        const start = new Date(Date.now() + 3600000);
        const end = new Date(start.getTime() + 3600000);
        (composioService.updateCalendarEvent as any).mockResolvedValue({ success: true });

        const req: any = {
            params: { eventId: 'ev-1' },
            body: {
                userId: 'u1',
                summary: 'Updated',
                startTime: start.toISOString(),
                endTime: end.toISOString()
            }
        };
        await CalendarController.updateEvent(req, res);
        expect(composioService.updateCalendarEvent).toHaveBeenCalledWith('u1', 'ev-1', expect.objectContaining({
            summary: 'Updated'
        }));
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe('CalendarController - deleteEvent', () => {
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        res = makeRes();
    });

    it('deve retornar 400 se userId ou eventId faltarem', async () => {
        const req: any = { params: {}, query: {} };
        await CalendarController.deleteEvent(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve chamar ComposioService.deleteCalendarEvent e retornar sucesso', async () => {
        (composioService.deleteCalendarEvent as any).mockResolvedValue({ success: true });
        const req: any = { params: { eventId: 'ev-1' }, query: { userId: 'u1' } };
        await CalendarController.deleteEvent(req, res);
        expect(composioService.deleteCalendarEvent).toHaveBeenCalledWith('u1', 'ev-1');
        expect(res.status).toHaveBeenCalledWith(200);
    });
});

describe('CalendarController - getConnectionStatus (Task 005_UI)', () => {
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        res = makeRes();
    });

    it('deve retornar 400 se userId nao fornecido', async () => {
        const req: any = { query: {} };
        await CalendarController.getConnectionStatus(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve retornar isConnected=true quando conta esta conectada', async () => {
        (composioService.getConnectionDetails as any).mockResolvedValue({
            isConnected: true,
            account: { id: 'acc-1', provider: 'google' }
        });
        const req: any = { query: { userId: 'u1' } };
        await CalendarController.getConnectionStatus(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            isConnected: true,
            connection: expect.objectContaining({ id: 'acc-1' })
        }));
    });

    it('deve retornar isConnected=false quando conta nao esta conectada', async () => {
        (composioService.getConnectionDetails as any).mockResolvedValue({
            isConnected: false,
            account: null
        });
        const req: any = { query: { userId: 'u1' } };
        await CalendarController.getConnectionStatus(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            isConnected: false,
            connection: null
        }));
    });
});

describe('CalendarController - disconnect (Task 005_UI)', () => {
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        res = makeRes();
    });

    it('deve retornar 400 se userId nao fornecido', async () => {
        const req: any = { query: {} };
        await CalendarController.disconnect(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve desconectar com sucesso', async () => {
        (composioService.disconnectCalendar as any).mockResolvedValue(true);
        const req: any = { query: { userId: 'u1' } };
        await CalendarController.disconnect(req, res);
        expect(composioService.disconnectCalendar).toHaveBeenCalledWith('u1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: expect.stringContaining('sucesso')
        }));
    });

    it('deve retornar falha quando disconnectCalendar retorna false', async () => {
        (composioService.disconnectCalendar as any).mockResolvedValue(false);
        const req: any = { query: { userId: 'u1' } };
        await CalendarController.disconnect(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false
        }));
    });
});

describe('CalendarController - handleCallback (Task Composio)', () => {
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        res = makeRes();
    });

    it('deve renderizar pagina de sucesso quando status=success', async () => {
        const req: any = { query: { status: 'success', connected_account_id: 'acc-123' } };
        await CalendarController.handleCallback(req, res);
        expect(res.send).toHaveBeenCalledTimes(1);
        const html = res.send.mock.calls[0][0];
        expect(html).toContain('Conectado');
        expect(html).toContain('acc-123');
        expect(html).toContain('Fechar Aba');
        expect(html).toContain('Dashboard');
    });

    it('deve renderizar pagina de erro quando status != success', async () => {
        const req: any = { query: { status: 'failed' } };
        await CalendarController.handleCallback(req, res);
        expect(res.send).toHaveBeenCalledTimes(1);
        const html = res.send.mock.calls[0][0];
        expect(html).toContain('Erro');
        expect(html).toContain('Fechar Aba');
        expect(html).toContain('Dashboard');
    });
});

describe('CalendarController - getConnectionUrl', () => {
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        res = makeRes();
    });

    it('deve retornar 400 se userId nao fornecido', async () => {
        const req: any = { query: {} };
        await CalendarController.getConnectionUrl(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deve redirecionar para a URL de conexao', async () => {
        (composioService.getConnectionUrl as any).mockResolvedValue('https://composio.dev/auth/google?id=u1');
        const req: any = { query: { userId: 'u1' } };
        await CalendarController.getConnectionUrl(req, res);
        expect(res.redirect).toHaveBeenCalledWith('https://composio.dev/auth/google?id=u1');
    });
});
