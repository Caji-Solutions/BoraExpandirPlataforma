# Tela de Métricas do Supervisor Comercial — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refazer `/comercial/supervisor` com filtro de período, KPIs do time, tabela ranqueada por nível e modal de drill-down — alimentado por 2 endpoints novos.

**Architecture:** Backend Express + Supabase JS com novo `SupervisorMetricsController` + `SupervisorMetricsService` (4 queries paralelas + comissões via `Promise.all`). Frontend React + React Query orquestra: query agregada (sempre) + query lazy do modal (quando aberto). Componentização em 4 unidades coesas (`PeriodFilter`, `MetricsTeamSummary`, `FuncionarioMetricsTable`, `FuncionarioDetailsModal`).

**Tech Stack:** TypeScript + Express + Supabase JS (backend), React + React Query + Tailwind + Radix UI (frontend), Vitest + supertest (testes). Reusa `ComissaoService.calcularComissao` existente.

**Spec:** `docs/superpowers/specs/2026-04-18-supervisor-comercial-metricas-design.md`

---

## Task 0: Validar enum exato de `agendamentos.status`

**Files:**
- Read only: `backend/src/controllers/comercial/ComercialController.ts`, `backend/src/workers/cronJobs.ts`

- [ ] **Step 1: Catalogar valores usados no código**

Grep todas as comparações com `agendamento.status`:
```bash
grep -rn "agendamento.status\|\.status === '" backend/src --include="*.ts" | grep -i "agend\|consult\|status" | sort -u | head -40
```

- [ ] **Step 2: Documentar achados**

Anotar em comentário no topo de `SupervisorMetricsService.ts` (Task 2) os valores reais. Esperado: `'agendado'`, `'confirmado'`, `'cancelado'`, `'realizado'`, `'Conflito'`. Se faltar `'realizado'`, definir "consultoriasRealizadas" como `data_hora < now() AND status NOT IN ('cancelado', 'Conflito')`.

- [ ] **Step 3: Sem commit (pesquisa, não muda código)**

---

## Task 1: Backend — Tipos compartilhados

**Files:**
- Create: `backend/src/types/supervisorMetrics.ts`

- [ ] **Step 1: Criar arquivo de tipos**

```typescript
// backend/src/types/supervisorMetrics.ts

export type Nivel = 'C1' | 'C2' | 'HEAD'

export interface FuncionarioMetricas {
  id: string
  nome: string
  nivel: Nivel
  leadsCriados: number
  consultoriasAgendadas: number
  consultoriasRealizadas: number
  taxaComparecimento: number
  taxaConversaoLeadConsultoria: number
  assessoriasIniciadas: number | null
  assessoriasFechadas: number | null
  taxaConversaoConsultoriaAssessoria: number | null
  ticketMedio: number | null
  faturamentoGerado: number | null
  comissaoAcumulada: number
  ranking: number
}

export interface KpisTime {
  totalLeads: number
  consultoriasAgendadas: number
  consultoriasRealizadas: number
  taxaComparecimento: number
  assessoriasFechadas: number
  ticketMedio: number
  faturamentoTotal: number
  comissaoTimeTotal: number
}

export interface TeamMetricsResponse {
  periodo: { start: string; end: string }
  kpisTime: KpisTime
  funcionarios: FuncionarioMetricas[]
}

export interface FuncionarioDetalhamento {
  leadsPorDia: Array<{ data: string; qtd: number }>
  consultoriasPorStatus: Record<string, number>
  assessoriasPorStatus: Record<string, number>
}

export interface FuncionarioDetailsResponse {
  funcionario: { id: string; nome: string; nivel: Nivel; email: string }
  periodo: { start: string; end: string }
  detalhamento: FuncionarioDetalhamento
  leads: Array<{ id: string; nome: string; telefone: string; status: string; data_criacao: string }>
  consultorias: Array<{ id: string; cliente_nome: string; data_agendamento: string; status: string; valor: number | null }>
  assessorias: Array<{ id: string; cliente_nome: string; valor: number; status: string; data_inicio: string; data_fechamento: string | null }>
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/types/supervisorMetrics.ts
git commit -m "feat(supervisor-metricas): add tipos compartilhados do dominio"
```

---

## Task 2: Backend — SupervisorMetricsService skeleton

**Files:**
- Create: `backend/src/services/SupervisorMetricsService.ts`

- [ ] **Step 1: Criar service com método `getDelegados`**

```typescript
// backend/src/services/SupervisorMetricsService.ts
import { supabase } from '../config/SupabaseClient'
import type { Nivel } from '../types/supervisorMetrics'

// agendamentos.status enum observado no código: 'agendado' | 'confirmado' | 'cancelado' | 'realizado' | 'Conflito'
// (validado em Task 0; ajustar aqui se encontrarmos valores diferentes)

export interface DelegadoBasico {
  id: string
  full_name: string
  email: string
  nivel: Nivel
}

class SupervisorMetricsService {
  async getDelegados(supervisorId: string): Promise<DelegadoBasico[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, nivel, cargo, role')
      .eq('supervisor_id', supervisorId)
      .eq('role', 'comercial')
      .order('full_name', { ascending: true })

    if (error) throw error

    return (data || []).map((d: any) => ({
      id: d.id,
      full_name: d.full_name,
      email: d.email,
      nivel: this.normalizeNivel(d.nivel, d.cargo)
    }))
  }

  private normalizeNivel(rawNivel?: string | null, rawCargo?: string | null): Nivel {
    const v = String(rawNivel || rawCargo || '').toUpperCase()
    if (v.includes('HEAD') || v.includes('SUPERVISOR')) return 'HEAD'
    if (v.includes('C2')) return 'C2'
    return 'C1'
  }
}

export default new SupervisorMetricsService()
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/SupervisorMetricsService.ts
git commit -m "feat(supervisor-metricas): add SupervisorMetricsService.getDelegados"
```

---

## Task 3: Backend — SupervisorMetricsService.getTeamMetrics

**Files:**
- Modify: `backend/src/services/SupervisorMetricsService.ts`

- [ ] **Step 1: Adicionar método `getTeamMetrics`**

Adicionar no final da classe (antes do `}`):

