import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'
import ClienteProfileController from '../controllers/cliente/ClienteProfileController'
import ClienteDocumentController from '../controllers/cliente/ClienteDocumentController'
import ClienteFormulariosController from '../controllers/cliente/ClienteFormulariosController'
import ClienteNotificationController from '../controllers/cliente/ClienteNotificationController'
import ClienteContratosController from '../controllers/cliente/ClienteContratosController'
import ClienteRequerimentosController from '../controllers/cliente/ClienteRequerimentosController'
import ClientePagamentoController from '../controllers/cliente/ClientePagamentoController'
import ClienteController from '../controllers/cliente/ClienteController'
import ParceiroTermoController from '../controllers/cliente/ParceiroTermoController'
import upload from '../middlewares/upload'

const cliente = Router()

// Public Routes (sem autenticação)
cliente.post('/register', ClienteProfileController.register.bind(ClienteProfileController))
cliente.post('/register-lead', ClienteProfileController.registerLead.bind(ClienteProfileController))

// Aplicar autenticação para todas as rotas abaixo
cliente.use(authMiddleware)

// Protected Routes (com autenticação)

// Rotas específicas (sem parâmetros de clienteId) - DEVEM VIR ANTES de /:clienteId
cliente.get('/clientes', ClienteProfileController.getAllClientes.bind(ClienteProfileController))
cliente.get('/by-user/:userId', ClienteProfileController.getClienteByUserId.bind(ClienteProfileController))
cliente.get('/clientesbyparceiro/:parceiroId', ClienteProfileController.getByParceiro.bind(ClienteProfileController))
cliente.get('/credentials/:email', ClienteController.getClienteCredentials.bind(ClienteController))
cliente.get('/contratos', ClienteContratosController.getContratos.bind(ClienteContratosController))
cliente.post('/attstatusbywpp', ClienteProfileController.AttStatusClientebyWpp.bind(ClienteProfileController))
cliente.post('/profile-photo', upload.single('file'), ClienteProfileController.uploadProfilePhoto.bind(ClienteProfileController))
cliente.post('/uploadDoc', upload.single('file'), ClienteDocumentController.uploadDoc.bind(ClienteDocumentController))
cliente.post('/become-lead', ClienteProfileController.becomeLead.bind(ClienteProfileController))
cliente.post('/timezone', ClienteController.saveTimezone.bind(ClienteController))
cliente.post('/lead-notas', ClienteController.createLeadNote.bind(ClienteController))
cliente.post('/contratos/:id/upload', upload.single('file'), ClienteContratosController.uploadContratoAssinado.bind(ClienteContratosController))
cliente.post('/contratos/:id/comprovante', upload.single('file'), ClienteController.uploadComprovanteContrato.bind(ClienteController))
cliente.get('/pagamentos-lock', ClienteController.getPagamentoLockStatus.bind(ClienteController))
cliente.post('/parcelas/:id/comprovante', upload.single('file'), ClienteController.uploadComprovanteParcela.bind(ClienteController))

// Rotas de Processo (específicas)
cliente.get('/processo/:processoId/documentos', ClienteDocumentController.getDocumentosByProcesso.bind(ClienteDocumentController))
cliente.get('/processo/:processoId/formularios', ClienteFormulariosController.getFormularios.bind(ClienteFormulariosController))
cliente.get('/processo/:processoId/formularios/:memberId', ClienteFormulariosController.getFormularios.bind(ClienteFormulariosController))
cliente.post('/processo/:processoId/formularios', upload.single('file'), ClienteFormulariosController.uploadFormulario.bind(ClienteFormulariosController))
cliente.delete('/processo/:processoId/formularios/:formularioId', ClienteFormulariosController.deleteFormulario.bind(ClienteFormulariosController))

// Rotas de Documentos e Formulários (específicas)
cliente.delete('/documento/:documentoId', ClienteDocumentController.deleteDocumento.bind(ClienteDocumentController))
cliente.patch('/documento/:documentoId/status', ClienteDocumentController.updateDocumentoStatus.bind(ClienteDocumentController))
cliente.post('/documento/:documentoId/upload-admin', upload.single('file'), ClienteDocumentController.uploadAdminDocument.bind(ClienteDocumentController))
cliente.post('/formularios/:formularioId/response', upload.single('file'), ClienteFormulariosController.uploadFormularioResponse.bind(ClienteFormulariosController))

// Rotas de Notificações (específicas)
cliente.patch('/notificacoes/:notificacaoId/status', ClienteNotificationController.updateNotificacaoStatus.bind(ClienteNotificationController))

// Rotas de Lead Notes (específicas)
cliente.get('/lead-notas/:leadId', ClienteController.getLeadNotes.bind(ClienteController))
cliente.delete('/lead-notas/:noteId', ClienteController.deleteLeadNote.bind(ClienteController))

// Rotas de Parceiro: Termo de Aceite (específicas)
cliente.get('/parceiro/termo-status/:clienteId', ParceiroTermoController.getTermoStatus.bind(ParceiroTermoController))
cliente.post('/parceiro/termo-aceitar', ParceiroTermoController.aceitarTermo.bind(ParceiroTermoController))

// Rotas parametrizadas por clienteId - DEVEM VIR DEPOIS das rotas específicas
cliente.get('/:clienteId', ClienteProfileController.getCliente.bind(ClienteProfileController))
cliente.get('/:clienteId/dna', ClienteProfileController.getDNA.bind(ClienteProfileController))
cliente.get('/:clienteId/dependentes', ClienteProfileController.getDependentes.bind(ClienteProfileController))
cliente.post('/:clienteId/dependentes', ClienteProfileController.createDependent.bind(ClienteProfileController))
cliente.get('/:clienteId/documentos-requeridos', ClienteDocumentController.getDocumentosRequeridos.bind(ClienteDocumentController))
cliente.get('/:clienteId/processos', ClienteDocumentController.getProcessos.bind(ClienteDocumentController))
cliente.get('/:clienteId/documentos', ClienteDocumentController.getDocumentos.bind(ClienteDocumentController))
cliente.get('/:clienteId/formulario-responses', ClienteFormulariosController.getFormularioResponses.bind(ClienteFormulariosController))
cliente.get('/:clienteId/notificacoes', ClienteNotificationController.getNotificacoes.bind(ClienteNotificationController))
cliente.post('/:clienteId/notificacoes/read-all', ClienteNotificationController.markAllNotificacoesAsRead.bind(ClienteNotificationController))
cliente.get('/:clienteId/requerimentos', ClienteRequerimentosController.getRequerimentosByCliente.bind(ClienteRequerimentosController))
cliente.get('/:clienteId/pagamentos', ClientePagamentoController.getPagamentos.bind(ClientePagamentoController))
cliente.post('/pagamentos/:id/comprovante', upload.single('file'), ClientePagamentoController.uploadComprovante.bind(ClientePagamentoController))

export default cliente

