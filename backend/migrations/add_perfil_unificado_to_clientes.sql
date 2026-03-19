-- Adicionando perfil_unificado para unificação do DNA do cliente
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS perfil_unificado JSONB DEFAULT '{}'::jsonb;
