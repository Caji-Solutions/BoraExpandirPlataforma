-- ============================================================
-- Migration: Modulo de Comissoes e Contratos
-- Data: 2026-03-25
-- ============================================================

-- 1. Adicionar campos de hierarquia ao profiles (se nao existirem)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cargo TEXT CHECK (cargo IN ('C1', 'C2', 'HEAD'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES profiles(id);

-- 2. Tabela de metas comerciais
CREATE TABLE IF NOT EXISTS metas_comerciais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nivel TEXT NOT NULL CHECK (nivel IN ('C1', 'C2', 'HEAD')),
  meta_num INTEGER NOT NULL CHECK (meta_num BETWEEN 1 AND 4),
  min_vendas INTEGER NOT NULL DEFAULT 0,
  max_vendas INTEGER,
  valor_comissao_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_faturamento_eur NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_faturamento_eur NUMERIC(12,2),
  pct_comissao_faturamento NUMERIC(5,2) NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(nivel, meta_num)
);

-- 3. Tabela de historico de cambio EUR/BRL
CREATE TABLE IF NOT EXISTS historico_cambio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  moeda_origem TEXT NOT NULL DEFAULT 'EUR',
  moeda_destino TEXT NOT NULL DEFAULT 'BRL',
  valor NUMERIC(10,4) NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historico_cambio_criado_em ON historico_cambio(criado_em DESC);

-- 4. Adicionar novos status aos contratos_servicos
-- Os status sao armazenados como text, entao basta usar os novos valores
-- Novos status: CANCELADO, MULTADO, AGUARDANDO_VALIDACAO, INVALIDO

-- 5. Campos adicionais para contratos (cancelamento/multas)
ALTER TABLE contratos_servicos ADD COLUMN IF NOT EXISTS status_contrato TEXT DEFAULT 'ATIVO';
ALTER TABLE contratos_servicos ADD COLUMN IF NOT EXISTS justificativa_invalidacao TEXT;
ALTER TABLE contratos_servicos ADD COLUMN IF NOT EXISTS invalidado_por UUID;
ALTER TABLE contratos_servicos ADD COLUMN IF NOT EXISTS invalidado_em TIMESTAMPTZ;
ALTER TABLE contratos_servicos ADD COLUMN IF NOT EXISTS cancelado_por UUID;
ALTER TABLE contratos_servicos ADD COLUMN IF NOT EXISTS cancelado_em TIMESTAMPTZ;
ALTER TABLE contratos_servicos ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT;
ALTER TABLE contratos_servicos ADD COLUMN IF NOT EXISTS multa_valor NUMERIC(10,2);
ALTER TABLE contratos_servicos ADD COLUMN IF NOT EXISTS multa_comprovante_url TEXT;
ALTER TABLE contratos_servicos ADD COLUMN IF NOT EXISTS multa_upload_em TIMESTAMPTZ;
ALTER TABLE contratos_servicos ADD COLUMN IF NOT EXISTS multa_status TEXT CHECK (multa_status IN ('pendente', 'comprovante_enviado', 'pago', 'isento'));

-- 6. Tabela de comissoes calculadas (historico mensal)
CREATE TABLE IF NOT EXISTS comissoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES profiles(id),
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('vendas', 'faturamento', 'assessoria')),
  total_vendas INTEGER DEFAULT 0,
  total_faturado_eur NUMERIC(12,2) DEFAULT 0,
  meta_atingida INTEGER,
  valor_comissao_eur NUMERIC(12,2) DEFAULT 0,
  valor_comissao_brl NUMERIC(12,2) DEFAULT 0,
  taxa_cambio NUMERIC(10,4),
  calculado_em TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'estimado' CHECK (status IN ('estimado', 'fechado', 'pago')),
  UNIQUE(usuario_id, mes, ano, tipo)
);

-- 7. Seeds iniciais para metas (C1)
INSERT INTO metas_comerciais (nivel, meta_num, min_vendas, max_vendas, valor_comissao_eur, min_faturamento_eur, max_faturamento_eur, pct_comissao_faturamento)
VALUES
  ('C1', 1, 1, 5, 50, 0, 5000, 2),
  ('C1', 2, 6, 10, 75, 5001, 10000, 3),
  ('C1', 3, 11, 20, 100, 10001, 20000, 4),
  ('C1', 4, 21, NULL, 150, 20001, NULL, 5)
ON CONFLICT (nivel, meta_num) DO NOTHING;

-- Seeds para metas (C2)
INSERT INTO metas_comerciais (nivel, meta_num, min_vendas, max_vendas, valor_comissao_eur, min_faturamento_eur, max_faturamento_eur, pct_comissao_faturamento)
VALUES
  ('C2', 1, 1, 5, 60, 0, 5000, 2.5),
  ('C2', 2, 6, 10, 90, 5001, 10000, 3.5),
  ('C2', 3, 11, 20, 120, 10001, 20000, 4.5),
  ('C2', 4, 21, NULL, 180, 20001, NULL, 6)
ON CONFLICT (nivel, meta_num) DO NOTHING;

-- Seeds para metas (HEAD)
INSERT INTO metas_comerciais (nivel, meta_num, min_vendas, max_vendas, valor_comissao_eur, min_faturamento_eur, max_faturamento_eur, pct_comissao_faturamento)
VALUES
  ('HEAD', 1, 1, 10, 40, 0, 10000, 1.5),
  ('HEAD', 2, 11, 25, 60, 10001, 25000, 2.5),
  ('HEAD', 3, 26, 50, 80, 25001, 50000, 3.5),
  ('HEAD', 4, 51, NULL, 120, 50001, NULL, 5)
ON CONFLICT (nivel, meta_num) DO NOTHING;
