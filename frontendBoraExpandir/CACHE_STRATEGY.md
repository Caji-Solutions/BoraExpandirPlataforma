# 📊 Estratégia de Cache - Frontend Performance

## 🔍 Análise Atual

### Chamadas ao Backend por Módulo

#### DNAClientDetailView (UI Component)
- **7 queries paralelas** quando carrega um cliente:
  1. `processo` - Processo jurídico (raro mudar)
  2. `notes` - Notas do processo (consultas frequentes)
  3. `lead-notes` - Notas do lead (leitura)
  4. `members` - Membros/dependentes (estático)
  5. `all-client-docs` - Documentos (muda periodicamente)
  6. `agendamentos` - Agendamentos (muda frequentemente)
  7. `contratos` - Contratos (muda periodicamente)

#### Comercial Module
- `getAllClientes()` - Lista completa (chamada em múltiplas páginas)
- `getAgendamentosByUsuario()` - Filtra por usuário
- `getAgendamentosByCliente()` - Filtra por cliente
- `getContratosServicos()` - Lista de contratos
- `getProcessos()` - Lista de processos
- `getRequerimentos()` - Lista de requerimentos

#### Jurídico Module
- `getProcessoByCliente()` - Processo específico
- Múltiplas chamadas de notas
- Documentos por cliente
- Requerimentos

---

## ⏱️ Tempos de Cache Recomendados

| Tipo de Dado | TTL | Justificativa |
|---|---|---|
| **Clientes** (lista) | 5 min | Raramente muda, impacto alto se desatualizado |
| **Processo** | 10 min | Mudanças ocasionais, informação estável |
| **Notas** | 1 min | Podem ser adicionadas frequentemente |
| **Agendamentos** | 2 min | Mudam em tempo real quando confirmam |
| **Contratos** | 5 min | Mudanças ocasionais |
| **Documentos** | 3 min | Podem ser adicionados |
| **Membros/Dependentes** | 10 min | Raramente mudam |
| **Requerimentos** | 5 min | Podem ser atualizados |

---

## 🎯 Problemas Atuais

### 1. **Falta de Configuração de Cache no React Query**
```typescript
// ❌ Atual - Sem cache configurado
useQuery({
  queryKey: ['clientes'],
  queryFn: () => getAllClientes(),
  // Sem staleTime, gcTime ou refetchInterval
})
```

### 2. **Múltiplas Requisições Paralelas**
- DNAClientDetailView faz 7 requisições simultâneas
- Sem cache, cada navegação para um cliente refaz tudo
- Sem deduplicação de requisições

### 3. **Sem IndexedDB para Persistência**
- Dados são perdidos ao recarregar a página
- Sem cache offline
- Sem hydration do estado anterior

### 4. **Sem Cache de Navigationaler**
- Volta para lista de clientes = nova requisição
- Sem memory cache entre navegações

---

## ✅ Soluções Propostas

### Nível 1: React Query Config (Fácil - 2h)
Melhorar o QueryClient com timeouts de cache inteligentes.

**Benefício**: 40-50% menos requisições  
**Impacto**: Alto, sem mudanças estruturais

### Nível 2: IndexedDB Persistor (Médio - 6h)
Adicionar persistência com `@tanstack/react-query-persist-client`

**Benefício**: Cache persiste entre sessões, offline support  
**Impacto**: Muito Alto, melhora UX drasticamente

### Nível 3: Request Deduplication (Médio - 4h)
Implementar dedup de requisições simultâneas

**Benefício**: 60-80% menos requisições em carregamentos paralelos  
**Impacto**: Alto em operações de bulk

### Nível 4: Service Worker (Avançado - 12h)
Cache com sincronização em background

**Benefício**: Funciona offline completo  
**Impacto**: Crítico para UX

---

## 🚀 Implementação Recomendada

### Fase 1: Configuração do React Query (FAZER PRIMEIRO)

**Arquivo**: `src/config/queryClient.ts` (criar novo)

```typescript
import {
  QueryClient,
  DefaultOptions,
} from '@tanstack/react-query'

const queryConfig: DefaultOptions = {
  queries: {
    // Cache mantém dados frescos por 5 minutos
    staleTime: 1000 * 60 * 5,
    // Garbage collect dados não usados após 10 minutos
    gcTime: 1000 * 60 * 10,
    // Retry automático 2 vezes com backoff
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
}

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})
```

**Usso**: Atualizar `main.tsx` para usar este QueryClient

---

### Fase 2: Cache Específico por Query

```typescript
// ❌ Antes
useQuery({
  queryKey: ['clientes'],
  queryFn: () => getAllClientes(),
})

// ✅ Depois
useQuery({
  queryKey: ['clientes'],
  queryFn: () => getAllClientes(),
  staleTime: 1000 * 60 * 5,      // 5 min
  gcTime: 1000 * 60 * 15,        // 15 min
  refetchOnWindowFocus: false,   // Não refetch quando volta pra aba
})
```

