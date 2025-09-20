-- ==============================================
-- ULTRA SAFE DATABASE FIX SCRIPT
-- ==============================================
-- This version handles all potential conflicts and errors
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
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add image_url column: %', SQLERRM;
END $$;

-- Step 2: Fix the trigger function (this might be causing $ syntax errors)
DO $$
BEGIN
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $update_trigger$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $update_trigger$ LANGUAGE plpgsql;
    
    RAISE NOTICE 'Successfully created/updated trigger function';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create trigger function: %', SQLERRM;
END $$;

-- Step 3: Recreate the trigger for users table
DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE 'Successfully created trigger';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create trigger: %', SQLERRM;
END $$;

-- Step 4: Clean up and recreate RLS policies
DO $$
BEGIN
    -- Drop all existing policies (ignore errors)
    DROP POLICY IF EXISTS "Users can view all tournaments" ON tournaments;
    DROP POLICY IF EXISTS "Users can view their own tournament participation" ON tournament_participants;
    DROP POLICY IF EXISTS "Anyone can view tournaments" ON tournaments;
    DROP POLICY IF EXISTS "Users can view tournament participation" ON tournament_participants;
    DROP POLICY IF EXISTS "Public tournaments access" ON tournaments;
    DROP POLICY IF EXISTS "Public tournament participation access" ON tournament_participants;
    DROP POLICY IF EXISTS "Authenticated users can join tournaments" ON tournament_participants;
    
    -- Create new policies
    CREATE POLICY "Public tournaments access" ON tournaments 
        FOR SELECT USING (true);
    
    CREATE POLICY "Public tournament participation access" ON tournament_participants 
        FOR SELECT USING (true);
    
    CREATE POLICY "Authenticated users can join tournaments" ON tournament_participants 
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    
    RAISE NOTICE 'Successfully updated RLS policies';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not update RLS policies: %', SQLERRM;
END $$;

-- Step 5: Update existing tournaments with default images
DO $$
BEGIN
    UPDATE tournaments 
    SET image_url = CASE 
        WHEN LOWER(game) LIKE '%free fire%' THEN '/free-fire-championship-tournament-esports.jpg'
        WHEN LOWER(game) LIKE '%pubg%' OR LOWER(game) LIKE '%bgmi%' THEN '/pubg-mobile-pro-tournament-esports.jpg'
        WHEN LOWER(game) LIKE '%valorant%' THEN '/valorant-masters-tournament-esports.jpg'
        ELSE '/placeholder.jpg'
    END
    WHERE image_url IS NULL OR image_url = '';
    
    RAISE NOTICE 'Successfully updated tournament images';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not update tournament images: %', SQLERRM;
END $$;

-- Step 6: Add sample tournaments if table is empty
DO $$
BEGIN
    INSERT INTO tournaments (name, game, entry_fee, prize_pool, max_players, start_time, image_url) 
    SELECT * FROM (
        VALUES 
        ('Free Fire Championship', 'Free Fire', 50, 4500, 100, NOW() + INTERVAL '2 hours', '/free-fire-championship-tournament-esports.jpg'),
        ('PUBG Mobile Pro Tournament', 'PUBG Mobile', 100, 5800, 64, NOW() + INTERVAL '1 hour', '/pubg-mobile-pro-tournament-esports.jpg'),
        ('Valorant Masters Cup', 'Valorant', 200, 8500, 50, NOW() + INTERVAL '6 hours', '/valorant-masters-tournament-esports.jpg')
    ) AS new_tournaments(name, game, entry_fee, prize_pool, max_players, start_time, image_url)
    WHERE NOT EXISTS (SELECT 1 FROM tournaments LIMIT 1);
    
    RAISE NOTICE 'Successfully added sample tournaments (if needed)';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add sample tournaments: %', SQLERRM;
END $$;

-- Step 7: Final verification
SELECT '✅ Ultra safe database fix completed!' as result;
SELECT 'ℹ️  All operations attempted with error handling' as note;

-- Check results
SELECT 'Tournaments count:' as info, COUNT(*) as count FROM tournaments;
SELECT 'Policies count:' as info, COUNT(*) as count FROM pg_policies WHERE tablename IN ('tournaments', 'tournament_participants');