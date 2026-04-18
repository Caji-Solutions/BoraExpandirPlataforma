# Tela de Métricas do Supervisor Comercial — Design Spec

**Data:** 2026-04-18
**Autor:** Bruno Porto + Claude (Opus 4.7)
**Status:** Aprovado para implementação

## 1. Contexto e motivação

A página `SupervisorComercialPage` atual (`/comercial/supervisor`) lista os delegados do supervisor e mostra dados básicos de comissão e vendas, mas não consolida visão de performance operacional do time. Supervisores comerciais precisam ver, num único lugar, quem do seu time está produzindo o que — para orientar coaching, redistribuir leads, e justificar mudanças de nível.

**Decisão de escopo:** refazer a página existente em vez de criar uma nova rota. A página atual tem pouco uso e a navegação existente (`Comercial.tsx` → `/comercial/supervisor`) será preservada.

## 2. Quem usa, escopo de dados

| Quem | O que vê |
|---|---|
| `comercial` + `is_supervisor=true` | Apenas funcionários sob ele (`profiles.supervisor_id = self.id`) |
| `super_admin` | Acessa via impersonação de um supervisor — vê os delegados daquele supervisor |
| Outros roles | Redirect para `/comercial` (ProtectedRoute + check interno na página) |

## 3. Métricas mostradas

Três blocos de métricas, todos calculados dentro do período selecionado.

### Bloco A — Operacional
- **Leads criados** (C1): `clientes WHERE criado_por = funcionarioId AND criado_em ∈ período`
- **Consultorias agendadas**: `agendamentos WHERE usuario_id = funcionarioId AND data_hora ∈ período`
- **Consultorias realizadas**: `agendamentos WHERE usuario_id = funcionarioId AND data_hora ∈ período AND status indica realização` (enum exato a confirmar na implementação — provavelmente `status='realizado'` ou `data_hora < now() AND status != 'cancelado'`)
- **Taxa de comparecimento**: `realizadas / agendadas`
- **Assessorias iniciadas** (C2): `contratos_servicos WHERE usuario_id = funcionarioId AND criado_em ∈ período`

### Bloco B — Conversão (qualidade)
- **Lead → Consultoria**: `consultoriasAgendadas / leadsCriados` (C1 e C2)
- **Consultoria → Assessoria**: `assessoriasFechadasNoPeriodo / consultoriasRealizadasNoPeriodo` (C2)
- **Ticket médio**: `sum(servico_valor das fechadas) / count(fechadas)` (C2)

### Bloco C — Financeiro / Resultado
- **Faturamento gerado**: `sum(servico_valor)` das assessorias fechadas no período
- **Comissão acumulada**: via `ComissaoService.calcularComissao(userId, cargo, mes, ano)` — usa rolling window 30d, divergência aceita
- **Ranking**: posição do funcionário dentro do próprio nível (C1 ranqueado por `leadsCriados`, C2 ranqueado por `faturamentoGerado`)

## 4. Arquitetura

Estratégia: **Híbrida pragmática (Abordagem 3)**.

### Backend — 2 endpoints novos

#### `GET /comercial/supervisor/metricas-time?startDate=&endDate=`
Auth: middleware existente + check `req.user.is_supervisor === true && req.user.role === 'comercial'`.

**Resposta (shape):**
```json
{
  "periodo": { "start": "2026-04-01", "end": "2026-04-30" },
  "kpisTime": {
    "totalLeads": 230,
    "consultoriasAgendadas": 87,
    "consultoriasRealizadas": 65,
    "taxaComparecimento": 0.747,
    "assessoriasFechadas": 28,
    "ticketMedio": 4500.00,
    "faturamentoTotal": 126000.00,
    "comissaoTimeTotal": 12600.00
  },
  "funcionarios": [
    {
      "id": "uuid", "nome": "Fulano", "nivel": "C1",
      "leadsCriados": 45,
      "consultoriasAgendadas": 18, "consultoriasRealizadas": 14,
      "taxaComparecimento": 0.78,
      "taxaConversaoLeadConsultoria": 0.40,
      "assessoriasIniciadas": null, "assessoriasFechadas": null,
      "taxaConversaoConsultoriaAssessoria": null,
      "ticketMedio": null, "faturamentoGerado": null,
      "comissaoAcumulada": 0, "ranking": 1
    }
  ]
}
```
Campos `null` = não se aplica ao nível.

