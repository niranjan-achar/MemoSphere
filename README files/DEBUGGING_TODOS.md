# 🐛 Debugging To-Do 500 Error

## Current Issue
Getting a 500 Internal Server Error when creating a to-do item.

## Debugging Steps

### Step 1: Check Server Logs
The improved error handling should now show detailed error messages. Look for:
1. Open your browser Developer Tools (F12)
2. Go to the Console tab
3. Try creating a todo
4. Look for error messages starting with "Create todo error:"

### Step 2: Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try creating a todo
4. Click on the failed `todos` request
5. Look at the Response tab for detailed error message

### Step 3: Test Database Connection
Navigate to: http://localhost:3000/api/test-db

This endpoint will tell you:
- If authentication is working
- If database connection is working
- If the todos table is accessible

### Step 4: Verify Database Setup in Supabase

1. Go to your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the content from `supabase/test-todos-table.sql`
4. Run each query to check:
   - Does the table exist?
   - Is RLS enabled?
   - Are policies correct?
   - Are triggers set up?

### Step 5: Check Authentication

Make sure you're logged in:
1. Go to http://localhost:3000/auth/login
2. Sign in or sign up
3. Then try creating a todo again

### Common Issues and Solutions

#### Issue: "relation public.todos does not exist"
**Solution:** Run the database migrations:
1. Go to Supabase Dashboard > SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/migrations/002_rls_policies.sql`

#### Issue: "new row violates row-level security policy"
**Solution:** Make sure you're authenticated and the RLS policies are correct:
1. Check you're logged in
2. Verify RLS policies in Supabase Dashboard > Authentication > Policies

#### Issue: "column 'X' does not exist"
**Solution:** The table schema doesn't match. Re-run the initial schema migration.

#### Issue: "null value in column 'user_id' violates not-null constraint"
**Solution:** Authentication isn't working. Check:
1. Are you logged in?
2. Is the session cookie being sent?
3. Check `.env.local` has correct Supabase credentials

### Step 6: Manual Test in Supabase

1. Go to Supabase Dashboard > Table Editor
2. Select the `todos` table  
3. Click "Insert row"
4. Fill in:
   - user_id: (get from auth.users table)
   - task: "Test Task"
   - priority: "medium"
   - status: "todo"
5. Click "Save"

If this works, the table is fine and the issue is in the API route or authentication.

### Step 7: Check Environment Variables

Verify your `.env.local` file has:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Restart the dev server after any `.env.local` changes:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Expected Error Messages

With the improved logging, you should see one of these errors:

**Auth Error:**
```
Auth error: {...}
Failed to create todo: Unauthorized
```

**Database Error:**
```
Error details: {
  message: "...",
  code: "...",
  details: "...",
  hint: "..."
}
```

**Network Error:**
```
Error creating todo: TypeError: Failed to fetch
```

## Next Steps Based on Error

### If you see "Unauthorized":
1. Check if you're logged in
2. Check browser cookies
3. Try logging out and back in

### If you see database error with code "42P01":
- Table doesn't exist
- Run migrations

### If you see database error with code "42501":
- RLS policy blocking insert
- Check RLS policies
- Verify user_id matches auth.uid()

### If you see database error with code "23502":
- Missing required field
- Check what field is mentioned
- Verify the data being sent

### If you see database error with code "23503":
- Foreign key constraint violation
- user_id doesn't exist in users table
- Need to create user record first

## Testing with cURL

You can also test the API directly:

```bash
# Replace YOUR_SESSION_COOKIE with actual cookie from browser
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "task": "Test Task",
    "description": "Testing",
    "priority": "medium",
    "status": "todo",
    "due_date": null
  }'
```

## Still Not Working?

Share the following information:
1. Complete error message from browser console
2. Response from /api/test-db endpoint
3. Results from running test-todos-table.sql
4. Supabase project URL (without sensitive data)
5. Are reminders and notes working?

## Quick Checklist

- [ ] Database migrations have been run
- [ ] Todos table exists in Supabase
- [ ] RLS is enabled on todos table
- [ ] RLS policies exist for todos table
- [ ] Environment variables are set correctly
- [ ] User is authenticated/logged in
- [ ] User record exists in users table
- [ ] Dev server has been restarted
- [ ] Browser cache has been cleared
- [ ] Checked browser console for errors
- [ ] Checked /api/test-db endpoint
