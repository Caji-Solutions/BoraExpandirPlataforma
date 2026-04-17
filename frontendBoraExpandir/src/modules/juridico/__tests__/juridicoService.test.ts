import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/modules/shared/services/api';
import juridicoService from '../services/juridicoService';

// Mock do apiClient
vi.mock('@/modules/shared/services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('juridicoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProcessos', () => {
    it('deve buscar todos os processos com sucesso', async () => {
      const mockData = [{ id: '1', status: 'pendente' }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await juridicoService.getProcessos();

      expect(apiClient.get).toHaveBeenCalledWith('/juridico/processos');
      expect(result).toEqual(mockData);
    });
  });

  describe('atribuirResponsavel', () => {
    it('deve chamar o endpoint correto para atribuir responsável', async () => {
      const payload = { processoId: 'p1', responsavelId: 'r1' };
      const mockResponse = { message: 'Sucesso', data: { id: 'p1', responsavel_id: 'r1' } };
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await juridicoService.atribuirResponsavel('p1', 'r1');

      expect(apiClient.post).toHaveBeenCalledWith('/juridico/atribuir-responsavel', payload);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateDocumentStatus', () => {
    it('deve atualizar o status do documento com os parâmetros corretos', async () => {
      const docId = 'doc123';
      const status = 'aprovado';
      const motivo = 'OK';
      
      vi.mocked(apiClient.patch).mockResolvedValueOnce({ success: true });

      await juridicoService.updateDocumentStatus(docId, status, motivo, true, 5, 'admin-id');

      expect(apiClient.patch).toHaveBeenCalledWith(`/cliente/documento/${docId}/status`, {
        status,
        motivoRejeicao: motivo,
        solicitado_pelo_juridico: true,
        prazo: 5,
        analisadoPor: 'admin-id'
      });
    });
  });

  describe('requestDocument', () => {
    it('deve solicitar um novo documento', async () => {
      const payload = {
        clienteId: 'c1',
        tipo: 'RG',
        processoId: 'p1',
        notificar: true
      };
      
      vi.mocked(apiClient.post).mockResolvedValueOnce({ id: 'new-doc-req' });

      await juridicoService.requestDocument(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/juridico/documentos/solicitar', payload);
    });
  });

  describe('enviarParaProtocolacao', () => {
    it('deve enviar processo para protocolação para um supervisor', async () => {
      const processoId = 'proc-1';
      const supervisorId = 'sup-1';
      
      vi.mocked(apiClient.post).mockResolvedValueOnce({ success: true });

      await juridicoService.enviarParaProtocolacao(processoId, supervisorId);

      expect(apiClient.post).toHaveBeenCalledWith(`/juridico/processo/${processoId}/enviar-protocolacao`, { supervisorId });
    });
  });

  describe('marcarProcessoProtocolado', () => {
    it('deve marcar processo como protocolado', async () => {
      const processoId = 'proc-1';
      
      vi.mocked(apiClient.put).mockResolvedValueOnce({ success: true });

      await juridicoService.marcarProcessoProtocolado(processoId);

      expect(apiClient.put).toHaveBeenCalledWith(`/juridico/processo/${processoId}/marcar-protocolado`, {});
    });
  });

  describe('getLatestAssessoria', () => {
    it('deve buscar a última assessoria de um cliente', async () => {
      const clienteId = 'client-123';
      const mockAssessoria = { id: 'ass-1', cliente_id: clienteId, respostas: {} };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockAssessoria });

      const result = await juridicoService.getLatestAssessoria(clienteId);

      expect(apiClient.get).toHaveBeenCalledWith(`/juridico/assessoria/${clienteId}`);
      expect(result).toEqual(mockAssessoria);
    });
  });
});
