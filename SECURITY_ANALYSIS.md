# 🔐 Análise de Segurança - Fluxo de Documentos

## 📐 Arquitetura Atual vs. Esperada

### ❌ ATUAL - Arquitetura Insegura

```
┌─────────────────────────────────────────────────┐
│              Requisição HTTP                     │
│  GET /api/cliente/{any-uuid}/documentos         │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│          Express Router                          │
│          (cliente.ts)                            │
│                                                  │
│  ❌ SEM MIDDLEWARE DE AUTENTICAÇÃO              │
│     (authMiddleware não está aqui!)             │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│        ClienteDocumentController                 │
│        getDocumentos()                           │
│                                                  │
│  ❌ Não valida quem está fazendo a requisição  │
│  ❌ Aceita qualquer clienteId                   │
│  ❌ Sem verificação de autorização              │
│                                                  │
│  const { clienteId } = req.params               │
│  const docs = await ClienteRepository           │
│    .getDocumentosByClienteId(clienteId)         │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│         ClienteRepository                        │
│         getDocumentosByClienteId()               │
│                                                  │
│  Retorna TODOS os documentos do cliente         │
│  (sem questionar quem pediu)                    │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│         ✅ Resposta com Documentos              │
│                                                  │
│  {                                              │
│    "data": [                                   │
│      { "id": "doc-1", "tipo": "passaporte", }, │
│      { "id": "doc-2", "tipo": "rg" },         │
│      ...                                        │
│    ]                                            │
│  }                                              │
│                                                  │
│  🚨 QUALQUER UM CONSEGUE ISSO!                 │
└─────────────────────────────────────────────────┘
```

### ✅ ESPERADO - Arquitetura Segura

```
┌─────────────────────────────────────────────────┐
│              Requisição HTTP                     │
│  GET /api/cliente/{clienteId}/documentos        │
│  Headers: { Authorization: "Bearer token..." }  │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│       authMiddleware (NOVO!)                     │
│                                                  │
│  ✅ Valida JWT token                            │
│  ✅ Extrai userId do token                      │
│  ✅ Verifica se token é válido                  │
│  ✅ Retorna 401 se não autenticado              │
│                                                  │
│  req.user = {                                   │
│    id: "user-uuid-123",                         │
│    email: "cliente@example.com",                │
│    role: "cliente"                              │
│  }                                              │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│        Express Router (cliente.ts)               │
│        (com authMiddleware)                      │
│                                                  │
│  ✅ SEM middleware = 401 Unauthorized            │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│       ClienteDocumentController                  │
│       getDocumentos()                            │
│                                                  │
│  ✅ Valida autorização                          │
│  ✅ Compara req.user.id com clienteId           │
│  ✅ Retorna 403 se não autorizado               │
│                                                  │
│  const { clienteId } = req.params               │
│  const { userId } = req.user // Do middleware! │
│                                                  │
│  if (userId !== clienteId && role !== 'admin') │
│    return res.status(403).json({...})           │
│                                                  │
│  const docs = await ClienteRepository...        │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│         ✅ Resposta Segura                      │
│                                                  │
│  {                                              │
│    "data": [ /* apenas seus docs */ ]          │
│  }                                              │
│                                                  │
│  ✅ APENAS O CLIENTE AUTORIZADO VÊ!            │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Fluxo de Ataque - Cenário Real

### Ataque 1: Espionagem de Documentos

```
┌─────────────┐
│   Atacante  │
│ alice@evil. │
│     com     │
└──────┬──────┘
       │
       │ GET /api/cliente/bob-uuid/documentos
       │ (sem autenticação!)
       │
       ▼
┌────────────────────┐
│  Express Server    │
│                    │
│  ✅ Aceita (não há │
│     autenticação)  │
└────────┬───────────┘
         │
         │ Retorna documentos do Bob!
         │
         ▼
┌──────────────────────────────────────┐
│  { "data": [                         │
│    { "id": "passport-bob",           │
│      "tipo": "passaporte",           │
│      "status": "APPROVED"            │
│    },                                │
│    { "id": "rg-bob",                 │
│      "tipo": "rg",                   │
│      "status": "REJECTED"            │
│    }                                 │
│  ]}                                  │
│                                      │
│  🚨 Dados confidenciais vazados!     │
└──────────────────────────────────────┘
```

### Ataque 2: Falsificação de Auditoria

```
┌─────────────┐
│   Atacante  │
│ carol@bad.  │
│     com     │
└──────┬──────┘
       │
       │ PATCH /api/cliente/documento/doc-123/status
       │ {
       │   "status": "REJECTED",
       │   "motivoRejeicao": "Documento falso!",
       │   "analisadoPor": "admin-uuid-real"  // ❌ Fake!
       │ }
       │
       ▼
┌────────────────────┐
│  Express Server    │
│                    │
│  ✅ Aceita!        │
│  (sem validação)   │
└────┬───────────────┘
     │
     │ Salva no banco:
     │ "analisado_por": "admin-uuid-real"
     │ "analisado_em": "2026-03-25T15:50:00Z"
     │
     ▼
