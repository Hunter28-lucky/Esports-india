-- 🔧 FIX TOURNAMENT CREATION ISSUE
-- This script adds the missing INSERT policy for tournaments table
-- Run this in Supabase SQL Editor to allow admins to create tournaments

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Admin can insert tournaments" ON tournaments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tournaments;
DROP POLICY IF EXISTS "tournaments_insert_auth" ON tournaments;

-- Create a permissive INSERT policy for authenticated users
-- You can make this more restrictive by adding admin checks if needed
CREATE POLICY "tournaments_insert_auth" ON tournaments
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'tournaments' AND cmd = 'INSERT';
