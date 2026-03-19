-- Migration to add translation columns to documentos table
ALTER TABLE public.documentos 
ADD COLUMN IF NOT EXISTS traducao_url TEXT,
ADD COLUMN IF NOT EXISTS traducao_storage_path TEXT,
ADD COLUMN IF NOT EXISTS traducao_nome_original TEXT;

-- Add a comment to the columns for better documentation
COMMENT ON COLUMN public.documentos.traducao_url IS 'URL pública do arquivo traduzido';
COMMENT ON COLUMN public.documentos.traducao_storage_path IS 'Caminho do arquivo traduzido no Supabase Storage';
COMMENT ON COLUMN public.documentos.traducao_nome_original IS 'Nome original do arquivo enviado pelo tradutor';
