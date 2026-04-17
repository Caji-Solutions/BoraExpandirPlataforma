-- Migration: Add lead_notes column to clientes table
-- Task: Task_003 - Fix Lead Notes Feature
-- Date: 2026-04-17
--
-- This column stores lead notes as a JSONB array, separate from notas_juridico.
-- Each element in the array has the shape:
--   {
--     "id": "uuid",
--     "texto": "Nota do lead",
--     "autor_id": "uuid",
--     "autor_nome": "Nome do Autor",
--     "autor_setor": "comercial",
--     "created_at": "2026-04-17T10:00:00Z"
--   }

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS lead_notes JSONB DEFAULT '[]';
