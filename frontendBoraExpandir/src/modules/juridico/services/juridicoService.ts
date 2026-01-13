// Serviço para chamadas à API do Jurídico

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface AtribuirResponsavelPayload {
  processoId: string;
  responsavelId: string;
}

export interface AtribuirResponsavelResponse {
  message: string;
  data: {
    id: string;
    responsavel_id: string | null;
  };
}

export interface FuncionarioJuridico {
  id: string;
  full_name: string;
  email: string;
  telefone?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  whatsapp?: string;
}

export interface Processo {
  id: string;
  cliente_id: string;
  tipo_servico: string;
  status: string;
  etapa_atual: number;
  documentos: any[];
  responsavel_id: string | null;
  delegado_em: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  clientes?: Cliente;
  responsavel?: FuncionarioJuridico | null;
}

export interface ClienteComResponsavel {
  id: string;
  nome: string;
  email: string;
  responsavel_juridico_id: string | null;
  responsavel?: FuncionarioJuridico | null;
}

/**
 * Busca todos os processos
 */
export async function getProcessos(): Promise<Processo[]> {
  const response = await fetch(`${API_BASE_URL}/juridico/processos`);

  if (!response.ok) {
    throw new Error('Erro ao buscar processos');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Busca processos sem responsável (vagos)
 */
export async function getProcessosVagos(): Promise<Processo[]> {
  const response = await fetch(`${API_BASE_URL}/juridico/processos/vagos`);

  if (!response.ok) {
    throw new Error('Erro ao buscar processos vagos');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Atribui um responsável jurídico a um processo
 */
export async function atribuirResponsavel(
  processoId: string, 
  responsavelId: string
): Promise<AtribuirResponsavelResponse> {
  const response = await fetch(`${API_BASE_URL}/juridico/atribuir-responsavel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ processoId, responsavelId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao atribuir responsável jurídico');
  }

  return response.json();
}

/**
 * Remove o responsável jurídico de um cliente (deixa vago)
 */
export async function removerResponsavel(clienteId: string): Promise<AtribuirResponsavelResponse> {
  const response = await fetch(`${API_BASE_URL}/juridico/atribuir-responsavel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ clienteId, responsavelId: null }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao remover responsável jurídico');
  }

  return response.json();
}

/**
 * Busca todos os funcionários do jurídico
 */
export async function getFuncionariosJuridico(): Promise<FuncionarioJuridico[]> {

  const response = await fetch(`${API_BASE_URL}/juridico/funcionarios`);

  if (!response.ok) {
    throw new Error('Erro ao buscar funcionários do jurídico');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Busca clientes sem responsável (vagos)
 */
export async function getClientesVagos(): Promise<ClienteComResponsavel[]> {
  const response = await fetch(`${API_BASE_URL}/juridico/clientes/vagos`);

  if (!response.ok) {
    throw new Error('Erro ao buscar clientes vagos');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Busca todos os clientes com seus responsáveis
 */
export async function getAllClientesComResponsavel(): Promise<ClienteComResponsavel[]> {
  const response = await fetch(`${API_BASE_URL}/juridico/clientes`);

  if (!response.ok) {
    throw new Error('Erro ao buscar clientes');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Busca clientes de um responsável específico
 */
export async function getClientesByResponsavel(responsavelId: string): Promise<ClienteComResponsavel[]> {
  const response = await fetch(`${API_BASE_URL}/juridico/clientes/por-responsavel/${responsavelId}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar clientes do responsável');
  }

  const result = await response.json();
  return result.data;
}

export default {
  getProcessos,
  getProcessosVagos,
  atribuirResponsavel,
  removerResponsavel,
  getFuncionariosJuridico,
  getClientesVagos,
  getAllClientesComResponsavel,
  getClientesByResponsavel,
};
