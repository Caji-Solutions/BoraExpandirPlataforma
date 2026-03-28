// Serviço para chamadas à API do Jurídico

import { apiClient } from '@/modules/shared/services/api';

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
  horario_trabalho?: string;
}

export interface Cliente {
  id: string;
  client_id?: string;
  nome: string;
  email: string;
  whatsapp?: string;
  status?: string;
  previsao_chegada?: string;
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
  criado_em: string;
  atualizado_em: string;
  clientes?: Cliente;
  responsavel?: FuncionarioJuridico | null;
}

export interface ClienteComResponsavel {
  id: string;
  client_id?: string;
  nome: string;
  email: string;
  whatsapp?: string;
  responsavel_juridico_id: string | null;
  responsavel?: FuncionarioJuridico | null;
  data_agendamento?: string;
  status_agendamento?: string;
}

/**
 * Busca todos os processos
 */
export async function getProcessos(): Promise<Processo[]> {
  const result = await apiClient.get(`/juridico/processos`);
  return result.data;
}

/**
 * Busca processos de um responsável específico
 */
export async function getProcessosByResponsavel(responsavelId: string): Promise<Processo[]> {
  const result = await apiClient.get(`/juridico/processos/por-responsavel/${responsavelId}`);
  return result.data;
}

/**
 * Busca processos sem responsável (vagos)
 */
export async function getProcessosVagos(): Promise<Processo[]> {
  const result = await apiClient.get(`/juridico/processos/vagos`);
  return result.data;
}

/**
 * Atribui um responsável jurídico a um processo
 */
export async function atribuirResponsavel(
  processoId: string,
  responsavelId: string
): Promise<AtribuirResponsavelResponse> {
  return apiClient.post(`/juridico/atribuir-responsavel`, { processoId, responsavelId });
}

/**
 * Remove o responsável jurídico de um cliente (deixa vago)
 */
export async function removerResponsavel(clienteId: string): Promise<AtribuirResponsavelResponse> {
  return apiClient.post(`/juridico/atribuir-responsavel`, { clienteId, responsavelId: null });
}

/**
 * Busca agendamentos que requerem delegação
 */
export async function getAgendamentosDelegacao(): Promise<any[]> {
  const result = await apiClient.get(`/juridico/agendamentos/delegacao`);
  return result.data;
}

/**
 * Atribui um responsável jurídico a um agendamento
 */
export async function atribuirResponsavelAgendamento(
  agendamentoId: string,
  responsavelId: string
): Promise<any> {
  return apiClient.post(`/juridico/atribuir-responsavel-agendamento`, { agendamentoId, responsavelId });
}

/**
 * Busca todos os funcionários do jurídico
 */
export async function getFuncionariosJuridico(): Promise<FuncionarioJuridico[]> {
  const result = await apiClient.get(`/juridico/funcionarios`);
  return result.data;
}

/**
 * Busca clientes sem responsável (vagos)
 */
export async function getClientesVagos(): Promise<ClienteComResponsavel[]> {
  const result = await apiClient.get(`/juridico/clientes/vagos`);
  return result.data;
}

/**
 * Busca todos os clientes com seus responsáveis
 */
export async function getAllClientesComResponsavel(): Promise<ClienteComResponsavel[]> {
  const result = await apiClient.get(`/juridico/clientes`);
  return result.data;
}

/**
 * Busca clientes de um responsável específico
 */
export async function getClientesByResponsavel(responsavelId: string): Promise<ClienteComResponsavel[]> {
  const result = await apiClient.get(`/juridico/clientes/por-responsavel/${responsavelId}`);
  return result.data;
}

/**
 * Busca formulários com status de resposta (waiting/received)
 */
export async function getFormulariosWithStatus(clienteId: string, membroId?: string): Promise<any[]> {
  const endpoint = membroId
    ? `/juridico/formularios-status/${clienteId}/${membroId}`
    : `/juridico/formularios-status/${clienteId}`;

  const result = await apiClient.get(endpoint);
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
  return apiClient.patch(`/juridico/formulario-cliente/${formularioClienteId}/status`, {
    status,
    motivoRejeicao
  });
}

/**
 * Busca documentos de um cliente específico
 */
