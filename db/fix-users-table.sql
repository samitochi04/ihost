-- Fix the users table to make password_hash optional since Supabase Auth handles passwords
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Or if you prefer to remove the password_hash column entirely since Supabase Auth handles it:
-- ALTER TABLE users DROP COLUMN password_hash;
