import { supabase } from '../config/SupabaseClient'
import ComercialRepository from '../repositories/ComercialRepository'

class FinanceiroController {

    /**
     * GET /financeiro/comprovantes/pendentes
     * Lista todos os agendamentos com comprovante enviado aguardando verificação
     */
    async getComprovantesPendentes(_req: any, res: any) {
        try {
            const { data, error } = await supabase
                .from('agendamentos')
                .select('*')
                .not('comprovante_url', 'is', null)
                .eq('pagamento_status', 'em_analise')
                .order('comprovante_upload_em', { ascending: true })

            if (error) {
                console.error('[FinanceiroController] Erro ao buscar comprovantes pendentes:', error)
                return res.status(500).json({ message: 'Erro ao buscar comprovantes pendentes' })
            }

            return res.status(200).json({
                data: data || [],
                total: (data || []).length
            })

        } catch (error: any) {
            console.error('[FinanceiroController] Erro geral:', error)
            return res.status(500).json({ message: 'Erro interno', error: error.message })
        }
    }

    /**
     * POST /financeiro/comprovante/:id/aprovar
     * Aprova o comprovante de pagamento e dispara o fluxo de confirmação (SMTP + setup de conta)
     */
    async aprovarComprovante(req: any, res: any) {
        try {
            const { id } = req.params
            const { verificado_por } = req.body

            // 1. Buscar agendamento
            const agendamento = await ComercialRepository.getAgendamentoById(id)
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento não encontrado' })
            }

            // 2. Verificar se tem comprovante
            if (!agendamento.comprovante_url) {
                return res.status(400).json({ message: 'Este agendamento não possui comprovante enviado.' })
            }

            // 3. Verificar se já foi processado
            if (agendamento.pagamento_status === 'aprovado') {
                return res.status(400).json({ message: 'Este comprovante já foi aprovado.' })
            }

            // 4. Verificar conflito de horário
            let conflitoHorario = false
            try {
                const inicio = new Date(agendamento.data_hora)
                const fim = new Date(inicio.getTime() + (agendamento.duracao_minutos || 60) * 60000)
                
                const { data: conflitos } = await supabase
                    .from('agendamentos')
                    .select('id')
                    .neq('id', id)
                    .in('status', ['agendado', 'confirmado', 'aprovado', 'realizado'])
                    .gte('data_hora', inicio.toISOString())
                    .lt('data_hora', fim.toISOString())
                    
                if (conflitos && conflitos.length > 0) {
                    conflitoHorario = true
                    console.log(`[FinanceiroController] Conflito de horário detectado ao aprovar agendamento: ${id}`)
                }
            } catch (err) {
                console.error('[FinanceiroController] Erro ao verificar conflito:', err)
            }

            // 5. Atualizar pagamento_status para aprovado e também a flag de conflito
            const { error: updateError } = await supabase
                .from('agendamentos')
                .update({
                    pagamento_status: 'aprovado',
                    pagamento_verificado_por: verificado_por || null,
                    pagamento_verificado_em: new Date().toISOString(),
                    pagamento_nota_recusa: null,
                    conflito_horario: conflitoHorario
                })
                .eq('id', id)

            if (updateError) {
                console.error('[FinanceiroController] Erro ao atualizar pagamento_status:', updateError)
                return res.status(500).json({ message: 'Erro ao aprovar comprovante' })
            }

            // 5. Verificar se o formulário já foi preenchido (cliente tem user_id)
            let formularioPreenchido = false
            if (agendamento.email) {
                const { data: clientePorEmail } = await supabase
                    .from('clientes')
                    .select('user_id')
                    .eq('email', agendamento.email)
                    .maybeSingle()
                
                if (clientePorEmail?.user_id) {
                    formularioPreenchido = true
                }
            }

            // 6. Só marca 'confirmado' se pagamento E formulário estiverem OK
            const novoStatus = formularioPreenchido ? 'confirmado' : 'agendado'
            await ComercialRepository.updateAgendamentoStatus(id, novoStatus)
            console.log(`[FinanceiroController] Status do agendamento atualizado para: ${novoStatus} (formulário: ${formularioPreenchido ? 'sim' : 'não'})`)

            // 6. Gerar link de recuperação de senha pelo Supabase (setup de conta)
            if (!agendamento.email) {
                return res.status(200).json({
                    success: true,
                    message: 'Comprovante aprovado, mas agendamento sem email para envio de acesso.'
                })
            }

            const { data: linkData, error: authError } = await supabase.auth.admin.generateLink({
                type: 'recovery',
                email: agendamento.email
            })

            if (authError) {
                console.error('[FinanceiroController] Erro ao gerar link de setup de senha:', authError)
                return res.status(200).json({
                    success: true,
                    message: 'Comprovante aprovado e agendamento confirmado, mas falhou ao gerar link de acesso.',
                    warning: authError.message
                })
            }

            // 7. Enviar email para o cliente
            const EmailService = (await import('../services/EmailService')).default
            await EmailService.sendPasswordSetupEmail({
                to: agendamento.email,
                clientName: agendamento.nome || 'Cliente',
                resetLink: linkData.properties.action_link,
                email: agendamento.email
            })

            console.log(`[FinanceiroController] Comprovante aprovado e email enviado para ${agendamento.email}`)

            return res.status(200).json({
                success: true,
                message: 'Comprovante aprovado, agendamento confirmado e email enviado com sucesso!'
            })

        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao aprovar comprovante:', error)
            return res.status(500).json({ message: 'Erro ao aprovar comprovante', error: error.message })
        }
    }

    /**
     * POST /financeiro/comprovante/:id/recusar
     * Recusa o comprovante de pagamento com uma nota explicativa
     */
    async recusarComprovante(req: any, res: any) {
        try {
            const { id } = req.params
            const { nota, verificado_por } = req.body

            // 1. Buscar agendamento
            const agendamento = await ComercialRepository.getAgendamentoById(id)
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento não encontrado' })
            }

            // 2. Verificar se tem comprovante
            if (!agendamento.comprovante_url) {
                return res.status(400).json({ message: 'Este agendamento não possui comprovante enviado.' })
            }

            // 3. Atualizar pagamento_status para recusado + nota
            const { error: updateError } = await supabase
                .from('agendamentos')
                .update({
                    pagamento_status: 'recusado',
                    pagamento_nota_recusa: nota || 'Comprovante recusado sem observação.',
                    pagamento_verificado_por: verificado_por || null,
                    pagamento_verificado_em: new Date().toISOString()
                })
                .eq('id', id)

            if (updateError) {
                console.error('[FinanceiroController] Erro ao recusar comprovante:', updateError)
                return res.status(500).json({ message: 'Erro ao recusar comprovante' })
            }

            console.log(`[FinanceiroController] Comprovante recusado para agendamento ${id}. Nota: ${nota}`)

            return res.status(200).json({
                success: true,
                message: 'Comprovante recusado com sucesso. A nota foi registrada.'
            })

        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao recusar comprovante:', error)
            return res.status(500).json({ message: 'Erro ao recusar comprovante', error: error.message })
        }
    }
}

export default new FinanceiroController()
