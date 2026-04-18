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
        randomUUID: vi.fn().mockReturnValue('draft-uuid-123')
    }
}));

// Supabase mock com tracking de operacoes
let supabaseCallLog: Array<{ table: string; action: string; data?: any; filters?: any }> = [];
let mockResponses: {
    auth: any;
    insert: any;
    drafts: any;
    updateError: any;
    teamList: any;
} = {
    auth: null,
    insert: null,
    drafts: null,
    updateError: null,
    teamList: null
};

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

            chain.insert = vi.fn().mockImplementation((data: any) => {
                entry.action = 'insert';
                entry.data = data;
                return chain;
            });

            chain.update = vi.fn().mockImplementation((data: any) => {
                entry.action = 'update';
                entry.data = data;
                return chain;
            });

            chain.eq = vi.fn().mockImplementation((field: string, value: any) => {
                entry.filters[field] = value;

                // Auth lookup
                if (field === 'auth_token') {
                    const authArray = mockResponses.auth ? [mockResponses.auth] : [];
                    chain.then = vi.fn().mockImplementation((onFulfill: any) =>
                        Promise.resolve({ data: authArray, error: null }).then(onFulfill)
                    );
                    chain.single = vi.fn().mockResolvedValue({ data: mockResponses.auth, error: null });
                }

                // Draft query: registration_complete = false
                if (field === 'registration_complete' && value === false) {
                    chain.order = vi.fn().mockImplementation(() => {
                        chain.limit = vi.fn().mockResolvedValue({
                            data: mockResponses.drafts,
                            error: null
                        });
                        return chain;
                    });
                }

                // Update by id: profiles.update(...).eq('id', id)
                if (field === 'id' && entry.action === 'update') {
                    return Promise.resolve({ error: mockResponses.updateError || null });
                }

                return chain;
            });

            chain.or = vi.fn().mockImplementation(() => {
                // Legacy path: delegados endpoint still uses .or()
                chain.order = vi.fn().mockImplementation(() => {
                    return {
                        order: vi.fn().mockResolvedValue({
                            data: mockResponses.teamList,
                            error: null
                        })
                    };
                });
                return chain;
            });

            chain.order = vi.fn().mockImplementation(() => {
                // Team listing now chains .order().order() without .or()
                // so the second .order() must resolve with teamList data
                return {
                    order: vi.fn().mockResolvedValue({
                        data: mockResponses.teamList,
                        error: null
                    })
                };
            });

            chain.limit = vi.fn().mockImplementation(() => {
                return Promise.resolve({ data: mockResponses.drafts, error: null });
            });

            chain.single = vi.fn().mockImplementation(() => {
                if (entry.action === 'insert') {
                    return Promise.resolve(mockResponses.insert || { data: null, error: null });
                }
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

describe('Auth Routes - Fluxo de Rascunho (Draft)', () => {
    const adminToken = 'admin-token-123';
    const adminProfile = {
        id: 'admin-id',
        email: 'admin@test.com',
        full_name: 'Super Admin',
        role: 'super_admin',
        auth_token: adminToken
    };

    beforeEach(() => {
        vi.clearAllMocks();
        supabaseCallLog = [];
        mockResponses = {
            auth: adminProfile,
            insert: null,
            drafts: null,
            updateError: null,
            teamList: null
        };
    });

    // ========================================
    // POST /auth/team/draft - Criacao de Rascunho
    // ========================================
    describe('POST /auth/team/draft - Criacao de rascunho', () => {
        it('Deve criar rascunho com registration_complete=false e supervisor_id=null', async () => {
            const createdProfile = {
                id: 'draft-uuid-123',
                email: 'novo@test.com',
                full_name: 'Novo Colaborador',
                role: 'comercial',
                nivel: 'C1',
                cargo: 'C1',
                is_supervisor: false,
                supervisor_id: null,
                registration_complete: false
            };

            mockResponses.insert = { data: createdProfile, error: null };

            const res = await request(app)
                .post('/auth/team/draft')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Novo Colaborador',
                    email: 'novo@test.com',
                    password: 'senha123',
                    role: 'comercial',
                    nivel: 'C1'
                });

            expect(res.status).toBe(201);

            // Verificar que o insert contém registration_complete=false
            const insertCall = supabaseCallLog.find(c => c.action === 'insert');
            expect(insertCall).toBeTruthy();
            expect(insertCall!.data.registration_complete).toBe(false);
            expect(insertCall!.data.supervisor_id).toBeNull();
        });

        it('Deve calcular cargo corretamente para rascunho comercial C2', async () => {
            const createdProfile = {
                id: 'draft-uuid-123',
                email: 'c2@test.com',
                role: 'comercial',
                cargo: 'C2',
                registration_complete: false
            };

            mockResponses.insert = { data: createdProfile, error: null };

            const res = await request(app)
                .post('/auth/team/draft')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'C2 Draft',
                    email: 'c2@test.com',
                    password: 'senha123',
                    role: 'comercial',
                    nivel: 'C2'
                });

            expect(res.status).toBe(201);

            const insertCall = supabaseCallLog.find(c => c.action === 'insert');
            expect(insertCall!.data.cargo).toBe('C2');
        });

        it('Deve forcar is_supervisor=false para tradutor em rascunho', async () => {
            mockResponses.insert = {
                data: { id: 'draft-uuid-123', email: 'trad@test.com', role: 'tradutor', registration_complete: false },
                error: null
            };

            const res = await request(app)
                .post('/auth/team/draft')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Tradutor Draft',
                    email: 'trad@test.com',
                    password: 'senha123',
                    role: 'tradutor',
                    is_supervisor: true
                });

            expect(res.status).toBe(201);

            const insertCall = supabaseCallLog.find(c => c.action === 'insert');
            expect(insertCall!.data.is_supervisor).toBe(false);
        });

        it('Deve rejeitar criacao de rascunho sem token de Super Admin', async () => {
            mockResponses.auth = null;

            const res = await request(app)
                .post('/auth/team/draft')
                .send({
                    name: 'Hack',
                    email: 'hack@test.com',
                    password: 'senha123',
                    role: 'comercial'
                });

            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Apenas Super Admin pode registrar colaboradores');
        });

        it('Deve rejeitar criacao de rascunho quando role nao e super_admin', async () => {
            mockResponses.auth = { ...adminProfile, role: 'comercial' };

            const res = await request(app)
                .post('/auth/team/draft')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Tentativa',
                    email: 'tentativa@test.com',
                    password: 'senha123',
                    role: 'comercial'
                });

            expect(res.status).toBe(403);
        });

        it('Deve retornar 409 quando email ja existe', async () => {
            mockResponses.insert = {
                data: null,
                error: { code: '23505', message: 'duplicate key' }
            };

            const res = await request(app)
                .post('/auth/team/draft')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Duplicado',
                    email: 'existente@test.com',
                    password: 'senha123',
                    role: 'comercial'
                });

            expect(res.status).toBe(409);
            expect(res.body.error).toContain('Já existe');
        });

        it('Deve rejeitar dados invalidos (validacao)', async () => {
            const res = await request(app)
                .post('/auth/team/draft')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: '',
                    email: 'not-an-email',
                    password: '12',
                    role: ''
                });

            expect(res.status).toBe(400);
        });
    });

    // ========================================
    // GET /auth/team/draft - Recuperacao de rascunho
    // ========================================
    describe('GET /auth/team/draft - Recuperacao de rascunho pendente', () => {
        it('Deve retornar o rascunho pendente mais recente', async () => {
            const draftProfile = {
                id: 'draft-id',
                full_name: 'Rascunho Pendente',
                email: 'rascunho@test.com',
                role: 'comercial',
                registration_complete: false,
                created_at: '2026-04-16T12:00:00Z'
            };

            mockResponses.drafts = [draftProfile];

            const res = await request(app)
                .get('/auth/team/draft')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(draftProfile);
        });

        it('Deve retornar null quando nao ha rascunho pendente', async () => {
            mockResponses.drafts = [];

            const res = await request(app)
                .get('/auth/team/draft')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toBeNull();
        });
    });

    // ========================================
    // PATCH /auth/team/:id/complete - Conclusao de registro
    // ========================================
    describe('PATCH /auth/team/:id/complete - Conclusao de registro', () => {
        it('Deve atualizar registration_complete para true', async () => {
            mockResponses.updateError = null;

            const res = await request(app)
                .patch('/auth/team/draft-id/complete')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Registro completado com sucesso');

            // Verificar que o update foi feito com registration_complete=true
            const updateCall = supabaseCallLog.find(
                c => c.action === 'update' && c.data?.registration_complete === true
            );
            expect(updateCall).toBeTruthy();
        });

        it('Deve rejeitar conclusao sem token de Super Admin', async () => {
            mockResponses.auth = null;

            const res = await request(app)
                .patch('/auth/team/draft-id/complete');

            expect(res.status).toBe(403);
        });

        it('Deve retornar 500 quando banco falha ao completar', async () => {
            mockResponses.updateError = { message: 'DB error' };

            const res = await request(app)
                .patch('/auth/team/draft-id/complete')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Erro ao completar registro');
        });
    });

    // ========================================
    // GET /auth/team - Listagem inclui rascunhos
    // ========================================
    describe('GET /auth/team - Listagem inclui rascunhos', () => {
        it('Deve retornar rascunhos junto com membros ativos (sem filtro registration_complete)', async () => {
            const teamMembers = [
                { id: 'user-1', full_name: 'Ativo', role: 'comercial', registration_complete: true },
                { id: 'user-2', full_name: 'Rascunho', role: 'comercial', registration_complete: false },
                { id: 'user-3', full_name: 'Legado', role: 'juridico' }
            ];

            mockResponses.teamList = teamMembers;

            const res = await request(app)
                .get('/auth/team')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(3);

            // Rascunho deve estar presente na resposta
            const rascunho = res.body.find((m: any) => m.id === 'user-2');
            expect(rascunho).toBeTruthy();
            expect(rascunho.registration_complete).toBe(false);

            // Verificar que o select da rota /auth/team inclui registration_complete nos campos
            // (o primeiro select é do authMiddleware — precisamos do select da listagem de equipe)
            const teamSelectCall = supabaseCallLog.find(
                c => c.action === 'select' && c.table === 'profiles' && c.filters?.fields?.includes('registration_complete')
            );
            expect(teamSelectCall).toBeTruthy();
        });
    });
});
