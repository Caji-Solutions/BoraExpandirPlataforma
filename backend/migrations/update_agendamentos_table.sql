ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES usuarios(id);
-- Also add a column for cliente_id if we want to link it to an existing cliente
ALTER TABLE agendamentos ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id);
