import { Router } from 'express'
import ComercialController from '../controllers/ComercialController'
import upload from '../middlewares/upload'

const comercial = Router()


comercial.post('/agendamento', ComercialController.createAgendamento.bind(ComercialController))
comercial.get('/disponibilidade', ComercialController.checkDisponibilidade.bind(ComercialController))
comercial.get('/agendamentos/usuario/:usuarioId', ComercialController.getAgendamentosByUsuario.bind(ComercialController))
comercial.get('/agendamentos/:data', ComercialController.getAgendamentosByData.bind(ComercialController))
comercial.get('/agendamentos/cliente/:clienteId', ComercialController.getAgendamentosByCliente.bind(ComercialController))
comercial.get('/agendamentos', ComercialController.getAllAgendamentos.bind(ComercialController))
comercial.post('/agendamento/:id/confirmar-pix', ComercialController.confirmarPix.bind(ComercialController))
comercial.get('/agendamento/:id/status-formulario', ComercialController.verificarStatusFormulario.bind(ComercialController))
comercial.get('/agendamento/:id', ComercialController.getAgendamentoById.bind(ComercialController))
comercial.put('/agendamento/:id', ComercialController.updateAgendamento.bind(ComercialController))
comercial.post('/agendamento/:id/cancelar', ComercialController.cancelarAgendamento.bind(ComercialController))

// Contratos de serviços fixos
comercial.post('/contratos', ComercialController.createContratoServico.bind(ComercialController))
comercial.get('/contratos', ComercialController.getContratosServicos.bind(ComercialController))
comercial.get('/contratos/:id', ComercialController.getContratoServicoById.bind(ComercialController))
comercial.post('/contratos/:id/upload', upload.single('file'), ComercialController.uploadContratoAssinado.bind(ComercialController))
comercial.post('/contratos/:id/aprovar', ComercialController.aprovarContrato.bind(ComercialController))
comercial.post('/contratos/:id/recusar', ComercialController.recusarContrato.bind(ComercialController))
comercial.post('/contratos/:id/comprovante', upload.single('file'), ComercialController.uploadComprovanteContrato.bind(ComercialController))

// Draft flow endpoints
comercial.put('/contratos/:id/draft', ComercialController.updateContratoDraft.bind(ComercialController))
comercial.post('/contratos/:id/gerar-pdf', ComercialController.gerarContratoPdf.bind(ComercialController))
comercial.post('/contratos/:id/enviar-assinatura', ComercialController.enviarContratoAssinatura.bind(ComercialController))

export default comercial
