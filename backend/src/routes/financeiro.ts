import { Router } from 'express'
import FinanceiroController from '../controllers/FinanceiroController'

const financeiro = Router()

// GET /financeiro/comprovantes/pendentes — Lista comprovantes aguardando verificação
financeiro.get('/comprovantes/pendentes', FinanceiroController.getComprovantesPendentes.bind(FinanceiroController))

// POST /financeiro/comprovante/:id/aprovar — Aprova comprovante e dispara SMTP
financeiro.post('/comprovante/:id/aprovar', FinanceiroController.aprovarComprovante.bind(FinanceiroController))

// POST /financeiro/comprovante/:id/recusar — Recusa comprovante com nota
financeiro.post('/comprovante/:id/recusar', FinanceiroController.recusarComprovante.bind(FinanceiroController))

// ROTAS PARA TRADUÇÕES
// POST /financeiro/traducao/comprovante/:id/aprovar — Aprova comprovante de tradução
financeiro.post('/traducao/comprovante/:id/aprovar', FinanceiroController.aprovarComprovanteTraducao.bind(FinanceiroController))

// POST /financeiro/traducao/comprovante/:id/recusar — Recusa comprovante de tradução com nota
financeiro.post('/traducao/comprovante/:id/recusar', FinanceiroController.recusarComprovanteTraducao.bind(FinanceiroController))

export default financeiro
