// Servico para gestao do catalogo de servicos e requisitos documentais
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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
  const response = await fetch(`${API_BASE_URL}/adm/catalog`);
  if (!response.ok) {
    throw new Error('Erro ao buscar catalogo de servicos');
  }
  const result = await response.json();
  return result.data || [];
}

/**
 * Cria um novo servico no catalogo
 */
export async function createCatalogService(service: Omit<Service, 'id'>): Promise<Service> {
  const response = await fetch(`${API_BASE_URL}/adm/catalog`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(service),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Erro ao criar servico');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Atualiza um servico existente
 */
export async function updateCatalogService(id: string, service: Partial<Service>): Promise<Service> {
  const response = await fetch(`${API_BASE_URL}/adm/catalog/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(service),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Erro ao atualizar servico');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Exclui um servico do catalogo
 */
export async function deleteCatalogService(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/adm/catalog/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir servico');
  }
}

// ======= Subservicos =======

/**
 * Busca todos os subservicos
 */
export async function getSubservices(): Promise<Subservice[]> {
  const response = await fetch(`${API_BASE_URL}/adm/subservices`);
  if (!response.ok) {
    throw new Error('Erro ao buscar subservicos');
  }
  const result = await response.json();
  return result.data || [];
}

/**
 * Cria um novo subservico
 */
export async function createSubservice(payload: { name: string; servicoId?: string; documents?: DocumentRequirement[] }): Promise<Subservice> {
  const response = await fetch(`${API_BASE_URL}/adm/subservices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Erro ao criar subservico');
  }
  const result = await response.json();
  return result.data;
}

/**
 * Atualiza um subservico existente
 */
export async function updateSubservice(id: string, payload: { name?: string; servicoId?: string; documents?: DocumentRequirement[] }): Promise<Subservice> {
  const response = await fetch(`${API_BASE_URL}/adm/subservices/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Erro ao atualizar subservico');
  }
  const result = await response.json();
  return result.data;
}

/**
 * Exclui um subservico
 */
export async function deleteSubservice(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/adm/subservices/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Erro ao excluir subservico');
  }
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
