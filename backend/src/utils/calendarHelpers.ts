import { supabase } from '../config/SupabaseClient';

/**
 * Busca o ID do usuário super_admin para operações centralizadas (Google Meet, etc.)
 */
export async function getSuperAdminId(): Promise<string | null> {
    const { data: admin } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'super_admin')
        .single();
    return admin?.id || null;
}

/**
 * Verifica se um givenUserId é o super_admin (para validação)
 */
export async function isSuperAdmin(givenUserId: string): Promise<boolean> {
    const superAdminId = await getSuperAdminId();
    return superAdminId === givenUserId;
}
