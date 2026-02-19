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
  requerimentos?: any[];
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
 * Busca processos de um responsável específico
 */
export async function getProcessosByResponsavel(responsavelId: string): Promise<Processo[]> {
  const response = await fetch(`${API_BASE_URL}/juridico/processos/por-responsavel/${responsavelId}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar processos do responsável');
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

/**
 * Busca formulários com status de resposta (waiting/received)
 */
export async function getFormulariosWithStatus(clienteId: string, membroId?: string): Promise<any[]> {
  const url = membroId 
    ? `${API_BASE_URL}/juridico/formularios-status/${clienteId}/${membroId}`
    : `${API_BASE_URL}/juridico/formularios-status/${clienteId}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Erro ao buscar formulários com status');
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Atualiza o status do formulário do cliente (aprovar/rejeitar)
 */
export async function updateFormularioClienteStatus(
  formularioClienteId: string, 
  status: 'pendente' | 'aprovado' | 'rejeitado', 
  motivoRejeicao?: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/juridico/formulario-cliente/${formularioClienteId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status,
      motivoRejeicao
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao atualizar status do formulário');
  }

  return response.json();
}

/**
 * Busca documentos de um cliente específico
 */
export async function getDocumentosCliente(clienteId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/cliente/${clienteId}/documentos`);

  if (!response.ok) {
    throw new Error('Erro ao buscar documentos');
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Busca documentos de um processo específico (inclui todos os membros da família)
 */
export async function getDocumentosByProcesso(processoId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/cliente/processo/${processoId}/documentos`);

  if (!response.ok) {
    throw new Error('Erro ao buscar documentos do processo');
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Busca dependentes de um cliente
 */
export async function getDependentes(clienteId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/cliente/${clienteId}/dependentes`);

  if (!response.ok) {
    throw new Error('Erro ao buscar dependentes');
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Atualiza o status de um documento
 */
export async function updateDocumentStatus(
  documentoId: string, 
  status: string, 
  motivoRejeicao?: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/cliente/documento/${documentoId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status,
      motivoRejeicao
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar status do documento');
  }

  return response.json();
}

/**
 * Solicita um novo documento (cria registro pendente no banco)
 */
export async function requestDocument(payload: {
  clienteId: string;
  tipo: string;
  processoId?: string;
  membroId?: string;
  requerimentoId?: string;
  notificar?: boolean;
  prazo?: number;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/juridico/documentos/solicitar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Erro ao solicitar documento');
  }

  return response.json();
}

/**
 * Solicita um novo requerimento
 */
export async function requestRequirement(payload: {
  clienteId: string;
  tipo: string;
  processoId?: string;
  observacoes?: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/juridico/requerimentos/solicitar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Erro ao solicitar requerimento');
  }

  return response.json();
}

/**
 * Atualiza a etapa (fase) de um processo
 */
export async function updateProcessEtapa(processoId: string, etapa: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/juridico/processo/${processoId}/etapa`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ etapa }),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar etapa do processo');
  }

  return response.json();
}

/**
 * Busca requerimentos de um processo específico
 */
export async function getRequerimentosByProcesso(processoId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/juridico/requerimentos/processo/${processoId}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar requerimentos do processo');
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Busca requerimentos de um cliente específico
 */
export async function getRequerimentosByCliente(clienteId: string, membroId?: string): Promise<any[]> {
  const url = membroId 
    ? `${API_BASE_URL}/juridico/requerimentos/cliente/${clienteId}/${membroId}`
    : `${API_BASE_URL}/juridico/requerimentos/cliente/${clienteId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Erro ao buscar requerimentos do cliente');
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Atualiza o status de um requerimento
 */
export async function updateRequerimentoStatus(
  requerimentoId: string, 
  status: string, 
  observacoes?: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/juridico/requerimentos/${requerimentoId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status,
      observacoes
    }),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar status do requerimento');
  }

  return response.json();
}

export default {
    getProcessos,
    getProcessosByResponsavel,
    getProcessosVagos,
    atribuirResponsavel,
    removerResponsavel,
    getFuncionariosJuridico,
    getClientesVagos,
    getAllClientesComResponsavel,
    getClientesByResponsavel,
    getFormulariosWithStatus,
    updateFormularioClienteStatus,
    getDocumentosCliente,
    getDocumentosByProcesso,
    getDependentes,
    updateDocumentStatus,
    requestDocument,
    requestRequirement,
    updateProcessEtapa,
    getRequerimentosByProcesso,
    getRequerimentosByCliente,
    updateRequerimentoStatus
};
