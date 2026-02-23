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

  async aprovarOrcamentoAdm(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { documentoId, porcentagemMarkup, valorFinal } = req.body

      if (!id || !documentoId) {
        return res.status(400).json({ error: 'Parâmetros orcamentoId ou documentoId ausentes' })
      }

      await TraducoesRepository.aprovarOrcamentoAdm(id, {
        documentoId,
        porcentagemMarkup,
        valorFinal
      })

      return res.status(200).json({ message: 'Orçamento aprovado pelo ADM com sucesso' })
    } catch (error) {
      console.error('[TraducoesController.aprovarOrcamentoAdm] Error:', error)
      return res.status(500).json({ error: 'Erro ao aprovar orçamento pelo ADM' })
    }
  }

  async createCheckoutSession(req: Request, res: Response) {
    try {
      const { documentoIds, email, successUrl, cancelUrl } = req.body

      if (!documentoIds || !Array.isArray(documentoIds) || documentoIds.length === 0) {
        return res.status(400).json({ error: 'Nenhum documento selecionado' })
      }

      // Buscar orçamentos para os documentos
      const { manualPrice } = req.body
      const lineItems = []
      for (const docId of documentoIds) {
        const orcamento = await TraducoesRepository.getOrcamentoByDocumento(docId)
        if (orcamento && (orcamento.valor_orcamento > 0 || orcamento.preco_atualizado > 0)) {
          const finalAmount = orcamento.preco_atualizado || orcamento.valor_orcamento
          lineItems.push({
            name: `Serviço para documento ID ${docId}`,
            amount: Math.round(Number(finalAmount) * 100), // centavos
            quantity: 1
          })
        } else if (manualPrice && manualPrice > 0) {
          lineItems.push({
            name: `Tradução/Serviço Direto para doc ID ${docId}`,
            amount: Math.round(Number(manualPrice) * 100),
            quantity: 1
          })
        }
      }

      if (lineItems.length === 0) {
        return res.status(400).json({ error: 'Nenhum orçamento válido encontrado para os documentos selecionados' })
      }

      const StripeService = (await import('../services/StripeService')).default
      const checkout = await StripeService.createGenericCheckoutSession({
        items: lineItems,
        email,
        metadata: {
          tipo: 'orcamento',
          documentoIds: documentoIds.join(',')
        },
        successUrl: successUrl || `${process.env.FRONTEND_URL}/dashboard?status=success`,
        cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/dashboard?status=cancelled`,
        currency: 'brl'
      })

      return res.status(200).json(checkout)
    } catch (error: any) {
      console.error('[TraducoesController.createCheckoutSession] Error:', error)
      return res.status(500).json({ error: 'Erro ao criar sessão de checkout', details: error.message })
    }
  }

  async getFilaDeTrabalho(req: Request, res: Response) {
    try {
      const fila = await TraducoesRepository.getFilaDeTrabalho()
      return res.status(200).json(fila)
    } catch (error) {
      console.error('[TraducoesController.getFilaDeTrabalho] Error:', error)
      return res.status(500).json({ error: 'Erro ao buscar fila de trabalho' })
    }
  }

  async getEntregues(req: Request, res: Response) {
    try {
      const entregues = await TraducoesRepository.getEntregues()
      return res.status(200).json(entregues)
    } catch (error) {
      console.error('[TraducoesController.getEntregues] Error:', error)
      return res.status(500).json({ error: 'Erro ao buscar traduções entregues' })
    }
  }

  async submitTraducao(req: Request, res: Response) {
    try {
      const { documentoId } = req.body
      const file = (req as any).file

      if (!file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' })
      }

      if (!documentoId) {
        return res.status(400).json({ error: 'documentoId é obrigatório' })
      }

      // Build storage path for translated file
      const timestamp = Date.now()
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `traducao_${timestamp}.${fileExtension}`
      const filePath = `traducoes/${documentoId}/${fileName}`

      const result = await TraducoesRepository.submitTraducao({
        documentoId,
        filePath,
        fileBuffer: file.buffer,
        contentType: file.mimetype,
        nomeOriginal: file.originalname
      })

      return res.status(200).json({ message: 'Tradução enviada com sucesso', data: result })
    } catch (error: any) {
      console.error('[TraducoesController.submitTraducao] Error:', error)
      return res.status(500).json({ error: 'Erro ao enviar tradução', details: error.message })
    }
  }
}

export default new TraducoesController()