export async function getDocumentosCliente(clienteId: string): Promise<any[]> {
  const result = await apiClient.get(`/cliente/${clienteId}/documentos`);
  return result.data || [];
}

/**
 * Busca documentos de um processo específico (inclui todos os membros da família)
 */
export async function getDocumentosByProcesso(processoId: string): Promise<any[]> {
  const result = await apiClient.get(`/cliente/processo/${processoId}/documentos`);
  return result.data || [];
}

/**
 * Busca o catálogo de serviços
 */
export async function getCatalogServices(): Promise<any[]> {
  const result = await apiClient.get(`/adm/catalog`);
  return result.data || [];
}

/**
 * Busca dependentes de um cliente
 */
export async function getDependentes(clienteId: string): Promise<any[]> {
  const result = await apiClient.get(`/cliente/${clienteId}/dependentes`);
  return result.data || [];
}

/**
 * Atualiza o status de um documento
 */
export async function updateDocumentStatus(
  documentoId: string,
  status: string,
  motivoRejeicao?: string,
  solicitado_pelo_juridico?: boolean,
  prazo?: number,
  analisadoPor?: string
): Promise<any> {
  return apiClient.patch(`/cliente/documento/${documentoId}/status`, {
    status,
    motivoRejeicao,
    solicitado_pelo_juridico,
    prazo,
    analisadoPor
  });
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
  return apiClient.post(`/juridico/documentos/solicitar`, payload);
}

/**
 * Solicita um novo requerimento
 */
export async function requestRequirement(payload: {
  clienteId: string;
  tipo: string;
  processoId?: string;
  observacoes?: string;
  documentosAcoplados?: any[];
  files?: File[];
} | FormData): Promise<any> {
  return apiClient.post(`/juridico/requerimentos/solicitar`, payload);
}

/**
 * Atualiza a etapa (fase) de um processo
 */
export async function updateProcessEtapa(processoId: string, etapa: number): Promise<any> {
  return apiClient.patch(`/juridico/processo/${processoId}/etapa`, { etapa });
}

/**
 * Busca requerimentos de um processo específico
 */
export async function getRequerimentosByProcesso(processoId: string): Promise<any[]> {
  const result = await apiClient.get(`/juridico/requerimentos/processo/${processoId}`);
  return result.data || [];
}

/**
 * Busca requerimentos de um cliente específico
 */
export async function getRequerimentosByCliente(clienteId: string, membroId?: string): Promise<any[]> {
  const endpoint = membroId
    ? `/juridico/requerimentos/cliente/${clienteId}/${membroId}`
    : `/juridico/requerimentos/cliente/${clienteId}`;

  const result = await apiClient.get(endpoint);
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
  return apiClient.patch(`/juridico/requerimentos/${requerimentoId}/status`, {
    status,
    observacoes
  });
}

/**
 * Busca estatísticas globais do jurídico
 */
export async function getEstatisticas(): Promise<any> {
  const result = await apiClient.get(`/juridico/estatisticas`);
  return result.data;
}

/**
 * Cria um novo processo manualmente
 */
export async function createProcess(payload: {
  clienteId: string;
  tipoServico: string;
  status?: string;
  etapaAtual?: number;
  responsavelId?: string;
  vendedor_id?: string;
}): Promise<any> {
  return apiClient.post(`/juridico/processo`, payload);
}

/**
 * Cria uma nova assessoria jurídica
 */
export async function createAssessoria(payload: {
  clienteId: string;
  respostas: any;
  observacoes?: string;
  responsavelId?: string;
  servicoId?: string;
}): Promise<any> {
  return apiClient.post(`/juridico/assessoria`, payload);
}

/**
 * Busca a última assessoria de um cliente
 */
export async function getLatestAssessoria(clienteId: string): Promise<any> {
  const result = await apiClient.get(`/juridico/assessoria/${clienteId}`);
  return result.data;
}

/**
 * Busca o processo ativo de um cliente
 */
export async function getProcessoByCliente(clienteId: string): Promise<any> {
  const result = await apiClient.get(`/juridico/processo-cliente/${clienteId}`);
  return result.data;
}

/**
 * Busca todos os agendamentos (Consultorias)
 */
