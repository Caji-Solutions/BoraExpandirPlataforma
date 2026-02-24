import { supabase } from '../config/SupabaseClient'
import type { ClienteDTO } from '../types/parceiro';
import ComercialRepository from '../repositories/ComercialRepository';


class ComercialController {
    async createAgendamento(req: any, res: any) {
        console.log('========== CREATE AGENDAMENTO DEBUG ==========')
        console.log('Body completo recebido:', req.body)
        try {
            const { nome, email, telefone, data_hora, produto_id, duracao_minutos, status, usuario_id, cliente_id } = req.body
            
            console.log('IDs recebidos:', { usuario_id, cliente_id })

            // Validação básica
            if (!nome || !email || !telefone || !data_hora || !produto_id) {
                console.error('Campos obrigatórios faltando:', { nome, email, telefone, data_hora, produto_id })
                return res.status(400).json({ 
                    message: 'Campos obrigatórios: nome, email, telefone, data_hora, produto_id' 
                })
            }

            // Normaliza data_hora para UTC (evita falsos negativos na checagem)
            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`

            // Verifica disponibilidade do horário
            const duracao = duracao_minutos || 60
            const disponibilidade = await this.verificarDisponibilidade(dataHoraIso, duracao)
            console.log('Disponibilidade verificada:', disponibilidade)

            if (!disponibilidade.disponivel) {
                return res.status(409).json({ 
                    message: 'Horário indisponível',
                    conflitos: disponibilidade.agendamentos 
                })
            }

            const agendamento = { 
                nome, 
                email, 
                telefone, 
                data_hora: dataHoraIso, 
                produto_id, 
                duracao_minutos: duracao,
                status: status || 'agendado',
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null
            }
            
            console.log('Objeto agendamento final para envio ao DB:', agendamento)     
            const createdData = await ComercialRepository.createAgendamento(agendamento)  
            console.log('Agendamento criado com sucesso:', createdData)
            return res.status(201).json(createdData)   
            
        } catch (error: any) {
            console.error('Erro ao criar agendamento:', error)
            return res.status(500).json({ 
                message: 'Erro ao criar agendamento', 
                error: error.message 
            })
        } finally {
            console.log('================================================')
        }
    }

    /**
     * Cria sessão de checkout do MercadoPago e retorna o link
     * O agendamento será criado pelo webhook após confirmação do pagamento
     */
    async createAgendamentoMercadoPago(req: any, res: any) {
        console.log('========== CREATE MERCADO PAGO CHECKOUT DEBUG ==========')
        console.log('Body recebido:', req.body)
        try {
            const { nome, email, telefone, data_hora, produto_id, produto_nome, valor, duracao_minutos, usuario_id, cliente_id } = req.body
            
            console.log('IDs recebidos:', { usuario_id, cliente_id })
            
            // Validação básica
            if (!nome || !email || !telefone || !data_hora || !produto_id || !produto_nome || !valor) {
                return res.status(400).json({ 
                    message: 'Campos obrigatórios: nome, email, telefone, data_hora, produto_id, produto_nome, valor' 
                })
            }

            // Normaliza data_hora para UTC
            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`

            // Verifica disponibilidade do horário antes de criar o checkout
            const duracao = duracao_minutos || 60
            const disponibilidade = await this.verificarDisponibilidade(dataHoraIso, duracao)

            if (!disponibilidade.disponivel) {
                return res.status(409).json({ 
                    message: 'Horário indisponível',
                    conflitos: disponibilidade.agendamentos 
                })
            }

            // 1. Cria o agendamento como PENDENTE no banco
            const agendamentoPendente = {
                nome,
                email,
                telefone,
                data_hora: dataHoraIso,
                produto_id,
                duracao_minutos: duracao,
                status: 'agendado',
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null
            }
            
            const createdAgendamento = await ComercialRepository.createAgendamento(agendamentoPendente)
            console.log('Agendamento PENDENTE criado no banco:', createdAgendamento.id)

            // 2. Cria a preferência de checkout no MercadoPago
            const MercadoPagoService = (await import('../services/MercadoPagoService')).default
            const checkout = await MercadoPagoService.createCheckoutPreference({
                nome,
                email,
                telefone,
                data_hora: dataHoraIso,
                produto_id,
                produto_nome,
                valor,
                duracao_minutos: duracao,
                usuario_id: usuario_id || undefined,
                cliente_id: cliente_id || undefined,
                agendamento_id: createdAgendamento.id
            })

            console.log('Checkout MercadoPago criado:', checkout.preferenceId)

            return res.status(200).json({
                checkoutUrl: checkout.checkoutUrl,
                preferenceId: checkout.preferenceId,
                agendamentoId: createdAgendamento.id,
                message: 'Agendamento reservado. Aguardando pagamento.'
            })
            
        } catch (error: any) {
            console.error('Erro ao criar checkout MercadoPago:', error)
            return res.status(500).json({ 
                message: 'Erro ao criar checkout', 
                error: error.message 
            })
        } finally {
            console.log('========================================================')
        }
    }   

