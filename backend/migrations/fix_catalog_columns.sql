-- Adicionar colunas em português para compatibilidade com triggers
ALTER TABLE public.catalogo_servicos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.catalogo_servicos ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.servico_requisitos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.servico_requisitos ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT NOW();

-- Sincronizar dados das colunas antigas (opcional, mas recomendado)
UPDATE public.catalogo_servicos SET criado_em = created_at, atualizado_em = updated_at;
UPDATE public.servico_requisitos SET criado_em = created_at, atualizado_em = updated_at;
