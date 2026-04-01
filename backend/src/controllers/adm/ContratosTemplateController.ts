import { Request, Response } from 'express';
import ContratosTemplateRepository from '../../repositories/ContratosTemplateRepository';

class ContratosTemplateController {
    async list(req: Request, res: Response): Promise<void> {
        try {
            const contratos = await ContratosTemplateRepository.findAll();
            // Retorna array vazio caso a tabela nao exista, pra nao quebrar o frontend
            res.json(contratos || []);
        } catch (error) {
            console.error('[ContratosTemplateController] erro list', error);
            res.status(500).json({ error: 'Erro ao listar contratos' });
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const contrato = await ContratosTemplateRepository.findById(id);
            if (!contrato) {
                res.status(404).json({ error: 'Contrato não encontrado' });
                return;
            }
            res.json(contrato);
        } catch (error) {
            console.error('[ContratosTemplateController] erro getById', error);
            res.status(500).json({ error: 'Erro ao obter contrato' });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const { nome, conteudo_html } = req.body;
            if (!nome || !conteudo_html) {
                res.status(400).json({ error: 'Nome e conteudo_html são obrigatorios' });
                return;
            }

            const novo = await ContratosTemplateRepository.create({ nome, conteudo_html });
            res.status(201).json(novo);
        } catch (error: any) {
            console.error('[ContratosTemplateController] erro create', error);
            res.status(500).json({ error: error.message || 'Erro ao criar' });
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { nome, conteudo_html } = req.body;

            const atualizado = await ContratosTemplateRepository.update(id, { nome, conteudo_html });
            res.json(atualizado);
        } catch (error: any) {
            console.error('[ContratosTemplateController] erro update', error);
            res.status(500).json({ error: error.message || 'Erro ao atualizar' });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const success = await ContratosTemplateRepository.delete(id);
            if (!success) {
                res.status(400).json({ error: 'Erro ao remover ou não encontrado' });
                return;
            }
            res.json({ success: true });
        } catch (error: any) {
            console.error('[ContratosTemplateController] erro delete', error);
            res.status(500).json({ error: error.message || 'Erro ao remover' });
        }
    }
}

export default new ContratosTemplateController();
