import { Request, Response } from 'express';
import ContratoServicoRepository from '../repositories/ContratoServicoRepository';
import NotificationService from '../services/NotificationService';
import DNAService from '../services/DNAService';
import AutentiqueService from '../services/AutentiqueService';
import { supabase } from '../config/SupabaseClient';

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

            // Log completo para diagnostico da estrutura do payload
            console.log('[WebhookController] Payload completo Autentique:', JSON.stringify(payload, null, 2));

            const eventType = payload?.event?.type;
            const eventData = payload?.event?.data;

            if (!eventType || !eventData) {
                console.warn('[WebhookController] Payload invalido. eventType:', eventType, '| eventData:', JSON.stringify(eventData));
                return;
            }

            // document.finished -> eventData.id
            // signature.* -> eventData.document (o ID do documento pai)
            const autentiqueDocumentId: string | undefined =
                eventData.id || eventData.document || undefined;

            if (!autentiqueDocumentId) {
                console.warn('[WebhookController] document id ausente. eventData:', JSON.stringify(eventData));
                return;
            }

            console.log(`[WebhookController] Evento Autentique recebido: ${eventType} para documento ${autentiqueDocumentId}`);

            if (eventType === 'document.finished') {
                // Todos os signatarios assinaram - contrato finalizado
                let signedFileUrl: string | null = eventData.files?.signed || null;

                // Fallback: se a Autentique nao enviou a URL no payload, busca via API
                if (!signedFileUrl) {
                    try {
                        const docFromApi = await AutentiqueService.getDocument(autentiqueDocumentId);
                        signedFileUrl = docFromApi?.files?.signed || null;
                        console.log(`[WebhookController] URL assinada obtida via API Autentique: ${signedFileUrl}`);
                    } catch (fetchErr) {
                        console.error('[WebhookController] Falha ao buscar URL assinada via API Autentique:', fetchErr);
                    }
                }

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

                // Merge no DNA do cliente
                if (contrato.cliente_id) {
                    try {
                        await DNAService.mergeDNA(contrato.cliente_id, {
                            contrato_assinado_url: signedFileUrl,
                            contrato_assinado_em: new Date().toISOString(),
                            contrato_id: contrato.id,
                            contrato_servico_nome: contrato.servico_nome || null
                        }, 'HIGH');
                        console.log(`[WebhookController] DNA do cliente ${contrato.cliente_id} atualizado com contrato assinado.`);
                    } catch (dnaErr) {
                        console.error('[WebhookController] Erro ao fazer merge no DNA do cliente:', dnaErr);
                    }
                }

                // Notificacao ao cliente no portal
                if (contrato.cliente_id) {
                    try {
                        await NotificationService.createNotification({
                            clienteId: contrato.cliente_id,
                            titulo: 'Contrato assinado com sucesso',
                            mensagem: `Seu contrato foi assinado por todas as partes e ja esta disponivel para download.`,
                            tipo: 'success'
                        });
                    } catch (notifErr) {
                        console.error('[WebhookController] Erro ao criar notificacao de contrato assinado:', notifErr);
                    }
                }

                // Notificacao por email ao usuario comercial responsavel
                if (contrato.usuario_id) {
                    try {
                        const { data: perfil } = await supabase
                            .from('profiles')
                            .select('full_name, email')
                            .eq('id', contrato.usuario_id)
                            .single();

                        if (perfil?.email) {
                            const EmailService = (await import('../services/EmailService')).default;
                            await EmailService.sendEmail({
                                to: perfil.email,
                                subject: 'Contrato assinado pelo cliente',
                                html: `
                                    <p>Ola, ${perfil.full_name || 'colaborador'}!</p>
                                    <p>O contrato de <strong>${contrato.cliente_nome || 'cliente'}</strong> foi assinado por todas as partes.</p>
                                    ${signedFileUrl ? `<p><a href="${signedFileUrl}">Clique aqui para baixar o contrato assinado</a></p>` : ''}
                                    <p>Voce pode acessar os detalhes no sistema.</p>
                                `
                            });
                            console.log(`[WebhookController] Email de contrato assinado enviado para ${perfil.email}`);
                        }
                    } catch (emailErr) {
                        console.error('[WebhookController] Erro ao enviar email ao comercial:', emailErr);
                    }
                }

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
