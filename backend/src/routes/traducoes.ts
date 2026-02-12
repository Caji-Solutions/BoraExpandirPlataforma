import { Router } from 'express'
import TraducoesController from '../controllers/TraducoesController'

const router = Router()

// GET /api/traducoes/orcamentos/pendentes
router.get('/orcamentos/pendentes', TraducoesController.getOrcamentos)

// POST /api/traducoes/orcamentos
router.post('/orcamentos', TraducoesController.responderOrcamento)

// GET /api/traducoes/orcamentos/documento/:documentoId
router.get('/orcamentos/documento/:documentoId', TraducoesController.getOrcamentoByDocumento)

// POST /api/traducoes/orcamentos/:id/aprovar
router.post('/orcamentos/:id/aprovar', TraducoesController.aprovarOrcamento)

export default router
