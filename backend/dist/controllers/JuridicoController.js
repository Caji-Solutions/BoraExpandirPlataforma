"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JuridicoRepository_1 = __importDefault(require("../repositories/JuridicoRepository"));
const AdmRepository_1 = __importDefault(require("../repositories/AdmRepository"));
class JuridicoController {
    constructor() {
        // =============================================
        // GESTÃO DE FUNCIONÁRIOS
        // =============================================
        // =============================================
        // FORMULÁRIOS DO JURÍDICO (enviados para clientes)
        // =============================================
        // Mocked funcionario juridico ID (will be replaced by auth middleware later)
        this.MOCKED_FUNCIONARIO_JURIDICO_ID = 'befc50e4-3191-449e-9691-83d4e55dceb2';
    }
    // GET /juridico/funcionarios - Lista funcionários do jurídico
    async getFuncionarios(req, res) {
        try {
            const funcionarios = await JuridicoRepository_1.default.getFuncionarios();
            return res.status(200).json({
                message: 'Funcionários do jurídico recuperados com sucesso',
                data: funcionarios
            });
        }
        catch (error) {
            console.error('Erro ao buscar funcionários do jurídico:', error);
            return res.status(500).json({
                message: 'Erro ao buscar funcionários do jurídico',
                error: error.message
            });
        }
    }
    // GET /juridico/funcionario/:funcionarioId - Buscar funcionário por ID
    async getFuncionarioById(req, res) {
        try {
            const { funcionarioId } = req.params;
            if (!funcionarioId) {
                return res.status(400).json({ message: 'funcionarioId é obrigatório' });
            }
            const funcionario = await JuridicoRepository_1.default.getFuncionarioById(funcionarioId);
            if (!funcionario) {
                return res.status(404).json({ message: 'Funcionário não encontrado' });
            }
            return res.status(200).json({
                message: 'Funcionário recuperado com sucesso',
                data: funcionario
            });
        }
        catch (error) {
            console.error('Erro ao buscar funcionário:', error);
            return res.status(500).json({
                message: 'Erro ao buscar funcionário',
                error: error.message
            });
        }
    }
    // =============================================
    // GESTÃO DE PROCESSOS
    // =============================================
    // GET /juridico/processos - Lista todos os processos
    async getProcessos(req, res) {
        try {
            const processos = await JuridicoRepository_1.default.getProcessos();
            return res.status(200).json({
                message: 'Processos recuperados com sucesso',
                data: processos,
                total: processos.length
            });
        }
        catch (error) {
            console.error('Erro ao buscar processos:', error);
            return res.status(500).json({
                message: 'Erro ao buscar processos',
                error: error.message
            });
        }
    }
    // GET /juridico/processos/vagos - Lista processos sem responsável
    async getProcessosVagos(req, res) {
        try {
            const processos = await JuridicoRepository_1.default.getProcessosSemResponsavel();
            return res.status(200).json({
                message: 'Processos sem responsável recuperados com sucesso',
                data: processos,
                total: processos.length
            });
        }
        catch (error) {
            console.error('Erro ao buscar processos sem responsável:', error);
            return res.status(500).json({
                message: 'Erro ao buscar processos sem responsável',
                error: error.message
            });
        }
    }
    // GET /juridico/processos/por-responsavel/:responsavelId - Processos de um responsável
    async getProcessosByResponsavel(req, res) {
        try {
            const { responsavelId } = req.params;
            if (!responsavelId) {
                return res.status(400).json({ message: 'responsavelId é obrigatório' });
            }
            const processos = await JuridicoRepository_1.default.getProcessosByResponsavel(responsavelId);
            return res.status(200).json({
                message: 'Processos do responsável recuperados com sucesso',
                data: processos,
                total: processos.length
            });
        }
        catch (error) {
            console.error('Erro ao buscar processos do responsável:', error);
            return res.status(500).json({
                message: 'Erro ao buscar processos do responsável',
                error: error.message
            });
        }
    }
    // POST /juridico/atribuir-responsavel - Atribuir responsável a um processo
    async atribuirResponsavel(req, res) {
        try {
            const { processoId, responsavelId } = req.body; // Ambos vêm do corpo da requisição
            if (!processoId) {
                return res.status(400).json({ message: 'processoId é obrigatório' });
            }
            // Se responsavelId foi fornecido, validar se é um funcionário do jurídico
            if (responsavelId) {
                const funcionario = await JuridicoRepository_1.default.getFuncionarioById(responsavelId);
                if (!funcionario) {
                    return res.status(400).json({
                        message: 'responsavelId inválido - funcionário não encontrado ou não é do jurídico'
                    });
                }
            }
            const processo = await JuridicoRepository_1.default.atribuirResponsavel(processoId, responsavelId || null);
            return res.status(200).json({
                message: responsavelId
                    ? 'Responsável jurídico atribuído com sucesso'
                    : 'Responsável jurídico removido - processo agora está vago',
                data: processo
            });
        }
        catch (error) {
            console.error('Erro ao atribuir responsável jurídico:', error);
            return res.status(500).json({
                message: 'Erro ao atribuir responsável jurídico',
                error: error.message
            });
        }
    }
    // GET /juridico/agendamentos/delegacao - Lista agendamentos que requerem delegação
    async getAgendamentosDelegacao(req, res) {
        try {
            const agendamentos = await JuridicoRepository_1.default.getAgendamentosDelegacao();
            return res.status(200).json({
                message: 'Agendamentos para delegação recuperados com sucesso',
                data: agendamentos,
                total: agendamentos.length
            });
        }
        catch (error) {
            console.error('Erro ao buscar agendamentos para delegação:', error);
            return res.status(500).json({
                message: 'Erro ao buscar agendamentos para delegação',
                error: error.message
            });
        }
    }
    // POST /juridico/atribuir-responsavel-agendamento - Atribuir responsável a um agendamento
    async atribuirResponsavelAgendamento(req, res) {
        try {
            const { agendamentoId, responsavelId } = req.body;
            if (!agendamentoId) {
                return res.status(400).json({ message: 'agendamentoId é obrigatório' });
            }
            if (responsavelId) {
                const funcionario = await JuridicoRepository_1.default.getFuncionarioById(responsavelId);
                if (!funcionario) {
                    return res.status(400).json({
                        message: 'responsavelId inválido - funcionário não encontrado ou não é do jurídico'
                    });
                }
            }
            const agendamento = await JuridicoRepository_1.default.atribuirResponsavelAgendamento(agendamentoId, responsavelId || null);
            return res.status(200).json({
                message: responsavelId
                    ? 'Responsável jurídico atribuído ao agendamento com sucesso'
                    : 'Responsável jurídico removido do agendamento',
                data: agendamento
            });
        }
        catch (error) {
            console.error('Erro ao atribuir responsável ao agendamento:', error);
            return res.status(500).json({
                message: 'Erro ao atribuir responsável ao agendamento',
                error: error.message
            });
        }
    }
    // GET /juridico/clientes/vagos - Lista clientes sem responsável
    async getClientesVagos(req, res) {
        try {
            const clientes = await JuridicoRepository_1.default.getClientesSemResponsavel();
            return res.status(200).json({
                message: 'Clientes sem responsável recuperados com sucesso',
                data: clientes,
                total: clientes.length
            });
        }
        catch (error) {
            console.error('Erro ao buscar clientes sem responsável:', error);
            return res.status(500).json({
                message: 'Erro ao buscar clientes sem responsável',
                error: error.message
            });
        }
    }
    // GET /juridico/clientes/por-responsavel/:responsavelId - Clientes de um responsável
    async getClientesByResponsavel(req, res) {
        try {
            const { responsavelId } = req.params;
            if (!responsavelId) {
                return res.status(400).json({ message: 'responsavelId é obrigatório' });
            }
            const clientes = await JuridicoRepository_1.default.getClientesByResponsavel(responsavelId);
            return res.status(200).json({
                message: 'Clientes do responsável recuperados com sucesso',
                data: clientes,
                total: clientes.length
            });
        }
        catch (error) {
            console.error('Erro ao buscar clientes do responsável:', error);
            return res.status(500).json({
                message: 'Erro ao buscar clientes do responsável',
                error: error.message
            });
        }
    }
    // GET /juridico/cliente/:clienteId - Buscar cliente com dados do responsável
    async getClienteComResponsavel(req, res) {
        try {
            const { clienteId } = req.params;
            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' });
            }
            const cliente = await JuridicoRepository_1.default.getClienteComResponsavel(clienteId);
            if (!cliente) {
                return res.status(404).json({ message: 'Cliente não encontrado' });
            }
            return res.status(200).json({
                message: 'Cliente recuperado com sucesso',
                data: cliente
            });
        }
        catch (error) {
            console.error('Erro ao buscar cliente:', error);
            return res.status(500).json({
                message: 'Erro ao buscar cliente',
                error: error.message
            });
        }
    }
    // GET /juridico/clientes - Lista todos os clientes com seus responsáveis
    async getAllClientes(req, res) {
        try {
            const clientes = await JuridicoRepository_1.default.getAllClientesComResponsavel();
            return res.status(200).json({
                message: 'Clientes recuperados com sucesso',
                data: clientes,
                total: clientes.length
            });
        }
        catch (error) {
            console.error('Erro ao buscar clientes:', error);
            return res.status(500).json({
                message: 'Erro ao buscar clientes',
                error: error.message
            });
        }
    }
    // =============================================
    // ESTATÍSTICAS
    // =============================================
    // GET /juridico/estatisticas - Estatísticas por responsável
    async getEstatisticas(req, res) {
        try {
            const estatisticas = await JuridicoRepository_1.default.getEstatisticasPorResponsavel();
            return res.status(200).json({
                message: 'Estatísticas recuperadas com sucesso',
                data: estatisticas
            });
        }
        catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return res.status(500).json({
                message: 'Erro ao buscar estatísticas',
                error: error.message
            });
        }
    }
    // POST /juridico/formularios - Upload document from juridico to client
    async uploadFormularioJuridico(req, res) {
        try {
            const { clienteId, memberId, processoId } = req.body;
            const file = req.file;
            // TODO: Get from auth middleware when implemented
            const funcionarioJuridicoId = req.body.funcionarioJuridicoId || this.MOCKED_FUNCIONARIO_JURIDICO_ID;
            console.log('========== UPLOAD FORMULARIO JURIDICO DEBUG ==========');
            console.log('funcionarioJuridicoId:', funcionarioJuridicoId);
            console.log('clienteId:', clienteId);
            console.log('memberId:', memberId);
            console.log('processoId:', processoId);
            console.log('file:', file ? { originalname: file.originalname, size: file.size } : 'undefined');
            console.log('======================================================');
            if (!file) {
                return res.status(400).json({ message: 'Nenhum arquivo enviado' });
            }
            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' });
            }
            // Generate unique filename
            const timestamp = Date.now();
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `doc_juridico_${timestamp}.${fileExtension}`;
            // Build storage path: clienteId/juridico/memberId_or_titular/filename
            const targetMember = memberId || 'titular';
            const filePath = `${clienteId}/juridico/${targetMember}/${fileName}`;
            // Upload to formularios-juridico bucket
            const uploadResult = await JuridicoRepository_1.default.uploadFormularioJuridico({
                filePath,
                fileBuffer: file.buffer,
                contentType: file.mimetype
            });
            // Create database record
            const formularioRecord = await JuridicoRepository_1.default.createFormularioJuridico({
                funcionarioJuridicoId,
                clienteId,
                membroId: memberId || undefined,
                processoId: processoId || undefined,
                nomeOriginal: file.originalname,
                nomeArquivo: fileName,
                storagePath: filePath,
                publicUrl: uploadResult.publicUrl,
                contentType: file.mimetype,
                tamanho: file.size,
                notificar: req.body.notificar !== undefined ? req.body.notificar === 'true' || req.body.notificar === true : true
            });
            return res.status(200).json({
                message: 'Documento enviado para o cliente com sucesso',
                data: {
                    id: formularioRecord.id,
                    name: file.originalname.replace(/\.[^/.]+$/, ''),
                    fileName: file.originalname,
                    fileSize: file.size,
                    uploadDate: new Date(),
                    memberId: memberId || null,
                    downloadUrl: uploadResult.publicUrl
                }
            });
        }
        catch (error) {
            console.error('Erro ao upload de formulário jurídico:', error);
            return res.status(500).json({
                message: 'Erro ao enviar documento para o cliente',
                error: error.message
            });
        }
    }
    // GET /juridico/formularios/:clienteId - Get documents sent by juridico to this client
    async getFormulariosJuridico(req, res) {
        try {
            const { clienteId } = req.params;
            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' });
            }
            const formularios = await JuridicoRepository_1.default.getFormulariosJuridicoByClienteId(clienteId);
            return res.status(200).json({
                message: 'Documentos do jurídico recuperados com sucesso',
                data: formularios
            });
        }
        catch (error) {
            console.error('Erro ao buscar formulários jurídico:', error);
            return res.status(500).json({
                message: 'Erro ao buscar documentos do jurídico',
                error: error.message
            });
        }
    }
    // DELETE /juridico/formularios/:formularioId - Delete a document
    async deleteFormularioJuridico(req, res) {
        try {
            const { formularioId } = req.params;
            if (!formularioId) {
                return res.status(400).json({ message: 'formularioId é obrigatório' });
            }
            await JuridicoRepository_1.default.deleteFormularioJuridico(formularioId);
            return res.status(200).json({
                message: 'Documento deletado com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao deletar formulário jurídico:', error);
            return res.status(500).json({
                message: 'Erro ao deletar documento',
                error: error.message
            });
        }
    }
    // GET /juridico/formularios-status/:clienteId/:membroId? - Get formulários with response status
    async getFormulariosComRespostas(req, res) {
        try {
            const { clienteId, membroId } = req.params;
            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' });
            }
            const formularios = await JuridicoRepository_1.default.getFormulariosWithResponses(clienteId, membroId);
            return res.status(200).json({
                message: 'Formulários com status recuperados com sucesso',
                data: formularios
            });
        }
        catch (error) {
            console.error('Erro ao buscar formulários com status:', error);
            return res.status(500).json({
                message: 'Erro ao buscar formulários com status',
                error: error.message
            });
        }
    }
    // PATCH /juridico/formulario-cliente/:id/status - Update formulario_cliente status (approve/reject)
    async updateFormularioClienteStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, motivoRejeicao } = req.body;
            if (!id) {
                return res.status(400).json({ message: 'id é obrigatório' });
            }
            if (!status || !['pendente', 'aprovado', 'rejeitado'].includes(status)) {
                return res.status(400).json({
                    message: 'status é obrigatório e deve ser: pendente, aprovado ou rejeitado'
                });
            }
            if (status === 'rejeitado' && !motivoRejeicao) {
                return res.status(400).json({
                    message: 'motivoRejeicao é obrigatório quando status é rejeitado'
                });
            }
            const formulario = await JuridicoRepository_1.default.updateFormularioClienteStatus(id, status, motivoRejeicao);
            return res.status(200).json({
                message: status === 'aprovado'
                    ? 'Formulário aprovado com sucesso'
                    : status === 'rejeitado'
                        ? 'Formulário rejeitado com sucesso'
                        : 'Status do formulário atualizado com sucesso',
                data: formulario
            });
        }
        catch (error) {
            console.error('Erro ao atualizar status do formulário cliente:', error);
            return res.status(500).json({
                message: 'Erro ao atualizar status do formulário',
                error: error.message
            });
        }
    }
    // =============================================
    // GESTÃO DE NOTAS DO JURÍDICO
    // =============================================
    // POST /juridico/notas - Criar nota
    async createNote(req, res) {
        try {
            const { clienteId, processoId, etapa, texto } = req.body;
            // TODO: Pegar do middleware de auth
            const autorId = req.body.autorId || this.MOCKED_FUNCIONARIO_JURIDICO_ID;
            console.log('========== JURIDICO CREATE NOTE DEBUG ==========');
            console.log('clienteId:', clienteId);
            console.log('processoId:', processoId);
            console.log('etapa:', etapa);
            console.log('autorId:', autorId);
            console.log('texto:', texto ? (texto.substring(0, 20) + '...') : 'undefined');
            console.log('================================================');
            if (!clienteId || !texto) {
                console.warn('[JuridicoController] clienteId ou texto faltando');
                return res.status(400).json({ message: 'clienteId e texto são obrigatórios' });
            }
            const nota = await JuridicoRepository_1.default.createNote({
                clienteId,
                processoId,
                etapa,
                autorId,
                texto
            });
            console.log('[JuridicoController] Nota criada com sucesso no DB');
            return res.status(201).json({
                message: 'Nota jurídica criada com sucesso',
                data: nota
            });
        }
        catch (error) {
            console.error('[JuridicoController] Erro fatal ao criar nota jurídica:', error);
            return res.status(500).json({
                message: 'Erro ao criar nota jurídica',
                error: error.message
            });
        }
    }
    // GET /juridico/notas/:clienteId - Buscar notas de um cliente
    async getNotes(req, res) {
        try {
            const { clienteId } = req.params;
            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' });
            }
            const notas = await JuridicoRepository_1.default.getNotesByClienteId(clienteId);
            return res.status(200).json({
                message: 'Notas jurídicas recuperadas com sucesso',
                data: notas
            });
        }
        catch (error) {
            console.error('Erro ao buscar notas jurídicas:', error);
            return res.status(500).json({
                message: 'Erro ao buscar notas jurídicas',
                error: error.message
            });
        }
    }
    // DELETE /juridico/notas/:noteId - Deletar nota
    async deleteNote(req, res) {
        try {
            const { noteId } = req.params;
            if (!noteId) {
                return res.status(400).json({ message: 'noteId é obrigatório' });
            }
            await JuridicoRepository_1.default.deleteNote(noteId);
            return res.status(200).json({
                message: 'Nota jurídica deletada com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao deletar nota jurídica:', error);
            return res.status(500).json({
                message: 'Erro ao deletar nota jurídica',
                error: error.message
            });
        }
    }
    // POST /juridico/documentos/solicitar - Solicitar documento
    async solicitarDocumento(req, res) {
        try {
            const { clienteId, tipo, processoId, membroId, requerimentoId, notificar, prazo } = req.body;
            if (!clienteId || !tipo) {
                return res.status(400).json({
                    message: 'clienteId e tipo são obrigatórios'
                });
            }
            // TODO: Pegar do middleware de auth
            const criadorId = req.body.criadorId || this.MOCKED_FUNCIONARIO_JURIDICO_ID;
            const documento = await JuridicoRepository_1.default.solicitarDocumento({
                clienteId,
                tipo,
                processoId,
                membroId,
                requerimentoId,
                notificar,
                prazo,
                criadorId
            });
            return res.status(201).json({
                message: 'Solicitação de documento criada com sucesso',
                data: documento
            });
        }
        catch (error) {
            console.error('Erro ao solicitar documento no controller:', error);
            return res.status(500).json({
                message: 'Erro ao solicitar documento',
                error: error.message
            });
        }
    }
    // POST /juridico/requerimentos/solicitar - Solicitar requerimento
    async solicitarRequerimento(req, res) {
        try {
            const { clienteId, tipo, processoId, observacoes, documentosAcoplados } = req.body;
            const files = req.files; // Multer array of files
            if (!clienteId || !tipo) {
                return res.status(400).json({
                    message: 'clienteId e tipo são obrigatórios'
                });
            }
            // TODO: Pegar do middleware de auth
            const criadorId = req.body.criadorId || this.MOCKED_FUNCIONARIO_JURIDICO_ID;
            // Parse documentosAcoplados if it's a string (from FormData)
            let parsedDocs = [];
            if (documentosAcoplados) {
                try {
                    parsedDocs = typeof documentosAcoplados === 'string'
                        ? JSON.parse(documentosAcoplados)
                        : documentosAcoplados;
                }
                catch (e) {
                    console.error('Erro ao fazer parse de documentosAcoplados:', e);
                }
            }
            const requerimento = await JuridicoRepository_1.default.solicitarRequerimento({
                clienteId,
                tipo,
                processoId,
                observacoes,
                criadorId,
                documentosAcoplados: parsedDocs,
                files: files || [],
                notificar: req.body.notificar !== undefined ? req.body.notificar === 'true' || req.body.notificar === true : true,
                prazo: req.body.prazo ? parseInt(req.body.prazo) : undefined
            });
            return res.status(201).json({
                message: 'Solicitação de requerimento criada com sucesso',
                data: requerimento
            });
        }
        catch (error) {
            console.error('Erro ao solicitar requerimento no controller:', error);
            return res.status(500).json({
                message: 'Erro ao solicitar requerimento',
                error: error.message
            });
        }
    }
    // PATCH /juridico/processo/:processoId/etapa - Atualizar etapa do processo
    async updateEtapaProcesso(req, res) {
        try {
            const { processoId } = req.params;
            const { etapa } = req.body;
            if (!processoId) {
                return res.status(400).json({ message: 'processoId é obrigatório' });
            }
            if (etapa === undefined || isNaN(parseInt(etapa))) {
                return res.status(400).json({ message: 'etapa válida é obrigatória' });
            }
            const processo = await JuridicoRepository_1.default.updateEtapaProcesso(processoId, parseInt(etapa));
            return res.status(200).json({
                message: 'Etapa do processo atualizada com sucesso',
                data: processo
            });
        }
        catch (error) {
            console.error('Erro ao atualizar etapa do processo:', error);
            return res.status(500).json({
                message: 'Erro ao atualizar etapa do processo',
                error: error.message
            });
        }
    }
    // POST /juridico/processo - Criar processo manualmente
    async createProcess(req, res) {
        try {
            const { clienteId, tipoServico, status, etapaAtual, responsavelId } = req.body;
            if (!clienteId || !tipoServico) {
                return res.status(400).json({
                    message: 'clienteId e tipoServico são obrigatórios'
                });
            }
            const processo = await JuridicoRepository_1.default.createProcess({
                clienteId,
                tipoServico,
                status,
                etapaAtual,
                responsavelId
            });
            return res.status(201).json({
                message: 'Processo criado com sucesso',
                data: processo
            });
        }
        catch (error) {
            console.error('Erro ao criar processo no controller:', error);
            return res.status(500).json({
                message: 'Erro ao criar processo',
                error: error.message
            });
        }
    }
    // POST /juridico/assessoria - Criar assessoria jurídica
    async createAssessoria(req, res) {
        try {
            const { clienteId, respostas, observacoes, servicoId } = req.body;
            // TODO: Pegar do middleware de auth
            const responsavelId = req.body.responsavelId || this.MOCKED_FUNCIONARIO_JURIDICO_ID;
            if (!clienteId || !respostas) {
                return res.status(400).json({
                    message: 'clienteId e respostas são obrigatórios'
                });
            }
            // 1. Criar a assessoria
            const assessoria = await JuridicoRepository_1.default.createAssessoria({
                clienteId,
                responsavelId,
                respostas,
                servicoId,
                observacoes
            });
            // 2. Sincronizar com a tabela processos
            try {
                // Tenta descobrir o nome do serviço e requisitos se houver servicoId
                let tipoServico = 'Assessoria Jurídica';
                let documentosRequisitados = [];
                if (servicoId) {
                    const servicoData = await AdmRepository_1.default.getServiceById(servicoId);
                    if (servicoData) {
                        if (servicoData.nome)
                            tipoServico = servicoData.nome;
                        // Mapear requisitos para o estado inicial de documentos no processo
                        if (servicoData.requisitos && Array.isArray(servicoData.requisitos)) {
                            documentosRequisitados = servicoData.requisitos.map((r) => ({
                                id: BigInt(Math.floor(Math.random() * 1000000)).toString(), // ID temporário ou UUID
                                nome: r.nome,
                                etapa: r.etapa,
                                obrigatorio: r.obrigatorio,
                                status: 'pendente',
                                enviado: false
                            }));
                        }
                    }
                }
                // Verifica se já existe um processo para este cliente
                const processoExistente = await JuridicoRepository_1.default.getProcessoByClienteId(clienteId);
                if (processoExistente) {
                    // Atualiza processo existente
                    const updateParams = {
                        tipoServico,
                        assessoriaId: assessoria.id,
                        servicoId: servicoId || null
                    };
                    // Se o processo ainda não tem documentos ou se queremos "resetar/adicionar" os novos
                    // Aqui decidimos manter os que já existem e adicionar novos se necessário, ou apenas subscrever
                    // Para simplificar agora vindo da assessoria (que redefine o serviço), vamos atualizar os documentos
                    if (documentosRequisitados.length > 0) {
                        updateParams.documentos = documentosRequisitados;
                    }
                    await JuridicoRepository_1.default.updateProcess(processoExistente.id, updateParams);
                }
                else {
                    // Cria novo processo
                    await JuridicoRepository_1.default.createProcess({
                        clienteId,
                        tipoServico,
                        status: 'formularios',
                        etapaAtual: 1,
                        assessoriaId: assessoria.id,
                        servicoId: servicoId || null,
                        documentos: documentosRequisitados
                    });
                }
            }
            catch (procError) {
                console.error('Erro ao sincronizar processo com assessoria:', procError);
                // Não falha a requisição da assessoria se o processo falhar
            }
            return res.status(201).json({
                message: 'Assessoria jurídica criada com sucesso e processo sincronizado',
                data: assessoria
            });
        }
        catch (error) {
            console.error('Erro ao criar assessoria jurídica no controller:', error);
            return res.status(500).json({
                message: 'Erro ao criar assessoria jurídica',
                error: error.message
            });
        }
    }
    // GET /juridico/assessoria/:clienteId - Buscar última assessoria
    async getLatestAssessoria(req, res) {
        try {
            const { clienteId } = req.params;
            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' });
            }
            const assessoria = await JuridicoRepository_1.default.getLatestAssessoriaByClienteId(clienteId);
            return res.status(200).json({
                data: assessoria
            });
        }
        catch (error) {
            console.error('Erro ao buscar assessoria no controller:', error);
            return res.status(500).json({
                message: 'Erro ao buscar assessoria',
                error: error.message
            });
        }
    }
    // GET /juridico/processo-cliente/:clienteId - Buscar processo do cliente
    async getProcessoByCliente(req, res) {
        try {
            const { clienteId } = req.params;
            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' });
            }
            const processo = await JuridicoRepository_1.default.getProcessoByClienteId(clienteId);
            return res.status(200).json({
                data: processo
            });
        }
        catch (error) {
            console.error('Erro ao buscar processo no controller:', error);
            return res.status(500).json({
                message: 'Erro ao buscar processo',
                error: error.message
            });
        }
    }
}
exports.default = new JuridicoController();
