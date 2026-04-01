-- database_migration_servicos.sql
-- Reestruturação do Catálogo de Serviços e Contratos
-- Data: 2026-03-31

-- 1. Novos campos em catalogo_servicos
ALTER TABLE catalogo_servicos
  ADD COLUMN IF NOT EXISTS contrato_template_id UUID REFERENCES contratos_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS possui_subservicos    BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tipo_preco            VARCHAR(20) DEFAULT 'por_contrato'
                                                 CHECK (tipo_preco IN ('fixo', 'por_contrato')),
  ADD COLUMN IF NOT EXISTS is_agendavel          BOOLEAN DEFAULT false;

-- 2. valor passa a ser nullable (definido em runtime pelo C2 quando tipo_preco='por_contrato')
ALTER TABLE catalogo_servicos ALTER COLUMN valor DROP NOT NULL;

-- 3. Backfill: preservar is_agendavel dos serviços com tipo='agendavel'
UPDATE catalogo_servicos SET is_agendavel = true WHERE tipo = 'agendavel';

-- 4. Backfill: serviços com tipo='fixo' recebem tipo_preco='fixo'
-- (preserva semântica correta — esses serviços já tinham preço definido pelo contrato)
UPDATE catalogo_servicos SET tipo_preco = 'fixo' WHERE tipo = 'fixo';

-- 5. Novo campo em servico_requisitos
ALTER TABLE servico_requisitos
  ADD COLUMN IF NOT EXISTS tipo_documento VARCHAR(20) DEFAULT 'titular'
                                          CHECK (tipo_documento IN ('titular', 'dependente'));
