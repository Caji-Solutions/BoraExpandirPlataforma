import { Request, Response } from 'express';
import BoletoParcelasRepository from '../../repositories/BoletoParcelasRepository';
import ComercialRepository from '../../repositories/ComercialRepository';
import ContratoServicoRepository from '../../repositories/ContratoServicoRepository';
import ClienteRepository from '../../repositories/ClienteRepository';
import { supabase } from '../../config/SupabaseClient';

class ClientePagamentoController {
  async getPagamentos(req: Request, res: Response) {
    try {
      const { clienteId } = req.params;
      console.log(`[ClientePagamentoController] 🔍 Buscando pagamentos para o cliente: ${clienteId}`);

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' });
      }

      // 1. Buscar de múltiplas fontes em paralelo
      console.log('[ClientePagamentoController] Chamando repositórios em paralelo...');
      const [parcelas, agendamentos, contratos, documentos] = await Promise.all([
        BoletoParcelasRepository.getParcelasByCliente(clienteId),
        ComercialRepository.getAgendamentosByCliente(clienteId),
        ContratoServicoRepository.getContratos({ clienteId }),
        ClienteRepository.getDocumentosByClienteId(clienteId)
      ]);
 
       console.log(`[ClientePagamentoController] ✅ Dados brutos recuperados:
         - Parcelas: ${parcelas.length}
         - Agendamentos: ${agendamentos.length}
         - Contratos: ${contratos.length}
         - Documentos (para busca de orçamentos): ${documentos.length}`);

       // Enrich Agendamentos with Catalog data
       const productIds = [...new Set(agendamentos.map((a: any) => a.produto_id).filter(Boolean))];
       let catalogServicesMap = new Map();
       
       if (productIds.length > 0) {
         console.log(`[ClientePagamentoController] 🔍 Buscando ${productIds.length} produtos no catálogo...`);
         const { data: services } = await supabase
           .from('catalogo_servicos')
           .select('id, nome, valor, tipo')
           .in('id', productIds);
         
         if (services) {
           services.forEach((s: any) => catalogServicesMap.set(s.id, s));
         }
       }

       // Helper para detectar atraso
      const isAtrasado = (status: string, dataVencimento: any) => {
        if (status !== 'pendente') return false;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        return new Date(dataVencimento) < hoje;
      };

      const pagamentos: any[] = [];

      // 2. Mapear Parcelas (Boletos)
      if (parcelas.length > 0) {
        console.log('[ClientePagamentoController] Mapeando parcelas_servicos...');
        parcelas.forEach((p: any) => {
          const status = isAtrasado(p.status, p.data_vencimento) ? 'atrasado' : p.status;
          
          let categoria = 'Assessoria';
          if (p.servico_nome?.toLowerCase().includes('consultoria')) categoria = 'Consultoria';
          if (p.origem_tipo === 'agendamento') categoria = 'Consultoria/Assessoria';

          pagamentos.push({
            id: p.id,
            tipo: 'parcela',
            categoria,
            descricao: p.tipo_parcela === 'entrada' 
              ? `Entrada - ${p.servico_nome || 'Serviço'}` 
              : `Parcela ${p.numero_parcela}/${p.quantidade_parcelas} - ${p.servico_nome || 'Serviço'}`,
            valor: Number(p.valor),
            dataVencimento: p.data_vencimento,
            status,
            comprovanteUrl: p.comprovante_url,
            notaRecusa: p.nota_recusa
          });
        });
      }

      // 3. Mapear Agendamentos
      const agendamentosIdsEmParcelas = new Set(parcelas.filter(p => p.origem_tipo === 'agendamento').map(p => p.origem_id));
      const agendamentosFiltrados = agendamentos.filter((a: any) => !agendamentosIdsEmParcelas.has(a.id));
      
      if (agendamentosFiltrados.length > 0) {
        console.log(`[ClientePagamentoController] Mapeando ${agendamentosFiltrados.length} agendamentos (não parcelados)...`);
        agendamentosFiltrados.forEach((a: any) => {
          const statusRaw = a.pagamento_status || 'pendente';
          const status = isAtrasado(statusRaw, a.data_hora) ? 'atrasado' : statusRaw;
          
          // Enrich with catalog data
          const catalogInfo = catalogServicesMap.get(a.produto_id);
          const valorFinal = catalogInfo?.valor ? Number(catalogInfo.valor) : Number(a.valor || 0);
          const nomeFinal = catalogInfo?.nome || a.produto_nome || 'Agendamento';
          
          let categoria = 'Consultoria';
          if (catalogInfo?.tipo === 'fixo' || nomeFinal.toLowerCase().includes('assessoria')) {
            categoria = 'Assessoria';
          }

          const dataBr = new Date(a.data_hora).toLocaleDateString('pt-BR');
          
          pagamentos.push({
            id: a.id,
            tipo: 'agendamento',
            categoria,
            descricao: `${nomeFinal} - ${dataBr}`,
            valor: valorFinal,
            dataVencimento: a.data_hora,
            status,
            comprovanteUrl: a.comprovante_url,
            notaRecusa: a.pagamento_nota_recusa
          });
        });
      }

      // 4. Mapear Contratos
      const contratosIdsEmParcelas = new Set(parcelas.filter(p => p.origem_tipo === 'contrato').map(p => p.origem_id));
      const contratosFiltrados = contratos.filter((c: any) => !contratosIdsEmParcelas.has(c.id));

      if (contratosFiltrados.length > 0) {
        console.log(`[ClientePagamentoController] Mapeando ${contratosFiltrados.length} contratos (não parcelados)...`);
        contratosFiltrados.forEach((c: any) => {
          const statusRaw = c.pagamento_status || 'pendente';
          const status = isAtrasado(statusRaw, c.criado_em) ? 'atrasado' : statusRaw;
          
          pagamentos.push({
            id: c.id,
            tipo: 'contrato',
            categoria: 'Assessoria',
            descricao: `Acordo/Contrato - ${c.servico_nome || 'Serviço'}`,
            valor: Number(c.servico_valor || 0),
            dataVencimento: c.criado_em,
            status,
            comprovanteUrl: c.pagamento_comprovante_url,
            notaRecusa: c.pagamento_nota_recusa
          });
        });
      }

      // 5. Mapear Orçamentos
      let orcamentosContCount = 0;
      documentos.forEach((doc: any) => {
        if (doc.orcamentos && doc.orcamentos.length > 0) {
          doc.orcamentos.forEach((orc: any) => {
            if (orc.status !== 'cancelado') {
              orcamentosContCount++;
              const statusRaw = orc.status === 'pendente_verificacao' ? 'em_analise' : (orc.status === 'disponivel' ? 'pendente' : orc.status);
              const status = isAtrasado(statusRaw, orc.prazo_entrega) ? 'atrasado' : statusRaw;
              
              let categoria = 'Serviços';
              let prefixo = 'Taxa';
              if (doc.tipo?.toLowerCase().includes('apostilamento') || doc.apostilado) {
                categoria = 'Apostilamento';
                prefixo = 'Taxa de Apostilamento';
              } else if (doc.tipo?.toLowerCase().includes('tradução') || doc.traduzido) {
                categoria = 'Tradução';
                prefixo = 'Taxa de Tradução';
              }

              // Normalizar encoding se detectado (ex: MarÃ§O -> Março)
              let nomeDoc = doc.nome_original || doc.tipo;
              try {
                if (nomeDoc.includes('Ã')) {
                  nomeDoc = decodeURIComponent(escape(nomeDoc));
                }
              } catch (e) {}

              pagamentos.push({
                id: orc.id,
                tipo: 'orcamento',
                categoria,
                descricao: `${prefixo} - ${nomeDoc}`,
                valor: Number(orc.preco_atualizado || orc.valor_orcamento),
                dataVencimento: orc.prazo_entrega,
                status,
                comprovanteUrl: orc.comprovante_url,
                notaRecusa: orc.pagamento_nota_recusa
              });
            }
          });
        }
      });
      if (orcamentosContCount > 0) {
        console.log(`[ClientePagamentoController] Mapeando ${orcamentosContCount} orçamentos (apostila/tradução)...`);
      }

      // Ordenar por data de vencimento
      pagamentos.sort((a, b) => new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime());
      
      console.log(`[ClientePagamentoController] 🚀 Respondendo para o front com ${pagamentos.length} pagamentos unificados.`);
      return res.json({
        success: true,
        data: pagamentos
      });
    } catch (error) {
      console.error('[ClientePagamentoController] Erro ao buscar pagamentos:', error);
      return res.status(500).json({ message: 'Erro interno ao buscar pagamentos' });
    }
  }

  async uploadComprovante(req: any, res: Response) {
    try {
      const { id } = req.params;
      const { tipo, clienteId } = req.body;
      const file = req.file;

      console.log(`[ClientePagamentoController] ⬆️ Iniciando upload universal:`, { id, tipo, clienteId });

      if (!file) {
        return res.status(400).json({ message: 'Arquivo do comprovante é obrigatório' });
      }

      if (!tipo) {
        return res.status(400).json({ message: 'Tipo do pagamento é obrigatório para o upload universal' });
      }

      const { supabase } = await import('../../config/SupabaseClient');
      const timestamp = Date.now();
      const ext = file.originalname.split('.').pop() || 'pdf';
      let filePath = '';
      let updatePayload: any = {};
      let table = '';

      // Definir destino e payload baseado no tipo
      switch (tipo) {
        case 'parcela':
          filePath = `parcelas-comprovantes/${id}/${timestamp}_comprovante.${ext}`;
          table = 'parcelas_servicos';
          updatePayload = {
            status: 'em_analise',
            comprovante_url: null, // Será preenchido abaixo
            nota_recusa: null,
            comprovante_upload_em: new Date().toISOString()
          };
          break;

        case 'agendamento':
          filePath = `agendamentos-comprovantes/${id}/${timestamp}_comprovante.${ext}`;
          table = 'agendamentos';
          updatePayload = {
            pagamento_status: 'em_analise',
            comprovante_url: null,
            pagamento_nota_recusa: null
          };
          break;

        case 'contrato':
          filePath = `contratos-comprovantes/${id}/${timestamp}_comprovante.${ext}`;
          table = 'contratos_servicos';
          updatePayload = {
            pagamento_status: 'em_analise',
            pagamento_comprovante_url: null,
            pagamento_nota_recusa: null,
            pagamento_comprovante_upload_em: new Date().toISOString()
          };
          break;

        case 'orcamento':
          filePath = `orcamentos-comprovantes/${id}/${timestamp}_comprovante.${ext}`;
          table = 'orcamentos';
          updatePayload = {
            status: 'pendente_verificacao',
            comprovante_url: null,
            pagamento_nota_recusa: null
          };
          break;

        default:
          return res.status(400).json({ message: 'Tipo de pagamento inválido' });
      }

      // 1. Upload para o Supabase
      console.log(`[ClientePagamentoController] Enviando arquivo para storage: ${filePath}`);
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (uploadError) {
        console.error('[ClientePagamentoController] Erro no storage:', uploadError);
        return res.status(500).json({ message: 'Erro ao salvar arquivo no storage' });
      }

      // 2. Obter URL pública
      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 3. Preparar payload final de atualização
      if (tipo === 'parcela') updatePayload.comprovante_url = publicUrl;
      if (tipo === 'agendamento') updatePayload.comprovante_url = publicUrl;
      if (tipo === 'contrato') updatePayload.pagamento_comprovante_url = publicUrl;
      if (tipo === 'orcamento') updatePayload.comprovante_url = publicUrl;

      // 4. Atualizar o banco de dados
      console.log(`[ClientePagamentoController] Atualizando tabela ${table} ID ${id}`);
      const { error: dbError } = await supabase
        .from(table)
        .update(updatePayload)
        .eq('id', id);

      if (dbError) {
        console.error(`[ClientePagamentoController] Erro ao atualizar banco (${table}):`, dbError);
        return res.status(500).json({ message: 'Erro ao atualizar status do pagamento no banco' });
      }

      console.log(`[ClientePagamentoController] ✅ Upload concluído com sucesso para ${tipo}`);
      return res.json({
        success: true,
        data: {
          url: publicUrl,
          status: updatePayload.status || updatePayload.pagamento_status
        }
      });

    } catch (error) {
      console.error('[ClientePagamentoController] Erro no upload universal:', error);
      return res.status(500).json({ message: 'Erro interno no processamento do comprovante' });
    }
  }
}

export default new ClientePagamentoController();
