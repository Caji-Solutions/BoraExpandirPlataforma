import { Router } from 'express'
import ComercialController from '../controllers/comercial/ComercialController'
import ComissaoController from '../controllers/comercial/ComissaoController'
import { authMiddleware } from '../middlewares/auth'
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
comercial.get('/contratos', authMiddleware, ComercialController.getContratosServicos.bind(ComercialController))
comercial.get('/contratos/:id', authMiddleware, ComercialController.getContratoServicoById.bind(ComercialController))
comercial.post('/contratos/:id/upload', upload.single('file'), ComercialController.uploadContratoAssinado.bind(ComercialController))
comercial.post('/contratos/:id/aprovar', ComercialController.aprovarContrato.bind(ComercialController))
comercial.post('/contratos/:id/recusar', ComercialController.recusarContrato.bind(ComercialController))
comercial.post('/contratos/:id/comprovante', upload.single('file'), ComercialController.uploadComprovanteContrato.bind(ComercialController))

// Draft flow endpoints
comercial.put('/contratos/:id/draft', ComercialController.updateContratoDraft.bind(ComercialController))
comercial.post('/contratos/:id/gerar-pdf', ComercialController.gerarContratoPdf.bind(ComercialController))
comercial.post('/contratos/:id/enviar-assinatura', ComercialController.enviarContratoAssinatura.bind(ComercialController))

// Cancelamento de contrato
comercial.post('/contratos/:id/cancelar', authMiddleware, ComercialController.cancelarContrato.bind(ComercialController))

// Apagar contrato (delete fisico — apenas quando nao foi enviado para assinatura)
comercial.delete('/contratos/:id', authMiddleware, ComercialController.apagarContrato.bind(ComercialController))

// Upload comprovante de multa
comercial.post('/contratos/:id/multa/comprovante', authMiddleware, upload.single('file'), ComercialController.uploadComprovanteMulta.bind(ComercialController))

// Contagem de consultorias realizadas por cliente (para desconto)
comercial.get('/consultorias-count/:clienteId', ComercialController.getConsultoriasCount.bind(ComercialController))

// Pos-Consultoria (clientes delegados ao vendedor C2)
comercial.get('/pos-consultoria', authMiddleware, ComercialController.getPosConsultoria.bind(ComercialController))

// Comissoes (requer autenticacao)
comercial.get('/comissao/calcular', authMiddleware, ComissaoController.calcularMinhaComissao.bind(ComissaoController))
comercial.get('/comissao/historico', authMiddleware, ComissaoController.getHistoricoComissao.bind(ComissaoController))
comercial.get('/comissao/cotacao', ComissaoController.getCotacao.bind(ComissaoController))
comercial.get('/comissao/relatorio', authMiddleware, ComissaoController.getRelatorioComissoes.bind(ComissaoController))

export default comercial
