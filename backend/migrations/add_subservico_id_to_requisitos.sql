-- Migration: Associate document requirements with subservices
-- This allows documents to be managed at the subservice level instead of only at the service level.
-- The column is nullable to maintain backward compatibility with existing data.

ALTER TABLE servico_requisitos
ADD COLUMN IF NOT EXISTS subservico_id UUID REFERENCES subservicos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_servico_requisitos_subservico 
ON servico_requisitos(subservico_id);
