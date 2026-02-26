import { ParceiroRepository } from '../repositories';
import type { RegisterParceiroDTO } from '../types/parceiro';

 


class ParceiroController {

    async register(req: any, res: any) {
        try {
   
            const payload = req.body;
            console.log('Payload recebido no ParceiroController:', payload);
            const parceiro = await ParceiroRepository.register(payload);
            return res.status(201).json(parceiro);
        } catch (error: any) {
            console.error('Erro ao cadastrar parceiro:', error);
            return res.status(500).json({ message: 'Erro ao cadastrar parceiro', error: error.message });
        }
    }


    async update(id: string, data: Partial<RegisterParceiroDTO>) {
        try {
            const updated = await ParceiroRepository.update(id, data);
            return updated;
        } catch (error) {
            throw error;
        }
    }

    async list(params?: Record<string, unknown>) {
        try {
            const parceiros = await ParceiroRepository.list(params);
            return parceiros;
        } catch (error) {
            throw error;
        }
    }

    async remove(id: string) {
        try {
            const removed = await ParceiroRepository.remove(id);
            return removed;
        } catch (error) {
            throw error;
        }
    }
    async getParceiroById(req: any, res: any) {
        try {
        const { id } = req.params
        if (!id) return res.status(400).json({ message: 'Parâmetro id é obrigatório' })

        const parceiro = await ParceiroRepository.findById(id)
        if (!parceiro) return res.status(404).json({ message: 'Parceiro não encontrado' })

        return res.status(200).json(parceiro)
        } catch (error: any) {
        console.error('Erro ao buscar parceiro:', error)
        return res.status(500).json({ message: 'Erro ao buscar parceiro', error: error.message })
        }
    }

    async getClientsByParceiroId(req: any, res: any) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'ID do parceiro é obrigatório' });
            
            const clients = await ParceiroRepository.getMetrics(id);
            return res.status(200).json(clients.referralList);
        } catch (error: any) {
            console.error('Erro ao buscar clientes do parceiro:', error);
            return res.status(500).json({ message: 'Erro ao buscar clientes do parceiro', error: error.message });
        }
    }

    async getMetrics(req: any, res: any) {
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'ID do parceiro é obrigatório' });

            const metrics = await ParceiroRepository.getMetrics(id);
            return res.status(200).json(metrics);
        } catch (error: any) {
            console.error('Erro ao buscar métricas do parceiro:', error);
            return res.status(500).json({ message: 'Erro ao buscar métricas do parceiro', error: error.message });
        }
    }

}

export default new ParceiroController();