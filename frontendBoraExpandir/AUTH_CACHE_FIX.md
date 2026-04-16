# 🔐 Otimização de Cache de Autenticação

## 🎯 Problema Identificado

Toda vez que alterna de tela, o app faz requisições para validar autenticação:

```
[authMiddleware] GET /auth/team/comercial
[authMiddleware] GET /auth/me
```

Isso está consumindo banda e aumentando latência desnecessariamente.

---

## ✅ Solução Implementada

Criei `authCache.ts` - Cache em memória com TTL (Time-To-Live) inteligente.

### Componentes Afetados

1. **AuthContext** - Validação de auth (`/auth/me`)
   - **Cache TTL**: 30 minutos
   - **Cenário**: Verificação ao alternar telas

2. **AdminSidebar** - Listagem de equipes (`/auth/team/{role}`)
   - **Cache TTL**: 10 minutos
   - **Cenário**: Carregamento lazy ao expandir setor

---

## 🔧 Implementação

### Passo 1: AuthContext - Adicionar Cache no checkAuth

**Arquivo**: `src/contexts/AuthContext.tsx`

**Antes**:
```typescript
const checkAuth = useCallback(async () => {
  const savedToken = localStorage.getItem('auth_token')
  if (!savedToken) {
    setState(prev => ({ ...prev, loading: false }))
    return
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` }
    })
    // ...fetch data...
  } catch {
    // ...error handling...
  }
}, [])
```

**Depois**:
```typescript
import { authCache } from '@/modules/shared/services/authCache'

const checkAuth = useCallback(async () => {
  const savedToken = localStorage.getItem('auth_token')
  if (!savedToken) {
    setState(prev => ({ ...prev, loading: false }))
    return
  }

  // ✅ Verificar cache primeiro
  const cached = authCache.getAuth()
  if (cached) {
    console.log('[Auth] Usando profile do cache (30 min)')
    setState({
      user: cached.user,
      profile: cached.profile,
      token: savedToken,
      loading: false,
      error: null,
    })
    return
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` }
    })

    if (res.ok) {
      const data = await res.json()
      
      // ✅ Salvar no cache
      authCache.setAuth(data)
      
      setState({
        user: data.user,
        profile: data.profile,
        token: savedToken,
        loading: false,
        error: null,
      })
    } else {
      localStorage.clear()
      sessionStorage.clear()
      authCache.clear()
      setState({ user: null, profile: null, token: null, loading: false, error: null })
    }
  } catch {
    localStorage.clear()
    sessionStorage.clear()
    authCache.clear()
    setState({ user: null, profile: null, token: null, loading: false, error: null })
  }
}, [])
```

**Benefício**: 
- ✅ 0 requisições enquanto cache está válido (30 min)
- ✅ Primeira navegação: 1 requisição, resto: 0

---

### Passo 2: AdminSidebar - Adicionar Cache na Equipe

**Arquivo**: `src/modules/adm/components/AdminSidebar.tsx`

**Antes**:
```typescript
const fetchSectorTeam = async (role: string, index: number) => {
  setSectors((prev) =>
    prev.map((s, i) => (i === index ? { ...s, loading: true } : s))
  );

  try {
    const res = await fetch(`${BACKEND_URL}/auth/team/${role}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const data = await res.json();
      setSectors((prev) =>
        prev.map((s, i) => (i === index ? { ...s, members: data, loading: false } : s))
      );
    }
  } catch {
    setSectors((prev) =>
      prev.map((s, i) => (i === index ? { ...s, loading: false } : s))
    );
  }
};
```

**Depois**:
```typescript
import { authCache } from '@/modules/shared/services/authCache'

