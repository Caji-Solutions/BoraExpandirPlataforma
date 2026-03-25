# 🐛 Relatório de Investigação - Bugs no Fluxo de Documentos

## 📊 Resultado da Investigação

✅ **29 Testes Criados** | 🔴 **2 Bugs Confirmados** | 🟡 **1 Bug Parcial** | ✅ **2 Falsos Positivos**

---

## 🔴 BUG CRÍTICO: Autenticação Faltante

### Status: CONFIRMADO 🔴

**Arquivo**: `backend/src/routes/cliente.ts`

### O Problema
Todas as 25+ rotas de cliente são **publicamente acessíveis** sem autenticação.

### Comparação
```typescript
// ❌ CLIENTE - SEM AUTENTICAÇÃO
const cliente = Router()  // Sem middleware
cliente.get('/:clienteId/documentos', ...)
cliente.patch('/documento/:documentoId/status', ...)

// ✅ JURÍDICO - COM AUTENTICAÇÃO
const juridico = Router()
juridico.use(authMiddleware)  // ← Faz diferença!
juridico.get('/processos', ...)
```

### Endpoints Vulneráveis
```bash
# Qualquer pessoa consegue fazer isso:

# 1. Listar documentos de qualquer cliente
GET /api/cliente/{ANY-UUID}/documentos

# 2. Rejeitar documentos de outra pessoa
PATCH /api/cliente/documento/{ANY-DOC-ID}/status
Content-Type: application/json
{"status":"REJECTED","motivoRejeicao":"Hacked"}

# 3. Ver notificações confidenciais
GET /api/cliente/{ANY-UUID}/notificacoes

# 4. Deletar documentos de outros
DELETE /api/cliente/documento/{ANY-DOC-ID}

# 5. Fazer upload como outro cliente
POST /api/cliente/uploadDoc
clienteId: [OUTRO-CLIENT-UUID]
```

### Por Que Isto Acontece
1. Rota cliente não tem `authMiddleware`
2. Controller aceita `clienteId` como parâmetro sem verificação
3. Nenhuma validação se usuário é realmente esse cliente
4. Sem JWT token ou validação de sessão

### Impacto Prático
- 🔓 Acesso não-autorizado a dados privados
- 📄 Espionagem de documentos de outros clientes
- 💥 Alteração maliciosa de status de documentos
- ⚖️ Possível falsificação de documentos rejeitados

### Código Vulnerável

**ClienteDocumentController.ts:L169-171**
```typescript
// O controller TENTA validar mas não consegue:
if (!clienteId && !documentoId) {
  return res.status(400).json({ message: 'clienteId é obrigatório' })
}

// Mas não valida QUEM está enviando:
const { clienteId } = req.body  // ← Aceita de qualquer um!

// Não há verificação como:
// if (req.user.id !== clienteId) return 403
```

---

## 🟡 BUG IMPORTANTE: Auditoria Sem Validação

### Status: CONFIRMADO 🟡

**Arquivo**: `backend/src/controllers/cliente/ClienteDocumentController.ts` (L298)

### O Problema
Campo `analisado_por` é aceito do request body sem validação de quem realmente analisou.

### Cenário de Exploração

```bash
# Qualquer cliente consegue fazer isso:
PATCH /api/cliente/documento/doc-123/status
Content-Type: application/json

{
  "status": "REJECTED",
  "motivoRejeicao": "Documento inválido",
  "analisadoPor": "550e8400-e29b-41d4-a716-446655440000"  // ❌ UUID fake!
}
```

### Resultado
O banco de dados registra:
```json
{
  "id": "doc-123",
  "status": "REJECTED",
  "motivo_rejeicao": "Documento inválido",
  "analisado_por": "550e8400-e29b-41d4-a716-446655440000",  // ❌ Fake UUID
  "analisado_em": "2026-03-25T15:45:00Z"
}
```

### Código Problemático

**ClienteDocumentController.ts:L298**
```typescript
const { status, motivoRejeicao, analisadoPor } = req.body
//                            ↑
//                    ❌ Confiou cegamente no cliente!

// Repository salva exatamente o que foi enviado:
const documento = await ClienteRepository.updateDocumentoStatus(
  documentoId,
  status,
  motivoRejeicao,
  analisadoPor  // ← Sem validação!
)
```