```typescript
  async getTeamMetrics(
    supervisorId: string,
    startDate: string,
    endDate: string
  ): Promise<import('../types/supervisorMetrics').TeamMetricsResponse> {
    const delegados = await this.getDelegados(supervisorId)
    const ids = delegados.map((d) => d.id)

    if (ids.length === 0) {
      return {
        periodo: { start: startDate, end: endDate },
        kpisTime: this.zeroKpis(),
        funcionarios: []
      }
    }

    const [leadsRes, agendamentosRes, contratosRes] = await Promise.all([
      supabase
        .from('clientes')
        .select('id, criado_por, criado_em')
        .in('criado_por', ids)
        .gte('criado_em', startDate)
        .lte('criado_em', endDate),
      supabase
        .from('agendamentos')
        .select('id, usuario_id, data_hora, status, valor')
        .in('usuario_id', ids)
        .gte('data_hora', startDate)
        .lte('data_hora', endDate),
      supabase
        .from('contratos_servicos')
        .select(`
          id, usuario_id, servico_valor, assinatura_status, pagamento_status,
          status_contrato, criado_em, pagamento_verificado_em
        `)
        .in('usuario_id', ids)
        .or(
          `and(pagamento_verificado_em.gte.${startDate},pagamento_verificado_em.lte.${endDate}),` +
          `and(pagamento_verificado_em.is.null,criado_em.gte.${startDate},criado_em.lte.${endDate})`
        )
    ])

    if (leadsRes.error) throw leadsRes.error
    if (agendamentosRes.error) throw agendamentosRes.error
    if (contratosRes.error) throw contratosRes.error

    const leads = leadsRes.data || []
    const agendamentos = agendamentosRes.data || []
    const contratos = contratosRes.data || []

    // Comissões em paralelo (uma por delegado).
    // ComissaoService usa janela rolling 30d — divergência aceita por design.
    const ComissaoService = (await import('./ComissaoService')).default
    const now = new Date()
    const mes = now.getMonth() + 1
    const ano = now.getFullYear()
    const comissoes = await Promise.all(
      delegados.map(async (d) => {
        try {
          const cargo = d.nivel === 'HEAD' ? 'HEAD' : d.nivel
          const r = await ComissaoService.calcularComissao(d.id, cargo, mes, ano)
          return { id: d.id, valor: Number(r?.comissao_brl || r?.totalComissao || 0) }
        } catch {
          return { id: d.id, valor: 0 }
        }
      })
    )
    const comissaoMap = new Map(comissoes.map((c) => [c.id, c.valor]))

    const funcionarios = delegados.map((d) => {
      const leadsCriados = leads.filter((l: any) => l.criado_por === d.id).length
      const myAgendamentos = agendamentos.filter((a: any) => a.usuario_id === d.id)
      const consultoriasAgendadas = myAgendamentos.length
      const consultoriasRealizadas = myAgendamentos.filter(
        (a: any) => this.isConsultoriaRealizada(a)
      ).length
      const taxaComparecimento = consultoriasAgendadas > 0
        ? consultoriasRealizadas / consultoriasAgendadas
        : 0
      const taxaConversaoLeadConsultoria = leadsCriados > 0
        ? consultoriasAgendadas / leadsCriados
        : 0

      const isC2 = d.nivel === 'C2'
      const myContratos = contratos.filter((c: any) => c.usuario_id === d.id)
      const myContratosFechados = myContratos.filter((c: any) => this.isContratoFechado(c))
      const assessoriasIniciadas = isC2 ? myContratos.length : null
      const assessoriasFechadas = isC2 ? myContratosFechados.length : null
      const faturamentoGerado = isC2
        ? myContratosFechados.reduce((sum: number, c: any) => sum + Number(c.servico_valor || 0), 0)
        : null
      const ticketMedio = isC2 && (assessoriasFechadas! > 0)
        ? faturamentoGerado! / assessoriasFechadas!
        : (isC2 ? 0 : null)
      const taxaConversaoConsultoriaAssessoria = isC2
        ? (consultoriasRealizadas > 0 ? assessoriasFechadas! / consultoriasRealizadas : 0)
        : null

      return {
        id: d.id,
        nome: d.full_name,
        nivel: d.nivel,
        leadsCriados,
        consultoriasAgendadas,
        consultoriasRealizadas,
        taxaComparecimento,
        taxaConversaoLeadConsultoria,
        assessoriasIniciadas,
        assessoriasFechadas,
        taxaConversaoConsultoriaAssessoria,
        ticketMedio,
        faturamentoGerado,
        comissaoAcumulada: comissaoMap.get(d.id) || 0,
        ranking: 0 // preenchido abaixo
      }
    })

    // Ranking por nível: C1 ranqueado por leadsCriados, C2 por faturamentoGerado
    const c1s = funcionarios.filter((f) => f.nivel === 'C1')
      .sort((a, b) => b.leadsCriados - a.leadsCriados)
    c1s.forEach((f, i) => { f.ranking = i + 1 })
    const c2s = funcionarios.filter((f) => f.nivel === 'C2')
      .sort((a, b) => (b.faturamentoGerado || 0) - (a.faturamentoGerado || 0))
    c2s.forEach((f, i) => { f.ranking = i + 1 })

    const kpisTime = this.aggregateKpis(funcionarios)

    return {
      periodo: { start: startDate, end: endDate },
      kpisTime,
      funcionarios
    }
  }

  private isConsultoriaRealizada(a: any): boolean {
    if (a.status === 'cancelado' || a.status === 'Conflito') return false
    if (a.status === 'realizado') return true
    return new Date(a.data_hora) < new Date()
  }

  private isContratoFechado(c: any): boolean {
    return c.assinatura_status === 'aprovado'
      && ['aprovado', 'confirmado'].includes(c.pagamento_status)
      && c.status_contrato !== 'INVALIDO'
      && c.status_contrato !== 'CANCELADO'
  }

  private zeroKpis(): import('../types/supervisorMetrics').KpisTime {
    return {
      totalLeads: 0,
      consultoriasAgendadas: 0,
      consultoriasRealizadas: 0,
      taxaComparecimento: 0,
      assessoriasFechadas: 0,
      ticketMedio: 0,
      faturamentoTotal: 0,
      comissaoTimeTotal: 0
    }
  }

  private aggregateKpis(funcs: import('../types/supervisorMetrics').FuncionarioMetricas[]) {
    const totalLeads = funcs.reduce((s, f) => s + f.leadsCriados, 0)
    const consultoriasAgendadas = funcs.reduce((s, f) => s + f.consultoriasAgendadas, 0)
    const consultoriasRealizadas = funcs.reduce((s, f) => s + f.consultoriasRealizadas, 0)
    const assessoriasFechadas = funcs.reduce((s, f) => s + (f.assessoriasFechadas || 0), 0)
    const faturamentoTotal = funcs.reduce((s, f) => s + (f.faturamentoGerado || 0), 0)
    const comissaoTimeTotal = funcs.reduce((s, f) => s + f.comissaoAcumulada, 0)

    return {
      totalLeads,
      consultoriasAgendadas,
      consultoriasRealizadas,
      taxaComparecimento: consultoriasAgendadas > 0
        ? consultoriasRealizadas / consultoriasAgendadas
        : 0,
      assessoriasFechadas,
      ticketMedio: assessoriasFechadas > 0 ? faturamentoTotal / assessoriasFechadas : 0,
      faturamentoTotal,
      comissaoTimeTotal
    }
  }
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/SupervisorMetricsService.ts
git commit -m "feat(supervisor-metricas): add SupervisorMetricsService.getTeamMetrics"
```

---

## Task 4: Backend — SupervisorMetricsService.getFuncionarioDetalhes

**Files:**
- Modify: `backend/src/services/SupervisorMetricsService.ts`

- [ ] **Step 1: Adicionar método `getFuncionarioDetalhes`**

Adicionar antes do `}` final da classe:

