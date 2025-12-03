import { Router } from 'express'
import ClienteController from '../controllers/ClienteController'

const cliente = Router()

cliente.post('/register', ClienteController.register.bind(ClienteController))
cliente.post('/attstatusbywpp', ClienteController.AttStatusClientebyWpp.bind(ClienteController))

cliente.get('/clientesbyparceiro/:parceiroId', ClienteController.getByParceiro.bind(ClienteController))

export default cliente