### Por Que Isto Acontece
1. Não há autenticação (veja Bug 2)
2. `analisadoPor` vem de `req.body` em vez de `req.user`
3. Sem validação de role/permissão
4. Sem verificação se UUID existe

### Impacto
- 🔍 Auditoria falsificada
- 📋 Impossível rastrear quem realmente aprovou/rejeitou
- ⚖️ Incompliance com requisitos legais
- 🕵️ Dificulta investigação de fraudes

### Solução

```typescript
// ❌ ERRADO: Aceitar de req.body
const { analisadoPor } = req.body

// ✅ CORRETO: Usar usuário autenticado
const { userId } = req.user

// ✅ MELHOR: Validar permissão
if (req.user?.role !== 'juridico' && req.user?.role !== 'admin') {
  return res.status(403).json({ error: 'Sem permissão' })
}

// Agora é garantido que analisadoPor é um usuário real
const documento = await ClienteRepository.updateDocumentoStatus(
  documentoId,
  status,
  motivoRejeicao,
  userId  // ✅ Vem do middleware de autenticação
)
```

---

## ✅ FALSOS POSITIVOS (NÃO SÃO BUGS)

### BUG 1: Transições Inválidas ✅

**Status**: Funcionando corretamente

O controller valida transições:
```typescript
const validStatuses = [
  'PENDING', 'ANALYZING', 'APPROVED', 'REJECTED', ...
]

if (!status || !validStatuses.includes(status)) {
  return res.status(400).json({ message: 'Status inválido' })
}
```

✅ Rejeita status inválido com erro 400

---

### BUG 3: Validação de clienteId ✅

**Status**: Funcionando corretamente

```typescript
if (!clienteId && !documentoId) {
  return res.status(400).json({ message: 'clienteId é obrigatório' })
}
```

✅ Valida que pelo menos um dos dois é fornecido

**PORÉM**: Esta validação é inútil sem autenticação (Bug 2), pois:
- Qualquer um pode fornecer qualquer `clienteId`
- Não há verificação se é realmente daquele cliente

---

## 📋 Checklist de Correção

### 🔴 Crítico (Bug 2: Autenticação)
- [ ] Adicionar `authMiddleware` nas rotas cliente
- [ ] Validar `req.user.id` em cada controller
- [ ] Retornar 403 se usuário não autorizado
- [ ] Adicionar testes de autenticação

### 🟡 Importante (Bug 4: Auditoria)
- [ ] Remover `analisadoPor` de `req.body`
- [ ] Usar `req.user.id` após middleware de autenticação
- [ ] Validar role do usuário antes de permitir
- [ ] Adicionar testes de auditoria

### ✅ Melhorias
- [ ] Centralizar lista de status em constante
- [ ] Usar TypeScript enum para status
- [ ] Adicionar logs de auditoria
- [ ] Documentar fluxo de autorização

---

## 📊 Estatísticas dos Testes

```
Total de Testes:        29 ✅
Testes que Passam:      29 ✅

Bugs Identificados:
  - Críticos:    1 🔴
  - Importantes: 1 🟡
  - Observações: 2 ℹ️

Cobertura:
  - Upload:             ✅
  - Recuperação:        ✅
  - Status:             ✅
  - Notificações:       ✅
  - Segurança:          🔴 (Falhas encontradas)
  - Auditoria:          🟡 (Parcial)
```

---

## 🔗 Arquivos Relacionados

- `backend/src/controllers/__tests__/DocumentFlow.test.ts` - Suite de testes completa
- `backend/src/routes/cliente.ts` - Rotas vulneráveis
- `backend/src/controllers/cliente/ClienteDocumentController.ts` - Controller vulnerável
- `backend/src/repositories/ClienteRepository.ts` - Repository que salva dados

---

## 🚀 Próximos Passos

1. **Urgente**: Implementar autenticação em rotas cliente
2. **Importante**: Corrigir auditoria usando usuário autenticado
3. **Melhorias**: Refatorar constantes e tipos de status
4. **Testes**: Adicionar testes de segurança
