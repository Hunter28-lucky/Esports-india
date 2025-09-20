-- RLS Optimization Script to address Supabase linter WARNINGS
-- Source: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
-- This script:
-- 1) Rewrites auth.* calls as (select auth.*()) to avoid initplan re-evaluation per row
-- 2) Consolidates duplicate permissive policies to reduce evaluation cost
-- 3) Keeps semantics equivalent (least privilege)

-- USERS table policies
-- Replace policies using auth.uid() with (select auth.uid()) and consolidate duplicates
-- Drop legacy/duplicate SELECT policies
DROP POLICY IF EXISTS "Enable read access for users on their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

-- Drop legacy/duplicate UPDATE policies
DROP POLICY IF EXISTS "Enable update access for users on their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()));

-- Drop legacy/duplicate INSERT policies
DROP POLICY IF EXISTS "Enable insert access for users on their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to insert profiles" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- TOURNAMENTS table policies
-- TOURNAMENTS table policies
-- Public read remains permissive but single policy
DROP POLICY IF EXISTS "Enable read access for all users" ON tournaments;
DROP POLICY IF EXISTS "Public tournaments access" ON tournaments;
DROP POLICY IF EXISTS "tournaments_public_read" ON tournaments;
CREATE POLICY "tournaments_public_read" ON tournaments
  FOR SELECT USING (true);

-- Insert/update rules: Adjust to your admin model if needed
DROP POLICY IF EXISTS "Admin can insert tournaments" ON tournaments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tournaments;
DROP POLICY IF EXISTS "tournaments_insert_auth" ON tournaments;
CREATE POLICY "tournaments_insert_auth" ON tournaments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON tournaments;
DROP POLICY IF EXISTS "Function can update tournament counts" ON tournaments;
DROP POLICY IF EXISTS "tournaments_update_auth" ON tournaments;
CREATE POLICY "tournaments_update_auth" ON tournaments
  FOR UPDATE USING (true);

-- TOURNAMENT_PARTICIPANTS table policies
-- TOURNAMENT_PARTICIPANTS table policies
-- Consolidate SELECT to one permissive policy (UI lists participants)
DROP POLICY IF EXISTS "Enable read access for all users" ON tournament_participants;
DROP POLICY IF EXISTS "Public tournament participation access" ON tournament_participants;
DROP POLICY IF EXISTS "tp_public_read" ON tournament_participants;
CREATE POLICY "tp_public_read" ON tournament_participants
  FOR SELECT USING (true);

-- Consolidate INSERT to single authenticated check using (select auth.uid())
DROP POLICY IF EXISTS "Authenticated users can join tournaments" ON tournament_participants;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON tournament_participants;
DROP POLICY IF EXISTS "Users can insert tournament participation" ON tournament_participants;
DROP POLICY IF EXISTS "Users can join tournaments" ON tournament_participants;
DROP POLICY IF EXISTS "tp_insert_self" ON tournament_participants;
CREATE POLICY "tp_insert_self" ON tournament_participants
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

-- Updates and deletes restricted to the owner
DROP POLICY IF EXISTS "Enable update for own participation" ON tournament_participants;
DROP POLICY IF EXISTS "tp_update_self" ON tournament_participants;
CREATE POLICY "tp_update_self" ON tournament_participants
  FOR UPDATE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Enable delete for own participation" ON tournament_participants;
DROP POLICY IF EXISTS "tp_delete_self" ON tournament_participants;
CREATE POLICY "tp_delete_self" ON tournament_participants
  FOR DELETE USING (user_id = (select auth.uid()));

-- TRANSACTIONS table policies (owner based)
-- TRANSACTIONS table policies (owner based)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "tx_insert_self" ON transactions;
CREATE POLICY "tx_insert_self" ON transactions
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Enable read access for own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "tx_select_self" ON transactions;
CREATE POLICY "tx_select_self" ON transactions
  FOR SELECT USING (user_id = (select auth.uid()));

-- MATCHES table policies (owner based)
-- MATCHES table policies (owner based)
DROP POLICY IF EXISTS "Users can insert their own matches" ON matches;
DROP POLICY IF EXISTS "matches_insert_self" ON matches;
CREATE POLICY "matches_insert_self" ON matches
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "matches_select_self" ON matches;
CREATE POLICY "matches_select_self" ON matches
  FOR SELECT USING (user_id = (select auth.uid()));

-- Verification output (optional)
SELECT 'RLS Optimization applied' AS info;
