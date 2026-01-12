-- Migration: Adicionar coluna responsavel_juridico_id na tabela clientes
-- Esta coluna será um UUID que referencia um funcionário da tabela profiles com role 'juridico'
-- Valor padrão: NULL (indica "vago" - sem responsável designado)

-- Adicionar a coluna
ALTER TABLE "clientes" 
ADD COLUMN IF NOT EXISTS "responsavel_juridico_id" UUID DEFAULT NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS "clientes_responsavel_juridico_id_idx" 
ON "clientes"("responsavel_juridico_id");

-- Opcional: Adicionar Foreign Key para a tabela profiles (descomente se necessário)
-- ALTER TABLE "clientes" 
-- ADD CONSTRAINT "clientes_responsavel_juridico_id_fkey" 
-- FOREIGN KEY ("responsavel_juridico_id") REFERENCES "profiles"("id") 
-- ON DELETE SET NULL ON UPDATE CASCADE;

-- Comentário explicativo
COMMENT ON COLUMN "clientes"."responsavel_juridico_id" IS 'ID do funcionário do jurídico responsável pelo cliente. NULL significa vago/não designado.';
