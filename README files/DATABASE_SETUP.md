# Database Setup Instructions

## Quick Setup Guide

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
   - Navigate to https://supabase.com
   - Select your project

2. **Run Initial Schema Migration**
   - Go to **SQL Editor**
   - Click **New Query**
   - Copy the entire content from `supabase/migrations/001_initial_schema.sql`
   - Paste into the SQL editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for success confirmation

3. **Run RLS Policies Migration**
   - Still in SQL Editor, click **New Query**
   - Copy the entire content from `supabase/migrations/002_rls_policies.sql`
   - Paste into the SQL editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for success confirmation

4. **Verify Tables Created**
   - Go to **Table Editor**
   - You should see these tables:
     - `users`
     - `chats`
     - `reminders`
     - `todos`
     - `notes`
     - `vault`
     - `documents`
     - `activity_log`

5. **Verify RLS Policies**
   - In Table Editor, click on any table
   - Go to the **Policies** tab
   - You should see policies like "Users can view own notes", etc.

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Initialize Supabase (if not already done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or run migrations manually
supabase db execute -f supabase/migrations/001_initial_schema.sql
supabase db execute -f supabase/migrations/002_rls_policies.sql
```

## What Each Migration Does

### 001_initial_schema.sql
Creates the following tables with proper relationships:
- ✅ `users` - Extended user profiles
- ✅ `chats` - AI chat conversations
- ✅ `reminders` - Time-based reminders
- ✅ `todos` - Task management
- ✅ `notes` - Note-taking system
- ✅ `vault` - Encrypted storage
- ✅ `documents` - File uploads
- ✅ `activity_log` - User activity tracking

### 002_rls_policies.sql
Sets up Row Level Security policies:
- ✅ Enables RLS on all tables
- ✅ Creates SELECT policies (users can view their own data)
- ✅ Creates INSERT policies (users can create their own data)
- ✅ Creates UPDATE policies (users can update their own data)
- ✅ Creates DELETE policies (users can delete their own data)

## Testing the Setup

After running migrations, test with these SQL queries in Supabase SQL Editor:

```sql
-- Test: Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Test: Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Test: Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Test: Count extensions
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');
```

Expected results:
- 8 tables in public schema
- RLS enabled (rowsecurity = true) on all tables
- Multiple policies per table
- 2 extensions installed

## Troubleshooting

### Issue: "extension uuid-ossp does not exist"
**Solution**: Extensions are usually pre-installed in Supabase. If not, run:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Issue: "relation already exists"
**Solution**: Tables already exist. Either:
1. Drop existing tables first (⚠️ will delete data):
   ```sql
   DROP TABLE IF EXISTS public.activity_log CASCADE;
   DROP TABLE IF EXISTS public.documents CASCADE;
   DROP TABLE IF EXISTS public.vault CASCADE;
   DROP TABLE IF EXISTS public.notes CASCADE;
   DROP TABLE IF EXISTS public.todos CASCADE;
   DROP TABLE IF EXISTS public.reminders CASCADE;
   DROP TABLE IF EXISTS public.chats CASCADE;
   DROP TABLE IF EXISTS public.users CASCADE;
   ```
2. Or skip the migration if tables are already set up correctly

### Issue: RLS policies preventing data access
**Solution**: Make sure:
1. User is authenticated
2. User ID matches the `auth.uid()`
3. Policies are correctly applied

Test with:
```sql
SELECT auth.uid(); -- Should return your user ID when authenticated
```

## Additional Optional Setup

### Create Indexes for Better Performance

Run these queries in SQL Editor for better query performance:

```sql
-- Reminders indexes
CREATE INDEX IF NOT EXISTS idx_reminders_user_datetime 
ON reminders(user_id, datetime);

CREATE INDEX IF NOT EXISTS idx_reminders_status 
ON reminders(status) WHERE status = 'pending';

-- Todos indexes
CREATE INDEX IF NOT EXISTS idx_todos_user_status 
ON todos(user_id, status);

CREATE INDEX IF NOT EXISTS idx_todos_priority 
ON todos(priority) WHERE status != 'completed';

CREATE INDEX IF NOT EXISTS idx_todos_due_date 
ON todos(due_date) WHERE due_date IS NOT NULL;

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_created 
ON notes(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notes_favorite 
ON notes(user_id) WHERE is_favorite = true;

CREATE INDEX IF NOT EXISTS idx_notes_tags 
ON notes USING gin(tags);

-- Activity log index
CREATE INDEX IF NOT EXISTS idx_activity_log_user_timestamp 
ON activity_log(user_id, timestamp DESC);
```

### Enable Realtime (Optional)

If you want real-time updates, enable Realtime for specific tables:

1. Go to **Database > Replication** in Supabase Dashboard
2. Enable replication for:
   - `reminders`
   - `todos`
   - `notes`

## Storage Setup (For Documents Feature)

If you plan to use the documents upload feature:

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Enter bucket name: `documents`
4. Set to **Private** or **Public** based on your needs
5. Click **Create bucket**

6. Set up storage policies (in SQL Editor):
```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Verification Checklist

After setup, verify:
- [ ] All 8 tables exist in Table Editor
- [ ] RLS is enabled on all tables
- [ ] Each table has 4 policies (SELECT, INSERT, UPDATE, DELETE)
- [ ] UUID and pgcrypto extensions are enabled
- [ ] Indexes are created (if you ran the optional step)
- [ ] Storage bucket is created (if using documents feature)
- [ ] You can successfully authenticate and create test data

## Next Steps

After database setup:
1. Update your `.env.local` file with Supabase credentials
2. Run `npm run dev` to start the development server
3. Sign up/login to test the features
4. Create test notes, reminders, and todos
5. Verify data appears correctly in Supabase dashboard

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard > Logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Test authentication separately
5. Check RLS policies are not too restrictive
