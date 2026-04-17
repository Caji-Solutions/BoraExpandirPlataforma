const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

class ConfigService {
  async get(chave: string) {
    try {
      const response = await fetch(`${API_URL}/configuracoes/${chave}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar configuração')
      }
      const data = await response.json()
      return data.valor
    } catch (error) {
      console.error('ConfigService.get error:', error)
      return null
    }
  }

  async set(chave: string, valor: any) {
    try {
      const response = await fetch(`${API_URL}/configuracoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chave, valor })
      })
      if (!response.ok) {
        throw new Error('Erro ao salvar configuração')
      }
      return await response.json()
    } catch (error) {
      console.error('ConfigService.set error:', error)
      throw error
    }
  }
}

export const configService = new ConfigService()
