import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import ContratoServicoRepository from '../../repositories/ContratoServicoRepository';
import WebhookController from '../WebhookController';
import NotificationService from '../../services/NotificationService';

// Mock do repository
vi.mock('../../repositories/ContratoServicoRepository');
vi.mock('../../services/NotificationService');

// Setup simplificado do app Express
const app = express();
app.use(express.json());
app.post('/api/webhooks/autentique', WebhookController.handleAutentiqueWebhook);

describe('WebhookController - Autentique', () => {

    const route = '/api/webhooks/autentique';
    const mockContratoId = 'contrato-123';
    const mockAutentiqueDocId = 'doc-autentique-abc';
    const mockSignedUrl = 'https://autentique.com/signed.pdf';

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.AUTENTIQUE_WEBHOOK_SECRETS = '';
        
        // Mock default behavior for finding contract
        (ContratoServicoRepository.findByAutentiqueDocumentId as any).mockResolvedValue({
            id: mockContratoId,
            autentique_document_id: mockAutentiqueDocId
        });
        
        // Mock default behavior for update
        (ContratoServicoRepository.updateAssinaturaStatus as any).mockResolvedValue(true);
    });

    it('Deve processar evento "document.finished" e aprovar o contrato', async () => {
        const payload = {
            event: {
                type: 'document.finished',
                data: {
                    object: {
                        id: mockAutentiqueDocId,
                        files: {
                            signed: mockSignedUrl
                        }
                    }
                }
            }
        };

        const res = await request(app)
            .post(route)
            .send(payload);

        // Webhook sempre retorna 200 rapidamente
        expect(res.status).toBe(200);
        expect(res.body.received).toBe(true);

        // Verifica se chamou os metodos corretos do DB (assincronamente no webhook)
        // Usamos um tempo pequeno de espera caso o app separe o fluxo, 
        // mas como no controller analisado ta sem await/promise timeout separado, 
        // ele executa antes do res.json terminar se nao usar setTimeout dentro do controller.
        // Porem, no controller analisado, o 'res.status(200).json()' e chamado ANTES do try/catch async,
        // entao precisamos garantir que a promise resolveu no teste. Para isso "pausamos" o test loop:
        await new Promise(process.nextTick);

        expect(ContratoServicoRepository.findByAutentiqueDocumentId).toHaveBeenCalledWith(mockAutentiqueDocId);
        expect(ContratoServicoRepository.updateAssinaturaStatus).toHaveBeenCalledWith(
            mockContratoId,
            'aprovado',
            mockSignedUrl
        );
    });

    it('Deve processar evento "signature.rejected" e recursar o contrato', async () => {
        const payload = {
            event: {
                type: 'signature.rejected',
                data: {
                    object: {
                        id: mockAutentiqueDocId
                    }
                }
            }
        };

        const res = await request(app).post(route).send(payload);

        expect(res.status).toBe(200);
        await new Promise(process.nextTick);

        expect(ContratoServicoRepository.findByAutentiqueDocumentId).toHaveBeenCalledWith(mockAutentiqueDocId);
        expect(ContratoServicoRepository.updateAssinaturaStatus).toHaveBeenCalledWith(
            mockContratoId,
            'recusado'
        );
    });

    it('Deve ignorar eventos desconhecidos/invalidos sem falhar', async () => {
        const payload = { event: { type: 'unknown.event', data: { object: { id: mockAutentiqueDocId } } } };

        const res = await request(app).post(route).send(payload);

        expect(res.status).toBe(200);
        await new Promise(process.nextTick);

        expect(ContratoServicoRepository.findByAutentiqueDocumentId).not.toHaveBeenCalled();
        expect(ContratoServicoRepository.updateAssinaturaStatus).not.toHaveBeenCalled();
    });

    it('Deve tolerar payload totalmente invalido (sem event.data)', async () => {
        const payload = { ping: 'pong' }; // Totally invalid payload

        const res = await request(app).post(route).send(payload);

        expect(res.status).toBe(200);
        await new Promise(process.nextTick);

        expect(ContratoServicoRepository.findByAutentiqueDocumentId).not.toHaveBeenCalled();
    });

    it('Deve tolerar falha se nao encontrar o contrato banco de dados', async () => {
        // Mock falhando ao buscar contrato
        (ContratoServicoRepository.findByAutentiqueDocumentId as any).mockResolvedValue(null);

        const payload = {
            event: {
                type: 'document.finished',
                data: {
                    object: {
                        id: 'non-existent-id'
                    }
                }
            }
        };

        const res = await request(app).post(route).send(payload);

        expect(res.status).toBe(200);
        await new Promise(process.nextTick);

        // Tenta buscar, mas como e nulo, nao deve tentar atualizar
        expect(ContratoServicoRepository.findByAutentiqueDocumentId).toHaveBeenCalledWith('non-existent-id');
        expect(ContratoServicoRepository.updateAssinaturaStatus).not.toHaveBeenCalled();
    });

    it('Deve processar evento "signature.viewed" e marcar visualizado', async () => {
        const payload = {
            event: {
                type: 'signature.viewed',
                data: { object: { id: mockAutentiqueDocId } }
            }
        };

        const res = await request(app).post(route).send(payload);

        expect(res.status).toBe(200);
        await new Promise(process.nextTick);

        expect(ContratoServicoRepository.findByAutentiqueDocumentId).toHaveBeenCalledWith(mockAutentiqueDocId);
        expect(ContratoServicoRepository.updateAssinaturaStatus).toHaveBeenCalledWith(
            mockContratoId,
            'visualizado'
        );
    });

    it('Deve processar evento "signature.delivery_failed" e notificar cliente', async () => {
        // Modifica mock para retornar cliente_id tambem
        (ContratoServicoRepository.findByAutentiqueDocumentId as any).mockResolvedValueOnce({
            id: mockContratoId,
            autentique_document_id: mockAutentiqueDocId,
            cliente_id: 'cliente-abc'
        });

        const payload = {
            event: {
                type: 'signature.delivery_failed',
                data: { object: { id: mockAutentiqueDocId } }
            }
        };

        const res = await request(app).post(route).send(payload);

        expect(res.status).toBe(200);
        await new Promise(process.nextTick);

        expect(ContratoServicoRepository.findByAutentiqueDocumentId).toHaveBeenCalledWith(mockAutentiqueDocId);
        expect(ContratoServicoRepository.updateAssinaturaStatus).toHaveBeenCalledWith(
            mockContratoId,
            'erro_envio'
        );
        expect(NotificationService.createNotification).toHaveBeenCalledWith(expect.objectContaining({
            clienteId: 'cliente-abc',
            tipo: 'error'
        }));
    });

    describe('Seguranca / Validacao de Secret', () => {
        beforeEach(() => {
            process.env.AUTENTIQUE_WEBHOOK_SECRETS = 'secret1, secret2';
        });

        afterEach(() => {
            process.env.AUTENTIQUE_WEBHOOK_SECRETS = '';
        });

        it('Deve bloquear requisicao sem token se secrets estiverem configurados', async () => {
            const res = await request(app).post(route).send({ event: { type: 'ping', data: { object: {} } } });
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Unauthorized');
        });

        it('Deve bloquear requisicao com token invalido', async () => {
            const res = await request(app)
                .post(route)
                .set('Authorization', 'Bearer wrong_secret')
                .send({ event: { type: 'ping', data: { object: {} } } });
            expect(res.status).toBe(401);
        });

        it('Deve autorizar requisicao com token valido no header Authorization', async () => {
            const res = await request(app)
                .post(route)
                .set('Authorization', 'Bearer secret1')
                .send({ event: { type: 'ping', data: { object: { id: 'x' } } } });
            expect(res.status).toBe(200);
        });

        it('Deve autorizar requisicao com token valido na query string', async () => {
            const res = await request(app)
                .post(`${route}?token=secret2`)
                .send({ event: { type: 'ping', data: { object: { id: 'x' } } } });
            expect(res.status).toBe(200);
        });
    });
});
