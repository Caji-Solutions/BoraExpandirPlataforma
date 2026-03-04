"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ApostilamentoController_1 = __importDefault(require("../controllers/ApostilamentoController"));
const router = (0, express_1.Router)();
// POST /apostilamentos/solicitar - Solicitar apostilamento
router.post('/solicitar', ApostilamentoController_1.default.solicitar);
// PATCH /apostilamentos/:id/status - Atualizar status
router.patch('/:id/status', ApostilamentoController_1.default.updateStatus);
// GET /apostilamentos - Listar todos
router.get('/', ApostilamentoController_1.default.getAll);
exports.default = router;
