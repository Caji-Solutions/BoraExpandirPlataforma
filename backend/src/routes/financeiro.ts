import { Router } from 'express'
import FinanceiroController from '../controllers/FinanceiroController'

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

export default financeiro