```typescript
  async getFuncionarioDetalhes(
    supervisorId: string,
    funcionarioId: string,
    startDate: string,
    endDate: string
  ): Promise<import('../types/supervisorMetrics').FuncionarioDetailsResponse> {
    // Validar que o funcionário é delegado deste supervisor
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, nivel, cargo, supervisor_id')
      .eq('id', funcionarioId)
      .single()

    if (profileError || !profileData) {
      throw new Error('Funcionário não encontrado')
    }
    if (profileData.supervisor_id !== supervisorId) {
      throw new Error('Funcionário não pertence ao seu time')
    }

    const nivel = this.normalizeNivel(profileData.nivel, profileData.cargo)

    const [leadsRes, agendamentosRes, contratosRes] = await Promise.all([
      supabase
        .from('clientes')
        .select('id, nome, telefone, whatsapp, stage, status, criado_em')
        .eq('criado_por', funcionarioId)
        .gte('criado_em', startDate)
        .lte('criado_em', endDate)
        .order('criado_em', { ascending: false }),
      supabase
        .from('agendamentos')
        .select('id, cliente_id, data_hora, status, valor, produto_nome')
        .eq('usuario_id', funcionarioId)
        .gte('data_hora', startDate)
        .lte('data_hora', endDate)
        .order('data_hora', { ascending: false }),
      supabase
        .from('contratos_servicos')
        .select(`
          id, cliente_id, servico_valor, status_contrato, criado_em, pagamento_verificado_em,
          assinatura_status, pagamento_status,
          servico:catalogo_servicos(id, nome)
        `)
        .eq('usuario_id', funcionarioId)
        .or(
          `and(pagamento_verificado_em.gte.${startDate},pagamento_verificado_em.lte.${endDate}),` +
          `and(pagamento_verificado_em.is.null,criado_em.gte.${startDate},criado_em.lte.${endDate})`
        )
        .order('criado_em', { ascending: false })
    ])

    if (leadsRes.error) throw leadsRes.error
    if (agendamentosRes.error) throw agendamentosRes.error
    if (contratosRes.error) throw contratosRes.error

    const leads = leadsRes.data || []
    const agendamentos = agendamentosRes.data || []
    const contratos = contratosRes.data || []

    // Resolver nomes de cliente para agendamentos e contratos
    const clienteIds = [
      ...new Set([
        ...agendamentos.map((a: any) => a.cliente_id).filter(Boolean),
        ...contratos.map((c: any) => c.cliente_id).filter(Boolean)
      ])
    ]
    let clienteNomeMap = new Map<string, string>()
    if (clienteIds.length > 0) {
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('id, nome')
        .in('id', clienteIds)
      clienteNomeMap = new Map((clientesData || []).map((c: any) => [c.id, c.nome]))
    }

    // Detalhamento agregado
    const leadsPorDia = this.groupByDay(leads.map((l: any) => l.criado_em))
    const consultoriasPorStatus = this.countBy(agendamentos.map((a: any) => a.status || 'desconhecido'))
    const assessoriasPorStatus = this.countBy(contratos.map((c: any) => c.status_contrato || 'desconhecido'))

    return {
      funcionario: {
        id: profileData.id,
        nome: profileData.full_name,
        nivel,
        email: profileData.email
      },
      periodo: { start: startDate, end: endDate },
      detalhamento: { leadsPorDia, consultoriasPorStatus, assessoriasPorStatus },
      leads: leads.map((l: any) => ({
        id: l.id,
        nome: l.nome,
        telefone: l.whatsapp || l.telefone || '',
        status: l.status || l.stage || '',
        data_criacao: l.criado_em
      })),
      consultorias: agendamentos.map((a: any) => ({
        id: a.id,
        cliente_nome: clienteNomeMap.get(a.cliente_id) || '—',
        data_agendamento: a.data_hora,
        status: a.status,
        valor: a.valor != null ? Number(a.valor) : null
      })),
      assessorias: contratos.map((c: any) => ({
        id: c.id,
        cliente_nome: clienteNomeMap.get(c.cliente_id) || '—',
        valor: Number(c.servico_valor || 0),
        status: c.status_contrato,
        data_inicio: c.criado_em,
        data_fechamento: c.pagamento_verificado_em
      }))
    }
  }

  private groupByDay(dates: string[]): Array<{ data: string; qtd: number }> {
    const map = new Map<string, number>()
    for (const d of dates) {
      const day = String(d).slice(0, 10)
      map.set(day, (map.get(day) || 0) + 1)
    }
    return Array.from(map.entries())
      .map(([data, qtd]) => ({ data, qtd }))
      .sort((a, b) => a.data.localeCompare(b.data))
  }

  private countBy(values: string[]): Record<string, number> {
    const map: Record<string, number> = {}
    for (const v of values) map[v] = (map[v] || 0) + 1
    return map
  }
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/SupervisorMetricsService.ts
git commit -m "feat(supervisor-metricas): add SupervisorMetricsService.getFuncionarioDetalhes"
```

---

## Task 5: Backend — SupervisorMetricsController

**Files:**
- Create: `backend/src/controllers/comercial/SupervisorMetricsController.ts`

- [ ] **Step 1: Criar controller**

```typescript
// backend/src/controllers/comercial/SupervisorMetricsController.ts
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
        return res.status(403).json({ message: 'Apenas supervisores comerciais podem acessar' })
      }
      const periodo = this.parsePeriodo(req)
      if (!periodo) {
        return res.status(400).json({ message: 'startDate e endDate (ISO) são obrigatórios; intervalo máximo 365 dias' })
      }
      const data = await SupervisorMetricsService.getTeamMetrics(req.userId, periodo.start, periodo.end)
      return res.status(200).json({ message: 'Métricas do time recuperadas', data })
    } catch (error: any) {
      console.error('[SupervisorMetricsController] getTeamMetrics:', error)
      return res.status(500).json({ message: 'Erro ao calcular métricas do time', error: error.message })
    }
  }

  // GET /comercial/supervisor/funcionario/:id/detalhes
  async getFuncionarioDetalhes(req: any, res: any) {
    try {
      if (!this.isSupervisorComercial(req.user)) {
        return res.status(403).json({ message: 'Apenas supervisores comerciais podem acessar' })
      }
      const periodo = this.parsePeriodo(req)
      if (!periodo) {
        return res.status(400).json({ message: 'startDate e endDate (ISO) são obrigatórios; intervalo máximo 365 dias' })
      }
      const { id } = req.params
      const data = await SupervisorMetricsService.getFuncionarioDetalhes(req.userId, id, periodo.start, periodo.end)
      return res.status(200).json({ message: 'Detalhes do funcionário recuperados', data })
    } catch (error: any) {
      const isAuthz = error.message?.includes('não pertence ao seu time')
      const isNotFound = error.message?.includes('não encontrado')
      const status = isAuthz ? 403 : (isNotFound ? 404 : 500)
      console.error('[SupervisorMetricsController] getFuncionarioDetalhes:', error)
      return res.status(status).json({ message: error.message || 'Erro ao buscar detalhes do funcionário' })
    }
  }
}

export default new SupervisorMetricsController()
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/controllers/comercial/SupervisorMetricsController.ts
git commit -m "feat(supervisor-metricas): add SupervisorMetricsController"
```

---

## Task 6: Backend — Registrar rotas

**Files:**
- Modify: `backend/src/routes/comercial.ts`

