import { Router } from 'express'
import { healthController } from '../controllers/health.controller'
import { documentsController } from '../controllers/DocumentsController'
import ParceiroController from '../controllers/ParceiroController'

const router = Router()

router.get('/ping', healthController.ping)

router.post('/documents/upload', documentsController.uploadDocument)


export default router
