import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import ContratoServicoRepository from '../../repositories/ContratoServicoRepository';
import WebhookController from '../WebhookController';
import NotificationService from '../../services/NotificationService';
import DNAService from '../../services/DNAService';
import AutentiqueService from '../../services/AutentiqueService';

// Mock dependencies
vi.mock('../../repositories/ContratoServicoRepository');
vi.mock('../../services/NotificationService');
vi.mock('../../services/DNAService');
vi.mock('../../services/AutentiqueService');

// Mock EmailService (dynamic import in controller)
const mockSendEmail = vi.fn().mockResolvedValue(true);
vi.mock('../../services/EmailService', () => ({
    default: { sendEmail: mockSendEmail }
}));

// Mock supabase (used for profile lookup when sending email to comercial)
vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: { full_name: 'Comercial Teste', email: 'comercial@test.com' },
                error: null
            })
        })
    }
}));

// Setup Express app
const app = express();
app.use(express.json());
app.post('/api/webhooks/autentique', WebhookController.handleAutentiqueWebhook);

describe('WebhookController - Autentique', () => {

    const route = '/api/webhooks/autentique';
    const mockContratoId = 'contrato-123';
    const mockAutentiqueDocId = 'doc-autentique-abc';
    const mockSignedUrl = 'https://autentique.com/signed.pdf';
    const mockClienteId = 'cliente-456';
    const mockUsuarioId = 'usuario-789';

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.AUTENTIQUE_WEBHOOK_SECRETS = '';

        // Default: contrato com cliente_id e usuario_id (para testar DNA merge, notificacao, email)
        (ContratoServicoRepository.findByAutentiqueDocumentId as any).mockResolvedValue({
            id: mockContratoId,
            autentique_document_id: mockAutentiqueDocId,
            cliente_id: mockClienteId,
            usuario_id: mockUsuarioId,
            cliente_nome: 'Cliente Teste',
            servico_nome: 'Assessoria'
        });

        (ContratoServicoRepository.updateAssinaturaStatus as any).mockResolvedValue(true);
        (DNAService.mergeDNA as any).mockResolvedValue(true);
        (NotificationService.createNotification as any).mockResolvedValue(true);
    });

    // =============================================
    // Novo formato de payload (2026-03-26):
    //   document.finished  -> event.data = { id: docId, files: { signed: url } }
    //   signature.*        -> event.data = { document: docId }
    // Antigo (removido): event.data.object.id
    // =============================================

    describe('document.finished', () => {
        it('Deve aprovar contrato com URL assinada do payload', async () => {
            const payload = {
                event: {
                    type: 'document.finished',
                    data: {
                        id: mockAutentiqueDocId,
                        files: { signed: mockSignedUrl }
                    }
                }
            };

            const res = await request(app).post(route).send(payload);
            expect(res.status).toBe(200);
            expect(res.body.received).toBe(true);

            await new Promise(process.nextTick);

            expect(ContratoServicoRepository.findByAutentiqueDocumentId).toHaveBeenCalledWith(mockAutentiqueDocId);
            expect(ContratoServicoRepository.updateAssinaturaStatus).toHaveBeenCalledWith(
                mockContratoId, 'aprovado', mockSignedUrl
            );
        });

        it('Deve fazer merge no DNA do cliente com dados do contrato assinado', async () => {
            const payload = {
                event: {
                    type: 'document.finished',
                    data: { id: mockAutentiqueDocId, files: { signed: mockSignedUrl } }
                }
            };

            await request(app).post(route).send(payload);
            await new Promise(process.nextTick);

            expect(DNAService.mergeDNA).toHaveBeenCalledWith(
                mockClienteId,
                expect.objectContaining({
                    contrato_assinado_url: mockSignedUrl,
                    contrato_id: mockContratoId,
                    contrato_servico_nome: 'Assessoria'
                }),
                'HIGH'
            );
        });

        it('Deve criar notificacao de sucesso para o cliente no portal', async () => {
            const payload = {
                event: {
                    type: 'document.finished',
                    data: { id: mockAutentiqueDocId, files: { signed: mockSignedUrl } }
                }
            };

            await request(app).post(route).send(payload);
            await new Promise(process.nextTick);

            expect(NotificationService.createNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    clienteId: mockClienteId,
                    tipo: 'success'
                })
            );
        });

        it('Deve enviar email ao comercial responsavel pelo contrato', async () => {
            const payload = {
                event: {
                    type: 'document.finished',
                    data: { id: mockAutentiqueDocId, files: { signed: mockSignedUrl } }
                }
            };

            await request(app).post(route).send(payload);
            await new Promise(process.nextTick);

            expect(mockSendEmail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'comercial@test.com',
                    subject: 'Contrato assinado pelo cliente'
                })
            );
        });

        it('Deve buscar URL assinada via API Autentique quando nao vem no payload (fallback)', async () => {
            (AutentiqueService.getDocument as any).mockResolvedValue({
                files: { signed: 'https://autentique.com/fallback-signed.pdf' }
            });

            const payload = {
                event: {
                    type: 'document.finished',
                    data: { id: mockAutentiqueDocId } // Sem files.signed
                }
            };

            await request(app).post(route).send(payload);
            await new Promise(process.nextTick);

            expect(AutentiqueService.getDocument).toHaveBeenCalledWith(mockAutentiqueDocId);
            expect(ContratoServicoRepository.updateAssinaturaStatus).toHaveBeenCalledWith(
                mockContratoId, 'aprovado', 'https://autentique.com/fallback-signed.pdf'
            );
        });

        it('Deve tolerar falha do fallback API sem quebrar o fluxo', async () => {
            (AutentiqueService.getDocument as any).mockRejectedValue(new Error('API error'));

            const payload = {
                event: {
                    type: 'document.finished',
                    data: { id: mockAutentiqueDocId } // Sem files.signed
                }
            };

            await request(app).post(route).send(payload);
            await new Promise(process.nextTick);

            // Mesmo com fallback falhando, deve continuar o fluxo com URL null
            expect(ContratoServicoRepository.updateAssinaturaStatus).toHaveBeenCalledWith(
                mockContratoId, 'aprovado', null
            );
        });

        it('Nao deve chamar DNA/notificacao se contrato nao tem cliente_id', async () => {
            (ContratoServicoRepository.findByAutentiqueDocumentId as any).mockResolvedValue({
                id: mockContratoId,
                autentique_document_id: mockAutentiqueDocId,
                cliente_id: null,
                usuario_id: null
            });

            const payload = {
                event: {
                    type: 'document.finished',
                    data: { id: mockAutentiqueDocId, files: { signed: mockSignedUrl } }
                }
            };

            await request(app).post(route).send(payload);
            await new Promise(process.nextTick);

            expect(ContratoServicoRepository.updateAssinaturaStatus).toHaveBeenCalled();
            expect(DNAService.mergeDNA).not.toHaveBeenCalled();
            expect(NotificationService.createNotification).not.toHaveBeenCalled();
            expect(mockSendEmail).not.toHaveBeenCalled();
        });
    });

    describe('signature.rejected', () => {
        it('Deve recusar contrato usando eventData.document como docId', async () => {
            const payload = {
                event: {
                    type: 'signature.rejected',
                    data: { document: mockAutentiqueDocId }
                }
            };

            const res = await request(app).post(route).send(payload);
            expect(res.status).toBe(200);
            await new Promise(process.nextTick);

            expect(ContratoServicoRepository.findByAutentiqueDocumentId).toHaveBeenCalledWith(mockAutentiqueDocId);
            expect(ContratoServicoRepository.updateAssinaturaStatus).toHaveBeenCalledWith(
                mockContratoId, 'recusado'
            );
        });
    });

    describe('signature.viewed', () => {
        it('Deve marcar contrato como visualizado', async () => {
            const payload = {
                event: {
                    type: 'signature.viewed',
                    data: { document: mockAutentiqueDocId }
                }
            };

            const res = await request(app).post(route).send(payload);
            expect(res.status).toBe(200);
            await new Promise(process.nextTick);

            expect(ContratoServicoRepository.updateAssinaturaStatus).toHaveBeenCalledWith(
                mockContratoId, 'visualizado'
            );
        });
    });

    describe('signature.delivery_failed', () => {
        it('Deve marcar erro_envio e notificar cliente', async () => {
            (ContratoServicoRepository.findByAutentiqueDocumentId as any).mockResolvedValueOnce({
                id: mockContratoId,
                autentique_document_id: mockAutentiqueDocId,
                cliente_id: mockClienteId
            });

            const payload = {
                event: {
                    type: 'signature.delivery_failed',
                    data: { document: mockAutentiqueDocId }
                }
            };

            const res = await request(app).post(route).send(payload);
            expect(res.status).toBe(200);
            await new Promise(process.nextTick);

            expect(ContratoServicoRepository.updateAssinaturaStatus).toHaveBeenCalledWith(
                mockContratoId, 'erro_envio'
            );
            expect(NotificationService.createNotification).toHaveBeenCalledWith(expect.objectContaining({
                clienteId: mockClienteId,
                tipo: 'error'
            }));
        });
    });

    describe('Payloads invalidos e eventos desconhecidos', () => {
        it('Deve ignorar eventos desconhecidos sem chamar repositorio', async () => {
            const payload = { event: { type: 'unknown.event', data: { id: mockAutentiqueDocId } } };

            const res = await request(app).post(route).send(payload);
            expect(res.status).toBe(200);
            await new Promise(process.nextTick);

            expect(ContratoServicoRepository.findByAutentiqueDocumentId).not.toHaveBeenCalled();
        });

        it('Deve tolerar payload totalmente invalido (sem event.data)', async () => {
            const payload = { ping: 'pong' };

            const res = await request(app).post(route).send(payload);
            expect(res.status).toBe(200);
            await new Promise(process.nextTick);

            expect(ContratoServicoRepository.findByAutentiqueDocumentId).not.toHaveBeenCalled();
        });

        it('Deve tolerar payload sem document id no eventData', async () => {
            const payload = { event: { type: 'document.finished', data: { other: 'field' } } };

            const res = await request(app).post(route).send(payload);
            expect(res.status).toBe(200);
            await new Promise(process.nextTick);

            expect(ContratoServicoRepository.findByAutentiqueDocumentId).not.toHaveBeenCalled();
        });

        it('Deve tolerar contrato nao encontrado no banco de dados', async () => {
            (ContratoServicoRepository.findByAutentiqueDocumentId as any).mockResolvedValue(null);

            const payload = {
                event: {
                    type: 'document.finished',
                    data: { id: 'non-existent-id' }
                }
            };

            const res = await request(app).post(route).send(payload);
            expect(res.status).toBe(200);
            await new Promise(process.nextTick);

            expect(ContratoServicoRepository.findByAutentiqueDocumentId).toHaveBeenCalledWith('non-existent-id');
            expect(ContratoServicoRepository.updateAssinaturaStatus).not.toHaveBeenCalled();
        });
    });

    describe('Seguranca / Validacao de Secret', () => {
        beforeEach(() => {
            process.env.AUTENTIQUE_WEBHOOK_SECRETS = 'secret1, secret2';
        });

        afterEach(() => {
            process.env.AUTENTIQUE_WEBHOOK_SECRETS = '';
        });

        it('Deve permitir requisicao sem token (comportamento dev: ausencia de token nao bloqueia)', async () => {
            // O controller deliberadamente permite requisicoes sem token quando secrets estao configurados
            // (fallback de dev documentado no codigo). Apenas tokens INVALIDOS sao bloqueados com 401.
            const res = await request(app).post(route).send({ event: { type: 'ping', data: { id: 'x' } } });
            expect(res.status).toBe(200);
        });

        it('Deve bloquear requisicao com token invalido', async () => {
            const res = await request(app)
                .post(route)
                .set('Authorization', 'Bearer wrong_secret')
                .send({ event: { type: 'ping', data: { id: 'x' } } });
            expect(res.status).toBe(401);
        });

        it('Deve autorizar requisicao com token valido no header Authorization', async () => {
            const res = await request(app)
                .post(route)
                .set('Authorization', 'Bearer secret1')
                .send({ event: { type: 'ping', data: { id: 'x' } } });
            expect(res.status).toBe(200);
        });

        it('Deve autorizar requisicao com token valido na query string', async () => {
            const res = await request(app)
                .post(`${route}?token=secret2`)
                .send({ event: { type: 'ping', data: { id: 'x' } } });
            expect(res.status).toBe(200);
        });
    });
});
