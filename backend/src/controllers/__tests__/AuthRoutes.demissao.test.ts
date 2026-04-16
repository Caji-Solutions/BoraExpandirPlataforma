import { vi, describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
    default: {
        genSalt: vi.fn().mockResolvedValue('mock-salt'),
        hash: vi.fn().mockResolvedValue('mock-hashed-password'),
        compare: vi.fn()
    }
}));

// Mock crypto
vi.mock('crypto', () => ({
    default: {
        randomUUID: vi.fn().mockReturnValue('new-uuid-123')
    }
}));

// Supabase mock com tracking de operacoes
let supabaseCallLog: Array<{ table: string; action: string; data?: any; filters?: any }> = [];
let mockResponses: {
    auth: any;
    deleteError: any;
} = {
    auth: null,
    deleteError: null
};

// Track de updates e deletes por tabela
let updateCalls: Array<{ table: string; data: any; filters: any }> = [];
let deleteCalls: Array<{ table: string; filters: any }> = [];

vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn().mockImplementation((table: string) => {
            const entry: any = { table, action: '', filters: {} };
            supabaseCallLog.push(entry);

            const chain: any = {};

            chain.select = vi.fn().mockImplementation((fields?: string) => {
                if (!entry.action) entry.action = 'select';
                entry.filters.fields = fields;
                return chain;
            });

            chain.update = vi.fn().mockImplementation((data: any) => {
                entry.action = 'update';
                entry.data = data;
                return chain;
            });

            chain.delete = vi.fn().mockImplementation(() => {
                entry.action = 'delete';
                return chain;
            });

            chain.eq = vi.fn().mockImplementation((field: string, value: any) => {
                entry.filters[field] = value;

                // Auth lookup: getUserByToken
                if (field === 'auth_token') {
                    chain.single = vi.fn().mockResolvedValue({ data: mockResponses.auth, error: null });
                    return chain;
                }

                // Update operations resolve immediately
                if (entry.action === 'update') {
                    updateCalls.push({ table, data: entry.data, filters: { ...entry.filters } });
                    return Promise.resolve({ error: null });
                }

                // Delete operations
                if (entry.action === 'delete') {
                    deleteCalls.push({ table, filters: { ...entry.filters } });
                    if (table === 'profiles' && mockResponses.deleteError) {
                        return Promise.resolve({ error: mockResponses.deleteError });
                    }
                    return Promise.resolve({ error: null });
                }

                return chain;
            });

            chain.single = vi.fn().mockImplementation(() => {
                return Promise.resolve({ data: mockResponses.auth, error: null });
            });

            return chain;
        })
    }
}));

// Import auth routes after mocks
import authRoutes from '../../routes/auth';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes - Demissao de Colaborador (DELETE /auth/team/:id)', () => {
    const adminToken = 'admin-token-123';
    const adminProfile = {
        id: 'admin-id',
        email: 'admin@test.com',
        full_name: 'Super Admin',
        role: 'super_admin',
        auth_token: adminToken
    };

    const targetUserId = 'target-user-id';

    beforeEach(() => {
        vi.clearAllMocks();
        supabaseCallLog = [];
        updateCalls = [];
        deleteCalls = [];
        mockResponses = {
            auth: adminProfile,
            deleteError: null
        };
    });

    // ========================================
    // Cenario 1: Remocao com sucesso
    // ========================================
    it('Deve remover colaborador e nullificar referencias FK', async () => {
        const res = await request(app)
            .delete(`/auth/team/${targetUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Colaborador removido com sucesso');

        // Verificar que supervisor_id foi nullificado nos subordinados
        const supervisorUpdate = updateCalls.find(
            c => c.table === 'profiles' && c.data?.supervisor_id === null
        );
        expect(supervisorUpdate).toBeTruthy();
        expect(supervisorUpdate!.filters.supervisor_id).toBe(targetUserId);

        // Verificar que usuario_id foi nullificado nos agendamentos
        const agendamentoUpdate = updateCalls.find(
            c => c.table === 'agendamentos' && c.data?.usuario_id === null
        );
        expect(agendamentoUpdate).toBeTruthy();
        expect(agendamentoUpdate!.filters.usuario_id).toBe(targetUserId);

        // Verificar que comissoes foram deletadas
        const comissaoDelete = deleteCalls.find(c => c.table === 'comissoes');
        expect(comissaoDelete).toBeTruthy();
        expect(comissaoDelete!.filters.usuario_id).toBe(targetUserId);

        // Verificar que o profile foi deletado
        const profileDelete = deleteCalls.find(c => c.table === 'profiles');
        expect(profileDelete).toBeTruthy();
        expect(profileDelete!.filters.id).toBe(targetUserId);
    });

    // ========================================
    // Cenario 2: Rejeicao sem autenticacao de Super Admin
    // ========================================
    it('Deve rejeitar remocao sem token de Super Admin', async () => {
        mockResponses.auth = null;

        const res = await request(app)
            .delete(`/auth/team/${targetUserId}`);

        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Apenas Super Admin pode remover colaboradores');
    });

    it('Deve rejeitar remocao quando role nao e super_admin', async () => {
        mockResponses.auth = {
            ...adminProfile,
            role: 'comercial'
        };

        const res = await request(app)
            .delete(`/auth/team/${targetUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(403);
    });

    // ========================================
    // Cenario 3: Auto-remocao bloqueada
    // ========================================
    it('Deve bloquear auto-remocao do admin', async () => {
        const res = await request(app)
            .delete(`/auth/team/${adminProfile.id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('não pode remover seu próprio');
    });

    // ========================================
    // Cenario 4: Erro no banco ao deletar perfil
    // ========================================
    it('Deve retornar 500 quando banco falha ao deletar perfil', async () => {
        mockResponses.deleteError = { message: 'FK violation', code: '23503' };

        const res = await request(app)
            .delete(`/auth/team/${targetUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Erro ao remover usuário');
    });

    // ========================================
    // Cenario 5: Ordem de operacoes — cleanup antes do delete
    // ========================================
    it('Deve executar cleanup de FK antes de deletar o perfil', async () => {
        await request(app)
            .delete(`/auth/team/${targetUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        // O delete do profile deve ser a ultima operacao
        const profileDeleteIndex = supabaseCallLog.findIndex(
            c => c.table === 'profiles' && c.action === 'delete'
        );
        const agendamentoUpdateIndex = supabaseCallLog.findIndex(
            c => c.table === 'agendamentos' && c.action === 'update'
        );
        const comissaoDeleteIndex = supabaseCallLog.findIndex(
            c => c.table === 'comissoes' && c.action === 'delete'
        );

        // Agendamentos e comissoes devem ser tratados ANTES do delete do profile
        expect(agendamentoUpdateIndex).toBeLessThan(profileDeleteIndex);
        expect(comissaoDeleteIndex).toBeLessThan(profileDeleteIndex);
    });
});
