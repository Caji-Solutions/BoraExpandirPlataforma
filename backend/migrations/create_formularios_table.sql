-- Tabela para Formulários e Declarações
-- Documentos enviados pelo jurídico para os clientes

CREATE TABLE IF NOT EXISTS formularios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    membro_id UUID NOT NULL, -- ID do dependente ou do titular
    nome_original VARCHAR(500) NOT NULL,
    nome_arquivo VARCHAR(500) NOT NULL,
    storage_path VARCHAR(1000) NOT NULL,
    public_url TEXT,
    content_type VARCHAR(100),
    tamanho INTEGER,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_formularios_processo ON formularios(processo_id);
CREATE INDEX IF NOT EXISTS idx_formularios_membro ON formularios(membro_id);

-- Comentários
COMMENT ON TABLE formularios IS 'Formulários e declarações enviados pelo jurídico para os clientes';
COMMENT ON COLUMN formularios.membro_id IS 'ID do membro da família (pode ser o titular usando cliente_id ou um dependente usando dependente_id)';
