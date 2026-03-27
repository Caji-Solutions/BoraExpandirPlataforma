-- Migration: Adiciona colunas do formulario de consultoria na tabela formularios_cliente
-- Criado em: 2026-03-27
-- Motivo: O FormularioController tentava inserir campos que nao existiam na tabela,
--         causando erro PGRST204 e impedindo o envio do email de login.

-- Step 1 - Identificacao e Dados Pessoais
ALTER TABLE formularios_cliente
    ADD COLUMN IF NOT EXISTS parceiro_indicador TEXT,
    ADD COLUMN IF NOT EXISTS nacionalidade TEXT,
    ADD COLUMN IF NOT EXISTS esteve_europa_6meses TEXT,
    ADD COLUMN IF NOT EXISTS cidade_pais_residencia TEXT;

-- Step 2 - Familiar e Documentos
ALTER TABLE formularios_cliente
    ADD COLUMN IF NOT EXISTS estado_civil TEXT,
    ADD COLUMN IF NOT EXISTS filhos_qtd_idades TEXT,
    ADD COLUMN IF NOT EXISTS familiares_espanha TEXT,
    ADD COLUMN IF NOT EXISTS possui_cnh_categoria_ano TEXT,
    ADD COLUMN IF NOT EXISTS proposta_trabalho_espanha TEXT,
    ADD COLUMN IF NOT EXISTS visto_ue TEXT,
    ADD COLUMN IF NOT EXISTS trabalho_destacado_ue TEXT,
    ADD COLUMN IF NOT EXISTS filhos_nacionalidade_europeia TEXT,
    ADD COLUMN IF NOT EXISTS pretende_autonomo TEXT;

-- Step 3 - Educacao e Trabalho
ALTER TABLE formularios_cliente
    ADD COLUMN IF NOT EXISTS disposto_estudar TEXT,
    ADD COLUMN IF NOT EXISTS pretende_trabalhar_espanha TEXT,
    ADD COLUMN IF NOT EXISTS escolaridade TEXT,
    ADD COLUMN IF NOT EXISTS area_formacao TEXT,
    ADD COLUMN IF NOT EXISTS situacao_profissional TEXT,
    ADD COLUMN IF NOT EXISTS profissao_online_presencial TEXT,
    ADD COLUMN IF NOT EXISTS tipo_visto_planejado TEXT,
    ADD COLUMN IF NOT EXISTS duvidas_consultoria TEXT;
