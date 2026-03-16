import { Router, Request } from 'express'
import multer, { FileFilterCallback } from 'multer'
import ComercialController from '../controllers/ComercialController'


const comercial = Router()

// ConfiguraÃ§Ã£o do multer para armazenar em memÃ³ria (buffer)
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
      cb(new Error('Tipo de arquivo nÃ£o permitido. Use PDF, JPG, PNG ou DOC.'))
    }
  }
})


comercial.post('/agendamento', ComercialController.createAgendamento.bind(ComercialController))
comercial.post('/agendamento/mercadopago', ComercialController.createAgendamentoMercadoPago.bind(ComercialController))
comercial.post('/agendamento/stripe', ComercialController.createAgendamentoStripe.bind(ComercialController))
comercial.get('/disponibilidade', ComercialController.checkDisponibilidade.bind(ComercialController))
comercial.get('/agendamentos/usuario/:usuarioId', ComercialController.getAgendamentosByUsuario.bind(ComercialController))
comercial.get('/agendamentos/:data', ComercialController.getAgendamentosByData.bind(ComercialController))
comercial.get('/agendamentos/cliente/:clienteId', ComercialController.getAgendamentosByCliente.bind(ComercialController))
comercial.post('/agendamento/:id/checkout', ComercialController.regenerateCheckout.bind(ComercialController))
comercial.get('/agendamentos', ComercialController.getAllAgendamentos.bind(ComercialController))
comercial.post('/agendamento/:id/confirmar-pix', ComercialController.confirmarPix.bind(ComercialController))
comercial.get('/agendamento/:id/status-formulario', ComercialController.verificarStatusFormulario.bind(ComercialController))
comercial.get('/agendamento/:id', ComercialController.getAgendamentoById.bind(ComercialController))
comercial.put('/agendamento/:id', ComercialController.updateAgendamento.bind(ComercialController))
comercial.post('/agendamento/:id/cancelar', ComercialController.cancelarAgendamento.bind(ComercialController))

// Contratos de serviÃ§os fixos
comercial.post('/contratos', ComercialController.createContratoServico.bind(ComercialController))
comercial.get('/contratos', ComercialController.getContratosServicos.bind(ComercialController))
comercial.get('/contratos/:id', ComercialController.getContratoServicoById.bind(ComercialController))
comercial.post('/contratos/:id/upload', upload.single('file'), ComercialController.uploadContratoAssinado.bind(ComercialController))
comercial.post('/contratos/:id/aprovar', ComercialController.aprovarContrato.bind(ComercialController))
comercial.post('/contratos/:id/recusar', ComercialController.recusarContrato.bind(ComercialController))
comercial.post('/contratos/:id/comprovante', upload.single('file'), ComercialController.uploadComprovanteContrato.bind(ComercialController))

export default comercial
