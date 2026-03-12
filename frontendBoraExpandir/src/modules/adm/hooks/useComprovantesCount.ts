import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL

export function useComprovantesCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await window.fetch(`${API_BASE_URL}/financeiro/comprovantes/pendentes`)
        if (res.ok) {
          const json = await res.json()
          setCount(json.data?.length || 0)
        }
      } catch { /* silently ignore */ }
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  return count
}
