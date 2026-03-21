-- Adiciona a coluna meet_link na tabela agendamentos
ALTER TABLE agendamentos
ADD COLUMN IF NOT EXISTS meet_link VARCHAR(255);
