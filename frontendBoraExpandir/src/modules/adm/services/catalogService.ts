// Serviço para gestão do catálogo de serviços e requisitos documentais
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface DocumentRequirement {
  id: string;
  name: string;
  stage: string;
  required: boolean;
}

export interface Service {
  id: string;
  name: string;
  value: string;
  duration: string;
  showInCommercial: boolean;
  documents: DocumentRequirement[];
}

/**
 * Busca todos os serviços do catálogo
 */
export async function getCatalogServices(): Promise<Service[]> {
  const response = await fetch(`${API_BASE_URL}/adm/catalog`);
  if (!response.ok) {
    throw new Error('Erro ao buscar catálogo de serviços');
  }
  const result = await response.json();
  return result.data || [];
}

/**
 * Cria um novo serviço no catálogo
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
    throw new Error(error.message || 'Erro ao criar serviço');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Atualiza um serviço existente
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
    throw new Error(error.message || 'Erro ao atualizar serviço');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Exclui um serviço do catálogo
 */
export async function deleteCatalogService(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/adm/catalog/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir serviço');
  }
}

export const catalogService = {
  getCatalogServices,
  createCatalogService,
  updateCatalogService,
  deleteCatalogService
};
