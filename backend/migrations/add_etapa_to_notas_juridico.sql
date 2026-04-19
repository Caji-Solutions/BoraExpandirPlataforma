-- Adiciona coluna `etapa` em notas_juridico para amarrar a nota ao stage da Timeline do DNA.
-- O backend (JuridicoRepository.createNote) e o frontend (DNAClientDetailView) já enviam/esperam esse campo.
-- Sem ele, o INSERT falha com erro PGRST204 "Could not find the 'etapa' column" e a UI exibe falha silenciosa.

ALTER TABLE notas_juridico ADD COLUMN IF NOT EXISTS etapa text;

COMMENT ON COLUMN notas_juridico.etapa IS
  'Stage do cliente a que a nota se refere (ex: aguardando_consultoria, em_consultoria, clientes_c2, aguardando_assessoria, assessoria_andamento, assessoria_finalizada). Null = nota geral sem etapa vinculada.';
