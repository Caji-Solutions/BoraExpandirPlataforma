import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import FormularioAssessoriaPage from '../FormularioAssessoriaPage';
import comercialService from '../services/comercialService';

// Mock dependencias externas
vi.mock('../services/comercialService', () => ({
  default: {
    getContratoServicoById: vi.fn(),
    updateContratoDraft: vi.fn(),
    gerarContratoPdf: vi.fn(),
    enviarContratoAssinatura: vi.fn()
  }
}));

// Mock useParams e useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'mock-draft-id' }),
    useNavigate: () => vi.fn() // mock simple function
  };
});

// Mock fecth para a chamada de DNA que tem direto no componente baseada no `window.fetch`
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: {} })
} as any);

describe('FormularioAssessoriaPage', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <FormularioAssessoriaPage />
      </BrowserRouter>
    );
  };

  it('Deve renderizar o Step 1 apos carregar o draft simulado do backend', async () => {
    (comercialService.getContratoServicoById as any).mockResolvedValueOnce({
      id: 'mock-draft-id',
      is_draft: true,
      etapa_fluxo: 1,
      draft_dados: { nome: 'Cliente Teste React', email: 'test@react.com' }
    });

    renderComponent();

    // Aguarda o loading sumir
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Formulario/i })).toBeInTheDocument();
    });

    // Verifica se os campos iniciais foram populados pelo draft default
    expect(screen.getByDisplayValue('Cliente Teste React')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@react.com')).toBeInTheDocument();
    
    // Verifica se o botao Proximo esta presente
    expect(screen.getByRole('button', { name: /Proximo/i })).toBeInTheDocument();
  });

  it('Deve navegar do Step 1 para o Step 2 salvando o rascunho', async () => {
    (comercialService.getContratoServicoById as any).mockResolvedValueOnce({
      id: 'mock-draft-id',
      is_draft: true,
      etapa_fluxo: 1,
      draft_dados: { nome: 'Joao', email: 'joao@test.com' }
    });

    // Mock do retorno da atualizacao
    (comercialService.updateContratoDraft as any).mockResolvedValueOnce({
      etapa_fluxo: 2,
      draft_dados: { nome: 'Joao', email: 'joao@test.com' }
    });

    renderComponent();

    // Espera montar (dados step 1 na tela)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Joao')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /Proximo/i });
    fireEvent.click(nextButton);

    // Deve chamar updateContratoDraft para etapa 2
    await waitFor(() => {
      expect(comercialService.updateContratoDraft).toHaveBeenCalledWith('mock-draft-id', expect.objectContaining({
        etapa_fluxo: 2
      }));
    });

    // Deve renderizar elementos do Step 2
    await waitFor(() => {
      expect(screen.getByText('Servicos e Valores')).toBeInTheDocument();
      expect(screen.getByText(/Valor Total/i)).toBeInTheDocument();
    });
  });

  it('Deve exibir bloqueio e status de loading correto caso ocorra erro ao Gerar', async () => {
    // Comeca direto no Step 4 (bloqueado) para testar a ui de fallbacks de erro do servidor
    (comercialService.getContratoServicoById as any).mockResolvedValueOnce({
      id: 'mock-draft-id',
      is_draft: true,
      etapa_fluxo: 4,
      draft_dados: { 
        nome: 'Joao', 
        __erroGeracao: { ativo: true, mensagem: 'Mock Falha Geracao' } 
      }
    });

    renderComponent();

    // Espera montar o componente com o alerta de erro
    await waitFor(() => {
      expect(screen.getByText(/Contrato travado por erro de geracao/i)).toBeInTheDocument();
      expect(screen.getByText('Mock Falha Geracao')).toBeInTheDocument();
    });

    // O botao padrao de gerar deve sumir, deve sobrar tentar "Tentar gerar novamente"
    const retryButton = screen.getByRole('button', { name: /Tentar gerar novamente/i });
    expect(retryButton).toBeInTheDocument();
    
    // Tenta clicar e validar se a chamada foi disparada para retry e botao exibe loading visual
    (comercialService.updateContratoDraft as any).mockResolvedValueOnce({ etapa_fluxo: 4 });
    (comercialService.gerarContratoPdf as any).mockRejectedValueOnce(new Error('Persistent error'));

    fireEvent.click(retryButton);

    // Botao deve ficar disabled no state de saving
    expect(retryButton).toBeDisabled();

    // Espera o mock do servico ser chamado internamente ao clickar
    await waitFor(() => {
         expect(comercialService.gerarContratoPdf).toHaveBeenCalledWith('mock-draft-id');
    });
  });

});
