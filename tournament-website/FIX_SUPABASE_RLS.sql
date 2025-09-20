-- 🔧 FIX EXISTING SUPABASE DATABASE
-- Run this script to fix the RLS policies for existing tables

-- First, let's check what tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Add missing RLS policy for INSERT on users table (this is likely what's missing)
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure all other policies exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users 
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users 
    FOR UPDATE USING (auth.uid() = id);

-- Check if tournaments table exists and create policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tournaments') THEN
        DROP POLICY IF EXISTS "Users can view all tournaments" ON tournaments;
        CREATE POLICY "Users can view all tournaments" ON tournaments FOR SELECT TO authenticated;
    END IF;
END $$;

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- Success message
SELECT 'RLS policies fixed! 🎉 Try Google login again.' as status;
