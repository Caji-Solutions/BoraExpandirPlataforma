"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ComercialController_1 = __importDefault(require("../controllers/ComercialController"));
const comercial = (0, express_1.Router)();
comercial.post('/agendamento', ComercialController_1.default.createAgendamento.bind(ComercialController_1.default));
comercial.post('/agendamento/mercadopago', ComercialController_1.default.createAgendamentoMercadoPago.bind(ComercialController_1.default));
comercial.post('/agendamento/stripe', ComercialController_1.default.createAgendamentoStripe.bind(ComercialController_1.default));
comercial.get('/disponibilidade', ComercialController_1.default.checkDisponibilidade.bind(ComercialController_1.default));
comercial.get('/agendamentos/usuario/:usuarioId', ComercialController_1.default.getAgendamentosByUsuario.bind(ComercialController_1.default));
comercial.get('/agendamentos/:data', ComercialController_1.default.getAgendamentosByData.bind(ComercialController_1.default));
comercial.get('/agendamentos/cliente/:clienteId', ComercialController_1.default.getAgendamentosByCliente.bind(ComercialController_1.default));
comercial.post('/agendamento/:id/checkout', ComercialController_1.default.regenerateCheckout.bind(ComercialController_1.default));
exports.default = comercial;
