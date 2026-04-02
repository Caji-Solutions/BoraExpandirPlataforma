# 📝 Mudanças Implementadas: Fluxo de Stages do Cliente

## 🎯 Objetivo

Rastrear a evolução do stage do cliente através do fluxo completo de assessoria jurídica:
- Cliente inicial → Assessoria criada → Em andamento → Finalizada

---

## 📋 Resumo das Mudanças

### 1️⃣ Backend - Controller (`JuridicoController.ts`)

**Adição:** Novo método `finalizarAssessoriaByCliente`

```typescript
async finalizarAssessoriaByCliente(req: any, res: any) {
  // 1. Atualiza stage do cliente para 'assessoria_finalizada'
  // 2. Atualiza status para 'assessoria_finalizada'  
  // 3. Finaliza agendamentos relacionados
  // 4. Envia notificação ao cliente
}
```

**Localização:** `backend/src/controllers/juridico/JuridicoController.ts` (linhas 1470-1520)

**O que faz:**
```
┌─────────────────────────────────────┐
│ POST /cliente/:clienteId/...         │
│ /finalizar-assessoria               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 1. UPDATE clientes SET              │
│    stage = 'assessoria_finalizada'  │
│    status = 'assessoria_finalizada' │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. UPDATE agendamentos SET          │
│    status = 'realizado'             │
│    WHERE cliente_id = ?             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Enviar notificação ao cliente    │
│    "Assessoria Técnica Concluída"   │
└─────────────────────────────────────┘
```

---

### 2️⃣ Backend - Rotas (`juridico.ts`)

**Adição:** Nova rota

```typescript
// Linha 81
juridico.post('/cliente/:clienteId/finalizar-assessoria', 
  JuridicoController.finalizarAssessoriaByCliente.bind(JuridicoController))
```

**Endpoint:** `POST /juridico/cliente/:clienteId/finalizar-assessoria`

**Headers Obrigatórios:**
```
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

**Body:** (vazio)
```json
{}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Assessoria finalizada e cliente atualizado."
}
```

---

### 3️⃣ Frontend - Serviços (`juridicoService.ts`)

**Adições:** Duas novas funções

```typescript
// Função 1: Via agendamento
export async function marcarAssessoriaRealizada(agendamentoId: string): Promise<any> {
  return apiClient.post(`/juridico/agendamentos/${agendamentoId}/assessoria-realizada`, {});
}

// Função 2: Via cliente
export async function marcarAssessoriaFinalizadaPeloCliente(clienteId: string): Promise<any> {
  return apiClient.post(`/juridico/cliente/${clienteId}/finalizar-assessoria`, {});
}
```

**Localização:** `frontendBoraExpandir/src/modules/juridico/services/juridicoService.ts` (linhas 449-460)

**Uso:**
```typescript
// Opção 1: Pelo cliente
await juridicoService.marcarAssessoriaFinalizadaPeloCliente(clienteId);

// Opção 2: Pelo agendamento
await juridicoService.marcarAssessoriaRealizada(agendamentoId);
```

---

### 4️⃣ Frontend - Página AssessoriaJuridica (`AssessoriaJuridica.tsx`)

**Mudança:** Adição de chamada para marcar em andamento

**Antes:**
```typescript
const handleSubmit = async () => {
  // ... validações ...
  
  // 1. Criar assessoria
  await juridicoService.createAssessoria({...});
  
  // 2. Buscar processo (direto)
  const proc = await juridicoService.getProcessoByCliente(selectedCliente.id);
  setCurrentProcess(proc);
}
```

**Depois:**
```typescript
const handleSubmit = async () => {
  // ... validações ...
  
  // 1. Criar assessoria
  await juridicoService.createAssessoria({...});
  
  // 2. Marcar assessoria como em andamento ← NOVO
  if (agendamentoIdParam) {
    await juridicoService.marcarAssessoriaEmAndamento(agendamentoIdParam);
  }
  
  // 3. Buscar processo
  const proc = await juridicoService.getProcessoByCliente(selectedCliente.id);
  setCurrentProcess(proc);
}
```

**Localização:** `frontendBoraExpandir/src/modules/juridico/pages/AssessoriaJuridica.tsx` (linhas 399-402)

**Mudança de Stage:**
```
Antes: cliente.stage = "pendente_agendamento"
       ↓ Criar Assessoria
