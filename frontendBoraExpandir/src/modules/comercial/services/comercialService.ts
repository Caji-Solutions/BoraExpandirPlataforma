import { Cliente } from '../../../types/comercial';
import { formatCpfDisplay, formatPhoneDisplay, normalizePhone } from '../../../utils/formatters';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function getAllClientes(): Promise<Cliente[]> {
    const response = await fetch(`${API_BASE_URL}/cliente/clientes`);
    if (!response.ok) {
        throw new Error('Erro ao buscar clientes');
    }
    const result = await response.json();
    // Garantir que os dados batem com a interface (fallback para campos obrigatÃ³rios)
    return (result.data || []).map((c: any) => ({
        ...c,
        telefone: formatPhoneDisplay(c.whatsapp || c.telefone || ''),
        whatsapp: normalizePhone(c.whatsapp || c.telefone || ''),
        documento: c.documento ? formatCpfDisplay(c.documento) : '',
        cpf: c.cpf ? formatCpfDisplay(c.cpf) : c.cpf,
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
        throw new Error('Erro ao buscar agendamentos do usuÃ¡rio');
    }
    const result = await response.json();
    return Array.isArray(result) ? result : (result.data || []);
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

export async function cancelarAgendamento(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/comercial/agendamento/${id}/cancelar`, {
        method: 'POST',
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao cancelar agendamento');
    }
    return response.json();
}

export async function getAgendamentosByCliente(clienteId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/comercial/agendamentos/cliente/${clienteId}`);
    if (!response.ok) {
        throw new Error('Erro ao buscar agendamentos do cliente');
    }
    const result = await response.json();
    return Array.isArray(result) ? result : (result.data || []);
}

export async function getAllProcessos(): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/juridico/processos`);
        if (!response.ok) return [];
        const result = await response.json();
        return Array.isArray(result) ? result : (result.data || []);
    } catch {
        return [];
    }
}

export async function getAllRequerimentos(): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/juridico/requerimentos`);
        if (!response.ok) return [];
        const result = await response.json();
        return Array.isArray(result) ? result : (result.data || []);
    } catch {
        return [];
    }
}

export async function getContratosServicos(clienteId?: string, isDraft?: boolean): Promise<any[]> {
    const params = new URLSearchParams()
    if (clienteId) params.set('clienteId', clienteId)
    if (isDraft !== undefined) params.set('isDraft', String(isDraft))
    const query = params.toString()
    const response = await fetch(`${API_BASE_URL}/comercial/contratos${query ? `?${query}` : ''}`)
    if (!response.ok) {
        throw new Error('Erro ao buscar contratos')
    }
    const result = await response.json()
    return result.data || []
}

export async function getContratoServicoById(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/comercial/contratos/${id}`)
    if (!response.ok) {
        throw new Error('Erro ao buscar contrato')
    }
    const result = await response.json()
    return result.data
}

export async function createContratoServico(payload: { cliente_id: string; servico_id: string; usuario_id?: string | null; subservico_id?: string; subservico_nome?: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/comercial/contratos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(result.message || 'Erro ao criar contrato')
    }
    return result.data
}

export async function uploadContratoAssinado(id: string, file: File, usuarioId?: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    if (usuarioId) formData.append('usuario_id', usuarioId)

    const response = await fetch(`${API_BASE_URL}/comercial/contratos/${id}/upload`, {
        method: 'POST',
        body: formData
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(result.message || 'Erro ao enviar contrato')
    }
    return result.data
}

export async function aprovarContratoServico(id: string, usuarioId?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/comercial/contratos/${id}/aprovar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioId || null })
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(result.message || 'Erro ao aprovar contrato')
    }
    return result.data
}

export async function recusarContratoServico(id: string, nota: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/comercial/contratos/${id}/recusar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota })
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(result.message || 'Erro ao recusar contrato')
    }
    return result.data
}

export async function uploadComprovanteContrato(id: string, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/comercial/contratos/${id}/comprovante`, {
        method: 'POST',
        body: formData
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(result.message || 'Erro ao enviar comprovante')
    }
    return result.data
}

// Stubs para funÃ§Ãµes faltantes no frontend (referenciadas em Comercial.tsx)
export async function getAllProcessos(): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/comercial/processos`);
        if (!response.ok) return [];
        const result = await response.json();
        return result.data || [];
    } catch {
        return [];
    }
}

export async function getAllRequerimentos(): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/comercial/requerimentos`);
        if (!response.ok) return [];
        const result = await response.json();
        return result.data || [];
    } catch {
        return [];
    }
}


// Novos mÃ©todos para o fluxo Draft / Assessoria
export async function updateContratoDraft(id: string, payload: { etapa_fluxo: number; draft_dados: any }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/comercial/contratos/${id}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(result.message || 'Erro ao atualizar rascunho do contrato')
    }
    return result.data
}

export async function gerarContratoPdf(id: string): Promise<{ url: string, data: any }> {
    const response = await fetch(`${API_BASE_URL}/comercial/contratos/${id}/gerar-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(result.message || 'Erro ao gerar PDF do contrato')
    }
    return result // retorna { url, data }
}

export async function enviarContratoAssinatura(id: string, email: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/comercial/contratos/${id}/enviar-assinatura`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(result.message || 'Erro ao enviar contrato para assinatura')
    }
    return result.data
}

export default {
    getAllClientes,
    getAgendamentosByUsuario,
    getAgendamentosByCliente,
    register,
    getClienteCredentials,
    cancelarAgendamento,
    getAllProcessos,
    getAllRequerimentos,
    getContratosServicos,
    getContratoServicoById,
    createContratoServico,
    uploadContratoAssinado,
    aprovarContratoServico,
    recusarContratoServico,
    uploadComprovanteContrato,
    getAllProcessos,
    getAllRequerimentos,
    updateContratoDraft,
    gerarContratoPdf,
    enviarContratoAssinatura
};


