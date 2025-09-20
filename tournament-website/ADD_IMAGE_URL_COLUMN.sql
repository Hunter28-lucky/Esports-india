-- Add image_url column to tournaments table
ALTER TABLE tournaments ADD COLUMN image_url TEXT;

-- Update existing tournaments with sample images
UPDATE tournaments 
SET image_url = CASE 
    WHEN game = 'Free Fire' THEN '/free-fire-championship-tournament-esports.jpg'
    WHEN game = 'PUBG Mobile' THEN '/pubg-mobile-pro-tournament-esports.jpg'
    WHEN game = 'Valorant' THEN '/valorant-masters-tournament-esports.jpg'
    ELSE '/placeholder.jpg'
END
WHERE image_url IS NULL;
