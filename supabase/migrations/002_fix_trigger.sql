-- ============================================================
-- TownsHub – Safe trigger fix (no data loss)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Ensure profiles table exists (safe – does nothing if it already exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'business')),
  generations_used INTEGER NOT NULL DEFAULT 0,
  generations_limit INTEGER NOT NULL DEFAULT 5,
  stripe_customer_id TEXT UNIQUE,
  paypal_subscription_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Ensure other tables exist (safe)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal')),
  subscription_id TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  formats_count INTEGER DEFAULT 16,
  total_words INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('generate', 'distribute', 'podcast', 'pr', 'chat')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS on all tables (safe to re-run)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- 4. Recreate policies (drop first to avoid duplicates)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own content history" ON public.content_history;
DROP POLICY IF EXISTS "Users can insert own content history" ON public.content_history;
DROP POLICY IF EXISTS "Users can view own usage events" ON public.usage_events;
DROP POLICY IF EXISTS "Users can insert own usage events" ON public.usage_events;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content history" ON public.content_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content history" ON public.content_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own usage events" ON public.usage_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage events" ON public.usage_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Replace the trigger function (SECURITY DEFINER bypasses RLS)
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
    5
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 6. Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 8. Indexes (safe – IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_content_history_user_id ON public.content_history(user_id);
CREATE INDEX IF NOT EXISTS idx_content_history_created_at ON public.content_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON public.usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON public.usage_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_event_type ON public.usage_events(event_type);

-- ============================================================
-- Done. Test by running:
--   SELECT * FROM public.profiles LIMIT 5;
-- ============================================================
