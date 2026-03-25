// Servico para gestao do catalogo de servicos e requisitos documentais
import { apiClient } from '@/modules/shared/services/api';

export interface DocumentRequirement {
  id: string;
  name: string;
  stage: string;
  required: boolean;
}

export interface Subservice {
  id: string;
  name: string;
  servicoId?: string;
  servicoNome?: string;
  documents: DocumentRequirement[];
}

export type ServiceType = 'fixo' | 'agendavel' | 'diverso';

export interface Service {
  id: string;
  name: string;
  value: string;
  duration: string;
  type: ServiceType;
  showInCommercial: boolean;
  showToClient: boolean;
  requiresLegalDelegation: boolean;
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

// ======= Subservicos =======

/**
 * Busca todos os subservicos
 */
export async function getSubservices(): Promise<Subservice[]> {
  const result = await apiClient.get<{ data: Subservice[] }>('/adm/subservices');
  return result.data || [];
}

/**
 * Cria um novo subservico
 */
export async function createSubservice(payload: { name: string; servicoId?: string; documents?: DocumentRequirement[] }): Promise<Subservice> {
  const result = await apiClient.post<{ data: Subservice }>('/adm/subservices', payload);
  return result.data;
}

/**
 * Atualiza um subservico existente
 */
export async function updateSubservice(id: string, payload: { name?: string; servicoId?: string; documents?: DocumentRequirement[] }): Promise<Subservice> {
  const result = await apiClient.patch<{ data: Subservice }>(`/adm/subservices/${id}`, payload);
  return result.data;
}

/**
 * Exclui um subservico
 */
export async function deleteSubservice(id: string): Promise<void> {
  await apiClient.delete(`/adm/subservices/${id}`);
}

export const catalogService = {
  getCatalogServices,
  createCatalogService,
  updateCatalogService,
  deleteCatalogService,
  getSubservices,
  createSubservice,
  updateSubservice,
  deleteSubservice,
};
