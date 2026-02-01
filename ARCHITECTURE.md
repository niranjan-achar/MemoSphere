# Memorie - Application Architecture

## Overview
Memorie uses a **separated frontend-backend architecture** with Next.js frontend and Node.js Express backend, deployed on separate Vercel instances with CORS-enabled communication.

---

## 🎨 Frontend Layer (Client-Side)

**Deployment**: https://memo-sphere.vercel.app  
**Stack**: Next.js 15 + React 19 + TypeScript + Tailwind CSS

### User Interface Components
```
components/
├── auth/LoginForm.tsx                 # Google OAuth login interface
├── notes/
│   ├── NoteCard.tsx                   # Individual note display
│   ├── NoteForm.tsx                   # Create/edit note form
│   └── NotesClient.tsx                # Notes list & search
├── reminders/
│   ├── CalendarView.tsx               # Calendar visualization
│   ├── ReminderCard.tsx               # Reminder display card
│   ├── ReminderForm.tsx               # Create/edit reminder form
│   └── RemindersClient.tsx            # Reminders list management
├── todos/
│   ├── TodoCard.tsx                   # Todo item display
│   ├── TodoForm.tsx                   # Create/edit todo form
│   └── TodosClient.tsx                # Todos list & filters
├── vault/
│   ├── VaultCard.tsx                  # Encrypted item display
│   ├── VaultForm.tsx                  # Create/edit vault entry
│   └── VaultClient.tsx                # Vault list & decrypt UI
└── documents/
    ├── DocumentCard.tsx               # Document file display
    ├── DocumentUpload.tsx             # Drag-drop upload
    └── DocumentsClient.tsx            # Document manager
```

### Page Routes (User-Facing)
```
app/
├── page.tsx                           # Landing page
├── layout.tsx                         # Root layout with metadata
├── (dashboard)/
│   ├── layout.tsx                     # Dashboard sidebar navigation
│   ├── dashboard/page.tsx             # Analytics dashboard
│   ├── reminders/page.tsx             # Reminders page
│   ├── todos/page.tsx                 # Todos page
│   ├── vault/page.tsx                 # Secure vault page
│   ├── notes/page.tsx                 # Notes page
│   └── documents/page.tsx             # Documents page
└── auth/
    ├── login/page.tsx                 # Login page
    └── callback/route.ts              # OAuth callback handler
```

### Styling & Assets
```
app/globals.css                        # Global Tailwind styles
tailwind.config.ts                     # Tailwind configuration
public/                                # Static assets (icons, manifest)
```

---

## 🔧 Backend Layer (Server-Side)

**Deployment**: https://memo-sphere-backend.vercel.app  
**Stack**: Node.js 18 + Express.js + Supabase

### API Server Configuration
```
backend/src/server.js              # Express app entry point with CORS
├── CORS Origins:
│   ├── https://memo-sphere.vercel.app (production)
│   ├── http://localhost:3000      (development)
│   └── http://localhost:3001      (testing)
├── Middleware:
│   ├── express.json()            # JSON body parser
│   └── cors(corsOptions)         # CORS configuration
└── Health Check: GET /           # API status endpoint
```

### API Routes (RESTful Endpoints)
```
backend/src/routes/
├── notes.js                       # Notes CRUD operations
│   ├── GET    /api/notes         # Fetch all user notes
│   ├── POST   /api/notes         # Create new note
│   ├── PATCH  /api/notes/:id     # Update note
│   └── DELETE /api/notes/:id     # Delete note
│
├── reminders.js                   # Reminders management
│   ├── GET    /api/reminders     
│   ├── POST   /api/reminders     
│   ├── PATCH  /api/reminders/:id 
│   └── DELETE /api/reminders/:id 
│
├── todos.js                       # Todo task management
│   ├── GET    /api/todos         
│   ├── POST   /api/todos         
│   ├── PATCH  /api/todos/:id     
│   └── DELETE /api/todos/:id     
│
├── vault.js                       # Encrypted vault (AES-256)
│   ├── GET    /api/vault         # Get all vault items (encrypted)
│   ├── POST   /api/vault         # Create encrypted item
│   ├── POST   /api/vault/:id/decrypt  # Decrypt specific item
│   ├── PATCH  /api/vault/:id     # Update item (re-encrypt)
│   └── DELETE /api/vault/:id     # Delete vault item
│
├── documents.js                   # Document storage
│   ├── GET    /api/documents     
│   ├── POST   /api/documents     # Upload to Supabase Storage
│   ├── PATCH  /api/documents/:id 
│   └── DELETE /api/documents/:id # Delete file + metadata
│
└── test-db.js                     # Database health check
    └── GET    /api/test-db       # Verify Supabase connection
```

