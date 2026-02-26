import { supabase } from '../config/SupabaseClient'
import type { RegisterParceiroDTO, Parceiro } from '../types/parceiro'

// Implementação temporária em memória até existir o modelo Prisma `Parceiro`.
const store: Map<string, Parceiro> = new Map()

class ParceiroRepository {
    private static generateClientId(): string {
        const chars = '0123456789abcdef';
        let result = 'be';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    static async register(payload: RegisterParceiroDTO): Promise<any> {
        const { nome, email, telefone, documento, senha } = payload;
        const clientId = this.generateClientId();

        // 1. Criar Auth User no Supabase
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: senha as string,
            email_confirm: true,
            user_metadata: { 
                full_name: nome, 
                role: 'cliente' 
            }
        });

        if (authError) throw authError;

        const userId = authData.user.id;

        // 2. Criar Profile
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            full_name: nome,
            email: email,
            role: 'cliente',
            telefone: telefone || null,
            cpf: documento || null
        });

        if (profileError) throw profileError;

        // 3. Criar registro na tabela clientes (Todo cliente é parceiro)
        const { data: cliente, error: cliError } = await supabase
            .from('clientes')
            .insert({
                id: userId,
                nome,
                email,
                whatsapp: telefone || '',
                status: 'parceiro',
                client_id: clientId
            })
            .select()
            .single();

        if (cliError) throw cliError;

        return cliente;
    }

    static async findById(id: string): Promise<any | null> {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        let query = supabase.from('clientes').select('*');

        if (isUuid) {
            query = query.eq('id', id);
        } else {
            query = query.ilike('client_id', id);
        }

        const { data: cliente, error } = await query.single();

        if (error || !cliente) return null;

        return {
            id: cliente.id,
            nome: cliente.nome,
            email: cliente.email,
            telefone: cliente.whatsapp ?? undefined,
            clientId: cliente.client_id,
            criadoEm: new Date(cliente.criado_em),
            atualizadoEm: new Date(cliente.atualizado_em),
        };
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

    static async getMetrics(parceiroId: string) {
        // Buscar clientes indicados por este parceiro
        const { data: clients, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('parceiro_id', parceiroId)

        if (error) throw error

        const now = new Date()
        const last30DaysDate = new Date()
        last30DaysDate.setDate(now.getDate() - 30)

        const referrals = clients?.length || 0
        const conversions = clients?.filter(c => ['confirmado', 'concluido'].includes(c.status)).length || 0
        
        // No momento a receita não está em uma coluna direta, 
        // poderíamos somar de uma tabela de faturas se existisse.
        // Como o foco é retirar os mocks, vamos retornar os dados reais de indicação disponíveis.
        const totalRevenue = 0 

        const last30DaysClients = clients?.filter(c => new Date(c.criado_em) >= last30DaysDate) || []
        const last30DaysReferrals = last30DaysClients.length
        const last30DaysConversions = last30DaysClients.filter(c => ['confirmado', 'concluido'].includes(c.status)).length

        return {
            referrals,
            conversions,
            revenue: totalRevenue,
            last30Days: {
                referrals: last30DaysReferrals,
                conversions: last30DaysConversions,
                revenue: 0
            },
            referralList: clients?.map(c => ({
                id: c.id,
                name: c.nome,
                email: c.email,
                service: 'Jurídico', // Default service
                status: c.status,
                referredDate: c.criado_em
            })) || []
        }
    }

    static async remove(id: string): Promise<boolean> {
        return store.delete(id)
    }
}






export default ParceiroRepository;