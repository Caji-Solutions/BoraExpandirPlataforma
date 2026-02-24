import { randomUUID } from 'crypto'
import type { RegisterParceiroDTO, Parceiro } from '../types/parceiro'
import { supabase } from '../config/SupabaseClient'

// Implementação temporária em memória até existir o modelo Prisma `Parceiro`.
const store: Map<string, Parceiro> = new Map()

class ParceiroRepository {
    static async register(payload: RegisterParceiroDTO): Promise<Parceiro> {
        const { data, error } = await supabase
            .from('parceiros')
            .insert({
                nome: payload.nome,
                email: payload.email,
                telefone: payload.telefone ?? null,
                documento: payload.documento ?? null,
                
            })
            .select()
            .single()

        if (error) throw error

        const parceiro: Parceiro = {
            id: data.id,
            nome: data.nome,
            email: data.email,
            telefone: data.telefone ?? undefined,
            documento: data.documento ?? undefined,
            criadoEm: new Date(data.criado_em),
            atualizadoEm: new Date(data.atualizado_em),
        }
        
        store.set(parceiro.id, parceiro)
        return parceiro
    }

    static async findById(id: string): Promise<Parceiro | null> {
        // 1. Tenta buscar na tabela de parceiros (para parceiros independentes via UUID)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        if (isUuid) {
            const { data: parceiro, error: pError } = await supabase
                .from('parceiros')
                .select('*')
                .eq('id', id)
                .single()

            if (!pError && parceiro) {
                return {
                    id: parceiro.id,
                    nome: parceiro.nome,
                    email: parceiro.email,
                    telefone: parceiro.telefone ?? undefined,
                    documento: parceiro.documento ?? undefined,
                    criadoEm: new Date(parceiro.criado_em),
                    atualizadoEm: new Date(parceiro.atualizado_em),
                }
            }
        }

        // 2. Busca na tabela de clientes pela coluna client_id (que já contém o prefixo, ex: 'be7136')
        // Usamos ilike para ser insensível a maiúsculas/minúsculas por segurança
        const { data: cliente, error: cliError } = await supabase
            .from('clientes')
            .select('*')
            .ilike('client_id', id)
            .single()

        if (!cliError && cliente) {
            return {
                id: cliente.id, // O ID real continua sendo o UUID do cliente
                nome: cliente.nome,
                email: cliente.email,
                telefone: cliente.whatsapp ?? undefined,
                documento: undefined,
                criadoEm: new Date(cliente.criado_em),
                atualizadoEm: new Date(cliente.atualizado_em),
            }
        }

        return null
    }

    static async update(id: string, data: Partial<RegisterParceiroDTO>): Promise<Parceiro | null> {
        const current = store.get(id)
        if (!current) return null
        const updated: Parceiro = {
            ...current,
            nome: data.nome !== undefined ? String(data.nome) : current.nome,
            email: data.email !== undefined ? String(data.email) : current.email,
            telefone: data.telefone !== undefined ? (data.telefone ? String(data.telefone) : undefined) : current.telefone,
            documento: data.documento !== undefined ? (data.documento ? String(data.documento) : undefined) : current.documento,
            atualizadoEm: new Date(),
        }
        store.set(id, updated)
        return updated
    }

    static async list(params?: Record<string, unknown>): Promise<Parceiro[]> {
        const { data, error } = await supabase
            .from('parceiros')
            .select('*')
            .order('criado_em', { ascending: false })

        if (error || !data) return []

        return data.map(row => ({
            id: row.id,
            nome: row.nome,
            email: row.email,
            telefone: row.telefone ?? undefined,
            documento: row.documento ?? undefined,
            criadoEm: new Date(row.criado_em),
            atualizadoEm: new Date(row.atualizado_em),
        }))
    }

    static async remove(id: string): Promise<boolean> {
        return store.delete(id)
    }
}   






export default ParceiroRepository;