### Authentication Middleware
```
backend/src/config/supabase.js
├── createClient()                # Supabase service role client
└── getUserFromToken()            # JWT verification middleware
    ├── Extracts Bearer token from Authorization header
    ├── Validates token with Supabase Auth
    ├── Returns user object or error
    └── Used in all protected routes
```

### Business Logic & Encryption
```
backend/src/config/
└── supabase.js                   # Supabase connection + auth helper

Encryption (in routes/vault.js):
├── Encrypt: CryptoJS.AES.encrypt(content, SECRET)
└── Decrypt: CryptoJS.AES.decrypt(encrypted, SECRET)
```

---

## 🗄️ Database Layer (Supabase PostgreSQL)

### Tables Schema
```sql
-- Users (managed by Supabase Auth)
users
├── id (uuid, primary key)
├── email
├── created_at
└── updated_at

-- Notes
notes
├── id (uuid, primary key)
├── user_id (foreign key → users.id)
├── title
├── content
├── tags (text[])
├── created_at
└── updated_at

-- Reminders
reminders
├── id (uuid, primary key)
├── user_id (foreign key → users.id)
├── title
├── description
├── reminder_date
├── is_completed (boolean)
├── created_at
└── updated_at

-- Todos
todos
├── id (uuid, primary key)
├── user_id (foreign key → users.id)
├── title
├── description
├── priority (low/medium/high)
├── status (pending/in_progress/completed)
├── due_date
├── created_at
└── updated_at

-- Vault (Encrypted Storage)
vault
├── id (uuid, primary key)
├── user_id (foreign key → users.id)
├── title
├── encrypted_content (text, AES-256)
├── category
├── created_at
└── updated_at

-- Documents Metadata
documents
├── id (uuid, primary key)
├── user_id (foreign key → users.id)
├── name
├── description
├── file_path (Supabase Storage path)
├── file_size
├── mime_type
├── tags (text[])
├── created_at
└── updated_at
```

### Storage Buckets
```
Supabase Storage:
└── documents/                         # File storage bucket
    └── {user_id}/                     # User-specific folders
        └── {file_name}                # Uploaded files
```

### Row Level Security (RLS)
All tables have RLS policies ensuring users can only access their own data:
- `SELECT`: `user_id = auth.uid()`
- `INSERT`: `user_id = auth.uid()`
- `UPDATE`: `user_id = auth.uid()`
- `DELETE`: `user_id = auth.uid()`

---

## 🔐 Security Layer

### Authentication
- **Provider**: Supabase Auth with Google OAuth 2.0
- **Flow**: 
  1. User clicks "Sign in with Google"
  2. Redirects to Google consent screen
  3. Callback to `/auth/callback` with code
  4. Server exchanges code for session token
  5. Session stored in HTTP-only cookies

### Authorization
- **Middleware**: Checks authentication on all `/dashboard/*` routes
- **Database**: RLS policies enforce user isolation
- **API Routes**: Verify `user_id` from session matches requested resources

### Data Encryption
- **Vault Content**: AES-256-CBC encryption with user-specific keys
- **Transport**: HTTPS for all requests
- **Storage**: Encrypted at rest by Supabase

---

