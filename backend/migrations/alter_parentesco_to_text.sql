-- Change parentesco from ENUM (parentesco_tipo) to TEXT in dependentes table
-- This allows any kinship value to be stored, not just predefined ENUM values.
ALTER TABLE dependentes ALTER COLUMN parentesco TYPE TEXT;
