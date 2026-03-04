"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const JuridicoController_1 = __importDefault(require("../controllers/JuridicoController"));
const juridico = (0, express_1.Router)();
// Configuração do multer para armazenar em memória (buffer)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Limite de 10MB
    },
    fileFilter: (_req, file, cb) => {
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
// =============================================
// ROTAS DE FUNCIONÁRIOS
// =============================================
// Lista todos os funcionários do jurídico
juridico.get('/funcionarios', JuridicoController_1.default.getFuncionarios.bind(JuridicoController_1.default));
// Buscar funcionário por ID
juridico.get('/funcionario/:funcionarioId', JuridicoController_1.default.getFuncionarioById.bind(JuridicoController_1.default));
// =============================================
// ROTAS DE PROCESSOS
// =============================================
// Lista todos os processos
juridico.get('/processos', JuridicoController_1.default.getProcessos.bind(JuridicoController_1.default));
juridico.get('/estatisticas', JuridicoController_1.default.getEstatisticas.bind(JuridicoController_1.default));
juridico.post('/assessoria', JuridicoController_1.default.createAssessoria.bind(JuridicoController_1.default));
juridico.get('/assessoria/:clienteId', JuridicoController_1.default.getLatestAssessoria.bind(JuridicoController_1.default));
juridico.get('/processo-cliente/:clienteId', JuridicoController_1.default.getProcessoByCliente.bind(JuridicoController_1.default));
// Lista processos sem responsável (vagos)
juridico.get('/processos/vagos', JuridicoController_1.default.getProcessosVagos.bind(JuridicoController_1.default));
// Lista processos de um responsável específico
juridico.get('/processos/por-responsavel/:responsavelId', JuridicoController_1.default.getProcessosByResponsavel.bind(JuridicoController_1.default));
// Atualizar etapa do processo
juridico.patch('/processo/:processoId/etapa', JuridicoController_1.default.updateEtapaProcesso.bind(JuridicoController_1.default));
// Criar processo manualmente
juridico.post('/processo', JuridicoController_1.default.createProcess.bind(JuridicoController_1.default));
// =============================================
// ROTAS DE CLIENTES
// =============================================
// Lista todos os clientes com seus responsáveis
juridico.get('/clientes', JuridicoController_1.default.getAllClientes.bind(JuridicoController_1.default));
// Lista clientes sem responsável (vagos)
juridico.get('/clientes/vagos', JuridicoController_1.default.getClientesVagos.bind(JuridicoController_1.default));
// Lista clientes de um responsável específico
juridico.get('/clientes/por-responsavel/:responsavelId', JuridicoController_1.default.getClientesByResponsavel.bind(JuridicoController_1.default));
// Buscar cliente específico com dados do responsável
juridico.get('/cliente/:clienteId', JuridicoController_1.default.getClienteComResponsavel.bind(JuridicoController_1.default));
juridico.post('/atribuir-responsavel', JuridicoController_1.default.atribuirResponsavel.bind(JuridicoController_1.default));
juridico.get('/agendamentos/delegacao', JuridicoController_1.default.getAgendamentosDelegacao.bind(JuridicoController_1.default));
juridico.post('/atribuir-responsavel-agendamento', JuridicoController_1.default.atribuirResponsavelAgendamento.bind(JuridicoController_1.default));
// =============================================
// ROTAS DE SOLICITAÇÕES
// =============================================
juridico.post('/documentos/solicitar', JuridicoController_1.default.solicitarDocumento.bind(JuridicoController_1.default));
juridico.post('/requerimentos/solicitar', upload.array('files'), JuridicoController_1.default.solicitarRequerimento.bind(JuridicoController_1.default));
// =============================================
// ROTAS DE FORMULÁRIOS DO JURÍDICO (enviados para clientes)
// =============================================
// Upload documento do jurídico para cliente
juridico.post('/formularios', upload.single('file'), JuridicoController_1.default.uploadFormularioJuridico.bind(JuridicoController_1.default));
// Buscar documentos enviados para um cliente
juridico.get('/formularios/:clienteId', JuridicoController_1.default.getFormulariosJuridico.bind(JuridicoController_1.default));
// Buscar formulários com status de resposta (waiting/received)
juridico.get('/formularios-status/:clienteId/:membroId?', JuridicoController_1.default.getFormulariosComRespostas.bind(JuridicoController_1.default));
// Deletar documento
juridico.delete('/formularios/:formularioId', JuridicoController_1.default.deleteFormularioJuridico.bind(JuridicoController_1.default));
// Atualizar status do formulário do cliente (aprovar/rejeitar)
juridico.patch('/formulario-cliente/:id/status', JuridicoController_1.default.updateFormularioClienteStatus.bind(JuridicoController_1.default));
// =============================================
// ROTAS DE NOTAS DO JURÍDICO
// =============================================
// Criar nota
juridico.post('/notas', JuridicoController_1.default.createNote.bind(JuridicoController_1.default));
// Buscar notas de um cliente
juridico.get('/notas/:clienteId', JuridicoController_1.default.getNotes.bind(JuridicoController_1.default));
// Deletar nota
juridico.delete('/notas/:noteId', JuridicoController_1.default.deleteNote.bind(JuridicoController_1.default));
exports.default = juridico;
