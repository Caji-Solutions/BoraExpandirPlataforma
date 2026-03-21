import { vi, describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import comercialRoutes from '../../routes/comercial';
import financeiroRoutes from '../../routes/financeiro';
import clienteRoutes from '../../routes/cliente';

import { supabase } from '../../config/SupabaseClient';
import ClienteRepository from '../../repositories/ClienteRepository';
import ComercialRepository from '../../repositories/ComercialRepository';
import EmailService from '../../services/EmailService';
import crypto from 'crypto';

// Setup Mocking
vi.mock('../../repositories/ClienteRepository');
vi.mock('../../repositories/ComercialRepository');
vi.mock('../../repositories/AdmRepository');
vi.mock('../../services/EmailService');
vi.mock('../../services/NotificationService');
vi.mock('../../services/StripeService');
vi.mock('../../services/MercadoPagoService');
vi.mock('../../services/ComposioService');

vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn()
    }
}));

const app = express();
app.use(express.json());
app.use('/api/comercial', comercialRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/cliente', clienteRoutes);

describe('Fluxo Integração: Lead -> Cliente', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Fluxo Completo: Criar Lead, Agendar, Aprovar e Virar Cliente', async () => {
        // --- 1. Criar Lead ---
        const leadId = crypto.randomUUID();
        const leadPayload = {
            nome: 'Lead Integracao',
            email: 'lead@test.com',
            whatsapp: '5511999999999'
        };

        const mockClienteRegistrado = {
            id: leadId,
            nome: leadPayload.nome,
            email: leadPayload.email,
            whatsapp: leadPayload.whatsapp,
            status: 'LEAD'
        };
        (ClienteRepository.register as any).mockResolvedValue(mockClienteRegistrado);

        const resLead = await request(app)
            .post('/api/cliente/register-lead')
            .send(leadPayload);

        expect(resLead.status).toBe(201);
        expect(resLead.body.status).toBe('LEAD');
        
        // --- 2. Simular Criação de Agendamento ---
        const agendamentoId = 'agenda-idx-123';
        const mockAgendamento = {
            id: agendamentoId,
            nome: leadPayload.nome,
            email: leadPayload.email,
            telefone: leadPayload.whatsapp,
            data_hora: new Date().toISOString(),
            produto_id: 'prod-123',
            cliente_id: leadId,
            pagamento_status: 'em_analise',
            comprovante_url: 'http://test.com/comprovante.pdf'
        };

        // --- 3. Financeiro Aprova Comprovante ---
        (ComercialRepository.getAgendamentoById as any).mockResolvedValue(mockAgendamento);
        (ComercialRepository.updateAgendamentoStatus as any).mockResolvedValue(true);
        
        const mockEqAgendamentoUpdate = vi.fn().mockResolvedValue({ error: null });
        const mockUpdateAgendamento = vi.fn().mockReturnValue({ eq: mockEqAgendamentoUpdate });

        const mockSingleClientCheck = vi.fn().mockResolvedValue({ data: { status: 'LEAD', email: leadPayload.email }, error: null });
        
        const mockEqClientUpdate = vi.fn().mockResolvedValue({ error: null });
        const mockUpdateClient = vi.fn().mockReturnValue({ eq: mockEqClientUpdate });

        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'agendamentos') {
                return {
                    update: mockUpdateAgendamento,
                    select: vi.fn().mockReturnThis(),
                    neq: vi.fn().mockReturnThis(),
                    in: vi.fn().mockReturnThis(),
                    gte: vi.fn().mockReturnThis(),
                    lt: vi.fn().mockResolvedValue({ data: [] })
                };
            }
            if (table === 'clientes') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn(() => ({ single: mockSingleClientCheck })),
                    update: mockUpdateClient,
                    maybeSingle: vi.fn().mockResolvedValue({ data: null })
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

        const resAprovar = await request(app)
            .post(`/api/financeiro/comprovante/${agendamentoId}/aprovar`)
            .send({ verificado_por: 'admin' });

        expect(resAprovar.status).toBe(200);
        expect(resAprovar.body.success).toBe(true);

        // Verifica se o DB Client Update foi chamado para alterar para 'cliente'
        expect(mockUpdateClient).toHaveBeenCalled();
        const updateArgs = mockUpdateClient.mock.calls[0][0];
        expect(updateArgs.status).toBe('cliente');

        // Verifica envio de email com o form.
        expect(EmailService.sendFormularioEmail).toHaveBeenCalledTimes(1);
    });
});
