-- Adiciona a coluna email_reminders_count na tabela agendamentos
-- Usada pelo cron job para controlar rate limiting de emails de lembrete de formulário (máximo 3 por agendamento)
ALTER TABLE agendamentos
ADD COLUMN IF NOT EXISTS email_reminders_count INTEGER NOT NULL DEFAULT 0;
