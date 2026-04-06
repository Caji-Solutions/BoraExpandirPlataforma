import cron from 'node-cron';
import { supabase } from '../config/SupabaseClient';
import CambioService from '../services/CambioService';
import ComissaoRepository from '../repositories/ComissaoRepository';
import EmailService from '../services/EmailService';

/**
 * Job que roda a cada 30 minutos
 * Regra: Se um agendamento está agendado para < 1 hora no futuro
 * e o formulário (cliente_is_user) não foi preenchido, ele cancela automaticamente.
 */
export const startCronJobs = () => {
    cron.schedule('*/30 * * * *', async () => {
        try {
            console.log('[CRON] Executando verificacao de formularios atrasados...');
            
            // Calculamos o limite de 1 hora no futuro a partir de agora
            const cancelLimitTime = new Date();
            cancelLimitTime.setHours(cancelLimitTime.getHours() + 1);
            
            const { data: agendamentos, error } = await supabase
                .from('agendamentos')
                .select('*')
                .eq('status', 'agendado');
                
            if (error) {
                console.error('[CRON] Erro ao buscar agendamentos:', error);
                return;
            }

            if (!agendamentos || agendamentos.length === 0) {
                return;
            }

            for (const agendamento of agendamentos) {
                try {
                    // Combinar data e hora do agendamento (compatibilidade com bd legado) ou usar data_hora se existir
                    const agendamentoDateTime = agendamento.data_hora 
                        ? new Date(agendamento.data_hora) 
                        : new Date(`${agendamento.data}T${agendamento.hora}`);
                    
                    // 1. Log detalhado
                    console.log(`[CRON] Avaliando ID: ${agendamento.id} | Status: ${agendamento.status} | DataHora: ${agendamentoDateTime.toISOString()} | Pagamento: ${agendamento.pagamento_status} | Formulario(cliente_is_user): ${agendamento.cliente_is_user}`);

                    // 2. Se já existe formulário preenchido em formularios_cliente, NUNCA cancela.
                    const { data: formularioExistente } = await supabase
                        .from('formularios_cliente')
                        .select('id')
                        .eq('agendamento_id', agendamento.id)
                        .maybeSingle();

                    if (formularioExistente) {
                        console.log(`[CRON] Poupando agendamento ${agendamento.id}: Formulario ja foi preenchido pelo cliente.`);
                        continue;
                    }

                    // 2b. Se o pagamento já foi aprovado, NUNCA cancela automaticamente.
                    // Em vez disso, verifica se o formulário foi preenchido e envia lembrete se necessário.
                    if (agendamento.pagamento_status === 'aprovado') {
                        // Formulario ja preenchido — sem acao
                        if (agendamento.cliente_is_user === true) {
                            console.log(`[CRON] Agendamento ${agendamento.id}: Pagamento aprovado e formulario ja preenchido. Sem acao.`);
                            continue;
                        }

                        // Rate limiting: maximo de 3 lembretes por agendamento
                        const reminderCount: number = agendamento.email_reminders_count || 0;
                        if (reminderCount >= 3) {
                            console.log(`[CRON] Agendamento ${agendamento.id}: Limite de lembretes atingido (${reminderCount}/3). Sem envio.`);
                            continue;
                        }

                        // Verifica se formulario ja existe em formularios_cliente
                        const { data: formulario } = await supabase
                            .from('formularios_cliente')
                            .select('id')
                            .eq('agendamento_id', agendamento.id)
                            .maybeSingle();

                        if (formulario) {
                            console.log(`[CRON] Agendamento ${agendamento.id}: Formulario encontrado em formularios_cliente. Sem envio.`);
                            continue;
                        }

                        const clientEmail = agendamento.email;
                        if (!clientEmail) {
                            console.warn(`[CRON] Agendamento ${agendamento.id}: Email nao encontrado. Pulando lembrete.`);
                            continue;
                        }

                        const clientName = agendamento.nome || 'Cliente';
                        const servicoNome = agendamento.produto_nome || agendamento.servico_nome || 'consultoria';
                        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3010').replace(/\/$/, '');
                        const queryParams = new URLSearchParams();
                        if (agendamento.nome) queryParams.set('nome', agendamento.nome);
                        if (agendamento.email) queryParams.set('email', agendamento.email);
                        if (agendamento.telefone) queryParams.set('telefone', agendamento.telefone);
                        const formLink = `${frontendUrl}/formulario/consultoria/${agendamento.id}?${queryParams.toString()}`;

                        const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lembrete - Bora Expandir</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#076CA5 0%,#0A8FD4 100%);padding:40px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Bora Expandir 🚀</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Lembrete Importante ⏰</p>
        </div>
        <div style="padding:32px;">
            <h2 style="color:#1a1a1a;margin:0 0 16px;font-size:22px;">Olá, ${clientName}! 👋</h2>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">
                Você iniciou seu processo com a <strong>Bora Expandir</strong>, mas ainda não completou o formulário de avaliação.
            </p>
            <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Para continuar com seu agendamento de <strong>${servicoNome}</strong>, é necessário preencher o formulário.
            </p>
            <div style="text-align:center;margin:32px 0;">
                <a href="${formLink}"
                   style="display:inline-block;background:#076CA5;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                    📋 Preencher Formulário Agora
                </a>
            </div>
            <p style="color:#888;font-size:13px;line-height:1.6;margin:0 0 16px;text-align:center;">
                Precisa de ajuda? Responda este email ou fale conosco pelo WhatsApp.
            </p>
            <p style="color:#999;font-size:12px;text-align:center;margin:24px 0 0;">
                Atenciosamente, Equipe Bora Expandir
            </p>
        </div>
        <div style="background:#f9f9f9;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#aaa;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} Bora Expandir — Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>
</html>`;

                        try {
                            await EmailService.sendEmail({
                                to: clientEmail,
                                subject: 'Lembrete: Complete seu formulário para acessar o sistema',
                                html
                            });

                            // Só incrementa o contador APÓS o email ser enviado com sucesso
                            await supabase
                                .from('agendamentos')
                                .update({ email_reminders_count: reminderCount + 1 })
                                .eq('id', agendamento.id);

                            console.log(`[CRON] Lembrete ${reminderCount + 1}/3 enviado para ${clientEmail} (agendamento ${agendamento.id}).`);
                        } catch (emailErr) {
                            console.error(`[CRON] Erro ao enviar lembrete para agendamento ${agendamento.id}. Contador NÃO incrementado:`, emailErr);
                        }

                        continue;
                    }

                    // 3. Se falta 1h ou menos e NÃO tem formulário enviado, cancela.
                    if (agendamentoDateTime <= cancelLimitTime) {
                        console.log(`[CRON] Cancelando agendamento ${agendamento.id} por falta de formulario (falta <= 60 min).`);

                        const { error: updateError } = await supabase
                            .from('agendamentos')
                            .update({
                                status: 'cancelado',
                                observacoes: (agendamento.observacoes ? agendamento.observacoes + '\n\n' : '') + '[SISTEMA] Agendamento cancelado automaticamente: Formulário não preenchido 1 hora antes da reunião.',
                                pagamento_nota_recusa: '[SISTEMA] Cancelado por falta de formulário no prazo.'
                            })
                            .eq('id', agendamento.id);

                        if (updateError) {
                            console.error(`[CRON] Erro ao cancelar agendamento ${agendamento.id}:`, updateError);
                        }

                        // Task 4: Se houver meet_link, tenta deletar o evento no Google Calendar
                        if (agendamento.meet_link) {
                            try {
                                console.log(`[CRON] Agendamento ${agendamento.id} tinha meet_link. Tentando remover evento do Calendar...`);
                                const ComposioService = (await import('../services/ComposioService')).default;
                                const { getSuperAdminId } = await import('../utils/calendarHelpers');
                                const superAdminId = await getSuperAdminId();
                                if (superAdminId) {
                                    // Sem event_id salvo, logamos a intenção para rastreabilidade
                                    console.log(`[CRON] meet_link a remover: ${agendamento.meet_link} (userId: ${superAdminId})`);
                                }
                            } catch (errMeet) {
                                console.error(`[CRON] Erro ao tentar remover evento do Calendar para agendamento ${agendamento.id}:`, errMeet);
                            }
                        }
                    }
                } catch (agErr) {
                    console.error(`[CRON] Erro ao processar agendamento ${agendamento.id}:`, agErr);
                    // Continua para o próximo agendamento
                }
            }

        } catch (err) {
            console.error('[CRON] Erro critico no Worker de Cancelamento:', err);
        }
    });

    console.log('[CRON] Worker de cancelamento iniciado. (Verificacao a cada 30 minutos)');

    // Job de atualizacao de cambio EUR/BRL - a cada 6 horas (apenas fora de teste)
    if (process.env.NODE_ENV !== 'test') {
        cron.schedule('0 */6 * * *', async () => {
            try {
                console.log('[CRON] Atualizando cotacao EUR/BRL...');
                const cotacao = await CambioService.fetchCotacao();
                console.log(`[CRON] Cotacao EUR/BRL atualizada: ${cotacao}`);
            } catch (err) {
                console.error('[CRON] Erro ao atualizar cotacao:', err);
            }
        });

        // Buscar cotacao inicial ao iniciar
        CambioService.fetchCotacao().catch(err => {
            console.warn('[CRON] Nao foi possivel buscar cotacao inicial:', err);
        });

        console.log('[CRON] Worker de cambio iniciado. (Atualizacao a cada 6 horas)');

        // Job de Fechamento Mensal de Comissões - Dia 15 as 23:59
        cron.schedule('59 23 15 * *', async () => {
            try {
                console.log('[CRON] Iniciando fechamento mensal de comissoes...');
                
                // Pega data de ontem (dia 14 ou anterior) para definir de qual mes estamos fechando
                // Se rodou dia 15 de Abril, estamos fechando as estimativas de Abril (ou as pendentes anteriores).
                // Muitas vezes o fechamento no dia 15 é do mês *anterior*.
                const hoje = new Date()
                let mes = hoje.getMonth() + 1 // 1 a 12
                let ano = hoje.getFullYear()

                // Regra de negocio: Dia 15 de um dado mes costuma fechar as comissoes *do proprio mes atual* (estimado -> fechado) 
                // ou do *mes anterior* dependendo da definicao. Vamos usar o mes atual, iterar ou pedir pro cron fechar tudo que tiver open no passado.
                // Mas de forma mais garantida, vamos fechar para o MES ANTERIOR:
                if (mes === 1) {
                    mes = 12
                    ano -= 1
                } else {
                    mes -= 1
                }

                console.log(`[CRON] Fechando comissoes estimadas para Mes: ${mes} / Ano: ${ano}`)
                await ComissaoRepository.fecharComissoesMensais(mes, ano);
                
                console.log(`[CRON] Comissoes do mes ${mes}/${ano} fechadas com sucesso.`);
            } catch (err) {
                console.error('[CRON] Erro ao executar fechamento mensal de comissoes:', err);
            }
        });
        console.log('[CRON] Worker de fechamento de comissoes iniciado. (Execucao dia 15 as 23:59)');
    }
};
