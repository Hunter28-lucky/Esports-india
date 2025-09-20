-- 🔧 SUPABASE DATABASE FIX
-- Run this script to fix existing database issues

-- First, let's check what existssaw
SELECT 'Checking existing tables...' as status;

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'tournaments', 'tournament_participants', 'matches', 'transactions');

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view all tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can view their own tournament participation" ON tournament_participants;
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies with better permissions
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow all authenticated users to view tournaments
CREATE POLICY "Users can view all tournaments" ON tournaments FOR SELECT TO authenticated;

-- Allow users to insert tournament participation
CREATE POLICY "Users can view their own tournament participation" ON tournament_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert tournament participation" ON tournament_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view and insert their own matches
CREATE POLICY "Users can view their own matches" ON matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own matches" ON matches FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view and insert their own transactions
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Check if sample tournaments exist, if not add them
INSERT INTO tournaments (name, game, entry_fee, prize_pool, max_players, start_time) 
SELECT 'Free Fire Championship', 'Free Fire', 50, 4500, 100, NOW() + INTERVAL '2 hours 15 minutes'
WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE name = 'Free Fire Championship');

INSERT INTO tournaments (name, game, entry_fee, prize_pool, max_players, start_time) 
SELECT 'PUBG Mobile Pro', 'PUBG Mobile', 100, 5800, 64, NOW() + INTERVAL '45 minutes'
WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE name = 'PUBG Mobile Pro');

INSERT INTO tournaments (name, game, entry_fee, prize_pool, max_players, start_time) 
SELECT 'Valorant Masters', 'Valorant', 200, 8500, 50, NOW() + INTERVAL '6 hours 30 minutes'
WHERE NOT EXISTS (SELECT 1 FROM tournaments WHERE name = 'Valorant Masters');

-- Verify the fix
SELECT 'Database fix complete! ✅' as status;
SELECT 'Tables:' as info, count(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';
SELECT 'Policies:' as info, count(*) as policy_count FROM pg_policies WHERE schemaname = 'public';
SELECT 'Tournaments:' as info, count(*) as tournament_count FROM tournaments;
