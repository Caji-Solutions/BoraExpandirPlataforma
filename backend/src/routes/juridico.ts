import { Router, Request } from 'express'
import multer, { FileFilterCallback } from 'multer'
import JuridicoController from '../controllers/JuridicoController'

const juridico = Router()

// Configuração do multer para armazenar em memória (buffer)
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use PDF, JPG, PNG ou DOC.'))
    }
  }
})

// =============================================
// ROTAS DE FUNCIONÁRIOS
// =============================================

// Lista todos os funcionários do jurídico
juridico.get('/funcionarios', JuridicoController.getFuncionarios.bind(JuridicoController))

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

// Lista processos sem responsável (vagos)
juridico.get('/processos/vagos', JuridicoController.getProcessosVagos.bind(JuridicoController))

// Lista processos de um responsável específico
juridico.get('/processos/por-responsavel/:responsavelId', JuridicoController.getProcessosByResponsavel.bind(JuridicoController))

// Atualizar etapa do processo
juridico.patch('/processo/:processoId/etapa', JuridicoController.updateEtapaProcesso.bind(JuridicoController))

// Criar processo manualmente
juridico.post('/processo', JuridicoController.createProcess.bind(JuridicoController))

// =============================================
// ROTAS DE CLIENTES
// =============================================

// Lista todos os clientes com seus responsáveis
juridico.get('/clientes', JuridicoController.getAllClientes.bind(JuridicoController))

// Lista clientes sem responsável (vagos)
juridico.get('/clientes/vagos', JuridicoController.getClientesVagos.bind(JuridicoController))

// Lista clientes de um responsável específico
juridico.get('/clientes/por-responsavel/:responsavelId', JuridicoController.getClientesByResponsavel.bind(JuridicoController))

// Buscar cliente específico com dados do responsável
juridico.get('/cliente/:clienteId', JuridicoController.getClienteComResponsavel.bind(JuridicoController))

juridico.post('/atribuir-responsavel', JuridicoController.atribuirResponsavel.bind(JuridicoController))




// =============================================
// ROTAS DE SOLICITAÇÕES
// =============================================

juridico.post('/documentos/solicitar', JuridicoController.solicitarDocumento.bind(JuridicoController))
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

export default juridico