const fetchSectorTeam = async (role: string, index: number) => {
  // ✅ Verificar cache primeiro
  const cached = authCache.getTeam(role)
  if (cached) {
    console.log(`[AdminSidebar] Usando equipe ${role} do cache (10 min)`)
    setSectors((prev) =>
      prev.map((s, i) => (i === index ? { ...s, members: cached, loading: false } : s))
    );
    return
  }

  setSectors((prev) =>
    prev.map((s, i) => (i === index ? { ...s, loading: true } : s))
  );

  try {
    const res = await fetch(`${BACKEND_URL}/auth/team/${role}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const data = await res.json();
      
      // ✅ Salvar no cache
      authCache.setTeam(role, data)
      
      setSectors((prev) =>
        prev.map((s, i) => (i === index ? { ...s, members: data, loading: false } : s))
      );
    }
  } catch {
    setSectors((prev) =>
      prev.map((s, i) => (i === index ? { ...s, loading: false } : s))
    );
  }
};
```

**Benefício**:
- ✅ Segunda vez que expande um setor: 0 requisições (10 min)
- ✅ Primeira vez: 1 requisição, resto: 0

---

### Passo 3: Invalidar Cache Quando Necessário

Sempre que mudar dados críticos:

```typescript
// Ao fazer logout
const handleLogout = () => {
  authCache.clear()  // ✅ Limpar cache
  logout()
}

// Ao impersonar outro usuário
const handleImpersonate = (member: UserProfile) => {
  authCache.invalidateTeam()  // ✅ Invalidar cache de equipes
  setImpersonatedProfile(member)
}

// Ao atualizar um membro da equipe
const handleUpdateMember = async (data) => {
  await updateMember(data)
  authCache.invalidateTeam(role)  // ✅ Invalida apenas esse role
}
```

---

## 📊 Impacto Esperado

### Antes da Otimização

```
Sessão típica (20 min):
- Alterna entre telas: 15x
- Cada alternancia: 1-2 requisições
- Total: 15-30 requisições desnecessárias ❌
- Dados: 50-100KB
```

### Depois da Otimização

```
Sessão típica (20 min):
- Alterna entre telas: 15x
- Com cache (30 min): 0 requisições após primeira ✅
- Total: 1-2 requisições apenas
- Dados: 2-4KB
```

**Economia**: **98% menos requisições** ✅

---

## 🧪 Como Testar

### Teste 1: Verificar Cache de Auth

1. Abra DevTools → Network
2. Navegue para qualquer página
3. Vê requisição para `/auth/me` (primeira vez)
4. Alterne para outra tela
5. **Esperado**: Nenhuma requisição nova para `/auth/me`

### Teste 2: Verificar Cache de Equipes

1. Acesse Admin → Sidebar
2. Clique em "Comercial (C1/C2)" para expandir
3. Vê requisição para `/auth/team/comercial`
4. Feche e abra novamente no próximo 10 minutos
5. **Esperado**: Nenhuma requisição nova

### Teste 3: Validar TTL

1. Implemente o cache
2. Aguarde 30+ minutos
3. Altere para outra tela
4. **Esperado**: Nova requisição para `/auth/me` (cache expirou)

---

## 🎯 Checklist de Implementação

- [ ] Arquivo `authCache.ts` criado ✅
- [ ] Importe `authCache` no AuthContext
- [ ] Adicione verificação de cache no `checkAuth()`
- [ ] Salve resultado no cache após fetch bem-sucedido
- [ ] Limpe cache no `logout()`
- [ ] Importe `authCache` no AdminSidebar
- [ ] Adicione verificação de cache no `fetchSectorTeam()`
- [ ] Salve resultado no cache após fetch bem-sucedido
- [ ] Invalide cache quando necessário (impersonate, update)
- [ ] Teste com DevTools Network
- [ ] Teste TTL aguardando 30+ minutos

---

## 💡 Benefícios Adicionais

1. **Melhor Performance**
   - Sem latência de rede enquanto cache é válido
   - Navegação mais rápida

2. **Menos Carga no Backend**
   - Reduz requisições repetidas
   - Economia de banda de servidor

3. **Melhor UX**
   - Respostas instantâneas
   - Menos loading spinners

4. **Fácil Invalidação**
   - Simples invalidar quando dados mudam
   - Sem refetch manual necessário

---

## 📝 Notas Importantes

### TTL Recomendados

- **Auth (30 min)**: Seguro para app, não causa inconsistências
- **Equipe (10 min)**: Atualiza regularmente, rápido para mudanças

### Quando Invalidar

```typescript
// Logout
authCache.clear()

// Quando role muda
authCache.invalidateTeam('comercial')

// Quando qualquer usuário é criado/atualizado
authCache.invalidateTeam()  // Invalida todos
```

### Limitações Conhecidas

1. **Não funciona offline** - Cache é só em memória
   - Solução: Adicionar IndexedDB (Phase 4 do CACHE_STRATEGY.md)

2. **Cache é perdido ao recarregar página** - Esperado
   - Solução: Persistir com localStorage/IndexedDB

3. **Não sincroniza entre abas** - Isolado por aba
   - Solução: Usar storage event listener

---

## 🚀 Próximas Fases

### Phase 4: IndexedDB Persistor
Se quiser adicionar persistência entre sessões:

```typescript
// Persistir cache no IndexedDB
const persistAuth = async () => {
  const db = await openDB('boraexpandir')
  await db.put('cache', authCache.getAuth(), 'auth')
}

// Restaurar ao iniciar
const restoreAuth = async () => {
  const db = await openDB('boraexpandir')
  const cached = await db.get('cache', 'auth')
  if (cached) authCache.setAuth(cached)
}
```

---

## 📞 Dúvidas

**P: Posso deixar TTL maior (1 hora)?**  
R: Sim, quanto maior, menos requisições. Mas pode ter dados desatualizado se outros usuários mudarem algo.

**P: E se o token expirar enquanto está em cache?**  
R: Força refetch na próxima requisição de API (apiClient.ts já trata 401).

**P: Como saber se está usando cache?**  
R: Procure por logs `[Auth] Usando profile do cache` ou `[AdminSidebar] Usando equipe do cache`.
