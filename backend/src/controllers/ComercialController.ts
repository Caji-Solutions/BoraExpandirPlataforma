import { supabase } from '../config/SupabaseClient'
import type { ClienteDTO } from '../types/parceiro';
import ComercialRepository from '../repositories/ComercialRepository';
import AdmRepository from '../repositories/AdmRepository';
import ContratoServicoRepository from '../repositories/ContratoServicoRepository';
import EmailService from '../services/EmailService';
import NotificationService from '../services/NotificationService';
import { normalizeCpf, normalizePhone } from '../utils/normalizers';


class ComercialController {
    private mergeDraftDados(baseDraft: any, incomingDraft: any) {
        const base = (baseDraft && typeof baseDraft === 'object') ? baseDraft : {}
        const incoming = (incomingDraft && typeof incomingDraft === 'object') ? incomingDraft : {}
        return { ...base, ...incoming }
    }

    private buildErroGeracaoDraft(mensagem: string) {
        return {
            ativo: true,
            etapa: 4,
            mensagem,
            ocorrido_em: new Date().toISOString()
        }
    }

    private async notificarClienteContrato(params: {
        clienteId?: string | null
        titulo: string
        mensagem: string
        tipo: 'info' | 'success' | 'warning' | 'error' | 'agendamento'
    }) {
        if (!params.clienteId) return
        try {
            await NotificationService.createNotification({
                clienteId: params.clienteId,
                titulo: params.titulo,
                mensagem: params.mensagem,
                tipo: params.tipo
            })
        } catch (notificationError) {
            console.error('[ComercialController] Erro ao criar notificaÃ§Ã£o de contrato:', notificationError)
        }
    }

