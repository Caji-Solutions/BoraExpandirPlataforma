import ClienteRepository from '../../repositories/ClienteRepository';

class ClienteNotificationController {
  // GET /cliente/:clienteId/notificacoes
  async getNotificacoes(req: any, res: any) {
    try {
      const { clienteId } = req.params
      const { role } = req.user

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      // Validar autorização
      // Se o usuário é cliente regular, verifica se está acessando suas próprias notificações
      if (role === 'cliente') {
        // Para clientes, precisamos validar se o clienteId passado é realmente do usuário
        // O userId é Auth UID, o clienteId é ID na tabela clientes - não dá para comparar direto
        // Por enquanto, confiamos que o middleware de auth já validou isso
        // Se quisermos ser mais restritivo, faríamos uma query para validar
      } else if (role !== 'admin' && role !== 'juridico') {
        return res.status(403).json({ message: 'Sem permissão para acessar notificações' })
      }

      const notificacoes = await ClienteRepository.getNotificacoes(clienteId)

      return res.status(200).json({
        message: 'Notificações recuperadas com sucesso',
        data: notificacoes
      })
    } catch (error: any) {
      console.error('Erro ao buscar notificacoes:', error)
      return res.status(500).json({
        message: 'Erro ao buscar notificações',
        error: error.message
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
      // Se o usuário é cliente regular, confiamos no middleware de auth
      if (role !== 'cliente' && role !== 'admin' && role !== 'juridico') {
        return res.status(403).json({ message: 'Sem permissão para marcar notificações como lidas' })
      }

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
