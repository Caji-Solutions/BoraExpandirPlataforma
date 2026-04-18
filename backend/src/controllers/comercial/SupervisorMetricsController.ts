import SupervisorMetricsService from '../../services/SupervisorMetricsService'

class SupervisorMetricsController {
  private isSupervisorComercial(user: any): boolean {
    return !!user && user.role === 'comercial' && user.is_supervisor === true
  }

  private parsePeriodo(req: any): { start: string; end: string } | null {
    const { startDate, endDate } = req.query
    if (!startDate || !endDate) return null
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null
    if (end < start) return null
    const diffDays = (end.getTime() - start.getTime()) / 86_400_000
    if (diffDays > 365) return null
    return { start: start.toISOString(), end: end.toISOString() }
  }

  // GET /comercial/supervisor/metricas-time
  async getTeamMetrics(req: any, res: any) {
    try {
      if (!this.isSupervisorComercial(req.user)) {
        return res
          .status(403)
          .json({ message: 'Apenas supervisores comerciais podem acessar' })
      }
      const periodo = this.parsePeriodo(req)
      if (!periodo) {
        return res.status(400).json({
          message:
            'startDate e endDate (ISO) são obrigatórios; intervalo máximo 365 dias',
        })
      }
      const data = await SupervisorMetricsService.getTeamMetrics(
        req.userId,
        periodo.start,
        periodo.end
      )
      return res.status(200).json({ message: 'Métricas do time recuperadas', data })
    } catch (error: any) {
      console.error('[SupervisorMetricsController] getTeamMetrics:', error)
      return res.status(500).json({
        message: 'Erro ao calcular métricas do time',
        error: error.message,
      })
    }
  }

  // GET /comercial/supervisor/funcionario/:id/detalhes
  async getFuncionarioDetalhes(req: any, res: any) {
    try {
      if (!this.isSupervisorComercial(req.user)) {
        return res
          .status(403)
          .json({ message: 'Apenas supervisores comerciais podem acessar' })
      }
      const periodo = this.parsePeriodo(req)
      if (!periodo) {
        return res.status(400).json({
          message:
            'startDate e endDate (ISO) são obrigatórios; intervalo máximo 365 dias',
        })
      }
      const { id } = req.params
      const data = await SupervisorMetricsService.getFuncionarioDetalhes(
        id,
        req.userId,
        periodo.start,
        periodo.end
      )
      return res
        .status(200)
        .json({ message: 'Detalhes do funcionário recuperados', data })
    } catch (error: any) {
      const msg = String(error?.message || '')
      const isAuthz =
        error?.status === 403 ||
        msg.includes('não pertence') ||
        msg.includes('nao pertence')
      const isNotFound = msg.includes('não encontrado') || msg.includes('nao encontrado')
      const status = isAuthz ? 403 : isNotFound ? 404 : 500
      console.error('[SupervisorMetricsController] getFuncionarioDetalhes:', error)
      return res
        .status(status)
        .json({ message: error.message || 'Erro ao buscar detalhes do funcionário' })
    }
  }
}

export default new SupervisorMetricsController()
