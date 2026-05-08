-- messagesテーブル作成
CREATE TABLE IF NOT EXISTS public.messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     text NOT NULL,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- マッチに参加しているユーザーのみSELECT可能
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = messages.match_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- マッチに参加しているユーザーのみINSERT可能
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = messages.match_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- 受信者のみ既読フラグをUPDATE可能
CREATE POLICY "messages_update" ON public.messages
  FOR UPDATE USING (
    auth.uid() != sender_id
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = messages.match_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );
