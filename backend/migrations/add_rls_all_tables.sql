-- Migration: Habilitar RLS em todas as tabelas sem protecao
-- Data: 2026-03-26
-- Objetivo: Defesa em profundidade — todas as tabelas publicas devem ter
-- RLS habilitado e politicas explicitamente restritas ao service_role (backend).
-- O service_role bypassa RLS automaticamente; estas policies protegem
-- contra acesso direto via anon/authenticated sem passar pelo backend.
--
-- Tabelas ja protegidas (NAO alteradas aqui):
--   contratos_servicos  -> enable_rls_contratos_servicos_subservicos.sql
--   subservicos         -> enable_rls_contratos_servicos_subservicos.sql
--   notificacoes        -> fix_notificacoes_schema.sql (policy por auth.uid())
--   comissoes           -> rls_comissoes_historico_metas.sql
--   historico_cambio    -> rls_comissoes_historico_metas.sql
--   metas_comerciais    -> rls_comissoes_historico_metas.sql
--
-- Referencia de status RLS a verificar no banco:
--   SELECT schemaname, tablename, rowsecurity
--   FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- ============================================================
-- Funcao auxiliar: gera 4 politicas backend_only para uma tabela
-- ============================================================

DO $$
DECLARE
    v_table TEXT;
    v_tables TEXT[] := ARRAY[
        'agendamentos',
        'apostilamentos',
        'assessorias_juridico',
        'catalogo_servicos',
        'clientes',
        'configuracoes',
        'dependentes',
        'documentos',
        'formularios_cliente',
        'formularios_juridico',
        'notas_juridico',
        'orcamentos',
        'parceiros',
        'perfil_unificado',
        'processos',
        'profiles',
        'requerimentos',
        'servico_requisitos'
    ];
BEGIN
    FOREACH v_table IN ARRAY v_tables
    LOOP
        IF to_regclass('public.' || v_table) IS NOT NULL THEN

            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);

            -- Remove policies anteriores para garantir idempotencia
            EXECUTE format(
                'DROP POLICY IF EXISTS %I ON public.%I',
                v_table || '_backend_only_select', v_table
            );
            EXECUTE format(
                'DROP POLICY IF EXISTS %I ON public.%I',
                v_table || '_backend_only_insert', v_table
            );
            EXECUTE format(
                'DROP POLICY IF EXISTS %I ON public.%I',
                v_table || '_backend_only_update', v_table
            );
            EXECUTE format(
                'DROP POLICY IF EXISTS %I ON public.%I',
                v_table || '_backend_only_delete', v_table
            );

            -- SELECT
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR SELECT USING (auth.role() = ''service_role'')',
                v_table || '_backend_only_select', v_table
            );

            -- INSERT
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (auth.role() = ''service_role'')',
                v_table || '_backend_only_insert', v_table
            );

            -- UPDATE
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR UPDATE USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')',
                v_table || '_backend_only_update', v_table
            );

            -- DELETE
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR DELETE USING (auth.role() = ''service_role'')',
                v_table || '_backend_only_delete', v_table
            );

            RAISE NOTICE 'RLS habilitado e politicas criadas para: %', v_table;

        ELSE
            RAISE NOTICE 'Tabela nao encontrada (ignorada): %', v_table;
        END IF;
    END LOOP;
END $$;
