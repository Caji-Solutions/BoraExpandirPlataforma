import type { ClienteDTO } from '../types/parceiro';
import { supabase } from '../config/SupabaseClient';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import ClienteRepository from '../repositories/ClienteRepository';
import NotificationService from '../services/NotificationService';
import { normalizeCpf, normalizePhone } from '../utils/normalizers';

class ClienteProfileController {
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
      console.error('[ClienteProfileController] Erro ao criar notificacao de contrato:', error)
    }
  }

  private isClienteLead(contrato: any): boolean {
    return String(contrato?.cliente?.status || '').toUpperCase() === 'LEAD'
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
        console.error('[ClienteProfileController] Erro ao buscar cliente por email:', error)
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

      console.log('[ClienteProfileController.register] Iniciando registro completo:', { nome, normalizedEmail });

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
          console.log('[ClienteProfileController.register] Atualizando senha de profile existente:', usuarioId);
          await supabase.from('profiles').update({
            password_hash,
            cpf: cpfNormalizado || undefined,
            telefone: whatsappNormalizado || undefined
          }).eq('id', usuarioId);
      } else {
          if (!usuarioId) usuarioId = crypto.randomUUID();

          console.log('[ClienteProfileController.register] Criando novo profile (Auth):', usuarioId);
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

      console.log('[ClienteProfileController.registerLead] Criando Lead (Apenas Clientes):', { nome, email });

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
        console.error('[ClienteProfileController] Erro ao buscar DNA:', error);
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
      console.error('[ClienteProfileController] Erro inesperado getDNA:', err);
      return res.status(500).json({ message: 'Erro interno ao buscar DNA', error: err.message });
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
}

export default new ClienteProfileController()
