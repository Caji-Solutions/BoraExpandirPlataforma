import { MercadoPagoConfig, Preference } from 'mercadopago'

// Inicializa MercadoPago com o access token do ambiente
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
})

interface CheckoutPreferenceParams {
    nome: string
    email: string
    telefone: string
    data_hora: string
    produto_id: string
    produto_nome: string
    valor: number // em reais (será convertido para centavos internamente)
    duracao_minutos: number
    usuario_id?: string
    cliente_id?: string
    agendamento_id?: string
    successUrl?: string
    cancelUrl?: string
    failureUrl?: string
}

class MercadoPagoService {
    /**
     * Cria uma preferência de checkout do MercadoPago para agendamento
     * Os metadados são passados para o webhook processar após o pagamento
     */
    async createCheckoutPreference(params: CheckoutPreferenceParams): Promise<{ checkoutUrl: string; preferenceId: string }> {
        const {
            nome,
            email,
            telefone,
            data_hora,
            produto_id,
            produto_nome,
            valor,
            duracao_minutos
        } = params

        const preference = new Preference(client)

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: produto_id,
                        title: produto_nome,
                        description: `Agendamento para ${new Date(data_hora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} - Duração: ${duracao_minutos} min`,
                        quantity: 1,
                        unit_price: valor,
                        currency_id: 'BRL'
                    }
                ],
                payer: {
                    name: nome.split(' ')[0],
                    surname: nome.split(' ').slice(1).join(' ') || '',
                    email: email,
                    phone: {
                        area_code: telefone.replace(/\D/g, '').substring(0, 2),
                        number: telefone.replace(/\D/g, '').substring(2)
                    }
                },
                // Metadados para o webhook criar o agendamento após confirmação
                metadata: {
                    tipo: 'agendamento',
                    nome,
                    email,
                    telefone,
                    data_hora,
                    produto_id,
                    duracao_minutos: duracao_minutos.toString(),
                    usuario_id: params.usuario_id || '',
                    cliente_id: params.cliente_id || '',
                    agendamento_id: params.agendamento_id || ''
                },
                back_urls: {
                    success: params.successUrl || `${process.env.FRONTEND_URL}/agendamento/sucesso`,
                    failure: params.failureUrl || `${process.env.FRONTEND_URL}/agendamento/falha`,
                    pending: `${process.env.FRONTEND_URL}/agendamento/pendente`
                },
                auto_return: 'approved',
                notification_url: `${process.env.BACKEND_URL}/webhooks/mercadopago`
            }
        })

        if (!result.init_point) {
            throw new Error('Não foi possível criar a preferência de checkout')
        }

        return {
            checkoutUrl: result.init_point,
            preferenceId: result.id || ''
        }
    }

    /**
     * Recupera informações de um pagamento pelo ID
     */
    async getPayment(paymentId: string): Promise<any> {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
            }
        })
        return response.json()
    }
}

export default new MercadoPagoService()
