import { supabase } from '../config/SupabaseClient'

class ComercialRepository {

    async createAgendamento(agendamento: any) {
        console.log('Tentando criar agendamento no banco:', agendamento)

        if (agendamento.cliente_id && agendamento.email) {
            try {
                const { data: clienteBanco } = await supabase
                    .from('clientes')
                    .select('email')
                    .eq('id', agendamento.cliente_id)
                    .single()

                if (clienteBanco && (!clienteBanco.email || clienteBanco.email !== agendamento.email)) {
                    await supabase
                        .from('clientes')
                        .update({ email: agendamento.email })
                        .eq('id', agendamento.cliente_id)
                }
            } catch (err) {
                console.warn('[ComercialRepository] Erro ao tentar atualizar o email do cliente:', err)
            }
        }

        const { data: createdData, error } = await supabase
            .from('agendamentos')
            .insert([agendamento])
            .select()
            .single()

        if (error) {
            console.error('Erro do Supabase ao criar agendamento:', error)
            throw error
        }

        console.log('Agendamento criou com sucesso:', createdData)
        return createdData
    }

    async updateAgendamentoFull(id: string, payload: any) {
        const { data, error } = await supabase
            .from('agendamentos')
            .update(payload)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Erro do Supabase ao atualizar agendamento completo:', error)
            throw error
        }

