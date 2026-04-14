-- ============================================================
-- Add full content storage + settings to content_history
-- Run this in your Supabase SQL Editor
-- ============================================================

ALTER TABLE public.content_history
  ADD COLUMN IF NOT EXISTS content JSONB,
  ADD COLUMN IF NOT EXISTS brand_voice TEXT DEFAULT 'Professional yet approachable',
  ADD COLUMN IF NOT EXISTS target_audience TEXT DEFAULT 'Business professionals and entrepreneurs';

-- Index for faster content retrieval
CREATE INDEX IF NOT EXISTS idx_content_history_user_created
  ON public.content_history(user_id, created_at DESC);

-- Allow users to delete their own history entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'content_history'
    AND policyname = 'Users can delete own content history'
  ) THEN
    CREATE POLICY "Users can delete own content history"
      ON public.content_history
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
