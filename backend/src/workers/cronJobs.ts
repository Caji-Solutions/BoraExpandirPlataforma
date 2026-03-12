import cron from 'node-cron';
import { supabase } from '../config/SupabaseClient';

/**
 * Job que roda a cada 5 minutos
 * Regra: Se um agendamento está agendado para < 1 hora no futuro
 * e o formulário (cliente_is_user) não foi preenchido, ele cancela automaticamente.
 */
export const startCronJobs = () => {
    cron.schedule('*/5 * * * *', async () => {
        try {
            console.log('[CRON] Executando verificação de formulários atrasados...');
            
            // Calculamos o limite de 1 hora no futuro a partir de agora
            const cancelLimitTime = new Date();
            cancelLimitTime.setHours(cancelLimitTime.getHours() + 1);
            
            const { data: agendamentos, error } = await supabase
                .from('agendamentos')
                .select('*')
                .eq('status', 'agendado')
                .eq('cliente_is_user', false);
                
            if (error) {
                console.error('[CRON] Erro ao buscar agendamentos:', error);
                return;
            }

            if (!agendamentos || agendamentos.length === 0) {
                return;
            }

            for (const agendamento of agendamentos) {
                // Combinar data e hora do agendamento
                const agendamentoDateTime = new Date(`${agendamento.data}T${agendamento.hora}`);
                
                // Se a data/hora do agendamento for menor que agora + 1h, e o formulário não foi preenchido, cancela.
                if (agendamentoDateTime <= cancelLimitTime) {
                    console.log(`[CRON] Cancelando agendamento ${agendamento.id} por falta de formulário.`);
                    
                    await supabase
                        .from('agendamentos')
                        .update({ 
                            status: 'cancelado',
                            observacoes: (agendamento.observacoes ? agendamento.observacoes + '\n\n' : '') + '[SISTEMA] Agendamento cancelado automaticamente: Formulário não preenchido 1 hora antes da reunião.',
                            pagamento_nota_recusa: '[SISTEMA] Cancelado por falta de formulário no prazo.'
                        })
                        .eq('id', agendamento.id);
                }
            }

        } catch (err) {
            console.error('[CRON] Erro crítico no Worker de Cancelamento:', err);
        }
    });

    console.log('[CRON] Workers iniciados com sucesso. (Verificação a cada 5 minutos)');
};
