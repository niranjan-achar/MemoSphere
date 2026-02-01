-- Test Query to Verify Todos Table Setup
-- Run this in Supabase SQL Editor to verify everything is working

-- 1. Check if todos table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'todos'
) AS todos_table_exists;

-- 2. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'todos' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'todos';

-- 4. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'todos';

-- 5. Test INSERT (replace 'your-user-id' with your actual user ID from auth.users)
-- First, get your user ID:
SELECT id, email FROM auth.users LIMIT 5;

-- Then test insert with your user ID:
/*
INSERT INTO public.todos (user_id, task, priority, status)
VALUES 
  ('your-user-id-here', 'Test Task', 'medium', 'todo')
RETURNING *;
*/

-- 6. Check triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'todos';
