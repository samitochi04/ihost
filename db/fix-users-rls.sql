-- Add missing RLS policy to allow users to insert their own record
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
