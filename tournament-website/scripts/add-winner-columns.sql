-- Add winner columns to tournaments table
ALTER TABLE tournaments 
ADD COLUMN winner_user_id UUID REFERENCES users(id),
ADD COLUMN winner_name TEXT;

-- Add index for better performance on winner queries
CREATE INDEX idx_tournaments_winner ON tournaments(winner_user_id);