        return data
    }

    async updateAgendamentoStatus(id: string, status: string) {
        console.log('Atualizando status do agendamento:', { id, status })

        const { data, error } = await supabase
            .from('agendamentos')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Erro ao atualizar status do agendamento:', error)
            throw error
        }

        // Se o status for confirmado, cria uma notificação para o cliente
        if (status === 'confirmado' && data?.pagamento_status === 'aprovado' && data.cliente_id) {
            try {
                const NotificationService = (await import('../services/NotificationService')).default
                await NotificationService.createNotification({
                    clienteId: data.cliente_id,
                    titulo: 'Agendamento Confirmado',
                    mensagem: `Seu agendamento de "${data.produto_nome || 'Consultoria'}" para o dia ${new Date(data.data_hora).toLocaleDateString('pt-BR')} às ${new Date(data.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} foi confirmado com sucesso!`,
                    tipo: 'agendamento',
                    dataPrazo: data.data_hora // O "prazo" da notificação é a própria data do agendamento
                })
            } catch (notifError) {
                console.error('Erro ao criar notificacao de agendamento aprovado:', notifError)
            }
        }

        return data
    }

    async getAgendamentosByUsuario(usuarioId: string) {
        console.log('Buscando agendamentos para o usuario:', usuarioId)

        const { data: agendamentos, error } = await supabase
            .from('agendamentos')
            .select('*, cliente:clientes(id, nome, email, whatsapp, client_id)')
            .eq('usuario_id', usuarioId)
            .order('data_hora', { ascending: true })

        if (error) {
            console.error('Erro ao buscar agendamentos por usuario:', error)
            throw error
        }

        if (!agendamentos || agendamentos.length === 0) return [];

        // Verificação em lote: Quais agendamentos já têm formulário preenchido?
        const agendamentoIds = agendamentos.map(a => a.id).filter(Boolean)
        let idsComFormulario: string[] = []

        if (agendamentoIds.length > 0) {
            const { data: formularios } = await supabase
                .from('formularios_cliente')
                .select('agendamento_id')
                .in('agendamento_id', agendamentoIds)

            if (formularios) {
                idsComFormulario = formularios.map(f => f.agendamento_id)
            }
        }

        // Atribui flag cliente_is_user baseado na existência do formulário
        const agendamentosComFlag = agendamentos.map(ag => ({
            ...ag,
            cliente_is_user: idsComFormulario.includes(ag.id)
        }))

        return agendamentosComFlag
    }

    async getAgendamentosByIntervalo(data_hora_inicio: string, data_hora_fim: string) {
        console.log('Buscando agendamentos no intervalo:', data_hora_inicio, 'ate', data_hora_fim)

        const { data: agendamentos, error } = await supabase
            .from('agendamentos')
            .select('*')
            .in('status', ['agendado', 'confirmado', 'realizado', 'Conflito'])
            .gte('data_hora', data_hora_inicio)
            .lt('data_hora', data_hora_fim)

        if (error) {
            console.error('Erro ao buscar agendamentos:', error)
            throw error
        }

        return agendamentos || []
    }

    async getAgendamentosByData(data: string) {
        console.log('Buscando agendamentos para data:', data)

        const { data: agendamentos, error } = await supabase
            .from('agendamentos')
            .select('*')
            .in('status', ['agendado', 'confirmado', 'realizado', 'Conflito'])
            .gte('data_hora', `${data}T00:00:00`)
            .lt('data_hora', `${data}T23:59:59`)
            .order('data_hora', { ascending: true })

        if (error) {
            console.error('Erro ao buscar agendamentos:', error)
            throw error
        }

        return agendamentos || []
    }

    async getAgendamentosByCliente(clienteId: string) {
        console.log('Buscando agendamentos para o cliente:', clienteId)

        const { data: agendamentos, error } = await supabase
            .from('agendamentos')
            .select('*')
            .eq('cliente_id', clienteId)
            .order('data_hora', { ascending: true })

        if (error) {
            console.error('Erro ao buscar agendamentos por cliente:', error)
            throw error
        }

        return agendamentos || []
    }

    async getAgendamentoById(id: string) {
        console.log('Buscando agendamento por ID:', id)

        const { data, error } = await supabase
            .from('agendamentos')
            .select('*, cliente:clientes(id, nome, email, whatsapp, client_id)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Erro ao buscar agendamento por ID:', error)
            throw error
        }

        return data
    }

    async updateAgendamentoCheckoutUrl(id: string, checkoutUrl: string) {
        console.log('Salvando checkout_url no agendamento:', { id, checkoutUrl })

        const { data, error } = await supabase
            .from('agendamentos')
            .update({ checkout_url: checkoutUrl })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Erro ao atualizar checkout_url do agendamento:', error)
            throw error
        }

        return data
    }

    async updateMeetLink(id: string, meetLink: string) {
        console.log('Salvando meet_link no agendamento:', { id, meetLink })

        const { data, error } = await supabase
            .from('agendamentos')
            .update({ meet_link: meetLink })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Erro ao atualizar meet_link do agendamento:', error)
            throw error
        }

        return data
    }
    async getAllAgendamentos() {
        console.log('Buscando todos os agendamentos')
        
        const { data: agendamentos, error } = await supabase
            .from('agendamentos')
            .select('*, cliente:clientes(id, nome, email, whatsapp, client_id)')
            .neq('status', 'cancelado')
            .order('data_hora', { ascending: true })
        
        if (error) {
            console.error('Erro ao buscar todos os agendamentos:', error)
            throw error
        }
        
        if (!agendamentos || agendamentos.length === 0) return [];

        // Verificação em lote: Quais agendamentos já têm formulário preenchido?
        const agendamentoIds = agendamentos.map(a => a.id).filter(Boolean)
        let idsComFormulario: string[] = []

        if (agendamentoIds.length > 0) {
            const { data: formularios } = await supabase
                .from('formularios_cliente')
                .select('agendamento_id')
                .in('agendamento_id', agendamentoIds)

            if (formularios) {
                idsComFormulario = formularios.map(f => f.agendamento_id)
            }
        }

        // Atribui flag cliente_is_user baseado na existência do formulário
        const agendamentosComFlag = agendamentos.map(ag => ({
            ...ag,
            cliente_is_user: idsComFormulario.includes(ag.id)
        }))
        
        return agendamentosComFlag
    }

    async getAllProcessos() {
        console.log('Buscando todos os processos')
        const { data: processos, error } = await supabase
            .from('processos')
            .select('*, clientes(nome)')
            .order('criado_em', { ascending: false })

        if (error) {
            console.error('Erro ao buscar todos os processos:', error)
            throw error
        }
        return processos || []
    }

    async getAllRequerimentos() {
        console.log('Buscando todos os requerimentos')
        const { data: requerimentos, error } = await supabase
            .from('requerimentos')
            .select('*')
            .order('criado_em', { ascending: false })

        if (error) {
            console.error('Erro ao buscar todos os requerimentos:', error)
            throw error
        }
        return requerimentos || []
    }
}

export default new ComercialRepository()