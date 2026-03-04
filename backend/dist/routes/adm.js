"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdmController_1 = __importDefault(require("../controllers/AdmController"));
const router = (0, express_1.Router)();
// Rotas do Catálogo de Serviços
router.get('/catalog', AdmController_1.default.getCatalog);
router.post('/catalog', AdmController_1.default.createService);
router.patch('/catalog/:id', AdmController_1.default.updateService);
router.delete('/catalog/:id', AdmController_1.default.deleteService);
exports.default = router;
