-- Migrar 'aprovado' para 'confirmado'
UPDATE agendamentos 
SET status = 'confirmado' 
WHERE status = 'aprovado';

-- Migrar 'pendente' para 'agendado'
UPDATE agendamentos 
SET status = 'agendado' 
WHERE status = 'pendente';
