
-- SCRIPT DE RESET DE BANCO DE DADOS (FACTORIA/BORA EXPANDIR)
-- ATENÇÃO: OPERAÇÃO DESTRUTIVA. APAGA TUDO EXCETO O SUPERADMIN.

-- 1. Identificar e proteger o SuperAdmin
-- O script manterá qualquer usuário cujo perfil tenha a role 'super_admin'

BEGIN;

-- Desabilitar triggers para evitar erros de integridade durante a limpeza em lote
SET LOCAL session_replication_role = 'replica';

DO $$ 
DECLARE
    r RECORD;
    tables_to_keep TEXT[] := ARRAY['profiles', 'spatial_ref_sys']; -- Adicione tabelas do sistema se houver
BEGIN
    RAISE NOTICE 'Iniciando limpeza das tabelas do schema public...';
    
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        IF NOT (r.tablename = ANY(tables_to_keep)) THEN
            RAISE NOTICE 'Limpando tabela: public.%', r.tablename;
            EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
        END IF;
    END LOOP;
END $$;

-- 2. Limpar usuários da AUTH exceto SuperAdmins
-- Primeiro limpamos as identidades e sessões via cascade ou deleção direta
RAISE NOTICE 'Limpando usuários do schema auth (mantendo super_admins)...';

DELETE FROM auth.users 
WHERE id NOT IN (
    SELECT id FROM public.profiles WHERE role = 'super_admin'
) AND (is_super_admin IS NOT TRUE OR is_super_admin IS NULL);

-- 3. Limpar perfis excedentes no public.profiles
RAISE NOTICE 'Limpando perfis excedentes...';
DELETE FROM public.profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- Restaurar triggers
SET LOCAL session_replication_role = 'origin';

COMMIT;

RAISE NOTICE 'Reset concluído com sucesso. Apenas os super_admins foram preservados.';
