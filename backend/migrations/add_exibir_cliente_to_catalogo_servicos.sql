-- Migration: Add exibir_cliente to catalogo_servicos
ALTER TABLE catalogo_servicos ADD COLUMN exibir_cliente BOOLEAN DEFAULT TRUE;