**Implementação:** 4 queries Supabase em paralelo (`profiles` delegados, `clientes` no período, `agendamentos` no período, `contratos_servicos` no período) + N chamadas paralelas ao `ComissaoService` (uma por funcionário, via `Promise.all`) → agrega em JS → calcula taxas → ordena por nível + ranking. **Nota:** `ComissaoService` opera em janela rolling 30d, então `comissaoAcumulada` é sempre dos últimos 30 dias mesmo se o filtro for "Hoje" — divergência documentada com tooltip na UI (ver Seção 9).

#### `GET /comercial/supervisor/funcionario/:id/detalhes?startDate=&endDate=`
Auth: middleware + check que `:id` está nos delegados de `req.userId`.

**Resposta (shape):**
```json
{
  "funcionario": { "id", "nome", "nivel", "email" },
  "periodo": { "start", "end" },
  "detalhamento": {
    "leadsPorDia": [{ "data": "2026-04-01", "qtd": 3 }],
    "consultoriasPorStatus": { "agendado": 4, "realizado": 12, "cancelado": 2 },
    "assessoriasPorStatus": { "iniciada": 2, "em_andamento": 4, "fechada": 6 }
  },
  "leads": [{ "id", "nome", "telefone", "status", "data_criacao" }],
  "consultorias": [{ "id", "cliente_nome", "data_agendamento", "status", "valor" }],
  "assessorias": [{ "id", "cliente_nome", "valor", "status", "data_inicio", "data_fechamento" }]
}
```
**Lazy:** só carrega quando o modal abre (React Query `enabled: !!funcionarioId`).

### Frontend — 4 componentes novos

```
SupervisorComercialPage.tsx                     ← refeito; orquestrador
└── components/
    ├── PeriodFilter.tsx                        ← reutilizável, vai para shared/components/
    ├── MetricsTeamSummary.tsx                  ← KPI cards
    ├── FuncionarioMetricsTable.tsx             ← agrupada C1/C2, clicável
    └── FuncionarioDetailsModal.tsx             ← Radix Dialog + tabs
```

**Estado:**
- Período: `useState({ start, end, preset })`, default = "Este mês"
- Funcionário selecionado: `useState<string | null>(null)` → quando `!== null`, abre modal e dispara query
- Server state: React Query (`useTeamMetrics`, `useFuncionarioDetails`), `staleTime: 60_000`
- Botão "Refresh" → `queryClient.invalidateQueries(['team-metrics'])`

### Layout (responsivo, mobile-first)

```
┌─────────────────────────────────────────────────┐
│  Métricas do Time              [↻ Refresh]      │
│  [Hoje][Semana][Mês ✓][Ano][Custom▼]            │
├─────────────────────────────────────────────────┤
│ KPI cards (4 cols → 2 → 1)                      │
├─────────────────────────────────────────────────┤
│ ▼ C2 — Closer (3 funcionários)                  │
│   Tabela com Rank, Nome, Leads, Consul, Asses,  │
│   Faturamento, Comissão                         │
│ ▼ C1 — Hunter (5 funcionários)                  │
│   Tabela com Rank, Nome, Leads, Consul, Comis   │
└─────────────────────────────────────────────────┘
```
Mobile: KPI cards stack vertical, tabela vira lista de cards, modal vira fullscreen.

## 5. Mapeamento de schema (entidades reais)

| Conceito | Tabela | Campo chave |
|---|---|---|
| Funcionário | `profiles` | `id`, `nivel`, `is_supervisor`, `supervisor_id` |
| Lead criado | `clientes` | `criado_por`, `criado_em` |
| Consultoria | `agendamentos` | `usuario_id`, `data_hora`, `status`, `valor`, `pagamento_status` |
| Assessoria | `contratos_servicos` | `usuario_id`, `criado_em`, `assinatura_status`, `pagamento_status`, `pagamento_verificado_em`, `servico_valor` |
| Comissão | `comissoes` (via `ComissaoService`) | — |
| Delegação cliente↔C2 | `clientes.perfil_unificado.data.metadata.vendedor_c2_id` | — |

**Conferir na implementação:** enum exato de `agendamentos.status` (sabemos que existe `'agendado'`, `'confirmado'`, `'Conflito'` — falta confirmar `'realizado'`/`'cancelado'`/`'no_show'`).

