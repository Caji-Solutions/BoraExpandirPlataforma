import JuridicoRepository from '../../repositories/JuridicoRepository'
import AdmRepository from '../../repositories/AdmRepository'
import { supabase } from '../../config/SupabaseClient'
import NotificationService from '../../services/NotificationService'
import ComercialRepository from '../../repositories/ComercialRepository'
import DNAService from '../../services/DNAService'
import { toBrtFromUtc } from '../../utils/dateUtils'

class JuridicoController {

    // =============================================
    // GESTÃO DE FUNCIONÁRIOS
    // =============================================

    // GET /juridico/funcionarios - Lista funcionários do jurídico
    async getFuncionarios(req: any, res: any) {
        try {
            const funcionarios = await JuridicoRepository.getFuncionarios()

            return res.status(200).json({
                message: 'Funcionários do jurídico recuperados com sucesso',
                data: funcionarios
            })
        } catch (error: any) {
            console.error('Erro ao buscar funcionarios do juridico:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar funcionários do jurídico', 
                error: error.message 
            })
        }
    }

    // GET /juridico/funcionario/:funcionarioId - Buscar funcionário por ID
    async getFuncionarioById(req: any, res: any) {
        try {
            const { funcionarioId } = req.params

            if (!funcionarioId) {
                return res.status(400).json({ message: 'funcionarioId é obrigatório' })
            }

            const funcionario = await JuridicoRepository.getFuncionarioById(funcionarioId)

            if (!funcionario) {
                return res.status(404).json({ message: 'Funcionário não encontrado' })
            }

            return res.status(200).json({
                message: 'Funcionário recuperado com sucesso',
                data: funcionario
            })
        } catch (error: any) {
            console.error('Erro ao buscar funcionario:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar funcionário', 
                error: error.message 
            })
        }
    }

    // =============================================
    // GESTÃO DE PROCESSOS
    // =============================================

    // GET /juridico/processos - Lista todos os processos
    async getProcessos(req: any, res: any) {
        try {
            const processos = await JuridicoRepository.getProcessos()

            return res.status(200).json({
                message: 'Processos recuperados com sucesso',
                data: processos,
                total: processos.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar processos:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar processos', 
                error: error.message 
            })
        }
    }

    // GET /juridico/processos/vagos - Lista processos sem responsável
    async getProcessosVagos(req: any, res: any) {
        try {
            const processos = await JuridicoRepository.getProcessosSemResponsavel()

            return res.status(200).json({
                message: 'Processos sem responsável recuperados com sucesso',
                data: processos,
                total: processos.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar processos sem responsavel:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar processos sem responsável', 
                error: error.message 
            })
        }
    }

    // GET /juridico/processos/por-responsavel/:responsavelId - Processos de um responsável
    async getProcessosByResponsavel(req: any, res: any) {
        try {
            const { responsavelId } = req.params

            if (!responsavelId) {
                return res.status(400).json({ message: 'responsavelId é obrigatório' })
            }

            const processos = await JuridicoRepository.getProcessosByResponsavel(responsavelId)

            return res.status(200).json({
                message: 'Processos do responsável recuperados com sucesso',
                data: processos,
                total: processos.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar processos do responsavel:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar processos do responsável', 
                error: error.message 
            })
        }
    }

    // POST /juridico/atribuir-responsavel - Atribuir responsável a um processo
    async atribuirResponsavel(req: any, res: any) {
        try {
            const { processoId, responsavelId } = req.body // Ambos vêm do corpo da requisição

            if (!processoId) {
                return res.status(400).json({ message: 'processoId é obrigatório' })
            }

            // Se responsavelId foi fornecido, validar se é um funcionário do jurídico
            if (responsavelId) {
                const funcionario = await JuridicoRepository.getFuncionarioById(responsavelId)
                if (!funcionario) {
                    return res.status(400).json({ 
                        message: 'responsavelId inválido - funcionário não encontrado ou não é do jurídico' 
                    })
                }
            }

            const processo = await JuridicoRepository.atribuirResponsavel(processoId, responsavelId || null)

            return res.status(200).json({
                message: responsavelId 
                    ? 'Responsável jurídico atribuído com sucesso' 
                    : 'Responsável jurídico removido - processo agora está vago',
                data: processo
            })
        } catch (error: any) {
            console.error('Erro ao atribuir responsavel juridico:', error)
            return res.status(500).json({ 
                message: 'Erro ao atribuir responsável jurídico', 
                error: error.message 
            })
        }
    }


    // POST /juridico/atribuir-responsavel-agendamento - Atribuir responsável a um agendamento
    async atribuirResponsavelAgendamento(req: any, res: any) {
        try {
            const { agendamentoId, responsavelId } = req.body

            if (!agendamentoId) {
                return res.status(400).json({ message: 'agendamentoId é obrigatório' })
            }

            if (responsavelId) {
                const funcionario = await JuridicoRepository.getFuncionarioById(responsavelId)
                if (!funcionario) {
                    return res.status(400).json({ 
                        message: 'responsavelId inválido - funcionário não encontrado ou não é do jurídico' 
                    })
                }
            }

            const agendamento = await JuridicoRepository.atribuirResponsavelAgendamento(agendamentoId, responsavelId || null)

            return res.status(200).json({
                message: responsavelId 
                    ? 'Responsável jurídico atribuído ao agendamento com sucesso' 
                    : 'Responsável jurídico removido do agendamento',
                data: agendamento
            })
        } catch (error: any) {
            console.error('Erro ao atribuir responsavel ao agendamento:', error)
            return res.status(500).json({ 
                message: 'Erro ao atribuir responsável ao agendamento', 
                error: error.message 
            })
        }
    }

    // GET /juridico/clientes/vagos - Lista clientes sem responsável
    async getClientesVagos(req: any, res: any) {
        try {
            const clientes = await JuridicoRepository.getClientesSemResponsavel()

            return res.status(200).json({
                message: 'Clientes sem responsável recuperados com sucesso',
                data: clientes,
                total: clientes.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar clientes sem responsavel:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar clientes sem responsável', 
                error: error.message 
            })
        }
    }

    // GET /juridico/clientes/por-responsavel/:responsavelId - Clientes de um responsável
    async getClientesByResponsavel(req: any, res: any) {
        try {
            const { responsavelId } = req.params

            if (!responsavelId) {
                return res.status(400).json({ message: 'responsavelId é obrigatório' })
            }

            const clientes = await JuridicoRepository.getClientesByResponsavel(responsavelId)

            return res.status(200).json({
                message: 'Clientes do responsável recuperados com sucesso',
                data: clientes,
                total: clientes.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar clientes do responsavel:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar clientes do responsável', 
                error: error.message 
            })
        }
    }

    // GET /juridico/cliente/:clienteId - Buscar cliente com dados do responsável
    async getClienteComResponsavel(req: any, res: any) {
        try {
            const { clienteId } = req.params

            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' })
            }

            const cliente = await JuridicoRepository.getClienteComResponsavel(clienteId)

            if (!cliente) {
                return res.status(404).json({ message: 'Cliente não encontrado' })
            }

            return res.status(200).json({
                message: 'Cliente recuperado com sucesso',
                data: cliente
            })
        } catch (error: any) {
            console.error('Erro ao buscar cliente:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar cliente', 
                error: error.message 
            })
        }
    }

    // GET /juridico/clientes - Lista todos os clientes com seus responsáveis
    async getAllClientes(req: any, res: any) {
        try {
            const clientes = await JuridicoRepository.getAllClientesComResponsavel()

            console.log(`[JuridicoController] Total de clientes recuperados: ${clientes.length}`);

            return res.status(200).json({
                message: 'Clientes recuperados com sucesso',
                data: clientes,
                total: clientes.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar clientes:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar clientes', 
                error: error.message 
            })
        }
    }

    // GET /juridico/subservicos
    async getSubservices(req: any, res: any) {
        try {
            const subservicos = await AdmRepository.getAllSubservices();
            
            return res.status(200).json({
                message: 'Subserviços recuperados com sucesso',
                data: subservicos
            });
        } catch (error: any) {
            console.error('Erro ao buscar subservicos:', error);
            return res.status(500).json({
                message: 'Erro ao buscar subserviços',
                error: error.message
            });
        }
    }

    // =============================================
    // ESTATÍSTICAS
    // =============================================

    // GET /juridico/estatisticas - Estatísticas por responsável
    async getEstatisticas(req: any, res: any) {
        try {
            const estatisticas = await JuridicoRepository.getEstatisticasPorResponsavel()

            return res.status(200).json({
                message: 'Estatísticas recuperadas com sucesso',
                data: estatisticas
            })
        } catch (error: any) {
            console.error('Erro ao buscar estatisticas:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar estatísticas', 
                error: error.message 
            })
        }
    }

    // =============================================
    // FORMULÁRIOS DO JURÍDICO (enviados para clientes)
    // =============================================

    // Métodos removidos: MOCKED_FUNCIONARIO_JURIDICO_ID foi substituído pelo authMiddleware

    // POST /juridico/formularios - Upload document from juridico to client
    async uploadFormularioJuridico(req: any, res: any) {
        try {
            const { clienteId, memberId, processoId } = req.body
            const file = req.file
            const funcionarioJuridicoId = req.userId

            console.log('========== [JuridicoController][uploadFormularioJuridico] START ==========')
            console.log('Input:', { funcionarioJuridicoId, clienteId, memberId, processoId, fileName: file?.originalname })

            if (!file) {
                console.warn('[JuridicoController][uploadFormularioJuridico] No file sent')
                return res.status(400).json({ message: 'Nenhum arquivo enviado' })
            }

            if (!clienteId) {
                console.warn('[JuridicoController][uploadFormularioJuridico] clienteId missing')
                return res.status(400).json({ message: 'clienteId é obrigatório' })
            }

            // Generate unique filename
            const timestamp = Date.now()
            const fileExtension = file.originalname.split('.').pop()
            const fileName = `doc_juridico_${timestamp}.${fileExtension}`

            // Build storage path: clienteId/juridico/memberId_or_titular/filename
            const targetMember = memberId || 'titular'
            const filePath = `${clienteId}/juridico/${targetMember}/${fileName}`

            // Upload to formularios-juridico bucket
            const uploadResult = await JuridicoRepository.uploadFormularioJuridico({
                filePath,
                fileBuffer: file.buffer,
                contentType: file.mimetype
            })

            // Create database record
            const formularioRecord = await JuridicoRepository.createFormularioJuridico({
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
            })

            const response = {
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
            }

            console.log('[JuridicoController][uploadFormularioJuridico] SUCCESS:', response)
            return res.status(200).json(response)
        } catch (error: any) {
            console.error('[JuridicoController][uploadFormularioJuridico] ERROR:', error)
            return res.status(500).json({
                message: 'Erro ao enviar documento para o cliente',
                error: error.message
            })
        }
    }

    // GET /juridico/formularios/:clienteId - Get documents sent by juridico to this client
    async getFormulariosJuridico(req: any, res: any) {
        try {
            const { clienteId } = req.params

            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' })
            }

            const formularios = await JuridicoRepository.getFormulariosJuridicoByClienteId(clienteId)

            return res.status(200).json({
                message: 'Documentos do jurídico recuperados com sucesso',
                data: formularios
            })
        } catch (error: any) {
            console.error('Erro ao buscar formularios juridico:', error)
            return res.status(500).json({
                message: 'Erro ao buscar documentos do jurídico',
                error: error.message
            })
        }
    }

    // DELETE /juridico/formularios/:formularioId - Delete a document
    async deleteFormularioJuridico(req: any, res: any) {
        try {
            const { formularioId } = req.params

            if (!formularioId) {
                return res.status(400).json({ message: 'formularioId é obrigatório' })
            }

            await JuridicoRepository.deleteFormularioJuridico(formularioId)

            return res.status(200).json({
                message: 'Documento deletado com sucesso'
            })
        } catch (error: any) {
            console.error('Erro ao deletar formulario juridico:', error)
            return res.status(500).json({
                message: 'Erro ao deletar documento',
                error: error.message
            })
        }
    }

    // GET /juridico/formularios-status/:clienteId/:membroId? - Get formulários with response status
    async getFormulariosComRespostas(req: any, res: any) {
        try {
            const { clienteId, membroId } = req.params

            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' })
            }

            const formularios = await JuridicoRepository.getFormulariosWithResponses(clienteId, membroId)

            return res.status(200).json({
                message: 'Formulários com status recuperados com sucesso',
                data: formularios
            })
        } catch (error: any) {
            console.error('Erro ao buscar formularios com status:', error)
            return res.status(500).json({
                message: 'Erro ao buscar formulários com status',
                error: error.message
            })
        }
    }

    // PATCH /juridico/formulario-cliente/:id/status - Update formulario_cliente status (approve/reject)
    async updateFormularioClienteStatus(req: any, res: any) {
        try {
            const { id } = req.params
            const { status, motivoRejeicao } = req.body

            console.log('========== [JuridicoController][updateFormularioClienteStatus] START ==========')
            console.log('Input:', { id, status, motivoRejeicao })

            if (!id) {
                return res.status(400).json({ message: 'id é obrigatório' })
            }

            if (!status || !['pendente', 'aprovado', 'rejeitado'].includes(status)) {
                return res.status(400).json({ 
                    message: 'status é obrigatório e deve ser: pendente, aprovado ou rejeitado' 
                })
            }

            if (status === 'rejeitado' && !motivoRejeicao) {
                return res.status(400).json({ 
                    message: 'motivoRejeicao é obrigatório quando status é rejeitado' 
                })
            }

            const formulario = await JuridicoRepository.updateFormularioClienteStatus(
                id, 
                status, 
                motivoRejeicao
            )

            const response = {
                message: status === 'aprovado' 
                    ? 'Formulário aprovado com sucesso' 
                    : status === 'rejeitado' 
                    ? 'Formulário rejeitado com sucesso' 
                    : 'Status do formulário atualizado com sucesso',
                data: formulario
            }

            console.log('[JuridicoController][updateFormularioClienteStatus] SUCCESS:', response)
            return res.status(200).json(response)
        } catch (error: any) {
            console.error('[JuridicoController][updateFormularioClienteStatus] ERROR:', error)
            return res.status(500).json({
                message: 'Erro ao atualizar status do formulário',
                error: error.message
            })
        }
    }

    // =============================================
    // GESTÃO DE NOTAS DO JURÍDICO
    // =============================================

    // POST /juridico/notas - Criar nota
    async createNote(req: any, res: any) {
        try {
            const { clienteId, processoId, etapa, texto, autorNome, autorSetor } = req.body
            const autorId = req.userId

            console.log('========== [JuridicoController][createNote] START ==========')
            console.log('Input:', { clienteId, processoId, etapa, autorId, autorNome, autorSetor, textoPreview: texto?.substring(0, 50) })

            if (!clienteId || !texto) {
                console.warn('[JuridicoController][createNote] clienteId or texto missing')
                return res.status(400).json({ message: 'clienteId e texto são obrigatórios' })
            }

            const nota = await JuridicoRepository.createNote({
                clienteId,
                processoId,
                etapa,
                autorId,
                autorNome,
                autorSetor,
                texto
            })

            const response = {
                message: 'Nota jurídica criada com sucesso',
                data: nota
            }

            console.log('[JuridicoController][createNote] SUCCESS:', response)
            return res.status(201).json(response)
        } catch (error: any) {
            console.error('[JuridicoController][createNote] ERROR:', error)
            return res.status(500).json({
                message: 'Erro ao criar nota jurídica',
                error: error.message
            })
        }
    }

    // GET /juridico/notas/:clienteId - Buscar notas de um cliente
    async getNotes(req: any, res: any) {
        try {
            const { clienteId } = req.params

            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' })
            }

            console.log('[JuridicoController] Buscando notas para clienteId:', clienteId)
            const notas = await JuridicoRepository.getNotesByClienteId(clienteId)
            console.log('[JuridicoController] Notas encontradas:', notas.length)

            return res.status(200).json({
                message: 'Notas jurídicas recuperadas com sucesso',
                data: notas
            })
        } catch (error: any) {
            console.error('Erro ao buscar notas juridicas:', error)
            return res.status(500).json({
                message: 'Erro ao buscar notas jurídicas',
                error: error.message
            })
        }
    }

    // DELETE /juridico/notas/:noteId - Deletar nota
    async deleteNote(req: any, res: any) {
        try {
            const { noteId } = req.params
            const userId = req.userId

            if (!noteId) {
                return res.status(400).json({ message: 'noteId é obrigatório' })
            }

            if (!userId) {
                return res.status(400).json({ message: 'userId é obrigatório para deletar a nota' })
            }

            const nota = await JuridicoRepository.getNoteById(noteId)
            if (!nota) {
                return res.status(404).json({ message: 'Nota não encontrada' })
            }

            if (nota.autor_id !== userId && userId !== 'admin') {
                return res.status(403).json({ message: 'Sem permissão para deletar esta nota' })
            }

            await JuridicoRepository.deleteNote(noteId)

            return res.status(200).json({
                message: 'Nota jurídica deletada com sucesso'
            })
        } catch (error: any) {
            console.error('Erro ao deletar nota juridica:', error)
            return res.status(500).json({
                message: 'Erro ao deletar nota jurídica',
                error: error.message
            })
        }
    }

    // POST /juridico/documentos/solicitar - Solicitar documento
    async solicitarDocumento(req: any, res: any) {
        try {
            const { clienteId, tipo, processoId, membroId, requerimentoId, notificar, prazo, solicitado_pelo_juridico } = req.body
            const criadorId = req.userId

            console.log('========== [JuridicoController][solicitarDocumento] START ==========')
            console.log('Input:', { clienteId, tipo, processoId, membroId, requerimentoId, notificar, prazo, solicitado_pelo_juridico, criadorId })

            if (!clienteId || !tipo) {
                return res.status(400).json({ 
                    message: 'clienteId e tipo são obrigatórios' 
                })
            }

            const documento = await JuridicoRepository.solicitarDocumento({
                clienteId,
                tipo,
                processoId,
                membroId,
                requerimentoId,
                notificar,
                prazo,
                criadorId,
                solicitado_pelo_juridico: solicitado_pelo_juridico !== undefined ? (solicitado_pelo_juridico === true || solicitado_pelo_juridico === 'true') : undefined
            })

            const response = {
                message: 'Solicitação de documento criada com sucesso',
                data: documento
            }

            console.log('[JuridicoController][solicitarDocumento] SUCCESS:', response)
            return res.status(201).json(response)
        } catch (error: any) {
            console.error('[JuridicoController][solicitarDocumento] ERROR:', error)
            return res.status(500).json({
                message: 'Erro ao solicitar documento',
                error: error.message
            })
        }
    }

    // POST /juridico/requerimentos/solicitar - Solicitar requerimento
    async solicitarRequerimento(req: any, res: any) {
        try {
            const { clienteId, tipo, processoId, observacoes, documentosAcoplados } = req.body
            const files = req.files // Multer array of files
            const criadorId = req.userId

            console.log('========== [JuridicoController][solicitarRequerimento] START ==========')
            console.log('Input:', { 
                clienteId, 
                tipo, 
                processoId, 
                prazo: req.body.prazo,
                docsCount: documentosAcoplados?.length, 
                filesCount: files?.length, 
                criadorId 
            })

            if (!clienteId || !tipo) {
                return res.status(400).json({ 
                    message: 'clienteId e tipo são obrigatórios' 
                })
            }

            // Parse documentosAcoplados if it's a string (from FormData)
            let parsedDocs = []
            if (documentosAcoplados) {
                try {
                    parsedDocs = typeof documentosAcoplados === 'string' 
                        ? JSON.parse(documentosAcoplados) 
                        : documentosAcoplados
                } catch (e) {
                    console.error('Erro ao fazer parse de documentosAcoplados:', e)
                }
            }

            const requerimento = await JuridicoRepository.solicitarRequerimento({
                clienteId,
                tipo,
                processoId,
                observacoes,
                criadorId,
                documentosAcoplados: parsedDocs,
                files: files || [],
                notificar: req.body.notificar !== undefined ? req.body.notificar === 'true' || req.body.notificar === true : true,
                prazo: req.body.prazo ? parseInt(req.body.prazo) : undefined
            })

            const response = {
                message: 'Solicitação de requerimento criada com sucesso',
                data: requerimento
            }

            console.log('[JuridicoController][solicitarRequerimento] SUCCESS:', response)
            return res.status(201).json(response)
        } catch (error: any) {
            console.error('[JuridicoController][solicitarRequerimento] ERROR:', error)
            return res.status(500).json({
                message: 'Erro ao solicitar requerimento',
                error: error.message
            })
        }
    }

    // GET /juridico/requerimentos - Listar requerimentos
    async getRequerimentos(_req: any, res: any) {
        try {
            const requerimentos = await JuridicoRepository.getAllRequerimentos()

            return res.status(200).json({
                data: requerimentos
            })
        } catch (error: any) {
            console.error('Erro ao buscar requerimentos:', error)
            return res.status(500).json({
                message: 'Erro ao buscar requerimentos',
                error: error.message
            })
        }
    }

    // PATCH /juridico/processo/:processoId/etapa - Atualizar etapa do processo
    async updateEtapaProcesso(req: any, res: any) {
        try {
            const { processoId } = req.params
            const { etapa } = req.body

            console.log('========== [JuridicoController][updateEtapaProcesso] START ==========')
            console.log('Input:', { processoId, etapa })

            if (!processoId) {
                return res.status(400).json({ message: 'processoId é obrigatório' })
            }

            if (etapa === undefined || isNaN(parseInt(etapa))) {
                return res.status(400).json({ message: 'etapa válida é obrigatória' })
            }

            const processo = await JuridicoRepository.updateEtapaProcesso(processoId, parseInt(etapa))

            const response = {
                message: 'Etapa do processo atualizada com sucesso',
                data: processo
            }

            console.log('[JuridicoController][updateEtapaProcesso] SUCCESS:', response)
            return res.status(200).json(response)
        } catch (error: any) {
            console.error('[JuridicoController][updateEtapaProcesso] ERROR:', error)
            return res.status(500).json({ 
                message: 'Erro ao atualizar etapa do processo', 
                error: error.message 
            })
        }
    }
    // POST /juridico/processo - Criar processo manualmente
    async createProcess(req: any, res: any) {
        try {
            const { clienteId, tipoServico, status, etapaAtual, responsavelId } = req.body

            if (!clienteId || !tipoServico) {
                return res.status(400).json({ 
                    message: 'clienteId e tipoServico são obrigatórios' 
                })
            }

            const processo = await JuridicoRepository.createProcess({
                clienteId,
                tipoServico,
                status,
                etapaAtual,
                responsavelId
            })

            return res.status(201).json({
                message: 'Processo criado com sucesso',
                data: processo
            })
        } catch (error: any) {
            console.error('Erro ao criar processo no controller:', error)
            return res.status(500).json({
                message: 'Erro ao criar processo',
                error: error.message
            })
        }
    }
    // POST /juridico/assessoria - Criar assessoria jurídica
    async createAssessoria(req: any, res: any) {
        try {
            const { clienteId, respostas, observacoes, servicoId, subservicoId } = req.body

            // TODO: Pegar do middleware de auth
            const responsavelId = req.userId

            if (!clienteId || !respostas) {
                return res.status(400).json({
                    message: 'clienteId e respostas são obrigatórios'
                })
            }

            // 1. Criar a assessoria
            // servicoId = ID do serviço principal (catalogo_servicos) — respeita a FK
            // subservicoId = ID do subserviço selecionado (subservicos) — usado para requisitos
            const assessoria = await JuridicoRepository.createAssessoria({
                clienteId,
                responsavelId,
                respostas,
                servicoId: servicoId || null,
                observacoes
            })

            // 2. Sincronizar com a tabela processos
            let tipoServico = 'Assessoria Jurídica'
            let servicoRequisitos: any[] = []
            let documentosRequisitados: any[] = []

            try {
                // Buscar requisitos pelo subserviço selecionado, se houver
                const idParaBusca = subservicoId || respostas?.subservico_id
                if (idParaBusca) {
                    const { data: subservicoData } = await supabase
                        .from('subservicos')
                        .select('*, requisitos:servico_requisitos(*)')
                        .eq('id', idParaBusca)
                        .single()

                    if (subservicoData) {
                        if (subservicoData.nome) tipoServico = subservicoData.nome
                        servicoRequisitos = subservicoData.requisitos || []
                    }
                }

                // Fallback: buscar requisitos do serviço principal
                if (servicoRequisitos.length === 0 && servicoId) {
                    const servicoData = await AdmRepository.getServiceById(servicoId)
                    if (servicoData) {
                        if (servicoData.nome) tipoServico = servicoData.nome
                        servicoRequisitos = servicoData.requisitos || []
                    }
                }

                documentosRequisitados = servicoRequisitos.map((r: any) => ({
                    nome: r.nome,
                    etapa: r.etapa,
                    obrigatorio: r.obrigatorio,
                    status: 'pendente',
                    enviado: false
                }))

                // Verifica se já existe um processo para este cliente
                const processoExistente = await JuridicoRepository.getProcessoByClienteId(clienteId)

                if (processoExistente) {
                    const updateParams: any = {
                        tipoServico,
                        assessoriaId: assessoria.id,
                        servicoId: servicoId || null,
                        responsavelId: responsavelId
                    }
                    if (documentosRequisitados.length > 0) {
                        updateParams.documentos = documentosRequisitados
                    }
                    await JuridicoRepository.updateProcess(processoExistente.id, updateParams)
                } else {
                    await JuridicoRepository.createProcess({
                        clienteId,
                        tipoServico,
                        status: 'formularios',
                        etapaAtual: 1,
                        responsavelId: responsavelId,
                        assessoriaId: assessoria.id,
                        servicoId: servicoId || null,
                        documentos: documentosRequisitados
                    })
                }
            } catch (procError) {
                console.error('Erro ao sincronizar processo com assessoria:', procError)
            }

            // 3. Atualizar stage do cliente para 'assessoria_andamento'
            try {
                const { data: clienteAtual } = await supabase
                    .from('clientes')
                    .select('stage')
                    .eq('id', clienteId)
                    .single()

                const stagesAdiante = ['processo_finalizado']
                if (!stagesAdiante.includes(clienteAtual?.stage || '')) {
                    const { error: updateStageError } = await supabase
                        .from('clientes')
                        .update({ stage: 'assessoria_andamento', atualizado_em: new Date().toISOString() })
                        .eq('id', clienteId)

                    if (updateStageError) {
                        console.error('Erro ao atualizar stage do cliente:', updateStageError)
                    }
                }
            } catch (stageError) {
                console.error('Erro ao atualizar stage do cliente:', stageError)
            }

            // 4. Merge DNA: salvar data_chegada e tipo_agendamento no perfil_unificado
            try {
                const dataChegada = respostas?.data_chegada
                const tipoAgendamento = respostas?.tipo_agendamento

                if (dataChegada || tipoAgendamento) {
                    const dnaPayload: Record<string, any> = {}
                    if (dataChegada) dnaPayload.previsao_chegada_data = dataChegada
                    if (tipoAgendamento) dnaPayload.previsao_chegada_tipo = tipoAgendamento // 'data_prevista' | 'data_confirmada'

                    await DNAService.mergeDNA(clienteId, dnaPayload, 'HIGH')
                }

                // Atualizar previsao_chegada na tabela clientes
                if (dataChegada) {
                    await supabase
                        .from('clientes')
                        .update({ previsao_chegada: dataChegada, atualizado_em: new Date().toISOString() })
                        .eq('id', clienteId)
                }
            } catch (dnaError) {
                console.error('Erro ao fazer merge DNA / atualizar previsao_chegada:', dnaError)
            }

            // 5. Criar requerimento com documentos pendentes para o cliente
            try {
                if (servicoRequisitos.length > 0) {
                    const processoAtual = await JuridicoRepository.getProcessoByClienteId(clienteId)

                    const documentosAcoplados = servicoRequisitos.map((r: any) => ({
                        type: r.nome,
                        memberId: clienteId,
                    }))

                    await JuridicoRepository.solicitarRequerimento({
                        clienteId,
                        tipo: `Documentação — ${tipoServico}`,
                        processoId: processoAtual?.id || undefined,
                        criadorId: responsavelId,
                        notificar: true,
                        documentosAcoplados,
                    })
                }
            } catch (reqError) {
                console.error('Erro ao criar requerimento com documentos pendentes:', reqError)
            }

            return res.status(201).json({
                message: 'Assessoria jurídica criada com sucesso e processo sincronizado',
                data: assessoria
            })
        } catch (error: any) {
            console.error('Erro ao criar assessoria juridica no controller:', error.message)
            return res.status(500).json({
                message: error.message || 'Erro ao criar assessoria jurídica',
            })
        }
    }

    // GET /juridico/assessoria/:clienteId - Buscar última assessoria
    async getLatestAssessoria(req: any, res: any) {
        try {
            const { clienteId } = req.params

            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' })
            }

            const assessoria = await JuridicoRepository.getLatestAssessoriaByClienteId(clienteId)

            return res.status(200).json({
                data: assessoria
            })
        } catch (error: any) {
            console.error('Erro ao buscar assessoria no controller:', error)
            return res.status(500).json({
                message: 'Erro ao buscar assessoria',
                error: error.message
            })
        }
    }
    // GET /juridico/processo-cliente/:clienteId - Buscar processo do cliente
    async getProcessoByCliente(req: any, res: any) {
        try {
            const { clienteId } = req.params

            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' })
            }

            const processo = await JuridicoRepository.getProcessoByClienteId(clienteId)

            return res.status(200).json({
                data: processo
            })
        } catch (error: any) {
            console.error('Erro ao buscar processo no controller:', error)
            return res.status(500).json({
                message: 'Erro ao buscar processo',
                error: error.message
            })
        }
    }

    // GET /juridico/processo/:processoId - Buscar processo por ID
    async getProcessoById(req: any, res: any) {
        try {
            const { processoId } = req.params

            if (!processoId) {
                return res.status(400).json({ message: 'processoId é obrigatório' })
            }

            const processo = await JuridicoRepository.getProcessoById(processoId)

            return res.status(200).json({
                data: processo
            })
        } catch (error: any) {
            console.error('Erro ao buscar processo no controller:', error)
            return res.status(500).json({
                message: 'Erro ao buscar processo',
                error: error.message
            })
        }
    }
    // GET /juridico/assessorias/por-responsavel/:responsavelId - Assessorias de um responsável
    async getAssessoriasByResponsavel(req: any, res: any) {
        try {
            const { responsavelId } = req.params

            if (!responsavelId) {
                return res.status(400).json({ message: 'responsavelId é obrigatório' })
            }

            const assessorias = await JuridicoRepository.getAssessoriasByResponsavel(responsavelId)

            return res.status(200).json({
                message: 'Assessorias do responsável recuperadas com sucesso',
                data: assessorias,
                total: assessorias.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar assessorias do responsavel:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar assessorias do responsável', 
                error: error.message 
            })
        }
    }
    // GET /juridico/agendamentos/por-responsavel/:responsavelId - Agendamentos de um responsável
    async getAgendamentosByResponsavel(req: any, res: any) {
        try {
            const { responsavelId } = req.params

            if (!responsavelId) {
                return res.status(400).json({ message: 'responsavelId é obrigatório' })
            }

            const agendamentos = await JuridicoRepository.getAgendamentosPorResponsavel(responsavelId)

            const agendamentosBrt = agendamentos.map((ag: any) => ({
                ...ag,
                data_hora: toBrtFromUtc(ag.data_hora)
            }))

            console.log(`[JuridicoController] Agendamentos para responsavel ${responsavelId}: ${agendamentosBrt.length} encontrados`);

            return res.status(200).json({
                message: 'Agendamentos do responsável recuperados com sucesso',
                data: agendamentosBrt,
                total: agendamentosBrt.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar agendamentos do responsavel:', error)
            return res.status(500).json({
                message: 'Erro ao buscar agendamentos do responsável',
                error: error.message
            })
        }
    }

    // GET /juridico/formulario-preenchido/:clienteId
    async verificarFormularioPreenchido(req: any, res: any) {
        try {
            const { clienteId } = req.params
            if (!clienteId) {
                return res.status(400).json({ message: 'clienteId é obrigatório' })
            }
            const { data, error } = await supabase
                .from('formularios_cliente')
                .select('id')
                .eq('cliente_id', clienteId)
                .not('agendamento_id', 'is', null)
                .limit(1)
            if (error) throw error
            return res.status(200).json({ preenchido: data && data.length > 0 })
        } catch (error: any) {
            console.error('Erro ao verificar formulario preenchido:', error)
            return res.status(500).json({ message: 'Erro ao verificar formulário', error: error.message })
        }
    }

    // POST /juridico/agendamentos/pedido-reagendamento
    async pedidoReagendamento(req: any, res: any) {
        try {
            const { agendamentoId, mensagem } = req.body
            if (!agendamentoId || !mensagem) {
                return res.status(400).json({ message: 'agendamentoId e mensagem são obrigatórios' })
            }
            const agendamento = await ComercialRepository.getAgendamentoById(agendamentoId)
            if (!agendamento) {
                return res.status(404).json({ message: 'Agendamento não encontrado' })
            }
            const { error } = await supabase
                .from('agendamentos')
                .update({
                    pedido_reagendamento: true,
                    mensagem_reagendamento: mensagem,
                    status: 'reagendar'
                })
                .eq('id', agendamentoId)
            if (error) throw error
            if (agendamento.cliente_id) {
                await NotificationService.createNotification({
                    clienteId: agendamento.cliente_id,
                    titulo: 'Pedido de Reagendamento',
                    mensagem: mensagem,
                    tipo: 'agendamento'
                })
            }
            return res.status(200).json({ success: true })
        } catch (error: any) {
            console.error('Erro ao registrar pedido de reagendamento:', error)
            return res.status(500).json({ message: 'Erro ao registrar pedido de reagendamento', error: error.message })
        }
    }

    // GET /juridico/usuarios-comerciais-c2 - Lista usuários comerciais nível C2
    async getUsuariosComerciaisC2(req: any, res: any) {
        try {
            const { data: usuarios, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, nivel, cargo')
                .eq('role', 'comercial')
                .eq('nivel', 'C2')
                .order('full_name', { ascending: true });

            if (error) throw error;

            return res.status(200).json(usuarios || []);
        } catch (error: any) {
            console.error('Erro ao buscar usuários comerciais C2:', error);
            return res.status(500).json({ message: 'Erro ao buscar usuários comerciais C2', error: error.message });
        }
    }

    // POST /juridico/agendamentos/:id/em-andamento
    async marcarConsultoriaEmAndamento(req: any, res: any) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'Agendamento ID e obrigatorio' });
            }

            const { data: agendamento, error: agError } = await supabase
                .from('agendamentos')
                .select('cliente_id')
                .eq('id', id)
                .single();

            if (agError) throw agError;
            if (!agendamento) return res.status(404).json({ message: 'Agendamento nao encontrado' });

            // Atualizar status do agendamento para em_consultoria
            const { error: updateAgError } = await supabase
                .from('agendamentos')
                .update({ status: 'em_consultoria' })
                .eq('id', id);

            if (updateAgError) throw updateAgError;

            if (agendamento.cliente_id) {
                // Atualizar stage do cliente
                const { error: updateClienteError } = await supabase
                    .from('clientes')
                    .update({ stage: 'em_consultoria' })
                    .eq('id', agendamento.cliente_id);

                if (updateClienteError) {
                    console.error('Erro ao atualizar stage do cliente:', updateClienteError);
                }
            }

            return res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Erro ao marcar consultoria em andamento:', error);
            return res.status(500).json({ message: 'Erro ao marcar consultoria em andamento', error: error.message });
        }
    }

    // POST /juridico/agendamentos/:id/assessoria-em-andamento
    async marcarAssessoriaEmAndamento(req: any, res: any) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'Agendamento ID e obrigatorio' });
            }

            const { data: agendamento, error: agError } = await supabase
                .from('agendamentos')
                .select('cliente_id')
                .eq('id', id)
                .single();

            if (agError) throw agError;
            if (!agendamento) return res.status(404).json({ message: 'Agendamento nao encontrado' });

            if (agendamento.cliente_id) {
                // Atualizar stage do cliente — a timeline e controlada por clientes.stage
                const { error: updateClienteError } = await supabase
                    .from('clientes')
                    .update({ stage: 'assessoria_andamento' })
                    .eq('id', agendamento.cliente_id);

                if (updateClienteError) {
                    console.error('Erro ao atualizar stage do cliente:', updateClienteError);
                }
            }

            return res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Erro ao marcar assessoria em andamento:', error);
            return res.status(500).json({ message: 'Erro ao marcar assessoria em andamento', error: error.message });
        }
    }

    // POST /juridico/agendamentos/:id/realizada
    async marcarConsultoriaRealizada(req: any, res: any) {
        try {
            const { id } = req.params;
            const { vendedorId } = req.body;

            if (!id) {
                return res.status(400).json({ message: 'Agendamento ID é obrigatório' });
            }

            // 1. Buscar agendamento antes de atualizar para validar o tipo de servico
            const { data: agendamentoExistente, error: fetchError } = await supabase
                .from('agendamentos')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError || !agendamentoExistente) {
                return res.status(404).json({ message: 'Agendamento não encontrado' });
            }

            const tipoServico = agendamentoExistente.produto_nome || '';
            const isConsultoria = tipoServico.toLowerCase().includes('consultoria');

            if (isConsultoria && !vendedorId) {
                return res.status(400).json({ message: 'Vendedor C2 é obrigatório para marcar a consultoria como realizada' });
            }

            // 2. Marcar o agendamento como 'realizado'
            // NOTA: vendedor_id nao existe como coluna na tabela agendamentos.
            // O vinculo com o vendedor C2 e salvo no perfil_unificado (DNA) do cliente via DNAService.mergeDNA abaixo.
            const updateData: any = { status: 'realizado' };

            console.log('[marcarConsultoriaRealizada] Atualizando agendamento:', id, updateData);
            const { data: agendamento, error: agError } = await supabase
                .from('agendamentos')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (agError) {
                console.error('[marcarConsultoriaRealizada] Erro ao atualizar agendamento:', agError);
                throw agError;
            }
            if (!agendamento) return res.status(404).json({ message: 'Agendamento não encontrado' });

            const clienteId = agendamento.cliente_id;
            console.log('[marcarConsultoriaRealizada] clienteId:', clienteId);

            if (clienteId) {
                // 2. Buscar nome do vendedor C2 se fornecido
                let vendedorNome: string | null = null;
                if (vendedorId) {
                    const { data: vendedor } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', vendedorId)
                        .single();
                    vendedorNome = vendedor?.full_name || null;
                }

                // 3. Buscar um processo ativo para mudar para Pós Consultoria (clientes_c2)
                console.log('[marcarConsultoriaRealizada] Buscando processo para clienteId:', clienteId);
                const { data: processo, error: processoFetchError } = await supabase
                    .from('processos')
                    .select('id, status, tipo_servico')
                    .eq('cliente_id', clienteId)
                    .order('criado_em', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (processoFetchError) {
                    console.warn('[marcarConsultoriaRealizada] Erro ao buscar processo (nao critico):', processoFetchError);
                }

                if (processo) {
                    const processoUpdateData: any = { status: 'assessoria_iniciada' };
                    if (!processo.tipo_servico) {
                        processoUpdateData.tipo_servico = tipoServico;
                    }
                    if (vendedorId) {
                        processoUpdateData.responsavel_id = vendedorId;
                    }
                    console.log('[marcarConsultoriaRealizada] Atualizando processo:', processo.id, processoUpdateData);
                    await supabase.from('processos').update(processoUpdateData).eq('id', processo.id);
                }

                // Sempre atualizar stage do cliente para clientes_c2
                console.log('[marcarConsultoriaRealizada] Atualizando stage do cliente:', clienteId);
                const { error: stageError } = await supabase
                    .from('clientes')
                    .update({ stage: 'clientes_c2' })
                    .eq('id', clienteId);

                if (stageError) {
                    console.error('[marcarConsultoriaRealizada] Erro ao atualizar stage:', stageError);
                }

                // 4. Salvar vendedor C2 no perfil_unificado via DNAService
                if (vendedorId) {
                    const dnaPayload: Record<string, any> = { vendedor_c2_id: vendedorId };
                    if (vendedorNome) dnaPayload.vendedor_c2_nome = vendedorNome;
                    console.log('[marcarConsultoriaRealizada] Salvando DNA do vendedor C2');
                    await DNAService.mergeDNA(clienteId, dnaPayload, 'HIGH');
                }

                console.log('[marcarConsultoriaRealizada] Criando notificacao...');
                try {
                    await NotificationService.createNotification({
                        clienteId: clienteId,
                        titulo: 'Consultoria Realizada',
                        mensagem: 'A consultoria foi finalizada pelo Jurídico. Cliente agora em Pós Consultoria.',
                        tipo: 'success'
                    });
                } catch (notifError: any) {
                    console.error('[marcarConsultoriaRealizada] Erro ao criar notificacao (nao critico):', notifError?.message || notifError);
                }
            }

            return res.status(200).json({ success: true, message: 'Consultoria finalizada com sucesso.' });
        } catch (error: any) {
            console.error('Erro ao marcar consultoria realizada:', error);
            return res.status(500).json({ message: 'Erro ao marcar consultoria realizada', error: error.message });
        }
    }
    // POST /juridico/agendamentos/:id/assessoria-realizada
    async marcarAssessoriaRealizada(req: any, res: any) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: 'Agendamento ID e obrigatorio' });
            }

            const { data: agendamento, error: agError } = await supabase
                .from('agendamentos')
                .select('cliente_id, status')
                .eq('id', id)
                .single();

            if (agError) throw agError;
            if (!agendamento) return res.status(404).json({ message: 'Agendamento nao encontrado' });

            // Atualizar status do agendamento para realizado
            const { error: updateAgError } = await supabase
                .from('agendamentos')
                .update({ status: 'realizado' })
                .eq('id', id);

            if (updateAgError) throw updateAgError;

            if (agendamento.cliente_id) {
                // Atualizar stage do cliente para assessoria_finalizada
                const { error: updateClienteError } = await supabase
                    .from('clientes')
                    .update({ stage: 'processo_finalizado', status: 'processo_finalizado' })
                    .eq('id', agendamento.cliente_id);

                if (updateClienteError) {
                    console.error('Erro ao atualizar stage do cliente:', updateClienteError);
                }

                try {
                    await NotificationService.createNotification({
                        clienteId: agendamento.cliente_id,
                        titulo: 'Assessoria Finalizada',
                        mensagem: 'Sua assessoria juridica foi finalizada. Proximo passo: documentacao e protocolo.',
                        tipo: 'success'
                    });
                } catch (notifError: any) {
                    console.error('[marcarAssessoriaRealizada] Erro ao criar notificacao:', notifError?.message || notifError);
                }
            }

            return res.status(200).json({ success: true, message: 'Assessoria finalizada com sucesso.' });
        } catch (error: any) {
            console.error('Erro ao marcar assessoria realizada:', error);
            return res.status(500).json({ message: 'Erro ao marcar assessoria realizada', error: error.message });
        }
    }

    // =============================================
    // VALIDACAO DE CONTRATOS
    // =============================================

    // POST /juridico/contratos/:id/invalidar
    async invalidarContrato(req: any, res: any) {
        try {
            const { id } = req.params
            const { justificativa } = req.body
            const invalidadoPor = req.userId

            if (!justificativa) {
                return res.status(400).json({ message: 'Justificativa e obrigatoria' })
            }

            // Buscar contrato
            const { data: contrato, error: fetchError } = await supabase
                .from('contratos_servicos')
                .select('id, cliente_id, usuario_id')
                .eq('id', id)
                .single()

            if (fetchError || !contrato) {
                return res.status(404).json({ message: 'Contrato nao encontrado' })
            }

            // Atualizar status do contrato
            const { data: updated, error: updateError } = await supabase
                .from('contratos_servicos')
                .update({
                    status_contrato: 'INVALIDO',
                    justificativa_invalidacao: justificativa,
                    invalidado_por: invalidadoPor,
                    invalidado_em: new Date().toISOString(),
                    atualizado_em: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single()

            if (updateError) {
                console.error('[JuridicoController] Erro ao invalidar contrato:', updateError)
                return res.status(500).json({ message: 'Erro ao invalidar contrato' })
            }

            // Notificar o C2 responsavel
            if (contrato.usuario_id) {
                // Buscar profile do C2 para pegar o cliente_id associado
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .eq('id', contrato.usuario_id)
                    .single()

                // Criar notificacao para o usuario responsavel pelo contrato
                // Usamos o usuario_id como "clienteId" no sistema de notificacoes interno
                await NotificationService.createNotification({
                    clienteId: contrato.usuario_id,
                    criadorId: invalidadoPor,
                    titulo: 'Contrato Invalidado pelo Juridico',
                    mensagem: `O contrato #${id.substring(0, 8)} foi marcado como invalido. Justificativa: ${justificativa}`,
                    tipo: 'warning'
                })
            }

            return res.status(200).json({
                message: 'Contrato invalidado com sucesso',
                data: updated
            })
        } catch (error: any) {
            console.error('[JuridicoController] Erro ao invalidar contrato:', error)
            return res.status(500).json({ message: 'Erro ao invalidar contrato', error: error.message })
        }
    }

    // =============================================
    // PROTOCOLAÇÃO DE PROCESSOS
    // =============================================

    // GET /juridico/supervisores - Lista supervisores do jurídico
    async getSupervisores(req: any, res: any) {
        try {
            const supervisores = await JuridicoRepository.getSupervisores()

            return res.status(200).json({
                message: 'Supervisores do juridico recuperados com sucesso',
                data: supervisores
            })
        } catch (error: any) {
            console.error('Erro ao buscar supervisores do juridico:', error)
            return res.status(500).json({
                message: 'Erro ao buscar supervisores do juridico',
                error: error.message
            })
        }
    }

    // GET /juridico/processos-protocolados - Lista processos protocolados
    async getProcessosProtocolados(req: any, res: any) {
        try {
            const processos = await JuridicoRepository.getProcessosProtocolados()

            return res.status(200).json({
                message: 'Processos protocolados recuperados com sucesso',
                data: processos,
                total: processos.length
            })
        } catch (error: any) {
            console.error('Erro ao buscar processos protocolados:', error)
            return res.status(500).json({
                message: 'Erro ao buscar processos protocolados',
                error: error.message
            })
        }
    }

    // GET /juridico/processo/:id/protocolado - Detalhes de um processo protocolado
    async getProcessoProtocoladoDetails(req: any, res: any) {
        try {
            const { id } = req.params

            if (!id) {
                return res.status(400).json({ message: 'id e obrigatorio' })
            }

            const processo = await JuridicoRepository.getProcessoProtocoladoDetails(id)

            if (!processo) {
                return res.status(404).json({ message: 'Processo nao encontrado' })
            }

            return res.status(200).json({
                message: 'Detalhes do processo protocolado recuperados com sucesso',
                data: processo
            })
        } catch (error: any) {
            console.error('Erro ao buscar detalhes do processo protocolado:', error)
            return res.status(500).json({
                message: 'Erro ao buscar detalhes do processo protocolado',
                error: error.message
            })
        }
    }

    // POST /juridico/processo/:id/enviar-protocolacao - Enviar processo para protocolação
    async enviarParaProtocolacao(req: any, res: any) {
        try {
            const { id } = req.params
            const { supervisorId } = req.body

            if (!id) {
                return res.status(400).json({ message: 'id e obrigatorio' })
            }

            if (!supervisorId) {
                return res.status(400).json({ message: 'supervisorId e obrigatorio' })
            }

            // Verificar se o supervisor existe e é do jurídico
            const supervisor = await JuridicoRepository.getFuncionarioById(supervisorId)
            if (!supervisor) {
                return res.status(400).json({
                    message: 'supervisorId invalido - funcionario nao encontrado'
                })
            }

            const processo = await JuridicoRepository.enviarParaProtocolacao(id, supervisorId)

            return res.status(200).json({
                message: 'Processo enviado para protocolacao com sucesso',
                data: processo
            })
        } catch (error: any) {
            console.error('Erro ao enviar processo para protocolacao:', error)
            
            // Logar detalhes adicionais do supabase se existirem
            if (error.details) console.error('Details:', error.details)
            if (error.hint) console.error('Hint:', error.hint)
            if (error.code) console.error('Code:', error.code)
            
            return res.status(500).json({
                message: error.message || 'Erro ao enviar processo para protocolacao',
                error: error.message,
                details: error.details
            })
        }
    }

    // PUT /juridico/processo/:id/atualizar-protocolo - Atualizar detalhes da protocolação
    async atualizarProtocolo(req: any, res: any) {
        try {
            const { id } = req.params
            const updates = req.body

            if (!id) {
                return res.status(400).json({ message: 'id e obrigatorio' })
            }

            const processo = await JuridicoRepository.atualizarProtocolo(id, updates)

            return res.status(200).json({
                message: 'Protocolo atualizado com sucesso',
                data: processo
            })
        } catch (error: any) {
            console.error('Erro ao atualizar protocolo:', error)
            return res.status(500).json({
                message: 'Erro ao atualizar protocolo',
                error: error.message
            })
        }
    }

    // POST /juridico/cliente/:clienteId/finalizar-assessoria
    async finalizarAssessoriaByCliente(req: any, res: any) {
        try {
            const { clienteId } = req.params;

            if (!clienteId) {
                return res.status(400).json({ message: 'Cliente ID é obrigatório' });
            }

            // 1. Atualizar stage do cliente para assessoria_finalizada
            const { error: updateClienteError } = await supabase
                .from('clientes')
                .update({ 
                    stage: 'processo_finalizado', 
                    status: 'processo_finalizado',
                    atualizado_em: new Date().toISOString()
                })
                .eq('id', clienteId);

            if (updateClienteError) {
                console.error('[finalizarAssessoriaByCliente] Erro ao atualizar stage:', updateClienteError);
                throw updateClienteError;
            }

            // 2. Tentar encontrar e finalizar agendamentos em aberto para este cliente
            await supabase
                .from('agendamentos')
                .update({ status: 'realizado' })
                .eq('cliente_id', clienteId)
                .in('status', ['confirmado', 'agendado', 'em_consultoria']);

            // 3. Notificar o cliente
            try {
                await NotificationService.createNotification({
                    clienteId: clienteId,
                    titulo: 'Assessoria Técnica Concluída',
                    mensagem: 'Todos os seus documentos foram analisados e aprovados pelo Jurídico. Sua assessoria técnica foi finalizada com sucesso.',
                    tipo: 'success'
                });
            } catch (notifError) {
                console.error('[finalizarAssessoriaByCliente] Erro ao notificar:', notifError);
            }

            return res.status(200).json({ 
                success: true, 
                message: 'Assessoria finalizada e cliente atualizado.' 
            });
        } catch (error: any) {
            console.error('Erro ao finalizar assessoria por cliente:', error);
            return res.status(500).json({ message: 'Erro ao finalizar assessoria', error: error.message });
        }
    }
}

export default new JuridicoController()
