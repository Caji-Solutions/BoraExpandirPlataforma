# 🚀 Guia de Implementação - Cache no DNAClientDetailView

## ✅ Fase 1 Concluída

- [x] QueryClient configurado em `src/config/queryClient.ts`
- [x] `main.tsx` atualizado para usar nova config
- [x] Cache presets definidos para cada tipo de dado

---

## 📋 Próximas Etapas

### Fase 2: Aplicar Cache Específico em DNAClientDetailView

**Arquivo a modificar**: `src/components/ui/DNAClientDetailView.tsx`

#### Antes (Sem Cache Específico)
```typescript
const { data: fetchedProcesso } = useQuery({
  queryKey: ['processo', clientId],
  queryFn: () => juridicoService.getProcessoByCliente(clientId),
  enabled: !localProcessoId && !!clientId
})
```

#### Depois (Com Cache Específico)
```typescript
import { cachePresets } from '@/config/queryClient'

const { data: fetchedProcesso } = useQuery({
  queryKey: ['processo', clientId],
  queryFn: () => juridicoService.getProcessoByCliente(clientId),
  ...cachePresets.stable,  // 10 min cache
  enabled: !localProcessoId && !!clientId
})
```

---

## 🎯 Mapeamento de Cache por Query

### DNAClientDetailView - 7 Queries

```typescript
// 1. PROCESSO (Estável - raramente muda)
const { data: fetchedProcesso } = useQuery({
  queryKey: ['processo', clientId],
  queryFn: () => juridicoService.getProcessoByCliente(clientId),
  ...cachePresets.stable,  // ✅ 10 min
  enabled: !localProcessoId && !!clientId
})

// 2. NOTAS (Padrão - consulta frequente)
const { data: notesRaw } = useQuery({
  queryKey: ['notes', clientId],
  queryFn: async () => {
    const res = await apiClient.get(`/juridico/notas/${clientId}`)
    return res.data || []
  },
  ...cachePresets.standard,  // ✅ 5 min
  enabled: !!clientId
})

// 3. NOTAS DO LEAD (Padrão)
const { data: leadNotesData } = useQuery({
  queryKey: ['lead-notes', clientId],
  queryFn: async () => {
    const res = await apiClient.get(`/cliente/lead-notas/${clientId}`)
    return res.data || []
  },
  ...cachePresets.standard,  // ✅ 5 min
  enabled: !!clientId && (activeTab === 'notas' || activeTab === 'timeline')
})

// 4. MEMBROS/DEPENDENTES (Estático - raramente muda)
const { data: members } = useQuery({
  queryKey: ['members', clientId],
  queryFn: async () => {
    const depData = await juridicoService.getDependentes(clientId)
    const titular = {
      id: clientId,
      name: client.nome,
      type: 'Titular',
      isTitular: true
    }
    const formattedDeps = depData.map((d: any) => ({
      id: d.id,
      name: d.nome_completo || d.name,
      type: d.parentesco || 'Dependente',
      isTitular: false
    }))
    return [titular, ...formattedDeps]
  },
  ...cachePresets.static,  // ✅ 30 min
  enabled: !!clientId
})

// 5. DOCUMENTOS DO CLIENTE (Estável - muda ocasionalmente)
const { data: allClientDocs } = useQuery({
  queryKey: ['all-client-docs', clientId],
  queryFn: async () => {
    const res = await apiClient.get(`/cliente/${clientId}/documentos`)
    return res.data || []
  },
  ...cachePresets.stable,  // ✅ 10 min
  enabled: !!clientId
})

// 6. AGENDAMENTOS (Fresco - muda frequentemente)
const { data: agendamentos } = useQuery({
  queryKey: ['agendamentos', clientId],
  queryFn: () => comercialService.getAgendamentosByCliente(clientId),
  ...cachePresets.fresh,  // ✅ 2 min
  enabled: !!clientId
})

// 7. CONTRATOS (Estável - muda ocasionalmente)
const { data: contratosServicos } = useQuery({
  queryKey: ['contratos', clientId],
  queryFn: async () => {
    const res = await apiClient.get(`/cliente/contratos?clienteId=${clientId}`)
    return res.data || []
  },
  ...cachePresets.stable,  // ✅ 10 min
  enabled: !!clientId && activeTab === 'contrato_comprovantes'
})
```

---

## 🔧 Implementação Passo a Passo

### Passo 1: Importe os Cache Presets

No início do arquivo `DNAClientDetailView.tsx`:

```typescript
import { cachePresets } from '@/config/queryClient'
```

### Passo 2: Atualize Cada Query

Procure por cada `useQuery` e adicione `...cachePresets.xxx`:

```bash
grep -n "useQuery" src/components/ui/DNAClientDetailView.tsx
```

Você encontrará as linhas:
- Linha ~76: processo
- Linha ~102: notes
- Linha ~125: lead-notes
- Linha ~135: members
- Linha ~157: all-client-docs
- Linha ~167: agendamentos
- Linha ~174: contratos

### Passo 3: Aplique o Pattern

Para cada uma, adicione a linha com o preset apropriado após `queryFn:`.

---

## 📊 Impacto Esperado

### Métrica: Requisições por Navegação

| Cenário | Antes | Depois | Economia |
|---------|-------|--------|----------|
| Carrega cliente novo | 7 | 7 | 0% |
| Volta para cliente anterior | 7 | 0-2 | 71-100% |
| Atualiza página | 7 | 1-3 | 57-86% |
| Navega rápido entre clientes | 21 | 5-7 | 67-76% |

