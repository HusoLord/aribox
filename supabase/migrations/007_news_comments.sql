-- news_comments tablosu
CREATE TABLE IF NOT EXISTS public.news_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes yorumları görebilir"
  ON public.news_comments FOR SELECT USING (true);

CREATE POLICY "Giriş yapan kullanıcı yorum ekleyebilir"
  ON public.news_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi yorumunu silebilir"
  ON public.news_comments FOR DELETE
  USING (auth.uid() = user_id);
