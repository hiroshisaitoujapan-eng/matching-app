-- likesテーブル作成
CREATE TABLE IF NOT EXISTS public.likes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select" ON public.likes
  FOR SELECT USING (auth.uid() = from_user_id);

CREATE POLICY "likes_insert" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- skipsテーブル作成
CREATE TABLE IF NOT EXISTS public.skips (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE public.skips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skips_select" ON public.skips
  FOR SELECT USING (auth.uid() = from_user_id);

CREATE POLICY "skips_insert" ON public.skips
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- matchesテーブル作成
CREATE TABLE IF NOT EXISTS public.matches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_select" ON public.matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "matches_insert" ON public.matches
  FOR INSERT WITH CHECK (auth.uid() = user1_id);
