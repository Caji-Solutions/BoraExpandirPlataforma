import JuridicoRepository from '../repositories/JuridicoRepository';

class ClienteRequerimentosController {
  // GET /cliente/:clienteId/requerimentos
  async getRequerimentosByCliente(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      const requerimentos = await JuridicoRepository.getRequerimentosByClienteId(clienteId)

      return res.status(200).json({
        message: 'Requerimentos recuperados com sucesso',
        data: requerimentos
      })
    } catch (error: any) {
      console.error('Erro ao buscar requerimentos:', error)
      return res.status(500).json({
        message: 'Erro ao buscar requerimentos',
        error: error.message
      })
    }
  }
}

export default new ClienteRequerimentosController()
