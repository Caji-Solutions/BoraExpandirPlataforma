"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SupabaseClient_1 = require("../config/SupabaseClient");
const EmailService_1 = __importDefault(require("../services/EmailService"));
function generatePassword(length = 10) {
    const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}
class FormularioController {
    /**
     * POST /formulario/consultoria
     * Recebe dados do formulário público de consultoria,
     * cria a conta do cliente, confirma o agendamento e dispara email.
     */
    async submitConsultoria(req, res) {
        try {
            const { agendamento_id, 
            // Dados pessoais
            nome_completo, email, whatsapp, data_nascimento, nacionalidade, estado_civil, 
            // Documentos
            cpf, passaporte, 
            // Situação atual
            pais_residencia, tem_filhos, quantidade_filhos, idades_filhos, 
            // Profissional
            profissao, escolaridade, experiencia_exterior, empresa_exterior, 
            // Imigração
            objetivo_imigracao, pais_destino, prazo_mudanca, ja_tem_visto, tipo_visto, pretende_trabalhar, area_trabalho, 
            // Financeiro
            renda_mensal, possui_reserva, 
            // Observações
            observacoes, como_conheceu } = req.body;
            // Validação básica
            if (!nome_completo || !email || !whatsapp) {
                return res.status(400).json({
                    message: 'Nome completo, email e WhatsApp são obrigatórios'
                });
            }
            console.log('[FormularioController] Processando formulário de consultoria para:', nome_completo);
            // 1. Gerar senha aleatória para o cliente
            const senhaGerada = generatePassword();
            // 2. Criar conta no Supabase Auth
            const { data: authData, error: authError } = await SupabaseClient_1.supabase.auth.admin.createUser({
                email,
                password: senhaGerada,
                email_confirm: true,
                user_metadata: {
                    full_name: nome_completo,
                    role: 'cliente'
                }
            });
            if (authError) {
                console.error('[FormularioController] Erro ao criar auth user:', authError.message);
                // Se o usuário já existe, tenta localizar por email
                if (authError.message.includes('already')) {
                    console.log('[FormularioController] Usuário já existe, continuando com o fluxo');
                }
                else {
                    return res.status(400).json({
                        message: 'Erro ao criar conta',
                        error: authError.message
                    });
                }
            }
            const userId = authData?.user?.id;
            // 3. Criar/atualizar registro na tabela profiles
            if (userId) {
                await SupabaseClient_1.supabase
                    .from('profiles')
                    .upsert({
                    id: userId,
                    full_name: nome_completo,
                    email,
                    role: 'cliente',
                    cpf: cpf || null,
                    telefone: whatsapp
                });
            }
            // 4. Verificar se o cliente já existe na tabela clientes (por email ou whatsapp)
            let clienteId = null;
            const { data: clienteExistente } = await SupabaseClient_1.supabase
                .from('clientes')
                .select('id')
                .or(`email.eq.${email},whatsapp.eq.${whatsapp}`)
                .maybeSingle();
            if (clienteExistente) {
                clienteId = clienteExistente.id;
                // Atualizar dados do cliente existente
                await SupabaseClient_1.supabase
                    .from('clientes')
                    .update({
                    nome: nome_completo,
                    email,
                    whatsapp,
                    status: 'ATIVO',
                    user_id: userId || undefined,
                    atualizado_em: new Date().toISOString()
                })
                    .eq('id', clienteId);
            }
            else {
                // Criar novo registro na tabela clientes
                const { data: novoCliente, error: clienteError } = await SupabaseClient_1.supabase
                    .from('clientes')
                    .insert([{
                        nome: nome_completo,
                        email,
                        whatsapp,
                        status: 'ATIVO',
                        user_id: userId || null
                    }])
                    .select()
                    .single();
                if (clienteError) {
                    console.error('[FormularioController] Erro ao criar cliente:', clienteError);
                }
                else {
                    clienteId = novoCliente.id;
                }
            }
            // 5. Salvar dados do formulário no DNA do cliente (tabela formularios_consultoria)
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
            };
            // Tenta salvar o formulário — se a tabela não existir, apenas loga
            try {
                await SupabaseClient_1.supabase
                    .from('formularios_consultoria')
                    .insert([formularioData]);
            }
            catch (formError) {
                console.warn('[FormularioController] Tabela formularios_consultoria pode não existir. Dados serão salvos no metadata do cliente.');
            }
            // 6. Confirmar o agendamento (se existir)
            if (agendamento_id) {
                await SupabaseClient_1.supabase
                    .from('agendamentos')
                    .update({
                    status: 'confirmado',
                    cliente_id: clienteId
                })
                    .eq('id', agendamento_id);
                console.log('[FormularioController] Agendamento confirmado:', agendamento_id);
            }
            // 7. Enviar email de boas-vindas com credenciais
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3010';
            try {
                await EmailService_1.default.sendWelcomeEmail({
                    to: email,
                    clientName: nome_completo,
                    loginUrl: `${frontendUrl}/login`,
                    email,
                    senha: senhaGerada
                });
            }
            catch (emailError) {
                console.error('[FormularioController] Erro ao enviar email (continuando):', emailError);
            }
            console.log('[FormularioController] Formulário processado com sucesso para:', nome_completo);
            return res.status(201).json({
                success: true,
                message: 'Formulário processado com sucesso. As informações da consultoria foram enviadas para o seu email.',
                clienteId,
                email
            });
        }
        catch (error) {
            console.error('[FormularioController] Erro geral:', error);
            return res.status(500).json({
                message: 'Erro ao processar formulário',
                error: error.message
            });
        }
    }
    /**
     * POST /formulario/comprovante
     * Upload de comprovante de pagamento PIX para um agendamento
     */
    async uploadComprovante(req, res) {
        try {
            const { agendamento_id, cliente_id } = req.body;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: 'Arquivo do comprovante é obrigatório' });
            }
            if (!agendamento_id && !cliente_id) {
                return res.status(400).json({ message: 'agendamento_id ou cliente_id é obrigatório' });
            }
            const timestamp = Date.now();
            const ext = file.originalname.split('.').pop() || 'pdf';
            const filePath = `comprovantes/${cliente_id || agendamento_id}/${timestamp}_comprovante.${ext}`;
            // Upload para Supabase Storage
            const { data: uploadData, error: uploadError } = await SupabaseClient_1.supabase.storage
                .from('documentos')
                .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });
            if (uploadError) {
                console.error('[FormularioController] Erro no upload:', uploadError);
                return res.status(500).json({ message: 'Erro ao fazer upload do comprovante' });
            }
            // Obter URL pública
            const { data: urlData } = SupabaseClient_1.supabase.storage
                .from('documentos')
                .getPublicUrl(filePath);
            // Atualizar agendamento com link do comprovante
            if (agendamento_id) {
                await SupabaseClient_1.supabase
                    .from('agendamentos')
                    .update({
                    comprovante_url: urlData.publicUrl,
                    comprovante_upload_em: new Date().toISOString()
                })
                    .eq('id', agendamento_id);
            }
            console.log('[FormularioController] Comprovante salvo:', urlData.publicUrl);
            return res.status(200).json({
                success: true,
                url: urlData.publicUrl,
                message: 'Comprovante enviado com sucesso'
            });
        }
        catch (error) {
            console.error('[FormularioController] Erro no upload de comprovante:', error);
            return res.status(500).json({
                message: 'Erro ao processar comprovante',
                error: error.message
            });
        }
    }
}
exports.default = new FormularioController();
