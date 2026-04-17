import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/modules/shared/services/api';
import comercialService from '../services/comercialService';

// Mock do apiClient
vi.mock('@/modules/shared/services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('comercialService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllClientes', () => {
    it('deve buscar e normalizar os dados dos clientes', async () => {
      const mockRawData = {
        data: [
          {
            id: 'c1',
            nome: 'Cliente Um',
            whatsapp: '5511999999999',
            documento: '12345678901',
            criado_em: '2024-01-01T10:00:00Z'
          }
        ]
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockRawData);

      const result = await comercialService.getAllClientes();

      expect(apiClient.get).toHaveBeenCalledWith('/cliente/clientes');
      expect(result[0].telefone).toBe('55-11-99999-9999');
      expect(result[0].whatsapp).toBe('5511999999999');
      expect(result[0].documento).toBe('123.456.789-01');
      expect(result[0].created_at).toBe('2024-01-01T10:00:00Z');
    });
  });

  describe('createContratoServico', () => {
    it('deve chamar o endpoint correto para criar contrato', async () => {
      const payload = { cliente_id: 'c1', servico_id: 's1', usuario_id: 'u1' };
      const mockResponse = { data: { id: 'contract-123' } };
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await comercialService.createContratoServico(payload);

      expect(apiClient.post).toHaveBeenCalledWith('/comercial/contratos', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateContratoDraft', () => {
    it('deve atualizar o rascunho do contrato', async () => {
      const payload = { etapa_fluxo: 2, draft_dados: { key: 'value' } };
      vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { success: true } });

      await comercialService.updateContratoDraft('contrato-id', payload);

      expect(apiClient.put).toHaveBeenCalledWith('/comercial/contratos/contrato-id/draft', payload);
    });
  });

  describe('enviarContratoAssinatura', () => {
    it('deve enviar contrato para assinatura por e-mail', async () => {
      const email = 'teste@exemplo.com';
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { message: 'Sent' } });

      await comercialService.enviarContratoAssinatura('id-123', email);

      expect(apiClient.post).toHaveBeenCalledWith('/comercial/contratos/id-123/enviar-assinatura', { email });
    });
  });

  describe('getConsultoriasCount', () => {
    it('deve retornar contagem de consultorias e valores', async () => {
      const mockData = { data: { total_consultorias: 2, valor_desconto: 100, valor_por_consultoria: 50 } };
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockData);

      const result = await comercialService.getConsultoriasCount('c1');

      expect(apiClient.get).toHaveBeenCalledWith('/comercial/consultorias-count/c1');
      expect(result).toEqual(mockData.data);
    });
  });

  describe('cancelarAgendamento', () => {
    it('deve cancelar um agendamento', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ success: true });

      await comercialService.cancelarAgendamento('ag-123');

      expect(apiClient.post).toHaveBeenCalledWith('/comercial/agendamento/ag-123/cancelar');
    });
  });
});
