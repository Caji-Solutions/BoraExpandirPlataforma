import { useEffect, useState } from 'react'
import { apiClient } from '@/modules/shared/services/api'

interface CotacaoResponse {
  cotacao: number
  historico?: Array<{ valor: number; criado_em: string }>
}

// Cache em módulo — um único fetch por sessão (TTL 10 min).
// Evita N chamadas quando vários cards renderizam juntos.
let cached: { valor: number; ts: number } | null = null
let pending: Promise<number> | null = null
const TTL_MS = 10 * 60 * 1000
const FALLBACK = 6

async function fetchCotacao(): Promise<number> {
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.valor
  if (pending) return pending

  pending = (async () => {
    try {
      const res = await apiClient.get<{ data: CotacaoResponse }>(
        '/comercial/comissao/cotacao',
      )
      const valor = Number(res.data?.cotacao)
      if (!valor || Number.isNaN(valor)) throw new Error('cotacao invalida')
      cached = { valor, ts: Date.now() }
      return valor
    } catch (err) {
      console.error('[useCotacaoEurBrl] erro ao buscar cotacao:', err)
      return cached?.valor ?? FALLBACK
    } finally {
      pending = null
    }
  })()

  return pending
}

export function useCotacaoEurBrl() {
  const [cotacao, setCotacao] = useState<number | null>(
    cached ? cached.valor : null,
  )

  useEffect(() => {
    let alive = true
    fetchCotacao().then(v => {
      if (alive) setCotacao(v)
    })
    return () => {
      alive = false
    }
  }, [])

  return cotacao
}

export function formatEur(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'EUR',
  }).format(valor || 0)
}

export function formatBrl(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0)
}
