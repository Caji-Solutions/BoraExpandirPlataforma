-- Migration: Criar tabela de aceite do termo de parceiro
-- Data: 2026-03-30
-- Objetivo: Registrar o aceite do termo de parceria pelos clientes

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS "termos_aceite_parceiro" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "cliente_id" UUID NOT NULL REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "versao_termo" VARCHAR(20) NOT NULL DEFAULT '1.0',
  "aceito_em" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ip_address" VARCHAR(45),
  "criado_em" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("cliente_id", "versao_termo")
);

-- 2. Criar index para performance
CREATE INDEX IF NOT EXISTS "termos_aceite_parceiro_cliente_id_idx" ON "termos_aceite_parceiro"("cliente_id");

-- 3. Habilitar RLS
ALTER TABLE "termos_aceite_parceiro" ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS
CREATE POLICY "Clientes podem ver seus termos" ON "termos_aceite_parceiro"
    FOR SELECT
    USING (auth.role() = 'service_role' OR cliente_id = auth.uid());

CREATE POLICY "Clientes podem inserir seus termos" ON "termos_aceite_parceiro"
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role' OR cliente_id = auth.uid());
