-- Performance indexes for unindexed foreign keys (Supabase linter)
-- Safe to run multiple times thanks to IF NOT EXISTS checks.

-- Matches foreign keys
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches (tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches (user_id);

-- Tournament participants foreign keys
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON tournament_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants (tournament_id);

-- Transactions foreign keys
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);

-- Optional: composite index for common filters (by tournament then user)
-- CREATE INDEX IF NOT EXISTS idx_tp_tournament_user ON tournament_participants (tournament_id, user_id);

-- Optional: unique protection if duplicates are an issue (uncomment if you want to enforce uniqueness)
-- ALTER TABLE tournament_participants
--   ADD CONSTRAINT uq_tp_tournament_user UNIQUE (tournament_id, user_id);

SELECT 'Performance indexes ensured' AS info;