- [ ] **Step 1: Adicionar import**

No topo do arquivo, após o import de `ComissaoController`:

```typescript
import SupervisorMetricsController from '../controllers/comercial/SupervisorMetricsController'
```

- [ ] **Step 2: Registrar rotas**

Antes do `export default comercial`, adicionar:

```typescript
// Métricas do supervisor comercial
comercial.get(
  '/supervisor/metricas-time',
  authMiddleware,
  SupervisorMetricsController.getTeamMetrics.bind(SupervisorMetricsController)
)
comercial.get(
  '/supervisor/funcionario/:id/detalhes',
  authMiddleware,
  SupervisorMetricsController.getFuncionarioDetalhes.bind(SupervisorMetricsController)
)
```

- [ ] **Step 3: Verificar compilação**

```bash
cd backend && npx tsc --noEmit
```
Expected: sem erros nos arquivos novos. Se houver, corrigir tipos.

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/comercial.ts
git commit -m "feat(supervisor-metricas): registrar rotas no comercial.ts"
```

---

## Task 7: Backend — Testes do controller

**Files:**
- Create: `backend/src/controllers/__tests__/SupervisorMetricsController.test.ts`

- [ ] **Step 1: Criar arquivo de teste**

```typescript
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
  app.get('/supervisor/metricas-time', SupervisorMetricsController.getTeamMetrics.bind(SupervisorMetricsController))
  app.get('/supervisor/funcionario/:id/detalhes', SupervisorMetricsController.getFuncionarioDetalhes.bind(SupervisorMetricsController))
  return app
}

describe('SupervisorMetricsController', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('GET /supervisor/metricas-time', () => {
    it('Deve retornar 403 quando usuário não é supervisor comercial', async () => {
      const app = buildApp({ id: 'u1', role: 'comercial', is_supervisor: false })
      const res = await request(app).get('/supervisor/metricas-time?startDate=2026-04-01T00:00:00Z&endDate=2026-04-30T23:59:59Z')
      expect(res.status).toBe(403)
    })

    it('Deve retornar 400 quando startDate/endDate ausentes', async () => {
      const app = buildApp({ id: 'u1', role: 'comercial', is_supervisor: true })
      const res = await request(app).get('/supervisor/metricas-time')
      expect(res.status).toBe(400)
    })

    it('Deve retornar 200 com dados quando supervisor válido + período válido', async () => {
      const app = buildApp({ id: 'sup1', role: 'comercial', is_supervisor: true })
      const fakeData = {
        periodo: { start: 'x', end: 'y' },
        kpisTime: { totalLeads: 0, consultoriasAgendadas: 0, consultoriasRealizadas: 0, taxaComparecimento: 0, assessoriasFechadas: 0, ticketMedio: 0, faturamentoTotal: 0, comissaoTimeTotal: 0 },
        funcionarios: []
      }
      ;(SupervisorMetricsService.getTeamMetrics as any).mockResolvedValue(fakeData)
      const res = await request(app).get('/supervisor/metricas-time?startDate=2026-04-01T00:00:00Z&endDate=2026-04-30T23:59:59Z')
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual(fakeData)
      expect(SupervisorMetricsService.getTeamMetrics).toHaveBeenCalledWith('sup1', expect.any(String), expect.any(String))
    })

    it('Deve retornar 400 quando intervalo > 365 dias', async () => {
      const app = buildApp({ id: 'sup1', role: 'comercial', is_supervisor: true })
      const res = await request(app).get('/supervisor/metricas-time?startDate=2024-01-01T00:00:00Z&endDate=2026-01-01T00:00:00Z')
      expect(res.status).toBe(400)
    })
  })

  describe('GET /supervisor/funcionario/:id/detalhes', () => {
    it('Deve retornar 403 quando funcionário não pertence ao supervisor', async () => {
      const app = buildApp({ id: 'sup1', role: 'comercial', is_supervisor: true })
      ;(SupervisorMetricsService.getFuncionarioDetalhes as any).mockRejectedValue(
        new Error('Funcionário não pertence ao seu time')
      )
      const res = await request(app).get('/supervisor/funcionario/abc/detalhes?startDate=2026-04-01T00:00:00Z&endDate=2026-04-30T23:59:59Z')
      expect(res.status).toBe(403)
    })

    it('Deve retornar 404 quando funcionário inexistente', async () => {
      const app = buildApp({ id: 'sup1', role: 'comercial', is_supervisor: true })
      ;(SupervisorMetricsService.getFuncionarioDetalhes as any).mockRejectedValue(
        new Error('Funcionário não encontrado')
      )
      const res = await request(app).get('/supervisor/funcionario/abc/detalhes?startDate=2026-04-01T00:00:00Z&endDate=2026-04-30T23:59:59Z')
      expect(res.status).toBe(404)
    })

    it('Deve retornar 200 com dados quando válido', async () => {
      const app = buildApp({ id: 'sup1', role: 'comercial', is_supervisor: true })
      const fake = { funcionario: { id: 'f1', nome: 'X', nivel: 'C2', email: 'x@x' }, periodo: {start:'a',end:'b'}, detalhamento: { leadsPorDia: [], consultoriasPorStatus: {}, assessoriasPorStatus: {} }, leads: [], consultorias: [], assessorias: [] }
      ;(SupervisorMetricsService.getFuncionarioDetalhes as any).mockResolvedValue(fake)
      const res = await request(app).get('/supervisor/funcionario/f1/detalhes?startDate=2026-04-01T00:00:00Z&endDate=2026-04-30T23:59:59Z')
      expect(res.status).toBe(200)
      expect(res.body.data).toEqual(fake)
    })
  })
})
```

- [ ] **Step 2: Rodar testes**

```bash
cd backend && npm test -- SupervisorMetricsController
```
Expected: 7 testes passam.

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/__tests__/SupervisorMetricsController.test.ts
git commit -m "test(supervisor-metricas): cobrir SupervisorMetricsController"
```

---

## Task 8: Frontend — Tipos compartilhados

**Files:**
- Create: `frontendBoraExpandir/src/modules/comercial/types/supervisorMetrics.ts`

- [ ] **Step 1: Criar arquivo de tipos (espelha o backend)**

