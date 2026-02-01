# Memorie Backend

Node.js + Express backend for Memorie application.

## Features

- RESTful API endpoints
- Supabase PostgreSQL integration
- JWT authentication via Supabase Auth
- AES-256 encryption for vault items
- CORS enabled for frontend communication

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (JWT tokens)
- **Encryption**: crypto-js (AES-256)

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Run development server:
```bash
npm run dev
```

4. Run production server:
```bash
npm start
```

## API Endpoints

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create reminder
- `PATCH /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

### Todos
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create todo
- `PATCH /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

### Vault
- `GET /api/vault` - Get all vault items
- `POST /api/vault` - Create encrypted item
- `POST /api/vault/:id/decrypt` - Decrypt item
- `PATCH /api/vault/:id` - Update item
- `DELETE /api/vault/:id` - Delete item

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Upload document
- `PATCH /api/documents/:id` - Update metadata
- `DELETE /api/documents/:id` - Delete document

## Authentication

All API requests require an `Authorization` header with a Bearer token:

```
Authorization: Bearer <supabase_access_token>
```

The token is obtained from Supabase Auth during login.

## Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd backend
vercel
```

3. Set environment variables in Vercel dashboard

4. Your backend will be available at: `https://your-backend.vercel.app`

## Environment Variables

See `.env.example` for required variables.

## Project Structure

```
backend/
├── src/
│   ├── server.js           # Express app entry point
│   ├── config/
│   │   └── supabase.js     # Supabase client config
│   └── routes/
│       ├── notes.js        # Notes endpoints
│       ├── reminders.js    # Reminders endpoints
│       ├── todos.js        # Todos endpoints
│       ├── vault.js        # Vault endpoints
│       ├── documents.js    # Documents endpoints
│       └── test-db.js      # DB health check
├── package.json
├── vercel.json             # Vercel deployment config
└── .env                    # Environment variables
```
