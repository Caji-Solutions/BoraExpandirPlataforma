"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ParceiroController_1 = __importDefault(require("../controllers/ParceiroController"));
const parceiro = (0, express_1.Router)();
parceiro.post('/register', ParceiroController_1.default.register.bind(ParceiroController_1.default));
parceiro.get('/parceirobyid/:id', ParceiroController_1.default.getParceiroById.bind(ParceiroController_1.default));
parceiro.get('/clients/:id', ParceiroController_1.default.getClientsByParceiroId.bind(ParceiroController_1.default));
parceiro.get('/metrics/:id', ParceiroController_1.default.getMetrics.bind(ParceiroController_1.default));
exports.default = parceiro;
