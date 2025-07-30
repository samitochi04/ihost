# Quick Setup Guide for iHost

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Supabase account created
- [ ] DeepSeek API account created

## 1. Environment Setup

### Copy and configure environment variables:
```bash
copy .env.example .env
```

### Edit `.env` with your credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
DEEPSEEK_API_KEY=sk-your_deepseek_key_here
NODE_ENV=development
```

## 2. Supabase Setup

### Database Schema:
1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of `db/db.sql`
3. Run the contents of `db/rls-policies.sql`
4. **IMPORTANT:** Run the contents of `db/user-sync-triggers.sql` to automatically sync users

### Authentication Setup:
1. Go to Supabase Dashboard → Authentication → Settings
2. **Disable "Enable email confirmations"** to allow instant signup without email verification
3. Set "Site URL" to `http://localhost:3000` for development

### Storage Setup:
1. Go to Storage → Create bucket named `documents`
2. Make it public or configure appropriate policies

## 3. Installation & Running

### Automatic (Windows):
```bash
# Install all dependencies
install.bat

# Start development servers
start-dev.bat
```

### Manual:
```bash
# Install dependencies
npm run install:all

# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend  
cd frontend
npm run dev
```

## 4. First Use
1. Open http://localhost:3000
2. Create an account
3. Create your first folder
4. Upload a document
5. Start chatting with AI!

## 5. Docker (Optional)
```bash
# Copy environment file
copy .env.example .env

# Start with Docker
docker-compose up --build
```

## Troubleshooting
- Check that both ports 3000 and 3001 are available
- Verify your Supabase and DeepSeek credentials
- Make sure the database schema is properly created
- Check browser console for any errors

## Success Indicators
- ✅ Backend running on http://localhost:3001
- ✅ Frontend running on http://localhost:3000  
- ✅ Can create account and login
- ✅ Can upload files
- ✅ Can create folders
- ✅ AI chat responds properly