export async function getAgendamentos(): Promise<any[]> {
  return apiClient.get(`/comercial/agendamentos`);
}

/**
 * Busca assessorias delegadas a um responsável
 */
export async function getAssessoriasByResponsavel(responsavelId: string): Promise<any[]> {
  const result = await apiClient.get(`/juridico/assessorias/por-responsavel/${responsavelId}`);
  return result.data;
}

/**
 * Busca agendamentos delegados a um responsável
 */
export async function getAgendamentosByResponsavel(responsavelId: string): Promise<any[]> {
  const result = await apiClient.get(`/juridico/agendamentos/por-responsavel/${responsavelId}`);
  return result.data;
}

/**
 * Solicita o apostilamento de um documento ao administrativo
 */
export async function requestApostille(documentoId: string, documentoUrl?: string, observacoes?: string): Promise<any> {
  return apiClient.post(`/apostilamentos/solicitar`, { documentoId, documentoUrl, observacoes });
}

/**
 * Busca um perfil pelo ID
 */
export async function getProfileById(profileId: string): Promise<any> {
  try {
    const result = await apiClient.get(`/juridico/funcionario/${profileId}`);
    return result.data;
  } catch (error) {
    // Handle 404 errors gracefully
    return null;
  }
}

/**
 * Verifica se o cliente já preencheu o formulário
 */
export async function verificarFormularioPreenchido(clienteId: string): Promise<boolean> {
  const result = await apiClient.get(`/juridico/formulario-preenchido/${clienteId}`);
  return result.preenchido === true;
}

/**
 * Registra pedido de reagendamento
 */
export async function pedidoReagendamento(agendamentoId: string, mensagem: string): Promise<void> {
  await apiClient.post(`/juridico/agendamentos/pedido-reagendamento`, { agendamentoId, mensagem });
}

export async function getAllSubservices(): Promise<any[]> {
  const result = await apiClient.get(`/juridico/subservicos`);
  return result.data;
}

/**
 * Marca uma consultoria/agendamento como em andamento (atualiza stage do cliente para em_consultoria)
 */
export async function marcarConsultoriaEmAndamento(agendamentoId: string): Promise<any> {
  return apiClient.post(`/juridico/agendamentos/${agendamentoId}/em-andamento`, {});
}

/**
 * Marca uma consultoria/agendamento como realizada
 */
export async function marcarConsultoriaRealizada(agendamentoId: string, vendedorId?: string): Promise<any> {
  return apiClient.post(`/juridico/agendamentos/${agendamentoId}/realizada`, { vendedorId });
}

/**
 * Busca usuários comerciais nível C2
 */
export async function getUsuariosComerciaisC2(): Promise<any[]> {
  const result = await apiClient.get(`/juridico/usuarios-comerciais-c2`);
  return result.data || [];
}

export default {
    getProcessos,
    getProcessosByResponsavel,
    getProcessosVagos,
    atribuirResponsavel,
    removerResponsavel,
    getFuncionariosJuridico,
    getAgendamentosDelegacao,
    atribuirResponsavelAgendamento,
    getClientesVagos,
    getAllClientesComResponsavel,
    getClientesByResponsavel,
    getCatalogServices,
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
    updateRequerimentoStatus,
    getEstatisticas,
    createProcess,
    createAssessoria,
    getLatestAssessoria,
    getProcessoByCliente,
    getAgendamentos,
    getAssessoriasByResponsavel,
    getAgendamentosByResponsavel,
    createDependent: async (
      clienteId: string,
      nomeCompleto: string,
      parentesco: string,
      extra?: {
        documento?: string,
        dataNascimento?: string,
        rg?: string,
        passaporte?: string,
        nacionalidade?: string,
        email?: string,
        telefone?: string,
        isAncestralDireto?: boolean
      }
    ) => {
      const result = await apiClient.post(`/cliente/${clienteId}/dependentes`, {
        nomeCompleto,
        parentesco,
        ...extra
      });
      return result.data;
    },
    requestApostille,
    getProfileById,
    getAllSubservices,
    verificarFormularioPreenchido,
    pedidoReagendamento,
    marcarConsultoriaEmAndamento,
    marcarConsultoriaRealizada,
    getUsuariosComerciaisC2,
};
