-- Migration: Adicionar usuario_id para notificações de funcionários
-- Data: 2026-03-30
-- Objetivo: Suportar notificações tanto para clientes quanto para funcionários (profiles)

-- 1. Adicionar coluna usuario_id se não existir
ALTER TABLE "notificacoes" ADD COLUMN IF NOT EXISTS "usuario_id" UUID;

-- 2. Adicionar constraint de FK para profiles
ALTER TABLE "notificacoes"
ADD CONSTRAINT "notificacoes_usuario_id_fkey"
FOREIGN KEY ("usuario_id") REFERENCES "profiles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Criar indexes para melhor performance
CREATE INDEX IF NOT EXISTS "notificacoes_usuario_id_idx" ON "notificacoes"("usuario_id");

-- 4. Adicionar constraint para validar que não pode ter ambas (cliente_id e usuario_id) preenchidas
ALTER TABLE "notificacoes"
ADD CONSTRAINT "notificacoes_destinatario_check"
CHECK (
  (cliente_id IS NOT NULL AND usuario_id IS NULL) OR
  (cliente_id IS NULL AND usuario_id IS NOT NULL)
);

-- 5. Garantir que RLS está habilitado
ALTER TABLE "notificacoes" ENABLE ROW LEVEL SECURITY;

-- 6. Atualizar políticas RLS para suportar ambos os tipos de destinatário
DROP POLICY IF EXISTS "Users can view own notifications" ON "notificacoes";

CREATE POLICY "Clientes podem ver suas notificacoes" ON "notificacoes"
    FOR SELECT
    USING (auth.role() = 'service_role' OR cliente_id = auth.uid());

CREATE POLICY "Usuarios podem ver suas notificacoes" ON "notificacoes"
    FOR SELECT
    USING (auth.role() = 'service_role' OR usuario_id = auth.uid());
