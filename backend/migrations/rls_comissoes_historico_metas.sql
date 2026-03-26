-- Migration: Habilitar RLS nas tabelas de comissao, cambio e metas
-- Data: 2026-03-26
-- Objetivo: Proteger comissoes, historico_cambio e metas_comerciais contra
-- acesso direto, permitindo apenas acesso via service_role (backend)

DO $$
BEGIN

    -- --------------------------------------------------------
    -- Tabela: comissoes
    -- --------------------------------------------------------
    IF to_regclass('public.comissoes') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY';

        EXECUTE 'DROP POLICY IF EXISTS comissoes_backend_only_select ON public.comissoes';
        EXECUTE 'DROP POLICY IF EXISTS comissoes_backend_only_insert ON public.comissoes';
        EXECUTE 'DROP POLICY IF EXISTS comissoes_backend_only_update ON public.comissoes';
        EXECUTE 'DROP POLICY IF EXISTS comissoes_backend_only_delete ON public.comissoes';

        EXECUTE '
            CREATE POLICY comissoes_backend_only_select
            ON public.comissoes
            FOR SELECT
            USING (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY comissoes_backend_only_insert
            ON public.comissoes
            FOR INSERT
            WITH CHECK (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY comissoes_backend_only_update
            ON public.comissoes
            FOR UPDATE
            USING (auth.role() = ''service_role'')
            WITH CHECK (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY comissoes_backend_only_delete
            ON public.comissoes
            FOR DELETE
            USING (auth.role() = ''service_role'')
        ';
    END IF;

    -- --------------------------------------------------------
    -- Tabela: historico_cambio
    -- --------------------------------------------------------
    IF to_regclass('public.historico_cambio') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.historico_cambio ENABLE ROW LEVEL SECURITY';

        EXECUTE 'DROP POLICY IF EXISTS historico_cambio_backend_only_select ON public.historico_cambio';
        EXECUTE 'DROP POLICY IF EXISTS historico_cambio_backend_only_insert ON public.historico_cambio';
        EXECUTE 'DROP POLICY IF EXISTS historico_cambio_backend_only_update ON public.historico_cambio';
        EXECUTE 'DROP POLICY IF EXISTS historico_cambio_backend_only_delete ON public.historico_cambio';

        EXECUTE '
            CREATE POLICY historico_cambio_backend_only_select
            ON public.historico_cambio
            FOR SELECT
            USING (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY historico_cambio_backend_only_insert
            ON public.historico_cambio
            FOR INSERT
            WITH CHECK (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY historico_cambio_backend_only_update
            ON public.historico_cambio
            FOR UPDATE
            USING (auth.role() = ''service_role'')
            WITH CHECK (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY historico_cambio_backend_only_delete
            ON public.historico_cambio
            FOR DELETE
            USING (auth.role() = ''service_role'')
        ';
    END IF;

    -- --------------------------------------------------------
    -- Tabela: metas_comerciais
    -- --------------------------------------------------------
    IF to_regclass('public.metas_comerciais') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.metas_comerciais ENABLE ROW LEVEL SECURITY';

        EXECUTE 'DROP POLICY IF EXISTS metas_comerciais_backend_only_select ON public.metas_comerciais';
        EXECUTE 'DROP POLICY IF EXISTS metas_comerciais_backend_only_insert ON public.metas_comerciais';
        EXECUTE 'DROP POLICY IF EXISTS metas_comerciais_backend_only_update ON public.metas_comerciais';
        EXECUTE 'DROP POLICY IF EXISTS metas_comerciais_backend_only_delete ON public.metas_comerciais';

        EXECUTE '
            CREATE POLICY metas_comerciais_backend_only_select
            ON public.metas_comerciais
            FOR SELECT
            USING (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY metas_comerciais_backend_only_insert
            ON public.metas_comerciais
            FOR INSERT
            WITH CHECK (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY metas_comerciais_backend_only_update
            ON public.metas_comerciais
            FOR UPDATE
            USING (auth.role() = ''service_role'')
            WITH CHECK (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY metas_comerciais_backend_only_delete
            ON public.metas_comerciais
            FOR DELETE
            USING (auth.role() = ''service_role'')
        ';
    END IF;

END $$;
