"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdmController = void 0;
const AdmRepository_1 = __importDefault(require("../repositories/AdmRepository"));
class AdmController {
    async getCatalog(req, res) {
        try {
            const services = await AdmRepository_1.default.getCatalogServices();
            // Mapear para o formato que o frontend espera (id, name, value, etc)
            const mapped = services.map((s) => ({
                id: s.id,
                name: s.nome,
                value: s.valor.toString(),
                duration: s.duracao,
                showInCommercial: s.exibir_comercial,
                requiresLegalDelegation: s.requer_delegacao_juridico || false,
                documents: s.requisitos.map((r) => ({
                    id: r.id,
                    name: r.nome,
                    stage: r.etapa,
                    required: r.obrigatorio
                }))
            }));
            console.log(mapped);
            return res.json({ data: mapped });
        }
        catch (error) {
            console.error('Erro ao buscar catálogo:', error);
            return res.status(500).json({ message: 'Erro ao buscar catálogo de serviços' });
        }
    }
    async createService(req, res) {
        try {
            const service = await AdmRepository_1.default.createCatalogService(req.body);
            return res.status(201).json({ data: service });
        }
        catch (error) {
            console.error('Erro ao criar serviço no catálogo:', error);
            return res.status(500).json({ message: 'Erro ao criar serviço' });
        }
    }
    async updateService(req, res) {
        try {
            const { id } = req.params;
            const service = await AdmRepository_1.default.updateCatalogService(id, req.body);
            return res.json({ data: service });
        }
        catch (error) {
            console.error('Erro ao atualizar serviço:', error);
            return res.status(500).json({ message: 'Erro ao atualizar serviço' });
        }
    }
    async deleteService(req, res) {
        try {
            const { id } = req.params;
            await AdmRepository_1.default.deleteCatalogService(id);
            return res.json({ message: 'Serviço excluído com sucesso' });
        }
        catch (error) {
            console.error('Erro ao excluir serviço:', error);
            return res.status(500).json({ message: 'Erro ao excluir serviço' });
        }
    }
}
exports.AdmController = AdmController;
exports.default = new AdmController();
