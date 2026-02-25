import { Request, Response } from 'express';
import AdmRepository from '../repositories/AdmRepository';

export class AdmController {
  async getCatalog(req: Request, res: Response) {
    try {
      const services = await AdmRepository.getCatalogServices();
      // Mapear para o formato que o frontend espera (id, name, value, etc)
      const mapped = services.map((s: any) => ({
        id: s.id,
        name: s.nome,
        value: s.valor.toString(),
        duration: s.duracao,
        showInCommercial: s.exibir_comercial,
        documents: s.requisitos.map((r: any) => ({
          id: r.id,
          name: r.nome,
          stage: r.etapa,
          required: r.obrigatorio
        }))
      }));
      console.log(mapped);
      return res.json({ data: mapped });
    } catch (error: any) {
      console.error('Erro ao buscar catálogo:', error);
      return res.status(500).json({ message: 'Erro ao buscar catálogo de serviços' });
    }
  }

  async createService(req: Request, res: Response) {
    try {
      const service = await AdmRepository.createCatalogService(req.body);
      return res.status(201).json({ data: service });
    } catch (error: any) {
      console.error('Erro ao criar serviço no catálogo:', error);
      return res.status(500).json({ message: 'Erro ao criar serviço' });
    }
  }

  async updateService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await AdmRepository.updateCatalogService(id, req.body);
      return res.json({ data: service });
    } catch (error: any) {
      console.error('Erro ao atualizar serviço:', error);
      return res.status(500).json({ message: 'Erro ao atualizar serviço' });
    }
  }

  async deleteService(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AdmRepository.deleteCatalogService(id);
      return res.json({ message: 'Serviço excluído com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir serviço:', error);
      return res.status(500).json({ message: 'Erro ao excluir serviço' });
    }
  }
}

export default new AdmController();
