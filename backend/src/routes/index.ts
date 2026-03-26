import { Router } from 'express'
import { healthController } from '../controllers/health/health.controller'
import { documentsController } from '../controllers/documents/DocumentsController'
import ParceiroController from '../controllers/parceiro/ParceiroController'
import calendarRoutes from './calendar'

const router = Router()

router.get('/ping', healthController.ping)

router.post('/documents/upload', documentsController.uploadDocument)

// Rotas do Google Calendar
router.use('/calendar', calendarRoutes)

export default router
