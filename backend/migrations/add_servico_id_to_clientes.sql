-- Migration: Add servico_id to clientes table
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS servico_id UUID REFERENCES catalogo_servicos(id);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_clientes_servico_id ON clientes(servico_id);

COMMENT ON COLUMN clientes.servico_id IS 'ID do serviço que o cliente irá realizar (do catálogo de serviços)';
