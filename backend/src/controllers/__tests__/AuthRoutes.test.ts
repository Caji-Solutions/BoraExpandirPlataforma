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
let mockResponses: { auth: any; insert: any; select: any; update: any; delegados: any } = {
    auth: null,
    insert: null,
    select: null,
    update: null,
    delegados: null
};

vi.mock('../../config/SupabaseClient', () => ({
    supabase: {
        from: vi.fn().mockImplementation((table: string) => {
            const entry: any = { table, action: '', filters: {} };
            supabaseCallLog.push(entry);

            const chain: any = {};

            chain.select = vi.fn().mockImplementation((fields?: string) => {
                // Nao sobrescrever action se ja foi definido (ex: insert().select())
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

                // Auth lookup: profiles.eq('auth_token', token).single()
                if (field === 'auth_token') {
                    chain.single = vi.fn().mockResolvedValue({ data: mockResponses.auth, error: null });
                }

                // Delegados: profiles.eq('supervisor_id', id).order(...)
                if (field === 'supervisor_id') {
                    chain.order = vi.fn().mockResolvedValue({
                        data: mockResponses.delegados,
                        error: null
                    });
                }

                // Update by id: profiles.update(...).eq('id', id) -> resolve
                if (field === 'id' && entry.action === 'update') {
                    return Promise.resolve({ error: mockResponses.update?.error || null });
                }

                return chain;
            });

            chain.order = vi.fn().mockImplementation(() => {
                return chain;
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

describe('Auth Routes - Supervisor e Cargo', () => {
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
            select: null,
            update: null,
            delegados: null
        };
    });

    describe('POST /auth/register - determineCargo automatico', () => {
        it('Deve calcular cargo=HEAD quando comercial com is_supervisor=true', async () => {
            const createdProfile = {
                id: 'new-uuid-123',
                email: 'supervisor@test.com',
                full_name: 'Supervisor Head',
                role: 'comercial',
                nivel: 'C2',
                is_supervisor: true,
                cargo: 'HEAD',
                supervisor_id: null
            };

            mockResponses.insert = { data: createdProfile, error: null };

            const res = await request(app)
                .post('/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Supervisor Head',
                    email: 'supervisor@test.com',
                    password: 'senha123',
                    role: 'comercial',
                    nivel: 'C2',
                    is_supervisor: true
                });

            expect(res.status).toBe(201);

            // Verificar que o insert foi chamado com cargo=HEAD
            const insertCall = supabaseCallLog.find(c => c.action === 'insert');
            expect(insertCall).toBeTruthy();
            expect(insertCall!.data.cargo).toBe('HEAD');
            expect(insertCall!.data.is_supervisor).toBe(true);
        });

        it('Deve calcular cargo=C2 quando comercial nivel C2 sem supervisor', async () => {
            const createdProfile = {
                id: 'new-uuid-123',
                email: 'c2@test.com',
                full_name: 'Comercial C2',
                role: 'comercial',
                nivel: 'C2',
                is_supervisor: false,
                cargo: 'C2',
                supervisor_id: 'supervisor-id'
            };

            mockResponses.insert = { data: createdProfile, error: null };

            const res = await request(app)
                .post('/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Comercial C2',
                    email: 'c2@test.com',
                    password: 'senha123',
                    role: 'comercial',
                    nivel: 'C2',
                    is_supervisor: false,
                    supervisor_id: 'supervisor-id'
                });

            expect(res.status).toBe(201);

            const insertCall = supabaseCallLog.find(c => c.action === 'insert');
            expect(insertCall!.data.cargo).toBe('C2');
            expect(insertCall!.data.supervisor_id).toBe('supervisor-id');
        });

        it('Deve calcular cargo=C1 quando comercial sem nivel definido', async () => {
            mockResponses.insert = {
                data: { id: 'new-uuid-123', email: 'c1@test.com', role: 'comercial', cargo: 'C1' },
                error: null
            };

            const res = await request(app)
                .post('/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Comercial C1',
                    email: 'c1@test.com',
                    password: 'senha123',
                    role: 'comercial'
                });

            expect(res.status).toBe(201);

            const insertCall = supabaseCallLog.find(c => c.action === 'insert');
            expect(insertCall!.data.cargo).toBe('C1');
        });

        it('Deve calcular cargo=null para roles nao-comerciais', async () => {
            mockResponses.insert = {
                data: { id: 'new-uuid-123', email: 'jur@test.com', role: 'juridico', cargo: null },
                error: null
            };

            const res = await request(app)
                .post('/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Juridico User',
                    email: 'jur@test.com',
                    password: 'senha123',
                    role: 'juridico',
                    is_supervisor: true
                });

            expect(res.status).toBe(201);

            const insertCall = supabaseCallLog.find(c => c.action === 'insert');
            expect(insertCall!.data.cargo).toBeNull();
        });

        it('Deve forcar is_supervisor=false para tradutor', async () => {
            mockResponses.insert = {
                data: { id: 'new-uuid-123', email: 'trad@test.com', role: 'tradutor' },
                error: null
            };

            const res = await request(app)
                .post('/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Tradutor',
                    email: 'trad@test.com',
                    password: 'senha123',
                    role: 'tradutor',
                    is_supervisor: true // Deve ser ignorado
                });

            expect(res.status).toBe(201);

            const insertCall = supabaseCallLog.find(c => c.action === 'insert');
            expect(insertCall!.data.is_supervisor).toBe(false);
        });

        it('Deve rejeitar registro sem autenticacao de Super Admin', async () => {
            mockResponses.auth = null; // Nenhum perfil encontrado

            const res = await request(app)
                .post('/auth/register')
                .send({
                    name: 'Hacker',
                    email: 'hack@test.com',
                    password: 'senha123',
                    role: 'comercial'
                });

            expect(res.status).toBe(403);
        });
    });

    describe('PATCH /auth/team/:id - cargo recalculado ao editar', () => {
        it('Deve recalcular cargo ao alterar nivel e supervisor', async () => {
            mockResponses.update = { error: null };

            const res = await request(app)
                .patch('/auth/team/user-123')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Comercial Promovido',
                    role: 'comercial',
                    nivel: 'C2',
                    is_supervisor: true,
                    supervisor_id: null
                });

            expect(res.status).toBe(200);

            const updateCall = supabaseCallLog.find(c => c.action === 'update');
            expect(updateCall).toBeTruthy();
            expect(updateCall!.data.cargo).toBe('HEAD');
            expect(updateCall!.data.is_supervisor).toBe(true);
            expect(updateCall!.data.supervisor_id).toBeNull();
        });

        it('Deve salvar supervisor_id ao vincular subordinado', async () => {
            mockResponses.update = { error: null };

            const res = await request(app)
                .patch('/auth/team/user-456')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Subordinado C1',
                    role: 'comercial',
                    nivel: 'C1',
                    is_supervisor: false,
                    supervisor_id: 'head-user-id'
                });

            expect(res.status).toBe(200);

            const updateCall = supabaseCallLog.find(c => c.action === 'update');
            expect(updateCall!.data.cargo).toBe('C1');
            expect(updateCall!.data.supervisor_id).toBe('head-user-id');
        });
    });

    describe('GET /auth/team/delegados/:supervisorId', () => {
        it('Deve retornar lista de delegados filtrados por supervisor_id', async () => {
            const mockDelegados = [
                { id: 'd1', full_name: 'Ana', email: 'ana@t.com', role: 'comercial', nivel: 'C1', cargo: 'C1' },
                { id: 'd2', full_name: 'Bruno', email: 'bruno@t.com', role: 'comercial', nivel: 'C2', cargo: 'C2' }
            ];

            mockResponses.delegados = mockDelegados;

            const res = await request(app)
                .get('/auth/team/delegados/supervisor-abc');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockDelegados);

            // Verificar que filtrou por supervisor_id
            const selectCall = supabaseCallLog.find(c => c.action === 'select');
            expect(selectCall).toBeTruthy();
            expect(selectCall!.filters.supervisor_id).toBe('supervisor-abc');
        });

        it('Deve retornar array vazio quando supervisor nao tem delegados', async () => {
            mockResponses.delegados = [];

            const res = await request(app)
                .get('/auth/team/delegados/no-one');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });
    });
});
