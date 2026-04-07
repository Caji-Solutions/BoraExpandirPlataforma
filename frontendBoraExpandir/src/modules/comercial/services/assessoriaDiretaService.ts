import { apiClient } from '@/modules/shared/services/api';

export interface AssessoriaDiretaItem {
  id: string;
  clienteId: string;
  clienteNome: string;
  servicoNome: string;
  valor: number | null;
  status: 'em_espera' | 'em_andamento' | 'realizado';
  criadoEm: string;
}

export async function getAssessoriasDiretas(): Promise<AssessoriaDiretaItem[]> {
  const result = await apiClient.get<{ data: AssessoriaDiretaItem[] }>('/comercial/assessoria-direta');
  return result.data || [];
}

const assessoriaDiretaComercialService = {
  getAssessoriasDiretas,
};

export default assessoriaDiretaComercialService;