### Tempo de Carregamento

| Cenário | Antes | Depois |
|---------|-------|--------|
| Primeira vez | 2-3s | 2-3s |
| Cache quente | 2-3s | <200ms |
| Navega com cache | 2-3s | <100ms |

---

## 🔍 Como Testar

### Método 1: Network Tab do DevTools

1. Abra `DevTools` → `Network`
2. Navegue para um cliente
3. Anote quantas requisições GET aparecem
4. Volte para lista e clique no mesmo cliente
5. **Esperado**: Nenhuma ou muito poucas requisições (servidas do cache)

### Método 2: Console Logs

Adicione este log temporário no `handleAction` do ProcessAction:

```typescript
console.log('[CACHE] Mudando para cliente:', {
  timestamp: new Date().toISOString(),
  clientId: clientId
})
```

Verifique o Network para confirmação.

### Método 3: React Query DevTools

```bash
npm install @tanstack/react-query-devtools --save-dev
```

Adicione ao `main.tsx`:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  <ThemeProvider>
    <AppRouter />
    <Toaster />
  </ThemeProvider>
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

Agora você terá um painel no canto inferior mostrando:
- Cache hits/misses
- Tempo de cada query
- Estado da cache

---

## 💾 Salvando Dados Offline (Fase 4 - Opcional)

Se quiser adicionar persistência com IndexedDB:

```bash
npm install @tanstack/react-query-persist-client idb
```

Criar `src/config/queryClientWithPersist.ts`:

```typescript
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/react-query-persist-client'
import { openDB } from 'idb'
import { queryClient } from './queryClient'

export async function initializeQueryClient() {
  try {
    const db = await openDB('boraexpandir-cache', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('queries')) {
          db.createObjectStore('queries')
        }
      },
    })

    const idbPersister = createAsyncStoragePersister({
      storage: {
        getItem: async (key) => (await db.get('queries', key)) ?? null,
        setItem: async (key, value) => {
          await db.put('queries', value, key)
        },
        removeItem: async (key) => {
          await db.delete('queries', key)
        },
      },
    })

    persistQueryClient({
      queryClient,
      persister: idbPersister,
      maxAge: 1000 * 60 * 60 * 24, // 24 horas
    })

    console.log('[QueryClient] Persistence initialized with IndexedDB')
  } catch (error) {
    console.error('[QueryClient] Failed to initialize persistence:', error)
  }
}
```

---

## ⚠️ Considerações Importantes

### 1. Invalidação de Cache

Quando criar/atualizar dados, invalide o cache:

```typescript
const handleSaveCliente = async (data) => {
  await comercialService.updateCliente(data)
  
  // Invalida cache
  queryClient.invalidateQueries({ queryKey: ['clientes'] })
  
  // Ou refetch específico
  queryClient.refetchQueries({ queryKey: ['clientes', clientId] })
}
```

### 2. Refetch Manual

Deixe o usuário forçar atualização:

```typescript
const { refetch } = useQuery(...)

<button onClick={() => refetch()}>
  🔄 Atualizar
</button>
```

### 3. Sincronização Background

Para dados críticos (agendamentos, pagamentos):

```typescript
const { data: agendamentos } = useQuery({
  queryKey: ['agendamentos', clientId],
  queryFn: () => comercialService.getAgendamentosByCliente(clientId),
  ...cachePresets.fresh,
  refetchInterval: 1000 * 60,  // Refetch a cada minuto
})
```

---

## 📝 Checklist de Implementação

### DNAClientDetailView
- [ ] Importe `cachePresets`
- [ ] Adicione `...cachePresets.stable` ao processo (linha ~76)
- [ ] Adicione `...cachePresets.standard` às notas (linha ~102)
- [ ] Adicione `...cachePresets.standard` às lead-notes (linha ~125)
- [ ] Adicione `...cachePresets.static` aos membros (linha ~135)
- [ ] Adicione `...cachePresets.stable` aos documentos (linha ~157)
- [ ] Adicione `...cachePresets.fresh` aos agendamentos (linha ~167)
- [ ] Adicione `...cachePresets.stable` aos contratos (linha ~174)

### Comercial Module
- [ ] Aplicar cache em `getAllClientes()`
- [ ] Aplicar cache em `getAgendamentosByUsuario()`
- [ ] Aplicar cache em `getContratosServicos()`

### Jurídico Module
- [ ] Aplicar cache em processos
- [ ] Aplicar cache em requerimentos
- [ ] Aplicar cache em análises

---

## 🎓 Recursos Adicionais

- [React Query Docs](https://tanstack.com/query/latest)
- [staleTime vs gcTime](https://tanstack.com/query/latest/docs/framework/react/guides/caching)
- [Cache Strategies](https://web.dev/http-cache/)
- [IndexedDB Guide](https://developer.mozilla.org/docs/Web/API/IndexedDB_API)

---

## 📞 Suporte

Se tiver dúvidas sobre qual cache usar:

1. **Dados estáticos** (membros, categorias) → `cachePresets.static` (30 min)
2. **Dados estáveis** (processos, contratos) → `cachePresets.stable` (10 min)
3. **Dados normais** (listas, notas) → `cachePresets.standard` (5 min)
4. **Dados que mudam** (agendamentos, pagamentos) → `cachePresets.fresh` (2 min)
5. **Dados em tempo real** (status) → `cachePresets.realtime` (30 seg)

**Dúvida?** Use `cachePresets.standard` como default seguro!
