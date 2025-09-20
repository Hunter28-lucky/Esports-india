-- Check if tournaments table exists and show its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tournaments' 
AND table_schema = 'public';

-- Show all tables in the database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Test basic insert (you can run this in Supabase SQL editor)
-- INSERT INTO tournaments (name, game, entry_fee, prize_pool, max_players, status, start_time)
-- VALUES ('Test Tournament', 'Free Fire', 50, 500, 50, 'upcoming', NOW() + INTERVAL '1 hour');
