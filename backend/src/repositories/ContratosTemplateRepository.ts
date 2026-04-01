import { supabase } from '../config/SupabaseClient';

export interface ContratoTemplate {
    id: string;
    nome: string;
    conteudo_html: string;
    created_at?: string;
    updated_at?: string;
}

export class ContratosTemplateRepository {
    async findAll(): Promise<ContratoTemplate[]> {
        const { data, error } = await supabase
            .from('contratos_templates')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('[ContratosTemplateRepository] Tabela contratos_templates pode não existir ainda:', error.message);
            return [];
        }
        return data as ContratoTemplate[];
    }

    async findById(id: string): Promise<ContratoTemplate | null> {
        const { data, error } = await supabase
            .from('contratos_templates')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data as ContratoTemplate;
    }

    async create(contrato: Omit<ContratoTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ContratoTemplate | null> {
        const { data, error } = await supabase
            .from('contratos_templates')
            .insert([contrato])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as ContratoTemplate;
    }

    async update(id: string, contrato: Partial<ContratoTemplate>): Promise<ContratoTemplate | null> {
        const updateData = { ...contrato, updated_at: new Date().toISOString() };
        
        const { data, error } = await supabase
            .from('contratos_templates')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as ContratoTemplate;
    }

    async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('contratos_templates')
            .delete()
            .eq('id', id);

        return !error;
    }
}

export default new ContratosTemplateRepository();
