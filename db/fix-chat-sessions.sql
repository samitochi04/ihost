-- Fix chat_sessions table to allow general chat sessions
-- Remove the constraint that requires either document_id or classification_id

-- Drop the existing check constraint
ALTER TABLE chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_check;

-- The table will now allow:
-- 1. Chat with specific document (document_id set, classification_id null)
-- 2. Chat with specific folder (classification_id set, document_id null)  
-- 3. General chat (both null)
-- 4. Optionally, both set if needed in the future

-- Note: If you prefer to keep some constraint, you can add:
-- ALTER TABLE chat_sessions ADD CONSTRAINT chat_sessions_check 
-- CHECK (NOT (document_id IS NOT NULL AND classification_id IS NOT NULL));
-- This would prevent having both document_id AND classification_id set at the same time
