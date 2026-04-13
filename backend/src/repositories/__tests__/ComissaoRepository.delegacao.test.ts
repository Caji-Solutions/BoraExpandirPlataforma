import { vi, describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../../config/SupabaseClient';

vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn()
    }
}));

describe('ComissaoRepository - Filtragem por delegacao C2', () => {
    let ComissaoRepository: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();
        const mod = await import('../ComissaoRepository');
        ComissaoRepository = mod.default;
    });

    const mockContratos = [
        { id: 'contrato-1', cliente_id: 'cliente-A', servico_valor: 1000 },
        { id: 'contrato-2', cliente_id: 'cliente-B', servico_valor: 2000 },
        { id: 'contrato-3', cliente_id: 'cliente-C', servico_valor: 1500 },
    ];

    function setupContratosQuery(contratos: any[], clientesData: any[]) {
        // Mock da query principal de contratos
        const contratosChain: any = {};
        contratosChain.select = vi.fn().mockReturnValue(contratosChain);
        contratosChain.eq = vi.fn().mockReturnValue(contratosChain);
        contratosChain.in = vi.fn().mockReturnValue(contratosChain);
        contratosChain.neq = vi.fn().mockReturnValue(contratosChain);
        contratosChain.or = vi.fn().mockResolvedValue({ data: contratos, error: null });

        // Mock da query de clientes para delegacao
        const clientesChain: any = {};
        clientesChain.select = vi.fn().mockReturnValue(clientesChain);
        clientesChain.in = vi.fn().mockResolvedValue({ data: clientesData, error: null });

        let callCount = 0;
        (supabase.from as any).mockImplementation((table: string) => {
            if (table === 'contratos_servicos') return contratosChain;
            if (table === 'clientes') return clientesChain;
            return contratosChain;
        });

        return { contratosChain, clientesChain };
    }

    // ========================================
    // checkDelegacao=false: sem filtragem
    // ========================================
    it('Deve retornar todos os contratos quando checkDelegacao=false', async () => {
        const { clientesChain } = setupContratosQuery(mockContratos, []);

        const result = await ComissaoRepository.getContratosAssinados('user-1', 4, 2026, false);

        // Nao deve consultar tabela de clientes quando checkDelegacao=false
        expect(clientesChain.select).not.toHaveBeenCalled();
        expect(result).toHaveLength(3);
    });

    // ========================================
    // checkDelegacao=true: exclui delegados a outro usuario
    // ========================================
    it('Deve excluir contratos de clientes delegados a outro usuario C2', async () => {
        const clientesData = [
            {
                id: 'cliente-A',
                perfil_unificado: { data: { metadata: { vendedor_c2_id: 'outro-user' } } }
            },
            {
                id: 'cliente-B',
                perfil_unificado: { data: { metadata: { vendedor_c2_id: null } } }
            },
            {
                id: 'cliente-C',
                perfil_unificado: { data: { metadata: {} } }
            },
        ];

        setupContratosQuery(mockContratos, clientesData);

        const result = await ComissaoRepository.getContratosAssinados('user-1', 4, 2026, true);

        // cliente-A delegado a 'outro-user' -> excluido
        // cliente-B sem delegacao -> incluido
        // cliente-C sem vendedor_c2_id -> incluido
        expect(result).toHaveLength(2);
        expect(result.map((c: any) => c.cliente_id)).toEqual(['cliente-B', 'cliente-C']);
    });

    // ========================================
    // checkDelegacao=true: inclui delegados ao proprio usuario
    // ========================================
    it('Deve incluir contratos de clientes delegados ao proprio usuario', async () => {
        const clientesData = [
            {
                id: 'cliente-A',
                perfil_unificado: { data: { metadata: { vendedor_c2_id: 'user-1' } } }
            },
            {
                id: 'cliente-B',
                perfil_unificado: { data: { metadata: { vendedor_c2_id: 'user-1' } } }
            },
            {
                id: 'cliente-C',
                perfil_unificado: { data: { metadata: { vendedor_c2_id: 'outro-user' } } }
            },
        ];

        setupContratosQuery(mockContratos, clientesData);

        const result = await ComissaoRepository.getContratosAssinados('user-1', 4, 2026, true);

        // cliente-A e B delegados ao user-1 -> incluidos
        // cliente-C delegado a outro -> excluido
        expect(result).toHaveLength(2);
        expect(result.map((c: any) => c.cliente_id)).toEqual(['cliente-A', 'cliente-B']);
    });

    // ========================================
    // checkDelegacao=true com lista vazia: nao deve falhar
    // ========================================
    it('Deve retornar lista vazia sem erros quando nao ha contratos', async () => {
        setupContratosQuery([], []);

        const result = await ComissaoRepository.getContratosAssinados('user-1', 4, 2026, true);

        expect(result).toHaveLength(0);
    });
});
