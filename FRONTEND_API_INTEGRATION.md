# 🔐 Guia de Integração de API Autenticada - Frontend

## 📋 Situação Atual

O frontend estava fazendo **28+ requisições sem token de autenticação**. Isso causaria erros `401 Unauthorized` com as novas correções de segurança no backend.

## ✅ Soluções Implementadas

### 1. ApiClient Corrigido ✅
**Arquivo:** `frontendBoraExpandir/src/modules/shared/services/api.ts`

Agora o `ApiClient`:
- ✅ Injeta automaticamente o token Bearer em todas as requisições
- ✅ Trata erros 401 (token expirado) → logout automático
- ✅ Trata erros 403 (sem permissão) → mensagem clara
- ✅ Suporta FormData (uploads) com token

### 2. Hook useApi ✅
**Arquivo:** `frontendBoraExpandir/src/modules/shared/hooks/useApi.ts`

Novo hook reutilizável para requisições:
```typescript
const { data, loading, error, get, post } = useApi<DocumentType>();
```

## 🔧 Como Refatorar o Frontend

### Opção A: Usar o hook `useApi` (Recomendado para componentes React)

**ANTES - ❌ Sem token:**
```typescript
useEffect(() => {
  fetch(`${API_BASE_URL}/cliente/${clienteId}/documentos`)
    .then(res => res.json())
    .then(data => setDocumentos(data.data))
    .catch(err => setError(err));
}, [clienteId]);
```

**DEPOIS - ✅ Com token automático:**
```typescript
import { useApi } from '@/modules/shared/hooks/useApi';

const { data, loading, error, get } = useApi<Document[]>();

useEffect(() => {
  get(`/cliente/${clienteId}/documentos`)
    .then(docs => setDocumentos(docs.data))
    .catch(err => setError(err));
}, [clienteId, get]);
```

### Opção B: Usar `apiClient` diretamente (Para services/utils)

**ANTES - ❌ Sem token:**
```typescript
async function getDocumentos(clienteId: string) {
  const response = await fetch(`${API_BASE_URL}/cliente/${clienteId}/documentos`);
  return response.json();
}
```

**DEPOIS - ✅ Com token automático:**
```typescript
import { apiClient } from '@/modules/shared/services/api';

async function getDocumentos(clienteId: string) {
  return apiClient.get(`/cliente/${clienteId}/documentos`);
}
```

### Opção C: Fetch direto com token (Último recurso)

Se você PRECISA usar `fetch` direto:

```typescript
const token = localStorage.getItem('auth_token');
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

## 📝 Arquivos que Precisam de Refatoração

### 🔴 Críticos (Muitos problemas):

1. **catalogService.ts** (8 problemas)
   - getAll(), getById(), create(), update(), delete()
   - Usar `apiClient` em vez de `fetch` direto

2. **ClienteApp.tsx** (4 problemas)
   - getDocumentos(), getRequerimentos(), getCliente()
   - Migrar para `useApi` hook

3. **DNAClientDetailView.tsx** (5 problemas)
   - fetchNotes(), createNote(), deleteNote()
   - Usar `useApi` hook

4. **Dashboard.tsx** (2 problemas)
   - Requisições GET/DELETE
   - Usar `useApi` hook

### 🟡 Importantes (Alguns problemas):

5. **RequirementsCard.tsx** - Upload de documentos
   - uploadDoc() precisa de token

6. **DocumentUploadFlow.tsx** - Upload de documentos
   - uploadDoc() precisa de token

7. **Config.tsx** - Upload de foto
   - profile-photo precisa de token

8. **FormsDeclarationsCard.tsx** - GET formulários
   - Usar `apiClient.get()`

9. **Requerimentos.tsx** - GET requerimentos
   - Usar `apiClient.get()`

10. **FamilyFolders.tsx** - GET dependentes
    - Usar `apiClient.get()`

11. **TimezoneSelector.tsx** - POST timezone
    - Usar `apiClient.post()`

12. **useComprovantesCount.ts** - GET comprovantes
    - Usar `apiClient.get()`

13. **UserManagement.tsx** - Algumas requisições sem token
    - Revisar e usar `useApi` onde apropriado

14. **configService.ts** - GET/POST configurações
    - Usar `apiClient`

15. **FormularioConsultoria.tsx** - GET/POST formulários
    - Usar `apiClient`

16. **AdminSidebar.tsx** - Já tem token, manter igual

## 🛠️ Template de Refatoração

### Para componentes React:

```typescript
import { useEffect, useState } from 'react';
import { useApi } from '@/modules/shared/hooks/useApi';

