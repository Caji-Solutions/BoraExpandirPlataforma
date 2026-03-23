import cron from 'node-cron';
import { supabase } from '../config/SupabaseClient';

/**
 * Job que roda a cada 30 minutos
 * Regra: Se um agendamento está agendado para < 1 hora no futuro
 * e o formulário (cliente_is_user) não foi preenchido, ele cancela automaticamente.
 */
export const startCronJobs = () => {
    cron.schedule('*/30 * * * *', async () => {
        try {
            console.log('[CRON] Executando verificação de formulários atrasados...');
            
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

                    // 2. Se o formulário já foi enviado (cliente_is_user === true), NUNCA cancela por esse CRON.
                    if (agendamento.cliente_is_user === true) {
                        console.log(`[CRON] Poupando agendamento ${agendamento.id}: Formulário já foi enviado ao cliente.`);
                        continue;
                    }

                    // 2b. Se o pagamento já foi aprovado, NUNCA cancela automaticamente.
                    if (agendamento.pagamento_status === 'aprovado') {
                        console.log(`[CRON] Poupando agendamento ${agendamento.id}: Pagamento ja aprovado.`);
                        continue;
                    }

                    // 3. Se falta 1h ou menos e NÃO tem formulário enviado, cancela.
                    if (agendamentoDateTime <= cancelLimitTime) {
                        console.log(`[CRON] Cancelando agendamento ${agendamento.id} por falta de formulário (falta <= 60 min).`);

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
            console.error('[CRON] Erro crítico no Worker de Cancelamento:', err);
        }
    });

    console.log('[CRON] Workers iniciados com sucesso. (Verificação a cada 30 minutos)');
};
