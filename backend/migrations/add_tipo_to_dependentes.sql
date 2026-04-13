-- Migration: Add tipo column to dependentes table
-- Allows the dependentes table to store both 'dependente' and 'titular_adicional' records
-- using a discriminator column, avoiding a separate table for titulares adicionais.
--
-- Backwards compatibility: all existing rows receive tipo = 'dependente' via the DEFAULT,
-- so no data migration (UPDATE) is needed.
--
-- Code changes required after applying this migration:
--   1. ClienteRepository.getDependentesByClienteId:
--        add .eq('tipo', 'dependente') to return only dependentes for the /dependentes API endpoint.
--        Create a parallel method getDependentesByTipo(clienteId, tipo) if needed.
--
--   2. ComercialController.updateContratoDraft (delete + reinsert loop):
--        change .delete().eq('cliente_id', ...) to
--        .delete().eq('cliente_id', ...).eq('tipo', 'dependente')
--        so titulares adicionais are not wiped when dependentes are synced.
--        Add a parallel delete + reinsert block for titulares adicionais with tipo = 'titular_adicional'.
--
--   3. ClienteRepository.createDependent:
--        add optional tipo parameter defaulting to 'dependente'.
--        OR create createTitularAdicional() that passes tipo = 'titular_adicional'.

ALTER TABLE public.dependentes
ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'dependente';

-- Enforce allowed values
ALTER TABLE public.dependentes
ADD CONSTRAINT dependentes_tipo_check
CHECK (tipo IN ('dependente', 'titular_adicional'));

-- Index to make filtering by (cliente_id, tipo) efficient
-- (the primary access pattern for both types)
CREATE INDEX IF NOT EXISTS idx_dependentes_cliente_tipo
ON public.dependentes (cliente_id, tipo);

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
