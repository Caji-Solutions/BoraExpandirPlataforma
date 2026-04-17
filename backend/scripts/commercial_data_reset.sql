-- =============================================================
-- SCRIPT: Limpeza Cirurgica de Dados Comerciais
-- Versao: 1.0 — 2026-04-17
--
-- Objetivo:
--   Remove todos os dados comerciais e de clientes do banco,
--   preservando usuarios dos setores: super_admin, juridico,
--   administrativo, tradutor.
--
-- Uso:
--   Execute via Supabase SQL Editor com credencial service_role
--   (o service_role bypassa RLS automaticamente).
--   Pode tambem ser executado via psql com a connection string
--   do service_role do projeto.
--
-- AVISO: OPERACAO DESTRUTIVA E IRREVERSIVEL.
--   Faca um backup antes de executar em producao.
--   Teste em ambiente de desenvolvimento primeiro.
--
-- Idempotencia:
--   O script pode ser re-executado com seguranca. Delecoes em
--   tabelas ja vazias resultam em 0 linhas afetadas (sem erro).
-- =============================================================

BEGIN;

-- Desabilita verificacao de FK para permitir delecoes independentes
-- de ordem e evitar erros de integridade referencial durante a limpeza.
-- A restricao e restaurada ao final da transacao (COMMIT/ROLLBACK).
SET LOCAL session_replication_role = 'replica';

DO $$
DECLARE
    v_count         INTEGER;
    v_role          RECORD;
    v_preserved_roles TEXT[] := ARRAY['super_admin', 'juridico', 'administrativo', 'tradutor'];
