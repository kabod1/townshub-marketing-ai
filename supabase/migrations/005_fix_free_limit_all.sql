-- Fix all free plan users that still have generations_limit = 5
UPDATE public.profiles
SET generations_limit = 1
WHERE plan = 'free' AND generations_limit != 1;
