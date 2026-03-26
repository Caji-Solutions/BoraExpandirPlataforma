import { Router } from 'express'
import ConfigController from '../controllers/config/ConfigController'
import ComissaoController from '../controllers/comercial/ComissaoController'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

router.get('/:chave', ConfigController.getConfig)
router.post('/', ConfigController.setConfig)

// Metas comerciais CRUD (Super-Admin)
router.get('/metas/all', authMiddleware, ComissaoController.getMetas.bind(ComissaoController))
router.get('/metas/:nivel', authMiddleware, ComissaoController.getMetasByNivel.bind(ComissaoController))
router.post('/metas', authMiddleware, ComissaoController.upsertMeta.bind(ComissaoController))
router.put('/metas/batch', authMiddleware, ComissaoController.upsertMetasBatch.bind(ComissaoController))
router.delete('/metas/:id', authMiddleware, ComissaoController.deleteMeta.bind(ComissaoController))

export default router
