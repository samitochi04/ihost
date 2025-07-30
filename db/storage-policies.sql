-- Storage policies for documents bucket
-- Run these in Supabase Dashboard → Storage → Policies

-- Policy 1: Users can upload their own documents
CREATE POLICY "Users can upload own documents" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can view their own documents  
CREATE POLICY "Users can view own documents" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can delete their own documents
CREATE POLICY "Users can delete own documents" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can update their own documents
CREATE POLICY "Users can update own documents" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
