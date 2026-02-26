import { Router } from 'express'
import ParceiroController from '../controllers/ParceiroController'

const parceiro = Router()

parceiro.post('/register', ParceiroController.register.bind(ParceiroController))

parceiro.get('/parceirobyid/:id', ParceiroController.getParceiroById.bind(ParceiroController))
parceiro.get('/clients/:id', ParceiroController.getClientsByParceiroId.bind(ParceiroController))
parceiro.get('/metrics/:id', ParceiroController.getMetrics.bind(ParceiroController))

export default parceiro

