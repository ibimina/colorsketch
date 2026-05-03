-- ColorSketch Phase 6 (Discovery sprint): artwork comments
-- Run this in Supabase SQL Editor after 005_notifications_follows_reposts.sql

-- ============================================
-- Comments on artworks
-- ============================================
CREATE TABLE IF NOT EXISTS public.artwork_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artwork_id UUID NOT NULL REFERENCES public.saved_artworks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.artwork_comments ENABLE ROW LEVEL SECURITY;

-- Comments visible only on public artworks (or to the artwork owner / commenter)
CREATE POLICY "Read comments on public artworks" ON public.artwork_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.saved_artworks a
            WHERE a.id = artwork_comments.artwork_id
              AND (a.is_public = true OR a.user_id = auth.uid())
        )
        OR auth.uid() = user_id
    );

CREATE POLICY "Users insert own comments" ON public.artwork_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own comments" ON public.artwork_comments
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own comments" ON public.artwork_comments
    FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_artwork_comments_artwork
    ON public.artwork_comments(artwork_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artwork_comments_user
    ON public.artwork_comments(user_id, created_at DESC);

-- Counter cache on saved_artworks
ALTER TABLE public.saved_artworks
    ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;

-- Extend notification type domain to include 'comment'
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_type_check
    CHECK (type IN ('like', 'save', 'follow', 'repost', 'comment', 'level_up', 'achievement', 'system'));


-- ============================================
-- Comment count cache + notification trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_artwork_comment()
RETURNS TRIGGER AS $$
DECLARE
    owner_id UUID;
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.saved_artworks
            SET comments_count = comments_count + 1
            WHERE id = NEW.artwork_id;

        SELECT user_id INTO owner_id FROM public.saved_artworks WHERE id = NEW.artwork_id;
        IF owner_id IS NOT NULL AND owner_id <> NEW.user_id THEN
            INSERT INTO public.notifications (
                user_id, actor_id, type, target_type, target_id, payload
            )
            VALUES (
                owner_id,
                NEW.user_id,
                'comment',
                'artwork',
                NEW.artwork_id,
                jsonb_build_object(
                    'comment_id', NEW.id,
                    'preview', left(NEW.body, 140)
                )
            );
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.saved_artworks
            SET comments_count = GREATEST(0, comments_count - 1)
            WHERE id = OLD.artwork_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_handle_artwork_comment ON public.artwork_comments;
CREATE TRIGGER trg_handle_artwork_comment
    AFTER INSERT OR DELETE ON public.artwork_comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_artwork_comment();

-- Auto-update updated_at on edits
CREATE OR REPLACE FUNCTION public.touch_artwork_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_artwork_comment ON public.artwork_comments;
CREATE TRIGGER trg_touch_artwork_comment
    BEFORE UPDATE ON public.artwork_comments
    FOR EACH ROW EXECUTE FUNCTION public.touch_artwork_comment_updated_at();
