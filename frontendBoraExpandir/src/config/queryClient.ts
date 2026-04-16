import {
  QueryClient,
  DefaultOptions,
} from '@tanstack/react-query'

/**
 * React Query Configuration with intelligent caching strategy
 *
 * Defaults:
 * - staleTime: 5 minutes (keep data fresh)
 * - gcTime: 10 minutes (garbage collect old data)
 * - retry: 2 times with exponential backoff
 * - refetchOnWindowFocus: false (don't spam on tab switch)
 */
const queryConfig: DefaultOptions = {
  queries: {
    // How long data is considered fresh before background refetch
    staleTime: 1000 * 60 * 5,

    // How long inactive data stays in cache before garbage collection
    gcTime: 1000 * 60 * 10,

    // Retry failed requests 2 times with exponential backoff
    retry: (failureCount, error: any) => {
      // Don't retry 4xx errors (except 408 timeout)
      if (error?.status && error.status < 500 && error.status !== 408) {
        return false
      }
      // Retry up to 2 times
      return failureCount < 2
    },

    // Exponential backoff: 1s, 2s, 4s...
    retryDelay: (attemptIndex) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),

    // Don't refetch when window regains focus
    refetchOnWindowFocus: false,

    // Don't refetch when component remounts
    refetchOnMount: false,

    // Don't refetch when network reconnects
    refetchOnReconnect: 'stale',
  },
  mutations: {
    // Retry mutations up to 1 time
    retry: 1,
    retryDelay: 1000,
  },
}

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})

/**
 * Cache presets for common scenarios
 * Use these when creating useQuery hooks
 */
export const cachePresets = {
  // Static data that rarely changes (30 min)
  static: {
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 45,
  },

  // Data that changes occasionally (10 min)
  stable: {
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
  },

  // Default data (5 min)
  standard: {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  },

  // Data that changes frequently (2 min)
  fresh: {
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  },

  // Real-time data (30 sec)
  realtime: {
    staleTime: 1000 * 30,
    gcTime: 1000 * 60,
  },

  // Always fetch fresh (1 sec stale)
  noCache: {
    staleTime: 1000,
    gcTime: 1000 * 10,
  },
}

/**
 * Recommended cache settings by data type:
 *
 * STATIC (30 min):
 * - Catálogos de serviços
 * - Membros/dependentes
 * - Configurações administrativas
 *
 * STABLE (10 min):
 * - Processo jurídico
 * - Contratos
 * - Requerimentos
 * - Documentos do cliente
 *
 * STANDARD (5 min):
 * - Lista de clientes
 * - Lista de processos
 * - Notas (timeline)
 *
 * FRESH (2 min):
 * - Agendamentos
 * - Status de pagamentos
 * - Documentos pendentes
 *
 * REALTIME (30 sec):
 * - Status em tempo real
 * - Notificações
 */
