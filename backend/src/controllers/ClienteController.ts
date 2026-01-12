import type { ClienteDTO } from '../types/parceiro';
import ClienteRepository from '../repositories/ClienteRepository';

class ClienteController {
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

  async register(req: any, res: any) {
    try {
      
      const { nome, email, whatsapp, parceiro_id, status} = req.body
      const Cliente = { nome, email, whatsapp, parceiro_id, status } as ClienteDTO    
      const createdData = await ClienteRepository.register(Cliente)  
    return res.status(201).json(createdData)   
    } catch (error) {
      throw error
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
      const { clienteId, documentType } = req.body
      const file = req.file

      // Logs de debug
      console.log('========== UPLOAD DOC DEBUG ==========')
      console.log('req.body:', req.body)
      console.log('clienteId:', clienteId)
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

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      if (!documentType) {
        return res.status(400).json({ message: 'documentType é obrigatório' })
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `${documentType}_${timestamp}.${fileExtension}`
      const filePath = `${clienteId}/${documentType}/${fileName}`

      console.log('FilePath gerado:', filePath)

      // Upload para o Supabase Storage via Repository
      const uploadResult = await ClienteRepository.uploadDocument({
        filePath,
        fileBuffer: file.buffer,
        contentType: file.mimetype
      })

      // Criar registro do documento no banco de dados
      const documentoRecord = await ClienteRepository.createDocumento({
        clienteId,
        tipo: documentType,
        nomeOriginal: file.originalname,
        nomeArquivo: fileName,
        storagePath: filePath,
        publicUrl: uploadResult.publicUrl,
        contentType: file.mimetype,
        tamanho: file.size
      })

      console.log('Documento registrado no banco:', documentoRecord.id)

      return res.status(200).json({
        message: 'Documento enviado com sucesso',
        data: {
          id: documentoRecord.id,
          ...uploadResult,
          fileName: file.originalname,
          documentType,
          clienteId,
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
    try {
      const { documentoId } = req.params
      const { status, motivoRejeicao, analisadoPor } = req.body

      if (!documentoId) {
        return res.status(400).json({ message: 'documentoId é obrigatório' })
      }

      if (!status || !['PENDING', 'ANALYZING', 'APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: 'status é obrigatório e deve ser PENDING, ANALYZING, APPROVED ou REJECTED' })
      }

      const documento = await ClienteRepository.updateDocumentoStatus(documentoId, status, motivoRejeicao, analisadoPor)

      return res.status(200).json({
        message: 'Status do documento atualizado com sucesso',
        data: documento
      })
    } catch (error: any) {
      console.error('Erro ao atualizar status do documento:', error)
      return res.status(500).json({ 
        message: 'Erro ao atualizar status do documento', 
        error: error.message 
      })
    }
  }
}

export default new ClienteController()