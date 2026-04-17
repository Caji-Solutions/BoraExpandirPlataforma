import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/modules/shared/services/api';
import assessoriaDiretaService from '../services/assessoriaDiretaService';

vi.mock('@/modules/shared/services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('assessoriaDiretaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAssessoriasDiretas', () => {
    it('deve buscar assessorias diretas sem filtro', async () => {
      const mockItems = [{ id: '1', clienteNome: 'Teste' }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockItems });

      const result = await assessoriaDiretaService.getAssessoriasDiretas();

      expect(apiClient.get).toHaveBeenCalledWith('/juridico/assessoria-direta');
      expect(result).toEqual(mockItems);
    });

    it('deve buscar assessorias diretas com filtro de status', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

      await assessoriaDiretaService.getAssessoriasDiretas('em_andamento');

      expect(apiClient.get).toHaveBeenCalledWith('/juridico/assessoria-direta?status=em_andamento');
    });
  });

  describe('getAssessoriaDiretaDetail', () => {
    it('deve buscar detalhes de uma assessoria específica', async () => {
      const mockDetail = { id: '123', cliente_nome: 'João' };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockDetail });

      const result = await assessoriaDiretaService.getAssessoriaDiretaDetail('123');

      expect(apiClient.get).toHaveBeenCalledWith('/juridico/assessoria-direta/123');
      expect(result).toEqual(mockDetail);
    });
  });

  describe('iniciar/finalizar', () => {
    it('deve iniciar assessoria direta', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({});
      await assessoriaDiretaService.iniciarAssessoriaDireta('123');
      expect(apiClient.post).toHaveBeenCalledWith('/juridico/assessoria-direta/123/iniciar');
    });

    it('deve finalizar assessoria direta', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({});
      await assessoriaDiretaService.finalizarAssessoriaDireta('123');
      expect(apiClient.post).toHaveBeenCalledWith('/juridico/assessoria-direta/123/finalizar');
    });
  });
});
