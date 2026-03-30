import { supabase } from '../../config/SupabaseClient';

class ParceiroTermoController {
  // GET /cliente/parceiro/termo-status/:clienteId
  async getTermoStatus(req: any, res: any) {
    try {
      const { clienteId } = req.params;

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' });
      }

      // Busca se existe termo aceito para a versão atual (1.0)
      const { data, error } = await supabase
        .from('termos_aceite_parceiro')
        .select('id, aceito_em')
        .eq('cliente_id', clienteId)
        .eq('versao_termo', '1.0')
        .maybeSingle();

      if (error) {
        console.error('[ParceiroTermoController] Erro ao buscar termo:', error);
        return res.status(500).json({
          message: 'Erro ao verificar termo de aceite',
          error: error.message
        });
      }

      const aceito = !!data;

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

      // Verificar se já não existe um aceite para esta versão
      const { data: existingAceite } = await supabase
        .from('termos_aceite_parceiro')
        .select('id')
        .eq('cliente_id', clienteId)
        .eq('versao_termo', '1.0')
        .maybeSingle();

      if (existingAceite) {
        // Já existe um aceite, retornar sucesso
        return res.status(200).json({
          message: 'Termo já foi aceito anteriormente',
          data: { aceito: true }
        });
      }

      // Extrair IP do cliente
      const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '';

      // Inserir novo aceite
      const { data: newAceite, error } = await supabase
        .from('termos_aceite_parceiro')
        .insert({
          cliente_id: clienteId,
          versao_termo: '1.0',
          ip_address: ipAddress
        })
        .select('id, aceito_em')
        .single();

      if (error) {
        console.error('[ParceiroTermoController] Erro ao inserir termo:', error);
        return res.status(500).json({
          message: 'Erro ao aceitar termo',
          error: error.message
        });
      }

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
