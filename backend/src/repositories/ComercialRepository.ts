import { supabase } from '../config/SupabaseClient'

class ComercialRepository {

    async createAgendamento(agendamento: any) {
        console.log('Tentando criar agendamento no banco:', agendamento)

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
        console.log('Atualizando agendamento no banco:', id, payload)

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

        // Se o status for aprovado, verifica se o serviço requer delegação jurídica
        if (status === 'aprovado' && data) {
            try {
                // 1. Verificar no catálogo se este serviço requer delegação
                const { data: service } = await supabase
                    .from('catalogo_servicos')
                    .select('requer_delegacao_juridico, nome')
                    .eq('id', data.produto_id)
                    .single()

                if (service?.requer_delegacao_juridico) {
                    console.log(`Serviço "${service.nome}" requer delegação jurídica. Verificando processo...`)

                    const JuridicoRepository = (await import('./JuridicoRepository')).default
                    const existingProcess = await JuridicoRepository.getProcessoByClienteId(data.cliente_id)

                    if (!existingProcess) {
                        console.log('Nenhum processo ativo encontrado. Criando novo processo vago...')
                        await JuridicoRepository.createProcess({
                            clienteId: data.cliente_id,
                            tipoServico: service.nome,
                            status: 'waiting_delegation',
                            etapaAtual: 1,
                            responsavelId: undefined
                        })
                        console.log('Processo vago criado com sucesso.')
                    } else {
                        console.log('Processo já existente para este cliente.')
                    }
                }
            } catch (err) {
                console.error('Erro ao processar delegação jurídica automática:', err)
            }
        }

        // Se o status for aprovado, cria uma notificação para o cliente
        if (status === 'aprovado' && data && data.cliente_id) {
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
                console.error('Erro ao criar notificação de agendamento aprovado:', notifError)
            }
        }

        return data
    }

    async getAgendamentosByUsuario(usuarioId: string) {
        console.log('Buscando agendamentos para o usuário:', usuarioId)

        const { data: agendamentos, error } = await supabase
            .from('agendamentos')
            .select('*, cliente:clientes(id, nome, email, whatsapp, client_id)')
            .eq('usuario_id', usuarioId)
            .neq('status', 'cancelado')
            .order('data_hora', { ascending: true })

        if (error) {
            console.error('Erro ao buscar agendamentos por usuário:', error)
            throw error
        }

        if (!agendamentos || agendamentos.length === 0) return [];

        // Verificação em lote: Quais desses leads já são usuários?
        const emailsUnicos = [...new Set(agendamentos.map(a => a.email).filter(Boolean))]
        let emailsUsuarios: string[] = []

        if (emailsUnicos.length > 0) {
            const { data: clientesUsers } = await supabase
                .from('clientes')
                .select('email')
                .in('email', emailsUnicos)
                .not('user_id', 'is', null)

            if (clientesUsers) {
                emailsUsuarios = clientesUsers.map(c => c.email)
            }
        }

        // Atribui flag cliente_is_user
        const agendamentosComFlag = agendamentos.map(ag => ({
            ...ag,
            cliente_is_user: ag.email ? emailsUsuarios.includes(ag.email) : false
        }))

        return agendamentosComFlag
    }

    async getAgendamentosByIntervalo(data_hora_inicio: string, data_hora_fim: string) {
        console.log('Buscando agendamentos no intervalo:', data_hora_inicio, 'até', data_hora_fim)

        const { data: agendamentos, error } = await supabase
            .from('agendamentos')
            .select('*')
            .in('status', ['confirmado', 'aprovado', 'realizado'])
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
            .in('status', ['confirmado', 'aprovado', 'realizado'])
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
        
        return agendamentos || []
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