-- Migration: Add 'em_consultoria' value to cliente_stage ENUM
-- Created: 2026-03-29
-- Reason: The "Iniciar Consultoria" feature needs to set stage to 'em_consultoria'
-- to reflect the timeline status change from 'aguardando_consultoria' to 'em_consultoria'

ALTER TYPE cliente_stage ADD VALUE IF NOT EXISTS 'em_consultoria' AFTER 'aguardando_consultoria';
