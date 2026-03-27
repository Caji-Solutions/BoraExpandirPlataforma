import { Request, Response } from 'express';
import ContratoServicoRepository from '../../repositories/ContratoServicoRepository';
import NotificationService from '../../services/NotificationService';

class WebhookController {
    /**
     * POST /webhooks/autentique
     * Recebe notificacoes da Autentique sobre eventos de assinatura.
     */
    async handleAutentiqueWebhook(req: Request, res: Response) {
        try {
            const secretEnv = process.env.AUTENTIQUE_WEBHOOK_SECRETS || '';
            const configuredSecrets = secretEnv ? secretEnv.split(',').map(s => s.trim()).filter(s => s) : [];

            if (configuredSecrets.length > 0) {
                const incomingToken = req.headers['authorization']?.replace('Bearer ', '') ||
                                      req.headers['x-autentique-signature'] ||
                                      req.headers['x-autentique-secret'] ||
                                      req.query.token;

                if (!incomingToken || !configuredSecrets.includes(incomingToken as string)) {
                    console.warn('[WebhookController] Tentativa de acesso não autorizada. Token inválido ou ausente.');
                    return res.status(401).json({ error: 'Unauthorized' });
                }
            }

            // Retornar 200 rapidamente (best practice Autentique)
            res.status(200).json({ received: true });

            const payload = req.body;
            const eventType = payload?.event?.type;
            const documentData = payload?.event?.data?.object;

            if (!eventType || !documentData) {
                console.warn('[WebhookController] Payload invalido recebido do Autentique:', JSON.stringify(payload));
                return;
            }

            const autentiqueDocumentId = documentData.id;

            if (!autentiqueDocumentId) {
                console.warn('[WebhookController] document.id ausente no payload do webhook Autentique');
                return;
            }

            console.log(`[WebhookController] Evento Autentique recebido: ${eventType} para documento ${autentiqueDocumentId}`);

            if (eventType === 'document.finished') {
                // Todos os signatarios assinaram - contrato finalizado
                const signedFileUrl = documentData.files?.signed || null;

                const contrato = await ContratoServicoRepository.findByAutentiqueDocumentId(autentiqueDocumentId);

                if (!contrato) {
                    console.warn(`[WebhookController] Contrato nao encontrado para autentique_document_id: ${autentiqueDocumentId}`);
                    return;
                }

                await ContratoServicoRepository.updateAssinaturaStatus(
                    contrato.id,
                    'aprovado',
                    signedFileUrl
                );

                console.log(`[WebhookController] Contrato ${contrato.id} marcado como aprovado. PDF assinado: ${signedFileUrl}`);

            } else if (eventType === 'signature.rejected') {
                // Um signatario recusou a assinatura
                const contrato = await ContratoServicoRepository.findByAutentiqueDocumentId(autentiqueDocumentId);

                if (!contrato) {
                    console.warn(`[WebhookController] Contrato nao encontrado para autentique_document_id: ${autentiqueDocumentId}`);
                    return;
                }

                await ContratoServicoRepository.updateAssinaturaStatus(
                    contrato.id,
                    'recusado'
                );

                console.log(`[WebhookController] Contrato ${contrato.id} marcado como recusado.`);

            } else if (eventType === 'signature.viewed') {
                const contrato = await ContratoServicoRepository.findByAutentiqueDocumentId(autentiqueDocumentId);

                if (!contrato) {
                    console.warn(`[WebhookController] Contrato nao encontrado para autentique_document_id: ${autentiqueDocumentId}`);
                    return;
                }

                await ContratoServicoRepository.updateAssinaturaStatus(
                    contrato.id,
                    'visualizado'
                );

                console.log(`[WebhookController] Contrato ${contrato.id} marcado como visualizado.`);

            } else if (eventType === 'signature.delivery_failed') {
                const contrato = await ContratoServicoRepository.findByAutentiqueDocumentId(autentiqueDocumentId);

                if (!contrato) {
                    console.warn(`[WebhookController] Contrato nao encontrado para autentique_document_id: ${autentiqueDocumentId}`);
                    return;
                }

                await ContratoServicoRepository.updateAssinaturaStatus(
                    contrato.id,
                    'erro_envio'
                );

                console.log(`[WebhookController] Contrato ${contrato.id} apresentou falha na entrega de email (erro_envio).`);

                if (contrato.cliente_id) {
                    try {
                        await NotificationService.createNotification({
                            clienteId: contrato.cliente_id,
                            titulo: 'Falha no E-mail do Contrato',
                            mensagem: `O e-mail para assinatura do documento falhou. Verifique se o endereço do cliente está correto e reenvie.`,
                            tipo: 'error'
                        });
                    } catch (err) {
                        console.error('[WebhookController] Erro ao criar notificacao de delivery_failed:', err);
                    }
                }

            } else {
                console.log(`[WebhookController] Evento Autentique ignorado: ${eventType}`);
            }

        } catch (error) {
            console.error('[WebhookController] Erro ao processar webhook Autentique:', error);
        }
    }
}

export default new WebhookController();
