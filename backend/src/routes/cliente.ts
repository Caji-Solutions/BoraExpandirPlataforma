import { Router, Request } from 'express'
import multer, { FileFilterCallback } from 'multer'
import ClienteController from '../controllers/ClienteController'

const cliente = Router()

// Configuração do multer para armazenar em memória (buffer)
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Tipos de arquivo permitidos
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

cliente.post('/register', ClienteController.register.bind(ClienteController))
cliente.post('/attstatusbywpp', ClienteController.AttStatusClientebyWpp.bind(ClienteController))
cliente.post('/uploadDoc', upload.single('file'), ClienteController.uploadDoc.bind(ClienteController))

cliente.get('/clientesbyparceiro/:parceiroId', ClienteController.getByParceiro.bind(ClienteController))

// Rotas de documentos
cliente.get('/:clienteId/documentos-requeridos', ClienteController.getDocumentosRequeridos.bind(ClienteController))
cliente.get('/:clienteId/dependentes', ClienteController.getDependentes.bind(ClienteController))
cliente.get('/:clienteId/processos', ClienteController.getProcessos.bind(ClienteController))
cliente.get('/:clienteId/documentos', ClienteController.getDocumentos.bind(ClienteController))
cliente.get('/processo/:processoId/documentos', ClienteController.getDocumentosByProcesso.bind(ClienteController))
cliente.delete('/documento/:documentoId', ClienteController.deleteDocumento.bind(ClienteController))
cliente.patch('/documento/:documentoId/status', ClienteController.updateDocumentoStatus.bind(ClienteController))

// Formulários e Declarações Routes
cliente.get('/processo/:processoId/formularios', ClienteController.getFormularios.bind(ClienteController))
cliente.get('/processo/:processoId/formularios/:memberId', ClienteController.getFormularios.bind(ClienteController))
cliente.post('/processo/:processoId/formularios', upload.single('file'), ClienteController.uploadFormulario.bind(ClienteController))
cliente.delete('/processo/:processoId/formularios/:formularioId', ClienteController.deleteFormulario.bind(ClienteController))

export default cliente
