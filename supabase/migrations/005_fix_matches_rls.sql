-- matchesのINSERTポリシーを修正（user1またはuser2どちらでもINSERT可能に）
DROP POLICY IF EXISTS "matches_insert" ON public.matches;

CREATE POLICY "matches_insert" ON public.matches
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
