import { supabase } from '../config/SupabaseClient';

class ParceiroTermoRepository {
  async getStatus(clienteId: string, versao = '1.0') {
    const { data, error } = await supabase
      .from('termos_aceite_parceiro')
      .select('id, aceito_em')
      .eq('cliente_id', clienteId)
      .eq('versao_termo', versao)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  async aceitar(clienteId: string, ipAddress: string, versao = '1.0') {
    // Verificar se já existe
    const alreadyAccepted = await this.getStatus(clienteId, versao);
    if (alreadyAccepted) return true;

    const { error } = await supabase
      .from('termos_aceite_parceiro')
      .insert({
        cliente_id: clienteId,
        versao_termo: versao,
        ip_address: ipAddress
      });

    if (error) throw error;
    return true;
  }
}

export default new ParceiroTermoRepository();
