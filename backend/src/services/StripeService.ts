import Stripe from 'stripe'

// Inicializa Stripe com a chave secreta do ambiente
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover'
})

interface CheckoutSessionParams {
    nome: string
    email: string
    telefone: string
    data_hora: string
    produto_id: string
    produto_nome: string
    valor: number // em centavos
    duracao_minutos: number
    isEuro?: boolean
    usuario_id?: string
    cliente_id?: string
    agendamento_id?: string
}

class StripeService {
    /**
     * Cria uma sessão de checkout do Stripe para agendamento
     * Os metadados são passados para o webhook processar após o pagamento
     */
    async createCheckoutSession(params: CheckoutSessionParams): Promise<{ checkoutUrl: string; sessionId: string }> {
        const {
            nome,
            email,
            telefone,
            data_hora,
            produto_id,
            produto_nome,
            valor,
            duracao_minutos,
            isEuro = true
        } = params

        // Cria a sessão de checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: email,
            line_items: [
                {
                    price_data: {
                        currency: isEuro ? 'eur' : 'brl',
                        product_data: {
                            name: produto_nome,
                            description: `Agendamento para ${new Date(data_hora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} - Duração: ${duracao_minutos} min`,
                        },
                        unit_amount: valor, // valor em centavos
                    },
                    quantity: 1,
                },
            ],
            // Metadados para o webhook criar o agendamento após confirmação
            metadata: {
                tipo: 'agendamento',
                nome,
                email,
                telefone,
                data_hora,
                produto_id,
                valor: valor.toString(),
                moeda: isEuro ? 'eur' : 'brl',
                duracao_minutos: duracao_minutos.toString(),
                usuario_id: params.usuario_id || '',
                cliente_id: params.cliente_id || '',
                agendamento_id: params.agendamento_id || '',
            },
            success_url: `${process.env.FRONTEND_URL}/agendamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/agendamento/cancelado`,
        })

        if (!session.url) {
            throw new Error('Não foi possível criar a sessão de checkout')
        }

        return {
            checkoutUrl: session.url,
            sessionId: session.id
        }
    }

    /**
     * Cria uma sessão de checkout genérica para múltiplos itens
     */
    async createGenericCheckoutSession(params: {
        items: Array<{ name: string; amount: number; quantity: number }>
        email: string
        metadata: Record<string, string>
        successUrl: string
        cancelUrl: string
        currency?: string
    }): Promise<{ checkoutUrl: string; sessionId: string }> {
        const { items, email, metadata, successUrl, cancelUrl, currency = 'brl' } = params

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: email,
            line_items: items.map(item => ({
                price_data: {
                    currency: currency.toLowerCase(),
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: item.amount,
                },
                quantity: item.quantity,
            })),
            metadata,
            success_url: successUrl,
            cancel_url: cancelUrl,
        })

        if (!session.url) {
            throw new Error('Não foi possível criar a sessão de checkout')
        }

        return {
            checkoutUrl: session.url,
            sessionId: session.id
        }
    }

    /**
     * Recupera os detalhes de uma sessão de checkout
     */
    async getSession(sessionId: string): Promise<Stripe.Checkout.Session> {
        return await stripe.checkout.sessions.retrieve(sessionId)
    }

    /**
     * Valida a assinatura do webhook do Stripe
     */
    validateWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET não configurado')
        }
        return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    }
}

export default new StripeService()
