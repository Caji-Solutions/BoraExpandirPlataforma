import { supabase } from '../config/SupabaseClient'
import type { ClienteDTO } from '../types/parceiro';
import ClienteRepository from '../repositories/ClienteRepository';

class ClienteController {
  // GET /cliente/by-parceiro/:parceiroId
  async getByParceiro(req: any, res: any) {
    try {
      const { parceiroId } = req.params
      if (!parceiroId) {
        return res.status(400).json({ message: 'Parâmetro parceiroId é obrigatório' })
      }
      const data = await ClienteRepository.getClientByParceiroId(parceiroId)

      return res.status(200).json(data ?? [])
    } catch (err: any) {
      console.error('Erro inesperado ao consultar clientes:', err)
      return res.status(500).json({ message: 'Erro inesperado ao consultar clientes', error: err.message })
    }
  }

  async register(req: any, res: any) {
    try {
      
      const { nome, email, whatsapp, parceiro_id, status} = req.body
      const Cliente = { nome, email, whatsapp, parceiro_id, status } as ClienteDTO    
      const createdData = await ClienteRepository.register(Cliente)  
    return res.status(201).json(createdData)   
    } catch (error) {
      throw error
    }
  }
  async AttStatusClientebyWpp(req: any, res: any) {
    try {
      const { wppNumber, status } = req.body
      const cliente = await ClienteRepository.getClienteByWppNumber(wppNumber)


      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' })
      }
      
      const updatedData = await ClienteRepository.attStatusById(cliente.id, status)
     

      return res.status(200).json(updatedData)
    } catch (error) {
      throw error
    }
  }
}

export default new ClienteController()