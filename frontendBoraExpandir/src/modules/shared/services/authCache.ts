/**
 * Cache Service para Autenticação
 * Evita requisições repetidas ao validar auth a cada navegação
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface TeamCacheEntry {
  [key: string]: CacheEntry<any[]>
}

// Cache em memória com TTL
class AuthCache {
  private authCache: CacheEntry<any> | null = null
  private teamCache: TeamCacheEntry = {}
  private readonly AUTH_TTL = 1000 * 60 * 30 // 30 minutos
  private readonly TEAM_TTL = 1000 * 60 * 10 // 10 minutos

  /**
   * Obter autenticação do cache (com validação de TTL)
   */
  getAuth<T>(): T | null {
    if (!this.authCache) return null

    const now = Date.now()
    const age = now - this.authCache.timestamp

    if (age > this.AUTH_TTL) {
      // Cache expirou
      this.authCache = null
      return null
    }

    return this.authCache.data as T
  }

  /**
   * Salvar autenticação no cache
   */
  setAuth<T>(data: T): void {
    this.authCache = {
      data,
      timestamp: Date.now(),
    }
  }

  /**
   * Obter equipe do cache
   */
  getTeam<T>(role: string): T | null {
    const cached = this.teamCache[role]
    if (!cached) return null

    const now = Date.now()
    const age = now - cached.timestamp

    if (age > this.TEAM_TTL) {
      // Cache expirou
      delete this.teamCache[role]
      return null
    }

    return cached.data as T
  }

  /**
   * Salvar equipe no cache
   */
  setTeam(role: string, data: any[]): void {
    this.teamCache[role] = {
      data,
      timestamp: Date.now(),
    }
  }

  /**
   * Limpar cache
   */
  clear(): void {
    this.authCache = null
    this.teamCache = {}
  }

  /**
   * Invalidar cache de um role específico
   */
  invalidateTeam(role?: string): void {
    if (role) {
      delete this.teamCache[role]
    } else {
      this.teamCache = {}
    }
  }
}

export const authCache = new AuthCache()
