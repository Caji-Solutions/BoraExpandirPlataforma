import { DocumentStatus } from '../constants/DocumentStatus';
import ClienteRepository from '../repositories/ClienteRepository';
import AdmRepository from '../repositories/AdmRepository';
import NotificationService from '../services/NotificationService';
import { getDocumentosPorTipoServico, DocumentoRequeridoConfig } from '../config/documentosConfig';

interface DocumentoRequeridoComProcesso extends DocumentoRequeridoConfig {
  processoId: string;
  processoTipo: string;
  processoStatus: string;
  processoEtapa: number;
}

class ClienteDocumentController {
  // GET /cliente/:clienteId/documentos
  async getDocumentos(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
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

      if (!processoId) {
        return res.status(400).json({ message: 'processoId é obrigatório' })
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
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
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

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const memberId = req.body.memberId
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `${documentType || 'doc'}_${timestamp}.${fileExtension}`

      // Construir o caminho do arquivo
      let filePath = ''
      if (processoId) {
        filePath += `${processoId}/`
      } else {
        filePath += `sem_processo/`
      }

      const targetId = memberId || clienteId || 'desconhecido'
      filePath += `${targetId}`
      filePath += `/${documentType || 'upgrade'}/${fileName}`

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
        const docs = await ClienteRepository.getDocumentosByClienteId(clienteId);
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
          clienteId,
          processoId: processoId || undefined,
          tipo: documentType,
          nomeOriginal: file.originalname,
          nomeArquivo: fileName,
          storagePath: filePath,
          publicUrl: uploadResult.publicUrl,
          contentType: file.mimetype,
          tamanho: file.size,
          status: DocumentStatus.ANALYZING,
          dependenteId: (memberId && memberId !== clienteId) ? memberId : undefined
        })
      }

      console.log('Documento processado no banco:', documentoRecord.id)

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

      if (!documentoId) {
        return res.status(400).json({ message: 'documentoId é obrigatório' })
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
    console.log('============= DEBUG STATUS UPDATE =============');
    console.log('Documento ID:', req.params.documentoId);
    console.log('Body recebido:', req.body);

    try {
      const { documentoId } = req.params
      const { status, motivoRejeicao, analisadoPor } = req.body

      if (!documentoId) {
        return res.status(400).json({ message: 'documentoId é obrigatório' })
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

      console.log('Enviando para o repositorio...', {
        documentoId, status, solicitado_pelo_juridico
      });

      const documento = await ClienteRepository.updateDocumentoStatus(
        documentoId,
        status,
        motivoRejeicao,
        analisadoPor,
        apostilado,
        traduzido,
        solicitado_pelo_juridico
      )

      console.log('Documento atualizado no repositorio com sucesso.');

      // Criar notificação se o status exigir ação do cliente ou se foi solicitado pelo jurídico
      try {
        const canNotify = status === 'REJECTED' || status === 'WAITING_APOSTILLE' || status === 'WAITING_TRANSLATION' || solicitado_pelo_juridico;
        console.log('Pode notificar?', canNotify, { status, solicitado_pelo_juridico });

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
            await NotificationService.createNotification({
              clienteId: documento.cliente_id,
              criadorId: analisadoPor,
              titulo,
              mensagem,
              tipo,
              prazo: Number(prazo) || 15
            });
            console.log(`Notificacao "${titulo}" enviada com sucesso para o cliente ${documento.cliente_id} (Prazo: ${prazo || 15} dias)`);
          }
        }
      } catch (notifyError) {
        console.error('Erro ao enviar notificacao de status:', notifyError);
      }

      console.log('Finalizando resposta de sucesso.');
      return res.status(200).json({
        message: 'Status do documento atualizado com sucesso',
        data: documento
      })
    } catch (error: any) {
      console.error('ERRO NO updateDocumentoStatus:', error)
      return res.status(500).json({
        message: `Erro ao atualizar status do documento: ${error.message}`,
        error: error.message,
        debug_info: {
          documentoId: req.params.documentoId,
          status: req.body.status
        }
      })
    } finally {
      console.log('===============================================');
    }
  }

  // GET /cliente/:clienteId/processos
  async getProcessos(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
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
