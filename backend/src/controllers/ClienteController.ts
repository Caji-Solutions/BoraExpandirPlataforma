import type { ClienteDTO } from '../types/parceiro';
import ClienteRepository from '../repositories/ClienteRepository';
import JuridicoRepository from '../repositories/JuridicoRepository';
import NotificationService from '../services/NotificationService';
import { getDocumentosPorTipoServico, DocumentoRequeridoConfig } from '../config/documentosConfig';

// Interface para o documento requerido com informações do processo
interface DocumentoRequeridoComProcesso extends DocumentoRequeridoConfig {
  processoId: string;
  processoTipo: string;
  processoStatus: string;
  processoEtapa: number;
}

class ClienteController {
  // GET /cliente/:clienteId/documentos-requeridos
  // Retorna os documentos necessários baseado nos processos do cliente
  async getDocumentosRequeridos(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      // Buscar os processos do cliente
      const processos = await ClienteRepository.getProcessosByClienteId(clienteId)

      if (!processos || processos.length === 0) {
        return res.status(200).json({
          message: 'Cliente não possui processos ativos',
          data: [],
          processos: []
        })
      }

      // Para cada processo, buscar os documentos requeridos baseado no tipo_servico
      const documentosRequeridos: DocumentoRequeridoComProcesso[] = []

      for (const processo of processos) {
        const docsDoServico = getDocumentosPorTipoServico(processo.tipo_servico)

        // Adicionar cada documento com as informações do processo
        for (const doc of docsDoServico) {
          documentosRequeridos.push({
            ...doc,
            processoId: processo.id,
            processoTipo: processo.tipo_servico,
            processoStatus: processo.status,
            processoEtapa: processo.etapa_atual
          })
        }
      }

      return res.status(200).json({
        message: 'Documentos requeridos recuperados com sucesso',
        data: documentosRequeridos,
        processos: processos.map(p => ({
          id: p.id,
          tipoServico: p.tipo_servico,
          status: p.status,
          etapaAtual: p.etapa_atual
        })),
        totalDocumentos: documentosRequeridos.length
      })
    } catch (error: any) {
      console.error('Erro ao buscar documentos requeridos:', error)
      return res.status(500).json({
        message: 'Erro ao buscar documentos requeridos',
        error: error.message
      })
    }
  }

  // GET /cliente/by-parceiro/:parceiroId
  async getByParceiro(req: any, res: any) {
    try {
      const { parceiroId } = req.params
      if (!parceiroId) {
        return res.status(400).json({ message: 'Parâmetro parceiroId é obrigatório' })
      }
      const data = await ClienteRepository.getClientByParceiroId(parceiroId)

      return res.status(200).json(data ?? [])
    } catch (err: any) {
      console.error('Erro inesperado ao consultar clientes:', err)
      return res.status(500).json({ message: 'Erro inesperado ao consultar clientes', error: err.message })
    }
  }

  // GET /cliente/:clienteId/dependentes
  async getDependentes(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      console.log('Controller: Recebendo request getDependentes para:', clienteId)
      const dependentes = await ClienteRepository.getDependentesByClienteId(clienteId)

      return res.status(200).json({
        message: 'Dependentes recuperados com sucesso',
        data: dependentes
      })
    } catch (error: any) {
      console.error('Erro ao buscar dependentes:', error)
      return res.status(500).json({
        message: 'Erro ao buscar dependentes',
        error: error.message
      })
    }
  }

  // GET /cliente/:clienteId/processos
  async getProcessos(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      const processos = await ClienteRepository.getProcessosByClienteId(clienteId)

      return res.status(200).json({
        message: 'Processos recuperados com sucesso',
        data: processos
      })
    } catch (error: any) {
      console.error('Erro ao buscar processos:', error)
      return res.status(500).json({
        message: 'Erro ao buscar processos',
        error: error.message
      })
    }
  }

  // GET /cliente/:clienteId
  async getCliente(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      const cliente = await ClienteRepository.getClienteById(clienteId)

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

  async register(req: any, res: any) {
    try {
      const { nome, email, whatsapp, parceiro_id, status, documento, endereco } = req.body

      if (!nome || !email || !whatsapp) {
        return res.status(400).json({ message: 'Nome, email e WhatsApp são obrigatórios' })
      }

      // 1. Gerar senha temporária
      const tempPassword = Math.random().toString(36).substring(2, 10)

      // 2. Criar usuário no Auth do Supabase (utilizando admin para bypassar confirmação)
      const { data: authData, error: authError } = await (await import('../config/SupabaseClient')).supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: nome,
          role: 'cliente',
          temp_password: tempPassword
        }
      })

      if (authError) {
        console.error('Erro ao criar auth user para cliente:', authError.message)
        if (authError.message.includes('already')) {
          return res.status(409).json({ message: 'Já existe um usuário com este e-mail' })
        }
        return res.status(400).json({ message: authError.message })
      }

      const usuarioId = authData.user.id

      // 3. Criar profile na tabela profiles (usando documento como cpf)
      const { error: profileError } = await (await import('../config/SupabaseClient')).supabase
        .from('profiles')
        .upsert({
          id: usuarioId,
          full_name: nome,
          email,
          role: 'cliente',
          telefone: whatsapp || req.body.telefone,
          cpf: documento || null // Mapeia documento para CPF no profile
        })

      if (profileError) {
        console.error('Erro ao criar profile para cliente:', profileError.message)
        // Cleanup: deletar auth user se falhar o profile
        await (await import('../config/SupabaseClient')).supabase.auth.admin.deleteUser(usuarioId)
        return res.status(500).json({ message: 'Erro ao criar perfil de acesso' })
      }

      // 4. Registrar na tabela clientes
      const clienteData: any = { 
        nome, 
        email, 
        whatsapp, 
        parceiro_id: parceiro_id || null, 
        status: status || 'cadastrado'
      }
      
      const createdData = await ClienteRepository.register(clienteData)

      return res.status(201).json({
        ...createdData,
        loginInfo: {
          email,
          password: tempPassword
        }
      })
    } catch (error: any) {
      console.error('Erro no registro de cliente:', error)
      return res.status(500).json({ message: 'Erro interno ao registrar cliente', error: error.message })
    }
  }
  async AttStatusClientebyWpp(req: any, res: any) {
    try {
      const { wppNumber, status } = req.body
      const cliente = await ClienteRepository.getClienteByWppNumber(wppNumber)


      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' })
      }

      const updatedData = await ClienteRepository.attStatusById(cliente.id, status)


      return res.status(200).json(updatedData)
    } catch (error) {
      throw error
    }
  }

  async uploadDoc(req: any, res: any) {
    try {
      const { clienteId, documentType, processoId, documentoId } = req.body
      const file = req.file

      // Logs de debug
      console.log('========== UPLOAD DOC DEBUG ==========')
      console.log('req.body:', req.body)
      console.log('clienteId:', clienteId)
      console.log('processoId:', processoId)
      console.log('documentoId:', documentoId)
      console.log('memberId:', req.body.memberId)
      console.log('documentType:', documentType)
      console.log('file:', file ? {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      } : 'undefined')
      console.log('=======================================')

      if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' })
      }

      if (!clienteId && !documentoId) {
        return res.status(400).json({ message: 'clienteId ou documentoId é obrigatório' })
      }

      if (!documentType && !documentoId) {
        return res.status(400).json({ message: 'documentType é obrigatório para novos documentos' })
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const memberId = req.body.memberId
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `${documentType || 'doc'}_${timestamp}.${fileExtension}`

      // Construir o caminho do arquivo
      let filePath = ''
      if (processoId) {
        filePath += `${processoId}/`
      } else {
        filePath += `sem_processo/`
      }

      const targetId = memberId || clienteId || 'desconhecido'
      filePath += `${targetId}`
      filePath += `/${documentType || 'upgrade'}/${fileName}`

      console.log('FilePath gerado:', filePath)

      // Upload para o Supabase Storage via Repository
      const uploadResult = await ClienteRepository.uploadDocument({
        filePath,
        fileBuffer: file.buffer,
        contentType: file.mimetype
      })
      console.log('Upload result:', uploadResult)

      let documentoRecord;

      if (documentoId) {
        // Lógica de upgrade: Se já existe um documento, vamos determinar o novo status
        // Se o status era WAITING_APOSTILLE, muda para ANALYZING_APOSTILLE
        // Se era WAITING_TRANSLATION, muda para ANALYZING_TRANSLATION
        // Caso contrário, assume ANALYZING

        // Para simplificar, poderíamos buscar o documento antes, mas vamos usar uma lógica baseada em flags ou status esperado
        // Por enquanto, vamos inferir do status atual no banco ou via parâmetro extra.
        // Como o Repository.updateDocumentoStatus já lida com status, vamos apenas atualizar o arquivo aqui.

        // Buscar status atual para decidir o próximo
        const docs = await ClienteRepository.getDocumentosByClienteId(clienteId);
        const docAtual = docs.find(d => d.id === documentoId);

        let novoStatus: 'ANALYZING' | 'ANALYZING_APOSTILLE' | 'ANALYZING_TRANSLATION' = 'ANALYZING';
        if (docAtual?.status === 'WAITING_APOSTILLE') {
          novoStatus = 'ANALYZING_APOSTILLE';
        } else if (docAtual?.status === 'WAITING_TRANSLATION') {
          novoStatus = 'ANALYZING_TRANSLATION';
        }

        documentoRecord = await ClienteRepository.updateDocumentoFile(documentoId, {
          nomeOriginal: file.originalname,
          nomeArquivo: fileName,
          storagePath: filePath,
          publicUrl: uploadResult.publicUrl,
          contentType: file.mimetype,
          tamanho: file.size,
          status: novoStatus
        });
      } else {
        // Criar novo registro
        documentoRecord = await ClienteRepository.createDocumento({
          clienteId,
          processoId: processoId || undefined,
          tipo: documentType,
          nomeOriginal: file.originalname,
          nomeArquivo: fileName,
          storagePath: filePath,
          publicUrl: uploadResult.publicUrl,
          contentType: file.mimetype,
          tamanho: file.size,
          status: 'ANALYZING',
          dependenteId: (memberId && memberId !== clienteId) ? memberId : undefined
        })
      }

      console.log('Documento processado no banco:', documentoRecord.id)

      return res.status(200).json({
        message: documentoId ? 'Documento atualizado com sucesso' : 'Documento enviado com sucesso',
        data: {
          id: documentoRecord.id,
          ...uploadResult,
          fileName: file.originalname,
          documentType: documentoRecord.tipo,
          clienteId: documentoRecord.cliente_id,
          processoId: documentoRecord.processo_id,
          status: documentoRecord.status
        }
      })
    } catch (error: any) {
      console.error('Erro inesperado no upload:', error)
      return res.status(500).json({
        message: 'Erro ao fazer upload do documento',
        error: error.message
      })
    }
  }

  // GET /cliente/:clienteId/documentos
  async getDocumentos(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      const documentos = await ClienteRepository.getDocumentosByClienteId(clienteId)

      return res.status(200).json({
        message: 'Documentos recuperados com sucesso',
        data: documentos
      })
    } catch (error: any) {
      console.error('Erro ao buscar documentos:', error)
      return res.status(500).json({
        message: 'Erro ao buscar documentos',
        error: error.message
      })
    }
  }

  // GET /cliente/processo/:processoId/documentos
  async getDocumentosByProcesso(req: any, res: any) {
    try {
      const { processoId } = req.params

      if (!processoId) {
        return res.status(400).json({ message: 'processoId é obrigatório' })
      }

      const documentos = await ClienteRepository.getDocumentosByProcessoId(processoId)

      return res.status(200).json({
        message: 'Documentos do processo recuperados com sucesso',
        data: documentos,
        total: documentos.length
      })
    } catch (error: any) {
      console.error('Erro ao buscar documentos do processo:', error)
      return res.status(500).json({
        message: 'Erro ao buscar documentos do processo',
        error: error.message
      })
    }
  }

  // DELETE /cliente/documento/:documentoId
  async deleteDocumento(req: any, res: any) {
    try {
      const { documentoId } = req.params

      if (!documentoId) {
        return res.status(400).json({ message: 'documentoId é obrigatório' })
      }

      await ClienteRepository.deleteDocumento(documentoId)

      return res.status(200).json({
        message: 'Documento deletado com sucesso'
      })
    } catch (error: any) {
      console.error('Erro ao deletar documento:', error)
      return res.status(500).json({
        message: 'Erro ao deletar documento',
        error: error.message
      })
    }
  }

  // PATCH /cliente/documento/:documentoId/status
  async updateDocumentoStatus(req: any, res: any) {
    console.log('============= DEBUG STATUS UPDATE =============');
    console.log('Documento ID:', req.params.documentoId);
    console.log('Body recebido:', req.body);
    
    try {
      const { documentoId } = req.params
      const { status, motivoRejeicao, analisadoPor } = req.body

      if (!documentoId) {
        return res.status(400).json({ message: 'documentoId é obrigatório' })
      }

      const validStatuses = [
        'PENDING', 'ANALYZING', 'WAITING_APOSTILLE', 'ANALYZING_APOSTILLE',
        'WAITING_TRANSLATION', 'ANALYZING_TRANSLATION', 'WAITING_TRANSLATION_QUOTE', 
        'WAITING_ADM_APPROVAL', 'WAITING_QUOTE_APPROVAL', 'APPROVED', 'REJECTED',
        'solicitado', 'em_analise', 'disponivel'
      ];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Status inválido' })
      }

      // Lógica de side-effects (atualizar flags booleanas baseado na etapa)
      let apostilado: boolean | undefined = undefined;
      let traduzido: boolean | undefined = undefined;

      // Se passou da análise inicial e foi para apostilamento, nada muda (já é false por padrão)

      // Se passou da análise do apostilamento e foi para tradução
      if (['WAITING_TRANSLATION', 'ANALYZING_TRANSLATION'].includes(status)) {
        apostilado = true;
      }
      // Se foi aprovado totalmente
      else if (status === 'APPROVED') {
        apostilado = true;
        traduzido = true;
      }

      const { solicitado_pelo_juridico, prazo } = req.body;

      console.log('Enviando para o repositório...', {
        documentoId, status, solicitado_pelo_juridico
      });

      const documento = await ClienteRepository.updateDocumentoStatus(
        documentoId,
        status,
        motivoRejeicao,
        analisadoPor,
        apostilado,
        traduzido,
        solicitado_pelo_juridico
      )

      console.log('Documento atualizado no repositório com sucesso.');

      // Criar notificação se o status exigir ação do cliente ou se foi solicitado pelo jurídico
      try {
        const canNotify = status === 'REJECTED' || status === 'WAITING_APOSTILLE' || status === 'WAITING_TRANSLATION' || solicitado_pelo_juridico;
        console.log('Pode notificar?', canNotify, { status, solicitado_pelo_juridico });
        
        if (canNotify) {
          let titulo = '';
          let mensagem = '';
          let tipo: 'info' | 'success' | 'warning' | 'error' = 'info';

          if (status === 'REJECTED') {
            titulo = `Documento Rejeitado: ${documento.tipo}`;
            mensagem = `O documento "${documento.tipo}" foi rejeitado. Motivo: ${motivoRejeicao || 'Não especificado'}. Por favor, envie uma nova versão.`;
            tipo = 'error';
          } else if (status === 'WAITING_APOSTILLE' || (solicitado_pelo_juridico && status.includes('APOSTILLE'))) {
            titulo = 'Apostilamento Necessário';
            mensagem = `O documento "${documento.tipo}" foi analisado e agora precisa ser apostilado. Por favor, providencie o apostilamento.`;
            tipo = 'warning';
          } else if (status === 'WAITING_TRANSLATION' || (solicitado_pelo_juridico && status.includes('TRANSLATION'))) {
            titulo = 'Tradução Necessária';
            mensagem = `O documento "${documento.tipo}" foi analisado e agora precisa ser traduzido. Por favor, providencie a tradução.`;
            tipo = 'warning';
          }

          if (titulo && mensagem) {
            await NotificationService.createNotification({
              clienteId: documento.cliente_id,
              criadorId: analisadoPor,
              titulo,
              mensagem,
              tipo,
              prazo: Number(prazo) || 15
            });
            console.log(`Notificação "${titulo}" enviada com sucesso para o cliente ${documento.cliente_id} (Prazo: ${prazo || 15} dias)`);
          }
        }
      } catch (notifyError) {
        console.error('Erro ao enviar notificação de status:', notifyError);
      }

      console.log('Finalizando resposta de sucesso.');
      return res.status(200).json({
        message: 'Status do documento atualizado com sucesso',
        data: documento
      })
    } catch (error: any) {
      console.error('ERRO NO updateDocumentoStatus:', error)
      return res.status(500).json({
        message: `Erro ao atualizar status do documento: ${error.message}`,
        error: error.message,
        debug_info: {
          documentoId: req.params.documentoId,
          status: req.body.status
        }
      })
    } finally {
      console.log('===============================================');
    }
  }

  // GET /cliente/processo/:processoId/formularios
  // Retorna todos os formulários/declarações para um processo
  async getFormularios(req: any, res: any) {
    try {
      const { processoId } = req.params
      const { memberId } = req.params // Optional

      if (!processoId) {
        return res.status(400).json({ message: 'processoId é obrigatório' })
      }

      const formularios = await ClienteRepository.getFormulariosByProcessoId(processoId, memberId)

      return res.status(200).json({
        message: 'Formulários recuperados com sucesso',
        data: formularios
      })
    } catch (error: any) {
      console.error('Erro ao buscar formulários:', error)
      return res.status(500).json({
        message: 'Erro ao buscar formulários',
        error: error.message
      })
    }
  }

  // POST /cliente/processo/:processoId/formularios
  // Upload de formulário pelo jurídico
  async uploadFormulario(req: any, res: any) {
    try {
      const { processoId } = req.params
      const { clienteId, memberId } = req.body
      const file = req.file

      console.log('========== UPLOAD FORMULARIO DEBUG ==========')
      console.log('processoId:', processoId)
      console.log('clienteId:', clienteId)
      console.log('memberId:', memberId)
      console.log('file:', file ? { originalname: file.originalname, size: file.size } : 'undefined')
      console.log('=============================================')

      if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' })
      }

      if (!processoId || !clienteId || !memberId) {
        return res.status(400).json({ message: 'processoId, clienteId e memberId são obrigatórios' })
      }

      // Gerar nome único
      const timestamp = Date.now()
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `formulario_${timestamp}.${fileExtension}`

      // Construir caminho: processoId/formularios/memberId/filename
      const filePath = `${processoId}/formularios/${memberId}/${fileName}`

      // Upload para o Supabase
      const uploadResult = await ClienteRepository.uploadDocument({
        filePath,
        fileBuffer: file.buffer,
        contentType: file.mimetype,
        bucket: 'formularios-juridico'
      })

      // Criar registro na tabela de formulários
      const formularioRecord = await ClienteRepository.createFormulario({
        processoId,
        clienteId,
        memberId,
        nomeOriginal: file.originalname,
        nomeArquivo: fileName,
        storagePath: filePath,
        publicUrl: uploadResult.publicUrl,
        contentType: file.mimetype,
        tamanho: file.size
      })

      return res.status(200).json({
        message: 'Formulário enviado com sucesso',
        data: {
          id: formularioRecord.id,
          name: file.originalname.replace(/\.[^/.]+$/, ''),
          fileName: file.originalname,
          fileSize: file.size,
          uploadDate: new Date(),
          memberId,
          downloadUrl: uploadResult.publicUrl
        }
      })
    } catch (error: any) {
      console.error('Erro ao upload de formulário:', error)
      return res.status(500).json({
        message: 'Erro ao enviar formulário',
        error: error.message
      })
    }
  }

  // DELETE /cliente/processo/:processoId/formularios/:formularioId
  async deleteFormulario(req: any, res: any) {
    try {
      const { formularioId } = req.params

      if (!formularioId) {
        return res.status(400).json({ message: 'formularioId é obrigatório' })
      }

      await ClienteRepository.deleteFormulario(formularioId)

      return res.status(200).json({
        message: 'Formulário deletado com sucesso'
      })
    } catch (error: any) {
      console.error('Erro ao deletar formulário:', error)
      return res.status(500).json({
        message: 'Erro ao deletar formulário',
        error: error.message
      })
    }
  }

  // POST /cliente/formularios/:formularioId/response
  async uploadFormularioResponse(req: any, res: any) {
    try {
      const { formularioId } = req.params
      const file = req.file

      console.log('====== UPLOAD FORMULARIO RESPONSE ======')
      console.log('formularioId:', formularioId)
      console.log('file:', file ? { originalname: file.originalname, size: file.size } : 'undefined')
      console.log('========================================')

      if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' })
      }

      if (!formularioId) {
        return res.status(400).json({ message: 'formularioId é obrigatório' })
      }

      // Get the original juridico form to extract cliente_id and membro_id
      const { data: originalForm, error: fetchError } = await (await import('../config/SupabaseClient')).supabase
        .from('formularios_juridico')
        .select('cliente_id, membro_id')
        .eq('id', formularioId)
        .single()

      if (fetchError || !originalForm) {
        console.error('Erro ao buscar formulário original:', fetchError)
        return res.status(404).json({ message: 'Formulário original não encontrado' })
      }

      const { cliente_id: clienteId, membro_id: membroId } = originalForm

      // Generate unique filename
      const timestamp = Date.now()
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `signed_${timestamp}.${fileExtension}`

      // Build storage path: clienteId/cliente/memberId_or_titular/filename
      const targetMember = membroId || 'titular'
      const filePath = `${clienteId}/cliente/${targetMember}/${fileName}`

      console.log('========== CLIENT RESPONSE PATH ==========')
      console.log('Bucket: formularios-juridico')
      console.log('Target Member (Folder):', targetMember)
      console.log('Generated FileName:', fileName)
      console.log('FULL PATH (filePath):', filePath)
      console.log('=========================================')

      // Upload to formularios-juridico bucket (cliente folder)
      const uploadResult = await ClienteRepository.uploadFormularioClienteResponse({
        filePath,
        fileBuffer: file.buffer,
        contentType: file.mimetype
      })

      // Create database record
      const formularioRecord = await ClienteRepository.createFormularioClienteResponse({
        formularioJuridicoId: formularioId,
        clienteId,
        membroId,
        nomeOriginal: file.originalname,
        nomeArquivo: fileName,
        storagePath: uploadResult.path,
        publicUrl: uploadResult.publicUrl,
        contentType: file.mimetype,
        tamanho: file.size
      })

      console.log('Resposta de formulário criada com sucesso:', formularioRecord.id)

      return res.status(201).json({
        message: 'Resposta de formulário enviada com sucesso',
        data: {
          id: formularioRecord.id,
          formulario_juridico_id: formularioId,
          publicUrl: uploadResult.publicUrl
        }
      })
    } catch (error: any) {
      console.error('Erro ao enviar resposta de formulário:', error)
      return res.status(500).json({
        message: 'Erro ao enviar resposta de formulário',
        error: error.message
      })
    }
  }

  // GET /cliente/:clienteId/formulario-responses
  async getFormularioResponses(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      const responses = await ClienteRepository.getFormularioClienteResponsesByCliente(clienteId)

      return res.status(200).json({
        message: 'Respostas de formulários recuperadas com sucesso',
        data: responses
      })
    } catch (error: any) {
      console.error('Erro ao buscar respostas de formulários:', error)
      return res.status(500).json({
        message: 'Erro ao buscar respostas de formulários',
        error: error.message
      })
    }
  }

  // POST /cliente/profile-photo
  async uploadProfilePhoto(req: any, res: any) {
    try {
      const { clienteId } = req.body
      const file = req.file

      if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' })
      }

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      const result = await ClienteRepository.upsertProfilePhoto({
        clienteId,
        fileBuffer: file.buffer,
        contentType: file.mimetype,
        fileName: file.originalname
      })

      return res.status(200).json({
        message: 'Foto de perfil atualizada com sucesso',
        data: result
      })
    } catch (error: any) {
      console.error('Erro ao atualizar foto de perfil:', error)
      return res.status(500).json({
        message: 'Erro ao atualizar foto de perfil',
        error: error.message
      })
    }
  }

  // GET /cliente/clientes
  async getAllClientes(req: any, res: any) {
    try {
      const clientes = await ClienteRepository.getAllClientes()

      return res.status(200).json({
        message: 'Clientes recuperados com sucesso',
        data: clientes,
        total: clientes.length
      })
    } catch (error: any) {
      console.error('Erro ao buscar todos os clientes:', error)
      return res.status(500).json({
        message: 'Erro ao buscar todos os clientes',
        error: error.message
      })
    }
  }

  // GET /cliente/:clienteId/notificacoes
  async getNotificacoes(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      const notificacoes = await ClienteRepository.getNotificacoes(clienteId)

      return res.status(200).json({
        message: 'Notificações recuperadas com sucesso',
        data: notificacoes
      })
    } catch (error: any) {
      console.error('Erro ao buscar notificações:', error)
      return res.status(500).json({
        message: 'Erro ao buscar notificações',
        error: error.message
      })
    }
  }

  // GET /cliente/:clienteId/requerimentos
  async getRequerimentosByCliente(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      const requerimentos = await JuridicoRepository.getRequerimentosByClienteId(clienteId)

      return res.status(200).json({
        message: 'Requerimentos recuperados com sucesso',
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

  // PATCH /cliente/notificacoes/:notificacaoId/status
  async updateNotificacaoStatus(req: any, res: any) {
    try {
      const { notificacaoId } = req.params
      const { lida } = req.body

      if (!notificacaoId) {
        return res.status(400).json({ message: 'notificacaoId é obrigatório' })
      }

      const notification = await ClienteRepository.updateNotificacaoStatus(notificacaoId, lida)

      return res.status(200).json({
        message: 'Status da notificação atualizado com sucesso',
        data: notification
      })
    } catch (error: any) {
      console.error('Erro ao atualizar status da notificação:', error)
      return res.status(500).json({
        message: 'Erro ao atualizar status da notificação',
        error: error.message
      })
    }
  }

  // POST /cliente/:clienteId/notificacoes/read-all
  async markAllNotificacoesAsRead(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      await ClienteRepository.markAllNotificacoesAsRead(clienteId)

      return res.status(200).json({
        message: 'Todas as notificações marcadas como lidas'
      })
    } catch (error: any) {
      console.error('Erro ao marcar todas notificações como lidas:', error)
      return res.status(500).json({
        message: 'Erro ao marcar todas notificações como lidas',
        error: error.message
      })
    }
  }

  async registerLead(req: any, res: any) {
    console.log('========== REGISTER LEAD DEBUG ==========')
    console.log('Body recebido:', req.body)
    try {
      const { nome, email, telefone } = req.body
      
      if (!nome || !email || !telefone) {
        console.error('Campos obrigatórios faltando:', { nome, email, telefone })
        return res.status(400).json({ message: 'Nome, email e telefone são obrigatórios' })
      }

      const leadData = {
        nome,
        email,
        whatsapp: telefone, // mapeando telefone para whatsapp que é o campo no banco
        status: 'LEAD', // status inicial
      }

      console.log('Tentando registrar lead no repositório:', leadData)
      const createdData = await ClienteRepository.register(leadData as any)
      console.log('Lead registrado com sucesso:', createdData)
      
      return res.status(201).json(createdData)
    } catch (error: any) {
      console.error('Erro ao registrar lead:', error)
      return res.status(500).json({ 
        message: 'Erro ao registrar lead', 
        error: error.message 
      })
    } finally {
      console.log('=========================================')
    }
  }

  async getClienteCredentials(req: any, res: any) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({ message: 'E-mail é obrigatório' });
      }

      const { supabase } = await import('../config/SupabaseClient');
      
      // 1. Primeiro busca o ID na tabela profiles pelo email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (profileError || !profile) {
        // Fallback: Tenta listar usuários se não achar no profile (pode acontecer com usuários recém-criados ou sem profile)
        const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const targetUser = usersData.users.find(u => u.email === email);
        if (!targetUser) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        return res.status(200).json({
          email: targetUser.email,
          password: targetUser.user_metadata?.temp_password || null
        });
      }
      
      // 2. Com o ID, busca os metadados do Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id);
      
      if (authError || !authUser.user) {
        return res.status(404).json({ message: 'Credenciais não encontradas no Auth' });
      }

      return res.status(200).json({
        email: authUser.user.email,
        password: authUser.user.user_metadata?.temp_password || null
      });

    } catch (error: any) {
      console.error('Erro ao buscar credenciais:', error);
      return res.status(500).json({ message: 'Erro ao buscar credenciais', error: error.message });
    }
  }
}

export default new ClienteController()