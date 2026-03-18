-- Migration: Add draft fields to contratos_servicos
ALTER TABLE contratos_servicos
ADD COLUMN IF NOT EXISTS etapa_fluxo INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS draft_dados JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS contrato_gerado_url TEXT;

-- Create index for faster querying of drafts vs final contracts
CREATE INDEX IF NOT EXISTS idx_contratos_servicos_is_draft ON contratos_servicos(is_draft);