```typescript
// frontendBoraExpandir/src/modules/comercial/types/supervisorMetrics.ts
export type Nivel = 'C1' | 'C2' | 'HEAD'

export interface FuncionarioMetricas {
  id: string
  nome: string
  nivel: Nivel
  leadsCriados: number
  consultoriasAgendadas: number
  consultoriasRealizadas: number
  taxaComparecimento: number
  taxaConversaoLeadConsultoria: number
  assessoriasIniciadas: number | null
  assessoriasFechadas: number | null
  taxaConversaoConsultoriaAssessoria: number | null
  ticketMedio: number | null
  faturamentoGerado: number | null
  comissaoAcumulada: number
  ranking: number
}

export interface KpisTime {
  totalLeads: number
  consultoriasAgendadas: number
  consultoriasRealizadas: number
  taxaComparecimento: number
  assessoriasFechadas: number
  ticketMedio: number
  faturamentoTotal: number
  comissaoTimeTotal: number
}

export interface TeamMetricsResponse {
  periodo: { start: string; end: string }
  kpisTime: KpisTime
  funcionarios: FuncionarioMetricas[]
}

export interface FuncionarioDetailsResponse {
  funcionario: { id: string; nome: string; nivel: Nivel; email: string }
  periodo: { start: string; end: string }
  detalhamento: {
    leadsPorDia: Array<{ data: string; qtd: number }>
    consultoriasPorStatus: Record<string, number>
    assessoriasPorStatus: Record<string, number>
  }
  leads: Array<{ id: string; nome: string; telefone: string; status: string; data_criacao: string }>
  consultorias: Array<{ id: string; cliente_nome: string; data_agendamento: string; status: string; valor: number | null }>
  assessorias: Array<{ id: string; cliente_nome: string; valor: number; status: string; data_inicio: string; data_fechamento: string | null }>
}

export type PeriodPreset = 'hoje' | 'semana' | 'mes' | 'ano' | 'custom'

export interface PeriodValue {
  preset: PeriodPreset
  start: string
  end: string
}
```

- [ ] **Step 2: Commit**

```bash
git add frontendBoraExpandir/src/modules/comercial/types/supervisorMetrics.ts
git commit -m "feat(supervisor-metricas): add tipos do frontend"
```

---

## Task 9: Frontend — Funções de service

**Files:**
- Modify: `frontendBoraExpandir/src/modules/comercial/services/comercialService.ts`

- [ ] **Step 1: Adicionar imports no topo se necessário**

Verificar se já tem `apiClient`. No topo do arquivo deve haver:
```typescript
import { apiClient } from '@/modules/shared/services/api';
```

Adicionar abaixo:
```typescript
import type {
  TeamMetricsResponse,
  FuncionarioDetailsResponse
} from '../types/supervisorMetrics';
```

- [ ] **Step 2: Adicionar 2 funções no final do arquivo**

```typescript
export async function getSupervisorTeamMetrics(
  startDate: string,
  endDate: string
): Promise<TeamMetricsResponse> {
  const result = await apiClient.get(
    `/comercial/supervisor/metricas-time?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  )
  return (result.data as TeamMetricsResponse)
}

