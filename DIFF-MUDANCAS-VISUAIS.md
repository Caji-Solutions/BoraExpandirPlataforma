# 🔄 Diferenças Visuais: Antes vs Depois

## 📍 Localização das Mudanças

```
📁 backend/
├── src/
│   ├── controllers/
│   │   └── juridico/
│   │       └── JuridicoController.ts          ← MUDANÇA 1 (Novo método)
│   │
│   └── routes/
│       └── juridico.ts                        ← MUDANÇA 2 (Nova rota)
│
📁 frontendBoraExpandir/
└── src/modules/
    └── juridico/
        ├── services/
        │   └── juridicoService.ts             ← MUDANÇA 3 (2 funções)
        │
        └── pages/
            └── AssessoriaJuridica.tsx         ← MUDANÇA 4 (1 chamada)
```

---

## ⚙️ MUDANÇA 1: Backend Controller

**Arquivo:** `backend/src/controllers/juridico/JuridicoController.ts`

### Linha 1470 - Início do novo método

**ANTES:** Método não existia
**DEPOIS:** Novo método adicionado

```diff
     }
+    // POST /juridico/cliente/:clienteId/finalizar-assessoria
+    async finalizarAssessoriaByCliente(req: any, res: any) {
+        try {
+            const { clienteId } = req.params;
+
+            if (!clienteId) {
+                return res.status(400).json({ message: 'Cliente ID é obrigatório' });
+            }
+
+            // 1. Atualizar stage do cliente para assessoria_finalizada
+            const { error: updateClienteError } = await supabase
+                .from('clientes')
+                .update({ 
+                    stage: 'assessoria_finalizada', 
+                    status: 'assessoria_finalizada',
+                    atualizado_em: new Date().toISOString()
+                })
+                .eq('id', clienteId);
+
+            if (updateClienteError) {
+                console.error('[finalizarAssessoriaByCliente] Erro ao atualizar stage:', updateClienteError);
+                throw updateClienteError;
+            }
+
+            // 2. Tentar encontrar e finalizar agendamentos em aberto para este cliente
+            await supabase
+                .from('agendamentos')
+                .update({ status: 'realizado' })
+                .eq('cliente_id', clienteId)
+                .in('status', ['confirmado', 'agendado', 'em_consultoria']);
+
+            // 3. Notificar o cliente
+            try {
+                await NotificationService.createNotification({
+                    clienteId: clienteId,
+                    titulo: 'Assessoria Técnica Concluída',
+                    mensagem: 'Todos os seus documentos foram analisados e aprovados pelo Jurídico. Sua assessoria técnica foi finalizada com sucesso.',
+                    tipo: 'success'
+                });
+            } catch (notifError) {
+                console.error('[finalizarAssessoriaByCliente] Erro ao notificar:', notifError);
+            }
+
+            return res.status(200).json({ 
+                success: true, 
+                message: 'Assessoria finalizada e cliente atualizado.' 
+            });
+        } catch (error: any) {
+            console.error('Erro ao finalizar assessoria por cliente:', error);
+            return res.status(500).json({ message: 'Erro ao finalizar assessoria', error: error.message });
+        }
+    }
 }

 export default new JuridicoController()
```

### O Que Esse Método Faz

```
INPUT: POST /cliente/:clienteId/finalizar-assessoria {}

PROCESSAMENTO:
  1. Validar clienteId
  2. UPDATE clientes SET stage = 'assessoria_finalizada'
  3. UPDATE agendamentos SET status = 'realizado'
  4. Criar notificação para cliente
  5. Retornar sucesso

OUTPUT: { success: true, message: "Assessoria finalizada..." }
```

---

## 📡 MUDANÇA 2: Backend Rotas

**Arquivo:** `backend/src/routes/juridico.ts`

**Linha 81:**

```diff
 juridico.post('/agendamentos/:id/em-andamento', JuridicoController.marcarConsultoriaEmAndamento.bind(JuridicoController))
 juridico.post('/agendamentos/:id/assessoria-em-andamento', JuridicoController.marcarAssessoriaEmAndamento.bind(JuridicoController))
 juridico.post('/agendamentos/:id/assessoria-realizada', JuridicoController.marcarAssessoriaRealizada.bind(JuridicoController))
 juridico.post('/agendamentos/:id/realizada', JuridicoController.marcarConsultoriaRealizada.bind(JuridicoController))
+juridico.post('/cliente/:clienteId/finalizar-assessoria', JuridicoController.finalizarAssessoriaByCliente.bind(JuridicoController))
```

### Nova Rota Registrada

```
METHOD:  POST
PATH:    /juridico/cliente/:clienteId/finalizar-assessoria
HANDLER: JuridicoController.finalizarAssessoriaByCliente
AUTH:    Bearer JWT_TOKEN (obrigatório)
```

---

## 🎨 MUDANÇA 3: Frontend Services

**Arquivo:** `frontendBoraExpandir/src/modules/juridico/services/juridicoService.ts`

**Linhas 449-460:**

