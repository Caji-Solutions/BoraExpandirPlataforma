import { vi, describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import ContratoServicoRepository from '../../repositories/ContratoServicoRepository';
import WebhookController from '../WebhookController';

// Mock do repository
vi.mock('../../repositories/ContratoServicoRepository');

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
});
