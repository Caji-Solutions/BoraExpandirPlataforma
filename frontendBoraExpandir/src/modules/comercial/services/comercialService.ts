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
        telefone: c.whatsapp || c.telefone || '',
        documento: c.documento || '',
        created_at: c.created_at || c.criado_em || new Date().toISOString(),
        updated_at: c.updated_at || c.atualizado_em || new Date().toISOString(),
    }));
}

export async function getClienteCredentials(email: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/cliente/credentials/${email}`);
    if (!response.ok) {
        throw new Error('Erro ao buscar credenciais');
    }
    return response.json();
}

export async function getAgendamentosByUsuario(usuarioId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/comercial/agendamentos/usuario/${usuarioId}`);
    if (!response.ok) {
        throw new Error('Erro ao buscar agendamentos do usuário');
    }
    const result = await response.json();
    return result.data || [];
}

export async function register(clienteData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/cliente/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteData),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao registrar cliente');
    }
    return response.json();
}

export default {
    getAllClientes,
    getAgendamentosByUsuario,
    register,
    getClienteCredentials
};

