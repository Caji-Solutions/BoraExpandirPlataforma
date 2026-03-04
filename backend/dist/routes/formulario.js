"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const FormularioController_1 = __importDefault(require("../controllers/FormularioController"));
const formulario = (0, express_1.Router)();
// Configuração do multer para upload de comprovante em memória
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG, WebP ou PDF.'));
        }
    }
});
// POST /formulario/consultoria — Formulário público de consultoria
formulario.post('/consultoria', FormularioController_1.default.submitConsultoria.bind(FormularioController_1.default));
// POST /formulario/comprovante — Upload de comprovante PIX
formulario.post('/comprovante', upload.single('comprovante'), FormularioController_1.default.uploadComprovante.bind(FormularioController_1.default));
exports.default = formulario;