## 6. Edge cases e error handling

- Supervisor sem delegados → endpoint retorna `funcionarios: []`, frontend mostra empty state com CTA "Atribua funcionários no painel admin"
- Período sem dados → KPIs zerados, funcionários listados com zeros (não esconde)
- Funcionário inativo no período → continua aparecendo se ainda tem `supervisor_id`; senão filtra
- `pagamento_verificado_em` null → fallback para `criado_em` (padrão já usado em `ComissaoRepository`)
- Período custom > 365d → cap com toast de aviso
- Backend: try/catch em cada query, log estruturado, 500 com `message` amigável
- Frontend: React Query `onError` → toast + retry button
- Não-supervisor → backend 403; frontend redirect `/comercial`

## 7. Bug correlato (já corrigido neste design)

Como pré-requisito do funcionamento correto da impersonação (super admin acessando como supervisor), foi corrigido o bug de proteção de rotas:

1. `main.tsx` importava `src/components/ProtectedRoute.tsx` (versão buggy que ignorava `allowedRoles` para super_admin mesmo durante impersonação) → agora importa `src/modules/shared/components/ProtectedRoute.tsx`
2. Versão buggy deletada
3. Adicionado `ImpersonationBanner.tsx` global (banner amarelo fixo no topo) com botão "Voltar ao Admin"

Sem isso, super admin impersonando supervisor não veria a tela funcionar como o supervisor real veria.

## 8. Testes

**Backend** (`backend/src/controllers/__tests__/SupervisorMetricsController.test.ts`):
- Supervisor sem delegados → `funcionarios: []`
- Supervisor com mix C1+C2 → ranking correto, campos `null` corretos
- Filtros de período (boundaries do start/end)
- Não-supervisor tentando acessar → 403
- Detalhes de funcionário fora dos delegados → 403

**Frontend** (`frontendBoraExpandir/src/modules/comercial/__tests__/`):
- `SupervisorComercialPage`: renderiza sem crash, troca de período dispara refetch
- `FuncionarioMetricsTable`: ordena por nivel + ranking, esconde colunas C2-only para C1

**Manual:** validar fluxo de impersonação super admin → supervisor → tela funciona corretamente.

## 9. Decisões adiadas

- Métrica de comissão usa janela rolling 30d (do `ComissaoService` existente). Divergência aceita vs filtros de Hoje/Semana/Mês — o número exibido é "comissão acumulada nos últimos 30 dias" independentemente do filtro principal. Documentar com tooltip.
- Export Excel/PDF: fora de escopo; pode ser adicionado depois.
- Notificações ao supervisor (ex: "Funcionário X caiu de produção esta semana"): fora de escopo.

## 10. Arquivos afetados

**Novos:**
- `backend/src/controllers/comercial/SupervisorMetricsController.ts`
- `backend/src/services/SupervisorMetricsService.ts`
- `backend/src/controllers/__tests__/SupervisorMetricsController.test.ts`
- `frontendBoraExpandir/src/modules/comercial/components/PeriodFilter.tsx` (movido p/ shared depois)
- `frontendBoraExpandir/src/modules/comercial/components/MetricsTeamSummary.tsx`
- `frontendBoraExpandir/src/modules/comercial/components/FuncionarioMetricsTable.tsx`
- `frontendBoraExpandir/src/modules/comercial/components/FuncionarioDetailsModal.tsx`

**Modificados:**
- `frontendBoraExpandir/src/modules/comercial/pages/supervisor/SupervisorComercialPage.tsx` (refeito)
- `backend/src/routes/comercial.ts` (registrar 2 rotas novas)
- `frontendBoraExpandir/src/modules/comercial/services/comercialService.ts` (2 funções novas: `getTeamMetrics`, `getFuncionarioDetails`)

**Já feitos (bug correlato):**
- `frontendBoraExpandir/src/main.tsx` (import corrigido + montagem do banner)
- `frontendBoraExpandir/src/modules/shared/pages/LoginPage.tsx` (import corrigido)
- `frontendBoraExpandir/src/modules/shared/components/ImpersonationBanner.tsx` (novo)
- `frontendBoraExpandir/src/components/ProtectedRoute.tsx` (deletado)
