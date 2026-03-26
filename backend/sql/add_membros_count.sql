-- Adição da coluna membros_count na tabela contratos_servicos
-- Ela é responsável por manter a contagem de membros de uma assessoria (Titular + N dependentes)
-- O valor padrão assumido é 1 (apenas o Titular).

ALTER TABLE public.contratos_servicos
ADD COLUMN IF NOT EXISTS membros_count integer DEFAULT 1;

-- Atualizar os contratos existentes onde membros_count for nulo
UPDATE public.contratos_servicos
SET membros_count = 1
WHERE membros_count IS NULL;

-- Após rodar o comando, o PostgREST precisa ser recarregado para limpar o schema cache.
-- Você pode usar a query abaixo no Supabase Dashboard (SQL Editor) para forçar o reload do cache PostgREST:
NOTIFY pgrst, 'reload schema';
