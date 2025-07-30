-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_classification_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_document_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Classifications (Folders) policies
CREATE POLICY "Users can view own classifications" ON classifications FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own classifications" ON classifications FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own classifications" ON classifications FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own classifications" ON classifications FOR DELETE USING (auth.uid() = owner_id);

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = owner_id);

-- Chat sessions policies
CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions" ON chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages from own chat sessions" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = messages.chat_session_id 
    AND chat_sessions.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert messages to own chat sessions" ON messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = messages.chat_session_id 
    AND chat_sessions.user_id = auth.uid()
  )
);

-- Create storage bucket for documents (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

-- Storage policies for documents bucket
-- CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT WITH CHECK (
--   bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT USING (
--   bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "Users can delete own documents" ON storage.objects FOR DELETE USING (
--   bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
-- );
