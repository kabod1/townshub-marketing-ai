-- ============================================================
-- TownsHub – Update free plan generation limit to 1
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Update existing free users who still have the old default of 5
UPDATE public.profiles
SET generations_limit = 1
WHERE plan = 'free' AND generations_limit = 5;

-- 2. Update the trigger so new signups get 1 generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, plan, generations_used, generations_limit)
  VALUES (
    NEW.id,
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), ''),
    'user',
    CASE
      WHEN NEW.raw_user_meta_data->>'plan' IN ('starter', 'pro', 'business') THEN NEW.raw_user_meta_data->>'plan'
      ELSE 'free'
    END,
    0,
    1
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================
-- Done. Verify with:
--   SELECT id, plan, generations_limit FROM public.profiles WHERE plan = 'free' LIMIT 10;
-- ============================================================
