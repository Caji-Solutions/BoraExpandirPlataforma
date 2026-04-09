import { DocumentStatus } from '../../constants/DocumentStatus';
import ClienteRepository from '../../repositories/ClienteRepository';
import AdmRepository from '../../repositories/AdmRepository';
import NotificationService from '../../services/NotificationService';
import { getDocumentosPorTipoServico, DocumentoRequeridoConfig } from '../../config/documentosConfig';
import { supabase } from '../../config/SupabaseClient';

interface DocumentoRequeridoComProcesso extends DocumentoRequeridoConfig {
  processoId: string;
  processoTipo: string;
  processoStatus: string;
  processoEtapa: number;
}

class ClienteDocumentController {
  // Método auxiliar para resolver o ID real de negócio (Cliente ID) a partir do ID de autenticação (Auth ID)
  private async resolveClienteRealId(userId: string): Promise<string | null> {
    try {
      // 1. Verificar se o ID já é de um cliente na tabela 'clientes'
      const { data: clienteDireto } = await supabase
        .from('clientes')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (clienteDireto) return clienteDireto.id;

      // 2. Se não encontrou, buscar o e-mail no profile e procurar na tabela clientes
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.email) {
        const { data: clientePorEmail } = await supabase
          .from('clientes')
          .select('id')
          .ilike('email', profile.email)
          .maybeSingle();

        if (clientePorEmail) return clientePorEmail.id;
      }

      return null;
    } catch (error) {
      console.error('[ClienteDocumentController] Erro ao resolver ID real:', error);
      return null;
    }
  }

  // GET /cliente/:clienteId/documentos
  async getDocumentos(req: any, res: any) {
    try {
      let { clienteId } = req.params
      const { id: userId, role } = req.user

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      // Se for cliente, resolver o ID real e garantir acesso apenas ao próprio
      if (role === 'cliente') {
        const idNegocio = await this.resolveClienteRealId(userId);
        if (!idNegocio || (idNegocio !== clienteId && userId !== clienteId)) {
          return res.status(403).json({ message: 'Sem permissão para acessar documentos de outro cliente' })
        }
        // Sempre usar o ID de negócio para a busca no banco
        clienteId = idNegocio;
      } else {
        // Para admin/juridico, validar role
        const rolesAutorizados = ['admin', 'juridico', 'super_admin', 'comercial', 'administrativo']
        if (!rolesAutorizados.includes(role)) {
          return res.status(403).json({ message: 'Sem permissão para acessar documentos' })
        }
      }

      const documentos = await ClienteRepository.getDocumentosByClienteId(clienteId)

      return res.status(200).json({
        message: 'Documentos recuperados com sucesso',
        data: documentos
      })
    } catch (error: any) {
      console.error('Erro ao buscar documentos:', error)
      return res.status(500).json({
        message: 'Erro ao buscar documentos',
        error: error.message
      })
    }
  }

  // GET /cliente/processo/:processoId/documentos
  async getDocumentosByProcesso(req: any, res: any) {
    try {
      const { processoId } = req.params
      const { role } = req.user

      if (!processoId) {
        return res.status(400).json({ message: 'processoId é obrigatório' })
      }

      // Apenas juridico e admin conseguem ver documentos por processo
      // (clientes devem usar /cliente/:clienteId/documentos)
      if (role !== 'admin' && role !== 'juridico') {
        return res.status(403).json({ message: 'Sem permissão para acessar documentos por processo' })
      }

      const documentos = await ClienteRepository.getDocumentosByProcessoId(processoId)

      return res.status(200).json({
        message: 'Documentos do processo recuperados com sucesso',
        data: documentos,
        total: documentos.length
      })
    } catch (error: any) {
      console.error('Erro ao buscar documentos do processo:', error)
      return res.status(500).json({
        message: 'Erro ao buscar documentos do processo',
        error: error.message
      })
    }
  }

  // GET /cliente/:clienteId/documentos-requeridos
  // Retorna os documentos necessários baseado nos processos do cliente
  async getDocumentosRequeridos(req: any, res: any) {
    try {
      let { clienteId } = req.params
      const { id: userId, role } = req.user

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      // Resolver o ID para clientes
      if (role === 'cliente') {
        const idNegocio = await this.resolveClienteRealId(userId);
        if (!idNegocio || (idNegocio !== clienteId && userId !== clienteId)) {
          return res.status(403).json({ message: 'Sem permissão para acessar documentos requeridos de outro cliente' })
        }
        clienteId = idNegocio;
      } else if (!['admin', 'juridico', 'super_admin', 'comercial', 'administrativo'].includes(role)) {
        return res.status(403).json({ message: 'Sem permissão para acessar documentos requeridos' })
      }

      // Buscar os processos do cliente
      const processos = await ClienteRepository.getProcessosByClienteId(clienteId)

      if (!processos || processos.length === 0) {
        return res.status(200).json({
          message: 'Cliente não possui processos ativos',
          data: [],
          processos: []
        })
      }

      // Para cada processo, buscar os documentos requeridos baseado no tipo_servico ou servico_id
      const documentosRequeridos: DocumentoRequeridoComProcesso[] = []

      for (const processo of processos) {
        let docsDoServico: DocumentoRequeridoConfig[] = []

        if (processo.servico_id) {
          try {
            const servico = await AdmRepository.getServiceById(processo.servico_id)
            if (servico && servico.requisitos) {
              docsDoServico = servico.requisitos.map((r: any) => ({
                type: r.nome,
                name: r.nome,
                description: `Documento para a etapa ${r.etapa}`,
                required: r.obrigatorio,
                examples: []
              }))
            }
          } catch (admError) {
            console.error(`Erro ao buscar servico ${processo.servico_id}:`, admError)
          }
        }

        // Fallback para o mapeamento estático se não encontrou nada no banco
        if (docsDoServico.length === 0) {
          docsDoServico = getDocumentosPorTipoServico(processo.tipo_servico)
        }

        // Adicionar cada documento com as informações do processo
        for (const doc of docsDoServico) {
          documentosRequeridos.push({
            ...doc,
            processoId: processo.id,
            processoTipo: processo.tipo_servico,
            processoStatus: processo.status,
            processoEtapa: processo.etapa_atual
          })
        }
      }

      return res.status(200).json({
        message: 'Documentos requeridos recuperados com sucesso',
        data: documentosRequeridos,
        processos: processos.map(p => ({
          id: p.id,
          tipoServico: p.tipo_servico,
          status: p.status,
          etapaAtual: p.etapa_atual
        })),
        totalDocumentos: documentosRequeridos.length
      })
    } catch (error: any) {
      console.error('Erro ao buscar documentos requeridos:', error)
      return res.status(500).json({
        message: 'Erro ao buscar documentos requeridos',
        error: error.message
      })
    }
  }

  // POST /cliente/documento
  async uploadDoc(req: any, res: any) {
    try {
      const { clienteId, documentType, processoId, documentoId } = req.body
      const file = req.file

      console.log('========== UPLOAD DOC DEBUG ==========')
      console.log('req.body:', req.body)
      console.log('clienteId:', clienteId)
      console.log('processoId:', processoId)
      console.log('documentoId:', documentoId)
      console.log('memberId:', req.body.memberId)
      console.log('documentType:', documentType)
      console.log('file:', file ? {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      } : 'undefined')
      console.log('=======================================')

      if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' })
      }

      if (!clienteId && !documentoId) {
        return res.status(400).json({ message: 'clienteId ou documentoId é obrigatório' })
      }

      if (!documentType && !documentoId) {
        return res.status(400).json({ message: 'documentType é obrigatório para novos documentos' })
      }

      // Sanitizar o documentType para usar nos arquivos e pastas (evitar erro com acentos ou espaços)
      const safeDocType = (documentType || 'doc')
        .trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/\s+/g, '_'); // Troca espaços por "_"

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      let memberId = req.body.memberId
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `${safeDocType}_${timestamp}.${fileExtension}`

      // Se for cliente logado, garantir que estamos usando o clienteId correto dele
      let clienteIdFinal = clienteId;
      const { id: authUserId, role } = req.user;
      
      if (role === 'cliente') {
        const idNegocio = await this.resolveClienteRealId(authUserId);
        if (idNegocio) {
          clienteIdFinal = idNegocio;
          // Se memberId for igual ao authUserId ou clienteId passado, ajustamos para o de negócio
          if (!memberId || memberId === authUserId || memberId === clienteId) {
            memberId = idNegocio;
          }
        }
      }

      // Construir o caminho do arquivo
      let filePath = ''
      if (processoId) {
        filePath += `${processoId}/`
      } else {
        filePath += `sem_processo/`
      }

      const targetId = memberId || clienteId || 'desconhecido'
      filePath += `${targetId}`
      filePath += `/${safeDocType || 'upgrade'}/${fileName}`

      console.log('FilePath gerado:', filePath)

      // Upload para o Supabase Storage via Repository
      const uploadResult = await ClienteRepository.uploadDocument({
        filePath,
        fileBuffer: file.buffer,
        contentType: file.mimetype
      })
      console.log('Upload result:', uploadResult)

      let documentoRecord;

      if (documentoId) {
        const docs = await ClienteRepository.getDocumentosByClienteId(clienteIdFinal);
        const docAtual = docs.find(d => d.id === documentoId);

        let novoStatus: DocumentStatus = DocumentStatus.ANALYZING;
        if (docAtual?.status === 'WAITING_APOSTILLE') {
          novoStatus = DocumentStatus.ANALYZING_APOSTILLE;
        } else if (docAtual?.status === 'WAITING_TRANSLATION') {
          novoStatus = DocumentStatus.ANALYZING_TRANSLATION;
        }

        documentoRecord = await ClienteRepository.updateDocumentoFile(documentoId, {
          nomeOriginal: file.originalname,
          nomeArquivo: fileName,
          storagePath: filePath,
          publicUrl: uploadResult.publicUrl,
          contentType: file.mimetype,
          tamanho: file.size,
          status: novoStatus
        });
      } else {
        // Criar novo registro
        documentoRecord = await ClienteRepository.createDocumento({
          clienteId: clienteIdFinal,
          processoId: processoId || undefined,
          tipo: documentType,
          nomeOriginal: file.originalname,
          nomeArquivo: fileName,
          storagePath: filePath,
          publicUrl: uploadResult.publicUrl,
          contentType: file.mimetype,
          tamanho: file.size,
          status: DocumentStatus.ANALYZING,
          dependenteId: (memberId && memberId !== clienteIdFinal) ? memberId : undefined
        })
      }

      console.log('Documento processado no banco:', documentoRecord.id)
      console.log('********** TABELA DE DOCUMENTOS ATUALIZADA: ', documentoRecord.id)

      // BUG FIX: Garantir que o status muda na tabela PROCESSOS (e não na de clientes)
      const processoIdParaUpdate = documentoRecord.processo_id || processoId;
      if (processoIdParaUpdate) {
        console.log('[uploadDoc] ATUALIZANDO TABELA PROCESSOS para analise_documentos | ID:', processoIdParaUpdate)
        
        const { data: upData, error: updateError } = await supabase
          .from('processos')
          .update({ 
            status: 'analise_documentos',
            etapa_atual: 1, // Corresponde a 'Análise de Documentos' no Fluxo
            atualizado_em: new Date().toISOString()
          })
          .eq('id', processoIdParaUpdate)
          .select();

        if (updateError) {
          console.error('[uploadDoc] ERRO ao atualizar tabela processos:', updateError)
        } else {
          console.log('[uploadDoc] SUCESSO ao atualizar tabela processos. Resultado:', upData)
        }
      } else {
        console.warn('[uploadDoc] Nenhum processo_id vinculado ao documento para atualização de status.')
      }

      // Notificar o jurídico responsável quando um novo documento é enviado
      if (processoIdParaUpdate && !documentoId) {
        try {
          const { data: processo } = await supabase
            .from('processos')
            .select('responsavel_id, cliente: clientes(nome, id)')
            .eq('id', processoIdParaUpdate)
            .maybeSingle()

          if (processo?.responsavel_id) {
            console.log(`[uploadDoc] Jurídico ${processo.responsavel_id} identificado para possível notficação.`)
          }
        } catch (notifyError) {
          console.error('[uploadDoc] Erro ao buscar dados para notificação:', notifyError)
        }
      }

      return res.status(200).json({
        message: documentoId ? 'Documento atualizado com sucesso' : 'Documento enviado com sucesso',
        data: {
          id: documentoRecord.id,
          ...uploadResult,
          fileName: file.originalname,
          documentType: documentoRecord.tipo,
          clienteId: documentoRecord.cliente_id,
          processoId: documentoRecord.processo_id,
          status: documentoRecord.status
        }
      })
    } catch (error: any) {
      console.error('Erro inesperado no upload:', error)
      return res.status(500).json({
        message: 'Erro ao fazer upload do documento',
        error: error.message
      })
    }
  }

  // DELETE /cliente/documento/:documentoId
  async deleteDocumento(req: any, res: any) {
    try {
      const { documentoId } = req.params
      const { id: userId, role } = req.user

      if (!documentoId) {
        return res.status(400).json({ message: 'documentoId é obrigatório' })
      }

      // Validar autorização: cliente só deleta seus próprios, admin/juridico deletam de qualquer um
      if (role === 'cliente') {
        // Resolver o ID real de negócio para deletar
        const idNegocio = await this.resolveClienteRealId(userId);
        if (!idNegocio) {
          return res.status(403).json({ message: 'Cliente não identificado' })
        }
        
        // Verificar se documento pertence ao cliente
        const docs = await ClienteRepository.getDocumentosByClienteId(idNegocio)
        const docBelongsToClient = docs.some(d => d.id === documentoId)
        if (!docBelongsToClient) {
          return res.status(403).json({ message: 'Sem permissão para deletar documento de outro cliente' })
        }
      }

      await ClienteRepository.deleteDocumento(documentoId)

      return res.status(200).json({
        message: 'Documento deletado com sucesso'
      })
    } catch (error: any) {
      console.error('Erro ao deletar documento:', error)
      return res.status(500).json({
        message: 'Erro ao deletar documento',
        error: error.message
      })
    }
  }

  // PATCH /cliente/documento/:documentoId/status
  async updateDocumentoStatus(req: any, res: any) {
    const { documentoId } = req.params
    const { status, motivoRejeicao } = req.body
    const { id: userId, role } = req.user

    console.log('========== [ClienteDocumentController][updateDocumentoStatus] START ==========')
    console.log('Input:', { documentoId, status, motivoRejeicao, userId, role })

    try {
      if (!documentoId) {
        return res.status(400).json({ message: 'documentoId é obrigatório' })
      }

      // Validar que apenas juridico/admin conseguem atualizar status
      if (role !== 'juridico' && role !== 'admin') {
        return res.status(403).json({ message: 'Apenas jurídico ou admin conseguem atualizar status' })
      }

      const validStatuses = [
        'PENDING', 'ANALYZING', 'WAITING_APOSTILLE', 'ANALYZING_APOSTILLE',
        'WAITING_TRANSLATION', 'ANALYZING_TRANSLATION', 'WAITING_TRANSLATION_QUOTE',
        'WAITING_ADM_APPROVAL', 'WAITING_QUOTE_APPROVAL', 'APPROVED', 'REJECTED',
        'ANALYZING_APOSTILLE_PAYMENT', 'ANALYZING_TRANSLATION_PAYMENT',
        'EXECUTING_APOSTILLE', 'EXECUTING_TRANSLATION',
        'solicitado', 'em_analise', 'disponivel'
      ];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Status inválido' })
      }

      let apostilado: boolean | undefined = undefined;
      let traduzido: boolean | undefined = undefined;

      if (['WAITING_TRANSLATION', 'ANALYZING_TRANSLATION'].includes(status)) {
        apostilado = true;
      }
      else if (status === 'APPROVED') {
        apostilado = true;
        traduzido = true;
      }

      const { solicitado_pelo_juridico, prazo } = req.body;

      // Usar o userId do usuário autenticado em vez de req.body
      const documento = await ClienteRepository.updateDocumentoStatus(
        documentoId,
        status,
        motivoRejeicao,
        userId,
        apostilado,
        traduzido,
        solicitado_pelo_juridico
      )

      console.log('[ClienteDocumentController][updateDocumentoStatus] Repo updated document:', documento.id)

      // Criar notificação se o status exigir ação do cliente ou se foi solicitado pelo jurídico
      try {
        const canNotify = status === 'REJECTED' || status === 'WAITING_APOSTILLE' || status === 'WAITING_TRANSLATION' || solicitado_pelo_juridico;
        
        if (canNotify) {
          let titulo = '';
          let mensagem = '';
          let tipo: 'info' | 'success' | 'warning' | 'error' = 'info';

          if (status === 'REJECTED') {
            titulo = `Documento Rejeitado: ${documento.tipo}`;
            mensagem = `O documento "${documento.tipo}" foi rejeitado. Motivo: ${motivoRejeicao || 'Não especificado'}. Por favor, envie uma nova versão.`;
            tipo = 'error';
          } else if (status === 'WAITING_APOSTILLE' || (solicitado_pelo_juridico && status.includes('APOSTILLE'))) {
            titulo = 'Apostilamento Necessário';
            mensagem = `O documento "${documento.tipo}" foi analisado e agora precisa ser apostilado. Por favor, providencie o apostilamento.`;
            tipo = 'warning';
          } else if (status === 'WAITING_TRANSLATION' || (solicitado_pelo_juridico && status.includes('TRANSLATION'))) {
            titulo = 'Tradução Necessária';
            mensagem = `O documento "${documento.tipo}" foi analisado e agora precisa ser traduzido. Por favor, providencie a tradução.`;
            tipo = 'warning';
          }

          if (titulo && mensagem) {
            console.log(`[ClienteDocumentController][updateDocumentoStatus] Creating notification: ${titulo}`)
            await NotificationService.createNotification({
              clienteId: documento.cliente_id,
              criadorId: userId,
              titulo,
              mensagem,
              tipo,
              prazo: prazo ? Number(prazo) : (status === 'REJECTED' ? undefined : 15)
            });
            console.log(`[ClienteDocumentController][updateDocumentoStatus] Notification sent to client ${documento.cliente_id}`)
          }
        }
      } catch (notifyError) {
        console.error('[ClienteDocumentController][updateDocumentoStatus] Notification error:', notifyError);
      }

      const response = {
        message: 'Status do documento atualizado com sucesso',
        data: documento
      }

      console.log('[ClienteDocumentController][updateDocumentoStatus] SUCCESS:', response)
      return res.status(200).json(response)
    } catch (error: any) {
      console.error('[ClienteDocumentController][updateDocumentoStatus] ERROR:', error)
      return res.status(500).json({
        message: `Erro ao atualizar status do documento: ${error.message}`,
        error: error.message
      })
    } finally {
      console.log('===============================================');
    }
  }

  // POST /cliente/documento/:documentoId/upload-admin
  async uploadAdminDocument(req: any, res: any) {
    try {
      const { documentoId } = req.params
      const file = req.file
      const { role } = req.user

      if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' })
      }

      if (!['admin', 'juridico', 'super_admin', 'administrativo'].includes(role)) {
        return res.status(403).json({ message: 'Sem permissao para fazer upload administrativo' })
      }

      const existingDoc = await ClienteRepository.getDocumentoById(documentoId)

      if (!existingDoc) {
        return res.status(404).json({ message: 'Documento nao encontrado' })
      }

      const safeDocType = (existingDoc.tipo || 'doc')
        .trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')

      const timestamp = Date.now()
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `${safeDocType}_admin_${timestamp}.${fileExtension}`
      const filePath = `admin_uploads/${documentoId}/${fileName}`

      const uploadResult = await ClienteRepository.uploadDocument({
        filePath,
        fileBuffer: file.buffer,
        contentType: file.mimetype
      })

      const updatedDoc = await ClienteRepository.updateDocumentoFile(documentoId, {
        nomeOriginal: file.originalname,
        nomeArquivo: fileName,
        storagePath: filePath,
        adminUploadUrl: uploadResult.publicUrl,
        contentType: file.mimetype,
        tamanho: file.size,
        status: DocumentStatus.ANALYZING
      })

      return res.status(200).json({
        message: 'Documento administrativo enviado com sucesso',
        data: {
          documentoId: updatedDoc.id,
          adminUploadUrl: updatedDoc.admin_upload_url,
          clientOriginalUrl: updatedDoc.public_url
        }
      })
    } catch (error: any) {
      console.error('[uploadAdminDocument] Error:', error)
      return res.status(500).json({
        message: 'Erro ao enviar documento administrativo',
        details: error.message
      })
    }
  }

  // GET /cliente/:clienteId/processos
  async getProcessos(req: any, res: any) {
    try {
      let { clienteId } = req.params
      const { id: userId, role } = req.user

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      // Resolver o ID para clientes
      if (role === 'cliente') {
        const idNegocio = await this.resolveClienteRealId(userId);
        if (!idNegocio || (idNegocio !== clienteId && userId !== clienteId)) {
          return res.status(403).json({ message: 'Sem permissão para acessar processos de outro cliente' })
        }
        clienteId = idNegocio;
      } else if (!['admin', 'juridico', 'super_admin', 'comercial', 'administrativo'].includes(role)) {
        return res.status(403).json({ message: 'Sem permissão para acessar processos' })
      }

      const processos = await ClienteRepository.getProcessosByClienteId(clienteId)

      return res.status(200).json({
        message: 'Processos recuperados com sucesso',
        data: processos
      })
    } catch (error: any) {
      console.error('Erro ao buscar processos:', error)
      return res.status(500).json({
        message: 'Erro ao buscar processos',
        error: error.message
      })
    }
  }
}

export default new ClienteDocumentController()