Depois: cliente.stage = "consultoria_pendente"
        ↓ Marcar Em Andamento  ← NOVO
        cliente.stage = "assessoria_andamento"
```

---

## 🔄 Fluxo Completo de Stages

```
┌──────────────────────────────────────┐
│ 1. INICIAL                            │
│ stage = "pendente_agendamento"        │
└────────────┬─────────────────────────┘
             │
             │ Cria Assessoria
             │ POST /juridico/assessoria
             ▼
┌──────────────────────────────────────┐
│ 2. ASSESSORIA CRIADA                  │
│ stage = "consultoria_pendente"        │
│ status = "em_consultoria"             │
└────────────┬─────────────────────────┘
             │
             │ Marca Em Andamento (NOVO)
             │ POST /agendamentos/{id}/
             │      /assessoria-em-andamento
             ▼
┌──────────────────────────────────────┐
│ 3. EM ANDAMENTO                       │
│ stage = "assessoria_andamento"        │
│ status = "em_consultoria"             │
└────────────┬─────────────────────────┘
             │
             │ Finaliza Assessoria (NOVO)
             │ POST /cliente/{id}/
             │      /finalizar-assessoria
             ▼
┌──────────────────────────────────────┐
│ 4. FINALIZADO                         │
│ stage = "assessoria_finalizada"       │
│ status = "assessoria_finalizada"      │
│ agendamentos.status = "realizado"     │
└──────────────────────────────────────┘
```

---

## 📊 Mapeamento de Campos Alterados

| Campo | Tabela | Antes | Depois | Trigger |
|-------|--------|-------|--------|---------|
| `stage` | clientes | `pendente_agendamento` | `consultoria_pendente` | Criar Assessoria |
| `stage` | clientes | `consultoria_pendente` | `assessoria_andamento` | Marcar Em Andamento |
| `stage` | clientes | `assessoria_andamento` | `assessoria_finalizada` | Finalizar Assessoria |
| `status` | clientes | `ativo` | `assessoria_finalizada` | Finalizar Assessoria |
| `atualizado_em` | clientes | (antigo) | NOW() | Cada mudança |
| `status` | agendamentos | `agendado` | `realizado` | Finalizar Assessoria |

---

## 🧪 Como Testar

### Opção 1: Script Automatizado (Recomendado)

```bash
# Terminal 1: Inicie o backend
cd backend && npm run dev

# Terminal 2: Execute o teste
JWT_TOKEN="seu_token" \
CLIENTE_ID="uuid-cliente" \
RESPONSAVEL_ID="uuid-usuario" \
VERBOSE=true \
npx ts-node tests/test-stage-timeline.ts
```

**Resultado esperado:**
```
█████████████████████████████████████████
  TESTE COMPLETO: TIMELINE DE STAGES DO CLIENTE
█████████████████████████████████████████

✓ Stage atual do cliente: "pendente_agendamento"

═══════════════════════════════════════════
  ETAPA 2: Criar Assessoria Jurídica
═══════════════════════════════════════════

✓ Criando assessoria...
✓ Assessoria criada com sucesso
✓ Stage após criar assessoria: "consultoria_pendente"

═══════════════════════════════════════════
  ETAPA 3: Marcar Assessoria como Em Andamento
═══════════════════════════════════════════

✓ Marcando agendamento como em andamento...
✓ Stage após marcar em andamento: "assessoria_andamento"

═══════════════════════════════════════════
  ETAPA 4: Finalizar Assessoria
═══════════════════════════════════════════

✓ Finalizando assessoria do cliente...
✓ Stage após finalizar: "assessoria_finalizada"

═══════════════════════════════════════════
  RELATÓRIO FINAL: TIMELINE DE STAGES
