-- Migration: lock down contratos_servicos and subservicos
-- Objetivo: remover estado "unrestricted" no Supabase e garantir acesso apenas via backend (service role).

DO $$
BEGIN
    IF to_regclass('public.contratos_servicos') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.contratos_servicos ENABLE ROW LEVEL SECURITY';

        EXECUTE 'DROP POLICY IF EXISTS contratos_servicos_backend_only_select ON public.contratos_servicos';
        EXECUTE 'DROP POLICY IF EXISTS contratos_servicos_backend_only_insert ON public.contratos_servicos';
        EXECUTE 'DROP POLICY IF EXISTS contratos_servicos_backend_only_update ON public.contratos_servicos';
        EXECUTE 'DROP POLICY IF EXISTS contratos_servicos_backend_only_delete ON public.contratos_servicos';

        EXECUTE '
            CREATE POLICY contratos_servicos_backend_only_select
            ON public.contratos_servicos
            FOR SELECT
            USING (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY contratos_servicos_backend_only_insert
            ON public.contratos_servicos
            FOR INSERT
            WITH CHECK (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY contratos_servicos_backend_only_update
            ON public.contratos_servicos
            FOR UPDATE
            USING (auth.role() = ''service_role'')
            WITH CHECK (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY contratos_servicos_backend_only_delete
            ON public.contratos_servicos
            FOR DELETE
            USING (auth.role() = ''service_role'')
        ';
    END IF;

    IF to_regclass('public.subservicos') IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.subservicos ENABLE ROW LEVEL SECURITY';

        EXECUTE 'DROP POLICY IF EXISTS subservicos_backend_only_select ON public.subservicos';
        EXECUTE 'DROP POLICY IF EXISTS subservicos_backend_only_insert ON public.subservicos';
        EXECUTE 'DROP POLICY IF EXISTS subservicos_backend_only_update ON public.subservicos';
        EXECUTE 'DROP POLICY IF EXISTS subservicos_backend_only_delete ON public.subservicos';

        EXECUTE '
            CREATE POLICY subservicos_backend_only_select
            ON public.subservicos
            FOR SELECT
            USING (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY subservicos_backend_only_insert
            ON public.subservicos
            FOR INSERT
            WITH CHECK (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY subservicos_backend_only_update
            ON public.subservicos
            FOR UPDATE
            USING (auth.role() = ''service_role'')
            WITH CHECK (auth.role() = ''service_role'')
        ';

        EXECUTE '
            CREATE POLICY subservicos_backend_only_delete
            ON public.subservicos
            FOR DELETE
            USING (auth.role() = ''service_role'')
        ';
    END IF;
END $$;
