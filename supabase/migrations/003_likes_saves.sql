-- ColorSketch Phase 3: Likes & Saves for Community Artworks
-- Run this in Supabase SQL Editor after 002_favorites_leaderboard.sql

-- ============================================
-- Artwork Likes (public appreciation)
-- ============================================
CREATE TABLE IF NOT EXISTS public.artwork_likes (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES public.saved_artworks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, artwork_id)
);

-- Enable RLS
ALTER TABLE public.artwork_likes ENABLE ROW LEVEL SECURITY;

-- Policies for likes
CREATE POLICY "Anyone can view likes" ON public.artwork_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own likes" ON public.artwork_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON public.artwork_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for likes
CREATE INDEX IF NOT EXISTS idx_artwork_likes_artwork_id ON public.artwork_likes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_likes_user_id ON public.artwork_likes(user_id);


-- ============================================
-- Artwork Saves/Bookmarks (private collection)
-- ============================================
CREATE TABLE IF NOT EXISTS public.artwork_saves (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES public.saved_artworks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, artwork_id)
);

-- Enable RLS
ALTER TABLE public.artwork_saves ENABLE ROW LEVEL SECURITY;

-- Policies for saves
CREATE POLICY "Anyone can view save counts" ON public.artwork_saves
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own saves" ON public.artwork_saves
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saves" ON public.artwork_saves
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for saves
CREATE INDEX IF NOT EXISTS idx_artwork_saves_artwork_id ON public.artwork_saves(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_saves_user_id ON public.artwork_saves(user_id);


-- ============================================
-- Add saves_count to saved_artworks
-- ============================================
ALTER TABLE public.saved_artworks 
ADD COLUMN IF NOT EXISTS saves_count INTEGER NOT NULL DEFAULT 0;


-- ============================================
-- Functions to update counts automatically
-- ============================================

-- Function to increment/decrement likes_count
CREATE OR REPLACE FUNCTION update_artwork_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.saved_artworks 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.artwork_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.saved_artworks 
        SET likes_count = GREATEST(0, likes_count - 1) 
        WHERE id = OLD.artwork_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment/decrement saves_count
CREATE OR REPLACE FUNCTION update_artwork_saves_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.saved_artworks 
        SET saves_count = saves_count + 1 
        WHERE id = NEW.artwork_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.saved_artworks 
        SET saves_count = GREATEST(0, saves_count - 1) 
        WHERE id = OLD.artwork_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic count updates
DROP TRIGGER IF EXISTS on_artwork_like_change ON public.artwork_likes;
CREATE TRIGGER on_artwork_like_change
    AFTER INSERT OR DELETE ON public.artwork_likes
    FOR EACH ROW EXECUTE FUNCTION update_artwork_likes_count();

DROP TRIGGER IF EXISTS on_artwork_save_change ON public.artwork_saves;
CREATE TRIGGER on_artwork_save_change
    AFTER INSERT OR DELETE ON public.artwork_saves
    FOR EACH ROW EXECUTE FUNCTION update_artwork_saves_count();
