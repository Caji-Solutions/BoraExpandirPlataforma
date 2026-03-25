import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'
import ClienteProfileController from '../controllers/cliente/ClienteProfileController'
import ClienteDocumentController from '../controllers/cliente/ClienteDocumentController'
import ClienteFormulariosController from '../controllers/cliente/ClienteFormulariosController'
import ClienteNotificationController from '../controllers/cliente/ClienteNotificationController'
import ClienteContratosController from '../controllers/cliente/ClienteContratosController'
import ClienteRequerimentosController from '../controllers/cliente/ClienteRequerimentosController'
import ClienteController from '../controllers/cliente/ClienteController'
import upload from '../middlewares/upload'

const cliente = Router()

// Public Routes (sem autenticação)
cliente.post('/register', ClienteProfileController.register.bind(ClienteProfileController))
cliente.post('/register-lead', ClienteProfileController.registerLead.bind(ClienteProfileController))

// Aplicar autenticação para todas as rotas abaixo
cliente.use(authMiddleware)

// Protected Routes (com autenticação)
cliente.post('/attstatusbywpp', ClienteProfileController.AttStatusClientebyWpp.bind(ClienteProfileController))
cliente.post('/profile-photo', upload.single('file'), ClienteProfileController.uploadProfilePhoto.bind(ClienteProfileController))
cliente.get('/clientesbyparceiro/:parceiroId', ClienteProfileController.getByParceiro.bind(ClienteProfileController))
cliente.get('/clientes', ClienteProfileController.getAllClientes.bind(ClienteProfileController))
cliente.get('/credentials/:email', ClienteController.getClienteCredentials.bind(ClienteController))
cliente.get('/by-user/:userId', ClienteProfileController.getClienteByUserId.bind(ClienteProfileController))
cliente.get('/:clienteId/dna', ClienteProfileController.getDNA.bind(ClienteProfileController))
cliente.get('/:clienteId', ClienteProfileController.getCliente.bind(ClienteProfileController))
cliente.get('/:clienteId/dependentes', ClienteProfileController.getDependentes.bind(ClienteProfileController))
cliente.post('/:clienteId/dependentes', ClienteProfileController.createDependent.bind(ClienteProfileController))

// Document Routes
cliente.post('/uploadDoc', upload.single('file'), ClienteDocumentController.uploadDoc.bind(ClienteDocumentController))
cliente.get('/:clienteId/documentos-requeridos', ClienteDocumentController.getDocumentosRequeridos.bind(ClienteDocumentController))
cliente.get('/:clienteId/processos', ClienteDocumentController.getProcessos.bind(ClienteDocumentController))
cliente.get('/:clienteId/documentos', ClienteDocumentController.getDocumentos.bind(ClienteDocumentController))
cliente.get('/processo/:processoId/documentos', ClienteDocumentController.getDocumentosByProcesso.bind(ClienteDocumentController))
cliente.delete('/documento/:documentoId', ClienteDocumentController.deleteDocumento.bind(ClienteDocumentController))
cliente.patch('/documento/:documentoId/status', ClienteDocumentController.updateDocumentoStatus.bind(ClienteDocumentController))

// Formulários Routes
cliente.get('/processo/:processoId/formularios', ClienteFormulariosController.getFormularios.bind(ClienteFormulariosController))
cliente.get('/processo/:processoId/formularios/:memberId', ClienteFormulariosController.getFormularios.bind(ClienteFormulariosController))
cliente.post('/processo/:processoId/formularios', upload.single('file'), ClienteFormulariosController.uploadFormulario.bind(ClienteFormulariosController))
cliente.delete('/processo/:processoId/formularios/:formularioId', ClienteFormulariosController.deleteFormulario.bind(ClienteFormulariosController))
cliente.post('/formularios/:formularioId/response', upload.single('file'), ClienteFormulariosController.uploadFormularioResponse.bind(ClienteFormulariosController))
cliente.get('/:clienteId/formulario-responses', ClienteFormulariosController.getFormularioResponses.bind(ClienteFormulariosController))

// Notificações Routes
cliente.get('/:clienteId/notificacoes', ClienteNotificationController.getNotificacoes.bind(ClienteNotificationController))
cliente.patch('/notificacoes/:notificacaoId/status', ClienteNotificationController.updateNotificacaoStatus.bind(ClienteNotificationController))
cliente.post('/:clienteId/notificacoes/read-all', ClienteNotificationController.markAllNotificacoesAsRead.bind(ClienteNotificationController))

// Requerimentos Routes
cliente.get('/:clienteId/requerimentos', ClienteRequerimentosController.getRequerimentosByCliente.bind(ClienteRequerimentosController))

// Contratos Routes
cliente.get('/contratos', ClienteContratosController.getContratos.bind(ClienteContratosController))
cliente.post('/contratos/:id/upload', upload.single('file'), ClienteContratosController.uploadContratoAssinado.bind(ClienteContratosController))
cliente.post('/contratos/:id/comprovante', upload.single('file'), ClienteController.uploadComprovanteContrato.bind(ClienteController))

// Fuso horário (mantido no original)
cliente.post('/timezone', ClienteController.saveTimezone.bind(ClienteController))

// Notas de Lead (mantido no original)
cliente.post('/lead-notas', ClienteController.createLeadNote.bind(ClienteController))
cliente.get('/lead-notas/:leadId', ClienteController.getLeadNotes.bind(ClienteController))
cliente.delete('/lead-notas/:noteId', ClienteController.deleteLeadNote.bind(ClienteController))

export default cliente

