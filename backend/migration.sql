-- Migrar Auth para Profiles

-- 1. Adicionar colunas necessárias
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_token TEXT;

-- 2. (Opcional) Limpar dados existentes caso queira começar do zero 
-- (descomente se desejar)
-- DELETE FROM public.profiles;
