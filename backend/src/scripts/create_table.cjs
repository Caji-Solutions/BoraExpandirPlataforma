const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
    const sql = `
CREATE TABLE IF NOT EXISTS public.formularios_clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE CASCADE,

    -- Pessoal
    nome_completo VARCHAR(255),
    email VARCHAR(255),
    whatsapp VARCHAR(50),
    data_nascimento DATE,
    nacionalidade VARCHAR(100),
    estado_civil VARCHAR(50),

    -- Documentos
    cpf VARCHAR(50),
    passaporte VARCHAR(100),
    pais_residencia VARCHAR(100),

    -- Família
    tem_filhos BOOLEAN DEFAULT false,
    quantidade_filhos INTEGER DEFAULT 0,
    idades_filhos VARCHAR(255),

    -- Profissional
    profissao VARCHAR(255),
    escolaridade VARCHAR(100),
    experiencia_exterior TEXT,
    empresa_exterior VARCHAR(255),

    -- Imigração
    objetivo_imigracao VARCHAR(255),
    pais_destino VARCHAR(100),
    prazo_mudanca VARCHAR(100),
    ja_tem_visto BOOLEAN DEFAULT false,
    tipo_visto VARCHAR(100),
    pretende_trabalhar VARCHAR(100),
    area_trabalho VARCHAR(255),

    -- Financeiro & Extra
    renda_mensal VARCHAR(100),
    possui_reserva VARCHAR(100),
    observacoes TEXT,
    como_conheceu VARCHAR(255),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS e Politicas
ALTER TABLE public.formularios_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura total para todos" ON public.formularios_clientes FOR SELECT USING (true);
CREATE POLICY "Permitir inserção total para o service role" ON public.formularios_clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização total" ON public.formularios_clientes FOR UPDATE USING (true);
`;
    console.log('Criando tabela formularios_clientes...');

    // Using supabase.rpc is best if we have an RPC function to execute arbitrary SQL, or we can use another method.
    // Usually Supabase js doesn't allow executing DDL queries from the standard API due to PostgREST limitations.
    console.log('AVISO: O Supabase via API REST não permite a execução direta de comandos DDL (CREATE TABLE).');
    console.log('O comando SQL acima deve ser colado no SQL Editor do Supabase.');
}

createTable();
