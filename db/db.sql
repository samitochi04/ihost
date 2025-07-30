-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- CLASSIFICATIONS (FOLDERS)
CREATE TABLE classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES classifications(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- USER <-> CLASSIFICATION (SHARING FOLDERS)
CREATE TABLE user_classification_access (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    classification_id UUID REFERENCES classifications(id) ON DELETE CASCADE,
    permission TEXT CHECK (permission IN ('owner', 'editor', 'viewer')),
    PRIMARY KEY (user_id, classification_id)
);

-- DOCUMENTS
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    classification_id UUID REFERENCES classifications(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- USER <-> DOCUMENT (SHARING DOCS)
CREATE TABLE user_document_access (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    permission TEXT CHECK (permission IN ('owner', 'editor', 'viewer')),
    PRIMARY KEY (user_id, document_id)
);

-- CHAT SESSIONS
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    classification_id UUID REFERENCES classifications(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CHECK (
        -- Only one of document_id or classification_id should be set
        (document_id IS NOT NULL AND classification_id IS NULL) OR
        (document_id IS NULL AND classification_id IS NOT NULL)
    )
);

-- MESSAGES (CONVERSATIONS)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender TEXT CHECK (sender IN ('user', 'ai')) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
