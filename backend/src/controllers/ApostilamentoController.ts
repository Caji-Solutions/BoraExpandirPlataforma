import { Request, Response } from 'express';
import ApostilamentoRepository from '../repositories/ApostilamentoRepository';

class ApostilamentoController {
  async solicitar(req: Request, res: Response) {
    try {
      const { documentoId, documentoUrl, observacoes } = req.body;

      if (!documentoId) {
        return res.status(400).json({ message: 'documentoId é obrigatório' });
      }

      // Verifica se já existe uma solicitação para este documento
      const existe = await ApostilamentoRepository.findByDocumentoId(documentoId);
      if (existe) {
        return res.status(400).json({ message: 'Já existe uma solicitação de apostilamento para este documento' });
      }

      const apostilamento = await ApostilamentoRepository.create({
        documentoId,
        documentoUrl,
        observacoes
      });

      return res.status(201).json({
        message: 'Solicitação de apostilamento criada com sucesso',
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
}

export default new ApostilamentoController();
