-- Migration: Add Autentique document tracking fields to contratos_servicos
ALTER TABLE contratos_servicos
ADD COLUMN IF NOT EXISTS autentique_document_id TEXT;

ALTER TABLE contratos_servicos
ADD COLUMN IF NOT EXISTS empresa_assinado_em TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_contratos_servicos_autentique
ON contratos_servicos(autentique_document_id);
