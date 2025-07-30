# iHost Deployment Guide

## GitHub & Coolify Deployment

### Prerequisites
- GitHub account
- Coolify instance/server
- Domain name (optional but recommended)
- Supabase project configured
- OpenAI API key

### Step 1: GitHub Repository Setup

1. **Initialize Git Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: iHost document management app"
   ```

2. **Create GitHub Repository**
   - Go to GitHub.com and create a new repository named `ihost`
   - Don't initialize with README (we already have files)

3. **Push to GitHub**
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ihost.git
   git push -u origin main
   ```

### Step 2: Environment Variables Setup

Create these environment variables in Coolify:

#### Backend Environment Variables:
```env
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
```

#### Frontend Environment Variables:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Step 3: Coolify Deployment

1. **Add New Service in Coolify**
   - Go to your Coolify dashboard
   - Click "New Service"
   - Select "Docker Compose"

2. **Configure Repository**
   - Repository: `https://github.com/YOUR_USERNAME/ihost.git`
   - Branch: `main`
   - Build Pack: `Docker Compose`

3. **Set Environment Variables**
   - Add all the environment variables listed above
   - Make sure to use your actual API keys and Supabase credentials

4. **Configure Domains**
   - Set your domain name or use the provided Coolify domain
   - Enable SSL/HTTPS

5. **Deploy**
   - Click "Deploy" and wait for the build to complete
   - Monitor logs for any issues

### Step 4: Database Setup (Supabase)

Make sure your Supabase project is configured:

1. Run the SQL scripts in this order:
   - `db/db.sql` - Main database schema
   - `db/rls-policies.sql` - Security policies
   - `db/simple-user-sync.sql` - User synchronization
   - `db/storage-policies.sql` - File storage policies

2. Create the `documents` storage bucket in Supabase
3. Configure authentication settings

### Step 5: Post-Deployment

1. **Test the Application**
   - Visit your deployed URL
   - Test user registration/login
   - Test file upload and AI chat functionality

2. **Monitor Logs**
   - Check Coolify logs for any issues
   - Monitor application performance

### Troubleshooting

**Common Issues:**
- **Build Failures**: Check environment variables and Docker configuration
- **Database Connection**: Verify Supabase credentials and RLS policies
- **File Upload Issues**: Check storage bucket and policies
- **AI Chat Not Working**: Verify OpenAI API key

**Performance Optimization:**
- Enable Coolify's built-in CDN if available
- Configure proper caching headers
- Monitor resource usage

### Scaling

For production use:
- Consider using a dedicated server or cloud provider
- Set up monitoring and alerting
- Configure automated backups for your Supabase database
- Implement proper error tracking (e.g., Sentry)