## 📊 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Frontend)                         │
│                  https://memo-sphere.vercel.app                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Browser    │  │  React UI    │  │  State Mgmt  │             │
│  │   (Next.js)  │  │  Components  │  │  (Zustand)   │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                  │                      │
│         └─────────────────┴──────────────────┘                      │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ 
                          │ HTTPS API Requests
                          │ Authorization: Bearer <JWT>
                          │ 
┌─────────────────────────▼───────────────────────────────────────────┐
│                     SERVER LAYER (Backend)                          │
│                https://memo-sphere-backend.vercel.app               │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │              Express.js Server (Node.js)                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │ │
│  │  │   CORS      │  │  JWT Auth   │  │  API Routes │          │ │
│  │  │ Middleware  │→ │ Middleware  │→ │  (Express)  │          │ │
│  │  └─────────────┘  └─────────────┘  └─────┬───────┘          │ │
│  │                                            │                  │ │
│  │  ┌─────────────────────────────────────────▼───────────────┐ │ │
│  │  │           Business Logic Layer                          │ │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │ │ │
│  │  │  │  Validation  │  │  Encryption  │  │  File Upload │  │ │ │
│  │  │  │   (Zod)      │  │  (AES-256)   │  │  (Supabase)  │  │ │ │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘  │ │ │
│  │  └─────────────────────────┬──────────────────────────────┘ │ │
│  └────────────────────────────┼────────────────────────────────┘ │
└───────────────────────────────┼──────────────────────────────────┘
                                │ 
                                │ SQL Queries (PostgreSQL)
                                │ Storage API (File uploads)
                                │ Auth API (JWT validation)
                                │ 
┌───────────────────────────────▼──────────────────────────────────────┐
│                    DATABASE LAYER (Supabase)                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │           Supabase Cloud (PostgreSQL + Storage)               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │   Tables    │  │   Storage   │  │   Auth      │          │  │
│  │  │  - users    │  │  Buckets    │  │  JWT Tokens │          │  │
│  │  │  - notes    │  │ (documents) │  │  Sessions   │          │  │
│  │  │  - todos    │  │             │  │  Google     │          │  │
│  │  │  - reminders│  │             │  │  OAuth      │          │  │
│  │  │  - vault    │  │             │  │             │          │  │
│  │  │  - documents│  │             │  │             │          │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │  │
│  │                                                               │  │
│  │  Row Level Security (RLS): All queries filtered by user_id   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Lifecycle Example

### Example: Creating a Note