---

### Fase 3: Configurar Cache por Contexto

```typescript
// Em DNAClientDetailView.tsx
const { data: fetchedProcesso } = useQuery({
  queryKey: ['processo', clientId],
  queryFn: () => juridicoService.getProcessoByCliente(clientId),
  staleTime: 1000 * 60 * 10,  // Processo é estável
  enabled: !localProcessoId && !!clientId
})

const { data: agendamentos } = useQuery({
  queryKey: ['agendamentos', clientId],
  queryFn: () => comercialService.getAgendamentosByCliente(clientId),
  staleTime: 1000 * 60 * 2,   // Agendamentos mudam frequentemente
})

const { data: members } = useQuery({
  queryKey: ['members', clientId],
  queryFn: () => juridicoService.getDependentes(clientId),
  staleTime: 1000 * 60 * 30,  // Dependentes raramente mudam
})
```

---

### Fase 4: IndexedDB Persistor (Opcional mas recomendado)

**Instalar**:
```bash
npm install @tanstack/react-query-persist-client idb
```

**Usar**:
```typescript
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { createAsyncStoragePersister } from '@tanstack/react-query-persist-client'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { openDB } from 'idb'

export async function initializeQueryClient(queryClient: QueryClient) {
  const db = await openDB('boraexpandir-cache', 1, {
    upgrade(db) {
      db.createObjectStore('queries')
    },
  })

  const idbPersister = createAsyncStoragePersister({
    storage: {
      getItem: async (key) => {
        return (await db.get('queries', key)) ?? null
      },
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
}
```

---

## 📈 Métricas de Impacto Esperado

### Sem Cache
- 7 queries × 3 navegações = **21 requisições** por sessão típica
- Tempo de carregamento: ~2-3s por cliente

### Com React Query Config Otimizado
- Redução de 40-50%: **~10-12 requisições**
- Tempo de carregamento: ~1-1.5s (primeira vez), <500ms (cache)

### Com IndexedDB
- Redução adicional: **~5-6 requisições**
- Tempo de carregamento: <200ms (cache warm)
- Funciona offline parcialmente

---

## 🔧 Checklist de Implementação

- [ ] **Fase 1**: Criar `config/queryClient.ts` com defaults otimizados
- [ ] **Fase 1**: Atualizar `main.tsx` para usar novo QueryClient
- [ ] **Fase 2**: Aplicar staleTime específico em DNAClientDetailView
- [ ] **Fase 2**: Aplicar staleTime em comercialService queries
- [ ] **Fase 2**: Aplicar staleTime em juridicoService queries
- [ ] **Fase 3**: Teste com DevTools - verificar cache hits
- [ ] **Fase 4**: Instalar e configurar IndexedDB (opcional)
- [ ] **Fase 4**: Adicionar syncronização em background

---

## 🧪 Como Testar

### Com React Query DevTools

```bash
npm install @tanstack/react-query-devtools
```

Adicionar ao `main.tsx`:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<ReactQueryDevtools initialIsOpen={false} />
```

### Verificar Hits de Cache
1. Abrir DevTools do React Query
2. Navegar entre clientes
3. Procurar por "data from cache" em vez de requisições novas

---

## 📊 Queries que Precisam Atenção

### Alta Prioridade (Maior Impacto)
1. `getAllClientes()` - Chamada em múltiplas páginas
2. `getAgendamentosByUsuario()` - Usado no dashboard
3. Processo por cliente - Carregado em cada cliente

### Média Prioridade
1. Contratos e requerimentos
2. Notas (mas com TTL curto)

### Baixa Prioridade
1. Documentos individuais
2. Membros/dependentes

---

## 💡 Dicas Extras

1. **Invalidar Cache Inteligentemente**
   ```typescript
   // Ao criar novo agendamento
   queryClient.invalidateQueries({ 
     queryKey: ['agendamentos'] 
   })
   ```

2. **Refetch Manual**
   ```typescript
   const { refetch } = useQuery(...)
   // Em um botão "Atualizar"
   <button onClick={() => refetch()}>Atualizar</button>
   ```

3. **Background Refetch**
   ```typescript
   useQuery({
     queryKey: ['agendamentos'],
     queryFn: () => getAgendamentos(),
     refetchInterval: 1000 * 60, // A cada minuto
   })
   ```

---

## 📚 Referências
- [React Query Docs](https://tanstack.com/query/latest)
- [Cache Strategies](https://www.swag.dev/courses/modern-web-perf/cache-strategies)
- [IndexedDB Guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
