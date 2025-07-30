# iHost - Document Management & AI Chat

A full-stack web application for document management with AI-powered chat capabilities built with React, Node.js, and Supabase.

## 🚀 Features

- **Document Management**: Upload, organize, and manage PDF, image, and video files
- **Folder Organization**: Create hierarchical folder structures with drag-and-drop functionality
- **AI Chat Integration**: Chat with AI about your documents or folders using DeepSeek API
- **User Authentication**: Secure email-based authentication via Supabase
- **Modern UI**: Glassmorphism design with luxury aesthetics
- **Real-time Updates**: Live updates using Supabase real-time subscriptions
- **Drag & Drop**: Intuitive file management with @dnd-kit
- **File Permissions**: Row-level security for document access control

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS v3** for styling with glassmorphism effects
- **@dnd-kit** for drag-and-drop functionality
- **react-dropzone** for file uploads
- **@supabase/supabase-js** for backend integration
- **lucide-react** for beautiful icons

### Backend
- **Node.js** with Express server
- **DeepSeek API** for AI chat functionality
- **Supabase** for database, authentication, and file storage

### Database
- **PostgreSQL** (via Supabase) with the following schema:
  - Users with authentication
  - Classifications (folders) with hierarchical structure
  - Documents with file metadata
  - Chat sessions and messages
  - Permission system for sharing

### Deployment
- **Docker Compose** for containerized deployment
- **NGINX** for reverse proxy (optional)

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose (for containerized deployment)
- Supabase account
- DeepSeek API account

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ihost
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Update the `.env` file with your credentials:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# DeepSeek API Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key

# Environment
NODE_ENV=development
```

### 3. Supabase Setup

#### Database Schema
Run the SQL commands from `db/db.sql` in your Supabase SQL editor to create the required tables.

#### Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `documents`
3. Set the bucket to be public if you want direct file access

#### Row Level Security (RLS)
Enable RLS on all tables and create policies for user access control.

### 4. Development Setup

#### Option A: Local Development
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

#### Option B: Docker Development
```bash
# Build and run with Docker Compose
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Full stack (with NGINX): http://localhost

## 🎨 UI Design

The application features a luxury glassmorphism design with:
- Translucent panels with backdrop blur effects
- Soft gradients and refined typography
- Elegant color scheme with purple/pink accents
- Smooth animations and transitions
- Minimalist but sophisticated layout

## 📱 Usage

### Getting Started
1. **Sign Up/Sign In**: Create an account or log in with email
2. **Create Folders**: Organize your documents with hierarchical folders
3. **Upload Documents**: Drag and drop PDF, image, or video files
4. **Organize**: Move files between folders using drag and drop
5. **Chat with AI**: Select a document or folder and start an AI conversation

### Key Features

#### Document Management
- **Upload**: Support for PDF, images (PNG, JPG, GIF, WebP), and videos (MP4, MOV, AVI, MKV, WebM)
- **Organization**: Create unlimited nested folders
- **Drag & Drop**: Move documents between folders intuitively
- **Preview**: Click the eye icon to view documents in a new tab
- **Delete**: Remove documents with confirmation

#### AI Chat
- **Context-Aware**: AI understands the context of selected documents or folders
- **Real-time**: Instant responses from DeepSeek AI
- **Persistent**: Chat history is saved per session
- **Smart**: AI provides relevant help based on your document context

#### Folder Management
- **Hierarchical**: Create nested folder structures
- **Visual Tree**: Clear folder navigation in the sidebar
- **Drag Targets**: Drop documents onto folders to move them
- **Context-Sensitive**: AI chat adapts based on selected folder

## 🚀 Deployment

### Docker Production Deployment
```bash
# Build and deploy
docker-compose -f docker-compose.yml up --build -d

# With NGINX reverse proxy
docker-compose up -d
```

### Environment Variables for Production
Make sure to set proper production values:
```env
NODE_ENV=production
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
DEEPSEEK_API_KEY=your_production_deepseek_key
```

## 🔧 API Documentation

### Backend Endpoints

#### Health Check
```
GET /api/health
Response: { "status": "OK", "timestamp": "2024-01-01T00:00:00.000Z" }
```

#### Chat Completion
```
POST /api/chat
Content-Type: application/json

Body:
{
  "messages": [
    { "role": "user", "content": "Tell me about this document" }
  ],
  "contextType": "document" | "classification",
  "contextId": "uuid-string" (optional)
}

Response:
{
  "content": "AI response text",
  "contextType": "document",
  "contextId": "uuid-string",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🛡️ Security

- **Authentication**: Supabase Auth with email/password
- **Row Level Security**: Database-level permissions
- **File Access Control**: Signed URLs for document access  
- **API Security**: CORS configuration and request validation
- **Environment Variables**: Secure credential management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   - Verify your Supabase URL and anon key
   - Check if RLS policies are properly configured

2. **File Upload Failures**
   - Ensure the `documents` storage bucket exists
   - Check bucket permissions and RLS policies

3. **AI Chat Not Working**
   - Verify DeepSeek API key is set correctly
   - Check backend logs for API errors
   - Ensure backend is running and accessible

4. **Docker Issues**
   - Run `docker-compose down` and `docker-compose up --build` to rebuild
   - Check port conflicts (3000, 3001, 80)

### Support
For support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using React, Node.js, and Supabase