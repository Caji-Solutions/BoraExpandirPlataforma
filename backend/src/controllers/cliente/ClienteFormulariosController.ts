import ClienteRepository from '../../repositories/ClienteRepository';

class ClienteFormulariosController {
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
      console.error('Erro ao buscar formularios:', error)
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
      console.error('Erro ao upload de formulario:', error)
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
      console.error('Erro ao deletar formulario:', error)
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
      const { data: originalForm, error: fetchError } = await (await import('../../config/SupabaseClient')).supabase
        .from('formularios_juridico')
        .select('cliente_id, membro_id')
        .eq('id', formularioId)
        .single()

      if (fetchError || !originalForm) {
        console.error('Erro ao buscar formulario original:', fetchError)
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

      console.log('Resposta de formulario criada com sucesso:', formularioRecord.id)

      return res.status(201).json({
        message: 'Resposta de formulário enviada com sucesso',
        data: {
          id: formularioRecord.id,
          formulario_juridico_id: formularioId,
          publicUrl: uploadResult.publicUrl
        }
      })
    } catch (error: any) {
      console.error('Erro ao enviar resposta de formulario:', error)
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
      console.error('Erro ao buscar respostas de formularios:', error)
      return res.status(500).json({
        message: 'Erro ao buscar respostas de formulários',
        error: error.message
      })
    }
  }
}

export default new ClienteFormulariosController()
