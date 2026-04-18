import { vi, describe, it, expect, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'
import SupervisorMetricsController from '../comercial/SupervisorMetricsController'
import SupervisorMetricsService from '../../services/SupervisorMetricsService'

vi.mock('../../services/SupervisorMetricsService')

function buildApp(authUser: any) {
  const app = express()
  app.use(express.json())
  app.use((req: any, _res, next) => {
    req.userId = authUser?.id
    req.user = authUser
    next()
  })
  app.get(
    '/supervisor/metricas-time',
    SupervisorMetricsController.getTeamMetrics.bind(SupervisorMetricsController)
  )
  app.get(
    '/supervisor/funcionario/:id/detalhes',
    SupervisorMetricsController.getFuncionarioDetalhes.bind(SupervisorMetricsController)
  )
  return app
}

describe('SupervisorMetricsController', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('GET /supervisor/metricas-time', () => {
    it('Deve retornar 403 quando usuário não é supervisor comercial', async () => {
      const app = buildApp({ id: 'u1', role: 'comercial', is_supervisor: false })
      const res = await request(app).get(
        '/supervisor/metricas-time?startDate=2026-04-01T00:00:00Z&endDate=2026-04-30T23:59:59Z'
      )
      expect(res.status).toBe(403)
    })

    it('Deve retornar 403 quando role não é comercial', async () => {
      const app = buildApp({ id: 'u1', role: 'financeiro', is_supervisor: true })
      const res = await request(app).get(
        '/supervisor/metricas-time?startDate=2026-04-01T00:00:00Z&endDate=2026-04-30T23:59:59Z'
      )
      expect(res.status).toBe(403)
    })

    it('Deve retornar 400 quando startDate/endDate ausentes', async () => {
      const app = buildApp({ id: 'u1', role: 'comercial', is_supervisor: true })
      const res = await request(app).get('/supervisor/metricas-time')
      expect(res.status).toBe(400)
    })

    it('Deve retornar 400 quando intervalo > 365 dias', async () => {
      const app = buildApp({ id: 'sup1', role: 'comercial', is_supervisor: true })
      const res = await request(app).get(
        '/supervisor/metricas-time?startDate=2024-01-01T00:00:00Z&endDate=2026-01-01T00:00:00Z'
      )
      expect(res.status).toBe(400)
    })

    it('Deve retornar 200 com dados quando supervisor válido + período válido', async () => {
      const app = buildApp({ id: 'sup1', role: 'comercial', is_supervisor: true })
      const fakeData = {
        periodo: { start: 'x', end: 'y' },
        kpisTime: {
          totalLeads: 0,
          consultoriasAgendadas: 0,
          consultoriasRealizadas: 0,
          taxaComparecimento: 0,
          assessoriasFechadas: 0,
          ticketMedio: 0,
          faturamentoTotal: 0,
          comissaoTimeTotal: 0,
        },
        funcionarios: [],
      }
      ;(SupervisorMetricsService.getTeamMetrics as any).mockResolvedValue(fakeData)
      const res = await request(app).get(
        '/supervisor/metricas-time?startDate=2026-04-01T00:00:00Z&endDate=2026-04-30T23:59:59Z'
      )
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual(fakeData)
      expect(SupervisorMetricsService.getTeamMetrics).toHaveBeenCalledWith(
        'sup1',
        expect.any(String),
        expect.any(String)
      )
    })
  })

  describe('GET /supervisor/funcionario/:id/detalhes', () => {
    it('Deve retornar 403 quando funcionário não pertence ao supervisor', async () => {
      const app = buildApp({ id: 'sup1', role: 'comercial', is_supervisor: true })
      ;(SupervisorMetricsService.getFuncionarioDetalhes as any).mockRejectedValue(
        Object.assign(new Error('Funcionário não pertence ao seu time'), { status: 403 })
      )
      const res = await request(app).get(
        '/supervisor/funcionario/abc/detalhes?startDate=2026-04-01T00:00:00Z&endDate=2026-04-30T23:59:59Z'
      )
      expect(res.status).toBe(403)
    })

    it('Deve retornar 404 quando funcionário inexistente', async () => {
      const app = buildApp({ id: 'sup1', role: 'comercial', is_supervisor: true })
      ;(SupervisorMetricsService.getFuncionarioDetalhes as any).mockRejectedValue(
        new Error('Funcionário não encontrado')
      )
      const res = await request(app).get(
        '/supervisor/funcionario/abc/detalhes?startDate=2026-04-01T00:00:00Z&endDate=2026-04-30T23:59:59Z'
      )
      expect(res.status).toBe(404)
    })

    it('Deve retornar 200 com dados quando válido', async () => {
      const app = buildApp({ id: 'sup1', role: 'comercial', is_supervisor: true })
      const fake = {
        funcionario: { id: 'f1', nome: 'X', nivel: 'C2', email: 'x@x' },
        periodo: { start: 'a', end: 'b' },
        detalhamento: {
          leadsPorDia: [],
          consultoriasPorStatus: {},
          assessoriasPorStatus: {},
        },
        leads: [],
        consultorias: [],
        assessorias: [],
      }
      ;(SupervisorMetricsService.getFuncionarioDetalhes as any).mockResolvedValue(fake)
      const res = await request(app).get(
        '/supervisor/funcionario/f1/detalhes?startDate=2026-04-01T00:00:00Z&endDate=2026-04-30T23:59:59Z'
      )
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual(fake)
    })
  })
})
