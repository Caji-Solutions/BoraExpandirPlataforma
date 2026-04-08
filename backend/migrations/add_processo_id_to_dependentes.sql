-- Migration: Add processo_id to dependentes table
-- To associate dependents with a specific juridical process

ALTER TABLE public.dependentes 
ADD COLUMN IF NOT EXISTS processo_id UUID REFERENCES public.processos(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_dependentes_processo_id ON public.dependentes(processo_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
