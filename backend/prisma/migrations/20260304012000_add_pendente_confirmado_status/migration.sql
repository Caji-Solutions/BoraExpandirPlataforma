-- Atualizar constraint de status dos agendamentos para incluir 'pendente' e 'confirmado'
-- O fluxo correto é: pendente -> confirmado (após formulário preenchido) -> agendado -> realizado/cancelado

ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_status_valid;

ALTER TABLE agendamentos ADD CONSTRAINT agendamentos_status_valid
  CHECK (status IN ('pendente', 'agendado', 'confirmado', 'realizado', 'cancelado'));
