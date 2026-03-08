-- ARIBox Profil Genişletmeleri
-- Migration 005: Bio, kapak fotoğrafı, kullanıcı adı

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS users_username_idx ON public.users(username) WHERE username IS NOT NULL;

-- Avatar güncelleme/silme politikaları
CREATE POLICY "Kullanıcı kendi avatarını güncelleyebilir"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Kullanıcı kendi avatarını silebilir"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Kapak fotoğrafı bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'covers',
  'covers',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Kapak fotoğrafı herkese açık"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "Kullanıcı kendi kapak fotoğrafını yükleyebilir"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Kullanıcı kendi kapak fotoğrafını güncelleyebilir"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Kullanıcı kendi kapak fotoğrafını silebilir"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);
