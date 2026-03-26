import { Cliente } from '../../../types/comercial';
import { formatCpfDisplay, formatPhoneDisplay, normalizePhone } from '../../../utils/formatters';
import { apiClient } from '@/modules/shared/services/api';

function getAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}`, ...extra } : extra
}

export async function getAllClientes(): Promise<Cliente[]> {
    const result = await apiClient.get(`/cliente/clientes`);
    // Garantir que os dados batem com a interface (fallback para campos obrigatórios)
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
    return apiClient.get(`/cliente/credentials/${email}`);
}

export async function getAgendamentosByUsuario(usuarioId: string): Promise<any[]> {
    const result = await apiClient.get(`/comercial/agendamentos/usuario/${usuarioId}`);
    return Array.isArray(result) ? result : (result.data || []);
}

export async function register(clienteData: any): Promise<any> {
    return apiClient.post(`/cliente/register`, clienteData);
}

export async function cancelarAgendamento(id: string): Promise<any> {
    return apiClient.post(`/comercial/agendamento/${id}/cancelar`);
}

export async function getAgendamentosByCliente(clienteId: string): Promise<any[]> {
    const result = await apiClient.get(`/comercial/agendamentos/cliente/${clienteId}`);
    return Array.isArray(result) ? result : (result.data || []);
}

export async function getAllProcessos(): Promise<any[]> {
    try {
        const result = await apiClient.get(`/juridico/processos`);
        return Array.isArray(result) ? result : (result.data || []);
    } catch {
        return [];
    }
}

export async function getAllRequerimentos(): Promise<any[]> {
    try {
        const result = await apiClient.get(`/juridico/requerimentos`);
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
    const result = await apiClient.get(`/comercial/contratos${query ? `?${query}` : ''}`)
    return result.data || []
}

export async function getContratoServicoById(id: string): Promise<any> {
    const result = await apiClient.get(`/comercial/contratos/${id}`)
    return result.data
}

export async function createContratoServico(payload: { cliente_id: string; servico_id: string; usuario_id?: string | null; subservico_id?: string; subservico_nome?: string }): Promise<any> {
    const result = await apiClient.post(`/comercial/contratos`, payload)
    return result.data
}

export async function uploadContratoAssinado(id: string, file: File, usuarioId?: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    if (usuarioId) formData.append('usuario_id', usuarioId)

    const result = await apiClient.post(`/comercial/contratos/${id}/upload`, formData)
    return result.data
}

export async function aprovarContratoServico(id: string, usuarioId?: string): Promise<any> {
    const result = await apiClient.post(`/comercial/contratos/${id}/aprovar`, { usuario_id: usuarioId || null })
    return result.data
}

export async function recusarContratoServico(id: string, nota: string): Promise<any> {
    const result = await apiClient.post(`/comercial/contratos/${id}/recusar`, { nota })
    return result.data
}

export async function uploadComprovanteContrato(id: string, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const result = await apiClient.post(`/comercial/contratos/${id}/comprovante`, formData)
    return result.data
}

export async function updateContratoDraft(id: string, payload: { etapa_fluxo: number; draft_dados: any }): Promise<any> {
    const result = await apiClient.put(`/comercial/contratos/${id}/draft`, payload)
    return result.data
}

export async function gerarContratoPdf(id: string): Promise<{ url: string, data: any }> {
    return apiClient.post(`/comercial/contratos/${id}/gerar-pdf`)
}

export async function enviarContratoAssinatura(id: string, email: string): Promise<any> {
    const result = await apiClient.post(`/comercial/contratos/${id}/enviar-assinatura`, { email })
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
    updateContratoDraft,
    gerarContratoPdf,
    enviarContratoAssinatura
};


