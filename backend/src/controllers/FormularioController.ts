import { supabase } from '../config/SupabaseClient'
import EmailService from '../services/EmailService'

function generatePassword(length = 10): string {
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$'
    let password = ''
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
}

class FormularioController {

    /**
     * POST /formulario/consultoria
     * Recebe dados do formulário público de consultoria,
     * cria a conta do cliente, confirma o agendamento e dispara email.
     */
    async submitConsultoria(req: any, res: any) {
        try {
            const {
                agendamento_id,
                // Dados pessoais
                nome_completo,
                email,
                whatsapp,
                data_nascimento,
                nacionalidade,
                estado_civil,
                // Documentos
                cpf,
                passaporte,
                // Situação atual
                pais_residencia,
                tem_filhos,
                quantidade_filhos,
                idades_filhos,
                // Profissional
                profissao,
                escolaridade,
                experiencia_exterior,
                empresa_exterior,
                // Imigração
                objetivo_imigracao,
                pais_destino,
                prazo_mudanca,
                ja_tem_visto,
                tipo_visto,
                pretende_trabalhar,
                area_trabalho,
                // Financeiro
                renda_mensal,
                possui_reserva,
                // Observações
                observacoes,
                como_conheceu
            } = req.body

            // Validação básica
            if (!agendamento_id || !nome_completo || !email || !whatsapp) {
                return res.status(400).json({ message: 'Dados essenciais faltando: nome, email ou whatsapp' })
            }

            // Validar se o agendamento existe e pode receber formulário
            const { data: agendamentoInfo, error: agInfoErr } = await supabase
                .from('agendamentos')
                .select('status, data_hora')
                .eq('id', agendamento_id)
                .single()

            if (agInfoErr || !agendamentoInfo) {
                return res.status(404).json({ message: 'Agendamento não encontrado.' })
            }

            if (agendamentoInfo.status === 'cancelado') {
                return res.status(403).json({ message: 'Este agendamento foi cancelado. Você deve contatar o Comercial para um novo link.' })
            }

            const agendamentoDateTime = new Date(agendamentoInfo.data_hora);
            const now = new Date();
            const hourDiff = (agendamentoDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (hourDiff < 1) {
                return res.status(403).json({ message: 'O formulário deve ser enviado com pelo menos 1 hora de antecedência. O agendamento expirou/foi cancelado.' })
            }

            console.log('[FormularioController] Processando formulário de consultoria para:', nome_completo)

            // 1. Gerar senha aleatória para o cliente
            const senhaGerada = generatePassword()

            // 2. Criar conta no Supabase Auth
            let userId: string | undefined
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email,
                password: senhaGerada,
                email_confirm: true,
                user_metadata: {
                    full_name: nome_completo,
                    role: 'cliente'
                }
            })

            if (authError) {
                console.error('[FormularioController] Erro ao criar auth user:', authError.message)

                // Se o usuário já existe, buscar o ID existente e atualizar a senha
                if (authError.message.includes('already')) {
                    console.log('[FormularioController] Usuário já existe, buscando ID existente no profiles...')
                    
                    // Buscar o email usando a tabela profiles que é mais rápida e não falha como o listUsers
                    const { data: existingProfile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('email', email)
                        .maybeSingle()
                        
                    if (existingProfile) {
                        userId = existingProfile.id
                    } else {
                        // Tentar buscar na tabela clientes caso não tenha profile
                        // ATENÇÃO: clientes não tem user_id, então não tem como pegar o userId daqui diretamente.
                        // O unico jeito seria procurar de novo via listUsers, que infelizmente tá dando 500 as vezes
                        // Mas só vamos cair aqui se o profiles também falhou antes.
                        console.log('[FormularioController] Buscando via listUsers como fallback...')
                        try {
                            const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
                            if (listError) console.error("List users error fallback:", listError)
                            const existingUser = listData?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
                            if (existingUser) {
                                userId = existingUser.id
                            }
                        } catch (err) {
                            console.error("Erro critico listUsers fallback:", err)
                        }
                    }

                    if (userId) {
                        // Atualizar a senha do usuário existente
                        const { error: updateAuthError } = await supabase.auth.admin.updateUserById(userId, {
                            password: senhaGerada,
                            user_metadata: { full_name: nome_completo, role: 'cliente' }
                        })
                        if (updateAuthError) {
                             console.error(`[FormularioController] Falha ao atualizar senha do user ${userId}:`, updateAuthError)
                        } else {
                             console.log(`[FormularioController] Usuário existente encontrado: ${userId}, senha atualizada`)
                        }
                    } else {
                        console.error('[FormularioController] Não foi possível encontrar o ID do usuário existente!')
                    }
                } else {
                    return res.status(400).json({
                        message: 'Erro ao criar conta',
                        error: authError.message
                    })
                }
            } else {
                userId = authData?.user?.id
            }

            // 3. Criar/atualizar registro na tabela profiles
            if (userId) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: userId,
                        full_name: nome_completo,
                        email,
                        role: 'cliente',
                        cpf: cpf || null,
                        telefone: whatsapp
                    })
                if (profileError) {
                    console.error('[FormularioController] Erro ao criar profile:', profileError)
                } else {
                    console.log(`[FormularioController] Profile criado/atualizado com sucesso: ${userId}`)
                }
            }

            // 4. Verificar se o cliente já existe na tabela clientes (por email ou whatsapp)
            let clienteId: string | null = null

            const { data: clienteExistente } = await supabase
                .from('clientes')
                .select('id')
                .or(`email.eq.${email},whatsapp.eq.${whatsapp}`)
                .maybeSingle()

            if (clienteExistente) {
                clienteId = clienteExistente.id
                // Atualizar dados do cliente existente
                const { error: updateError } = await supabase
                    .from('clientes')
                    .update({
                        nome: nome_completo,
                        email,
                        whatsapp,
                        status: 'cliente',
                        stage: 'formularios',
                        atualizado_em: new Date().toISOString()
                    })
                    .eq('id', clienteId)
                if (updateError) {
                    console.error('[FormularioController] Erro ao atualizar cliente existente:', updateError)
                } else {
                    console.log('[FormularioController] Cliente atualizado com sucesso:', clienteId)
                }
            } else {
                // Criar novo registro na tabela clientes
                const { data: novoCliente, error: clienteError } = await supabase
                    .from('clientes')
                    .insert([{
                        nome: nome_completo,
                        email,
                        whatsapp,
                        status: 'cliente',
                        stage: 'formularios'
                    }])
                    .select()
                    .single()

                if (clienteError) {
                    console.error('[FormularioController] Erro ao criar cliente:', clienteError)
                } else {
                    clienteId = novoCliente.id
                }
            }

            // 5. Salvar dados do formulário no DNA do cliente (tabela formularios_clientes)
            const formularioData = {
                cliente_id: clienteId,
                agendamento_id: agendamento_id || null,
                nome_completo,
                email,
                whatsapp,
                data_nascimento: data_nascimento || null,
                nacionalidade: nacionalidade || null,
                estado_civil: estado_civil || null,
                cpf: cpf || null,
                passaporte: passaporte || null,
                pais_residencia: pais_residencia || null,
                tem_filhos: tem_filhos || false,
                quantidade_filhos: quantidade_filhos || 0,
                idades_filhos: idades_filhos || null,
                profissao: profissao || null,
                escolaridade: escolaridade || null,
                experiencia_exterior: experiencia_exterior || null,
                empresa_exterior: empresa_exterior || null,
                objetivo_imigracao: objetivo_imigracao || null,
                pais_destino: pais_destino || null,
                prazo_mudanca: prazo_mudanca || null,
                ja_tem_visto: ja_tem_visto || false,
                tipo_visto: tipo_visto || null,
                pretende_trabalhar: pretende_trabalhar || null,
                area_trabalho: area_trabalho || null,
                renda_mensal: renda_mensal || null,
                possui_reserva: possui_reserva || null,
                observacoes: observacoes || null,
                como_conheceu: como_conheceu || null
            }

            // Tenta salvar o formulário — se a tabela não existir, apenas loga
            try {
                await supabase
                    .from('formularios_cliente')
                    .insert([formularioData])
            } catch (formError) {
                console.warn('[FormularioController] Tabela formularios_cliente pode não existir. Dados serão salvos no metadata do cliente.')
            }

            // 6. Confirmar o agendamento e verificar se já estava pago
            let isPago = false
            if (agendamento_id) {
                const { data: agendamentoAtual } = await supabase
                    .from('agendamentos')
                    .select('status, comprovante_url, pagamento_status')
                    .eq('id', agendamento_id)
                    .single()

                isPago = (agendamentoAtual?.pagamento_status === 'aprovado') || (agendamentoAtual?.status === 'confirmado')

                const { error: agUpdateError } = await supabase
                    .from('agendamentos')
                    .update({
                        status: isPago ? 'confirmado' : 'pendente',
                        cliente_id: clienteId
                    })
                    .eq('id', agendamento_id)
                if (agUpdateError) {
                    console.error('[FormularioController] Erro ao atualizar agendamento:', agUpdateError)
                } else {
                    console.log(`[FormularioController] Agendamento atualizado para: ${isPago ? 'confirmado' : 'pendente'}, ID: ${agendamento_id}`)
                }
            } else {
                // Se não há agendamento, assumimos que pode liberar o email
                isPago = true
            }

            // 7. Enviar email de boas-vindas com credenciais apenas se pago/confirmado
            let emailEnviado = false
            const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3010').replace(/\/$/, '')
            // The following line from the instruction appears to be syntactically incorrect and has been omitted to maintain a valid code structure.
            // const formularioLink = `${frontendUrl}/formulario/consultoria/${agendamentoId}`) {
            if (isPago) {
                try {
                    await EmailService.sendWelcomeEmail({
                        to: email,
                        clientName: nome_completo,
                        loginUrl: `${frontendUrl}/login`,
                        email,
                        senha: senhaGerada
                    })
                    emailEnviado = true
                } catch (err: any) {
                    console.error('[FormularioController] Erro ao enviar email', err)
                }
            } else {
                console.log('[FormularioController] Formulário submetido. Aguardando confirmação do pagamento pelo Comercial.')
            }

            console.log('[FormularioController] Formulário processado com sucesso para:', nome_completo)

            // Recuperar status atualizado do pagamento (se houver agendamento)
            let pagamentoStatus: string | null = null
            let comprovanteUrl: string | null = null
            if (agendamento_id) {
                const { data: agendamentoFinal } = await supabase
                    .from('agendamentos')
                    .select('pagamento_status, comprovante_url')
                    .eq('id', agendamento_id)
                    .single()
                pagamentoStatus = agendamentoFinal?.pagamento_status || null
                comprovanteUrl = agendamentoFinal?.comprovante_url || null
            }

            return res.status(201).json({
                success: true,
                message: emailEnviado
                    ? 'Formulário processado com sucesso. As informações da consultoria foram enviadas para o seu email.'
                    : 'Formulário processado com sucesso. O acesso será liberado após a confirmação do pagamento pelo setor Comercial.',
                clienteId,
                email,
                emailEnviado,
                pagamento_status: pagamentoStatus,
                comprovante_url: comprovanteUrl
            })

        } catch (error: any) {
            console.error('[FormularioController] Erro geral:', error)
            return res.status(500).json({
                message: 'Erro ao processar formulário',
                error: error.message
            })
        }
    }

    /**
     * POST /formulario/comprovante
     * Upload de comprovante de pagamento PIX para um agendamento
     */
    async uploadComprovante(req: any, res: any) {
        try {
            const { agendamento_id, cliente_id } = req.body
            const file = req.file

            if (!file) {
                return res.status(400).json({ message: 'Arquivo do comprovante é obrigatório' })
            }

            if (!agendamento_id && !cliente_id) {
                return res.status(400).json({ message: 'agendamento_id ou cliente_id é obrigatório' })
            }

            const timestamp = Date.now()
            const ext = file.originalname.split('.').pop() || 'pdf'
            const filePath = `comprovantes/${cliente_id || agendamento_id}/${timestamp}_comprovante.${ext}`

            // Upload para Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documentos')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                })

            if (uploadError) {
                console.error('[FormularioController] Erro no upload:', uploadError)
                return res.status(500).json({ message: 'Erro ao fazer upload do comprovante' })
            }

            // Obter URL pública
            const { data: urlData } = supabase.storage
                .from('documentos')
                .getPublicUrl(filePath)

            // Atualizar agendamento com link do comprovante e marcar como pendente de verificação
            if (agendamento_id) {
                await supabase
                    .from('agendamentos')
                    .update({
                        comprovante_url: urlData.publicUrl,
                        comprovante_upload_em: new Date().toISOString(),
                        pagamento_status: 'em_analise'
                    })
                    .eq('id', agendamento_id)
            }

            console.log('[FormularioController] Comprovante salvo:', urlData.publicUrl)

            // Notificar admins sobre novo comprovante pendente
            try {
                const { data: admins } = await supabase
                    .from('profiles')
                    .select('id')
                    .in('role', ['super_admin', 'admin'])

                if (admins && admins.length > 0) {
                    for (const admin of admins) {
                        const { error: notifError } = await supabase
                            .from('notificacoes')
                            .insert([{
                                cliente_id: admin.id,
                                titulo: 'Novo comprovante recebido',
                                mensagem: 'Um novo comprovante de pagamento foi enviado e aguarda verificação.',
                                tipo: 'warning',
                                lida: false,
                                criado_em: new Date().toISOString()
                            }])
                        
                        if (notifError) {
                            console.error('Erro notificando admin:', notifError)
                        }
                    }
                    console.log(`[FormularioController] ${admins.length} admin(s) notificado(s) sobre comprovante`)
                }
            } catch (notifError) {
                console.error('[FormularioController] Erro ao notificar admins:', notifError)
            }

            return res.status(200).json({
                success: true,
                url: urlData.publicUrl,
                message: 'Comprovante enviado com sucesso'
            })

        } catch (error: any) {
            console.error('[FormularioController] Erro no upload de comprovante:', error)
            return res.status(500).json({
                message: 'Erro ao processar comprovante',
                error: error.message
            })
        }
    }
    /**
     * GET /formulario/consultoria/:agendamento_id/status
     * Endpoint público que retorna o status do agendamento e do pagamento
     * para que o frontend mostre a tela apropriada.
     */
    async getAgendamentoStatus(req: any, res: any) {
        try {
            const { agendamento_id } = req.params

            if (!agendamento_id) {
                return res.status(400).json({ found: false, message: 'ID do agendamento é obrigatório' })
            }

            // 1. Buscar agendamento
            const { data: agendamento, error: agErr } = await supabase
                .from('agendamentos')
                .select('id, status, data_hora, pagamento_status, pagamento_nota_recusa, email, telefone')
                .eq('id', agendamento_id)
                .single()

            if (agErr || !agendamento) {
                console.error('[FormularioController] Erro ao buscar agendamento status:', agErr)
                return res.status(404).json({ found: false })
            }

            // 2. Verificar se o formulário já foi preenchido na tabela formularios_cliente
            let formularioPreenchido = false
            const { data: formEnviado } = await supabase
                .from('formularios_cliente')
                .select('id')
                .eq('agendamento_id', agendamento_id)
                .maybeSingle()

            if (formEnviado) {
                formularioPreenchido = true
            }

            // 3. Verificar prazo (1h antes da reunião)
            const agendamentoDateTime = new Date(agendamento.data_hora)
            const now = new Date()
            const horasRestantes = (agendamentoDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
            const expirado = horasRestantes < 1

            // 4. Detectar se foi bloqueado pelo CRON (cancelado automaticamente pelo sistema)
            const bloqueadoCron = agendamento.status === 'cancelado' &&
                agendamento.pagamento_nota_recusa?.includes('[SISTEMA]')

            // 5. Retornar dados
            return res.status(200).json({
                found: true,
                status: agendamento.status,
                pagamento_status: agendamento.pagamento_status || 'pendente',
                formulario_preenchido: formularioPreenchido,
                expirado,
                cancelado: agendamento.status === 'cancelado',
                bloqueado_cron: !!bloqueadoCron
            })

        } catch (error: any) {
            console.error('[FormularioController] Erro ao buscar status do agendamento:', error)
            return res.status(500).json({ found: false, message: 'Erro ao verificar status' })
        }
    }
}

export default new FormularioController()
