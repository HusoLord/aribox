-- ARIBox Storage Bucket'ları
-- Migration 004

-- Profil fotoğrafları
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Kovan fotoğrafları
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hive-photos',
  'hive-photos',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Forum medya
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'forum-media',
  'forum-media',
  true,
  104857600, -- 100MB (video için)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
);

-- Ürün görselleri
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Hastalık teşhis fotoğrafları
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'diagnosis-photos',
  'diagnosis-photos',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Üretici doğrulama belgeleri
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-docs',
  'verification-docs',
  false,
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
);

-- Üretici profil görselleri
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'producer-media',
  'producer-media',
  true,
  104857600, -- 100MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
);

-- Storage RLS Politikaları

-- Avatars: Herkes görebilir, sadece kendisi yükleyebilir
CREATE POLICY "Avatar herkes görebilir"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Kullanıcı kendi avatarını yükleyebilir"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Hive photos: Sadece sahip görebilir
CREATE POLICY "Kovan fotoğrafları sadece sahibe açık"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hive-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Kullanıcı kovan fotoğrafı yükleyebilir"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'hive-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Forum media: Herkes görebilir, premium yükleyebilir
CREATE POLICY "Forum medyası herkese açık"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'forum-media');

CREATE POLICY "Premium üyeler forum medyası yükleyebilir"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'forum-media' AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('premium', 'producer', 'admin'))
  );

-- Product images: Herkes görebilir, üretici yükleyebilir
CREATE POLICY "Ürün görselleri herkese açık"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Üretici ürün görseli yükleyebilir"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('producer', 'admin'))
  );

-- Diagnosis photos: Sadece sahip görebilir
CREATE POLICY "Teşhis fotoğrafları sadece sahibe açık"
  ON storage.objects FOR ALL
  USING (bucket_id = 'diagnosis-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Verification docs: Sadece admin görebilir
CREATE POLICY "Doğrulama belgeleri sadece admin görebilir"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs' AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Üretici doğrulama belgesi yükleyebilir"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Producer media: Herkes görebilir, üretici yükleyebilir
CREATE POLICY "Üretici medyası herkese açık"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'producer-media');

CREATE POLICY "Üretici kendi medyasını yükleyebilir"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'producer-media' AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('producer', 'admin'))
  );
