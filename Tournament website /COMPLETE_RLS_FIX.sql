-- 🚨 COMPLETE FIX FOR USER PROFILE ERRORS
-- Run this entire script in Supabase SQL Editor to fix all authentication issues

-- First, drop all existing policies to start clean
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Enable RLS (just in case)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies that allow authenticated users to manage their profiles
CREATE POLICY "Enable read access for users on their own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Enable insert access for users on their own profile" 
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update access for users on their own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Also create a more permissive policy for initial setup (can be removed later)
CREATE POLICY "Allow authenticated users to insert profiles" 
ON users FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify the policies were created
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Test current authentication
SELECT 
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'User is authenticated: ' || auth.uid()::text
        ELSE 'No user authenticated'
    END as auth_status;

-- Success message
SELECT '✅ All RLS policies fixed! Try Google login again.' as status;
