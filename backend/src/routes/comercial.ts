import { Router } from 'express'
import ComercialController from '../controllers/ComercialController'


const comercial = Router()


comercial.post('/agendamento', ComercialController.createAgendamento.bind(ComercialController))
comercial.post('/agendamento/mercadopago', ComercialController.createAgendamentoMercadoPago.bind(ComercialController))
comercial.post('/agendamento/stripe', ComercialController.createAgendamentoStripe.bind(ComercialController))
comercial.get('/disponibilidade', ComercialController.checkDisponibilidade.bind(ComercialController))
comercial.get('/agendamentos/usuario/:usuarioId', ComercialController.getAgendamentosByUsuario.bind(ComercialController))
comercial.get('/agendamentos/:data', ComercialController.getAgendamentosByData.bind(ComercialController))

export default comercial
