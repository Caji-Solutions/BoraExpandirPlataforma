"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TraducoesRepository_1 = __importDefault(require("../repositories/TraducoesRepository"));
class TraducoesController {
    async getOrcamentos(req, res) {
        try {
            const orcamentos = await TraducoesRepository_1.default.getOrcamentos();
            console.log(orcamentos);
            return res.status(200).json(orcamentos);
        }
        catch (error) {
            console.error('[TraducoesController.getOrcamentos] Error:', error);
            return res.status(500).json({ error: 'Erro ao buscar orçamentos' });
        }
    }
    async responderOrcamento(req, res) {
        try {
            const { documentoId, valorOrcamento, prazoEntrega, observacoes } = req.body;
            if (!documentoId || !valorOrcamento || !prazoEntrega) {
                return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
            }
            const orcamento = await TraducoesRepository_1.default.saveOrcamento({
                documentoId,
                valorOrcamento,
                prazoEntrega,
                observacoes
            });
            return res.status(201).json(orcamento);
        }
        catch (error) {
            console.error('[TraducoesController.responderOrcamento] Error:', error);
            return res.status(500).json({ error: 'Erro ao salvar resposta do orçamento' });
        }
    }
    async getOrcamentoByDocumento(req, res) {
        try {
            const { documentoId } = req.params;
            const orcamento = await TraducoesRepository_1.default.getOrcamentoByDocumento(documentoId);
            if (!orcamento) {
                return res.status(404).json({ error: 'Orçamento não encontrado' });
            }
            return res.status(200).json(orcamento);
        }
        catch (error) {
            console.error('[TraducoesController.getOrcamentoByDocumento] Error:', error);
            return res.status(500).json({ error: 'Erro ao buscar orçamento' });
        }
    }
    async aprovarOrcamento(req, res) {
        try {
            const { id } = req.params;
            const { documentoId } = req.body;
            if (!id || !documentoId) {
                return res.status(400).json({ error: 'Parâmetros orcamentoId ou documentoId ausentes' });
            }
            await TraducoesRepository_1.default.aprovarOrcamento(id, documentoId);
            return res.status(200).json({ message: 'Orçamento aprovado com sucesso' });
        }
        catch (error) {
            console.error('[TraducoesController.aprovarOrcamento] Error:', error);
            return res.status(500).json({ error: 'Erro ao aprovar orçamento' });
        }
    }
    async aprovarOrcamentoAdm(req, res) {
        try {
            const { id } = req.params;
            const { documentoId, porcentagemMarkup, valorFinal } = req.body;
            if (!id || !documentoId) {
                return res.status(400).json({ error: 'Parâmetros orcamentoId ou documentoId ausentes' });
            }
            await TraducoesRepository_1.default.aprovarOrcamentoAdm(id, {
                documentoId,
                porcentagemMarkup,
                valorFinal
            });
            return res.status(200).json({ message: 'Orçamento aprovado pelo ADM com sucesso' });
        }
        catch (error) {
            console.error('[TraducoesController.aprovarOrcamentoAdm] Error:', error);
            return res.status(500).json({ error: 'Erro ao aprovar orçamento pelo ADM' });
        }
    }
    async createCheckoutSession(req, res) {
        try {
            const { documentoIds, email, successUrl, cancelUrl } = req.body;
            if (!documentoIds || !Array.isArray(documentoIds) || documentoIds.length === 0) {
                return res.status(400).json({ error: 'Nenhum documento selecionado' });
            }
            // Buscar orçamentos para os documentos
            const { manualPrice } = req.body;
            const lineItems = [];
            for (const docId of documentoIds) {
                const orcamento = await TraducoesRepository_1.default.getOrcamentoByDocumento(docId);
                if (orcamento && (orcamento.valor_orcamento > 0 || orcamento.preco_atualizado > 0)) {
                    const finalAmount = orcamento.preco_atualizado || orcamento.valor_orcamento;
                    lineItems.push({
                        name: `Serviço para documento ID ${docId}`,
                        amount: Math.round(Number(finalAmount) * 100), // centavos
                        quantity: 1
                    });
                }
                else if (manualPrice && manualPrice > 0) {
                    lineItems.push({
                        name: `Tradução/Serviço Direto para doc ID ${docId}`,
                        amount: Math.round(Number(manualPrice) * 100),
                        quantity: 1
                    });
                }
            }
            if (lineItems.length === 0) {
                return res.status(400).json({ error: 'Nenhum orçamento válido encontrado para os documentos selecionados' });
            }
            const StripeService = (await Promise.resolve().then(() => __importStar(require('../services/StripeService')))).default;
            const checkout = await StripeService.createGenericCheckoutSession({
                items: lineItems,
                email,
                metadata: {
                    tipo: 'orcamento',
                    documentoIds: documentoIds.join(',')
                },
                successUrl: successUrl || `${process.env.FRONTEND_URL}/agendamento/sucesso`,
                cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/agendamento/cancelado`,
                currency: 'eur'
            });
            return res.status(200).json(checkout);
        }
        catch (error) {
            console.error('[TraducoesController.createCheckoutSession] Error:', error);
            return res.status(500).json({ error: 'Erro ao criar sessão de checkout', details: error.message });
        }
    }
    async getFilaDeTrabalho(req, res) {
        try {
            const fila = await TraducoesRepository_1.default.getFilaDeTrabalho();
            return res.status(200).json(fila);
        }
        catch (error) {
            console.error('[TraducoesController.getFilaDeTrabalho] Error:', error);
            return res.status(500).json({ error: 'Erro ao buscar fila de trabalho' });
        }
    }
    async getEntregues(req, res) {
        try {
            const entregues = await TraducoesRepository_1.default.getEntregues();
            return res.status(200).json(entregues);
        }
        catch (error) {
            console.error('[TraducoesController.getEntregues] Error:', error);
            return res.status(500).json({ error: 'Erro ao buscar traduções entregues' });
        }
    }
    async submitTraducao(req, res) {
        try {
            const { documentoId } = req.body;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }
            if (!documentoId) {
                return res.status(400).json({ error: 'documentoId é obrigatório' });
            }
            // Build storage path for translated file
            const timestamp = Date.now();
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `traducao_${timestamp}.${fileExtension}`;
            const filePath = `traducoes/${documentoId}/${fileName}`;
            const result = await TraducoesRepository_1.default.submitTraducao({
                documentoId,
                filePath,
                fileBuffer: file.buffer,
                contentType: file.mimetype,
                nomeOriginal: file.originalname
            });
            return res.status(200).json({ message: 'Tradução enviada com sucesso', data: result });
        }
        catch (error) {
            console.error('[TraducoesController.submitTraducao] Error:', error);
            return res.status(500).json({ error: 'Erro ao enviar tradução', details: error.message });
        }
    }
}
exports.default = new TraducoesController();
