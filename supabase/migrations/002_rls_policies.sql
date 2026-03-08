-- ARIBox RLS Politikaları
-- Migration 002: Row Level Security

-- RLS aktifleştirme
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hive_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_disease_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nectar_map_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS
-- ============================================
CREATE POLICY "Kullanıcılar kendi profilini görebilir"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Kullanıcılar kendi profilini güncelleyebilir"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin tüm kullanıcıları görebilir"
  ON public.users FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- PRODUCER PROFILES (Herkese açık okuma)
-- ============================================
CREATE POLICY "Üretici profilleri herkese açık"
  ON public.producer_profiles FOR SELECT
  TO authenticated
  USING (verification_status = 'approved');

CREATE POLICY "Üretici kendi profilini görebilir"
  ON public.producer_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Üretici kendi profilini güncelleyebilir"
  ON public.producer_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Üretici profili oluşturabilir"
  ON public.producer_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin tüm üretici profillerini yönetebilir"
  ON public.producer_profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- HIVES (Sadece sahip)
-- ============================================
CREATE POLICY "Kullanıcı kendi kovanlarını görebilir"
  ON public.hives FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Kullanıcı kendi kovanlarını ekleyebilir"
  ON public.hives FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Kullanıcı kendi kovanlarını güncelleyebilir"
  ON public.hives FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Kullanıcı kendi kovanlarını silebilir"
  ON public.hives FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- HIVE INSPECTIONS
-- ============================================
CREATE POLICY "Kullanıcı kendi kontrol kayıtlarını görebilir"
  ON public.hive_inspections FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Kullanıcı kontrol kaydı ekleyebilir"
  ON public.hive_inspections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Kullanıcı kontrol kaydını güncelleyebilir"
  ON public.hive_inspections FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- AI CONVERSATIONS
-- ============================================
CREATE POLICY "Kullanıcı kendi sohbetlerini görebilir"
  ON public.ai_conversations FOR ALL
  USING (user_id = auth.uid());

-- ============================================
-- AI DISEASE DIAGNOSES
-- ============================================
CREATE POLICY "Kullanıcı kendi teşhislerini görebilir"
  ON public.ai_disease_diagnoses FOR ALL
  USING (user_id = auth.uid());

-- ============================================
-- NEWS ARTICLES (Herkese açık okuma, admin yazabilir)
-- ============================================
CREATE POLICY "Haberler herkese açık"
  ON public.news_articles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin haber yönetebilir"
  ON public.news_articles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- FORUM CATEGORIES (Herkese açık)
-- ============================================
CREATE POLICY "Forum kategorileri herkese açık"
  ON public.forum_categories FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- FORUM TOPICS (Premium okuyabilir, premium yazabilir)
-- ============================================
CREATE POLICY "Forum konuları premium üyelere açık"
  ON public.forum_topics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Premium üyeler konu açabilir"
  ON public.forum_topics FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('premium', 'producer', 'admin'))
  );

CREATE POLICY "Kullanıcı kendi konularını güncelleyebilir"
  ON public.forum_topics FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admin forum yönetebilir"
  ON public.forum_topics FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- FORUM REPLIES
-- ============================================
CREATE POLICY "Forum yanıtları herkese açık"
  ON public.forum_replies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Premium üyeler yanıt verebilir"
  ON public.forum_replies FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('premium', 'producer', 'admin'))
  );

CREATE POLICY "Kullanıcı kendi yanıtlarını güncelleyebilir"
  ON public.forum_replies FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- PRODUCTS (Herkese açık görüntüleme)
-- ============================================
CREATE POLICY "Ürünler herkese açık"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Üretici kendi ürünlerini görebilir"
  ON public.products FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.producer_profiles WHERE id = producer_id AND user_id = auth.uid())
  );

CREATE POLICY "Üretici ürün ekleyebilir"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.producer_profiles WHERE id = producer_id AND user_id = auth.uid() AND verification_status = 'approved')
  );

CREATE POLICY "Üretici kendi ürünlerini güncelleyebilir"
  ON public.products FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.producer_profiles WHERE id = producer_id AND user_id = auth.uid())
  );

-- ============================================
-- ORDERS
-- ============================================
CREATE POLICY "Alıcı kendi siparişlerini görebilir"
  ON public.orders FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY "Satıcı kendi siparişlerini görebilir"
  ON public.orders FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.producer_profiles WHERE id = seller_id AND user_id = auth.uid())
  );

CREATE POLICY "Kullanıcı sipariş oluşturabilir"
  ON public.orders FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Satıcı sipariş durumunu güncelleyebilir"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.producer_profiles WHERE id = seller_id AND user_id = auth.uid())
  );

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE POLICY "Kullanıcı kendi bildirimlerini görebilir"
  ON public.notifications FOR ALL
  USING (user_id = auth.uid());

-- ============================================
-- MESSAGES
-- ============================================
CREATE POLICY "Kullanıcı kendi mesajlarını görebilir"
  ON public.messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Kullanıcı mesaj gönderebilir"
  ON public.messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE POLICY "Kullanıcı kendi aboneliğini görebilir"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- NEWS BOOKMARKS
-- ============================================
CREATE POLICY "Kullanıcı kendi yer imlerini yönetebilir"
  ON public.news_bookmarks FOR ALL
  USING (user_id = auth.uid());

-- ============================================
-- FORUM LIKES
-- ============================================
CREATE POLICY "Kullanıcı kendi beğenilerini yönetebilir"
  ON public.forum_likes FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Beğeniler herkese açık"
  ON public.forum_likes FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- REPORTS
-- ============================================
CREATE POLICY "Kullanıcı şikayet gönderebilir"
  ON public.reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admin şikayetleri yönetebilir"
  ON public.reports FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- PRODUCT REVIEWS
-- ============================================
CREATE POLICY "Ürün yorumları herkese açık"
  ON public.product_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Kullanıcı yorum yapabilir"
  ON public.product_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- NECTAR MAP ENTRIES
-- ============================================
CREATE POLICY "Nektar haritası premium üyelere açık"
  ON public.nectar_map_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Premium üyeler nektar ekleyebilir"
  ON public.nectar_map_entries FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('premium', 'producer', 'admin'))
  );

CREATE POLICY "Kullanıcı kendi nektar girdisini güncelleyebilir"
  ON public.nectar_map_entries FOR UPDATE
  USING (user_id = auth.uid());
