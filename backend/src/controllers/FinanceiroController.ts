import { supabase } from '../config/SupabaseClient'
import ComercialRepository from '../repositories/ComercialRepository'
import ContratoServicoRepository from '../repositories/ContratoServicoRepository'

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

            // 5. Verificar se o formulário já foi preenchido (via formularios_cliente)
            let formularioPreenchido = false
            const { data: formData } = await supabase
                .from('formularios_cliente')
                .select('id')
                .eq('agendamento_id', id)
                .maybeSingle()
            
            if (formData) {
                formularioPreenchido = true
            }

            // 6. Só marca 'confirmado' se pagamento E formulário estiverem OK
            const novoStatus = formularioPreenchido ? 'confirmado' : 'agendado'
            await ComercialRepository.updateAgendamentoStatus(id, novoStatus)
            console.log(`[FinanceiroController] Status do agendamento atualizado para: ${novoStatus} (formulário: ${formularioPreenchido ? 'sim' : 'não'})`)

            // 7. Se formulário ainda não preenchido, enviar email com link do formulário
            if (!agendamento.email) {
                return res.status(200).json({
                    success: true,
                    message: 'Comprovante aprovado, mas agendamento sem email para envio.'
                })
            }

            if (!formularioPreenchido) {
                try {
                    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3010').replace(/\/$/, '')
                    const params = new URLSearchParams()
                    if (agendamento.nome) params.set('nome', agendamento.nome)
                    if (agendamento.email) params.set('email', agendamento.email)
                    if (agendamento.telefone) params.set('telefone', agendamento.telefone)
                    const formularioLink = `${frontendUrl}/formulario/consultoria/${id}?${params.toString()}`

                    const EmailService = (await import('../services/EmailService')).default
                    await EmailService.sendFormularioEmail({
                        to: agendamento.email,
                        clientName: agendamento.nome || 'Cliente',
                        formularioLink,
                        email: agendamento.email
                    })
                    console.log(`[FinanceiroController] Email com link do formulário enviado para ${agendamento.email}`)

                    return res.status(200).json({
                        success: true,
                        message: 'Comprovante aprovado e email com formulário enviado com sucesso!',
                        formulario_link: formularioLink
                    })
                } catch (emailError: any) {
                    console.error('[FinanceiroController] Erro ao enviar email:', emailError)
                    return res.status(200).json({
                        success: true,
                        message: 'Comprovante aprovado, mas houve um erro ao enviar o email com formulário.',
                        warning: emailError.message
                    })
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Comprovante aprovado e agendamento confirmado com sucesso!'
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

    /**
     * GET /financeiro/contratos/comprovantes/pendentes
     * Lista contratos com comprovante enviado aguardando verificaÃ§Ã£o
     */
    async getComprovantesContratosPendentes(_req: any, res: any) {
        try {
            const { data, error } = await supabase
                .from('contratos_servicos')
                .select(`
                    *,
                    cliente:clientes(id, nome, email, whatsapp),
                    servico:catalogo_servicos(id, nome, valor, tipo)
                `)
                .not('pagamento_comprovante_url', 'is', null)
                .eq('pagamento_status', 'em_analise')
                .order('pagamento_comprovante_upload_em', { ascending: true })

            if (error) {
                console.error('[FinanceiroController] Erro ao buscar comprovantes de contrato:', error)
                return res.status(500).json({ message: 'Erro ao buscar comprovantes de contrato' })
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
     * POST /financeiro/contratos/comprovante/:id/aprovar
     */
    async aprovarComprovanteContrato(req: any, res: any) {
        try {
            const { id } = req.params
            const { verificado_por } = req.body

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato nÃ£o encontrado' })
            }

            if (!contrato.pagamento_comprovante_url) {
                return res.status(400).json({ message: 'Este contrato nÃ£o possui comprovante enviado.' })
            }

            if (contrato.pagamento_status === 'aprovado') {
                return res.status(400).json({ message: 'Este comprovante jÃ¡ foi aprovado.' })
            }

            const updated = await ContratoServicoRepository.updateContrato(id, {
                pagamento_status: 'aprovado',
                pagamento_verificado_por: verificado_por || null,
                pagamento_verificado_em: new Date().toISOString(),
                pagamento_nota_recusa: null,
                atualizado_em: new Date().toISOString()
            })

            return res.status(200).json({
                success: true,
                message: 'Comprovante aprovado com sucesso!',
                data: updated
            })
        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao aprovar comprovante de contrato:', error)
            return res.status(500).json({ message: 'Erro ao aprovar comprovante', error: error.message })
        }
    }

    /**
     * POST /financeiro/contratos/comprovante/:id/recusar
     */
    async recusarComprovanteContrato(req: any, res: any) {
        try {
            const { id } = req.params
            const { nota, verificado_por } = req.body

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato nÃ£o encontrado' })
            }

            if (!contrato.pagamento_comprovante_url) {
                return res.status(400).json({ message: 'Este contrato nÃ£o possui comprovante enviado.' })
            }

            const updated = await ContratoServicoRepository.updateContrato(id, {
                pagamento_status: 'recusado',
                pagamento_nota_recusa: nota || 'Comprovante recusado sem observaÃ§Ã£o.',
                pagamento_verificado_por: verificado_por || null,
                pagamento_verificado_em: new Date().toISOString(),
                atualizado_em: new Date().toISOString()
            })

            return res.status(200).json({
                success: true,
                message: 'Comprovante recusado com sucesso. A nota foi registrada.',
                data: updated
            })
        } catch (error: any) {
            console.error('[FinanceiroController] Erro ao recusar comprovante de contrato:', error)
            return res.status(500).json({ message: 'Erro ao recusar comprovante', error: error.message })
        }
    }
}

export default new FinanceiroController()
