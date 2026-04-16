-- Migration: Fix FK constraints for safe profile deletion (demissao)
-- Quando um colaborador e removido, seus produtos de trabalho (agendamentos,
-- comissoes, contratos, parcelas) permanecem no sistema.
-- Apenas a referencia ao colaborador e anulada (SET NULL).

-- 1. comissoes.usuario_id: remover NOT NULL + adicionar ON DELETE SET NULL
--    Historico de comissoes deve sobreviver a demissao do colaborador.
ALTER TABLE comissoes ALTER COLUMN usuario_id DROP NOT NULL;
ALTER TABLE comissoes DROP CONSTRAINT IF EXISTS comissoes_usuario_id_fkey;
ALTER TABLE comissoes ADD CONSTRAINT comissoes_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. agendamentos.usuario_id: adicionar ON DELETE SET NULL
--    Agendamentos criados pelo colaborador continuam ativos.
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_usuario_id_fkey;
ALTER TABLE agendamentos ADD CONSTRAINT agendamentos_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 3. profiles.supervisor_id: adicionar ON DELETE SET NULL
--    Subordinados ficam temporariamente sem supervisor (tratado via modal no frontend).
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_supervisor_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_supervisor_id_fkey
  FOREIGN KEY (supervisor_id) REFERENCES profiles(id) ON DELETE SET NULL;
