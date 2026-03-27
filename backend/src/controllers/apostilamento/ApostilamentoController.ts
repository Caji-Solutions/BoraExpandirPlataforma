import { Request, Response } from 'express';
import ApostilamentoRepository from '../../repositories/ApostilamentoRepository';

class ApostilamentoController {
  async solicitar(req: Request, res: Response) {
    try {
      const { documentoId, documentoUrl, observacoes } = req.body;

      if (!documentoId) {
        return res.status(400).json({ message: 'documentoId é obrigatório' });
      }

      console.log(`[ApostilamentoController.solicitar] Iniciando solicitacao para documento: ${documentoId}`);

      const apostilamento = await ApostilamentoRepository.create({
        documentoId,
        documentoUrl,
        observacoes
      });

      console.log(`[ApostilamentoController.solicitar] Solicitacao processada com sucesso (Idempotente). ID: ${apostilamento.id}`);

      return res.status(201).json({
        message: 'Solicitação de apostilamento processada com sucesso',
        data: apostilamento
      });
    } catch (error: any) {
      console.error('Erro ao solicitar apostilamento:', error);
      return res.status(500).json({ message: 'Erro ao solicitar apostilamento', error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, documentoApostiladoUrl, observacoes } = req.body;

      if (!id || !status) {
        return res.status(400).json({ message: 'ID e status são obrigatórios' });
      }

      const apostilamento = await ApostilamentoRepository.updateStatus(id, {
        status,
        documentoApostiladoUrl,
        observacoes
      });

      return res.status(200).json({
        message: 'Status do apostilamento atualizado com sucesso',
        data: apostilamento
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status do apostilamento:', error);
      return res.status(500).json({ message: 'Erro ao atualizar status do apostilamento', error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const apostilamentos = await ApostilamentoRepository.findAll();

      return res.status(200).json({
        message: 'Apostilamentos recuperados com sucesso',
        data: apostilamentos
      });
    } catch (error: any) {
      console.error('Erro ao buscar apostilamentos:', error);
      return res.status(500).json({ message: 'Erro ao buscar apostilamentos', error: error.message });
    }
  }

  async submitComprovante(req: Request, res: Response) {
    try {
      const { id } = req.params // orcamentoId (primary)
      const { orcamentoIds } = req.body // bulk orcamentoIds
      const file = (req as any).file

      if (!file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' })
      }

      // Consolidar IDs: pode vir um único no param ou uma lista no body
      const idsToUpdate = Array.isArray(orcamentoIds) ? orcamentoIds : [id]
      if (!idsToUpdate.includes(id)) idsToUpdate.push(id)

      const timestamp = Date.now()
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `comprovante_apostila_${timestamp}.${fileExtension}`
      const filePath = `comprovantes_apostila/${id}/${fileName}`

      const result = await ApostilamentoRepository.submitComprovante({
        orcamentoIds: idsToUpdate,
        filePath,
        fileBuffer: file.buffer,
        contentType: file.mimetype,
        nomeOriginal: file.originalname
      })

      return res.status(200).json({ message: 'Comprovante de apostila enviado com sucesso', data: result })
    } catch (error: any) {
      console.error('[ApostilamentoController.submitComprovante] Error:', error)
      return res.status(500).json({ error: 'Erro ao enviar comprovante de apostila', details: error.message })
    }
  }
}

export default new ApostilamentoController();
