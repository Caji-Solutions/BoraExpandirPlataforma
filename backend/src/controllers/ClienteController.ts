import { DocumentStatus } from '../constants/DocumentStatus';
import type { ClienteDTO } from '../types/parceiro';
import { supabase } from '../config/SupabaseClient';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import ClienteRepository from '../repositories/ClienteRepository';
import JuridicoRepository from '../repositories/JuridicoRepository';
import NotificationService from '../services/NotificationService';
import AdmRepository from '../repositories/AdmRepository';
import { getDocumentosPorTipoServico, DocumentoRequeridoConfig } from '../config/documentosConfig';
import ContratoServicoRepository from '../repositories/ContratoServicoRepository';
import { normalizeCpf, normalizePhone } from '../utils/normalizers';

// Interface para o documento requerido com informações do processo
interface DocumentoRequeridoComProcesso extends DocumentoRequeridoConfig {
  processoId: string;
  processoTipo: string;
  processoStatus: string;
  processoEtapa: number;
}

class ClienteController {
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
      console.error('[ClienteController] Erro ao criar notificacao de contrato:', error)
    }
  }

  private isClienteLead(contrato: any): boolean {
    return String(contrato?.cliente?.status || '').toUpperCase() === 'LEAD'
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
                type: r.nome, // Usando o nome como tipo para bater com o que o jurídico vê
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

  // GET /cliente/:clienteId/dependentes
  async getDependentes(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      console.log('Controller: Recebendo request getDependentes para:', clienteId)
      const dependentes = await ClienteRepository.getDependentesByClienteId(clienteId)

      return res.status(200).json({
        message: 'Dependentes recuperados com sucesso',
        data: dependentes
      })
    } catch (error: any) {
      console.error('Erro ao buscar dependentes:', error)
      return res.status(500).json({
        message: 'Erro ao buscar dependentes',
        error: error.message
      })
    }
  }

  // POST /cliente/:clienteId/dependentes
  async createDependent(req: any, res: any) {
    try {
      const { clienteId } = req.params
      const {
        nomeCompleto,
        parentesco,
        documento,
        dataNascimento,
        rg,
        passaporte,
        nacionalidade,
        email,
        telefone,
        isAncestralDireto
      } = req.body
      const documentoNormalizado = normalizeCpf(documento)
      const telefoneNormalizado = normalizePhone(telefone)

      if (!clienteId || !nomeCompleto || !parentesco) {
        return res.status(400).json({ message: 'clienteId, nomeCompleto e parentesco são obrigatórios' })
      }

      const dependente = await ClienteRepository.createDependent({
        clienteId,
        nomeCompleto,
        parentesco,
        documento: documentoNormalizado || undefined,
        dataNascimento,
        rg,
        passaporte,
        nacionalidade,
        email,
        telefone: telefoneNormalizado || undefined,
        isAncestralDireto
      })

      return res.status(201).json({
        message: 'Dependente criado com sucesso',
        data: dependente
      })
    } catch (error: any) {
      console.error('Erro ao criar dependente:', error)
      return res.status(500).json({
        message: 'Erro ao criar dependente',
        error: error.message
      })
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

  // GET /cliente/:clienteId/dna
  async getDNA(req: any, res: any) {
    try {
      const { clienteId } = req.params;
      if (!clienteId) return res.status(400).json({ message: 'clienteId é obrigatório' });

      const supabase = (await import('../config/SupabaseClient')).supabase;
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('perfil_unificado, id, status')
        .eq('id', clienteId)
        .maybeSingle();

      if (error) {
        console.error('[ClienteController] Erro ao buscar DNA:', error);
        return res.status(500).json({ message: 'Erro ao buscar DNA', error: error.message });
      }

      let responseData = {};
      if (cliente && cliente.perfil_unificado) {
        responseData = cliente.perfil_unificado.data || {};
      }
      
      // Sincroniza em read-time com a tabela root clientes
      if (cliente) {
        responseData = {
            ...responseData,
            status: cliente.status,
            cliente_id: cliente.id
        }
      }

      return res.status(200).json({ data: responseData });
    } catch (err: any) {
      console.error('[ClienteController] Erro inesperado getDNA:', err);
      return res.status(500).json({ message: 'Erro interno ao buscar DNA', error: err.message });
    }
  }

  // GET /cliente/:clienteId
  async getCliente(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      // 1. Tentar buscar direto pelo ID (caso coincida)
      let cliente = await ClienteRepository.getClienteById(clienteId)

      // 2. Se não encontrar, pode ser que o clienteId seja o ID do Profile (Auth UID)
      // mas na tabela clientes o ID seja diferente. Vamos tentar buscar pelo profile associado.
      if (!cliente) {
        const { data: profile } = await (await import('../config/SupabaseClient')).supabase
          .from('profiles')
          .select('email')
          .eq('id', clienteId)
          .maybeSingle();

        if (profile && profile.email) {
          const { data: clientePorEmail } = await (await import('../config/SupabaseClient')).supabase
            .from('clientes')
            .select('*')
            .eq('email', profile.email)
            .maybeSingle();

          if (clientePorEmail) {
            cliente = clientePorEmail;
          }
        }
      }

      if (!cliente) {
        return res.status(404).json({
          message: 'Cliente não encontrado',
          data: null
        })
      }

      return res.status(200).json({
        message: 'Cliente recuperado com sucesso',
        data: cliente
      })
    } catch (error: any) {
      console.error('Erro ao buscar cliente:', error)
      return res.status(500).json({
        message: 'Erro ao buscar cliente',
        error: error.message
      })
    }
  }

  // GET /cliente/by-user/:userId
  // Busca um cliente pelo Auth UID via profiles -> email -> clientes
  async getClienteByUserId(req: any, res: any) {
    try {
      const { userId } = req.params

      if (!userId) {
        return res.status(400).json({ message: 'userId é obrigatório' })
      }

      const supabase = (await import('../config/SupabaseClient')).supabase

      // 1. Buscar o email do profile pelo Auth UID
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .maybeSingle()

      if (!profile?.email) {
        return res.status(404).json({
          message: 'Profile não encontrado para este userId',
          data: null
        })
      }

      // 2. Buscar o cliente pelo email
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('*')
        .ilike('email', profile.email)
        .maybeSingle()

      if (error) {
        console.error('[ClienteController] Erro ao buscar cliente por email:', error)
        return res.status(500).json({ message: 'Erro ao buscar cliente', error: error.message })
      }

      if (!cliente) {
        return res.status(404).json({
          message: 'Cliente não encontrado para este email',
          data: null
        })
      }

      return res.status(200).json({
        message: 'Cliente recuperado com sucesso',
        data: cliente
      })
    } catch (error: any) {
      console.error('Erro ao buscar cliente por user_id:', error)
      return res.status(500).json({
        message: 'Erro ao buscar cliente',
        error: error.message
      })
    }
  }

  async register(req: any, res: any) {
    try {
      const { nome, email, whatsapp, parceiro_id, documento, endereco } = req.body
      const whatsappNormalizado = normalizePhone(whatsapp)
      const cpfNormalizado = normalizeCpf(documento || req.body.cpf)

      if (!nome || !whatsappNormalizado || !email) {
        return res.status(400).json({ message: 'Nome, E-mail e WhatsApp são obrigatórios para registro completo' })
      }

      const supabase = (await import('../config/SupabaseClient')).supabase;
      const normalizedEmail = email.trim().toLowerCase();
      
      console.log('[ClienteController.register] Iniciando registro completo:', { nome, normalizedEmail });

      // 1. Verificar se o cliente já existe na tabela 'clientes'
      const { data: existingCliente } = await supabase
        .from('clientes')
        .select('id, email')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      let usuarioId = existingCliente?.id;
      let tempPassword = Math.random().toString(36).substring(2, 10);
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(tempPassword, salt);
      
      // 2. Lógica de Profile (Auth)
      const { data: profileData } = await supabase.from('profiles').select('id').ilike('email', normalizedEmail).maybeSingle();
      
      if (profileData && profileData.id) {
          usuarioId = profileData.id;
          console.log('[ClienteController.register] Atualizando senha de profile existente:', usuarioId);
          await supabase.from('profiles').update({ 
            password_hash, 
            cpf: cpfNormalizado || undefined, 
            telefone: whatsappNormalizado || undefined 
          }).eq('id', usuarioId);
      } else {
          if (!usuarioId) usuarioId = crypto.randomUUID();
          
          console.log('[ClienteController.register] Criando novo profile (Auth):', usuarioId);
          const { error: insertError } = await supabase.from('profiles').insert({
              id: usuarioId,
              full_name: nome,
              email: normalizedEmail,
              role: 'cliente',
              password_hash,
              cpf: cpfNormalizado || null,
              telefone: whatsappNormalizado || null
          });

          if (insertError) {
              console.error('Erro ao criar profile:', insertError.message);
              return res.status(400).json({ message: 'Erro ao criar perfil de acesso' });
          }
      }

      // 3. Upsert na tabela clientes (Apenas colunas válidas)
      const clienteData: any = {
        id: usuarioId,
        nome,
        email: normalizedEmail,
        whatsapp: whatsappNormalizado,
        parceiro_id: parceiro_id || null,
        status: req.body.status || 'cliente'
      }

      const createdData = await ClienteRepository.register(clienteData);

      return res.status(201).json({
        ...createdData,
        message: 'Cliente registrado com sucesso e acesso liberado',
        loginInfo: {
          email: normalizedEmail,
          password: tempPassword
        }
      })
    } catch (error: any) {
      console.error('Erro no registro completo:', error)
      return res.status(500).json({ message: 'Erro interno ao registrar cliente', error: error.message })
    }
  }

  async registerLead(req: any, res: any) {
    try {
      const { nome, email, whatsapp, parceiro_id, criado_por, criado_por_nome } = req.body
      const whatsappNormalizado = normalizePhone(whatsapp)

      if (!nome || !whatsappNormalizado) {
        return res.status(400).json({ message: 'Nome e WhatsApp são obrigatórios' })
      }

      console.log('[ClienteController.registerLead] Criando Lead (Apenas Clientes):', { nome, email });

      const leadData = {
        id: crypto.randomUUID(),
        nome,
        email: email ? String(email).trim().toLowerCase() : null,
        whatsapp: whatsappNormalizado,
        parceiro_id: parceiro_id || null,
        status: 'LEAD',
        criado_por: criado_por || null,
        criado_por_nome: criado_por_nome || null,
      }

      const createdData = await ClienteRepository.register(leadData as any)

      return res.status(201).json({
        ...createdData,
        message: 'Lead registrado com sucesso'
      })
    } catch (error: any) {
      console.error('Erro ao registrar lead:', error)
      return res.status(500).json({
        message: 'Erro ao registrar lead',
        error: error.message
      })
    }
  }
  async AttStatusClientebyWpp(req: any, res: any) {
    try {
      const { wppNumber, status } = req.body
      const wppNormalizado = normalizePhone(wppNumber)
      if (!wppNormalizado) {
        return res.status(400).json({ message: 'wppNumber é obrigatório' })
      }

      const cliente = await ClienteRepository.getClienteByWppNumber(wppNormalizado)


      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' })
      }

      const updatedData = await ClienteRepository.attStatusById(cliente.id, status)


      return res.status(200).json(updatedData)
    } catch (error) {
      throw error
    }
  }

  async uploadDoc(req: any, res: any) {
    try {
      const { clienteId, documentType, processoId, documentoId } = req.body
      const file = req.file

      // Logs de debug
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
        // Lógica de upgrade: Se já existe um documento, vamos determinar o novo status
        // Se o status era WAITING_APOSTILLE, muda para ANALYZING_APOSTILLE
        // Se era WAITING_TRANSLATION, muda para ANALYZING_TRANSLATION
        // Caso contrário, assume ANALYZING

        // Para simplificar, poderíamos buscar o documento antes, mas vamos usar uma lógica baseada em flags ou status esperado
        // Por enquanto, vamos inferir do status atual no banco ou via parâmetro extra.
        // Como o Repository.updateDocumentoStatus já lida com status, vamos apenas atualizar o arquivo aqui.

        // Buscar status atual para decidir o próximo
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

      // Lógica de side-effects (atualizar flags booleanas baseado na etapa)
      let apostilado: boolean | undefined = undefined;
      let traduzido: boolean | undefined = undefined;

      // Se passou da análise inicial e foi para apostilamento, nada muda (já é false por padrão)

      // Se passou da análise do apostilamento e foi para tradução
      if (['WAITING_TRANSLATION', 'ANALYZING_TRANSLATION'].includes(status)) {
        apostilado = true;
      }
      // Se foi aprovado totalmente
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

  // GET /cliente/processo/:processoId/formularios
  // Retorna todos os formulários/declarações para um processo
  async getFormularios(req: any, res: any) {
    try {
      const { processoId } = req.params
      const { memberId } = req.params // Optional

      if (!processoId) {
        return res.status(400).json({ message: 'processoId é obrigatório' })
      }

      const formularios = await ClienteRepository.getFormulariosByProcessoId(processoId, memberId)

      return res.status(200).json({
        message: 'Formulários recuperados com sucesso',
        data: formularios
      })
    } catch (error: any) {
      console.error('Erro ao buscar formularios:', error)
      return res.status(500).json({
        message: 'Erro ao buscar formulários',
        error: error.message
      })
    }
  }

  // POST /cliente/processo/:processoId/formularios
  // Upload de formulário pelo jurídico
  async uploadFormulario(req: any, res: any) {
    try {
      const { processoId } = req.params
      const { clienteId, memberId } = req.body
      const file = req.file

      console.log('========== UPLOAD FORMULARIO DEBUG ==========')
      console.log('processoId:', processoId)
      console.log('clienteId:', clienteId)
      console.log('memberId:', memberId)
      console.log('file:', file ? { originalname: file.originalname, size: file.size } : 'undefined')
      console.log('=============================================')

      if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' })
      }

      if (!processoId || !clienteId || !memberId) {
        return res.status(400).json({ message: 'processoId, clienteId e memberId são obrigatórios' })
      }

      // Gerar nome único
      const timestamp = Date.now()
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `formulario_${timestamp}.${fileExtension}`

      // Construir caminho: processoId/formularios/memberId/filename
      const filePath = `${processoId}/formularios/${memberId}/${fileName}`

      // Upload para o Supabase
      const uploadResult = await ClienteRepository.uploadDocument({
        filePath,
        fileBuffer: file.buffer,
        contentType: file.mimetype,
        bucket: 'formularios-juridico'
      })

      // Criar registro na tabela de formulários
      const formularioRecord = await ClienteRepository.createFormulario({
        processoId,
        clienteId,
        memberId,
        nomeOriginal: file.originalname,
        nomeArquivo: fileName,
        storagePath: filePath,
        publicUrl: uploadResult.publicUrl,
        contentType: file.mimetype,
        tamanho: file.size
      })

      return res.status(200).json({
        message: 'Formulário enviado com sucesso',
        data: {
          id: formularioRecord.id,
          name: file.originalname.replace(/\.[^/.]+$/, ''),
          fileName: file.originalname,
          fileSize: file.size,
          uploadDate: new Date(),
          memberId,
          downloadUrl: uploadResult.publicUrl
        }
      })
    } catch (error: any) {
      console.error('Erro ao upload de formulario:', error)
      return res.status(500).json({
        message: 'Erro ao enviar formulário',
        error: error.message
      })
    }
  }

  // DELETE /cliente/processo/:processoId/formularios/:formularioId
  async deleteFormulario(req: any, res: any) {
    try {
      const { formularioId } = req.params

      if (!formularioId) {
        return res.status(400).json({ message: 'formularioId é obrigatório' })
      }

      await ClienteRepository.deleteFormulario(formularioId)

      return res.status(200).json({
        message: 'Formulário deletado com sucesso'
      })
    } catch (error: any) {
      console.error('Erro ao deletar formulario:', error)
      return res.status(500).json({
        message: 'Erro ao deletar formulário',
        error: error.message
      })
    }
  }

  // POST /cliente/formularios/:formularioId/response
  async uploadFormularioResponse(req: any, res: any) {
    try {
      const { formularioId } = req.params
      const file = req.file

      console.log('====== UPLOAD FORMULARIO RESPONSE ======')
      console.log('formularioId:', formularioId)
      console.log('file:', file ? { originalname: file.originalname, size: file.size } : 'undefined')
      console.log('========================================')

      if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' })
      }

      if (!formularioId) {
        return res.status(400).json({ message: 'formularioId é obrigatório' })
      }

      // Get the original juridico form to extract cliente_id and membro_id
      const { data: originalForm, error: fetchError } = await (await import('../config/SupabaseClient')).supabase
        .from('formularios_juridico')
        .select('cliente_id, membro_id')
        .eq('id', formularioId)
        .single()

      if (fetchError || !originalForm) {
        console.error('Erro ao buscar formulario original:', fetchError)
        return res.status(404).json({ message: 'Formulário original não encontrado' })
      }

      const { cliente_id: clienteId, membro_id: membroId } = originalForm

      // Generate unique filename
      const timestamp = Date.now()
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `signed_${timestamp}.${fileExtension}`

      // Build storage path: clienteId/cliente/memberId_or_titular/filename
      const targetMember = membroId || 'titular'
      const filePath = `${clienteId}/cliente/${targetMember}/${fileName}`

      console.log('========== CLIENT RESPONSE PATH ==========')
      console.log('Bucket: formularios-juridico')
      console.log('Target Member (Folder):', targetMember)
      console.log('Generated FileName:', fileName)
      console.log('FULL PATH (filePath):', filePath)
      console.log('=========================================')

      // Upload to formularios-juridico bucket (cliente folder)
      const uploadResult = await ClienteRepository.uploadFormularioClienteResponse({
        filePath,
        fileBuffer: file.buffer,
        contentType: file.mimetype
      })

      // Create database record
      const formularioRecord = await ClienteRepository.createFormularioClienteResponse({
        formularioJuridicoId: formularioId,
        clienteId,
        membroId,
        nomeOriginal: file.originalname,
        nomeArquivo: fileName,
        storagePath: uploadResult.path,
        publicUrl: uploadResult.publicUrl,
        contentType: file.mimetype,
        tamanho: file.size
      })

      console.log('Resposta de formulario criada com sucesso:', formularioRecord.id)

      return res.status(201).json({
        message: 'Resposta de formulário enviada com sucesso',
        data: {
          id: formularioRecord.id,
          formulario_juridico_id: formularioId,
          publicUrl: uploadResult.publicUrl
        }
      })
    } catch (error: any) {
      console.error('Erro ao enviar resposta de formulario:', error)
      return res.status(500).json({
        message: 'Erro ao enviar resposta de formulário',
        error: error.message
      })
    }
  }

  // GET /cliente/:clienteId/formulario-responses
  async getFormularioResponses(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      const responses = await ClienteRepository.getFormularioClienteResponsesByCliente(clienteId)

      return res.status(200).json({
        message: 'Respostas de formulários recuperadas com sucesso',
        data: responses
      })
    } catch (error: any) {
      console.error('Erro ao buscar respostas de formularios:', error)
      return res.status(500).json({
        message: 'Erro ao buscar respostas de formulários',
        error: error.message
      })
    }
  }

  // POST /cliente/profile-photo
  async uploadProfilePhoto(req: any, res: any) {
    try {
      const { clienteId } = req.body
      const file = req.file

      if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' })
      }

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      const result = await ClienteRepository.upsertProfilePhoto({
        clienteId,
        fileBuffer: file.buffer,
        contentType: file.mimetype,
        fileName: file.originalname
      })

      return res.status(200).json({
        message: 'Foto de perfil atualizada com sucesso',
        data: result
      })
    } catch (error: any) {
      console.error('Erro ao atualizar foto de perfil:', error)
      return res.status(500).json({
        message: 'Erro ao atualizar foto de perfil',
        error: error.message
      })
    }
  }

  // GET /cliente/clientes
  async getAllClientes(req: any, res: any) {
    try {
      const clientes = await ClienteRepository.getAllClientes()

      return res.status(200).json({
        message: 'Clientes recuperados com sucesso',
        data: clientes,
        total: clientes.length
      })
    } catch (error: any) {
      console.error('Erro ao buscar todos os clientes:', error)
      return res.status(500).json({
        message: 'Erro ao buscar todos os clientes',
        error: error.message
      })
    }
  }

  // GET /cliente/:clienteId/notificacoes
  async getNotificacoes(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      const notificacoes = await ClienteRepository.getNotificacoes(clienteId)

      return res.status(200).json({
        message: 'Notificações recuperadas com sucesso',
        data: notificacoes
      })
    } catch (error: any) {
      console.error('Erro ao buscar notificacoes:', error)
      return res.status(500).json({
        message: 'Erro ao buscar notificações',
        error: error.message
      })
    }
  }

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

  // PATCH /cliente/notificacoes/:notificacaoId/status
  async updateNotificacaoStatus(req: any, res: any) {
    try {
      const { notificacaoId } = req.params
      const { lida } = req.body

      if (!notificacaoId) {
        return res.status(400).json({ message: 'notificacaoId é obrigatório' })
      }

      const notification = await ClienteRepository.updateNotificacaoStatus(notificacaoId, lida)

      return res.status(200).json({
        message: 'Status da notificação atualizado com sucesso',
        data: notification
      })
    } catch (error: any) {
      console.error('Erro ao atualizar status da notificacao:', error)
      return res.status(500).json({
        message: 'Erro ao atualizar status da notificação',
        error: error.message
      })
    }
  }

  // POST /cliente/:clienteId/notificacoes/read-all
  async markAllNotificacoesAsRead(req: any, res: any) {
    try {
      const { clienteId } = req.params

      if (!clienteId) {
        return res.status(400).json({ message: 'clienteId é obrigatório' })
      }

      await ClienteRepository.markAllNotificacoesAsRead(clienteId)

      return res.status(200).json({
        message: 'Todas as notificações marcadas como lidas'
      })
    } catch (error: any) {
      console.error('Erro ao marcar todas notificacoes como lidas:', error)
      return res.status(500).json({
        message: 'Erro ao marcar todas notificações como lidas',
        error: error.message
      })
    }
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
        const supabase = (await import('../config/SupabaseClient')).supabase
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
        console.error('[ClienteController] Erro no upload do contrato:', uploadError)
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

  // POST /cliente/contratos/:id/comprovante
  async uploadComprovanteContrato(req: any, res: any) {
    try {
      const { id } = req.params
      const file = req.file
      const clienteId = req.body.cliente_id || req.body.clienteId

      if (!file) {
        return res.status(400).json({ message: 'Arquivo do comprovante é obrigatório' })
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
        return res.status(403).json({ message: 'Leads nao podem enviar comprovante pelo portal. Aguarde a conversao para cliente.' })
      }

      if (contrato.assinatura_status !== 'aprovado') {
        return res.status(400).json({ message: 'Contrato ainda não aprovado' })
      }

      if (!['pendente', 'recusado'].includes(contrato.pagamento_status)) {
        return res.status(409).json({ message: 'Ja existe um comprovante em analise para este contrato.' })
      }

      const lockTimestamp = new Date().toISOString()
      const { data: lockedContrato, error: lockError } = await supabase
        .from('contratos_servicos')
        .update({
          pagamento_status: 'em_analise',
          pagamento_nota_recusa: null,
          pagamento_comprovante_upload_em: lockTimestamp,
          atualizado_em: lockTimestamp
        })
        .eq('id', id)
        .in('pagamento_status', ['pendente', 'recusado'])
        .select()
        .maybeSingle()

      if (lockError) {
        console.error('[ClienteController] Erro ao reservar upload de comprovante:', lockError)
        return res.status(500).json({ message: 'Erro ao iniciar envio do comprovante' })
      }

      if (!lockedContrato) {
        return res.status(409).json({ message: 'Comprovante ja enviado por outro usuario. Atualize a tela para ver o status.' })
      }

      const timestamp = Date.now()
      const ext = file.originalname.split('.').pop() || 'pdf'
      const filePath = `contratos-comprovantes/${id}/${timestamp}_comprovante.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        })

      if (uploadError) {
        console.error('[ClienteController] Erro no upload do comprovante:', uploadError)
        await ContratoServicoRepository.updateContrato(id, {
          pagamento_status: contrato.pagamento_status,
          pagamento_nota_recusa: contrato.pagamento_nota_recusa || null,
          atualizado_em: new Date().toISOString()
        })
        return res.status(500).json({ message: 'Erro ao fazer upload do comprovante' })
      }

      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath)

      const updated = await ContratoServicoRepository.updateContrato(id, {
        pagamento_status: 'em_analise',
        pagamento_comprovante_url: urlData.publicUrl,
        pagamento_comprovante_path: filePath,
        pagamento_comprovante_nome_original: file.originalname,
        pagamento_comprovante_upload_em: new Date().toISOString(),
        pagamento_nota_recusa: null,
        atualizado_em: new Date().toISOString()
      })

      await this.notificarClienteContrato({
        clienteId: updated.cliente_id,
        titulo: 'Comprovante enviado',
        mensagem: 'Seu comprovante foi recebido e esta em analise do financeiro.',
        tipo: 'info'
      })

      return res.status(200).json({
        message: 'Comprovante enviado com sucesso',
        data: updated
      })
    } catch (error: any) {
      console.error('Erro ao enviar comprovante do contrato:', error)
      return res.status(500).json({
        message: 'Erro ao enviar comprovante',
        error: error.message
      })
    }
  }

  // registerLead removido para unificação no método register

  async getClienteCredentials(req: any, res: any) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({ message: 'E-mail é obrigatório' });
      }

      const { supabase } = await import('../config/SupabaseClient');

      // 1. Buscar o ID na tabela profiles pelo email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Já não temos o temp_password em plaintext no auth, vamos usar uma senha temporária em fallback ou focar no reset password
      // Mas para manter a funcionalidade antiga, retornar um aviso ou a senha que a pessoa consiga
      return res.status(200).json({
        email: profile.email,
        password: 'Senha protegida por criptografia.'
      });

    } catch (error: any) {
      console.error('Erro ao buscar credenciais:', error);
      return res.status(500).json({ message: 'Erro ao buscar credenciais', error: error.message });
    }
  }

  // =============================================
  // NOTAS DE LEAD
  // =============================================

  async createLeadNote(req: any, res: any) {
    try {
      const { leadId, texto, autorId, autorNome, autorSetor } = req.body

      if (!leadId || !texto) {
        return res.status(400).json({ message: 'leadId e texto são obrigatórios' })
      }

      const nota = await JuridicoRepository.createNote({
        clienteId: leadId,
        etapa: 'lead_note',
        autorId: autorId || 'system',
        autorNome,
        autorSetor,
        texto
      })

      return res.status(201).json({
        message: 'Nota do lead criada com sucesso',
        data: nota
      })
    } catch (error: any) {
      console.error('Erro ao criar nota do lead:', error)
      return res.status(500).json({ message: 'Erro ao criar nota do lead', error: error.message })
    }
  }

  async getLeadNotes(req: any, res: any) {
    try {
      const { leadId } = req.params

      if (!leadId) {
        return res.status(400).json({ message: 'leadId é obrigatório' })
      }

      const allNotes = await JuridicoRepository.getNotesByClienteId(leadId)
      const leadNotes = allNotes.filter((n: any) => n.etapa === 'lead_note')

      return res.status(200).json({
        message: 'Notas do lead recuperadas com sucesso',
        data: leadNotes
      })
    } catch (error: any) {
      console.error('Erro ao buscar notas do lead:', error)
      return res.status(500).json({ message: 'Erro ao buscar notas do lead', error: error.message })
    }
  }

  async deleteLeadNote(req: any, res: any) {
    try {
      const { noteId } = req.params
      const userId = req.query.userId || req.body?.userId

      if (!noteId) {
        return res.status(400).json({ message: 'noteId é obrigatório' })
      }

      if (!userId) {
        return res.status(400).json({ message: 'userId é obrigatório para deletar a nota' })
      }

      const nota = await JuridicoRepository.getNoteById(noteId)
      if (!nota) {
        return res.status(404).json({ message: 'Nota não encontrada' })
      }

      if (nota.autor_id !== userId && userId !== 'admin') {
        return res.status(403).json({ message: 'Sem permissão para deletar esta nota' })
      }

      await JuridicoRepository.deleteNote(noteId)

      return res.status(200).json({ message: 'Nota do lead deletada com sucesso' })
    } catch (error: any) {
      console.error('Erro ao deletar nota do lead:', error)
      return res.status(500).json({ message: 'Erro ao deletar nota do lead', error: error.message })
    }
  }
}

export default new ClienteController()