### ANTES
```typescript
export async function marcarConsultoriaRealizada(agendamentoId: string, vendedorId?: string): Promise<any> {
  return apiClient.post(`/juridico/agendamentos/${agendamentoId}/realizada`, { vendedorId });
}

/**
 * Busca usuários comerciais nível C2
 */
export async function getUsuariosComerciaisC2(): Promise<any[]> {
```

### DEPOIS
```typescript
export async function marcarConsultoriaRealizada(agendamentoId: string, vendedorId?: string): Promise<any> {
  return apiClient.post(`/juridico/agendamentos/${agendamentoId}/realizada`, { vendedorId });
}

+/**
+ * Marca uma assessoria como realizada (atualiza stage do cliente para assessoria_finalizada)
+ */
+export async function marcarAssessoriaRealizada(agendamentoId: string): Promise<any> {
+  return apiClient.post(`/juridico/agendamentos/${agendamentoId}/assessoria-realizada`, {});
+}
+
+/**
+ * Marca uma assessoria como realizada usando o ID do cliente
+ */
+export async function marcarAssessoriaFinalizadaPeloCliente(clienteId: string): Promise<any> {
+  return apiClient.post(`/juridico/cliente/${clienteId}/finalizar-assessoria`, {});
+}

/**
 * Busca usuários comerciais nível C2
 */
export async function getUsuariosComerciaisC2(): Promise<any[]> {
```

### Duas Novas Funções Criadas

**Função 1:**
```typescript
marcarAssessoriaRealizada(agendamentoId)
├─ POST /juridico/agendamentos/{agendamentoId}/assessoria-realizada
└─ Body: {}
```

**Função 2:**
```typescript
marcarAssessoriaFinalizadaPeloCliente(clienteId)
├─ POST /juridico/cliente/{clienteId}/finalizar-assessoria
└─ Body: {}
```

### Exportadas no Export Default

```diff
 export default {
     getProcessos,
     getProcessosByResponsavel,
     getProcessosVagos,
     atribuirResponsavel,
     removerResponsavel,
     getFuncionariosJuridico,
     getAgendamentosDelegacao,
     atribuirResponsavelAgendamento,
     getClientesVagos,
     getAllClientesComResponsavel,
     getClientesByResponsavel,
     getCatalogServices,
     getFormulariosWithStatus,
     updateFormularioClienteStatus,
     getDocumentosCliente,
     getDocumentosByProcesso,
     getDependentes,
     updateDocumentStatus,
     requestDocument,
     requestRequirement,
     updateProcessEtapa,
     getRequerimentosByProcesso,
     getRequerimentosByCliente,
     updateRequerimentoStatus,
     getEstatisticas,
     createProcess,
     createAssessoria,
     getLatestAssessoria,
     getProcessoByCliente,
     getProcessoById,
     getAgendamentos,
     getAssessoriasByResponsavel,
     getAgendamentosByResponsavel,
     marcarConsultoriaEmAndamento,
     marcarAssessoriaEmAndamento,
     marcarConsultoriaRealizada,
+    marcarAssessoriaRealizada,
+    marcarAssessoriaFinalizadaPeloCliente,
     createDependent: async (
```

---

## 🎯 MUDANÇA 4: Frontend Página

**Arquivo:** `frontendBoraExpandir/src/modules/juridico/pages/AssessoriaJuridica.tsx`

**Linhas 396-407:**

### ANTES
```typescript
const handleSubmit = async () => {
  if (!selectedCliente || !activeProfile?.id) return;
  
  setIsSubmitting(true);
  setError(null);
  try {
    if (requiresSubservice && !selectedSubserviceId) {
      setError("Por favor, selecione um subserviço.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.resumo_1_linha.trim()) {
      setError("O campo 'Resumo em 1 linha' (Seção 8) é obrigatório.");
      setIsSubmitting(false);
      return;
    }

    const respostasMap = {
      // ... mapeamento de campos ...
    };

    // 1. Criar/Atualizar Assessoria (O BACKEND AGORA TRATA O PROCESSO)
    await juridicoService.createAssessoria({
      clienteId: selectedCliente.id,
      respostas: respostasMap,
      observacoes: formData.resumo_executivo,
      responsavelId: activeProfile.id,
      servicoId: selectedSubserviceId
    });

-      // 2. Buscar o processo (novo ou atualizado) para atualizar o estado local
+      // 2. Marcar assessoria como em andamento (atualiza stage do cliente) ← NOVA LINHA
+      if (agendamentoIdParam) {
+        await juridicoService.marcarAssessoriaEmAndamento(agendamentoIdParam);
+      }
+
+      // 3. Buscar o processo (novo ou atualizado) para atualizar o estado local
       const proc = await juridicoService.getProcessoByCliente(selectedCliente.id);
       setCurrentProcess(proc);
```

### O Que Mudou

**Antes:**
1. Criar Assessoria
2. ➜ Buscar Processo

**Depois:**
1. Criar Assessoria
2. ➜ **Marcar como Em Andamento** ← NOVO
3. ➜ Buscar Processo

---

## 📊 Resumo das Mudanças

