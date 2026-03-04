"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const ClienteController_1 = __importDefault(require("../controllers/ClienteController"));
const cliente = (0, express_1.Router)();
// Configuração do multer para armazenar em memória (buffer)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Limite de 10MB
    },
    fileFilter: (_req, file, cb) => {
        // Tipos de arquivo permitidos
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de arquivo não permitido. Use PDF, JPG, PNG ou DOC.'));
        }
    }
});
cliente.post('/register', ClienteController_1.default.register.bind(ClienteController_1.default));
cliente.post('/register-lead', ClienteController_1.default.registerLead.bind(ClienteController_1.default));
cliente.post('/attstatusbywpp', ClienteController_1.default.AttStatusClientebyWpp.bind(ClienteController_1.default));
cliente.post('/uploadDoc', upload.single('file'), ClienteController_1.default.uploadDoc.bind(ClienteController_1.default));
cliente.post('/profile-photo', upload.single('file'), ClienteController_1.default.uploadProfilePhoto.bind(ClienteController_1.default));
cliente.get('/clientesbyparceiro/:parceiroId', ClienteController_1.default.getByParceiro.bind(ClienteController_1.default));
cliente.get('/clientes', ClienteController_1.default.getAllClientes.bind(ClienteController_1.default));
cliente.get('/credentials/:email', ClienteController_1.default.getClienteCredentials.bind(ClienteController_1.default));
// Rotas de documentos
cliente.get('/:clienteId', ClienteController_1.default.getCliente.bind(ClienteController_1.default));
cliente.get('/:clienteId/documentos-requeridos', ClienteController_1.default.getDocumentosRequeridos.bind(ClienteController_1.default));
cliente.get('/:clienteId/dependentes', ClienteController_1.default.getDependentes.bind(ClienteController_1.default));
cliente.post('/:clienteId/dependentes', ClienteController_1.default.createDependent.bind(ClienteController_1.default));
cliente.get('/:clienteId/processos', ClienteController_1.default.getProcessos.bind(ClienteController_1.default));
cliente.get('/:clienteId/documentos', ClienteController_1.default.getDocumentos.bind(ClienteController_1.default));
cliente.get('/processo/:processoId/documentos', ClienteController_1.default.getDocumentosByProcesso.bind(ClienteController_1.default));
cliente.delete('/documento/:documentoId', ClienteController_1.default.deleteDocumento.bind(ClienteController_1.default));
cliente.patch('/documento/:documentoId/status', ClienteController_1.default.updateDocumentoStatus.bind(ClienteController_1.default));
// Formulários e Declarações Routes
cliente.get('/processo/:processoId/formularios', ClienteController_1.default.getFormularios.bind(ClienteController_1.default));
cliente.get('/processo/:processoId/formularios/:memberId', ClienteController_1.default.getFormularios.bind(ClienteController_1.default));
cliente.post('/processo/:processoId/formularios', upload.single('file'), ClienteController_1.default.uploadFormulario.bind(ClienteController_1.default));
cliente.delete('/processo/:processoId/formularios/:formularioId', ClienteController_1.default.deleteFormulario.bind(ClienteController_1.default));
// Client Form Response Route
cliente.post('/formularios/:formularioId/response', upload.single('file'), ClienteController_1.default.uploadFormularioResponse.bind(ClienteController_1.default));
cliente.get('/:clienteId/formulario-responses', ClienteController_1.default.getFormularioResponses.bind(ClienteController_1.default));
cliente.get('/:clienteId/notificacoes', ClienteController_1.default.getNotificacoes.bind(ClienteController_1.default));
cliente.patch('/notificacoes/:notificacaoId/status', ClienteController_1.default.updateNotificacaoStatus.bind(ClienteController_1.default));
cliente.post('/:clienteId/notificacoes/read-all', ClienteController_1.default.markAllNotificacoesAsRead.bind(ClienteController_1.default));
cliente.get('/:clienteId/requerimentos', ClienteController_1.default.getRequerimentosByCliente.bind(ClienteController_1.default));
exports.default = cliente;
