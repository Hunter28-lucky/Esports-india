-- 🔍 VERIFY SUPABASE RLS POLICIES
-- Run this to check if all policies are correctly configured

-- Check all policies on users table
SELECT 
    schemaname,
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Check if RLS is enabled on users table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Check if users table exists and its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Test if current user can insert (this will help debug)
SELECT 
    'Current user ID: ' || COALESCE(auth.uid()::text, 'NULL') as user_info;

-- Success message
SELECT '✅ Policy verification complete!' as status;
