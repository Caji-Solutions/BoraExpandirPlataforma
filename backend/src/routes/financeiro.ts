import { Router } from 'express'
import FinanceiroController from '../controllers/financeiro/FinanceiroController'

const financeiro = Router()

// GET /financeiro/comprovantes/pendentes — Lista comprovantes aguardando verificação
financeiro.get('/comprovantes/pendentes', FinanceiroController.getComprovantesPendentes.bind(FinanceiroController))

// POST /financeiro/comprovante/:id/aprovar — Aprova comprovante e dispara SMTP
financeiro.post('/comprovante/:id/aprovar', FinanceiroController.aprovarComprovante.bind(FinanceiroController))

// POST /financeiro/comprovante/:id/recusar — Recusa comprovante com nota
financeiro.post('/comprovante/:id/recusar', FinanceiroController.recusarComprovante.bind(FinanceiroController))


// Contratos fixos: comprovantes de pagamento
financeiro.get('/contratos/comprovantes/pendentes', FinanceiroController.getComprovantesContratosPendentes.bind(FinanceiroController))
financeiro.post('/contratos/comprovante/:id/aprovar', FinanceiroController.aprovarComprovanteContrato.bind(FinanceiroController))
financeiro.post('/contratos/comprovante/:id/recusar', FinanceiroController.recusarComprovanteContrato.bind(FinanceiroController))

// ROTAS PARA TRADUÇÕES
// POST /financeiro/traducao/comprovante/:id/aprovar — Aprova comprovante de tradução
financeiro.post('/traducao/comprovante/:id/aprovar', FinanceiroController.aprovarComprovanteTraducao.bind(FinanceiroController))

// POST /financeiro/traducao/comprovante/:id/recusar — Recusa comprovante de tradução com nota
financeiro.post('/traducao/comprovante/:id/recusar', FinanceiroController.recusarComprovanteTraducao.bind(FinanceiroController))


// ROTAS PARA MULTAS DE CONTRATOS
financeiro.post('/contratos/:id/multa', FinanceiroController.registrarMulta.bind(FinanceiroController))
financeiro.post('/contratos/:id/multa/aprovar', FinanceiroController.aprovarComprovanteMulta.bind(FinanceiroController))

export default financeiro
