-- ============================================================
-- Migration: Boleto + Parcelamento (Consultoria e Contratos)
-- Data: 2026-03-29
-- ============================================================

-- Agendamentos (consultoria/agendavel)
ALTER TABLE agendamentos
ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT DEFAULT 'pix',
ADD COLUMN IF NOT EXISTS boleto_ativo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS boleto_valor_entrada NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS boleto_valor_parcela NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS boleto_quantidade_parcelas INTEGER,
ADD COLUMN IF NOT EXISTS boleto_dia_cobranca INTEGER,
ADD COLUMN IF NOT EXISTS boleto_entrada_aprovada_em TIMESTAMPTZ;

-- Contratos fixos
ALTER TABLE contratos_servicos
ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT DEFAULT 'pix',
ADD COLUMN IF NOT EXISTS boleto_ativo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS boleto_valor_entrada NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS boleto_valor_parcela NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS boleto_quantidade_parcelas INTEGER,
ADD COLUMN IF NOT EXISTS boleto_dia_cobranca INTEGER,
ADD COLUMN IF NOT EXISTS boleto_entrada_aprovada_em TIMESTAMPTZ;

-- Ledger de parcelas futuras (contas a receber)
CREATE TABLE IF NOT EXISTS parcelas_servicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    origem_tipo TEXT NOT NULL CHECK (origem_tipo IN ('agendamento', 'contrato')),
    origem_id UUID NOT NULL,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    servico_nome TEXT,
    pagador_nome TEXT,
    vendedor_nome TEXT,
    metodo_pagamento TEXT DEFAULT 'boleto',
    tipo_parcela TEXT NOT NULL CHECK (tipo_parcela IN ('entrada', 'parcela')),
    numero_parcela INTEGER NOT NULL DEFAULT 0,
    quantidade_parcelas INTEGER NOT NULL DEFAULT 0,
    valor_entrada NUMERIC(10, 2) NOT NULL DEFAULT 0,
    valor_parcela NUMERIC(10, 2) NOT NULL DEFAULT 0,
    valor NUMERIC(10, 2) NOT NULL DEFAULT 0,
    dia_cobranca INTEGER NOT NULL CHECK (dia_cobranca BETWEEN 1 AND 31),
    data_vencimento DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'pago', 'recusado', 'cancelado')),
    comprovante_url TEXT,
    comprovante_path TEXT,
    comprovante_nome_original TEXT,
    comprovante_upload_em TIMESTAMPTZ,
    nota_recusa TEXT,
    verificado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verificado_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_parcela_origem UNIQUE (origem_tipo, origem_id, tipo_parcela, numero_parcela)
);

CREATE INDEX IF NOT EXISTS idx_parcelas_servicos_cliente_status_venc
    ON parcelas_servicos (cliente_id, status, data_vencimento);

CREATE INDEX IF NOT EXISTS idx_parcelas_servicos_origem
    ON parcelas_servicos (origem_tipo, origem_id);

CREATE INDEX IF NOT EXISTS idx_parcelas_servicos_status
    ON parcelas_servicos (status);
