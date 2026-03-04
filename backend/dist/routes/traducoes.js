"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const TraducoesController_1 = __importDefault(require("../controllers/TraducoesController"));
const router = (0, express_1.Router)();
// Multer config for file uploads (translated documents)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de arquivo não permitido.'));
        }
    }
});
// GET /api/traducoes/orcamentos/pendentes
router.get('/orcamentos/pendentes', TraducoesController_1.default.getOrcamentos);
// POST /api/traducoes/orcamentos
router.post('/orcamentos', TraducoesController_1.default.responderOrcamento);
// GET /api/traducoes/orcamentos/documento/:documentoId
router.get('/orcamentos/documento/:documentoId', TraducoesController_1.default.getOrcamentoByDocumento);
// POST /api/traducoes/orcamentos/:id/aprovar
router.post('/orcamentos/:id/aprovar', TraducoesController_1.default.aprovarOrcamento);
// POST /api/traducoes/orcamentos/:id/aprovar-adm
router.post('/orcamentos/:id/aprovar-adm', TraducoesController_1.default.aprovarOrcamentoAdm);
// POST /api/traducoes/checkout/stripe
router.post('/checkout/stripe', TraducoesController_1.default.createCheckoutSession);
// GET /api/traducoes/fila - Translation work queue
router.get('/fila', TraducoesController_1.default.getFilaDeTrabalho);
// GET /api/traducoes/entregues - Delivered translations
router.get('/entregues', TraducoesController_1.default.getEntregues);
// POST /api/traducoes/submit - Submit translated document
router.post('/submit', upload.single('file'), TraducoesController_1.default.submitTraducao);
exports.default = router;
