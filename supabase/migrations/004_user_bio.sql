-- Add bio column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;

-- Add constraint for max length (160 chars like Twitter)
ALTER TABLE user_profiles
ADD CONSTRAINT bio_max_length CHECK (char_length(bio) <= 160);