BEGIN

    -- --------------------------------------------------------
    -- PRE-VERIFICACAO: listar o que sera preservado
    -- --------------------------------------------------------
    RAISE NOTICE '=== Verificacao pre-limpeza ===';

    SELECT COUNT(*) INTO v_count
    FROM public.profiles
    WHERE role = ANY(v_preserved_roles);
    RAISE NOTICE 'Total de perfis a preservar: %', v_count;

    FOR v_role IN (
        SELECT role, COUNT(*) AS total
        FROM public.profiles
        WHERE role = ANY(v_preserved_roles)
        GROUP BY role
        ORDER BY role
    ) LOOP
        RAISE NOTICE '  role=%-s: % perfil(is)', v_role.role, v_role.total;
    END LOOP;

    IF v_count = 0 THEN
        RAISE EXCEPTION
            'Nenhum perfil preservavel encontrado. Abortando para evitar limpeza total acidental.';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=== Iniciando remocao de dados comerciais ===';

    -- --------------------------------------------------------
    -- 1. Comissoes
    -- --------------------------------------------------------
    DELETE FROM public.comissoes;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'comissoes removidas: %', v_count;

    -- --------------------------------------------------------
    -- 2. Metas comerciais
    -- --------------------------------------------------------
    DELETE FROM public.metas_comerciais;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'metas_comerciais removidas: %', v_count;

    -- --------------------------------------------------------
    -- 3. Agendamentos
    -- --------------------------------------------------------
    DELETE FROM public.agendamentos;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'agendamentos removidos: %', v_count;

    -- --------------------------------------------------------
    -- 4. Contratos de servicos
    -- --------------------------------------------------------
    DELETE FROM public.contratos_servicos;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'contratos_servicos removidos: %', v_count;

    -- --------------------------------------------------------
    -- 5. Orcamentos
    -- --------------------------------------------------------
    IF to_regclass('public.orcamentos') IS NOT NULL THEN
        DELETE FROM public.orcamentos;
        GET DIAGNOSTICS v_count = ROW_COUNT;
        RAISE NOTICE 'orcamentos removidos: %', v_count;
    ELSE
        RAISE NOTICE 'orcamentos: tabela nao encontrada, ignorada';
    END IF;

    -- --------------------------------------------------------
    -- 6. Formularios de cliente e juridico
    --    (referenciam clientes/processos com ON DELETE CASCADE;
    --     precisam ser removidos explicitamente porque FK esta
    --     desabilitado nesta sessao)
    -- --------------------------------------------------------
    IF to_regclass('public.formularios') IS NOT NULL THEN
        DELETE FROM public.formularios;
        GET DIAGNOSTICS v_count = ROW_COUNT;
        RAISE NOTICE 'formularios removidos: %', v_count;
    ELSE
        RAISE NOTICE 'formularios: tabela nao encontrada, ignorada';
    END IF;

    IF to_regclass('public.formularios_cliente') IS NOT NULL THEN
        DELETE FROM public.formularios_cliente;
        GET DIAGNOSTICS v_count = ROW_COUNT;
        RAISE NOTICE 'formularios_cliente removidos: %', v_count;
    ELSE
        RAISE NOTICE 'formularios_cliente: tabela nao encontrada, ignorada';
    END IF;

    -- --------------------------------------------------------
    -- 7. Documentos
    -- --------------------------------------------------------
    DELETE FROM public.documentos;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'documentos removidos: %', v_count;

    -- --------------------------------------------------------
    -- 8. Dependentes
    -- --------------------------------------------------------
    DELETE FROM public.dependentes;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'dependentes removidos: %', v_count;

    -- --------------------------------------------------------
    -- 9. Requerimentos (vinculados a processos/clientes)
    -- --------------------------------------------------------
    IF to_regclass('public.requerimentos') IS NOT NULL THEN
        DELETE FROM public.requerimentos;
        GET DIAGNOSTICS v_count = ROW_COUNT;
        RAISE NOTICE 'requerimentos removidos: %', v_count;
    ELSE
        RAISE NOTICE 'requerimentos: tabela nao encontrada, ignorada';
    END IF;

    -- --------------------------------------------------------
    -- 10. Processos
    -- --------------------------------------------------------
    DELETE FROM public.processos;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'processos removidos: %', v_count;

    -- --------------------------------------------------------
    -- 11. Clientes
    -- --------------------------------------------------------
    DELETE FROM public.clientes;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'clientes removidos: %', v_count;

    -- --------------------------------------------------------
    -- 12. Perfis comerciais
    --     Remove todos os profiles com role = 'comercial'.
    --     supervisor_id em outros perfis fica NULL via ON DELETE SET NULL
    --     (migração fix_fk_cascade_on_profile_delete.sql).
    -- --------------------------------------------------------
    DELETE FROM public.profiles
    WHERE role = 'comercial';
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'profiles comerciais removidos: %', v_count;

    -- --------------------------------------------------------
    -- 13. Auth: remover usuarios sem perfil preservado
    --     Cobre tanto os usuarios comerciais quanto quaisquer
    --     usuarios auth orfaos sem perfil correspondente.
    -- --------------------------------------------------------
    DELETE FROM auth.users
    WHERE id NOT IN (
        SELECT id
        FROM public.profiles
        WHERE role = ANY(v_preserved_roles)
    );
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'auth.users removidos (sem perfil preservado): %', v_count;

    -- --------------------------------------------------------
    -- POS-VERIFICACAO: confirmar estado final
    -- --------------------------------------------------------
    RAISE NOTICE '';
    RAISE NOTICE '=== Verificacao pos-limpeza ===';

    FOR v_role IN (
        SELECT role, COUNT(*) AS total
        FROM public.profiles
        GROUP BY role
        ORDER BY role
    ) LOOP
        RAISE NOTICE '  Perfis restantes — role=%: %', v_role.role, v_role.total;
    END LOOP;

    SELECT COUNT(*) INTO v_count FROM public.clientes;
    RAISE NOTICE 'clientes restantes: % (esperado: 0)', v_count;

    SELECT COUNT(*) INTO v_count FROM public.agendamentos;
    RAISE NOTICE 'agendamentos restantes: % (esperado: 0)', v_count;

    SELECT COUNT(*) INTO v_count FROM public.contratos_servicos;
    RAISE NOTICE 'contratos_servicos restantes: % (esperado: 0)', v_count;

    SELECT COUNT(*) INTO v_count FROM public.comissoes;
    RAISE NOTICE 'comissoes restantes: % (esperado: 0)', v_count;

    SELECT COUNT(*) INTO v_count FROM public.metas_comerciais;
    RAISE NOTICE 'metas_comerciais restantes: % (esperado: 0)', v_count;

    SELECT COUNT(*) INTO v_count FROM public.documentos;
    RAISE NOTICE 'documentos restantes: % (esperado: 0)', v_count;

    SELECT COUNT(*) INTO v_count FROM public.processos;
    RAISE NOTICE 'processos restantes: % (esperado: 0)', v_count;

    SELECT COUNT(*) INTO v_count FROM public.dependentes;
    RAISE NOTICE 'dependentes restantes: % (esperado: 0)', v_count;

    RAISE NOTICE '';
    RAISE NOTICE '=== Limpeza concluida com sucesso ===';

END $$;

-- Restaura verificacao de FK
SET LOCAL session_replication_role = 'origin';

COMMIT;
