"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApostilamentoRepository_1 = __importDefault(require("../repositories/ApostilamentoRepository"));
class ApostilamentoController {
    async solicitar(req, res) {
        try {
            const { documentoId, documentoUrl, observacoes } = req.body;
            if (!documentoId) {
                return res.status(400).json({ message: 'documentoId é obrigatório' });
            }
            // Verifica se já existe uma solicitação para este documento
            const existe = await ApostilamentoRepository_1.default.findByDocumentoId(documentoId);
            if (existe) {
                return res.status(400).json({ message: 'Já existe uma solicitação de apostilamento para este documento' });
            }
            const apostilamento = await ApostilamentoRepository_1.default.create({
                documentoId,
                documentoUrl,
                observacoes
            });
            return res.status(201).json({
                message: 'Solicitação de apostilamento criada com sucesso',
                data: apostilamento
            });
        }
        catch (error) {
            console.error('Erro ao solicitar apostilamento:', error);
            return res.status(500).json({ message: 'Erro ao solicitar apostilamento', error: error.message });
        }
    }
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, documentoApostiladoUrl, observacoes } = req.body;
            if (!id || !status) {
                return res.status(400).json({ message: 'ID e status são obrigatórios' });
            }
            const apostilamento = await ApostilamentoRepository_1.default.updateStatus(id, {
                status,
                documentoApostiladoUrl,
                observacoes
            });
            return res.status(200).json({
                message: 'Status do apostilamento atualizado com sucesso',
                data: apostilamento
            });
        }
        catch (error) {
            console.error('Erro ao atualizar status do apostilamento:', error);
            return res.status(500).json({ message: 'Erro ao atualizar status do apostilamento', error: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const apostilamentos = await ApostilamentoRepository_1.default.findAll();
            return res.status(200).json({
                message: 'Apostilamentos recuperados com sucesso',
                data: apostilamentos
            });
        }
        catch (error) {
            console.error('Erro ao buscar apostilamentos:', error);
            return res.status(500).json({ message: 'Erro ao buscar apostilamentos', error: error.message });
        }
    }
}
exports.default = new ApostilamentoController();
