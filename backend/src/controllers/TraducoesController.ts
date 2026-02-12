import { Request, Response } from 'express'
import TraducoesRepository from '../repositories/TraducoesRepository'

class TraducoesController {
  async getOrcamentos(req: Request, res: Response) {
    try {
      const orcamentos = await TraducoesRepository.getOrcamentos()
      console.log(orcamentos)
      return res.status(200).json(orcamentos)
    } catch (error) {
      console.error('[TraducoesController.getOrcamentos] Error:', error)
      return res.status(500).json({ error: 'Erro ao buscar orçamentos' })
    }
  }

  async responderOrcamento(req: Request, res: Response) {
    try {
      const { documentoId, valorOrcamento, prazoEntrega, observacoes } = req.body

      if (!documentoId || !valorOrcamento || !prazoEntrega) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' })
      }

      const orcamento = await TraducoesRepository.saveOrcamento({
        documentoId,
        valorOrcamento,
        prazoEntrega,
        observacoes
      })

      return res.status(201).json(orcamento)
    } catch (error) {
      console.error('[TraducoesController.responderOrcamento] Error:', error)
      return res.status(500).json({ error: 'Erro ao salvar resposta do orçamento' })
    }
  }

  async getOrcamentoByDocumento(req: Request, res: Response) {
    try {
      const { documentoId } = req.params
      const orcamento = await TraducoesRepository.getOrcamentoByDocumento(documentoId)
      
      if (!orcamento) {
        return res.status(404).json({ error: 'Orçamento não encontrado' })
      }

      return res.status(200).json(orcamento)
    } catch (error) {
      console.error('[TraducoesController.getOrcamentoByDocumento] Error:', error)
      return res.status(500).json({ error: 'Erro ao buscar orçamento' })
    }
  }

  async aprovarOrcamento(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { documentoId } = req.body

      if (!id || !documentoId) {
        return res.status(400).json({ error: 'Parâmetros orcamentoId ou documentoId ausentes' })
      }

      await TraducoesRepository.aprovarOrcamento(id, documentoId)

      return res.status(200).json({ message: 'Orçamento aprovado com sucesso' })
    } catch (error) {
      console.error('[TraducoesController.aprovarOrcamento] Error:', error)
      return res.status(500).json({ error: 'Erro ao aprovar orçamento' })
    }
  }
}

export default new TraducoesController()
