import JuridicoRepository from '../repositories/JuridicoRepository'

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
            console.error('Erro ao buscar funcionários do jurídico:', error)
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
            console.error('Erro ao buscar funcionário:', error)
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
            console.error('Erro ao buscar processos sem responsável:', error)
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
            console.error('Erro ao buscar processos do responsável:', error)
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
            console.error('Erro ao atribuir responsável jurídico:', error)
            return res.status(500).json({ 
                message: 'Erro ao atribuir responsável jurídico', 
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
            console.error('Erro ao buscar clientes sem responsável:', error)
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
            console.error('Erro ao buscar clientes do responsável:', error)
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
            console.error('Erro ao buscar estatísticas:', error)
            return res.status(500).json({ 
                message: 'Erro ao buscar estatísticas', 
                error: error.message 
            })
        }
    }

    // =============================================
    // FORMULÁRIOS DO JURÍDICO (enviados para clientes)
    // =============================================

    // Mocked funcionario juridico ID (will be replaced by auth middleware later)
    private MOCKED_FUNCIONARIO_JURIDICO_ID = 'befc50e4-3191-449e-9691-83d4e55dceb2'

    // POST /juridico/formularios - Upload document from juridico to client
    async uploadFormularioJuridico(req: any, res: any) {
        try {
            const { clienteId, memberId, processoId } = req.body
            const file = req.file

            // TODO: Get from auth middleware when implemented
            const funcionarioJuridicoId = req.body.funcionarioJuridicoId || this.MOCKED_FUNCIONARIO_JURIDICO_ID

            console.log('========== UPLOAD FORMULARIO JURIDICO DEBUG ==========')
            console.log('funcionarioJuridicoId:', funcionarioJuridicoId)
            console.log('clienteId:', clienteId)
            console.log('memberId:', memberId)
            console.log('processoId:', processoId)
            console.log('file:', file ? { originalname: file.originalname, size: file.size } : 'undefined')
            console.log('======================================================')

            if (!file) {
                return res.status(400).json({ message: 'Nenhum arquivo enviado' })
            }

            if (!clienteId) {
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
            })
        } catch (error: any) {
            console.error('Erro ao upload de formulário jurídico:', error)
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
            console.error('Erro ao buscar formulários jurídico:', error)
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
            console.error('Erro ao deletar formulário jurídico:', error)
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
            console.error('Erro ao buscar formulários com status:', error)
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

            return res.status(200).json({
                message: status === 'aprovado' 
                    ? 'Formulário aprovado com sucesso' 
                    : status === 'rejeitado' 
                    ? 'Formulário rejeitado com sucesso' 
                    : 'Status do formulário atualizado com sucesso',
                data: formulario
            })
        } catch (error: any) {
            console.error('Erro ao atualizar status do formulário cliente:', error)
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
            const { clienteId, processoId, etapa, texto } = req.body
            
            // TODO: Pegar do middleware de auth
            const autorId = req.body.autorId || this.MOCKED_FUNCIONARIO_JURIDICO_ID

            console.log('========== JURIDICO CREATE NOTE DEBUG ==========')
            console.log('clienteId:', clienteId)
            console.log('processoId:', processoId)
            console.log('etapa:', etapa)
            console.log('autorId:', autorId)
            console.log('texto:', texto ? (texto.substring(0, 20) + '...') : 'undefined')
            console.log('================================================')

            if (!clienteId || !texto) {
                console.warn('[JuridicoController] clienteId ou texto faltando')
                return res.status(400).json({ message: 'clienteId e texto são obrigatórios' })
            }

            const nota = await JuridicoRepository.createNote({
                clienteId,
                processoId,
                etapa,
                autorId,
                texto
            })

            console.log('[JuridicoController] Nota criada com sucesso no DB')

            return res.status(201).json({
                message: 'Nota jurídica criada com sucesso',
                data: nota
            })
        } catch (error: any) {
            console.error('[JuridicoController] Erro fatal ao criar nota jurídica:', error)
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

            const notas = await JuridicoRepository.getNotesByClienteId(clienteId)

            return res.status(200).json({
                message: 'Notas jurídicas recuperadas com sucesso',
                data: notas
            })
        } catch (error: any) {
            console.error('Erro ao buscar notas jurídicas:', error)
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

            if (!noteId) {
                return res.status(400).json({ message: 'noteId é obrigatório' })
            }

            await JuridicoRepository.deleteNote(noteId)

            return res.status(200).json({
                message: 'Nota jurídica deletada com sucesso'
            })
        } catch (error: any) {
            console.error('Erro ao deletar nota jurídica:', error)
            return res.status(500).json({
                message: 'Erro ao deletar nota jurídica',
                error: error.message
            })
        }
    }

    // POST /juridico/documentos/solicitar - Solicitar documento
    async solicitarDocumento(req: any, res: any) {
        try {
            const { clienteId, tipo, processoId, membroId, requerimentoId, notificar, prazo } = req.body

            if (!clienteId || !tipo) {
                return res.status(400).json({ 
                    message: 'clienteId e tipo são obrigatórios' 
                })
            }

            // TODO: Pegar do middleware de auth
            const criadorId = req.body.criadorId || this.MOCKED_FUNCIONARIO_JURIDICO_ID

            const documento = await JuridicoRepository.solicitarDocumento({
                clienteId,
                tipo,
                processoId,
                membroId,
                requerimentoId,
                notificar,
                prazo,
                criadorId
            })

            return res.status(201).json({
                message: 'Solicitação de documento criada com sucesso',
                data: documento
            })
        } catch (error: any) {
            console.error('Erro ao solicitar documento no controller:', error)
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

            if (!clienteId || !tipo) {
                return res.status(400).json({ 
                    message: 'clienteId e tipo são obrigatórios' 
                })
            }

            // TODO: Pegar do middleware de auth
            const criadorId = req.body.criadorId || this.MOCKED_FUNCIONARIO_JURIDICO_ID

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

            return res.status(201).json({
                message: 'Solicitação de requerimento criada com sucesso',
                data: requerimento
            })
        } catch (error: any) {
            console.error('Erro ao solicitar requerimento no controller:', error)
            return res.status(500).json({
                message: 'Erro ao solicitar requerimento',
                error: error.message
            })
        }
    }

    // PATCH /juridico/processo/:processoId/etapa - Atualizar etapa do processo
    async updateEtapaProcesso(req: any, res: any) {
        try {
            const { processoId } = req.params
            const { etapa } = req.body

            if (!processoId) {
                return res.status(400).json({ message: 'processoId é obrigatório' })
            }

            if (etapa === undefined || isNaN(parseInt(etapa))) {
                return res.status(400).json({ message: 'etapa válida é obrigatória' })
            }

            const processo = await JuridicoRepository.updateEtapaProcesso(processoId, parseInt(etapa))

            return res.status(200).json({
                message: 'Etapa do processo atualizada com sucesso',
                data: processo
            })
        } catch (error: any) {
            console.error('Erro ao atualizar etapa do processo:', error)
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
            const { clienteId, respostas, observacoes, servicoId } = req.body
            
            // TODO: Pegar do middleware de auth
            const responsavelId = req.body.responsavelId || this.MOCKED_FUNCIONARIO_JURIDICO_ID

            if (!clienteId || !respostas) {
                return res.status(400).json({ 
                    message: 'clienteId e respostas são obrigatórios' 
                })
            }

            const assessoria = await JuridicoRepository.createAssessoria({
                clienteId,
                responsavelId,
                respostas,
                servicoId,
                observacoes
            })

            return res.status(201).json({
                message: 'Assessoria jurídica criada com sucesso',
                data: assessoria
            })
        } catch (error: any) {
            console.error('Erro ao criar assessoria jurídica no controller:', error)
            return res.status(500).json({
                message: 'Erro ao criar assessoria jurídica',
                error: error.message
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
}

export default new JuridicoController()