export async function getSupervisorFuncionarioDetalhes(
  funcionarioId: string,
  startDate: string,
  endDate: string
): Promise<FuncionarioDetailsResponse> {
  const result = await apiClient.get(
    `/comercial/supervisor/funcionario/${funcionarioId}/detalhes?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  )
  return (result.data as FuncionarioDetailsResponse)
}
```

- [ ] **Step 3: Commit**

```bash
git add frontendBoraExpandir/src/modules/comercial/services/comercialService.ts
git commit -m "feat(supervisor-metricas): add funcoes de service no comercialService"
```

---

## Task 10: Frontend — Hooks React Query

**Files:**
- Create: `frontendBoraExpandir/src/modules/comercial/hooks/useSupervisorMetrics.ts`

- [ ] **Step 1: Criar arquivo de hooks**

```typescript
// frontendBoraExpandir/src/modules/comercial/hooks/useSupervisorMetrics.ts
import { useQuery } from '@tanstack/react-query'
import {
  getSupervisorTeamMetrics,
  getSupervisorFuncionarioDetalhes
} from '../services/comercialService'

export function useTeamMetrics(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['supervisor-team-metrics', startDate, endDate],
    queryFn: () => getSupervisorTeamMetrics(startDate, endDate),
    staleTime: 60_000,
    enabled: !!startDate && !!endDate
  })
}

export function useFuncionarioDetails(
  funcionarioId: string | null,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: ['supervisor-funcionario-details', funcionarioId, startDate, endDate],
    queryFn: () => getSupervisorFuncionarioDetalhes(funcionarioId!, startDate, endDate),
    staleTime: 60_000,
    enabled: !!funcionarioId && !!startDate && !!endDate
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add frontendBoraExpandir/src/modules/comercial/hooks/useSupervisorMetrics.ts
git commit -m "feat(supervisor-metricas): add hooks React Query"
```

---

## Task 11: Frontend — PeriodFilter component

**Files:**
- Create: `frontendBoraExpandir/src/modules/comercial/components/supervisor/PeriodFilter.tsx`

- [ ] **Step 1: Criar componente**

```tsx
// frontendBoraExpandir/src/modules/comercial/components/supervisor/PeriodFilter.tsx
import { useMemo } from 'react'
import type { PeriodPreset, PeriodValue } from '../../types/supervisorMetrics'

interface Props {
  value: PeriodValue
  onChange: (next: PeriodValue) => void
}

const PRESETS: Array<{ key: PeriodPreset; label: string }> = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes', label: 'Este mês' },
  { key: 'ano', label: 'Este ano' },
  { key: 'custom', label: 'Custom' }
]

export function computePeriod(preset: PeriodPreset, customStart?: string, customEnd?: string): { start: string; end: string } {
  const now = new Date()
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999)

  if (preset === 'hoje') {
    return { start: startOfDay.toISOString(), end: endOfDay.toISOString() }
  }
  if (preset === 'semana') {
    const day = now.getDay() // 0 = domingo
    const diff = day === 0 ? 6 : day - 1 // segunda
    const monday = new Date(startOfDay); monday.setDate(monday.getDate() - diff)
    return { start: monday.toISOString(), end: endOfDay.toISOString() }
  }
  if (preset === 'mes') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start: first.toISOString(), end: endOfDay.toISOString() }
  }
  if (preset === 'ano') {
    const first = new Date(now.getFullYear(), 0, 1)
    return { start: first.toISOString(), end: endOfDay.toISOString() }
  }
  // custom
  return {
    start: customStart ? new Date(customStart).toISOString() : startOfDay.toISOString(),
    end: customEnd ? new Date(customEnd).toISOString() : endOfDay.toISOString()
  }
}

export function PeriodFilter({ value, onChange }: Props) {
  const isCustom = value.preset === 'custom'

  const handlePreset = (preset: PeriodPreset) => {
    if (preset === 'custom') {
      onChange({ ...value, preset })
      return
    }
    const { start, end } = computePeriod(preset)
    onChange({ preset, start, end })
  }

  const handleCustomChange = (field: 'start' | 'end', val: string) => {
    if (!val) return
    const start = field === 'start' ? new Date(val).toISOString() : value.start
    const end = field === 'end' ? new Date(val).toISOString() : value.end
    onChange({ preset: 'custom', start, end })
  }

  const customStartDate = useMemo(() => value.start.slice(0, 10), [value.start])
  const customEndDate = useMemo(() => value.end.slice(0, 10), [value.end])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => handlePreset(p.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              value.preset === p.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {isCustom && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => handleCustomChange('start', e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          />
          <span className="text-muted-foreground">→</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => handleCustomChange('end', e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontendBoraExpandir/src/modules/comercial/components/supervisor/PeriodFilter.tsx
git commit -m "feat(supervisor-metricas): add PeriodFilter component"
```

---

## Task 12: Frontend — MetricsTeamSummary component

**Files:**
- Create: `frontendBoraExpandir/src/modules/comercial/components/supervisor/MetricsTeamSummary.tsx`

- [ ] **Step 1: Criar componente**

```tsx
// frontendBoraExpandir/src/modules/comercial/components/supervisor/MetricsTeamSummary.tsx
import { Users, Calendar, CheckCircle2, DollarSign, FileText, Percent } from 'lucide-react'
import type { KpisTime } from '../../types/supervisorMetrics'

interface Props {
  kpis: KpisTime
  loading?: boolean
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function fmtPct(v: number) {
  return `${(v * 100).toFixed(0)}%`
}

function KpiCard({
  icon: Icon, label, value, sublabel
}: { icon: any; label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-start gap-3">
      <div className="p-2 rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-0.5 truncate">{value}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return <div className="rounded-lg border bg-card p-4 h-[88px] animate-pulse" />
}

export function MetricsTeamSummary({ kpis, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard icon={Users} label="Leads criados" value={String(kpis.totalLeads)} />
      <KpiCard
        icon={Calendar}
        label="Consultorias"
        value={`${kpis.consultoriasRealizadas}/${kpis.consultoriasAgendadas}`}
        sublabel={`Comparecimento ${fmtPct(kpis.taxaComparecimento)}`}
      />
      <KpiCard icon={CheckCircle2} label="Assessorias fechadas" value={String(kpis.assessoriasFechadas)} />
      <KpiCard icon={DollarSign} label="Faturamento" value={fmtBRL(kpis.faturamentoTotal)} />
      <KpiCard icon={FileText} label="Ticket médio" value={kpis.ticketMedio > 0 ? fmtBRL(kpis.ticketMedio) : '—'} />
      <KpiCard
        icon={Percent}
        label="Taxa comparecimento"
        value={fmtPct(kpis.taxaComparecimento)}
      />
      <KpiCard
        icon={DollarSign}
        label="Comissão time"
        value={fmtBRL(kpis.comissaoTimeTotal)}
        sublabel="Últimos 30d"
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontendBoraExpandir/src/modules/comercial/components/supervisor/MetricsTeamSummary.tsx
git commit -m "feat(supervisor-metricas): add MetricsTeamSummary component"
```

---

## Task 13: Frontend — FuncionarioMetricsTable component

**Files:**
- Create: `frontendBoraExpandir/src/modules/comercial/components/supervisor/FuncionarioMetricsTable.tsx`

- [ ] **Step 1: Criar componente**

```tsx
// frontendBoraExpandir/src/modules/comercial/components/supervisor/FuncionarioMetricsTable.tsx
import { ChevronRight } from 'lucide-react'
import type { FuncionarioMetricas, Nivel } from '../../types/supervisorMetrics'

interface Props {
  funcionarios: FuncionarioMetricas[]
  loading?: boolean
  onSelect: (id: string) => void
}

function fmtBRL(v: number | null | undefined) {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function fmtPct(v: number | null | undefined) {
  if (v == null) return '—'
  return `${(v * 100).toFixed(0)}%`
}

function NivelSection({
  titulo, subtitulo, funcionarios, isC2, onSelect
}: {
  titulo: string
  subtitulo: string
  funcionarios: FuncionarioMetricas[]
  isC2: boolean
  onSelect: (id: string) => void
}) {
  if (funcionarios.length === 0) return null
  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-base font-semibold">{titulo}</h3>
        <p className="text-xs text-muted-foreground">{subtitulo} ({funcionarios.length})</p>
      </div>
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Nome</th>
              <th className="px-3 py-2 text-right">Leads</th>
              <th className="px-3 py-2 text-right">Consultorias</th>
              <th className="px-3 py-2 text-right">Comparec.</th>
              <th className="px-3 py-2 text-right">Conv. L→C</th>
              {isC2 && (
                <>
                  <th className="px-3 py-2 text-right">Assess. fech.</th>
                  <th className="px-3 py-2 text-right">Conv. C→A</th>
                  <th className="px-3 py-2 text-right">Ticket médio</th>
                  <th className="px-3 py-2 text-right">Faturam.</th>
                </>
              )}
              <th className="px-3 py-2 text-right">Comissão</th>
              <th className="px-3 py-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {funcionarios.map((f) => (
              <tr
                key={f.id}
                onClick={() => onSelect(f.id)}
                className="border-t hover:bg-muted/30 cursor-pointer"
              >
                <td className="px-3 py-2 font-semibold">{f.ranking}</td>
                <td className="px-3 py-2">{f.nome}</td>
                <td className="px-3 py-2 text-right">{f.leadsCriados}</td>
                <td className="px-3 py-2 text-right">{f.consultoriasRealizadas}/{f.consultoriasAgendadas}</td>
                <td className="px-3 py-2 text-right">{fmtPct(f.taxaComparecimento)}</td>
                <td className="px-3 py-2 text-right">{fmtPct(f.taxaConversaoLeadConsultoria)}</td>
                {isC2 && (
                  <>
                    <td className="px-3 py-2 text-right">{f.assessoriasFechadas ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{fmtPct(f.taxaConversaoConsultoriaAssessoria)}</td>
                    <td className="px-3 py-2 text-right">{fmtBRL(f.ticketMedio)}</td>
                    <td className="px-3 py-2 text-right">{fmtBRL(f.faturamentoGerado)}</td>
                  </>
                )}
                <td className="px-3 py-2 text-right">{fmtBRL(f.comissaoAcumulada)}</td>
                <td className="px-3 py-2 text-muted-foreground"><ChevronRight className="h-4 w-4" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FuncionarioMetricsTable({ funcionarios, loading, onSelect }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-32 rounded-lg border animate-pulse" />
        <div className="h-32 rounded-lg border animate-pulse" />
      </div>
    )
  }

  if (funcionarios.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhum funcionário atribuído ao seu time. Peça ao admin para vincular delegados.
        </p>
      </div>
    )
  }

  const c1 = funcionarios.filter((f) => f.nivel === 'C1')
  const c2 = funcionarios.filter((f) => f.nivel === 'C2')

  return (
    <div className="space-y-6">
      <NivelSection titulo="C2 — Closer" subtitulo="Vendedores que fecham assessoria" funcionarios={c2} isC2={true} onSelect={onSelect} />
      <NivelSection titulo="C1 — Hunter" subtitulo="Captação de leads + agendamento" funcionarios={c1} isC2={false} onSelect={onSelect} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontendBoraExpandir/src/modules/comercial/components/supervisor/FuncionarioMetricsTable.tsx
git commit -m "feat(supervisor-metricas): add FuncionarioMetricsTable component"
```

---

## Task 14: Frontend — FuncionarioDetailsModal component

**Files:**
- Create: `frontendBoraExpandir/src/modules/comercial/components/supervisor/FuncionarioDetailsModal.tsx`

- [ ] **Step 1: Verificar Dialog do Radix UI disponível**

```bash
grep -rn "from '.*ui/dialog'" frontendBoraExpandir/src/modules/comercial --include="*.tsx" | head -3
```
Deve mostrar imports existentes (provável `@/modules/shared/components/ui/dialog`). Se sim, usar esse path. Caso contrário, usar `@radix-ui/react-dialog` direto.

- [ ] **Step 2: Criar componente (ajustar import do Dialog se necessário)**

```tsx
// frontendBoraExpandir/src/modules/comercial/components/supervisor/FuncionarioDetailsModal.tsx
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/modules/shared/components/ui/dialog'
import { useFuncionarioDetails } from '../../hooks/useSupervisorMetrics'
import type { FuncionarioDetailsResponse } from '../../types/supervisorMetrics'

interface Props {
  funcionarioId: string | null
  startDate: string
  endDate: string
  onClose: () => void
}

type Tab = 'resumo' | 'leads' | 'consultorias' | 'assessorias'

function fmtBRL(v: number | null | undefined) {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}
function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

function ResumoTab({ d }: { d: FuncionarioDetailsResponse }) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h4 className="font-semibold mb-1">Leads criados por dia</h4>
        {d.detalhamento.leadsPorDia.length === 0 ? (
          <p className="text-muted-foreground">Nenhum lead no período.</p>
        ) : (
          <ul className="space-y-1 max-h-40 overflow-auto">
            {d.detalhamento.leadsPorDia.map((p) => (
              <li key={p.data} className="flex justify-between">
                <span>{fmtDate(p.data)}</span>
                <span className="font-medium">{p.qtd}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h4 className="font-semibold mb-1">Consultorias por status</h4>
        <ul className="space-y-1">
          {Object.entries(d.detalhamento.consultoriasPorStatus).map(([k, v]) => (
            <li key={k} className="flex justify-between"><span>{k}</span><span className="font-medium">{v}</span></li>
          ))}
        </ul>
      </div>
      {d.funcionario.nivel === 'C2' && (
        <div>
          <h4 className="font-semibold mb-1">Assessorias por status</h4>
          <ul className="space-y-1">
            {Object.entries(d.detalhamento.assessoriasPorStatus).map(([k, v]) => (
              <li key={k} className="flex justify-between"><span>{k}</span><span className="font-medium">{v}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ListTab({ items, columns, emptyText }: {
  items: any[]
  columns: Array<{ key: string; label: string; render?: (v: any) => string }>
  emptyText: string
}) {
  if (items.length === 0) return <p className="text-muted-foreground text-sm">{emptyText}</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>{columns.map((c) => <th key={c.key} className="px-2 py-1.5 text-left">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-t">
              {columns.map((c) => (
                <td key={c.key} className="px-2 py-1.5">
                  {c.render ? c.render(it[c.key]) : (it[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function FuncionarioDetailsModal({ funcionarioId, startDate, endDate, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('resumo')
  const { data, isLoading, error } = useFuncionarioDetails(funcionarioId, startDate, endDate)

  return (
    <Dialog open={!!funcionarioId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{data?.funcionario.nome ?? 'Detalhes do funcionário'}</DialogTitle>
          {data && <p className="text-xs text-muted-foreground">{data.funcionario.email} · {data.funcionario.nivel}</p>}
        </DialogHeader>

        {isLoading && <p className="text-muted-foreground text-sm py-8 text-center">Carregando...</p>}
        {error && <p className="text-destructive text-sm py-8 text-center">Erro ao carregar detalhes.</p>}

        {data && (
          <>
            <div className="flex gap-1 border-b mb-3">
              {(['resumo', 'leads', 'consultorias', ...(data.funcionario.nivel === 'C2' ? ['assessorias' as Tab] : [])] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                    tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === 'resumo' && <ResumoTab d={data} />}
            {tab === 'leads' && (
              <ListTab
                items={data.leads}
                emptyText="Nenhum lead criado no período."
                columns={[
                  { key: 'nome', label: 'Nome' },
                  { key: 'telefone', label: 'Telefone' },
                  { key: 'status', label: 'Status' },
                  { key: 'data_criacao', label: 'Criado em', render: fmtDate }
                ]}
              />
            )}
            {tab === 'consultorias' && (
              <ListTab
                items={data.consultorias}
                emptyText="Nenhuma consultoria no período."
                columns={[
                  { key: 'cliente_nome', label: 'Cliente' },
                  { key: 'data_agendamento', label: 'Data', render: fmtDate },
                  { key: 'status', label: 'Status' },
                  { key: 'valor', label: 'Valor', render: (v) => fmtBRL(v) }
                ]}
              />
            )}
            {tab === 'assessorias' && data.funcionario.nivel === 'C2' && (
              <ListTab
                items={data.assessorias}
                emptyText="Nenhuma assessoria no período."
                columns={[
                  { key: 'cliente_nome', label: 'Cliente' },
                  { key: 'valor', label: 'Valor', render: (v) => fmtBRL(v) },
                  { key: 'status', label: 'Status' },
                  { key: 'data_inicio', label: 'Início', render: fmtDate },
                  { key: 'data_fechamento', label: 'Fechamento', render: fmtDate }
                ]}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontendBoraExpandir/src/modules/comercial/components/supervisor/FuncionarioDetailsModal.tsx
git commit -m "feat(supervisor-metricas): add FuncionarioDetailsModal component"
```

---

## Task 15: Frontend — Refazer SupervisorComercialPage

**Files:**
- Modify: `frontendBoraExpandir/src/modules/comercial/pages/supervisor/SupervisorComercialPage.tsx`

- [ ] **Step 1: Substituir todo o conteúdo do arquivo**

```tsx
// frontendBoraExpandir/src/modules/comercial/pages/supervisor/SupervisorComercialPage.tsx
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTeamMetrics } from '../../hooks/useSupervisorMetrics'
import { PeriodFilter, computePeriod } from '../../components/supervisor/PeriodFilter'
import { MetricsTeamSummary } from '../../components/supervisor/MetricsTeamSummary'
import { FuncionarioMetricsTable } from '../../components/supervisor/FuncionarioMetricsTable'
import { FuncionarioDetailsModal } from '../../components/supervisor/FuncionarioDetailsModal'
import type { PeriodValue } from '../../types/supervisorMetrics'

export default function SupervisorComercialPage() {
  const { activeProfile } = useAuth()
  const queryClient = useQueryClient()

  const [period, setPeriod] = useState<PeriodValue>(() => {
    const { start, end } = computePeriod('mes')
    return { preset: 'mes', start, end }
  })
  const [selectedFuncId, setSelectedFuncId] = useState<string | null>(null)

  const { data, isLoading, isFetching, error } = useTeamMetrics(period.start, period.end)

  // Guard: só supervisor comercial pode ver
  if (!activeProfile) return null
  const isSupervisor =
    activeProfile.role === 'comercial' && (activeProfile as any).is_supervisor === true
  if (!isSupervisor) return <Navigate to="/comercial" replace />

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['supervisor-team-metrics'] })
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-5">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Métricas do Time</h1>
          <p className="text-sm text-muted-foreground">
            Visão consolidada da performance dos seus delegados.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-card hover:bg-muted text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </header>

      <PeriodFilter value={period} onChange={setPeriod} />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Erro ao carregar métricas. <button className="underline" onClick={handleRefresh}>Tentar novamente</button>
        </div>
      )}

      <MetricsTeamSummary
        kpis={data?.kpisTime ?? {
          totalLeads: 0, consultoriasAgendadas: 0, consultoriasRealizadas: 0,
          taxaComparecimento: 0, assessoriasFechadas: 0, ticketMedio: 0,
          faturamentoTotal: 0, comissaoTimeTotal: 0
        }}
        loading={isLoading}
      />

      <FuncionarioMetricsTable
        funcionarios={data?.funcionarios ?? []}
        loading={isLoading}
        onSelect={setSelectedFuncId}
      />

      <FuncionarioDetailsModal
        funcionarioId={selectedFuncId}
        startDate={period.start}
        endDate={period.end}
        onClose={() => setSelectedFuncId(null)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd frontendBoraExpandir && npx tsc --noEmit 2>&1 | grep -E "supervisor|SupervisorComercialPage|MetricsTeamSummary|FuncionarioMetrics|FuncionarioDetails|PeriodFilter|useSupervisorMetrics" | head -20
```
Expected: zero matches (sem erros nos arquivos novos). Erros pré-existentes em outros arquivos podem aparecer e devem ser ignorados.

- [ ] **Step 3: Commit**

```bash
git add frontendBoraExpandir/src/modules/comercial/pages/supervisor/SupervisorComercialPage.tsx
git commit -m "feat(supervisor-metricas): refazer SupervisorComercialPage usando novos componentes"
```

---

## Task 16: Frontend — Smoke tests

**Files:**
- Create: `frontendBoraExpandir/src/modules/comercial/components/supervisor/__tests__/PeriodFilter.test.tsx`
- Create: `frontendBoraExpandir/src/modules/comercial/components/supervisor/__tests__/FuncionarioMetricsTable.test.tsx`

- [ ] **Step 1: Teste do PeriodFilter**

```tsx
// frontendBoraExpandir/src/modules/comercial/components/supervisor/__tests__/PeriodFilter.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PeriodFilter, computePeriod } from '../PeriodFilter'

describe('PeriodFilter', () => {
  it('renderiza todos os presets', () => {
    const { start, end } = computePeriod('mes')
    render(<PeriodFilter value={{ preset: 'mes', start, end }} onChange={() => {}} />)
    expect(screen.getByText('Hoje')).toBeInTheDocument()
    expect(screen.getByText('Esta semana')).toBeInTheDocument()
    expect(screen.getByText('Este mês')).toBeInTheDocument()
    expect(screen.getByText('Este ano')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('chama onChange com novo período ao clicar em preset', () => {
    const onChange = vi.fn()
    const { start, end } = computePeriod('mes')
    render(<PeriodFilter value={{ preset: 'mes', start, end }} onChange={onChange} />)
    fireEvent.click(screen.getByText('Hoje'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ preset: 'hoje' }))
  })

  it('exibe inputs de data quando preset = custom', () => {
    const { start, end } = computePeriod('mes')
    render(<PeriodFilter value={{ preset: 'custom', start, end }} onChange={() => {}} />)
    const inputs = document.querySelectorAll('input[type=date]')
    expect(inputs.length).toBe(2)
  })
})
```

- [ ] **Step 2: Teste do FuncionarioMetricsTable**

```tsx
// frontendBoraExpandir/src/modules/comercial/components/supervisor/__tests__/FuncionarioMetricsTable.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FuncionarioMetricsTable } from '../FuncionarioMetricsTable'
import type { FuncionarioMetricas } from '../../../types/supervisorMetrics'

const baseFunc: FuncionarioMetricas = {
  id: '', nome: '', nivel: 'C1',
  leadsCriados: 0, consultoriasAgendadas: 0, consultoriasRealizadas: 0,
  taxaComparecimento: 0, taxaConversaoLeadConsultoria: 0,
  assessoriasIniciadas: null, assessoriasFechadas: null,
  taxaConversaoConsultoriaAssessoria: null, ticketMedio: null,
  faturamentoGerado: null, comissaoAcumulada: 0, ranking: 0
}

describe('FuncionarioMetricsTable', () => {
  it('mostra empty state quando lista vazia', () => {
    render(<FuncionarioMetricsTable funcionarios={[]} onSelect={() => {}} />)
    expect(screen.getByText(/Nenhum funcionário/)).toBeInTheDocument()
  })

  it('agrupa por C1 e C2 e mostra os títulos', () => {
    const funcs: FuncionarioMetricas[] = [
      { ...baseFunc, id: '1', nome: 'C1-A', nivel: 'C1' },
      { ...baseFunc, id: '2', nome: 'C2-A', nivel: 'C2', assessoriasFechadas: 1, faturamentoGerado: 100 }
    ]
    render(<FuncionarioMetricsTable funcionarios={funcs} onSelect={() => {}} />)
    expect(screen.getByText(/C2 — Closer/)).toBeInTheDocument()
    expect(screen.getByText(/C1 — Hunter/)).toBeInTheDocument()
    expect(screen.getByText('C1-A')).toBeInTheDocument()
    expect(screen.getByText('C2-A')).toBeInTheDocument()
  })

  it('chama onSelect com id ao clicar na linha', () => {
    const onSelect = vi.fn()
    render(<FuncionarioMetricsTable funcionarios={[{ ...baseFunc, id: 'abc', nome: 'X' }]} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('X'))
    expect(onSelect).toHaveBeenCalledWith('abc')
  })
})
```

- [ ] **Step 3: Rodar testes**

```bash
cd frontendBoraExpandir && npm test -- supervisor
```
Expected: todos passam.

- [ ] **Step 4: Commit**

```bash
git add frontendBoraExpandir/src/modules/comercial/components/supervisor/__tests__/
git commit -m "test(supervisor-metricas): smoke tests dos componentes principais"
```

---

## Task 17: Validação manual + commit final do plano

- [ ] **Step 1: Subir backend localmente**

```bash
cd backend && npm run dev
```
Confirmar que sobe sem erros.

- [ ] **Step 2: Subir frontend localmente**

```bash
cd frontendBoraExpandir && npm run dev
```

- [ ] **Step 3: Login como supervisor comercial e validar**

Cenários:
1. Login como supervisor → navegar `/comercial/supervisor` → ver KPIs + tabela
2. Trocar período pra "Hoje" → dados refrescam
3. Clicar num funcionário → modal abre, navega entre tabs
4. Login como super admin → impersonar supervisor → repetir validações
5. Login como funcionário comum → tentar `/comercial/supervisor` → redirecionado pra `/comercial`

- [ ] **Step 4: Conferir console do browser**

Sem erros JS, sem warnings vermelhos. Network tab mostra chamadas a `/comercial/supervisor/metricas-time` retornando 200.

- [ ] **Step 5: Sem commit (validação apenas)**

Se houver issues, criar tasks de correção e iterar.

---

## Notas

- **Push:** apenas `@devops` pode fazer `git push`. Após Task 17, delegar push para `@devops *push`.
- **Migrations de schema:** plano assume que `clientes.criado_por`, `agendamentos.status`, `agendamentos.data_hora`, `contratos_servicos.usuario_id` etc. já existem (validado no spec). Se Task 0 revelar campos faltando, criar task de migration via `@data-engineer` antes de Task 3.
- **Bug correlato (proteção de rotas + ImpersonationBanner):** já corrigido fora deste plano (commit `d84cc6a`).
