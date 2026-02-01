# 🧠 MemoSphere – Your Personal Digital Assistant

To https://github.com/niranjan-achar/MemoSphere.git
 ! [remote rejected] main -> main (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/niranjan-achar/MemoSphere.git'

## 🚀 Features

- **Smart Reminders & Scheduler**: Context-aware reminders with web push notifications and real-time updates
- **Task Management**: Comprehensive to-do lists with priority tracking and status management
- **Secure Vault**: AES-256 encrypted credential storage with secure retrieval
- **Notes & Memories**: Organized note-taking with tags, categories, and full-text search
- **Document Manager**: Upload and organize files (PDFs, images) with Supabase Storage
- **Personal Hub**: Track your productivity and activity with an analytics dashboard

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Supabase Auth (Google OAuth)
- **PWA**: Service Workers + Web Push API

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **API**: RESTful endpoints with JWT auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Encryption**: AES-256 (crypto-js)

### Infrastructure
- **Frontend Hosting**: Vercel (https://memo-sphere.vercel.app)
- **Backend Hosting**: Vercel (https://memo-sphere-backend.vercel.app)
- **Database**: Supabase Cloud
- **CORS**: Enabled for frontend-backend communication

## 📦 Installation

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/niranjan-achar/MemoSphere.git
   cd Memorie
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add the following to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=https://memo-sphere-backend.vercel.app
   NEXT_PUBLIC_APP_URL=https://memo-sphere.vercel.app
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run frontend development server**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Setup backend environment variables**
   ```bash
   cp .env.example .env
   ```
   
Memorie/
├── frontend/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── reminders/        # Reminder components
│   │   ├── todos/            # To-Do components
│   │   ├── vault/            # Vault components
│   │   ├── notes/            # Notes components
│   │   ├── documents/        # Document components
│   │   └── auth/             # Authentication components
│   ├── lib/                   # Core utilities
│   │   ├── supabase/         # Supabase client config
│   │   ├── api/              # API fetch helpers
│   │   └── encryption/       # Encryption utilities (client-side)
│   ├── types/                 # TypeScript type definitions
│   └── public/               # Static assets & PWA files
│
└── backend/
    ├── src/
    │   ├── server.js         # Express server entry point
    │   ├── config/
    │   │   └── supabase.js   # Supabase config & auth
    │   └── routes/
    │       ├── notes.js      # Notes API endpoints
    │       ├── reminders.js  # Reminders API endpoints
    │       ├── todos.js      # Todos API endpoints
    │       ├── vault.js      # Vault API endpoints (with encryption)
    │       ├── documents.js  # Documents API endpoints
    │       └── test-db.js    # Database health check
    ├── package.json
    ├── vercel.json           # Vercel deployment config
    └── .env                  # Backend environment variables
## ⚙️ Configuration

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Run the SQL migrations in `supabase/migrations/` to create tables
4. Enable Google OAuth in Authentication > Providers
5. Set up Row Level Security policies (provided in migrations)

### 2. Web Push Setup

Generate VAPID keys for web push notifications:
```bash
npx web-push generate-vapid-keys
```
Add the keys to `.env.local`

### 3. Google OAuth

1. In Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add authorized redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

## 🗂️ Project Structure

```
memosphere/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── reminders/        # Reminder components
│   ├── todos/            # To-Do components
│   ├── vault/            # Vault components
│   ├── notes/            # Notes components
│   └── auth/             # Authentication components
├── lib/                   # Core utilities
│   ├── supabase/         # Supabase client & queries
│   ├── encryption/       # AES encryption utilities
│   └── notifications/    # Web Push setup
├── types/                 # TypeScript type definitions
├── utils/                 # Helper functions
├── supabase/             # Database migrations & schemas
└── public/               # Static assets & PWA files

```

## 🔒 Security

- All sensitive data encrypted with AES-256 before storage
- Row Level Security (RLS) enabled on all Supabase tables
- Google OAuth for secure authentication
- HTTPS required in production
- Environment variables for all secrets

## 📱 PWA Features

- Offline support for notes and documents
- Install as standalone app on mobile/desktop
- Web push notifications for reminders
- Service worker caching strategy

## 🧪 Development

### Frontend Development
```bash
# Run frontend development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Backend Development
```bash
# Navigate to backend folder
cd backend

# Run backend development server
npm run dev

# Start production server
npm start
```

## 🚢 Deployment

### Frontend Deployment (Vercel)

1. **Push code to GitHub**
2. **Import frontend in Vercel**
   - Select root directory (not backend folder)
3. **Add environment variables in Vercel dashboard**:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   NEXT_PUBLIC_API_URL=https://memo-sphere-backend.vercel.app
   NEXT_PUBLIC_APP_URL=https://memo-sphere.vercel.app
   NEXT_PUBLIC_VAPID_PUBLIC_KEY
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   ```
4. **Deploy** - Frontend will be at `https://memo-sphere.vercel.app`

### Backend Deployment (Vercel)

1. **Create separate Vercel project for backend**
2. **Import backend folder**
   - Set root directory to `backend`
3. **Add environment variables in Vercel dashboard**:
   ```
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ENCRYPTION_SECRET
   FRONTEND_URL=https://memo-sphere.vercel.app
   VAPID_PUBLIC_KEY
   VAPID_PRIVATE_KEY
   VAPID_SUBJECT
   NODE_ENV=production
   ```
4. **Deploy** - Backend will be at `https://memo-sphere-backend.vercel.app`

### Post-Deployment

1. **Update Supabase Auth URLs**:
   - Add `https://memo-sphere.vercel.app/auth/callback` to allowed redirect URLs
   
2. **Test API connectivity**:
   - Visit `https://memo-sphere-backend.vercel.app`
   - Should see: `{"status":"ok","message":"Memorie Backend API"}`

## 🔄 API Architecture

### Frontend → Backend Communication

All API calls from frontend use the `apiFetch` helper:

```typescript
import { apiFetch } from '@/lib/api/config';

// Automatically adds Authorization header with JWT token
const response = await apiFetch('/api/notes', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

### Backend Authentication

Backend validates JWT tokens from Supabase Auth:

```javascript
// Extract user from Authorization header
const { user, error } = await getUserFromToken(req.headers.authorization);

// All database operations use user.id for RLS
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📧 Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ using Next.js and Supabase
