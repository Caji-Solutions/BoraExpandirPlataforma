import { ParceiroTermoRepository } from '../../repositories';

class ParceiroTermoController {
  // GET /cliente/parceiro/termo-status/:clienteId
  async getTermoStatus(req: any, res: any) {
    try {
      const { clienteId } = req.params;

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' });
      }

      const aceito = await ParceiroTermoRepository.getStatus(clienteId);

      return res.status(200).json({
        message: 'Status do termo recuperado com sucesso',
        data: { aceito }
      });
    } catch (error: any) {
      console.error('[ParceiroTermoController] Erro ao buscar termo:', error);
      return res.status(500).json({
        message: 'Erro ao verificar termo de aceite',
        error: error.message
      });
    }
  }

  // POST /cliente/parceiro/termo-aceitar
  async aceitarTermo(req: any, res: any) {
    try {
      const { clienteId } = req.body;

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' });
      }

      // Extrair IP do cliente
      const forwarded = req.headers['x-forwarded-for'];
      const remoteAddr = req.socket.remoteAddress;
      const ipAddress = (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded?.[0]) || remoteAddr || '0.0.0.0';

      console.log(`[ParceiroTermoController] Aceite de termo. Cliente: ${clienteId}, IP: ${ipAddress} (Forwarded: ${forwarded}, Remote: ${remoteAddr})`);

      await ParceiroTermoRepository.aceitar(clienteId, ipAddress);

      return res.status(201).json({
        message: 'Termo aceito com sucesso',
        data: { aceito: true }
      });
    } catch (error: any) {
      console.error('[ParceiroTermoController] Erro ao aceitar termo:', error);
      return res.status(500).json({
        message: 'Erro ao aceitar termo',
        error: error.message
      });
    }
  }
}

export default new ParceiroTermoController();
