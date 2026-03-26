import { Request, Response } from 'express'
import ConfigRepository from '../repositories/ConfigRepository'

class ConfigController {
  async getConfig(req: Request, res: Response) {
    try {
      const { chave } = req.params
      const valor = await ConfigRepository.get(chave)
      return res.status(200).json({ chave, valor })
    } catch (error) {
      console.error('[ConfigController.getConfig] Error:', error)
      return res.status(500).json({ error: 'Erro ao buscar configuração' })
    }
  }

  async setConfig(req: Request, res: Response) {
    try {
      const { chave, valor } = req.body
      if (!chave) {
        return res.status(400).json({ error: 'Chave é obrigatória' })
      }
      const data = await ConfigRepository.set(chave, valor)
      return res.status(200).json(data)
    } catch (error) {
      console.error('[ConfigController.setConfig] Error:', error)
      return res.status(500).json({ error: 'Erro ao salvar configuração' })
    }
  }
}

export default new ConfigController()