    /**
     * Cria sessão de checkout do Stripe e retorna o link
     * O agendamento será criado pelo webhook após confirmação do pagamento
     */
    async createAgendamentoStripe(req: any, res: any) {
        console.log('========== CREATE STRIPE CHECKOUT DEBUG ==========')
        console.log('Body recebido:', req.body)
        try {
            const { nome, email, telefone, data_hora, produto_id, produto_nome, valor, duracao_minutos, isEuro, usuario_id, cliente_id } = req.body
            
            console.log('IDs recebidos:', { usuario_id, cliente_id })
            
            // Validação básica
            if (!nome || !email || !telefone || !data_hora || !produto_id || !produto_nome || !valor) {
                return res.status(400).json({ 
                    message: 'Campos obrigatórios: nome, email, telefone, data_hora, produto_id, produto_nome, valor' 
                })
            }

            // Normaliza data_hora para UTC
            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`

            // Verifica disponibilidade do horário antes de criar o checkout
            const duracao = duracao_minutos || 60
            const disponibilidade = await this.verificarDisponibilidade(dataHoraIso, duracao)

            if (!disponibilidade.disponivel) {
                return res.status(409).json({ 
                    message: 'Horário indisponível',
                    conflitos: disponibilidade.agendamentos 
                })
            }

            // 1. Cria o agendamento como PENDENTE no banco
            const agendamentoPendente = {
                nome,
                email,
                telefone,
                data_hora: dataHoraIso,
                produto_id,
                duracao_minutos: duracao,
                status: 'agendado',
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null
            }
            
            const createdAgendamento = await ComercialRepository.createAgendamento(agendamentoPendente)
            console.log('Agendamento PENDENTE criado via Stripe no banco:', createdAgendamento.id)

            // 2. Cria a sessão de checkout no Stripe
            const StripeService = (await import('../services/StripeService')).default
            const checkout = await StripeService.createCheckoutSession({
                nome,
                email,
                telefone,
                data_hora: dataHoraIso,
                produto_id,
                produto_nome,
                valor: Math.round(valor * 100), // Converte para centavos
                duracao_minutos: duracao,
                isEuro: isEuro ?? true,
                usuario_id: usuario_id || undefined,
                cliente_id: cliente_id || undefined,
                agendamento_id: createdAgendamento.id // Passa o ID para o webhook
            })

            console.log('Checkout Stripe criado:', checkout.sessionId)

            return res.status(200).json({
                checkoutUrl: checkout.checkoutUrl,
                sessionId: checkout.sessionId,
                agendamentoId: createdAgendamento.id,
                message: 'Agendamento reservado. Aguardando pagamento.'
            })
            
        } catch (error: any) {
            console.error('Erro ao criar checkout Stripe:', error)
            return res.status(500).json({ 
                message: 'Erro ao criar checkout', 
                error: error.message 
            })
        } finally {
            console.log('==================================================')
        }
    }   

    /**
     * Processa o webhook do Stripe para confirmar agendamento após o pagamento
     */
    async handleStripeWebhook(req: any, res: any) {
        const sig = req.headers['stripe-signature']
        const StripeService = (await import('../services/StripeService')).default

        let event

        try {
            // req.body deve ser o RAW body para validação da assinatura
            event = StripeService.validateWebhookSignature(req.body, sig)
        } catch (err: any) {
            console.error('Erro na validação do Webhook Stripe:', err.message)
            return res.status(400).send(`Webhook Error: ${err.message}`)
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any
                const metadata = session.metadata

                if (metadata && metadata.tipo === 'agendamento') {
                    try {
                        console.log('========== STRIPE WEBHOOK AGENDAMENTO DEBUG ==========')
                        console.log('Metadata recebido do Stripe:', metadata)
                        
                        const status = 'agendado'; // Pagamento confirmado
                        const agendamentoId = metadata.agendamento_id;

                        if (agendamentoId) {
                            console.log('Atualizando agendamento existente:', agendamentoId)
                            await ComercialRepository.updateAgendamentoStatus(agendamentoId, status)
                        } else {
                            // Fallback caso não tenha o ID (legado ou erro)
                            console.log('ID não encontrado no metadata, criando novo agendamento...')
                            const agendamento = {
                                nome: metadata.nome,
                                email: metadata.email,
                                telefone: metadata.telefone,
                                data_hora: metadata.data_hora,
                                produto_id: metadata.produto_id,
                                duracao_minutos: parseInt(metadata.duracao_minutos) || 60,
                                status: status,
                                usuario_id: metadata.usuario_id && metadata.usuario_id !== '' ? metadata.usuario_id : null,
                                cliente_id: metadata.cliente_id && metadata.cliente_id !== '' ? metadata.cliente_id : null
                            }
                            await ComercialRepository.createAgendamento(agendamento)
                        }
                        
                        console.log('Agendamento processado com sucesso via Webhook Stripe')
                    } catch (error: any) {
                        console.error('Erro ao processar agendamento via Webhook Stripe:', error)
                        return res.status(500).json({ message: 'Erro ao processar agendamento' })
                    } finally {
                        console.log('========================================================')
                    }
                } 
else if (metadata && metadata.tipo === 'orcamento') {
                    try {
                        const documentoIds = metadata.documentoIds?.split(',') || []
                        console.log('Pagamento Stripe confirmado para orçamentos:', documentoIds)
                        
                        const TraducoesRepository = (await import('../repositories/TraducoesRepository')).default
                        
                        for (const docId of documentoIds) {
                            const orcamento = await TraducoesRepository.getOrcamentoByDocumento(docId)
                            if (orcamento) {
                                await TraducoesRepository.aprovarOrcamento(orcamento.id, docId)
                            }
                        }
                        console.log('Orçamentos aprovados com sucesso via Webhook Stripe')
                    } catch (error: any) {
                        console.error('Erro ao aprovar orçamentos via Webhook Stripe:', error)
                        return res.status(500).json({ message: 'Erro ao processar aprovação de orçamentos' })
                    }
                }
                break
            }
            default:
                console.log(`Evento Stripe não processado: ${event.type}`)
        }

        // Return a 200 response to acknowledge receipt of the event
        res.json({ received: true })
    }

    async verificarDisponibilidade(data_hora: string, duracao_minutos: number) {
        console.log('Verificando disponibilidade para:', data_hora, duracao_minutos)
        
        // Garante parsing em UTC
        const inicioUTC = data_hora.endsWith('Z') ? data_hora : `${data_hora}Z`
        const inicio = new Date(inicioUTC)
        const fim = new Date(inicio.getTime() + duracao_minutos * 60000)
        
        const inicioIso = inicio.toISOString()
        const fimIso = fim.toISOString()
        
        // Busca agendamentos conflitantes no repository (intervalo fechado no início, aberto no fim)
        const agendamentos = await ComercialRepository.getAgendamentosByIntervalo(
            inicioIso,
            fimIso
        )
        
        // Se encontrou algum agendamento, o horário está ocupado
        const disponivel = agendamentos.length === 0
        
        console.log('Disponibilidade:', disponivel, 'Conflitos:', agendamentos.length)
        
        return {
            disponivel,
            agendamentos
        }
    }

    async checkDisponibilidade(req: any, res: any) {
        try {
            const { data_hora, duracao_minutos } = req.query
            
            if (!data_hora) {
                return res.status(400).json({ message: 'data_hora é obrigatório' })
            }

            const dataHoraIso = (data_hora as string)?.endsWith('Z')
                ? (data_hora as string)
                : `${data_hora as string}Z`

            const resultado = await this.verificarDisponibilidade(
                dataHoraIso,
                parseInt(duracao_minutos as string) || 60
            )

            return res.status(200).json(resultado)
            
        } catch (error: any) {
            console.error('Erro ao verificar disponibilidade:', error)
            return res.status(500).json({ 
                message: 'Erro ao verificar disponibilidade', 
                error: error.message 
            })
        }
    }

    async getAgendamentosByUsuario(req: any, res: any) {
        try {
            const { usuarioId } = req.params
            
            if (!usuarioId) {
                return res.status(400).json({ message: 'usuarioId é obrigatório' })
            }

            const agendamentos = await ComercialRepository.getAgendamentosByUsuario(usuarioId)

            return res.status(200).json({
                message: 'Agendamentos recuperados com sucesso',
                data: agendamentos
            })
            
        } catch (error: any) {
            console.error('Erro ao buscar agendamentos do usuário:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar agendamentos do usuário', 
                error: error.message 
            })
        }
    }

    async getAgendamentosByData(req: any, res: any) {
        try {
            const { data } = req.params
            
            if (!data) {
                return res.status(400).json({ message: 'data é obrigatório' })
            }

            const agendamentos = await ComercialRepository.getAgendamentosByData(data)

            return res.status(200).json(agendamentos)
            
        } catch (error: any) {
            console.error('Erro ao buscar agendamentos:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar agendamentos', 
                error: error.message 
            })
        }
    }

    /**
     * Processa o webhook do MercadoPago para confirmar agendamento
     */
    async handleMercadoPagoWebhook(req: any, res: any) {
        console.log('========== MERCADO PAGO WEBHOOK DEBUG ==========')
        const { type, data } = req.body
        console.log('Evento recebido:', { type, resource: data?.id })

        if (type === 'payment' && data?.id) {
            try {
                const MercadoPagoService = (await import('../services/MercadoPagoService')).default
                const payment = await MercadoPagoService.getPayment(data.id)
                console.log('Status do pagamento:', payment.status)

                if (payment.status === 'approved' && payment.metadata?.tipo === 'agendamento') {
                    const metadata = payment.metadata
                    console.log('Metadata recuperado:', metadata)

                    const status = 'agendado';
                    const agendamentoId = metadata.agendamento_id;

                    if (agendamentoId) {
                        console.log('Atualizando agendamento existente via Mercado Pago:', agendamentoId)
                        await ComercialRepository.updateAgendamentoStatus(agendamentoId, status)
                    } else {
                        // Fallback
                        const agendamento = {
                            nome: metadata.nome,
                            email: metadata.email,
                            telefone: metadata.telefone,
                            data_hora: metadata.data_hora,
                            produto_id: metadata.produto_id,
                            duracao_minutos: parseInt(metadata.duracao_minutos) || 60,
                            status: status,
                            usuario_id: metadata.usuario_id && metadata.usuario_id !== '' ? metadata.usuario_id : null,
                            cliente_id: metadata.cliente_id && metadata.cliente_id !== '' ? metadata.cliente_id : null
                        }
                        await ComercialRepository.createAgendamento(agendamento)
                    }
                    console.log('Agendamento confirmado via Mercado Pago')
                }
            } catch (error: any) {
                console.error('Erro no processamento do webhook MercadoPago:', error)
            } finally {
                console.log('================================================')
            }
        }

        return res.status(200).send('OK')
    }

}

export default new ComercialController()