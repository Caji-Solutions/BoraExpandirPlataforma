import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ContratoServicoDetailPage from '../pages/contratos/ContratoServicoDetailPage';
import comercialService from '../services/comercialService';
import { catalogService } from '@/modules/adm/services/catalogService';

vi.mock('../services/comercialService', () => ({
  default: {
    getContratoServicoById: vi.fn(),
    getAgendamentosByCliente: vi.fn()
  }
}));

vi.mock('@/modules/adm/services/catalogService', () => ({
  catalogService: {
    getCatalogServices: vi.fn()
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'mock-contrato-id' }),
    useNavigate: () => vi.fn()
  };
});

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ activeProfile: { id: 'user-1', nome: 'Teste' } })
}));

const contratoBase = {
  id: 'mock-contrato-id',
  cliente_id: 'cli-1',
  servico_id: 'srv-1',
  pagamento_status: 'aprovado',
  assinatura_status: 'aprovado',
  status_contrato: 'ATIVO',
  servico_nome: 'Assessoria Arraigo',
  criado_em: new Date().toISOString()
};

describe('ContratoServicoDetailPage - servico nao agendavel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (comercialService.getAgendamentosByCliente as any).mockResolvedValue([]);
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ContratoServicoDetailPage />
      </BrowserRouter>
    );

  it('exibe mensagem de assessoria direta quando naoAgendavel = true', async () => {
    (comercialService.getContratoServicoById as any).mockResolvedValue(contratoBase);
    (catalogService.getCatalogServices as any).mockResolvedValue([
      { id: 'srv-1', nome: 'Assessoria Arraigo', naoAgendavel: true }
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Assessoria Direta/i)).toBeInTheDocument();
      expect(screen.getByText(/Sem agendamento necessario/i)).toBeInTheDocument();
    });
  });

  it('nao exibe mensagem de assessoria direta quando naoAgendavel = false', async () => {
    (comercialService.getContratoServicoById as any).mockResolvedValue(contratoBase);
    (catalogService.getCatalogServices as any).mockResolvedValue([
      { id: 'srv-1', nome: 'Consultoria', naoAgendavel: false }
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.queryByText(/Assessoria Direta/i)).not.toBeInTheDocument();
    });
  });

  it('usa fallback (naoAgendavel = false) quando getCatalogServices lanca erro', async () => {
    (comercialService.getContratoServicoById as any).mockResolvedValue(contratoBase);
    (catalogService.getCatalogServices as any).mockRejectedValue(new Error('catalog error'));

    renderPage();

    await waitFor(() => {
      expect(screen.queryByText(/Assessoria Direta/i)).not.toBeInTheDocument();
    });
  });

  it('usa fallback (naoAgendavel = false) quando servico_id nao e encontrado no catalogo', async () => {
    (comercialService.getContratoServicoById as any).mockResolvedValue(contratoBase);
    (catalogService.getCatalogServices as any).mockResolvedValue([
      { id: 'outro-srv', nome: 'Outro', naoAgendavel: true }
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.queryByText(/Assessoria Direta/i)).not.toBeInTheDocument();
    });
  });

  it('nao exibe secao Proximos passos quando pagamento nao esta aprovado', async () => {
    (comercialService.getContratoServicoById as any).mockResolvedValue({
      ...contratoBase,
      pagamento_status: 'pendente'
    });
    (catalogService.getCatalogServices as any).mockResolvedValue([
      { id: 'srv-1', naoAgendavel: true }
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.queryByText(/Assessoria Direta/i)).not.toBeInTheDocument();
    });
  });
});
