import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'
import UsuarioNotificationController from '../controllers/usuario/UsuarioNotificationController'

const usuario = Router()

// Aplicar middleware de autenticação para todas as rotas
usuario.use(authMiddleware)

// Rotas de Notificações
usuario.get('/:usuarioId/notificacoes', UsuarioNotificationController.getNotificacoes.bind(UsuarioNotificationController))
usuario.patch('/notificacoes/:notificacaoId/status', UsuarioNotificationController.updateNotificacaoStatus.bind(UsuarioNotificationController))
usuario.post('/:usuarioId/notificacoes/read-all', UsuarioNotificationController.markAllNotificacoesAsRead.bind(UsuarioNotificationController))

export default usuario
