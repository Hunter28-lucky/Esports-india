-- 🔧 COMPLETE ADMIN PANEL DATABASE FIX
-- Run this script in Supabase SQL Editor to fix the admin panel loading issue

-- Step 1: Add image_url column if it doesn't exist
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

-- Step 2: Update RLS policies for tournaments table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all tournaments" ON tournaments;
DROP POLICY IF EXISTS "Admin can manage tournaments" ON tournaments;
DROP POLICY IF EXISTS "Public can view tournaments" ON tournaments;

-- Create more permissive policies for admin functionality
-- Allow anyone to view tournaments (for public browsing)
CREATE POLICY "Enable read access for all users" 
ON tournaments FOR SELECT 
USING (true);

-- Allow authenticated users to insert tournaments
CREATE POLICY "Enable insert for authenticated users" 
ON tournaments FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to update tournaments
CREATE POLICY "Enable update for authenticated users" 
ON tournaments FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete tournaments  
CREATE POLICY "Enable delete for authenticated users" 
ON tournaments FOR DELETE 
TO authenticated 
USING (true);

-- Step 3: Update existing tournaments with sample images
UPDATE tournaments 
SET image_url = CASE 
    WHEN game ILIKE '%free fire%' THEN '/free-fire-championship-tournament-esports.jpg'
    WHEN game ILIKE '%pubg%' THEN '/pubg-mobile-pro-tournament-esports.jpg'
    WHEN game ILIKE '%valorant%' THEN '/valorant-masters-tournament-esports.jpg'
    WHEN game ILIKE '%call of duty%' THEN '/placeholder.jpg'
    WHEN game ILIKE '%fortnite%' THEN '/placeholder.jpg'
    ELSE '/placeholder.jpg'
END
WHERE image_url IS NULL OR image_url = '';

-- Step 4: Verify the setup
SELECT 'Tournaments table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
ORDER BY ordinal_position;

SELECT 'RLS Policies for tournaments:' as info;
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'tournaments';

SELECT 'Sample tournament data:' as info;
SELECT id, name, game, image_url, entry_fee, prize_pool 
FROM tournaments 
LIMIT 3;

-- Success message
SELECT '✅ Admin panel database setup completed!' as result;