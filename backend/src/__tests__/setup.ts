import { vi, afterEach } from 'vitest';

// Variaveis de ambiente dummy para testes
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.AUTENTIQUE_TOKEN = 'test-autentique-token';
process.env.AUTENTIQUE_COMPANY_EMAIL = 'empresa@test.com';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';

// Limpar todos os mocks depois de cada teste para garantir isolamento
afterEach(() => {
  vi.clearAllMocks();
});