**Frontend (https://memo-sphere.vercel.app)**
1. User types note in `NoteForm.tsx` → clicks "Save"
2. Component calls: `apiFetch('/api/notes', { method: 'POST', body: JSON.stringify(data) })`
3. `apiFetch` helper:
   - Gets Supabase session from client
   - Extracts JWT access token
   - Adds `Authorization: Bearer <token>` header
   - Makes HTTPS request to backend

**Backend (https://memo-sphere-backend.vercel.app)**
4. Express receives POST request at `/api/notes`
5. CORS middleware validates origin (memo-sphere.vercel.app)
6. Route handler: `getUserFromToken(req.headers.authorization)`
   - Extracts Bearer token
   - Calls Supabase Auth API to verify token
   - Returns user object with user_id
7. Validation: Checks title, content fields
8. Database: `supabase.from('notes').insert({ user_id, title, content })`
9. RLS Policy: Supabase verifies `user_id` matches auth token
10. Response: `res.json({ id, title, content, created_at })`

**Frontend Response**
11. `apiFetch` returns response
12. Component calls `loadNotes()` to refresh list
13. UI updates with new note

**Total Round Trip**: ~200-500ms (depending on regions)

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│              Vercel Edge Network (CDN)                   │
│                                                           │
│  ┌────────────────────────┐  ┌─────────────────────────┐│
│  │  Frontend Instance     │  │  Backend Instance       ││
│  │  memo-sphere.vercel    │  │  memo-sphere-backend    ││
│  │                        │  │  .vercel.app            ││
│  │  ┌──────────────────┐ │  │  ┌───────────────────┐  ││
│  │  │ Next.js SSR/SSG  │ │  │  │ Express.js Server │  ││
│  │  │ Static Assets    │ │  │  │ API Routes        │  ││
│  │  │ React Components │ │  │  │ JWT Middleware    │  ││
│  │  └──────────────────┘ │  │  └───────────────────┘  ││
│  │                        │  │                         ││
│  │  Edge Caching:         │  │  Serverless Functions:  ││
│  │  - CSS/JS Bundles      │  │  - Auto-scaling        ││
│  │  - Images              │  │  - Cold starts ~50ms   ││
│  │  - PWA Manifest        │  │  - Pay-per-request     ││
│  └────────────────────────┘  └─────────────────────────┘│
│                                                           │
│  Environment Variables (Encrypted):                      │
│  Frontend: NEXT_PUBLIC_*, GOOGLE_*                       │
│  Backend: SUPABASE_*, ENCRYPTION_*, VAPID_*              │
└──────────────────────────────────────────────────────────┘
                             │
                             │ Both connect to:
                             ▼
        ┌───────────────────────────────────────┐
        │   Supabase Cloud Infrastructure       │
        │                                        │
        │  PostgreSQL Database (us-east-1)      │
        │  Storage Buckets (S3-compatible)      │
        │  Auth Service (JWT generation)        │
        │  Realtime Subscriptions               │
        │                                        │
        │  99.9% Uptime SLA                     │
        │  Automatic Backups                    │
        │  Connection Pooling                   │
        └───────────────────────────────────────┘
```

### Deployment URLs
- **Frontend**: https://memo-sphere.vercel.app
- **Backend**: https://memo-sphere-backend.vercel.app
- **API Base**: https://memo-sphere-backend.vercel.app/api

### Key Benefits of Separated Architecture
1. **Independent Scaling**: Frontend and backend scale separately
2. **Technology Flexibility**: Can swap backend framework without affecting UI
3. **Clear Separation**: API contracts define boundaries
4. **Multiple Frontends**: Could add mobile app hitting same backend
5. **Specialized Deployment**: Different caching strategies per layer

---

## 📦 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15, React 19 | Server-side rendering, routing |
| **Frontend Language** | TypeScript | Type-safe development |
| **Styling** | Tailwind CSS | Utility-first styling |
| **State** | Zustand | Client state management |
| **Backend** | Node.js 18, Express.js | RESTful API server |
| **API Auth** | JWT (via Supabase) | Token-based authentication |
| **Database** | Supabase PostgreSQL | Relational data storage |
| **Storage** | Supabase Storage (S3) | File uploads |
| **Auth** | Supabase Auth + Google OAuth | User authentication |
| **Encryption** | crypto-js (AES-256) | Vault data encryption |
| **CORS** | cors (Express middleware) | Cross-origin requests |
| **Deployment** | Vercel (2 instances) | Serverless hosting |
| **CI/CD** | GitHub + Vercel | Auto-deploy on push |

---
Separated Frontend/Backend**: Enables independent scaling, clearer API contracts, and technology flexibility
2. **JWT Authentication**: Stateless auth tokens passed via Authorization headers
3. **CORS Configuration**: Explicit origin whitelisting for security
4. **Service Role Key**: Backend uses privileged Supabase access for server-side operations
5. **Row Level Security**: Database-level authorization (double security layer)
6. **Client-Side Encryption**: Zero-knowledge vault storage (backend never sees plaintext)
7. **Serverless API**: Auto-scaling Express.js on Vercel Functions
8. **Edge Caching**: Frontend static assets served from nearest CDN location
9. **Dual Deployment**: Frontend and backend deployed separately for resilience
4. **Client-Side Encryption**: Zero-knowledge vault storage
5. **Serverless API**: Auto-scaling, pay-per-use pricing
6. **Edge Caching**: Static assets served from nearest location