    async createAgendamento(req: any, res: any) {
        console.log('========== CREATE AGENDAMENTO DEBUG ==========')
        console.log('Body completo recebido:', req.body)
        try {
            const { nome, email, telefone, data_hora, produto_id, duracao_minutos, status, usuario_id, cliente_id, requer_delegacao, pagamento_status } = req.body
            const telefoneNormalizado = normalizePhone(telefone)

            console.log('IDs recebidos:', { usuario_id, cliente_id })

            // ValidaÃ§Ã£o bÃ¡sica
            if (!nome || !email || !telefoneNormalizado || !data_hora || !produto_id) {
                console.error('Campos obrigatÃ³rios faltando:', { nome, email, telefone, data_hora, produto_id })
                return res.status(400).json({
                    message: 'Campos obrigatÃ³rios: nome, email, telefone, data_hora, produto_id'
                })
            }

            // Normaliza data_hora para UTC (evita falsos negativos na checagem)
            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`

            // Verifica disponibilidade do horÃ¡rio
            const duracao = duracao_minutos || 60
            const disponibilidade = await this.verificarDisponibilidade(dataHoraIso, duracao)
            console.log('Disponibilidade verificada:', disponibilidade)

            if (!disponibilidade.disponivel) {
                return res.status(409).json({
                    message: 'HorÃ¡rio indisponÃ­vel',
                    conflitos: disponibilidade.agendamentos
                })
            }

            const agendamento = {
                nome,
                email,
                telefone: telefoneNormalizado,
                data_hora: dataHoraIso,
                produto_id,
                duracao_minutos: duracao,
                status: status || 'agendado',
                pagamento_status: pagamento_status || 'pendente',
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null,
                requer_delegacao: requer_delegacao !== undefined ? requer_delegacao : false
            }

            // Fallback: se o frontend nÃ£o enviou requer_delegacao, tenta buscar do catÃ¡logo
            if (requer_delegacao === undefined && produto_id) {
                try {
                    const servico = await AdmRepository.getServiceById(produto_id)
                    if (servico && servico.requer_delegacao_juridico) {
                        agendamento.requer_delegacao = true;
                        console.log('Fallbakc: requer_delegacao atribuido via catalogo para produto:', produto_id);
                    }
                } catch (err) {
                    console.error('Erro no fallback de requer_delegacao:', err);
                }
            }

            console.log('Objeto agendamento final para envio ao DB:', agendamento)
            const createdData = await ComercialRepository.createAgendamento(agendamento)
            console.log('Agendamento criado com sucesso:', createdData)

            // Verificar se o lead jÃ¡ preencheu o formulÃ¡rio em outro agendamento
            let avisoFormularioPreenchido = false
            try {
                if (email) {
                    const { data: clienteExistente } = await supabase
                        .from('clientes')
                        .select('user_id')
                        .eq('email', email)
                        .maybeSingle()
                    if (clienteExistente?.user_id) avisoFormularioPreenchido = true
                }
                if (!avisoFormularioPreenchido && telefoneNormalizado) {
                    const { data: clientePorTel } = await supabase
                        .from('clientes')
                        .select('user_id')
                        .eq('whatsapp', telefoneNormalizado)
                        .maybeSingle()
                    if (clientePorTel?.user_id) avisoFormularioPreenchido = true
                }
            } catch (checkErr) {
                console.warn('Erro ao verificar formulÃ¡rio preenchido do lead:', checkErr)
            }

            return res.status(201).json({ ...createdData, aviso_formulario_preenchido: avisoFormularioPreenchido })

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
     * Cria sessÃ£o de checkout do MercadoPago e retorna o link
     * O agendamento serÃ¡ criado pelo webhook apÃ³s confirmaÃ§Ã£o do pagamento
     */
    async createAgendamentoMercadoPago(req: any, res: any) {
        console.log('========== CREATE MERCADO PAGO CHECKOUT DEBUG ==========')
        console.log('Body recebido:', req.body)
        try {
            const { nome, email, telefone, data_hora, produto_id, produto_nome, valor, duracao_minutos, usuario_id, cliente_id } = req.body
            const telefoneNormalizado = normalizePhone(telefone)

            console.log('IDs recebidos:', { usuario_id, cliente_id })

            // ValidaÃ§Ã£o bÃ¡sica
            if (!nome || !email || !telefoneNormalizado || !data_hora || !produto_id || !produto_nome || !valor) {
                return res.status(400).json({
                    message: 'Campos obrigatÃ³rios: nome, email, telefone, data_hora, produto_id, produto_nome, valor'
                })
            }

            // Normaliza data_hora para UTC
            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`

            // Verifica disponibilidade do horÃ¡rio antes de criar o checkout
            const duracao = duracao_minutos || 60
            const disponibilidade = await this.verificarDisponibilidade(dataHoraIso, duracao)

            if (!disponibilidade.disponivel) {
                return res.status(409).json({
                    message: 'HorÃ¡rio indisponÃ­vel',
                    conflitos: disponibilidade.agendamentos
                })
            }

            // 0. Verificar se o serviÃ§o requer delegaÃ§Ã£o jurÃ­dica
            const catalogoServico = await AdmRepository.getServiceById(produto_id)
            const requerDelegacao = catalogoServico?.requer_delegacao_juridico || false

            // 1. Cria o agendamento como PENDENTE no banco
            const agendamentoPendente = {
                nome,
                email,
                telefone: telefoneNormalizado,
                data_hora: dataHoraIso,
                produto_id,
                produto_nome,
                valor: valor,
                is_euro: false,
                duracao_minutos: duracao,
                status: 'agendado',
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null,
                requer_delegacao: requerDelegacao
            }

            const createdAgendamento = await ComercialRepository.createAgendamento(agendamentoPendente)
            console.log('Agendamento PENDENTE criado no banco:', createdAgendamento.id)

            // 2. Cria a preferÃªncia de checkout no MercadoPago
            const MercadoPagoService = (await import('../services/MercadoPagoService')).default
            const checkout = await MercadoPagoService.createCheckoutPreference({
                nome,
                email,
                telefone: telefoneNormalizado,
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

            // Atualiza com o checkout_url se possÃ­vel para o cliente ver no dashboard depois
            try {
                await ComercialRepository.updateAgendamentoCheckoutUrl(createdAgendamento.id, checkout.checkoutUrl)
            } catch (err) {
                console.warn('NÃ£o foi possÃ­vel atualizar checkout_url no agendamento:', err)
            }

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
     * Atualiza um agendamento existente
     */
    async updateAgendamento(req: any, res: any) {
        console.log('========== UPDATE AGENDAMENTO (PIX) DEBUG ==========')
        try {
            const { id } = req.params
            const { nome, email, telefone, data_hora, produto_id, produto_nome, valor, duracao_minutos, usuario_id, cliente_id, metodo_pagamento } = req.body
            const telefoneNormalizado = normalizePhone(telefone)

            if (!nome || !email || !telefoneNormalizado || !data_hora || !produto_id || !produto_nome || !valor) {
                return res.status(400).json({ message: 'Campos obrigatÃ³rios ausentes' })
            }

            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`
            const duracao = duracao_minutos || 60

            // Opcional: verificar disponibilidade novamente se a data/hora mudou,
            // mas para simplificar, permitimos a ediÃ§Ã£o por ser uma aÃ§Ã£o do consultor

            const agendamentoAtualizado = {
                nome,
                email,
                telefone: telefoneNormalizado,
                data_hora: dataHoraIso,
                produto_id,
                produto_nome,
                valor,
                duracao_minutos: duracao,
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null,
                metodo_pagamento: metodo_pagamento || 'pix'
            }

            const updatedData = await ComercialRepository.updateAgendamentoFull(id, agendamentoAtualizado)

            return res.status(200).json(updatedData)
        } catch (error: any) {
            console.error('Erro ao atualizar agendamento:', error)
            return res.status(500).json({ message: 'Erro ao atualizar agendamento' })
        }
    }

    /**
     * Cria sessÃ£o de checkout do Stripe e retorna o link
     */
    async createAgendamentoStripe(req: any, res: any) {
        console.log('========== CREATE STRIPE CHECKOUT DEBUG ==========')
        try {
            const { nome, email, telefone, data_hora, produto_id, produto_nome, valor, duracao_minutos, isEuro, usuario_id, cliente_id } = req.body
            const telefoneNormalizado = normalizePhone(telefone)

            if (!nome || !email || !telefoneNormalizado || !data_hora || !produto_id || !produto_nome || !valor) {
                return res.status(400).json({ message: 'Campos obrigatÃ³rios ausentes' })
            }

            const dataHoraIso = data_hora?.endsWith('Z') ? data_hora : `${data_hora}Z`
            const duracao = duracao_minutos || 60
            const disponibilidade = await this.verificarDisponibilidade(dataHoraIso, duracao)

            if (!disponibilidade.disponivel) {
                return res.status(409).json({ message: 'HorÃ¡rio indisponÃ­vel' })
            }

            // 0. Verificar se o serviÃ§o requer delegaÃ§Ã£o jurÃ­dica
            const catalogoServico = await AdmRepository.getServiceById(produto_id)
            const requerDelegacao = catalogoServico?.requer_delegacao_juridico || false

            const agendamentoPendente = {
                nome,
                email,
                telefone: telefoneNormalizado,
                data_hora: dataHoraIso,
                produto_id,
                produto_nome,
                valor,
                is_euro: isEuro ?? true,
                duracao_minutos: duracao,
                status: 'agendado',
                usuario_id: usuario_id || null,
                cliente_id: cliente_id || null,
                requer_delegacao: requerDelegacao
            }

            const createdAgendamento = await ComercialRepository.createAgendamento(agendamentoPendente)

            const StripeService = (await import('../services/StripeService')).default
            const checkout = await StripeService.createCheckoutSession({
                nome,
                email,
                telefone: telefoneNormalizado,
                data_hora: dataHoraIso,
                produto_id,
                produto_nome,
                valor: Math.round(valor * 100),
                duracao_minutos: duracao,
                isEuro: isEuro ?? true,
                usuario_id: usuario_id || undefined,
                cliente_id: cliente_id || undefined,
                agendamento_id: createdAgendamento.id
            })

            try {
                await ComercialRepository.updateAgendamentoCheckoutUrl(createdAgendamento.id, checkout.checkoutUrl)
            } catch (err) {
                console.warn('Erro ao salvar checkout_url stripe:', err)
            }

            return res.status(200).json({
                checkoutUrl: checkout.checkoutUrl,
                sessionId: checkout.sessionId,
                agendamentoId: createdAgendamento.id
            })

        } catch (error: any) {
            console.error('Erro ao criar checkout Stripe:', error)
            return res.status(500).json({ message: 'Erro ao criar checkout' })
        }
    }

    /**
     * Regenera um checkout para um agendamento existente
     */
    async regenerateCheckout(req: any, res: any) {
        try {
            const { id } = req.params
            const agendamento = await ComercialRepository.getAgendamentoById(id)

            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento nÃ£o encontrado' })
            }

            if (agendamento.status !== 'agendado') {
                return res.status(400).json({ message: 'Este agendamento jÃ¡ foi processado ou cancelado.' })
            }

            // Assume o valor salvo no banco ou o que veio na criaÃ§Ã£o
            const valor = agendamento.valor || 0
            const isEuro = agendamento.is_euro !== false // Default true se nÃ£o especificado

            let checkoutUrl = ''

            if (isEuro) {
                const StripeService = (await import('../services/StripeService')).default
                const checkout = await StripeService.createCheckoutSession({
                    nome: agendamento.nome,
                    email: agendamento.email,
                    telefone: agendamento.telefone,
                    data_hora: agendamento.data_hora,
                    produto_id: agendamento.produto_id,
                    produto_nome: agendamento.produto_nome || 'Consultoria',
                    valor: Math.round(valor * 100),
                    duracao_minutos: agendamento.duracao_minutos,
                    isEuro: true,
                    agendamento_id: agendamento.id
                })
                checkoutUrl = checkout.checkoutUrl
            } else {
                const MercadoPagoService = (await import('../services/MercadoPagoService')).default
                const checkout = await MercadoPagoService.createCheckoutPreference({
                    nome: agendamento.nome,
                    email: agendamento.email,
                    telefone: agendamento.telefone,
                    data_hora: agendamento.data_hora,
                    produto_id: agendamento.produto_id,
                    produto_nome: agendamento.produto_nome || 'Consultoria',
                    valor: valor,
                    duracao_minutos: agendamento.duracao_minutos,
                    agendamento_id: agendamento.id
                })
                checkoutUrl = checkout.checkoutUrl
            }

            // Salva o novo link
            await ComercialRepository.updateAgendamentoCheckoutUrl(id, checkoutUrl)

            return res.status(200).json({ checkoutUrl })

        } catch (error: any) {
            console.error('Erro ao regenerar checkout:', error)
            return res.status(500).json({ message: 'Erro ao gerar novo link de pagamento' })
        }
    }

    /**
     * Processa o webhook do Stripe para confirmar agendamento apÃ³s o pagamento
     */
    async handleStripeWebhook(req: any, res: any) {
        const sig = req.headers['stripe-signature']
        const StripeService = (await import('../services/StripeService')).default

        let event

        try {
            // req.body deve ser o RAW body para validaÃ§Ã£o da assinatura
            event = StripeService.validateWebhookSignature(req.body, sig)
        } catch (err: any) {
            console.error('Erro na validaÃ§Ã£o do Webhook Stripe:', err.message)
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

                        const status = 'aprovado'; // Pagamento confirmado para o cliente
                        const agendamentoId = metadata.agendamento_id;

                        if (agendamentoId) {
                            console.log('Atualizando agendamento existente:', agendamentoId)
                            await ComercialRepository.updateAgendamentoStatus(agendamentoId, status)
                        } else {
                            // Fallback caso nÃ£o tenha o ID (legado ou erro)
                            console.log('ID nÃ£o encontrado no metadata, criando novo agendamento...')
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
                        console.log('Pagamento Stripe confirmado para orÃ§amentos:', documentoIds)

                        const TraducoesRepository = (await import('../repositories/TraducoesRepository')).default

                        for (const docId of documentoIds) {
                            const orcamento = await TraducoesRepository.getOrcamentoByDocumento(docId)
                            if (orcamento) {
                                await TraducoesRepository.aprovarOrcamento(orcamento.id)
                            }
                        }
                        console.log('OrÃ§amentos aprovados com sucesso via Webhook Stripe')
                    } catch (error: any) {
                        console.error('Erro ao aprovar orÃ§amentos via Webhook Stripe:', error)
                        return res.status(500).json({ message: 'Erro ao processar aprovaÃ§Ã£o de orÃ§amentos' })
                    }
                }
                break
            }
            default:
                console.log(`Evento Stripe nÃ£o processado: ${event.type}`)
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

        // Busca agendamentos conflitantes no repository (intervalo fechado no inÃ­cio, aberto no fim)
        const agendamentos = await ComercialRepository.getAgendamentosByIntervalo(
            inicioIso,
            fimIso
        )

        // Se encontrou algum agendamento, o horÃ¡rio estÃ¡ ocupado
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
                return res.status(400).json({ message: 'data_hora Ã© obrigatÃ³rio' })
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
                return res.status(400).json({ message: 'usuarioId Ã© obrigatÃ³rio' })
            }

            const agendamentos = await ComercialRepository.getAgendamentosByUsuario(usuarioId)

            // Buscar informaÃ§Ãµes do catÃ¡logo para cada agendamento
            const enrichedAgendamentos = await Promise.all(agendamentos.map(async (agendamento: any) => {
                if (agendamento.produto_id) {
                    try {
                        const serviceInfo = await AdmRepository.getServiceById(agendamento.produto_id)
                        return { ...agendamento, produto: serviceInfo }
                    } catch (e) {
                        console.error(`Erro ao buscar serviÃ§o ${agendamento.produto_id}:`, e)
                    }
                }
                return agendamento
            }))

            return res.status(200).json(enrichedAgendamentos)

        } catch (error: any) {
            console.error('Erro ao buscar agendamentos do usuÃ¡rio:', error)
            return res.status(500).json({
                message: 'Erro ao buscar agendamentos do usuÃ¡rio',
                error: error.message
            })
        }
    }

    async getAgendamentosByData(req: any, res: any) {
        try {
            const { data } = req.params

            if (!data) {
                return res.status(400).json({ message: 'data Ã© obrigatÃ³rio' })
            }

            const agendamentos = await ComercialRepository.getAgendamentosByData(data)

            // Buscar informaÃ§Ãµes do catÃ¡logo para cada agendamento
            const enrichedAgendamentos = await Promise.all(agendamentos.map(async (agendamento: any) => {
                if (agendamento.produto_id) {
                    try {
                        const serviceInfo = await AdmRepository.getServiceById(agendamento.produto_id)
                        return { ...agendamento, produto: serviceInfo }
                    } catch (e) {
                        console.error(`Erro ao buscar serviÃ§o ${agendamento.produto_id}:`, e)
                    }
                }
                return agendamento
            }))

            return res.status(200).json(enrichedAgendamentos)

        } catch (error: any) {
            console.error('Erro ao buscar agendamentos:', error)
            return res.status(500).json({
                message: 'Erro ao buscar agendamentos',
                error: error.message
            })
        }
    }

    async getAgendamentosByCliente(req: any, res: any) {
        try {
            const { clienteId } = req.params

            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId Ã© obrigatÃ³rio' })
            }

            const agendamentos = await ComercialRepository.getAgendamentosByCliente(clienteId)

            // Buscar informaÃ§Ãµes do catÃ¡logo para cada agendamento
            const enrichedAgendamentos = await Promise.all(agendamentos.map(async (agendamento: any) => {
                if (agendamento.produto_id) {
                    try {
                        const serviceInfo = await AdmRepository.getServiceById(agendamento.produto_id)
                        return { ...agendamento, produto: serviceInfo }
                    } catch (e) {
                        console.error(`Erro ao buscar serviÃ§o ${agendamento.produto_id}:`, e)
                    }
                }
                return agendamento
            }))

            return res.status(200).json(enrichedAgendamentos)

        } catch (error: any) {
            console.error('Erro ao buscar agendamentos do cliente:', error)
            return res.status(500).json({
                message: 'Erro ao buscar agendamentos do cliente',
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

                    const status = 'aprovado';
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

    /**
     * ConfirmaÃ§Ã£o manual de PIX por parte do comercial.
     * Agora apenas marca como 'aguardando_verificacao' â€” a confirmaÃ§Ã£o real
     * e o envio de SMTP sÃ£o feitos pelo setor financeiro (FinanceiroController).
     */
    async confirmarPix(req: any, res: any) {
        try {
            const { id } = req.params;

            // 1. Get agendamento
            const agendamento = await ComercialRepository.getAgendamentoById(id);
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento nÃ£o encontrado' });
            }

            // 2. Verifica se jÃ¡ estÃ¡ confirmado
            if (agendamento.status === 'confirmado' || agendamento.status === 'aprovado') {
                return res.status(400).json({ message: 'Este agendamento jÃ¡ estÃ¡ confirmado.' });
            }

            // 3. Verifica se tem comprovante
            if (!agendamento.comprovante_url) {
                return res.status(400).json({ message: 'Ã‰ necessÃ¡rio enviar o comprovante antes de confirmar.' });
            }

            // 4. Update status para aguardando_verificacao (financeiro irÃ¡ aprovar/recusar)
            await ComercialRepository.updateAgendamentoStatus(id, 'aguardando_verificacao');

            // 5. Garantir que pagamento_status esteja como 'pendente' para o financeiro
            const { error: updateError } = await supabase
                .from('agendamentos')
                .update({ pagamento_status: 'em_analise' })
                .eq('id', id);

            if (updateError) {
                console.error('[ComercialController] Erro ao atualizar pagamento_status:', updateError);
            }

            return res.status(200).json({
                success: true,
                message: 'Comprovante enviado para verificaÃ§Ã£o pelo setor financeiro.'
            });

        } catch (error: any) {
            console.error('Erro ao confirmar PIX manualmente:', error);
            return res.status(500).json({ message: 'Erro ao confirmar PIX', error: error.message });
        }
    }

    /**
     * Buscar um agendamento especÃ­fico por ID
     */
    async getAgendamentoById(req: any, res: any) {
        try {
            const { id } = req.params

            const data = await ComercialRepository.getAgendamentoById(id)

            if (!data) {
                return res.status(404).json({ message: 'Agendamento nÃ£o encontrado' })
            }

            // Enriquecer com dados do catÃ¡logo
            if (data.produto_id) {
                try {
                    const serviceInfo = await AdmRepository.getServiceById(data.produto_id)
                    data.produto = serviceInfo
                } catch (e) {
                    console.error(`Erro ao buscar serviÃ§o ${data.produto_id}:`, e)
                }
            }

            // Enriquecer com dados do formulÃ¡rio
            let formulario_preenchido = false
            try {
                const { data: formEnviado } = await supabase
                    .from('formularios_cliente')
                    .select('id')
                    .eq('agendamento_id', id)
                    .maybeSingle()

                if (formEnviado) {
                    formulario_preenchido = true
                }
            } catch (err) {
                console.warn('Erro ao verificar formulÃ¡rio preenchido:', err)
            }

            return res.status(200).json({
                ...data,
                formulario_preenchido
            })
        } catch (error: any) {
            console.error('Erro ao buscar agendamento por ID:', error)
            return res.status(500).json({ message: 'Erro ao buscar agendamento', error: error.message })
        }
    }

    /**
     * Verifica se o formulÃ¡rio foi preenchido pelo cliente (Lead -> Cadastro)
     */
    async verificarStatusFormulario(req: any, res: any) {
        try {
            const { id } = req.params;

            // 1. Get agendamento
            const agendamento = await ComercialRepository.getAgendamentoById(id);
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento nÃ£o encontrado' });
            }

            // 2. Verifica se o cliente jÃ¡ virou user_id
            if (agendamento.cliente_id) {
                const { data: cliente, error } = await supabase
                    .from('clientes')
                    .select('user_id')
                    .eq('id', agendamento.cliente_id)
                    .single()

                if (!error && cliente?.user_id) {
                    return res.status(200).json({ preenchido: true })
                }
            }

            // Alternativa: ver se jÃ¡ existe email atrelado Ã  tabela clientes que virou user_id
            if (agendamento.email) {
                const { data: clientePorEmail, error: errEmail } = await supabase
                    .from('clientes')
                    .select('user_id')
                    .eq('email', agendamento.email)
                    .maybeSingle()

                if (!errEmail && clientePorEmail?.user_id) {
                    return res.status(200).json({ preenchido: true })
                }
            }

            return res.status(200).json({ preenchido: false });

        } catch (error: any) {
            console.error('Erro ao verificar status do formulÃ¡rio:', error);
            return res.status(500).json({ preenchido: false, error: error.message });
        }
    }

    async getAllAgendamentos(req: any, res: any) {
        try {
            const agendamentos = await ComercialRepository.getAllAgendamentos()
            return res.status(200).json(agendamentos)
        } catch (error: any) {
            console.error('Erro ao buscar todos os agendamentos:', error)
            return res.status(500).json({
                message: 'Erro ao buscar todos os agendamentos',
                error: error.message
            })
        }
    }

    /**
     * Cancelar um agendamento
     * POST /comercial/agendamento/:id/cancelar
     */
    async cancelarAgendamento(req: any, res: any) {
        try {
            const { id } = req.params

            const agendamento = await ComercialRepository.getAgendamentoById(id)
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento nÃ£o encontrado' })
            }

            if (agendamento.status === 'cancelado') {
                return res.status(400).json({ message: 'Este agendamento jÃ¡ estÃ¡ cancelado.' })
            }

            if (agendamento.status === 'realizado') {
                return res.status(400).json({ message: 'NÃ£o Ã© possÃ­vel cancelar um agendamento jÃ¡ realizado.' })
            }

            await ComercialRepository.updateAgendamentoStatus(id, 'cancelado')

            console.log(`[ComercialController] Agendamento ${id} cancelado com sucesso.`)

            return res.status(200).json({
                success: true,
                message: 'Agendamento cancelado com sucesso.'
            })

        } catch (error: any) {
            console.error('Erro ao cancelar agendamento:', error)
            return res.status(500).json({ message: 'Erro ao cancelar agendamento', error: error.message })
        }
    }

    /**
     * POST /comercial/contratos
     * Cria contrato para serviÃƒÂ§o fixo e envia email com PDF mock
     */
    async createContratoServico(req: any, res: any) {
        try {
            const { cliente_id, servico_id, usuario_id, subservico_id, subservico_nome } = req.body

            if (!cliente_id || !servico_id) {
                return res.status(400).json({ message: 'cliente_id e servico_id sÃ£o obrigatÃ³rios' })
            }

            const servico = await AdmRepository.getServiceById(servico_id)
            if (!servico) {
                return res.status(404).json({ message: 'ServiÃ§o nÃ£o encontrado' })
            }

            const servicoTipo = servico.tipo || 'agendavel'
            if (servicoTipo !== 'fixo') {
                return res.status(400).json({ message: 'ServiÃ§o nÃ£o Ã© do tipo fixo' })
            }

            const { data: cliente, error: clienteError } = await supabase
                .from('clientes')
                .select('*')
                .eq('id', cliente_id)
                .single()

            if (clienteError || !cliente) {
                console.error('[ComercialController] Cliente nÃ£o encontrado:', clienteError)
                return res.status(404).json({ message: 'Cliente nÃ£o encontrado' })
            }

            const ultimoContratoMesmoServico = await ContratoServicoRepository.getUltimoContratoComDados(cliente_id, servico_id)
            const ultimoContratoComDados = ultimoContratoMesmoServico
                || await ContratoServicoRepository.getUltimoContratoComDados(cliente_id)
            const ultimoDraftDados =
                ultimoContratoComDados?.draft_dados && typeof ultimoContratoComDados.draft_dados === 'object'
                    ? ultimoContratoComDados.draft_dados
                    : {}

            const clienteTelefoneNormalizado = normalizePhone(cliente.whatsapp || cliente.telefone)
            const clienteCpfNormalizado = normalizeCpf(cliente.cpf || cliente.documento)
            const tipoServicoPadrao = subservico_nome || servico.nome || 'Assessoria de Imigracao'

            const draftDadosPrefill: any = {
                ...ultimoDraftDados,
                nome: ultimoDraftDados?.nome || cliente.nome || '',
                email: ultimoDraftDados?.email || cliente.email || '',
                telefone: ultimoDraftDados?.telefone || clienteTelefoneNormalizado || '',
                documento: ultimoDraftDados?.documento || clienteCpfNormalizado || '',
                endereco: ultimoDraftDados?.endereco || cliente.endereco || '',
                tipo_servico: tipoServicoPadrao
            }

            if (subservico_nome) {
                draftDadosPrefill.subservico_nome = subservico_nome
            }
            if (subservico_id) {
                draftDadosPrefill.subservico_id = subservico_id
            }

            if (draftDadosPrefill.__erroGeracao) {
                delete draftDadosPrefill.__erroGeracao
            }

            const contratoPayload: any = {
                cliente_id,
                usuario_id: usuario_id || null,
                servico_id,
                servico_nome: servico.nome || null,
                servico_valor: servico.valor || 0,
                cliente_nome: cliente.nome || null,
                cliente_email: cliente.email || null,
                cliente_telefone: clienteTelefoneNormalizado,
                assinatura_status: 'pendente',
                pagamento_status: 'pendente',
                is_draft: true,
                etapa_fluxo: 1,
                draft_dados: draftDadosPrefill
            }

            // Incluir subservico se informado
            if (subservico_id) {
                contratoPayload.subservico_id = subservico_id
            }
            if (subservico_nome) {
                contratoPayload.subservico_nome = subservico_nome
            }

            const contrato = await ContratoServicoRepository.createContrato(contratoPayload)

            const contratoCompleto = await ContratoServicoRepository.getContratoById(contrato.id)

            return res.status(201).json({ data: contratoCompleto, is_draft: true })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao criar contrato:', error)
            return res.status(500).json({ message: 'Erro ao criar contrato', error: error.message })
        }
    }

    /**
     * GET /comercial/contratos
     */
    async getContratosServicos(req: any, res: any) {
        try {
            const clienteId = (req.query?.cliente_id || req.query?.clienteId) as string | undefined
            const isDraftRaw = req.query?.isDraft
            const isDraft =
                isDraftRaw === 'true' ? true
                    : isDraftRaw === 'false' ? false
                        : undefined

            const contratos = await ContratoServicoRepository.getContratos({ clienteId, isDraft })
            return res.status(200).json({ data: contratos })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao listar contratos:', error)
            return res.status(500).json({ message: 'Erro ao listar contratos', error: error.message })
        }
    }

    /**
     * GET /comercial/contratos/:id
     */
    async getContratoServicoById(req: any, res: any) {
        try {
            const { id } = req.params
            const contrato = await ContratoServicoRepository.getContratoById(id)
            return res.status(200).json({ data: contrato })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao buscar contrato:', error)
            return res.status(500).json({ message: 'Erro ao buscar contrato', error: error.message })
        }
    }

    /**
     * POST /comercial/contratos/:id/upload
     * Upload direto do contrato assinado pelo comercial
     */
    async uploadContratoAssinado(req: any, res: any) {
        try {
            const { id } = req.params
            const { usuario_id } = req.body
            const file = req.file

            if (!file) {
                return res.status(400).json({ message: 'Arquivo do contrato ÃƒÂ© obrigatÃƒÂ³rio' })
            }

            await ContratoServicoRepository.getContratoById(id)

            const timestamp = Date.now()
            const ext = file.originalname.split('.').pop() || 'pdf'
            const filePath = `contratos/${id}/${timestamp}_contrato_assinado.${ext}`

            const { error: uploadError } = await supabase.storage
                .from('documentos')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                })

            if (uploadError) {
                console.error('[ComercialController] Erro no upload do contrato:', uploadError)
                return res.status(500).json({ message: 'Erro ao fazer upload do contrato' })
            }

            const { data: urlData } = supabase.storage
                .from('documentos')
                .getPublicUrl(filePath)

            const updated = await ContratoServicoRepository.updateContrato(id, {
                contrato_assinado_url: urlData.publicUrl,
                contrato_assinado_path: filePath,
                contrato_assinado_nome_original: file.originalname,
                assinatura_status: 'aprovado',
                assinatura_upload_origem: 'comercial',
                assinatura_upload_por: usuario_id || null,
                assinatura_upload_em: new Date().toISOString(),
                assinatura_aprovado_por: usuario_id || null,
                assinatura_aprovado_em: new Date().toISOString(),
                assinatura_recusa_nota: null,
                atualizado_em: new Date().toISOString()
            })

            return res.status(200).json({ data: updated })
        } catch (error: any) {
            console.error('[ComercialController] Erro no upload do contrato:', error)
            return res.status(500).json({ message: 'Erro ao fazer upload do contrato', error: error.message })
        }
    }

    /**
     * POST /comercial/contratos/:id/aprovar
     */
    async aprovarContrato(req: any, res: any) {
        try {
            const { id } = req.params
            const { usuario_id } = req.body

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato?.contrato_assinado_url) {
                return res.status(400).json({ message: 'Contrato assinado nÃƒÂ£o encontrado' })
            }

            const updated = await ContratoServicoRepository.updateContrato(id, {
                assinatura_status: 'aprovado',
                assinatura_aprovado_por: usuario_id || null,
                assinatura_aprovado_em: new Date().toISOString(),
                assinatura_recusa_nota: null,
                atualizado_em: new Date().toISOString()
            })

            await this.notificarClienteContrato({
                clienteId: updated.cliente_id,
                titulo: 'Contrato aprovado',
                mensagem: 'Seu contrato foi aprovado pelo time comercial. Agora voce ja pode enviar o comprovante de pagamento.',
                tipo: 'success'
            })

            return res.status(200).json({ data: updated })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao aprovar contrato:', error)
            return res.status(500).json({ message: 'Erro ao aprovar contrato', error: error.message })
        }
    }

    /**
     * POST /comercial/contratos/:id/recusar
     */
    async recusarContrato(req: any, res: any) {
        try {
            const { id } = req.params
            const { nota } = req.body

            const updated = await ContratoServicoRepository.updateContrato(id, {
                assinatura_status: 'recusado',
                assinatura_recusa_nota: nota || 'Contrato recusado sem observaÃƒÂ§ÃƒÂ£o.',
                assinatura_recusado_em: new Date().toISOString(),
                atualizado_em: new Date().toISOString()
            })

            await this.notificarClienteContrato({
                clienteId: updated.cliente_id,
                titulo: 'Contrato recusado',
                mensagem: updated.assinatura_recusa_nota || 'Seu contrato precisa de ajustes e reenvio.',
                tipo: 'warning'
            })

            return res.status(200).json({ data: updated })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao recusar contrato:', error)
            return res.status(500).json({ message: 'Erro ao recusar contrato', error: error.message })
        }
    }

    /**
     * POST /comercial/contratos/:id/comprovante
     */
    async uploadComprovanteContrato(req: any, res: any) {
        try {
            const { id } = req.params
            const file = req.file

            if (!file) {
                return res.status(400).json({ message: 'Arquivo do comprovante ÃƒÂ© obrigatÃƒÂ³rio' })
            }

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato nÃƒÂ£o encontrado' })
            }

            if (contrato.assinatura_status !== 'aprovado') {
                return res.status(400).json({ message: 'Contrato ainda nÃƒÂ£o aprovado' })
            }

            if (!['pendente', 'recusado'].includes(contrato.pagamento_status)) {
                return res.status(409).json({ message: 'Ja existe um comprovante em analise para este contrato.' })
            }

            const lockTimestamp = new Date().toISOString()
            const { data: lockedContrato, error: lockError } = await supabase
                .from('contratos_servicos')
                .update({
                    pagamento_status: 'em_analise',
                    pagamento_nota_recusa: null,
                    pagamento_comprovante_upload_em: lockTimestamp,
                    atualizado_em: lockTimestamp
                })
                .eq('id', id)
                .in('pagamento_status', ['pendente', 'recusado'])
                .select()
                .maybeSingle()

            if (lockError) {
                console.error('[ComercialController] Erro ao reservar upload de comprovante:', lockError)
                return res.status(500).json({ message: 'Erro ao iniciar envio do comprovante' })
            }

            if (!lockedContrato) {
                return res.status(409).json({ message: 'Comprovante ja enviado por outro usuario. Atualize a tela para ver o status.' })
            }

            const timestamp = Date.now()
            const ext = file.originalname.split('.').pop() || 'pdf'
            const filePath = `contratos-comprovantes/${id}/${timestamp}_comprovante.${ext}`

            const { error: uploadError } = await supabase.storage
                .from('documentos')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                })

            if (uploadError) {
                console.error('[ComercialController] Erro no upload do comprovante:', uploadError)
                await ContratoServicoRepository.updateContrato(id, {
                    pagamento_status: contrato.pagamento_status,
                    pagamento_nota_recusa: contrato.pagamento_nota_recusa || null,
                    atualizado_em: new Date().toISOString()
                })
                return res.status(500).json({ message: 'Erro ao fazer upload do comprovante' })
            }

            const { data: urlData } = supabase.storage
                .from('documentos')
                .getPublicUrl(filePath)

            const updated = await ContratoServicoRepository.updateContrato(id, {
                pagamento_status: 'em_analise',
                pagamento_comprovante_url: urlData.publicUrl,
                pagamento_comprovante_path: filePath,
                pagamento_comprovante_nome_original: file.originalname,
                pagamento_comprovante_upload_em: new Date().toISOString(),
                pagamento_nota_recusa: null,
                atualizado_em: new Date().toISOString()
            })

            await this.notificarClienteContrato({
                clienteId: updated.cliente_id,
                titulo: 'Comprovante recebido',
                mensagem: 'Recebemos seu comprovante e ele esta em analise do financeiro.',
                tipo: 'info'
            })

            return res.status(200).json({ data: updated })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao enviar comprovante:', error)
            return res.status(500).json({ message: 'Erro ao enviar comprovante', error: error.message })
        }
    }
    /**
     * PUT /comercial/contratos/:id/draft
     * Atualiza o rascunho do formulÃ¡rio.
     */
    async updateContratoDraft(req: any, res: any) {
        try {
            const { id } = req.params
            const { etapa_fluxo, draft_dados } = req.body

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato nÃ£o encontrado' })
            }
            if (!contrato.is_draft) {
                return res.status(400).json({ message: 'Este contrato ja foi finalizado e enviado.' })
            }

            const etapaNumerica = Number(etapa_fluxo || contrato.etapa_fluxo || 1)
            const mergedDraft = this.mergeDraftDados(contrato.draft_dados, draft_dados)
            const incomingDraft = (draft_dados && typeof draft_dados === 'object') ? draft_dados : {}

            if (Object.prototype.hasOwnProperty.call(incomingDraft, 'telefone')) {
                const telefoneNormalizado = normalizePhone(mergedDraft.telefone)
                mergedDraft.telefone = telefoneNormalizado || ''
            }

            const documentoDigits = String(mergedDraft.documento || '').replace(/\D/g, '')
            if (documentoDigits.length === 11) {
                const cpfNormalizado = normalizeCpf(mergedDraft.documento)
                if (cpfNormalizado) {
                    mergedDraft.documento = cpfNormalizado
                }
            }

            const updatedData = await ContratoServicoRepository.updateContrato(id, {
                etapa_fluxo: etapaNumerica,
                draft_dados: mergedDraft,
                atualizado_em: new Date().toISOString()
            })

            return res.status(200).json({ data: updatedData })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao atualizar draft:', error)
            return res.status(500).json({ message: 'Erro ao atualizar rascunho', error: error.message })
        }
    }
    /**
     * POST /comercial/contratos/:id/gerar-pdf
     * Gera o PDF com base nos dados preenchidos no draft e retorna a URL.
     */
    async gerarContratoPdf(req: any, res: any) {
        const { id } = req.params

        try {
            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato nÃ£o encontrado' })
            }

            const PdfService = (await import('../services/PdfService')).default
            const pdfUrl = await PdfService.gerarContratoAssessoria(id, contrato.draft_dados)

            if (!pdfUrl) {
                const mensagemErro = 'Falha ao gerar o PDF do contrato.'
                const draftComErro = this.mergeDraftDados(contrato.draft_dados, {
                    __erroGeracao: this.buildErroGeracaoDraft(mensagemErro)
                })

                const updatedWithError = await ContratoServicoRepository.updateContrato(id, {
                    etapa_fluxo: 4,
                    draft_dados: draftComErro,
                    atualizado_em: new Date().toISOString()
                })

                return res.status(500).json({ message: mensagemErro, data: updatedWithError })
            }

            const draftSemErro = this.mergeDraftDados(contrato.draft_dados, {})
            if (draftSemErro.__erroGeracao) {
                delete draftSemErro.__erroGeracao
            }

            const updatedData = await ContratoServicoRepository.updateContrato(id, {
                contrato_gerado_url: pdfUrl,
                etapa_fluxo: 4,
                draft_dados: draftSemErro,
                atualizado_em: new Date().toISOString()
            })

            return res.status(200).json({ url: pdfUrl, data: updatedData })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao gerar PDF:', error)

            try {
                const contratoAtual = await ContratoServicoRepository.getContratoById(id)
                if (contratoAtual) {
                    const draftComErro = this.mergeDraftDados(contratoAtual.draft_dados, {
                        __erroGeracao: this.buildErroGeracaoDraft(error.message || 'Erro ao gerar PDF')
                    })

                    await ContratoServicoRepository.updateContrato(id, {
                        etapa_fluxo: 4,
                        draft_dados: draftComErro,
                        atualizado_em: new Date().toISOString()
                    })
                }
            } catch (updateError) {
                console.error('[ComercialController] Erro ao registrar falha de geraÃ§Ã£o:', updateError)
            }

            return res.status(500).json({ message: 'Erro ao gerar PDF', error: error.message })
        }
    }
    /**
     * POST /comercial/contratos/:id/enviar-assinatura
     * Finaliza o draft e dispara email.
     */
    async enviarContratoAssinatura(req: any, res: any) {
        try {
            const { id } = req.params
            const { email } = req.body

            const contrato = await ContratoServicoRepository.getContratoById(id)
            if (!contrato) {
                return res.status(404).json({ message: 'Contrato nÃ£o encontrado' })
            }

            const emailDestino = String(email || contrato.cliente_email || '').trim().toLowerCase()
            if (!emailDestino) {
                return res.status(400).json({ message: 'O e-mail do cliente Ã© obrigatÃ³rio para enviar o contrato.' })
            }

            const erroGeracaoAtivo = contrato?.draft_dados?.__erroGeracao?.ativo === true
            if (erroGeracaoAtivo) {
                return res.status(409).json({ message: 'Este contrato esta bloqueado por erro de geracao. Gere o contrato novamente antes de enviar.' })
            }

            if (!contrato.contrato_gerado_url) {
                return res.status(400).json({ message: 'Gere o contrato antes de enviar para assinatura.' })
            }

            const contratoUrl = String(contrato.contrato_gerado_url || '')
            if (!contratoUrl) {
                return res.status(400).json({ message: 'O contrato atual nao esta gerado. Gere novamente antes de enviar.' })
            }

            const draftSemErro = this.mergeDraftDados(contrato.draft_dados, {})
            if (draftSemErro.__erroGeracao) {
                delete draftSemErro.__erroGeracao
            }

            const updatedData = await ContratoServicoRepository.updateContrato(id, {
                is_draft: false,
                etapa_fluxo: 4,
                draft_dados: draftSemErro,
                cliente_email: emailDestino,
                assinatura_status: 'pendente',
                atualizado_em: new Date().toISOString()
            })

            try {
                const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3010').replace(/\/$/, '')
                const areaClienteLink = `${frontendUrl}/cliente/contratos`
                const contratoArquivoUrl = updatedData?.contrato_gerado_url || contrato.contrato_gerado_url

                if (!contratoArquivoUrl) {
                    throw new Error('Contrato gerado nao encontrado para anexo no email.')
                }

                await EmailService.sendContratoEmail({
                    to: emailDestino,
                    clientName: contrato.cliente_nome || 'Cliente',
                    areaClienteLink,
                    contratoArquivoUrl,
                    servicoNome: contrato.servico_nome || 'Assessoria'
                })
            } catch (emailError) {
                console.error('[ComercialController] Erro ao enviar email de contrato:', emailError)
                return res.status(500).json({ message: 'Contrato finalizado, mas ocorreu um erro no envio do e-mail.' })
            }

            const clienteStatus = contrato?.cliente?.status || null
            if (clienteStatus && clienteStatus !== 'LEAD') {
                await this.notificarClienteContrato({
                    clienteId: contrato.cliente_id,
                    titulo: 'Novo contrato disponivel para assinatura',
                    mensagem: 'Seu contrato foi gerado e enviado para assinatura. Acesse a area de contratos para acompanhar o status.',
                    tipo: 'info'
                })
            }

            return res.status(200).json({ message: 'Contrato enviado com sucesso!', data: updatedData })
        } catch (error: any) {
            console.error('[ComercialController] Erro ao enviar para assinatura:', error)
            return res.status(500).json({ message: 'Erro ao enviar para assinatura', error: error.message })
        }
    }


}

export default new ComercialController()


