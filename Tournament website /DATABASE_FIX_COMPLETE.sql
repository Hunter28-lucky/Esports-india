-- ==============================================
-- COMPREHENSIVE DATABASE FIX SCRIPT
-- ==============================================
-- This script fixes:
-- 1. Missing image_url column in tournaments table
-- 2. PostgreSQL function syntax issues
-- 3. RLS policies for proper access
-- 4. Sample data for testing
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
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can view their own tournament participation" ON tournament_participants;

-- Create new policies for tournaments (allow everyone to read)
CREATE POLICY "Anyone can view tournaments" ON tournaments 
    FOR SELECT USING (true);

-- Allow users to view tournament participation
CREATE POLICY "Users can view tournament participation" ON tournament_participants 
    FOR SELECT USING (true);

-- Allow users to join tournaments
CREATE POLICY "Users can join tournaments" ON tournament_participants 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 5: Update existing tournaments with default images
UPDATE tournaments 
SET image_url = CASE 
    WHEN LOWER(game) LIKE '%free fire%' THEN '/free-fire-championship-tournament-esports.jpg'
    WHEN LOWER(game) LIKE '%pubg%' OR LOWER(game) LIKE '%bgmi%' THEN '/pubg-mobile-pro-tournament-esports.jpg'
    WHEN LOWER(game) LIKE '%valorant%' THEN '/valorant-masters-tournament-esports.jpg'
    ELSE '/placeholder.jpg'
END
WHERE image_url IS NULL OR image_url = '';

-- Step 6: Insert sample tournament participants for testing
-- Note: We can only insert users that exist in auth.users
-- Let's check if there are any existing auth users and use one of them
-- If no auth users exist, we'll skip creating test participations

-- Try to add sample participations using existing auth users (if any)
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Try to find an existing user from auth.users
    SELECT id INTO existing_user_id 
    FROM auth.users 
    LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- Insert user profile if not exists
        INSERT INTO users (id, email, full_name, wallet_balance) 
        VALUES (existing_user_id, 'user@example.com', 'Test User', 1000)
        ON CONFLICT (id) DO NOTHING;
        
        -- Add sample tournament participations
        INSERT INTO tournament_participants (tournament_id, user_id) 
        SELECT t.id, existing_user_id
        FROM tournaments t 
        WHERE NOT EXISTS (
            SELECT 1 FROM tournament_participants tp 
            WHERE tp.tournament_id = t.id 
            AND tp.user_id = existing_user_id
        )
        LIMIT 2;
        
        RAISE NOTICE 'Created test participations for user: %', existing_user_id;
    ELSE
        RAISE NOTICE 'No auth users found - skipping test participation creation';
        RAISE NOTICE 'Sign up a user first, then run this script again to create test data';
    END IF;
END $$;

-- Step 7: Verify the setup
SELECT 'Tournaments table structure:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

SELECT 'Sample tournaments:' as info;
SELECT id, name, game, image_url, entry_fee, prize_pool, status
FROM tournaments 
LIMIT 3;

SELECT 'Sample tournament participations:' as info;
SELECT tp.id, t.name as tournament_name, tp.user_id
FROM tournament_participants tp
JOIN tournaments t ON tp.tournament_id = t.id
LIMIT 3;

-- Success message
SELECT '✅ Database fix completed successfully!' as result;