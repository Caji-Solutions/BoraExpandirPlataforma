import { vi, describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../../config/SupabaseClient';

vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn()
    }
}));

describe('ComissaoRepository - fecharComissoesMensais', () => {
    let ComissaoRepository: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();
        const mod = await import('../ComissaoRepository');
        ComissaoRepository = mod.default;
    });

    it('Deve atualizar comissoes de estimado para fechado no mes/ano correto', async () => {
        const chain: any = {};
        chain.update = vi.fn().mockReturnValue(chain);
        chain.eq = vi.fn().mockReturnValue(chain);
        // O ultimo eq resolve a promise (supabase PromiseLike)
        let eqCallCount = 0;
        chain.eq = vi.fn().mockImplementation(() => {
            eqCallCount++;
            if (eqCallCount >= 3) {
                // Retorna um thenable para o await
                return Promise.resolve({ error: null });
            }
            return chain;
        });

        (supabase.from as any).mockReturnValue(chain);

        const result = await ComissaoRepository.fecharComissoesMensais(2, 2026);

        expect(result).toBe(true);
        expect(supabase.from).toHaveBeenCalledWith('comissoes');
        expect(chain.update).toHaveBeenCalledWith({ status: 'fechado' });
    });

    it('Deve lancar erro se supabase retornar erro', async () => {
        const mockError = { message: 'DB error', code: '500' };
        const chain: any = {};
        chain.update = vi.fn().mockReturnValue(chain);
        let eqCallCount = 0;
        chain.eq = vi.fn().mockImplementation(() => {
            eqCallCount++;
            if (eqCallCount >= 3) {
                return Promise.resolve({ error: mockError });
            }
            return chain;
        });

        (supabase.from as any).mockReturnValue(chain);

        await expect(ComissaoRepository.fecharComissoesMensais(2, 2026)).rejects.toEqual(mockError);
    });
});
