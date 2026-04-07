-- Migration: Add nao_agendavel column to catalogo_servicos
-- Purpose: Distinguish "assessorias agendaveis" (existing) from "assessorias nao agendaveis" (Assessoria Direta)
-- IMPORTANT: This does NOT modify existing is_agendavel or tipo logic

ALTER TABLE catalogo_servicos
ADD COLUMN IF NOT EXISTS nao_agendavel BOOLEAN DEFAULT false;

COMMENT ON COLUMN catalogo_servicos.nao_agendavel IS 'When true, service is a non-schedulable advisory (Assessoria Direta). Only applies to tipo=fixo services.';
