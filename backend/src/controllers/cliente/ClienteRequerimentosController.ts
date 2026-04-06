import JuridicoRepository from '../../repositories/JuridicoRepository';

class ClienteRequerimentosController {
  // GET /cliente/:clienteId/requerimentos
  async getRequerimentosByCliente(req: any, res: any) {
    try {
      const { clienteId } = req.params

      console.log('========== GET REQUERIMENTOS DEBUG ==========')
      console.log('[ClienteRequerimentosController.getRequerimentosByCliente] Iniciando...')
      console.log('[ClienteRequerimentosController] clienteId:', clienteId)

      if (!clienteId) {
        console.log('[ClienteRequerimentosController] ❌ Erro: clienteId ausente')
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      console.log('[ClienteRequerimentosController] Chamando JuridicoRepository.getRequerimentosByClienteId...')
      const requerimentos = await JuridicoRepository.getRequerimentosByClienteId(clienteId)

      console.log('[ClienteRequerimentosController] ✅ Sucesso - Dados recuperados')
      console.log(`[ClienteRequerimentosController] Total de requerimentos: ${requerimentos?.length || 0}`)
      console.log('========== FIM GET REQUERIMENTOS DEBUG ==========')

      return res.status(200).json({
        message: 'Requerimentos recuperados com sucesso',
        data: requerimentos
      })
    } catch (error: any) {
      console.error('[ClienteRequerimentosController] ❌ Erro ao buscar requerimentos:', error)
      return res.status(500).json({
        message: 'Erro ao buscar requerimentos',
        error: error.message
      })
    }
  }
}

export default new ClienteRequerimentosController()
