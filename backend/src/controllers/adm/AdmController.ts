import { Request, Response } from 'express';
import AdmRepository from '../../repositories/AdmRepository';

export class AdmController {
  async getCatalog(req: Request, res: Response) {
    try {
      const services = await AdmRepository.getCatalogServices();
      // Mapear para o formato que o frontend espera
      const mapped = services.map((s: any) => ({
        id: s.id,
        name: s.nome,
        value: s.valor != null ? s.valor.toString() : '',   // null-safe
        duration: s.duracao,
        type: s.tipo || 'agendavel',
        isAgendavel: s.is_agendavel ?? false,
        tipoPreco: s.tipo_preco ?? 'por_contrato',
        contratoTemplateId: s.contrato_template_id ?? null,
        possuiSubservicos: s.possui_subservicos ?? false,
        showInCommercial: s.exibir_comercial,
        showToClient: s.exibir_cliente,
        requiresLegalDelegation: s.requer_delegacao_juridico || false,
        documents: (s.requisitos || [])
          .filter((r: any) => !r.subservico_id)
          .map((r: any) => ({
            id: r.id,
            name: r.nome,
            stage: r.etapa,
            required: r.obrigatorio,
            tipoDocumento: r.tipo_documento ?? 'titular',
          })),
        subservices: (s.subservicos || []).map((sub: any) => ({
          id: sub.id,
          name: sub.nome,
          documents: (sub.requisitos || []).map((r: any) => ({
            id: r.id,
            name: r.nome,
            stage: r.etapa,
            required: r.obrigatorio,
            tipoDocumento: r.tipo_documento ?? 'titular',
          }))
        }))
      }));
      return res.json({ data: mapped });
    } catch (error: any) {
      console.error('Erro ao buscar catalogo:', error);
      return res.status(500).json({ message: 'Erro ao buscar catalogo de servicos' });
    }
  }

  async createService(req: Request, res: Response) {
    try {
      const service = await AdmRepository.createCatalogService(req.body);
      return res.status(201).json({ data: service });
    } catch (error: any) {
      console.error('Erro ao criar servico no catalogo:', error);
      return res.status(500).json({ message: 'Erro ao criar servico' });
    }
  }

  async updateService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await AdmRepository.updateCatalogService(id, req.body);
      return res.json({ data: service });
    } catch (error: any) {
      console.error('Erro ao atualizar servico:', error);
      return res.status(500).json({ message: 'Erro ao atualizar servico' });
    }
  }

  async deleteService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AdmRepository.deleteCatalogService(id);
      return res.json({ message: 'Servico excluido com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir servico:', error);
      return res.status(500).json({ message: 'Erro ao excluir servico' });
    }
  }

  // ======= Subservicos =======

  async getSubservices(req: Request, res: Response) {
    try {
      const subservices = await AdmRepository.getAllSubservices();
      const mapped = (subservices || []).map((sub: any) => ({
        id: sub.id,
        name: sub.nome,
        servicoId: sub.servico_id,
        servicoNome: sub.servico?.nome || null,
        documents: (sub.requisitos || []).map((r: any) => ({
          id: r.id,
          name: r.nome,
          stage: r.etapa,
          required: r.obrigatorio
        }))
      }));
      return res.json({ data: mapped });
    } catch (error: any) {
      console.error('Erro ao buscar subservicos:', error);
      return res.status(500).json({ message: 'Erro ao buscar subservicos' });
    }
  }

  async createSubservice(req: Request, res: Response) {
    try {
      const sub = await AdmRepository.createSubservice(req.body);
      return res.status(201).json({ data: sub });
    } catch (error: any) {
      console.error('Erro ao criar subservico:', error);
      return res.status(500).json({ message: 'Erro ao criar subservico' });
    }
  }

  async updateSubservice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sub = await AdmRepository.updateSubservice(id, req.body);
      return res.json({ data: sub });
    } catch (error: any) {
      console.error('Erro ao atualizar subservico:', error);
      return res.status(500).json({ message: 'Erro ao atualizar subservico' });
    }
  }

  async deleteSubservice(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AdmRepository.deleteSubservice(id);
      return res.json({ message: 'Subservico excluido com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir subservico:', error);
      return res.status(500).json({ message: 'Erro ao excluir subservico' });
    }
  }
}

export default new AdmController();