═══════════════════════════════════════════

📌 Evolução do Stage do Cliente:

  1. Criar Assessoria
     De: "pendente_agendamento" → Para: "consultoria_pendente"
     Stage foi atualizado? ✓ SIM

  2. Marcar Em Andamento
     De: "consultoria_pendente" → Para: "assessoria_andamento"
     Stage foi atualizado? ✓ SIM

  3. Finalizar
     De: "assessoria_andamento" → Para: "assessoria_finalizada"
     Stage foi atualizado? ✓ SIM
```

---

### Opção 2: Testes com CURL

#### Teste 2.1: Obter stage inicial
```bash
curl -X GET "http://localhost:3000/api/cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.stage'

# Resultado esperado: "pendente_agendamento"
```

#### Teste 2.2: Criar assessoria
```bash
curl -X POST "http://localhost:3000/api/juridico/assessoria" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "'$CLIENTE_ID'",
    "responsavelId": "'$RESPONSAVEL_ID'",
    "respostas": {
      "servico_contratado": "Teste",
      "titular_nome": "Teste",
      "dependentes_info": "Teste",
      "pedido_para": "titular_somente",
      "pedido_para_detalhe": "Teste",
      "local_solicitacao": "espanha",
      "consulado_cidade": "Madri",
      "cidade_protocolo": "Madri",
      "cidade_chegada": "Barcelona",
      "data_chegada": "2026-06-15",
      "resumo_executivo": "Teste",
      "docs_titular": "Teste",
      "docs_dependentes": "Teste",
      "orientacoes_praticas": "Teste",
      "duvidas_cliente": "Teste",
      "respostas_dadas": "Teste",
      "pontos_fracos": "Teste",
      "prazos_delicados": "Teste",
      "proximos_cliente": "Teste",
      "proximos_equipe": "Teste",
      "resumo_1_linha": "Teste"
    }
  }' | jq '.data.id'

# Após criar, verificar stage
curl -X GET "http://localhost:3000/api/cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.stage'

# Resultado esperado: "consultoria_pendente"
```

#### Teste 2.3: Marcar em andamento
```bash
# Encontrar agendamento do cliente
AGENDAMENTO_ID=$(curl -s -X GET "http://localhost:3000/api/juridico/agendamentos/por-responsavel/$RESPONSAVEL_ID" \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r ".data[] | select(.cliente_id == \"$CLIENTE_ID\") | .id" | head -1)

# Marcar em andamento
curl -X POST "http://localhost:3000/api/juridico/agendamentos/$AGENDAMENTO_ID/assessoria-em-andamento" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Verificar novo stage
curl -X GET "http://localhost:3000/api/cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.stage'

# Resultado esperado: "assessoria_andamento"
```

#### Teste 2.4: Finalizar assessoria
```bash
curl -X POST "http://localhost:3000/api/juridico/cliente/$CLIENTE_ID/finalizar-assessoria" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Verificar stage final
curl -X GET "http://localhost:3000/api/cliente/$CLIENTE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {stage, status}'

# Resultado esperado: 
# {
#   "stage": "assessoria_finalizada",
#   "status": "assessoria_finalizada"
# }
```

---

### Opção 3: Verificar no Banco de Dados

```sql
-- Ver timeline completa do cliente
SELECT 
  id,
  nome,
  stage,
  status,
  atualizado_em,
  criado_em
FROM clientes
WHERE id = 'CLIENTE_ID'
ORDER BY atualizado_em DESC;

-- Ver histórico de agendamentos
SELECT 
  id,
  cliente_id,
  status,
  data_hora,
  atualizado_em
FROM agendamentos
WHERE cliente_id = 'CLIENTE_ID'
ORDER BY atualizado_em DESC;

-- Ver assessoria criada
SELECT 
  id,
  cliente_id,
  responsavel_id,
  criado_em,
  atualizado_em
FROM juridico_assessorias
WHERE cliente_id = 'CLIENTE_ID'
ORDER BY criado_em DESC LIMIT 1;

