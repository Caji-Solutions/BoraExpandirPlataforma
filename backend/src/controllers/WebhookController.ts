import { Request, Response } from 'express';
import ContratoServicoRepository from '../repositories/ContratoServicoRepository';

class WebhookController {
    /**
     * POST /webhooks/autentique
     * Recebe notificacoes da Autentique sobre eventos de assinatura.
     */
    async handleAutentiqueWebhook(req: Request, res: Response) {
        // Retornar 200 rapidamente (best practice Autentique)
        res.status(200).json({ received: true });

        try {
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

            } else {
                console.log(`[WebhookController] Evento Autentique ignorado: ${eventType}`);
            }

        } catch (error) {
            console.error('[WebhookController] Erro ao processar webhook Autentique:', error);
        }
    }
}

export default new WebhookController();
