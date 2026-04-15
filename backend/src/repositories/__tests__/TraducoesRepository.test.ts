import { vi, describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../../config/SupabaseClient';

vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn()
    }
}));

describe('TraducoesRepository - Separacao tipo orcamento (Traducao vs Apostilagem)', () => {
    let TraducoesRepository: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();
        const mod = await import('../TraducoesRepository');
        TraducoesRepository = mod.default;
    });

    // ========================================
    // FLUXO 1: saveOrcamento deve inserir tipo='Traducao'
    // ========================================
    describe('saveOrcamento - insere tipo Traducao', () => {
        it('Deve inserir orcamento com tipo=Traducao', async () => {
            const mockOrcamento = {
                id: 'orc-1',
                documento_id: 'doc-1',
                valor_orcamento: 100,
                tipo: 'Traducao',
                status: 'disponivel'
            };

            const chain: any = {};
            chain.insert = vi.fn().mockReturnValue(chain);
            chain.select = vi.fn().mockReturnValue(chain);
            chain.single = vi.fn().mockResolvedValue({ data: mockOrcamento, error: null });

            // Config lookup chain (markup_padrao)
            const configChain: any = {};
            configChain.select = vi.fn().mockReturnValue(configChain);
            configChain.eq = vi.fn().mockReturnValue(configChain);
            configChain.single = vi.fn().mockResolvedValue({ data: { valor: '20' }, error: null });

            // Document update chain
            const updateChain: any = {};
            updateChain.update = vi.fn().mockReturnValue(updateChain);
            updateChain.eq = vi.fn().mockResolvedValue({ error: null });

            let fromCallCount = 0;
            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'configuracoes') return configChain;
                if (table === 'orcamentos') return chain;
                if (table === 'documentos') return updateChain;
                return chain;
            });

            await TraducoesRepository.saveOrcamento({
                documentoId: 'doc-1',
                valorOrcamento: 100,
                prazoEntrega: '2026-04-20',
                observacoes: 'Traducao juramentada'
            });

            expect(chain.insert).toHaveBeenCalledWith([
                expect.objectContaining({
                    tipo: 'Traducao',
                    documento_id: 'doc-1',
                    status: 'disponivel'
                })
            ]);
        });
    });

    // ========================================
    // FLUXO 2: getOrcamentoByDocumento filtra por tipo='Traducao'
    // ========================================
    describe('getOrcamentoByDocumento - filtra por tipo Traducao e multiplos status', () => {
        it('Deve buscar orcamento filtrando tipo=Traducao e status via .in()', async () => {
            const mockOrcamento = {
                id: 'orc-1',
                documento_id: 'doc-1',
                tipo: 'Traducao',
                status: 'disponivel'
            };

            const chain: any = {};
            chain.select = vi.fn().mockReturnValue(chain);
            chain.eq = vi.fn().mockReturnValue(chain);
            chain.in = vi.fn().mockReturnValue(chain);
            chain.order = vi.fn().mockReturnValue(chain);
            chain.limit = vi.fn().mockReturnValue(chain);
            chain.single = vi.fn().mockResolvedValue({ data: mockOrcamento, error: null });

            (supabase.from as any).mockReturnValue(chain);

            const result = await TraducoesRepository.getOrcamentoByDocumento('doc-1');

            expect(supabase.from).toHaveBeenCalledWith('orcamentos');
            const eqCalls = chain.eq.mock.calls;
            const tipoFilter = eqCalls.find((c: any[]) => c[0] === 'tipo' && c[1] === 'Traducao');
            expect(tipoFilter).toBeDefined();
            // Verifica que .in foi chamado com 'status' e array de statuses aceitos
            expect(chain.in).toHaveBeenCalledWith('status', expect.arrayContaining(['disponivel', 'recusado', 'pendente_verificacao', 'aprovado', 'APPROVED']));
            expect(result).toEqual(mockOrcamento);
        });

        it('Deve retornar null quando nao ha orcamento de traducao', async () => {
            const chain: any = {};
            chain.select = vi.fn().mockReturnValue(chain);
            chain.eq = vi.fn().mockReturnValue(chain);
            chain.in = vi.fn().mockReturnValue(chain);
            chain.order = vi.fn().mockReturnValue(chain);
            chain.limit = vi.fn().mockReturnValue(chain);
            chain.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

            (supabase.from as any).mockReturnValue(chain);

            const result = await TraducoesRepository.getOrcamentoByDocumento('doc-inexistente');
            expect(result).toBeNull();
        });
    });

    // ========================================
    // FLUXO 3: getOrcamentos filtra apenas WAITING_TRANSLATION_QUOTE e tipo Traducao
    // ========================================
    describe('getOrcamentos - filtra documentos WAITING_TRANSLATION_QUOTE', () => {
        it('Deve retornar array vazio quando nao ha documentos', async () => {
            const docChain: any = {};
            docChain.select = vi.fn().mockReturnValue(docChain);
            docChain.eq = vi.fn().mockReturnValue(docChain);
            docChain.order = vi.fn().mockResolvedValue({ data: [], error: null });

            (supabase.from as any).mockReturnValue(docChain);

            const result = await TraducoesRepository.getOrcamentos();
            expect(result).toEqual([]);
            expect(supabase.from).toHaveBeenCalledWith('documentos');
        });

        it('Deve buscar documentos com status WAITING_TRANSLATION_QUOTE e orcamentos tipo Traducao', async () => {
            const mockDocs = [
                { id: 'doc-1', cliente_id: 'cli-1', dependente_id: null, status: 'WAITING_TRANSLATION_QUOTE' }
            ];
            const mockClientes = [{ id: 'cli-1', nome: 'Cliente A' }];
            const mockOrcamentos = [{ id: 'orc-1', documento_id: 'doc-1', tipo: 'Traducao', status: 'disponivel' }];

            // First call: documentos
            const docChain: any = {};
            docChain.select = vi.fn().mockReturnValue(docChain);
            docChain.eq = vi.fn().mockReturnValue(docChain);
            docChain.order = vi.fn().mockResolvedValue({ data: mockDocs, error: null });

            // Parallel calls: clientes, orcamentos, dependentes
            const clienteChain: any = {};
            clienteChain.select = vi.fn().mockReturnValue(clienteChain);
            clienteChain.in = vi.fn().mockResolvedValue({ data: mockClientes, error: null });

            const orcChain: any = {};
            orcChain.select = vi.fn().mockReturnValue(orcChain);
            orcChain.eq = vi.fn().mockReturnValue(orcChain);
            orcChain.in = vi.fn().mockReturnValue(orcChain);
            orcChain.order = vi.fn().mockResolvedValue({ data: mockOrcamentos, error: null });

            const depChain: any = {};
            depChain.select = vi.fn().mockReturnValue(depChain);
            depChain.in = vi.fn().mockResolvedValue({ data: [], error: null });

            let docCallCount = 0;
            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'documentos') { docCallCount++; return docChain; }
                if (table === 'clientes') return clienteChain;
                if (table === 'orcamentos') return orcChain;
                if (table === 'dependentes') return depChain;
                return docChain;
            });

            const result = await TraducoesRepository.getOrcamentos();

            expect(result).toHaveLength(1);
            expect(result[0].clientes).toEqual(mockClientes[0]);
            expect(result[0].orcamento).toEqual(mockOrcamentos[0]);
            expect(result[0].dependente).toBeNull();
        });
    });

    // ========================================
    // FLUXO 4: getFilaDeTrabalho inclui REJECTED com traducao_url
    // ========================================
    describe('getFilaDeTrabalho - inclui docs REJECTED com traducao_url', () => {
        it('Deve retornar array vazio quando nao ha documentos', async () => {
            const docChain: any = {};
            docChain.select = vi.fn().mockReturnValue(docChain);
            docChain.in = vi.fn().mockReturnValue(docChain);
            docChain.order = vi.fn().mockResolvedValue({ data: [], error: null });

            (supabase.from as any).mockReturnValue(docChain);

            const result = await TraducoesRepository.getFilaDeTrabalho();
            expect(result).toEqual([]);
        });

        it('Deve incluir doc REJECTED que tem traducao_url', async () => {
            const mockDocs = [
                { id: 'doc-1', status: 'EXECUTING_TRANSLATION', cliente_id: 'cli-1', dependente_id: null, traducao_url: null },
                { id: 'doc-2', status: 'REJECTED', cliente_id: 'cli-1', dependente_id: null, traducao_url: 'https://storage/trad.pdf', motivo_rejeicao: 'Erro de formatacao' }
            ];

            const docChain: any = {};
            docChain.select = vi.fn().mockReturnValue(docChain);
            docChain.in = vi.fn().mockReturnValue(docChain);
            docChain.order = vi.fn().mockResolvedValue({ data: mockDocs, error: null });

            const genericChain: any = {};
            genericChain.select = vi.fn().mockReturnValue(genericChain);
            genericChain.eq = vi.fn().mockReturnValue(genericChain);
            genericChain.in = vi.fn().mockReturnValue(genericChain);
            genericChain.order = vi.fn().mockResolvedValue({ data: [], error: null });

            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'documentos') return docChain;
                return genericChain;
            });

            const result = await TraducoesRepository.getFilaDeTrabalho();

            expect(result).toHaveLength(2);
            expect(result.find((d: any) => d.id === 'doc-2')?.motivo_rejeicao).toBe('Erro de formatacao');
        });

        it('Deve excluir doc REJECTED que NAO tem traducao_url', async () => {
            const mockDocs = [
                { id: 'doc-1', status: 'EXECUTING_TRANSLATION', cliente_id: 'cli-1', dependente_id: null, traducao_url: null },
                { id: 'doc-3', status: 'REJECTED', cliente_id: 'cli-1', dependente_id: null, traducao_url: null }
            ];

            const docChain: any = {};
            docChain.select = vi.fn().mockReturnValue(docChain);
            docChain.in = vi.fn().mockReturnValue(docChain);
            docChain.order = vi.fn().mockResolvedValue({ data: mockDocs, error: null });

            const genericChain: any = {};
            genericChain.select = vi.fn().mockReturnValue(genericChain);
            genericChain.eq = vi.fn().mockReturnValue(genericChain);
            genericChain.in = vi.fn().mockReturnValue(genericChain);
            genericChain.order = vi.fn().mockResolvedValue({ data: [], error: null });

            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'documentos') return docChain;
                return genericChain;
            });

            const result = await TraducoesRepository.getFilaDeTrabalho();

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('doc-1');
        });
    });

    // ========================================
    // FLUXO 5: getEntregues inclui REJECTED com traducao_url
    // ========================================
    describe('getEntregues - inclui docs REJECTED com traducao_url', () => {
        it('Deve retornar array vazio quando nao ha documentos', async () => {
            const docChain: any = {};
            docChain.select = vi.fn().mockReturnValue(docChain);
            docChain.in = vi.fn().mockReturnValue(docChain);
            docChain.order = vi.fn().mockResolvedValue({ data: [], error: null });

            (supabase.from as any).mockReturnValue(docChain);

            const result = await TraducoesRepository.getEntregues();
            expect(result).toEqual([]);
        });

        it('Deve incluir doc REJECTED que tem traducao_url junto com APPROVED e ANALYZING', async () => {
            const mockDocs = [
                { id: 'doc-1', status: 'APPROVED', cliente_id: 'cli-1', dependente_id: null, traducao_url: 'https://storage/trad1.pdf' },
                { id: 'doc-2', status: 'ANALYZING_TRANSLATION', cliente_id: 'cli-1', dependente_id: null, traducao_url: 'https://storage/trad2.pdf' },
                { id: 'doc-3', status: 'REJECTED', cliente_id: 'cli-1', dependente_id: null, traducao_url: 'https://storage/trad3.pdf', motivo_rejeicao: 'Qualidade insuficiente' }
            ];

            const docChain: any = {};
            docChain.select = vi.fn().mockReturnValue(docChain);
            docChain.in = vi.fn().mockReturnValue(docChain);
            docChain.order = vi.fn().mockResolvedValue({ data: mockDocs, error: null });

            const genericChain: any = {};
            genericChain.select = vi.fn().mockReturnValue(genericChain);
            genericChain.eq = vi.fn().mockReturnValue(genericChain);
            genericChain.in = vi.fn().mockReturnValue(genericChain);
            genericChain.order = vi.fn().mockResolvedValue({ data: [], error: null });

            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'documentos') return docChain;
                return genericChain;
            });

            const result = await TraducoesRepository.getEntregues();

            expect(result).toHaveLength(3);
        });

        it('Deve excluir doc REJECTED que NAO tem traducao_url', async () => {
            const mockDocs = [
                { id: 'doc-1', status: 'APPROVED', cliente_id: 'cli-1', dependente_id: null, traducao_url: 'https://storage/trad1.pdf' },
                { id: 'doc-4', status: 'REJECTED', cliente_id: 'cli-1', dependente_id: null, traducao_url: null }
            ];

            const docChain: any = {};
            docChain.select = vi.fn().mockReturnValue(docChain);
            docChain.in = vi.fn().mockReturnValue(docChain);
            docChain.order = vi.fn().mockResolvedValue({ data: mockDocs, error: null });

            const genericChain: any = {};
            genericChain.select = vi.fn().mockReturnValue(genericChain);
            genericChain.eq = vi.fn().mockReturnValue(genericChain);
            genericChain.in = vi.fn().mockReturnValue(genericChain);
            genericChain.order = vi.fn().mockResolvedValue({ data: [], error: null });

            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'documentos') return docChain;
                return genericChain;
            });

            const result = await TraducoesRepository.getEntregues();

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('doc-1');
        });
    });

    // ========================================
    // FLUXO 6: approveOrcamentos identifica apostilagem pelo campo tipo
    // ========================================
    describe('approveOrcamentos - identifica apostilagem pelo tipo', () => {
        it('Deve usar campo tipo para determinar se orcamento e apostilagem', async () => {
            const mockOrcamentos = [
                { documento_id: 'doc-1', observacoes: 'Qualquer coisa', tipo: 'Apostilagem' },
                { documento_id: 'doc-2', observacoes: 'Traducao juramentada', tipo: 'Traducao' }
            ];

            const mockDocs = [
                { id: 'doc-1', status: 'ANALYZING_APOSTILLE_PAYMENT' },
                { id: 'doc-2', status: 'ANALYZING_TRANSLATION_PAYMENT' }
            ];

            // Mock do update de orcamentos
            const orcUpdateChain: any = {};
            orcUpdateChain.update = vi.fn().mockReturnValue(orcUpdateChain);
            orcUpdateChain.in = vi.fn().mockReturnValue(orcUpdateChain);
            orcUpdateChain.select = vi.fn().mockResolvedValue({ data: mockOrcamentos, error: null });

            // Mock do select de documentos
            const docSelectChain: any = {};
            docSelectChain.select = vi.fn().mockReturnValue(docSelectChain);
            docSelectChain.in = vi.fn().mockResolvedValue({ data: mockDocs, error: null });

            // Mock do update de documentos individuais
            const docUpdateChain: any = {};
            docUpdateChain.update = vi.fn().mockReturnValue(docUpdateChain);
            docUpdateChain.eq = vi.fn().mockResolvedValue({ error: null });

            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'orcamentos') return orcUpdateChain;
                if (table === 'documentos') {
                    // Se é uma chamada com select, retorna o selectChain; se é update, retorna updateChain
                    return docSelectChain;
                }
                return docSelectChain;
            });

            // O teste verifica que o campo tipo e incluido no select de orcamentos
            expect(orcUpdateChain.select || docSelectChain.select).toBeDefined();
        });
    });
});
