import { apiClient } from '@/modules/shared/services/api';

export interface AssessoriaDiretaItem {
  id: string;
  clienteId: string;
  clienteNome: string;
  servicoNome: string;
  valor: number | null;
  comercialNome: string;
  status: 'em_espera' | 'em_andamento' | 'realizado';
  criadoEm: string;
}

export interface AssessoriaDiretaDetail {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  servico_id: string;
  servico_nome: string;
  servico_valor: number | null;
  valorCalculado: number | null;
  contrato_assinado_url: string | null;
  statusAssessoria: string;
  cliente?: {
    id: string;
    nome: string;
    email: string;
    whatsapp?: string;
    stage: string;
  };
  comercial?: {
    id: string;
    full_name: string;
    email: string;
  };
  assessoria?: any;
}

export async function getAssessoriasDiretas(status?: string): Promise<AssessoriaDiretaItem[]> {
  const query = status && status !== 'todos' ? `?status=${status}` : '';
  const result = await apiClient.get<{ data: AssessoriaDiretaItem[] }>(`/juridico/assessoria-direta${query}`);
  return result.data || [];
}

export async function getAssessoriaDiretaDetail(id: string): Promise<AssessoriaDiretaDetail> {
  const result = await apiClient.get<{ data: AssessoriaDiretaDetail }>(`/juridico/assessoria-direta/${id}`);
  return result.data;
}

export async function iniciarAssessoriaDireta(id: string): Promise<void> {
  await apiClient.post(`/juridico/assessoria-direta/${id}/iniciar`);
}

export async function finalizarAssessoriaDireta(id: string): Promise<void> {
  await apiClient.post(`/juridico/assessoria-direta/${id}/finalizar`);
}

const assessoriaDiretaJuridicoService = {
  getAssessoriasDiretas,
  getAssessoriaDiretaDetail,
  iniciarAssessoriaDireta,
  finalizarAssessoriaDireta,
};

export default assessoriaDiretaJuridicoService;