interface MyData {
  id: string;
  name: string;
}

export function MyComponent({ id }: { id: string }) {
  const { data, loading, error, get, post } = useApi<MyData>();
  const [formData, setFormData] = useState<Partial<MyData>>({});

  // ✅ GET request
  useEffect(() => {
    get(`/api/endpoint/${id}`)
      .catch(err => console.error('Erro:', err.message));
  }, [id, get]);

  // ✅ POST request
  const handleCreate = async () => {
    try {
      const result = await post('/api/endpoint', formData);
      console.log('Criado:', result);
    } catch (err) {
      console.error('Erro:', err.message);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return <div>{data?.name}</div>;
}
```

### Para services:

```typescript
import { apiClient } from '@/modules/shared/services/api';

export const documentService = {
  async getAll(clienteId: string) {
    return apiClient.get(`/cliente/${clienteId}/documentos`);
  },

  async getById(documentoId: string) {
    return apiClient.get(`/cliente/documento/${documentoId}`);
  },

  async create(clienteId: string, data: any) {
    return apiClient.post(`/cliente/uploadDoc`, {
      ...data,
      clienteId,
    });
  },

  async update(documentoId: string, data: any) {
    return apiClient.patch(`/cliente/documento/${documentoId}/status`, data);
  },

  async delete(documentoId: string) {
    return apiClient.delete(`/cliente/documento/${documentoId}`);
  },
};
```

## 📋 Checklist de Refatoração

Por arquivo:

- [ ] catalogService.ts - Migrar 8 requisições
- [ ] ClienteApp.tsx - Migrar 4 requisições
- [ ] DNAClientDetailView.tsx - Migrar 5 requisições
- [ ] Dashboard.tsx - Migrar 2 requisições
- [ ] RequirementsCard.tsx - Migrar 1 upload
- [ ] DocumentUploadFlow.tsx - Migrar 1 upload
- [ ] Config.tsx - Migrar 1 upload
- [ ] FormsDeclarationsCard.tsx - Migrar 1 GET
- [ ] Requerimentos.tsx - Migrar 1 GET
- [ ] FamilyFolders.tsx - Migrar 1 GET
- [ ] TimezoneSelector.tsx - Migrar 1 POST
- [ ] useComprovantesCount.ts - Migrar 1 GET
- [ ] UserManagement.tsx - Revisar e migrar se necessário
- [ ] configService.ts - Migrar 2 requisições
- [ ] FormularioConsultoria.tsx - Migrar 2 requisições

## ⚠️ Pontos Importantes

### Token Management
- ✅ Token é armazenado em `localStorage.getItem('auth_token')`
- ✅ ApiClient injeta automaticamente o token
- ✅ Token expirado: erro 401 → logout automático
- ✅ Sem permissão: erro 403 → mensagem clara

### FormData (Uploads)
- ✅ ApiClient remove `Content-Type` para FormData
- ✅ Navegador define `Content-Type: multipart/form-data`
- ✅ Token é automaticamente adicionado

### Testes
```typescript
// ✅ Testar que token está sendo enviado
const token = localStorage.getItem('auth_token');
console.log('Token presente:', !!token);

// ✅ Testar erro 401
// Deletar token e fazer requisição → deve redirecionar para login

// ✅ Testar erro 403
// Com token válido mas sem permissão → mensagem clara
```

## 🚀 Prioridades

1. **🔴 CRÍTICO** (Esta semana):
   - [ ] catalogService.ts
   - [ ] ClienteApp.tsx
   - [ ] Qualquer requisição de documentos

2. **🟡 IMPORTANTE** (Próxima semana):
   - [ ] Uploads (RequirementsCard, DocumentUploadFlow, Config)
   - [ ] DNAClientDetailView
   - [ ] Dashboard

3. **✅ MELHORIAS** (Depois):
   - [ ] Refatorar services para usar `apiClient`
   - [ ] Adicionar testes de autenticação
   - [ ] Validar todas as requisições têm token

## 📞 Suporte

Se encontrar problema:

1. Verificar se o token está em `localStorage.getItem('auth_token')`
2. Checar console por erros de autenticação (401/403)
3. Usar `useApi` hook - ele trata automaticamente
4. Se usar fetch direto, adicionar manualmente: `'Authorization': 'Bearer ' + token`

---

**Status:** 2 bugs críticos no backend já foram corrigidos. Agora o frontend precisa ser adaptado para usar autenticação em todas as requisições.

**Resultado esperado:** Todas as requisições terão token Bearer automaticamente.
