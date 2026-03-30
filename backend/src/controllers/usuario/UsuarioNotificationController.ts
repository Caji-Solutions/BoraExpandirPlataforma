import NotificationService from '../../services/NotificationService';

class UsuarioNotificationController {
  // GET /usuario/:usuarioId/notificacoes
  async getNotificacoes(req: any, res: any) {
    try {
      const { usuarioId } = req.params
      const { role, id: userId, email } = req.user

      console.log('[UsuarioNotificationController.getNotificacoes] Iniciando...')
      console.log('[UsuarioNotificationController] Params:')
      console.log('  - usuarioId:', usuarioId)
      console.log('  - User role:', role)
      console.log('  - User ID:', userId)
      console.log('  - User email:', email)

      if (!usuarioId) {
        console.log('[UsuarioNotificationController] ❌ usuarioId ausente')
        return res.status(400).json({ message: 'usuarioId é obrigatório' })
      }

      // Validar autorização
      // Roles autorizados: super_admin, admin, juridico, e o próprio usuário pode ver suas notificações
      const rolesAutorizados = ['super_admin', 'admin', 'juridico']

      if (userId !== usuarioId && !rolesAutorizados.includes(role)) {
        console.log('[UsuarioNotificationController] ❌ Sem permissão para acessar notificações')
        return res.status(403).json({ message: 'Sem permissão para acessar notificações de outro usuário' })
      }

      console.log('[UsuarioNotificationController] ✅ Usuário autorizado com role:', role)
      console.log('[UsuarioNotificationController] Chamando NotificationService.getNotificationsByUsuario...')

      const notificacoes = await NotificationService.getNotificationsByUsuario(usuarioId)

      console.log('[UsuarioNotificationController] ✅ Sucesso - Retornando notificações')
      return res.status(200).json({
        message: 'Notificações recuperadas com sucesso',
        data: notificacoes
      })
    } catch (error: any) {
      console.error('[UsuarioNotificationController] ❌ Erro ao buscar notificacoes:', {
        message: error.message,
        code: error.code,
        status: error.status,
        stack: error.stack
      })
      return res.status(500).json({
        message: 'Erro ao buscar notificações',
        error: error.message,
        code: error.code
      })
    }
  }

  // PATCH /usuario/notificacoes/:notificacaoId/status
  async updateNotificacaoStatus(req: any, res: any) {
    try {
      const { notificacaoId } = req.params
      const { lida } = req.body

      console.log('[UsuarioNotificationController.updateNotificacaoStatus] Iniciando...')
      console.log('[UsuarioNotificationController] notificacaoId:', notificacaoId)
      console.log('[UsuarioNotificationController] lida:', lida)

      if (!notificacaoId) {
        return res.status(400).json({ message: 'notificacaoId é obrigatório' })
      }

      const notification = await NotificationService.updateStatus(notificacaoId, lida)

      console.log('[UsuarioNotificationController] ✅ Status atualizado')
      return res.status(200).json({
        message: 'Status da notificação atualizado com sucesso',
        data: notification
      })
    } catch (error: any) {
      console.error('[UsuarioNotificationController] ❌ Erro ao atualizar status:', error)
      return res.status(500).json({
        message: 'Erro ao atualizar status da notificação',
        error: error.message
      })
    }
  }

  // POST /usuario/:usuarioId/notificacoes/read-all
  async markAllNotificacoesAsRead(req: any, res: any) {
    try {
      const { usuarioId } = req.params
      const { role } = req.user

      console.log('[UsuarioNotificationController.markAllNotificacoesAsRead] Iniciando...')
      console.log('[UsuarioNotificationController] usuarioId:', usuarioId)

      if (!usuarioId) {
        return res.status(400).json({ message: 'usuarioId é obrigatório' })
      }

      // Validar autorização
      const rolesAutorizados = ['super_admin', 'admin', 'juridico']

      if (!rolesAutorizados.includes(role)) {
        console.log('[UsuarioNotificationController.markAllNotificacoesAsRead] ❌ Role não autorizado:', role)
        return res.status(403).json({ message: 'Sem permissão para marcar notificações como lidas' })
      }

      console.log('[UsuarioNotificationController.markAllNotificacoesAsRead] ✅ Usuário autorizado com role:', role)

      await NotificationService.markAllAsReadByUsuario(usuarioId)

      console.log('[UsuarioNotificationController.markAllNotificacoesAsRead] ✅ Sucesso')
      return res.status(200).json({
        message: 'Todas as notificações marcadas como lidas'
      })
    } catch (error: any) {
      console.error('[UsuarioNotificationController] ❌ Erro ao marcar como lidas:', error)
      return res.status(500).json({
        message: 'Erro ao marcar notificações como lidas',
        error: error.message
      })
    }
  }
}

export default new UsuarioNotificationController()
