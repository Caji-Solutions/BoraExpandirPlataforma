// Servico para gestao do catalogo de servicos e requisitos documentais
import { apiClient } from '@/modules/shared/services/api';

export interface DocumentRequirement {
  id: string;
  name: string;
  stage: string;
  required: boolean;
  tipoDocumento: 'titular' | 'dependente';  // NEW
}

export interface Subservice {
  id: string;
  name: string;
  servicoId?: string;
  servicoNome?: string;
  documents: DocumentRequirement[];
}

export type ServiceType = 'fixo' | 'agendavel' | 'diverso';
export type TipoPreco = 'fixo' | 'por_contrato';  // NEW

export interface Service {
  id: string;
  name: string;
  value: string;
  duration: string;
  type: ServiceType;
  isAgendavel: boolean;           // NEW
  tipoPreco: TipoPreco;           // NEW
  contratoTemplateId: string | null; // NEW
  possuiSubservicos: boolean;     // NEW
  showInCommercial: boolean;
  showToClient: boolean;
  documents: DocumentRequirement[];
  subservices: Subservice[];
}

/**
 * Busca todos os servicos do catalogo
 */
export async function getCatalogServices(): Promise<Service[]> {
  const result = await apiClient.get<{ data: Service[] }>('/adm/catalog');
  return result.data || [];
}

/**
 * Cria um novo servico no catalogo
 */
export async function createCatalogService(service: Omit<Service, 'id'>): Promise<Service> {
  const result = await apiClient.post<{ data: Service }>('/adm/catalog', service);
  return result.data;
}

/**
 * Atualiza um servico existente
 */
export async function updateCatalogService(id: string, service: Partial<Service>): Promise<Service> {
  const result = await apiClient.patch<{ data: Service }>(`/adm/catalog/${id}`, service);
  return result.data;
}

/**
 * Exclui um servico do catalogo
 */
export async function deleteCatalogService(id: string): Promise<void> {
  await apiClient.delete(`/adm/catalog/${id}`);
}

export const catalogService = {
  getCatalogServices,
  createCatalogService,
  updateCatalogService,
  deleteCatalogService,
};
