-- ColorSketch Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- User Profiles (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    avatar_url TEXT,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- User Progress (XP, Level, Streak)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    xp_to_next_level INTEGER NOT NULL DEFAULT 100,
    total_xp_earned INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_sketches INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to create progress on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_progress()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_progress (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_progress ON auth.users;
CREATE TRIGGER on_auth_user_created_progress
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_progress();


-- ============================================
-- User Achievements
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ============================================
-- Sketch Progress (fills, drawings per sketch)
-- ============================================
CREATE TABLE IF NOT EXISTS public.sketch_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sketch_id TEXT NOT NULL,
    fills JSONB NOT NULL DEFAULT '{}'::jsonb,
    drawing_data TEXT, -- Base64 canvas data
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, sketch_id)
);

-- Enable RLS
ALTER TABLE public.sketch_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own sketch progress" ON public.sketch_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sketch progress" ON public.sketch_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sketch progress" ON public.sketch_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sketch progress" ON public.sketch_progress
    FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- Saved Artworks (exported/shared art)
-- ============================================
CREATE TABLE IF NOT EXISTS public.saved_artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sketch_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.saved_artworks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own artworks" ON public.saved_artworks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public artworks" ON public.saved_artworks
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own artworks" ON public.saved_artworks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own artworks" ON public.saved_artworks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own artworks" ON public.saved_artworks
    FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_sketch_progress_user_id ON public.sketch_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_sketch_progress_sketch_id ON public.sketch_progress(sketch_id);
CREATE INDEX IF NOT EXISTS idx_saved_artworks_user_id ON public.saved_artworks(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_artworks_public ON public.saved_artworks(is_public) WHERE is_public = true;


-- ============================================
-- Updated_at triggers
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_sketch_progress_updated_at ON public.sketch_progress;
CREATE TRIGGER update_sketch_progress_updated_at
    BEFORE UPDATE ON public.sketch_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_saved_artworks_updated_at ON public.saved_artworks;
CREATE TRIGGER update_saved_artworks_updated_at
    BEFORE UPDATE ON public.saved_artworks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
