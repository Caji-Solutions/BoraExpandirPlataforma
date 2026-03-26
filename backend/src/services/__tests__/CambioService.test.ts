import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '../../config/SupabaseClient';

vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn()
    }
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('CambioService', () => {
    let CambioService: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();
        vi.useRealTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    async function importFreshService() {
        const mod = await import('../CambioService');
        return mod.default;
    }

    describe('salvarHistorico - persistencia apenas no dia 15', () => {
        it('Deve salvar no historico quando o dia e 15', async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 2, 15, 10, 0, 0)); // 15 de Marco

            const insertMock = vi.fn().mockResolvedValue({ error: null });
            const selectMock = vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({ data: [], error: null })
                    })
                })
            });

            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'historico_cambio') {
                    return {
                        insert: insertMock,
                        select: selectMock
                    };
                }
                return {};
            });

            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ EURBRL: { bid: '6.25' } })
            });

            CambioService = await importFreshService();
            await CambioService.fetchCotacao();

            expect(insertMock).toHaveBeenCalledWith([expect.objectContaining({
                moeda_origem: 'EUR',
                moeda_destino: 'BRL',
                valor: 6.25
            })]);
        });

        it('Nao deve salvar no historico quando o dia e diferente de 15', async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 2, 20, 10, 0, 0)); // 20 de Marco

            const insertMock = vi.fn();

            (supabase.from as any).mockImplementation(() => ({
                insert: insertMock
            }));

            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ EURBRL: { bid: '6.25' } })
            });

            CambioService = await importFreshService();
            await CambioService.fetchCotacao();

            expect(insertMock).not.toHaveBeenCalled();
        });
    });

    describe('rotacionarHistorico - limite de 12 registros', () => {
        it('Deve excluir registros excedentes quando ha mais de 12', async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 2, 15, 10, 0, 0)); // Dia 15

            const registros15 = Array.from({ length: 15 }, (_, i) => ({ id: `reg-${i}` }));
            const idsParaExcluir = registros15.slice(12).map(r => r.id); // reg-12, reg-13, reg-14

            const deleteMock = vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({ error: null })
            });

            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'historico_cambio') {
                    return {
                        insert: vi.fn().mockResolvedValue({ error: null }),
                        select: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                eq: vi.fn().mockReturnValue({
                                    order: vi.fn().mockResolvedValue({ data: registros15, error: null })
                                })
                            })
                        }),
                        delete: deleteMock
                    };
                }
                return {};
            });

            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ EURBRL: { bid: '6.25' } })
            });

            CambioService = await importFreshService();
            await CambioService.fetchCotacao();

            expect(deleteMock).toHaveBeenCalled();
            const inCall = deleteMock.mock.results[0].value.in;
            expect(inCall).toHaveBeenCalledWith('id', idsParaExcluir);
        });

        it('Nao deve excluir nada quando ha 12 ou menos registros', async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 2, 15, 10, 0, 0));

            const registros10 = Array.from({ length: 10 }, (_, i) => ({ id: `reg-${i}` }));

            const deleteMock = vi.fn();

            (supabase.from as any).mockImplementation((table: string) => {
                if (table === 'historico_cambio') {
                    return {
                        insert: vi.fn().mockResolvedValue({ error: null }),
                        select: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                eq: vi.fn().mockReturnValue({
                                    order: vi.fn().mockResolvedValue({ data: registros10, error: null })
                                })
                            })
                        }),
                        delete: deleteMock
                    };
                }
                return {};
            });

            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ EURBRL: { bid: '6.25' } })
            });

            CambioService = await importFreshService();
            await CambioService.fetchCotacao();

            expect(deleteMock).not.toHaveBeenCalled();
        });
    });

    describe('getCotacaoAtual - cache e fallback', () => {
        it('Deve usar taxa padrao 6.0 quando API e banco falham', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            // Fallback DB tambem falha
            const chain: any = {};
            chain.select = vi.fn().mockReturnValue(chain);
            chain.eq = vi.fn().mockReturnValue(chain);
            chain.order = vi.fn().mockReturnValue(chain);
            chain.limit = vi.fn().mockReturnValue(chain);
            chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

            (supabase.from as any).mockReturnValue(chain);

            CambioService = await importFreshService();
            const taxa = await CambioService.getCotacaoAtual();

            expect(taxa).toBe(6.0);
        });

        it('Deve retornar cotacao do banco quando API falha mas banco tem dados', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const chain: any = {};
            chain.select = vi.fn().mockReturnValue(chain);
            chain.eq = vi.fn().mockReturnValue(chain);
            chain.order = vi.fn().mockReturnValue(chain);
            chain.limit = vi.fn().mockReturnValue(chain);
            chain.maybeSingle = vi.fn().mockResolvedValue({ data: { valor: '5.85' }, error: null });

            (supabase.from as any).mockReturnValue(chain);

            CambioService = await importFreshService();
            const taxa = await CambioService.getCotacaoAtual();

            expect(taxa).toBe(5.85);
        });
    });

    describe('convertEurToBrl', () => {
        it('Deve converter corretamente com arredondamento de 2 casas', async () => {
            CambioService = await importFreshService();
            expect(CambioService.convertEurToBrl(100, 6.25)).toBe(625.00);
            expect(CambioService.convertEurToBrl(33.33, 5.99)).toBe(199.65);
        });
    });
});
