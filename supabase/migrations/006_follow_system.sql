-- ARIBox Takip Sistemi
-- Migration 006: user_follows tablosu

CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Takip ilişkileri herkese açık"
  ON public.user_follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Kullanıcı takip edebilir"
  ON public.user_follows FOR INSERT
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Kullanıcı takibi bırakabilir"
  ON public.user_follows FOR DELETE
  USING (follower_id = auth.uid());
