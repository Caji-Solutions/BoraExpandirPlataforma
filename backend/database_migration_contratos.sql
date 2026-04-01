CREATE TABLE IF NOT EXISTS public.contratos_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    conteudo_html TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS e Politicas (opcional mas recomendado)
ALTER TABLE public.contratos_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura total para todos" ON public.contratos_templates FOR SELECT USING (true);
CREATE POLICY "Permitir inserção total para admin" ON public.contratos_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização total" ON public.contratos_templates FOR UPDATE USING (true);
CREATE POLICY "Permitir remocao total" ON public.contratos_templates FOR DELETE USING (true);
