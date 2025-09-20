-- 🔧 TOURNAMENT PARTICIPANTS TABLE FIX
-- Run this script in Supabase SQL Editor to ensure tournament joining works

-- Step 1: Create tournament_participants table if it doesn't exist
CREATE TABLE IF NOT EXISTS tournament_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'registered',
    UNIQUE(tournament_id, user_id)
);

-- Step 2: Enable RLS on tournament_participants
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies for tournament_participants
DROP POLICY IF EXISTS "Users can view tournament participants" ON tournament_participants;
DROP POLICY IF EXISTS "Users can join tournaments" ON tournament_participants;
DROP POLICY IF EXISTS "Users can manage their participation" ON tournament_participants;

-- Allow anyone to view participants (for participant lists)
CREATE POLICY "Enable read access for all users" 
ON tournament_participants FOR SELECT 
USING (true);

-- Allow authenticated users to join tournaments
CREATE POLICY "Enable insert for authenticated users" 
ON tournament_participants FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow users to manage their own participation
CREATE POLICY "Enable update for own participation" 
ON tournament_participants FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to leave tournaments
CREATE POLICY "Enable delete for own participation" 
ON tournament_participants FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Step 4: Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Enable RLS on transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for transactions
DROP POLICY IF EXISTS "Users can view their transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON transactions;

CREATE POLICY "Enable read access for own transactions" 
ON transactions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" 
ON transactions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Step 7: Verify table structures
SELECT 'Tournament Participants Table Structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tournament_participants' 
ORDER BY ordinal_position;

SELECT 'Transactions Table Structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

SELECT 'RLS Policies:' as info;
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('tournament_participants', 'transactions');

-- Success message
SELECT '✅ Tournament joining system setup completed!' as result;