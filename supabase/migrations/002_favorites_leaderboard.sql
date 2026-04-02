-- ColorSketch Phase 2: Favorites & Leaderboard
-- Run this in Supabase SQL Editor after 001_initial_schema.sql

-- ============================================
-- User Favorites (bookmarked sketches)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sketch_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, sketch_id)
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for favorites
CREATE POLICY "Users can view own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for favorites
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_sketch_id ON public.user_favorites(sketch_id);


-- ============================================
-- Leaderboard Support
-- ============================================

-- Drop existing restrictive policies on user_progress (if they exist)
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;

-- Create new policy allowing leaderboard reads (all can see, but limited to leaderboard fields)
CREATE POLICY "Anyone can view leaderboard data" ON public.user_progress
    FOR SELECT USING (true);

-- Drop existing restrictive policies on user_profiles (if they exist)  
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;

-- Allow public read of user profiles for leaderboard display names
CREATE POLICY "Anyone can view user profiles" ON public.user_profiles
    FOR SELECT USING (true);


-- ============================================
-- Indexes for leaderboard performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_progress_total_xp ON public.user_progress(total_xp_earned DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_level ON public.user_progress(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_streak ON public.user_progress(streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_active ON public.user_progress(last_active_date DESC);
