import ClienteRepository from '../../repositories/ClienteRepository';

class ClienteNotificationController {
  // GET /cliente/:clienteId/notificacoes
  async getNotificacoes(req: any, res: any) {
    try {
      const { clienteId } = req.params
      const { role, id: userId, email } = req.user

      console.log('[ClienteNotificationController.getNotificacoes] Iniciando...')
      console.log('[ClienteNotificationController] Params:')
      console.log('  - clienteId:', clienteId)
      console.log('  - User role:', role)
      console.log('  - User ID:', userId)
      console.log('  - User email:', email)

      if (!clienteId) {
        console.log('[ClienteNotificationController] ❌ clienteId ausente')
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      // Validar autorização
      // Roles autorizados: cliente, admin, juridico, super_admin
      const rolesAutorizados = ['cliente', 'admin', 'juridico', 'super_admin']

      if (!rolesAutorizados.includes(role)) {
        console.log('[ClienteNotificationController] ❌ Role não autorizado:', role)
        return res.status(403).json({ message: 'Sem permissão para acessar notificações' })
      }

      console.log('[ClienteNotificationController] ✅ Usuário autorizado com role:', role)

      console.log('[ClienteNotificationController] Chamando ClienteRepository.getNotificacoes...')
      const notificacoes = await ClienteRepository.getNotificacoes(clienteId)

      console.log('[ClienteNotificationController] ✅ Sucesso - Retornando notificações')
      return res.status(200).json({
        message: 'Notificações recuperadas com sucesso',
        data: notificacoes
      })
    } catch (error: any) {
      console.error('[ClienteNotificationController] ❌ Erro ao buscar notificacoes:', {
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

  // PATCH /cliente/notificacoes/:notificacaoId/status
  async updateNotificacaoStatus(req: any, res: any) {
    try {
      const { notificacaoId } = req.params
      const { lida } = req.body

      if (!notificacaoId) {
        return res.status(400).json({ message: 'notificacaoId é obrigatório' })
      }

      const notification = await ClienteRepository.updateNotificacaoStatus(notificacaoId, lida)

      return res.status(200).json({
        message: 'Status da notificação atualizado com sucesso',
        data: notification
      })
    } catch (error: any) {
      console.error('Erro ao atualizar status da notificacao:', error)
      return res.status(500).json({
        message: 'Erro ao atualizar status da notificação',
        error: error.message
      })
    }
  }

  // POST /cliente/:clienteId/notificacoes/read-all
  async markAllNotificacoesAsRead(req: any, res: any) {
    try {
      const { clienteId } = req.params
      const { id: userId, role } = req.user

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      // Validar autorização
      // Roles autorizados: cliente, admin, juridico, super_admin
      const rolesAutorizados = ['cliente', 'admin', 'juridico', 'super_admin']

      if (!rolesAutorizados.includes(role)) {
        console.log('[ClienteNotificationController.markAllNotificacoesAsRead] ❌ Role não autorizado:', role)
        return res.status(403).json({ message: 'Sem permissão para marcar notificações como lidas' })
      }

      console.log('[ClienteNotificationController.markAllNotificacoesAsRead] ✅ Usuário autorizado com role:', role)

      await ClienteRepository.markAllNotificacoesAsRead(clienteId)

      return res.status(200).json({
        message: 'Todas as notificações marcadas como lidas'
      })
    } catch (error: any) {
      console.error('Erro ao marcar todas notificacoes como lidas:', error)
      return res.status(500).json({
        message: 'Erro ao marcar todas notificações como lidas',
        error: error.message
      })
    }
  }
}

export default new ClienteNotificationController()
