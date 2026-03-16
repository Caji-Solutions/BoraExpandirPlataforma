-- Migration: Add tipo to catalogo_servicos
ALTER TABLE public.catalogo_servicos
ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'agendavel';

-- Backfill nulls just in case
UPDATE public.catalogo_servicos
SET tipo = 'agendavel'
WHERE tipo IS NULL;

-- Optional index for filtering
CREATE INDEX IF NOT EXISTS idx_catalogo_servicos_tipo ON public.catalogo_servicos(tipo);
