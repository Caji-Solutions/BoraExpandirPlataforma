-- Migration: Add foto_perfil column to clientes table
-- Created: 2026-02-17

ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS foto_perfil TEXT;

COMMENT ON COLUMN clientes.foto_perfil IS 'URL pública da foto de perfil do cliente';
