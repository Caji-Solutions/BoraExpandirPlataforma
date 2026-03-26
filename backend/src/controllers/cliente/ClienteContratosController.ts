import { supabase } from '../../config/SupabaseClient';
import ContratoServicoRepository from '../../repositories/ContratoServicoRepository';
import NotificationService from '../../services/NotificationService';

class ClienteContratosController {
  private async notificarClienteContrato(params: {
    clienteId?: string | null
    titulo: string
    mensagem: string
    tipo?: 'info' | 'success' | 'warning' | 'error' | 'agendamento'
  }) {
    if (!params.clienteId) return
    try {
      await NotificationService.createNotification({
        clienteId: params.clienteId,
        titulo: params.titulo,
        mensagem: params.mensagem,
        tipo: params.tipo || 'info'
      })
    } catch (error) {
      console.error('[ClienteContratosController] Erro ao criar notificacao de contrato:', error)
    }
  }

  private isClienteLead(contrato: any): boolean {
    return String(contrato?.cliente?.status || '').toUpperCase() === 'LEAD'
  }

  // GET /cliente/contratos?clienteId=...
  async getContratos(req: any, res: any) {
    try {
      const clienteIdRaw = (req.query?.clienteId || req.query?.cliente_id || req.params?.clienteId) as string | undefined

      if (!clienteIdRaw) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      const clienteId = String(clienteIdRaw).trim()
      let contratos = await ContratoServicoRepository.getContratos({ clienteId, isDraft: false })

      // Fallback para cenarios em que o frontend envia client_id ou Auth user_id.
      if ((!contratos || contratos.length === 0) && clienteId) {
        const supabase = (await import('../../config/SupabaseClient')).supabase
        let clienteRealId: string | null = null

        const { data: clienteByClientCode } = await supabase
          .from('clientes')
          .select('id')
          .eq('client_id', clienteId)
          .maybeSingle()

        if (clienteByClientCode?.id) {
          clienteRealId = clienteByClientCode.id
        }

        if (!clienteRealId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', clienteId)
            .maybeSingle()

          if (profile?.email) {
            const { data: clienteByEmail } = await supabase
              .from('clientes')
              .select('id')
              .ilike('email', profile.email)
              .maybeSingle()

            if (clienteByEmail?.id) {
              clienteRealId = clienteByEmail.id
            }
          }
        }

        if (clienteRealId && clienteRealId !== clienteId) {
          contratos = await ContratoServicoRepository.getContratos({ clienteId: clienteRealId, isDraft: false })
        }
      }

      return res.status(200).json({
        message: 'Contratos recuperados com sucesso',
        data: contratos
      })
    } catch (error: any) {
      console.error('Erro ao buscar contratos do cliente:', error)
      return res.status(500).json({
        message: 'Erro ao buscar contratos',
        error: error.message
      })
    }
  }

  // POST /cliente/contratos/:id/upload
  async uploadContratoAssinado(req: any, res: any) {
    try {
      const { id } = req.params
      const file = req.file
      const clienteId = req.body.cliente_id || req.body.clienteId

      if (!file) {
        return res.status(400).json({ message: 'Arquivo do contrato é obrigatório' })
      }

      if (!clienteId) {
        return res.status(400).json({ message: 'cliente_id é obrigatório' })
      }

      const contrato = await ContratoServicoRepository.getContratoById(id)
      if (!contrato) {
        return res.status(404).json({ message: 'Contrato não encontrado' })
      }

      if (contrato.cliente_id !== clienteId) {
        return res.status(403).json({ message: 'Contrato não pertence ao cliente informado' })
      }

      if (this.isClienteLead(contrato)) {
        return res.status(403).json({ message: 'Leads nao podem enviar contrato pelo portal. Aguarde a conversao para cliente.' })
      }

      if (!['pendente', 'recusado'].includes(contrato.assinatura_status)) {
        return res.status(409).json({ message: 'Este contrato nao aceita novo upload nesta etapa.' })
      }

      const timestamp = Date.now()
      const ext = file.originalname.split('.').pop() || 'pdf'
      const filePath = `contratos/${id}/${timestamp}_contrato_assinado_cliente.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        })

      if (uploadError) {
        console.error('[ClienteContratosController] Erro no upload do contrato:', uploadError)
        return res.status(500).json({ message: 'Erro ao fazer upload do contrato' })
      }

      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath)

      const updated = await ContratoServicoRepository.updateContrato(id, {
        contrato_assinado_url: urlData.publicUrl,
        contrato_assinado_path: filePath,
        contrato_assinado_nome_original: file.originalname,
        assinatura_status: 'em_analise',
        assinatura_upload_origem: 'cliente',
        assinatura_upload_por: clienteId,
        assinatura_upload_em: new Date().toISOString(),
        assinatura_recusa_nota: null,
        atualizado_em: new Date().toISOString()
      })

      await this.notificarClienteContrato({
        clienteId: updated.cliente_id,
        titulo: 'Contrato enviado',
        mensagem: 'Seu contrato foi enviado e esta em analise do time comercial.',
        tipo: 'info'
      })

      return res.status(200).json({
        message: 'Contrato enviado com sucesso',
        data: updated
      })
    } catch (error: any) {
      console.error('Erro ao enviar contrato assinado:', error)
      return res.status(500).json({
        message: 'Erro ao enviar contrato',
        error: error.message
      })
    }
  }
}

export default new ClienteContratosController()
