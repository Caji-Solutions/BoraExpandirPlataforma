import { Cliente } from '../../../types/comercial';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function getAllClientes(): Promise<Cliente[]> {
    const response = await fetch(`${API_BASE_URL}/cliente/clientes`);
    if (!response.ok) {
        throw new Error('Erro ao buscar clientes');
    }
    const result = await response.json();
    // Garantir que os dados batem com a interface (fallback para campos obrigatórios)
    return (result.data || []).map((c: any) => ({
        ...c,
        telefone: c.telefone || c.whatsapp || '',
        documento: c.documento || '',
        created_at: c.created_at || new Date().toISOString(),
        updated_at: c.updated_at || new Date().toISOString(),
    }));
}

export async function getAgendamentosByUsuario(usuarioId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/comercial/agendamentos/usuario/${usuarioId}`);
    if (!response.ok) {
        throw new Error('Erro ao buscar agendamentos do usuário');
    }
    const result = await response.json();
    return result.data || [];
}

export default {
    getAllClientes,
    getAgendamentosByUsuario
};

