-- Remove password_hash column since Supabase Auth handles passwords
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
