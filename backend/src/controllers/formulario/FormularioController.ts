import { supabase } from '../../config/SupabaseClient'
import EmailService from '../../services/EmailService'
import DNAService from '../../services/DNAService'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

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
                // Step 1 - Identificação
                nome_completo,
                parceiro_indicador,
                email,
                whatsapp,
                // Step 1 - Pessoais
                nacionalidade,
                esteve_europa_6meses,
                cidade_pais_residencia,
                // Step 2 - Familiar e Documentos
                estado_civil,              // string[]
                filhos_qtd_idades,
                familiares_espanha,
                possui_cnh_categoria_ano,
                proposta_trabalho_espanha,
                visto_ue,
                trabalho_destacado_ue,
                filhos_nacionalidade_europeia,
                pretende_autonomo,         // string[]
                // Step 3 - Educação e Trabalho
                disposto_estudar,
                pretende_trabalhar_espanha, // string[]
                escolaridade,              // string[]
                area_formacao,
                situacao_profissional,     // string[]
                profissao_online_presencial,
                tipo_visto_planejado,
                duvidas_consultoria,
            } = req.body

            // Validação básica
            if (!agendamento_id || !nome_completo || !email || !whatsapp) {
                return res.status(400).json({ message: 'Dados essenciais faltando: nome, email ou whatsapp' })
            }

            // Validar se o agendamento existe e pode receber formulário
            const { data: agendamentoInfo, error: agInfoErr } = await supabase
                .from('agendamentos')
                .select('status, data_hora, pagamento_status, comprovante_url, meet_link, nome, telefone, email, duracao_minutos, produto_id')
                .eq('id', agendamento_id)
                .single()

            if (agInfoErr || !agendamentoInfo) {
                console.error('[FormularioController] Agendamento nao encontrado:', agInfoErr)
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

            console.log('[FormularioController] Processando formulario de consultoria para:', nome_completo)

            // 1. Gerar senha aleatória para o cliente
            const senhaGerada = generatePassword()

            // 2. Criar conta no Profile
            const salt = await bcrypt.genSalt(10)
            const password_hash = await bcrypt.hash(senhaGerada, salt)
            let userId: string

            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .ilike('email', email)
                .maybeSingle()

            if (existingProfile) {
                userId = existingProfile.id
            } else {
                userId = crypto.randomUUID()
            }

            // 3. Criar/atualizar registro na tabela profiles com a nova senha
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    full_name: nome_completo,
                    email,
                    role: 'cliente',
                    password_hash,
                    telefone: whatsapp
                })

            if (profileError) {
                console.error('[FormularioController] Erro ao criar/atualizar profile:', profileError)
                return res.status(400).json({
                    message: 'Erro ao criar conta',
                    error: profileError.message
                })
            } else {
                console.log(`[FormularioController] Profile criado/atualizado com sucesso: ${userId}`)
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
                // Atualizar dados do cliente existente sem tocar no seu status atual
                const { error: updateError } = await supabase
                    .from('clientes')
                    .update({
                        nome: nome_completo,
                        email,
                        whatsapp,
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
                // Novo cliente (inicia como LEAD até confirmação financeira)
                const { data: newCliente, error: createError } = await supabase
                    .from('clientes')
                    .insert([{
                        nome: nome_completo,
                        email,
                        whatsapp,
                        status: 'LEAD',
                        stage: 'formularios',
                        perfil_unificado: { data: {}, metadata: {} }
                    }])
                    .select('id')
                    .single()

                if (createError) {
                    console.error('[FormularioController] Erro ao criar cliente:', createError)
                } else {
                    clienteId = newCliente.id
                }
            }

            // 5. Salvar dados do formulário no DNA do cliente (tabela formularios_clientes)
            const formularioData = {
                cliente_id: clienteId,
                agendamento_id: agendamento_id || null,
                // Step 1
                nome_completo,
                parceiro_indicador: parceiro_indicador || null,
                email,
                whatsapp,
                nacionalidade: nacionalidade || null,
                esteve_europa_6meses: esteve_europa_6meses || null,
                cidade_pais_residencia: cidade_pais_residencia || null,
                // Step 2
                estado_civil: estado_civil || null,
                filhos_qtd_idades: filhos_qtd_idades || null,
                familiares_espanha: familiares_espanha || null,
                possui_cnh_categoria_ano: possui_cnh_categoria_ano || null,
                proposta_trabalho_espanha: proposta_trabalho_espanha || null,
                visto_ue: visto_ue || null,
                trabalho_destacado_ue: trabalho_destacado_ue || null,
                filhos_nacionalidade_europeia: filhos_nacionalidade_europeia || null,
                pretende_autonomo: pretende_autonomo || null,
                // Step 3
                disposto_estudar: disposto_estudar || null,
                pretende_trabalhar_espanha: pretende_trabalhar_espanha || null,
                escolaridade: escolaridade || null,
                area_formacao: area_formacao || null,
                situacao_profissional: situacao_profissional || null,
                profissao_online_presencial: profissao_online_presencial || null,
                tipo_visto_planejado: tipo_visto_planejado || null,
                duvidas_consultoria: duvidas_consultoria || null,
            }

            // Salvar formulário em formularios_cliente (registro de rastreamento)
            // IMPORTANTE: Supabase não lança exceções — o erro retorna como objeto { error }
            // A existência deste registro é o que determina cliente_is_user no ComercialRepository
            const { error: formularioInsertError } = await supabase
                .from('formularios_cliente')
                .insert([formularioData])

            if (formularioInsertError) {
                console.error('[FormularioController] Erro ao inserir em formularios_cliente:', formularioInsertError)
                // Fallback: inserir apenas os campos essenciais de rastreamento
                const { error: fallbackError } = await supabase
                    .from('formularios_cliente')
                    .insert([{
                        cliente_id: clienteId,
                        agendamento_id: agendamento_id || null,
                        nome_completo,
                        email,
                        whatsapp,
                    }])
                if (fallbackError) {
                    console.error('[FormularioController] Fallback de formularios_cliente tambem falhou:', fallbackError)
                } else {
                    console.log('[FormularioController] formularios_cliente registrado via fallback para agendamento:', agendamento_id)
                }
            } else {
                console.log('[FormularioController] formularios_cliente inserido com sucesso para agendamento:', agendamento_id)
            }

            // Atualiza o DNA Centralizado do Cliente com Prioridade Máxima
            if (clienteId) {
                await DNAService.mergeDNA(clienteId, formularioData, 'HIGH')
            }

            // 6. Confirmar o agendamento e verificar se já estava pago
            // Reutiliza agendamentoInfo (já carregado no início, campos agora incluem pagamento_status)
            let isPago = false
            let agendamentoProduto: string | null = null

            if (agendamento_id) {
                agendamentoProduto = (agendamentoInfo as any)?.produto_id || null
                console.log(`[FormularioController] [DEBUG] Status do agendamento ao processar formulario:`, {
                    id: agendamento_id,
                    encontrado: true,
                    status: agendamentoInfo.status,
                    pagamento_status: (agendamentoInfo as any).pagamento_status,
                    comprovante_url: (agendamentoInfo as any).comprovante_url ? 'presente' : 'ausente'
                })

                isPago = ((agendamentoInfo as any).pagamento_status === 'aprovado') || (agendamentoInfo.status === 'confirmado')
                console.log(`[FormularioController] [DEBUG] isPago calculado: ${isPago} (pagamento_status='${(agendamentoInfo as any).pagamento_status}', status='${agendamentoInfo.status}')`)

                const { error: agUpdateError } = await supabase
                    .from('agendamentos')
                    .update({
                        status: isPago ? 'confirmado' : 'agendado',
                        cliente_id: clienteId
                    })
                    .eq('id', agendamento_id)

                if (agUpdateError) {
                    console.error('[FormularioController] Erro ao atualizar agendamento:', agUpdateError)
                    throw agUpdateError
                }

                console.log(`[FormularioController] Agendamento atualizado para: ${isPago ? 'confirmado' : 'pendente'}, ID: ${agendamento_id}`)

                // Se status virou 'confirmado', gera link do Meet
                if (isPago && !(agendamentoInfo as any).meet_link) {
                    try {
                        console.log(`[GoogleMeet] Agendamento ${agendamento_id} confirmado via Formulario. Gerando link...`)
                        const ComposioService = (await import('../../services/ComposioService')).default
                        const { getSuperAdminId } = await import('../../utils/calendarHelpers')
                        const superAdminId = await getSuperAdminId()
                        const calendarUserId = superAdminId || 'default'
                        const eventResult = await ComposioService.createCalendarEvent(
                            calendarUserId,
                            {
                                summary: `Consultoria - ${nome_completo}`,
                                description: `Consultoria confirmada via Form.\nTelefone: ${whatsapp}\nEmail: ${email}`,
                                startTime: new Date(agendamentoInfo.data_hora),
                                endTime: new Date(new Date(agendamentoInfo.data_hora).getTime() + ((agendamentoInfo as any).duracao_minutos || 60) * 60000),
                                attendees: [email],
                                location: 'Google Meet'
                            }
                        )
                        if (eventResult.success && eventResult.eventLink) {
                            const { default: ComercialRepository } = await import('../../repositories/ComercialRepository')
                            await ComercialRepository.updateMeetLink(agendamento_id, eventResult.eventLink)
                            console.log('[GoogleMeet] Link salvo:', eventResult.eventLink)
                        }
                    } catch (errMeet) {
                        console.error('[GoogleMeet] Erro ao gerar link via Form:', errMeet)
                    }
                }
            } else {
                // Se não há agendamento, assumimos que pode liberar o email
                isPago = true
            }


            if (isPago && clienteId) {
                const { data: clienteBanco } = await supabase
                    .from('clientes')
                    .select('status')
                    .eq('id', clienteId)
                    .single()

                if (clienteBanco && String(clienteBanco.status).toUpperCase() === 'LEAD') {
                    const { error: clienteUpdateError } = await supabase
                        .from('clientes')
                        .update({ status: 'cliente', atualizado_em: new Date().toISOString() })
                        .eq('id', clienteId)

                    if (clienteUpdateError) {
                        console.error('[FormularioController] Erro ao converter lead em cliente:', clienteUpdateError)
                    } else {
                        console.log(`[FormularioController] Lead convertido em cliente apos pagamento e formulario: ${clienteId}`)
                        try {
                            await DNAService.mergeDNA(clienteId, {
                                servico_inicial: agendamentoProduto
                            }, 'HIGH')
                            console.log(`[FormularioController] DNA atualizado com servico_inicial: ${agendamentoProduto}`)
                        } catch (dnaErr) {
                            console.error('[FormularioController] Erro ao atualizar DNA com servico:', dnaErr)
                        }
                    }
                }
            }

            // 7. Enviar email de boas-vindas com credenciais apenas se pago/confirmado
            let emailEnviado = false
            const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3010').replace(/\/$/, '')
            // The following line from the instruction appears to be syntactically incorrect and has been omitted to maintain a valid code structure.
            // const formularioLink = `${frontendUrl}/formulario/consultoria/${agendamentoId}`) {
            if (isPago) {
                console.log(`[FormularioController] [DEBUG] isPago=true, tentando enviar email SMTP para: ${email}`)
                console.log(`[FormularioController] [DEBUG] SMTP config: host=${process.env.SMTP_HOST || 'NAO_DEFINIDO'}, user=${process.env.SMTP_USER ? 'definido' : 'NAO_DEFINIDO'}, pass=${process.env.SMTP_PASS ? 'definido' : 'NAO_DEFINIDO'}`)
                try {
                    await EmailService.sendWelcomeEmail({
                        to: email,
                        clientName: nome_completo,
                        loginUrl: `${frontendUrl}/login`,
                        email,
                        senha: senhaGerada
                    })
                    emailEnviado = true
                    console.log(`[FormularioController] [DEBUG] SMTP disparado com sucesso para: ${email}`)
                } catch (err: any) {
                    console.error('[FormularioController] Erro ao enviar email', err)
                }
            } else {
                console.log('[FormularioController] Formulario submetido. Aguardando confirmacao do pagamento pelo Comercial.')
            }

            console.log('[FormularioController] Formulario processado com sucesso para:', nome_completo)

            // Recuperar status atualizado do pagamento (se houver agendamento)
            let pagamentoStatus: string | null = null
            let comprovanteUrl: string | null = null
            if (agendamento_id) {
                const { data: agendamentoFinal } = await supabase
                    .from('agendamentos')
                    .select('pagamento_status, comprovante_url')
                    .eq('id', agendamento_id)
                    .single()
                // Se o agendamento foi confirmado (isPago), garantir que o status retornado seja 'aprovado'
                pagamentoStatus = isPago ? 'aprovado' : (agendamentoFinal?.pagamento_status || null)
                comprovanteUrl = agendamentoFinal?.comprovante_url || null
            } else if (isPago) {
                pagamentoStatus = 'aprovado'
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
                const { error: updateError } = await supabase
                    .from('agendamentos')
                    .update({
                        comprovante_url: urlData.publicUrl,
                        comprovante_upload_em: new Date().toISOString(),
                        pagamento_status: 'em_analise'
                    })
                    .eq('id', agendamento_id)

                if (updateError) {
                    console.error('[FormularioController] Erro ao atualizar BD do agendamento:', updateError)
                    return res.status(500).json({ message: 'Erro ao salvar informações no banco de dados. Contate o suporte.' })
                }
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
                .select('id, status, data_hora, pagamento_status, pagamento_nota_recusa, email, telefone, cliente_id')
                .eq('id', agendamento_id)
                .single()

            if (agErr || !agendamento) {
                console.error('[FormularioController] Erro ao buscar agendamento status:', agErr)
                return res.status(404).json({ found: false })
            }

            // 1.5. Buscar DNA do cliente se existir
            let dnaData = null
            if (agendamento.cliente_id) {
                const { data: clienteData } = await supabase
                    .from('clientes')
                    .select('perfil_unificado')
                    .eq('id', agendamento.cliente_id)
                    .maybeSingle()

                if (clienteData?.perfil_unificado?.data) {
                    dnaData = clienteData.perfil_unificado.data
                }
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
                bloqueado_cron: !!bloqueadoCron,
                dna: dnaData // <- Dados preenchidos para o pre-fill
            })

        } catch (error: any) {
            console.error('[FormularioController] Erro ao buscar status do agendamento:', error)
            return res.status(500).json({ found: false, message: 'Erro ao verificar status' })
        }
    }
}

export default new FormularioController()
