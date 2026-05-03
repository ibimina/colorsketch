-- ColorSketch Phase 5: Persistent notifications, follows, reposts
-- Run this in Supabase SQL Editor after 004_user_bio.sql

-- ============================================
-- Notifications (persistent inbox)
-- ============================================
-- Generic notification record. The "actor" is who triggered it (e.g. user
-- who liked your artwork). The "target" is the optional resource id the
-- notification refers to (e.g. an artwork id). Type-specific shape lives
-- in `payload` jsonb.
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('like', 'save', 'follow', 'repost', 'level_up', 'achievement', 'system')),
    target_type TEXT, -- e.g. 'artwork', 'user'
    target_id UUID,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Inserts come from triggers (SECURITY DEFINER) — no client insert policy.

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON public.notifications(user_id, created_at DESC)
    WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON public.notifications(user_id, created_at DESC);


-- ============================================
-- Follows (social graph)
-- ============================================
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id <> following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read follows" ON public.follows
    FOR SELECT USING (true);

CREATE POLICY "Users insert own follow" ON public.follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users delete own follow" ON public.follows
    FOR DELETE USING (auth.uid() = follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);


-- ============================================
-- Reposts
-- ============================================
CREATE TABLE IF NOT EXISTS public.artwork_reposts (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artwork_id UUID NOT NULL REFERENCES public.saved_artworks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, artwork_id)
);

ALTER TABLE public.artwork_reposts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reposts" ON public.artwork_reposts
    FOR SELECT USING (true);

CREATE POLICY "Users insert own repost" ON public.artwork_reposts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own repost" ON public.artwork_reposts
    FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_artwork_reposts_artwork ON public.artwork_reposts(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_reposts_user ON public.artwork_reposts(user_id);

-- Optional: counter cache on saved_artworks
ALTER TABLE public.saved_artworks
    ADD COLUMN IF NOT EXISTS reposts_count INTEGER NOT NULL DEFAULT 0;


-- ============================================
-- Notification triggers
-- ============================================

-- Helper: skip self-actions (don't notify yourself for liking your own work)
CREATE OR REPLACE FUNCTION public.notify_artwork_like()
RETURNS TRIGGER AS $$
DECLARE
    owner_id UUID;
BEGIN
    SELECT user_id INTO owner_id FROM public.saved_artworks WHERE id = NEW.artwork_id;
    IF owner_id IS NULL OR owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    INSERT INTO public.notifications (user_id, actor_id, type, target_type, target_id)
    VALUES (owner_id, NEW.user_id, 'like', 'artwork', NEW.artwork_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_artwork_like ON public.artwork_likes;
CREATE TRIGGER trg_notify_artwork_like
    AFTER INSERT ON public.artwork_likes
    FOR EACH ROW EXECUTE FUNCTION public.notify_artwork_like();


CREATE OR REPLACE FUNCTION public.notify_artwork_save()
RETURNS TRIGGER AS $$
DECLARE
    owner_id UUID;
BEGIN
    SELECT user_id INTO owner_id FROM public.saved_artworks WHERE id = NEW.artwork_id;
    IF owner_id IS NULL OR owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    INSERT INTO public.notifications (user_id, actor_id, type, target_type, target_id)
    VALUES (owner_id, NEW.user_id, 'save', 'artwork', NEW.artwork_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_artwork_save ON public.artwork_saves;
CREATE TRIGGER trg_notify_artwork_save
    AFTER INSERT ON public.artwork_saves
    FOR EACH ROW EXECUTE FUNCTION public.notify_artwork_save();


CREATE OR REPLACE FUNCTION public.notify_follow()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, actor_id, type, target_type, target_id)
    VALUES (NEW.following_id, NEW.follower_id, 'follow', 'user', NEW.follower_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_follow ON public.follows;
CREATE TRIGGER trg_notify_follow
    AFTER INSERT ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.notify_follow();


CREATE OR REPLACE FUNCTION public.handle_artwork_repost()
RETURNS TRIGGER AS $$
DECLARE
    owner_id UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.saved_artworks
            SET reposts_count = reposts_count + 1
            WHERE id = NEW.artwork_id;

        SELECT user_id INTO owner_id FROM public.saved_artworks WHERE id = NEW.artwork_id;
        IF owner_id IS NOT NULL AND owner_id <> NEW.user_id THEN
            INSERT INTO public.notifications (user_id, actor_id, type, target_type, target_id)
            VALUES (owner_id, NEW.user_id, 'repost', 'artwork', NEW.artwork_id);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.saved_artworks
            SET reposts_count = GREATEST(0, reposts_count - 1)
            WHERE id = OLD.artwork_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_handle_artwork_repost ON public.artwork_reposts;
CREATE TRIGGER trg_handle_artwork_repost
    AFTER INSERT OR DELETE ON public.artwork_reposts
    FOR EACH ROW EXECUTE FUNCTION public.handle_artwork_repost();
