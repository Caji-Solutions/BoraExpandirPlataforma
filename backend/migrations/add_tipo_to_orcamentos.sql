-- Migration: Add tipo column to orcamentos table
-- Purpose: Distinguish between translation budgets (Traducao) and apostilamento budgets (Apostilagem)
-- This fixes the issue where apostilamento budgets appeared on the translator's dashboard

-- Create enum type
CREATE TYPE orcamento_tipo AS ENUM ('Traducao', 'Apostilagem');

-- Add column with default value
ALTER TABLE orcamentos ADD COLUMN tipo orcamento_tipo DEFAULT 'Traducao';

-- Update existing records: apostilamento budgets are identified by their observacoes field
UPDATE orcamentos SET tipo = 'Apostilagem' WHERE observacoes LIKE '%Apostilamento%';
UPDATE orcamentos SET tipo = 'Traducao' WHERE observacoes NOT LIKE '%Apostilamento%' OR observacoes IS NULL;