┌──────────────────────────────────────┐
│  BASE DE DADOS                       │
│                                      │
│  documentos {                        │
│    id: "doc-123",                    │
│    status: "REJECTED",               │
│    analisado_por: "admin-uuid-real", │
│    analisado_em: "2026-03-25..."     │
│  }                                   │
│                                      │
│  🚨 Auditoria falsificada!           │
│     Admin real não fez nada!         │
│     Ataque escondido!                │
└──────────────────────────────────────┘
```

---

## 🛡️ Matriz de Segurança

| Endpoint | Autenticação | Autorização | Auditoria | Status |
|----------|:---:|:---:|:---:|:---:|
| GET /cliente/:id/documentos | ❌ | ❌ | ❌ | 🔴 Crítico |
| PATCH /documento/:id/status | ❌ | ❌ | 🟡 | 🔴 Crítico |
| POST /uploadDoc | ❌ | ❌ | ✅ | 🔴 Crítico |
| DELETE /documento/:id | ❌ | ❌ | ✅ | 🔴 Crítico |
| GET /cliente/:id/notificacoes | ❌ | ❌ | N/A | 🔴 Crítico |
| GET /cliente/:id/processos | ❌ | ❌ | N/A | 🔴 Crítico |

---

## 🔧 Implementação da Correção

### Passo 1: Adicionar authMiddleware às rotas

**Arquivo**: `backend/src/routes/cliente.ts`

```typescript
// ANTES
import { Router } from 'express'
import ClienteProfileController from '../controllers/cliente/ClienteProfileController'

const cliente = Router()
cliente.post('/register', ClienteProfileController.register.bind(ClienteProfileController))

// DEPOIS
import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth'  // ← Adicionar!
import ClienteProfileController from '../controllers/cliente/ClienteProfileController'

const cliente = Router()
cliente.use(authMiddleware)  // ← Adicionar! (depois das rotas públicas)

// Rotas públicas (antes do middleware)
cliente.post('/register', ClienteProfileController.register.bind(ClienteProfileController))
cliente.post('/register-lead', ...)

// Rotas protegidas (depois do middleware)
cliente.post('/uploadDoc', upload.single('file'), ...)
cliente.get('/:clienteId/documentos', ...)
```

### Passo 2: Validar autorização no controller

**Arquivo**: `backend/src/controllers/cliente/ClienteDocumentController.ts`

```typescript
// ANTES
async getDocumentos(req: any, res: any) {
  const { clienteId } = req.params
  if (!clienteId) {
    return res.status(400).json({ message: 'clienteId é obrigatório' })
  }
  const documentos = await ClienteRepository.getDocumentosByClienteId(clienteId)
  return res.status(200).json({ message: 'OK', data: documentos })
}

// DEPOIS
async getDocumentos(req: any, res: any) {
  const { clienteId } = req.params
  const { userId, role } = req.user  // ← Do authMiddleware

  // Validar autorização
  if (userId !== clienteId && role !== 'admin' && role !== 'juridico') {
    return res.status(403).json({ message: 'Sem permissão' })
  }

  if (!clienteId) {
    return res.status(400).json({ message: 'clienteId é obrigatório' })
  }

  const documentos = await ClienteRepository.getDocumentosByClienteId(clienteId)
  return res.status(200).json({ message: 'OK', data: documentos })
}
```

### Passo 3: Corrigir auditoria com usuário autenticado

**Arquivo**: `backend/src/controllers/cliente/ClienteDocumentController.ts`

```typescript
// ANTES
const { status, motivoRejeicao, analisadoPor } = req.body  // ❌ Aceita de req.body

// DEPOIS
const { status, motivoRejeicao } = req.body
const { userId, role } = req.user  // ← Do authMiddleware

// Validar que é jurídico ou admin
if (role !== 'juridico' && role !== 'admin') {
  return res.status(403).json({ message: 'Apenas jurídico pode analisar' })
}

// Agora passamos userId garantidamente válido
const documento = await ClienteRepository.updateDocumentoStatus(
  documentoId,
  status,
  motivoRejeicao,
  userId,  // ✅ Agora é garantido ser real!
  ...
)
```

---

## 📈 Impacto da Correção

### Antes
```
Segurança:     🔴🔴🔴 (3/10)
Compliance:    🔴🔴 (2/10)
Confiança:     🔴 (1/10)
```

### Depois
```
Segurança:     🟢🟢🟢🟢🟢 (10/10)
Compliance:    🟢🟢🟢 (8/10)
Confiança:     🟢🟢🟢🟢 (9/10)
```

---

## 🧪 Testes de Segurança Recomendados

```typescript
describe('Segurança: Autenticação e Autorização', () => {
  it('rejeita requisição sem token', async () => {
    const res = await request(app)
      .get(`/api/cliente/any-uuid/documentos`)

    expect(res.status).toBe(401)
  })

  it('rejeita cliente vendo documentos de outro', async () => {
    const token = generateToken('user-alice')
    const res = await request(app)
      .get(`/api/cliente/user-bob-uuid/documentos`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
  })

  it('admin consegue ver documentos de qualquer cliente', async () => {
    const token = generateToken('admin', { role: 'admin' })
    const res = await request(app)
      .get(`/api/cliente/any-uuid/documentos`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })

  it('auditoria registra usuário real, não fake', async () => {
    const token = generateToken('juridico-user-123')

    await request(app)
      .patch(`/api/cliente/documento/doc-123/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'REJECTED' })

    const doc = await ClienteRepository.getDocumentosByClienteId(...)
    expect(doc.analisado_por).toBe('juridico-user-123')  // ✅ Real!
  })
})
```

---

## 📋 Checklist de Implementação

- [ ] Implementar/validar `authMiddleware`
- [ ] Adicionar `authMiddleware` a rotas cliente
- [ ] Validar `req.user` em cada controller
- [ ] Remover aceita de `analisadoPor` de `req.body`
- [ ] Usar `req.user.id` para auditoria
- [ ] Adicionar testes de segurança
- [ ] Adicionar testes de autorização
- [ ] Validar role de usuário em endpoints sensíveis
- [ ] Documentar fluxo de autenticação
- [ ] Realizar revisão de segurança completa
