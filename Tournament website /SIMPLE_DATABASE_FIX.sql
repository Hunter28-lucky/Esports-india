-- Simple Database Fix (if the main fix has issues)
-- Run this if you get syntax errors with the comprehensive fix

-- 1. Add image_url column
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Update existing tournaments with default images
UPDATE tournaments 
SET image_url = '/placeholder.jpg'
WHERE image_url IS NULL;

-- 3. Update RLS policies to be more permissive
ALTER TABLE tournaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants DISABLE ROW LEVEL SECURITY;

-- 4. Re-enable with simpler policies
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tournament_participants FOR SELECT USING (true);

-- 5. Insert a test user and participation
INSERT INTO users (id, email, full_name) 
VALUES ('test-user-123', 'test@test.com', 'Test User')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- 6. Add test participation
INSERT INTO tournament_participants (tournament_id, user_id)
SELECT id, 'test-user-123' FROM tournaments LIMIT 1
ON CONFLICT DO NOTHING;