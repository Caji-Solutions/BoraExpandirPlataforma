import { supabase } from '../config/SupabaseClient'
import { Request, Response } from 'express'
import { documentsRepository } from '../repositories/DocumentsRepository'

class DocumentsController {
  async uploadDocument(req: Request, res: Response) {
    try {
      const { file } = req.body
      if (!file || !file.name || !file.content) {
        return res.status(400).json({ error: 'Parâmetros inválidos: file.name e file.content são obrigatórios.' })
      }

      const data = await documentsRepository.saveFileToBucket(req.body.usuarioId, file)

      return res.status(200).json({ message: 'File uploaded successfully', data })
    } catch (err) {
      console.error('[DocumentsController.uploadDocument] Error:', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}

export const documentsController = new DocumentsController()
