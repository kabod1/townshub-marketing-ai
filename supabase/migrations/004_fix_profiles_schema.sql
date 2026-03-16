-- ============================================================
-- TownsHub – Safe ALTER TABLE to ensure profiles has all required columns
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add any missing columns to profiles (safe – no-ops if they exist)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS generations_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS generations_limit INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 2. Add CHECK constraints if missing (drop first to avoid duplicates)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check,
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin')),
  ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'starter', 'pro', 'business'));

-- 3. Fix any existing rows that have NULL in NOT NULL columns
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;
UPDATE public.profiles SET plan = 'free' WHERE plan IS NULL;
UPDATE public.profiles SET generations_used = 0 WHERE generations_used IS NULL;
UPDATE public.profiles SET generations_limit = 1 WHERE generations_limit IS NULL;

-- 4. Recreate the trigger function (1 generation for free plan)
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

-- 5. Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- Verify with:
--   SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'profiles' ORDER BY ordinal_position;
-- ============================================================
