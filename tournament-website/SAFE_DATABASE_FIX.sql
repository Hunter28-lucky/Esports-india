-- ==============================================
-- SAFE DATABASE FIX SCRIPT (No User Creation)
-- ==============================================
-- This script fixes database issues without creating test users
-- that could cause foreign key constraint violations
-- ==============================================

-- Step 1: Add missing image_url column to tournaments table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tournaments' AND column_name = 'image_url') THEN
        ALTER TABLE tournaments ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url column to tournaments table';
    ELSE
        RAISE NOTICE 'image_url column already exists';
    END IF;
END $$;

-- Step 2: Fix the trigger function (this might be causing $ syntax errors)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $update_trigger$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$update_trigger$ LANGUAGE plpgsql;

-- Step 3: Recreate the trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Update RLS policies to allow proper access
-- Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Users can view all tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can view their own tournament participation" ON tournament_participants;
DROP POLICY IF EXISTS "Anyone can view tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can view tournament participation" ON tournament_participants;
DROP POLICY IF EXISTS "Public tournaments access" ON tournaments;
DROP POLICY IF EXISTS "Public tournament participation access" ON tournament_participants;
DROP POLICY IF EXISTS "Authenticated users can join tournaments" ON tournament_participants;

-- Create new policies for tournaments (allow everyone to read)
CREATE POLICY "Public tournaments access" ON tournaments 
    FOR SELECT USING (true);

-- Allow users to view tournament participation
CREATE POLICY "Public tournament participation access" ON tournament_participants 
    FOR SELECT USING (true);

-- Allow authenticated users to join tournaments
CREATE POLICY "Authenticated users can join tournaments" ON tournament_participants 
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Step 5: Update existing tournaments with default images
UPDATE tournaments 
SET image_url = CASE 
    WHEN LOWER(game) LIKE '%free fire%' THEN '/free-fire-championship-tournament-esports.jpg'
    WHEN LOWER(game) LIKE '%pubg%' OR LOWER(game) LIKE '%bgmi%' THEN '/pubg-mobile-pro-tournament-esports.jpg'
    WHEN LOWER(game) LIKE '%valorant%' THEN '/valorant-masters-tournament-esports.jpg'
    ELSE '/placeholder.jpg'
END
WHERE image_url IS NULL OR image_url = '';

-- Step 6: Add some sample tournaments if table is empty
INSERT INTO tournaments (name, game, entry_fee, prize_pool, max_players, start_time, image_url) 
SELECT * FROM (
    VALUES 
    ('Free Fire Championship', 'Free Fire', 50, 4500, 100, NOW() + INTERVAL '2 hours', '/free-fire-championship-tournament-esports.jpg'),
    ('PUBG Mobile Pro Tournament', 'PUBG Mobile', 100, 5800, 64, NOW() + INTERVAL '1 hour', '/pubg-mobile-pro-tournament-esports.jpg'),
    ('Valorant Masters Cup', 'Valorant', 200, 8500, 50, NOW() + INTERVAL '6 hours', '/valorant-masters-tournament-esports.jpg')
) AS new_tournaments(name, game, entry_fee, prize_pool, max_players, start_time, image_url)
WHERE NOT EXISTS (SELECT 1 FROM tournaments LIMIT 1);

-- Step 7: Verify the setup
SELECT 'Tournaments table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

SELECT 'Sample tournaments:' as info;
SELECT id, name, game, image_url, entry_fee, prize_pool, status, start_time
FROM tournaments 
LIMIT 5;

SELECT 'RLS Policies:' as info;
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename IN ('tournaments', 'tournament_participants');

-- Success message
SELECT '✅ Safe database fix completed successfully!' as result;
SELECT 'ℹ️  To test My Tournaments, sign up a user in your app first' as note;