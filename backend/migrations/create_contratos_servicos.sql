-- Migration: Create contratos_servicos table for fixed services
CREATE TABLE IF NOT EXISTS contratos_servicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    servico_id UUID REFERENCES catalogo_servicos(id) ON DELETE SET NULL,
    servico_nome TEXT,
    servico_valor NUMERIC(10, 2) DEFAULT 0,
    cliente_nome TEXT,
    cliente_email TEXT,
    cliente_telefone TEXT,
    assinatura_status TEXT DEFAULT 'pendente',
    assinatura_upload_origem TEXT,
    assinatura_upload_por TEXT,
    assinatura_upload_em TIMESTAMPTZ,
    assinatura_aprovado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assinatura_aprovado_em TIMESTAMPTZ,
    assinatura_recusado_em TIMESTAMPTZ,
    assinatura_recusa_nota TEXT,
    contrato_assinado_url TEXT,
    contrato_assinado_path TEXT,
    contrato_assinado_nome_original TEXT,
    pagamento_status TEXT DEFAULT 'pendente',
    pagamento_comprovante_url TEXT,
    pagamento_comprovante_path TEXT,
    pagamento_comprovante_nome_original TEXT,
    pagamento_comprovante_upload_em TIMESTAMPTZ,
    pagamento_verificado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
    pagamento_verificado_em TIMESTAMPTZ,
    pagamento_nota_recusa TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contratos_servicos_cliente ON contratos_servicos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_servicos_assinatura_status ON contratos_servicos(assinatura_status);
CREATE INDEX IF NOT EXISTS idx_contratos_servicos_pagamento_status ON contratos_servicos(pagamento_status);
