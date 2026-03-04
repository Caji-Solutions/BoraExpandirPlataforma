"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repositories_1 = require("../repositories");
class ParceiroController {
    async register(req, res) {
        try {
            const payload = req.body;
            console.log('Payload recebido no ParceiroController:', payload);
            const parceiro = await repositories_1.ParceiroRepository.register(payload);
            return res.status(201).json(parceiro);
        }
        catch (error) {
            console.error('Erro ao cadastrar parceiro:', error);
            return res.status(500).json({ message: 'Erro ao cadastrar parceiro', error: error.message });
        }
    }
    async update(id, data) {
        try {
            const updated = await repositories_1.ParceiroRepository.update(id, data);
            return updated;
        }
        catch (error) {
            throw error;
        }
    }
    async list(params) {
        try {
            const parceiros = await repositories_1.ParceiroRepository.list(params);
            return parceiros;
        }
        catch (error) {
            throw error;
        }
    }
    async remove(id) {
        try {
            const removed = await repositories_1.ParceiroRepository.remove(id);
            return removed;
        }
        catch (error) {
            throw error;
        }
    }
    async getParceiroById(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                return res.status(400).json({ message: 'Parâmetro id é obrigatório' });
            const parceiro = await repositories_1.ParceiroRepository.findById(id);
            if (!parceiro)
                return res.status(404).json({ message: 'Parceiro não encontrado' });
            return res.status(200).json(parceiro);
        }
        catch (error) {
            console.error('Erro ao buscar parceiro:', error);
            return res.status(500).json({ message: 'Erro ao buscar parceiro', error: error.message });
        }
    }
    async getClientsByParceiroId(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                return res.status(400).json({ message: 'ID do parceiro é obrigatório' });
            const clients = await repositories_1.ParceiroRepository.getMetrics(id);
            return res.status(200).json(clients.referralList);
        }
        catch (error) {
            console.error('Erro ao buscar clientes do parceiro:', error);
            return res.status(500).json({ message: 'Erro ao buscar clientes do parceiro', error: error.message });
        }
    }
    async getMetrics(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                return res.status(400).json({ message: 'ID do parceiro é obrigatório' });
            const metrics = await repositories_1.ParceiroRepository.getMetrics(id);
            return res.status(200).json(metrics);
        }
        catch (error) {
            console.error('Erro ao buscar métricas do parceiro:', error);
            return res.status(500).json({ message: 'Erro ao buscar métricas do parceiro', error: error.message });
        }
    }
}
exports.default = new ParceiroController();
