-- Migration to fix notificacoes table schema (Idempotent & Policy-Aware)

-- 1. Handle RLS Policies that depend on usuario_id
-- We drop the policy so we can delete the column it depends on
DROP POLICY IF EXISTS "Users can view own notifications" ON "notificacoes";

-- 2. Remove old constraints to allow re-running the script
ALTER TABLE "notificacoes" DROP CONSTRAINT IF EXISTS "notificacoes_cliente_id_fkey";
ALTER TABLE "notificacoes" DROP CONSTRAINT IF EXISTS "notificacoes_criador_id_fkey";
ALTER TABLE "notificacoes" DROP CONSTRAINT IF EXISTS "notificacoes_usuario_id_fkey";

-- 3. Add new columns if they don't exist
ALTER TABLE "notificacoes" ADD COLUMN IF NOT EXISTS "cliente_id" UUID;
ALTER TABLE "notificacoes" ADD COLUMN IF NOT EXISTS "criador_id" UUID;

-- 4. Add foreign key constraints
ALTER TABLE "notificacoes" 
ADD CONSTRAINT "notificacoes_cliente_id_fkey" 
FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notificacoes" 
ADD CONSTRAINT "notificacoes_criador_id_fkey" 
FOREIGN KEY ("criador_id") REFERENCES "profiles"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Clean up: Remove the original usuario_id column which caused the FK error
ALTER TABLE "notificacoes" DROP COLUMN IF EXISTS "usuario_id";

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS "notificacoes_cliente_id_idx" ON "notificacoes"("cliente_id");
CREATE INDEX IF NOT EXISTS "notificacoes_criador_id_idx" ON "notificacoes"("criador_id");

-- 7. Re-create the security policy using the new cliente_id
-- This ensures clients can only see notifications sent to them
CREATE POLICY "Users can view own notifications" ON "notificacoes"
    FOR SELECT
    USING (auth.uid() = cliente_id);

-- 8. Ensure RLS is enabled
ALTER TABLE "notificacoes" ENABLE ROW LEVEL SECURITY;