| # | Arquivo | Tipo | O que Mudou | Impacto |
|---|---------|------|-----------|---------|
| 1 | `JuridicoController.ts` | Backend | +55 linhas | Novo endpoint para finalizar assessoria |
| 2 | `juridico.ts` | Backend | +1 linha | Nova rota registrada |
| 3 | `juridicoService.ts` | Frontend | +15 linhas | 2 funções novas exportadas |
| 4 | `AssessoriaJuridica.tsx` | Frontend | +4 linhas | Chamada para marcar em andamento |

**Total de Mudanças:**
- 🔴 75 linhas adicionadas
- 🟢 0 linhas removidas
- 🟡 1 linha modificada

---

## 🔄 Fluxo de Execução Completo

```
┌──────────────────────────────────────────┐
│ Frontend: handleSubmit()                 │
└────────┬─────────────────────────────────┘
         │
         ├─ Validar campos
         │
         ├─ 1. createAssessoria()
         │   └─ POST /juridico/assessoria
         │       └─ Backend: Cria assessoria + sincroniza processo
         │           └─ client.stage = "consultoria_pendente"
         │
         ├─ 2. marcarAssessoriaEmAndamento() ← NOVO
         │   └─ POST /agendamentos/{id}/assessoria-em-andamento
         │       └─ Backend: Marca agendamento e atualiza stage
         │           └─ client.stage = "assessoria_andamento"
         │
         └─ 3. getProcessoByCliente()
             └─ GET /processo-cliente/{id}
                 └─ Retorna processo atualizado

┌──────────────────────────────────────────┐
│ Depois, quando finalizar:                │
│ marcarAssessoriaFinalizadaPeloCliente()  │ ← NOVO
│ POST /cliente/:id/finalizar-assessoria   │
│ └─ Backend: Atualiza para finalizado     │
│     └─ client.stage = "assessoria_finalizada"
└──────────────────────────────────────────┘
```

---

## 🧪 Como as Mudanças São Testadas

```bash
# 1. Test Automático
npx ts-node tests/test-stage-timeline.ts
├─ ETAPA 1: Obter stage inicial
├─ ETAPA 2: Criar assessoria + verificar stage
├─ ETAPA 3: Marcar em andamento + verificar stage
├─ ETAPA 4: Finalizar + verificar stage
└─ Relatório com timeline completa

# 2. Test Manual com CURL
curl -X POST /cliente/:id/finalizar-assessoria ...
└─ Verifica se stage muda na resposta

# 3. Test no Frontend
Visually check Timeline → Stages evoluindo
└─ Plataforma mostra mudanças em tempo real
```

---

## ⚠️ Pontos de Atenção

### 1. Ordem de Execução Importante
```
createAssessoria() → AGUARDAR 1s → marcarAssessoriaEmAndamento()
```
❌ Não paralelo (senão pode haver race condition)

### 2. Validações
```
- clienteId deve ser válido
- agendamentoId (se fornecido) deve existir
- JWT_TOKEN deve estar válido
```

### 3. Transações
```
⚠️ NÃO há transação em DB
❌ Se falhar no meio, estado fica inconsistente
✅ Solução: Adicionar BEGIN TRANSACTION
```

### 4. Notificações
```
✅ Implementada: Notificação ao finalizar
⚠️ Erro na notificação não falha a requisição
```

---

## 🎨 Antes vs Depois: Visual Timeline

### ANTES (Sem as mudanças)
```
Cliente Criado
    ↓
Stage: "pendente_agendamento"
    ↓
Criar Assessoria
    ↓
Stage: ??? (Não muda automaticamente)
```

### DEPOIS (Com as mudanças)
```
Cliente Criado
    ↓
Stage: "pendente_agendamento"
    ↓
Criar Assessoria
    ├─ Stage: "consultoria_pendente"
    │
    ├─ Marcar Em Andamento ← NOVO
    │ └─ Stage: "assessoria_andamento"
    │
    └─ Finalizar ← NOVO
      └─ Stage: "assessoria_finalizada"
```

---

## 📋 Checklist: Tudo foi Adicionado Corretamente?

- ✅ Novo método `finalizarAssessoriaByCliente` em JuridicoController
- ✅ Nova rota `/cliente/:clienteId/finalizar-assessoria` em routes
- ✅ Função `marcarAssessoriaRealizada` no serviço
- ✅ Função `marcarAssessoriaFinalizadaPeloCliente` no serviço
- ✅ Chamada a `marcarAssessoriaEmAndamento` no handleSubmit
- ✅ Ambas funções exportadas no export default do serviço
- ✅ Stage do cliente é atualizado em cada etapa
- ✅ Notificação é enviada ao finalizar

---

## 🚀 Próxima Etapa

Execute o teste:
```bash
npx ts-node tests/test-stage-timeline.ts
```

Verifique a timeline no banco:
```sql
SELECT stage, atualizado_em FROM clientes WHERE id = 'ID' ORDER BY atualizado_em DESC;
```

Veja na plataforma:
```
http://localhost:3000/juridico/clientes
```