-- Ver processo sincronizado
SELECT 
  id,
  cliente_id,
  assessoria_id,
  status,
  etapa_atual,
  atualizado_em
FROM juridico_processos
WHERE cliente_id = 'CLIENTE_ID'
ORDER BY atualizado_em DESC LIMIT 1;
```

---

## ✅ Checklist de Validação

- [ ] Stage inicial está correto (`pendente_agendamento`)
- [ ] Após criar assessoria, stage muda (`consultoria_pendente`)
- [ ] Após marcar em andamento, stage muda (`assessoria_andamento`)
- [ ] Após finalizar, stage muda (`assessoria_finalizada`)
- [ ] Status do cliente também é atualizado
- [ ] Agendamentos são marcados como realizados
- [ ] Notificação é enviada ao cliente
- [ ] Timestamps são atualizados
- [ ] Timeline aparece correta na plataforma

---

## 🔍 Debugar Problemas

### Problema 1: Stage não muda após criar assessoria
**Verificação:**
```bash
# 1. Ver logs do backend para erros
# 2. Verificar se cliente_id é válido
curl -X GET "http://localhost:3000/api/cliente/$CLIENTE_ID" -H "Authorization: Bearer $TOKEN"

# 3. Verificar se assessoria foi criada
curl -X GET "http://localhost:3000/api/juridico/assessoria/$CLIENTE_ID" -H "Authorization: Bearer $TOKEN"
```

### Problema 2: Rota não encontrada (404)
**Verificação:**
```bash
# Confirmar que a rota está registrada
grep "finalizar-assessoria" backend/src/routes/juridico.ts

# Confirmar método existe no controller
grep "finalizarAssessoriaByCliente" backend/src/controllers/juridico/JuridicoController.ts
```

### Problema 3: Erro "Cliente não encontrado"
**Verificação:**
```bash
# Ver cliente
SELECT * FROM clientes WHERE id = 'CLIENTE_ID';

# Se não existe, usar um cliente válido
SELECT id, nome FROM clientes LIMIT 5;
```

---

## 📈 Métricas de Sucesso

✅ **Métrica 1:** Cada etapa atualiza o stage
- [ ] Criar Assessoria: stage muda
- [ ] Marcar Em Andamento: stage muda
- [ ] Finalizar: stage muda

✅ **Métrica 2:** Timeline mostra a progressão
- [ ] Cliente vê as mudanças na plataforma
- [ ] Timestamps refletem cada ação

✅ **Métrica 3:** Relacionamentos estão consistentes
- [ ] assessoria_id vinculada ao processo
- [ ] agendamento vinculado ao cliente

✅ **Métrica 4:** Notificações funcionam
- [ ] Cliente recebe notificação ao finalizar
- [ ] Centro de notificações atualizado

---

## 🚀 Próximas Melhorias

1. **Adicionar transições intermediárias**
   - Etapa "revisão_documentos"
   - Etapa "aguardando_cliente"

2. **Implementar rollback**
   - Se houver erro, reverter stage anterior

3. **Auditoria completa**
   - Log de quem fez cada mudança
   - Motivo da mudança

4. **Webhook/Event Bus**
   - Notificar outros serviços
   - Integrar com CRM

5. **Timeline visual**
   - Mostrar progresso do cliente
   - Histórico completo

---

## 📞 Sumário das Mudanças

| Arquivo | Tipo | Linhas | O que mudou |
|---------|------|--------|-----------|
| `JuridicoController.ts` | Backend | 1470-1520 | Novo método `finalizarAssessoriaByCliente` |
| `juridico.ts` | Backend | 81 | Nova rota POST `/cliente/:clienteId/finalizar-assessoria` |
| `juridicoService.ts` | Frontend | 449-460 | 2 funções: `marcarAssessoriaRealizada`, `marcarAssessoriaFinalizadaPeloCliente` |
| `AssessoriaJuridica.tsx` | Frontend | 399-402 | Chamada para `marcarAssessoriaEmAndamento` no handleSubmit |

