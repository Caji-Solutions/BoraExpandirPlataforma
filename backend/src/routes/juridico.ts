import { Router } from 'express'
import JuridicoController from '../controllers/juridico/JuridicoController'
import { authMiddleware } from '../middlewares/auth'
import upload from '../middlewares/upload'

const juridico = Router()

// Todas as rotas do jurídico requerem autenticação
juridico.use(authMiddleware)


// =============================================
// ROTAS DE FUNCIONÁRIOS
// =============================================

// Lista todos os funcionários do jurídico
juridico.get('/funcionarios', JuridicoController.getFuncionarios.bind(JuridicoController))

// Lista usuários comerciais nível C2
juridico.get('/usuarios-comerciais-c2', JuridicoController.getUsuariosComerciaisC2.bind(JuridicoController))

// Buscar funcionário por ID
juridico.get('/funcionario/:funcionarioId', JuridicoController.getFuncionarioById.bind(JuridicoController))

// =============================================
// ROTAS DE PROCESSOS
// =============================================

// Lista todos os processos
juridico.get('/processos', JuridicoController.getProcessos.bind(JuridicoController))
juridico.get('/estatisticas', JuridicoController.getEstatisticas.bind(JuridicoController))
juridico.post('/assessoria', JuridicoController.createAssessoria.bind(JuridicoController))
juridico.get('/assessoria/:clienteId', JuridicoController.getLatestAssessoria.bind(JuridicoController))
juridico.get('/processo-cliente/:clienteId', JuridicoController.getProcessoByCliente.bind(JuridicoController))
juridico.get('/processo/:processoId', JuridicoController.getProcessoById.bind(JuridicoController))

// Lista processos sem responsável (vagos)
juridico.get('/processos/vagos', JuridicoController.getProcessosVagos.bind(JuridicoController))

// Lista processos de um responsável específico
juridico.get('/processos/por-responsavel/:responsavelId', JuridicoController.getProcessosByResponsavel.bind(JuridicoController))

// Lista assessorias de um responsável específico
juridico.get('/assessorias/por-responsavel/:responsavelId', JuridicoController.getAssessoriasByResponsavel.bind(JuridicoController))

// Lista agendamentos de um responsável específico
juridico.get('/agendamentos/por-responsavel/:responsavelId', JuridicoController.getAgendamentosByResponsavel.bind(JuridicoController))

// Atualizar etapa do processo
juridico.patch('/processo/:processoId/etapa', JuridicoController.updateEtapaProcesso.bind(JuridicoController))

// Criar processo manualmente
juridico.post('/processo', JuridicoController.createProcess.bind(JuridicoController))

// =============================================
// ROTAS DE CLIENTES
// =============================================

// Lista todos os clientes com seus responsáveis
juridico.get('/clientes', JuridicoController.getAllClientes.bind(JuridicoController))
juridico.get('/subservicos', JuridicoController.getSubservices.bind(JuridicoController))

// Lista clientes sem responsável (vagos)
juridico.get('/clientes/vagos', JuridicoController.getClientesVagos.bind(JuridicoController))

// Lista clientes de um responsável específico
juridico.get('/clientes/por-responsavel/:responsavelId', JuridicoController.getClientesByResponsavel.bind(JuridicoController))

// Buscar cliente específico com dados do responsável
juridico.get('/cliente/:clienteId', JuridicoController.getClienteComResponsavel.bind(JuridicoController))

juridico.post('/atribuir-responsavel', JuridicoController.atribuirResponsavel.bind(JuridicoController))

juridico.post('/atribuir-responsavel-agendamento', JuridicoController.atribuirResponsavelAgendamento.bind(JuridicoController))
juridico.get('/formulario-preenchido/:clienteId', JuridicoController.verificarFormularioPreenchido.bind(JuridicoController))
juridico.post('/agendamentos/pedido-reagendamento', JuridicoController.pedidoReagendamento.bind(JuridicoController))
juridico.post('/agendamentos/:id/em-andamento', JuridicoController.marcarConsultoriaEmAndamento.bind(JuridicoController))
juridico.post('/agendamentos/:id/assessoria-em-andamento', JuridicoController.marcarAssessoriaEmAndamento.bind(JuridicoController))
juridico.post('/agendamentos/:id/assessoria-realizada', JuridicoController.marcarAssessoriaRealizada.bind(JuridicoController))
juridico.post('/agendamentos/:id/realizada', JuridicoController.marcarConsultoriaRealizada.bind(JuridicoController))
juridico.post('/cliente/:clienteId/finalizar-assessoria', JuridicoController.finalizarAssessoriaByCliente.bind(JuridicoController))




// =============================================
// ROTAS DE SOLICITAÇÕES
// =============================================

juridico.post('/documentos/solicitar', JuridicoController.solicitarDocumento.bind(JuridicoController))
juridico.get('/requerimentos', JuridicoController.getRequerimentos.bind(JuridicoController))
juridico.post('/requerimentos/solicitar', upload.array('files'), JuridicoController.solicitarRequerimento.bind(JuridicoController))

// =============================================
// ROTAS DE FORMULÁRIOS DO JURÍDICO (enviados para clientes)
// =============================================

// Upload documento do jurídico para cliente
juridico.post('/formularios', upload.single('file'), JuridicoController.uploadFormularioJuridico.bind(JuridicoController))

// Buscar documentos enviados para um cliente
juridico.get('/formularios/:clienteId', JuridicoController.getFormulariosJuridico.bind(JuridicoController))

// Buscar formulários com status de resposta (waiting/received)
juridico.get('/formularios-status/:clienteId/:membroId?', JuridicoController.getFormulariosComRespostas.bind(JuridicoController))

// Deletar documento
juridico.delete('/formularios/:formularioId', JuridicoController.deleteFormularioJuridico.bind(JuridicoController))

// Atualizar status do formulário do cliente (aprovar/rejeitar)
juridico.patch('/formulario-cliente/:id/status', JuridicoController.updateFormularioClienteStatus.bind(JuridicoController))

// =============================================
// ROTAS DE NOTAS DO JURÍDICO
// =============================================

// Criar nota
juridico.post('/notas', JuridicoController.createNote.bind(JuridicoController))

// Buscar notas de um cliente
juridico.get('/notas/:clienteId', JuridicoController.getNotes.bind(JuridicoController))

// Deletar nota
juridico.delete('/notas/:noteId', JuridicoController.deleteNote.bind(JuridicoController))

// =============================================
// ROTAS DE VALIDACAO DE CONTRATOS
// =============================================
juridico.post('/contratos/:id/invalidar', JuridicoController.invalidarContrato.bind(JuridicoController))

// =============================================
// ROTAS DE PROTOCOLAÇÃO
// =============================================

// Lista supervisores do jurídico
juridico.get('/supervisores', JuridicoController.getSupervisores.bind(JuridicoController))

// Lista processos protocolados (supervisor only)
juridico.get('/processos-protocolados', JuridicoController.getProcessosProtocolados.bind(JuridicoController))

// Detalhes de um processo protocolado
juridico.get('/processo/:id/protocolado', JuridicoController.getProcessoProtocoladoDetails.bind(JuridicoController))

// Enviar processo para protocolação
juridico.post('/processo/:id/enviar-protocolacao', JuridicoController.enviarParaProtocolacao.bind(JuridicoController))

// Atualizar detalhes da protocolação
juridico.put('/processo/:id/atualizar-protocolo', JuridicoController.atualizarProtocolo.bind(JuridicoController))

export default juridico


