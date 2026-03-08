-- ARIBox Veritabanı Şeması
-- Migration 001: Temel tablolar

-- UUID uzantısı
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enum tipleri
CREATE TYPE user_role AS ENUM ('free', 'premium', 'producer', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE hive_type AS ENUM ('langstroth', 'dadant', 'local', 'other');
CREATE TYPE colony_strength AS ENUM ('weak', 'medium', 'strong');
CREATE TYPE hive_status AS ENUM ('active', 'inactive', 'dead', 'sold');
CREATE TYPE nectar_quality AS ENUM ('low', 'medium', 'high');
CREATE TYPE diagnosis_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'canceled', 'refunded');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE subscription_plan AS ENUM ('monthly', 'yearly');
CREATE TYPE post_type AS ENUM ('photo', 'video', 'story', 'article');

-- ============================================
-- USERS (Supabase auth.users ile senkron)
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  role user_role DEFAULT 'free' NOT NULL,
  subscription_status subscription_status,
  stripe_customer_id TEXT,
  daily_question_count INT DEFAULT 0 NOT NULL,
  daily_question_reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- PRODUCER PROFILES
-- ============================================
CREATE TABLE public.producer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT,
  cover_photo_url TEXT,
  experience_years INT,
  hive_count INT,
  production_capacity TEXT,
  certificates JSONB DEFAULT '[]',
  social_links JSONB DEFAULT '{}',
  verification_status verification_status DEFAULT 'pending' NOT NULL,
  verification_documents JSONB DEFAULT '{}',
  tax_id TEXT, -- şifreli tutulacak
  iban TEXT,   -- şifreli tutulacak
  stripe_connect_id TEXT,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  follower_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- PRODUCER POSTS
-- ============================================
CREATE TABLE public.producer_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producer_id UUID NOT NULL REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]',
  post_type post_type DEFAULT 'photo' NOT NULL,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ, -- story için 24 saat
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- PRODUCER FOLLOWERS
-- ============================================
CREATE TABLE public.producer_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producer_id UUID NOT NULL REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(producer_id, follower_id)
);

-- ============================================
-- HIVES (Kovan Defteri)
-- ============================================
CREATE TABLE public.hives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hive_number INT NOT NULL,
  hive_type hive_type DEFAULT 'langstroth' NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  location_name TEXT,
  queen_age DATE,
  queen_breed TEXT,
  queen_marking_color TEXT,
  colony_strength colony_strength,
  status hive_status DEFAULT 'active' NOT NULL,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- HIVE INSPECTIONS (Kontrol Kayıtları)
-- ============================================
CREATE TABLE public.hive_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hive_id UUID NOT NULL REFERENCES public.hives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  inspection_date TIMESTAMPTZ NOT NULL,
  weather_temp DECIMAL(5,2),
  weather_condition TEXT,
  queen_seen BOOLEAN DEFAULT FALSE,
  brood_status JSONB DEFAULT '{}',
  food_status JSONB DEFAULT '{}',
  disease_signs BOOLEAN DEFAULT FALSE,
  disease_notes TEXT,
  actions_taken TEXT[] DEFAULT '{}',
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- AI CONVERSATIONS
-- ============================================
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  messages JSONB DEFAULT '[]' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- AI DISEASE DIAGNOSES
-- ============================================
CREATE TABLE public.ai_disease_diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hive_id UUID REFERENCES public.hives(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  diagnosis JSONB NOT NULL DEFAULT '{}',
  severity diagnosis_severity NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- NEWS ARTICLES
-- ============================================
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  source_url TEXT,
  image_url TEXT,
  is_breaking BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- FORUM CATEGORIES
-- ============================================
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  post_count INT DEFAULT 0,
  sort_order INT DEFAULT 0
);

-- ============================================
-- FORUM TOPICS
-- ============================================
CREATE TABLE public.forum_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  last_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- FORUM REPLIES
-- ============================================
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]',
  is_best_answer BOOLEAN DEFAULT FALSE,
  like_count INT DEFAULT 0,
  parent_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producer_id UUID NOT NULL REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  currency TEXT DEFAULT 'TRY',
  stock_quantity INT DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  weight DECIMAL(10,3),
  weight_unit TEXT DEFAULT 'kg',
  harvest_date DATE,
  harvest_location TEXT,
  origin_region TEXT,
  qr_code_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  sales_count INT DEFAULT 0,
  shipping_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES public.producer_profiles(id) ON DELETE RESTRICT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending' NOT NULL,
  shipping_address JSONB NOT NULL DEFAULT '{}',
  tracking_number TEXT,
  stripe_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- PRODUCT REVIEWS
-- ============================================
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photos TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(product_id, user_id, order_id)
);

-- ============================================
-- NECTAR MAP ENTRIES
-- ============================================
CREATE TABLE public.nectar_map_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plant_name TEXT NOT NULL,
  plant_type TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  bloom_start DATE,
  bloom_end DATE,
  nectar_quality nectar_quality DEFAULT 'medium',
  photo_url TEXT,
  notes TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  plan subscription_plan NOT NULL,
  status subscription_status NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- MESSAGES (Satıcı-Alıcı)
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- REPORTS (Şikayet)
-- ============================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reported_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  reported_topic_id UUID REFERENCES public.forum_topics(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status report_status DEFAULT 'pending' NOT NULL,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- NEWS BOOKMARKS
-- ============================================
CREATE TABLE public.news_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, article_id)
);

-- ============================================
-- FORUM LIKES
-- ============================================
CREATE TABLE public.forum_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK (
    (topic_id IS NOT NULL AND reply_id IS NULL) OR
    (topic_id IS NULL AND reply_id IS NOT NULL)
  )
);

-- ============================================
-- INDEXLER
-- ============================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_hives_user_id ON public.hives(user_id);
CREATE INDEX idx_hive_inspections_hive_id ON public.hive_inspections(hive_id);
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_news_articles_slug ON public.news_articles(slug);
CREATE INDEX idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX idx_forum_topics_category_id ON public.forum_topics(category_id);
CREATE INDEX idx_forum_topics_created_at ON public.forum_topics(created_at DESC);
CREATE INDEX idx_forum_replies_topic_id ON public.forum_replies(topic_id);
CREATE INDEX idx_products_producer_id ON public.products(producer_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
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
-- ARIBox Fonksiyonlar ve Trigger'lar
-- Migration 003

-- ============================================
-- updated_at otomatik güncelleme
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tüm tablolara trigger ekle
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_producer_profiles_updated_at BEFORE UPDATE ON public.producer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_producer_posts_updated_at BEFORE UPDATE ON public.producer_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hives_updated_at BEFORE UPDATE ON public.hives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hive_inspections_updated_at BEFORE UPDATE ON public.hive_inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON public.forum_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON public.forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Yeni kullanıcı kayıt trigger'ı
-- Auth tablosuna yeni kayıt gelince public.users'a ekle
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Forum reply sayacı güncelleme
-- ============================================
CREATE OR REPLACE FUNCTION update_topic_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics
    SET reply_count = reply_count + 1, last_reply_at = NOW()
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_topics
    SET reply_count = GREATEST(reply_count - 1, 0)
    WHERE id = OLD.topic_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_topic_reply_count_trigger
  AFTER INSERT OR DELETE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_topic_reply_count();

-- ============================================
-- Ürün ortalama puanı güncelleme
-- ============================================
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET
    rating_avg = (SELECT AVG(rating) FROM public.product_reviews WHERE product_id = NEW.product_id),
    rating_count = (SELECT COUNT(*) FROM public.product_reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ============================================
-- Üretici ortalama puanı güncelleme
-- ============================================
CREATE OR REPLACE FUNCTION update_producer_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_producer_id UUID;
BEGIN
  SELECT producer_id INTO v_producer_id FROM public.products WHERE id = NEW.product_id;

  UPDATE public.producer_profiles
  SET
    rating_avg = (
      SELECT AVG(pr.rating)
      FROM public.product_reviews pr
      JOIN public.products p ON p.id = pr.product_id
      WHERE p.producer_id = v_producer_id
    ),
    rating_count = (
      SELECT COUNT(pr.id)
      FROM public.product_reviews pr
      JOIN public.products p ON p.id = pr.product_id
      WHERE p.producer_id = v_producer_id
    )
  WHERE id = v_producer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_producer_rating_trigger
  AFTER INSERT OR UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_producer_rating();

-- ============================================
-- Takipçi sayacı güncelleme
-- ============================================
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.producer_profiles SET follower_count = follower_count + 1 WHERE id = NEW.producer_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.producer_profiles SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.producer_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_follower_count_trigger
  AFTER INSERT OR DELETE ON public.producer_followers
  FOR EACH ROW EXECUTE FUNCTION update_follower_count();

-- ============================================
-- Günlük soru sayacı sıfırlama fonksiyonu
-- ============================================
CREATE OR REPLACE FUNCTION reset_daily_question_counts()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET daily_question_count = 0, daily_question_reset_at = NOW()
  WHERE role = 'free';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Forum kategorileri seed data
-- ============================================
INSERT INTO public.forum_categories (name, slug, description, icon, sort_order) VALUES
  ('Genel Arıcılık Sohbetleri', 'genel', 'Arıcılıkla ilgili her şeyi konuşabileceğiniz alan', 'MessageCircle', 1),
  ('Kovan Bakımı ve Yönetim', 'kovan-bakimi', 'Kovan kontrolü, bakım teknikleri ve ipuçları', 'Home', 2),
  ('Hastalık ve Tedavi', 'hastalik-tedavi', 'Arı hastalıkları, tanı ve tedavi yöntemleri', 'Heart', 3),
  ('Bal Hasadı ve İşleme', 'bal-hasadi', 'Hasat zamanlaması, süzme ve depolama', 'Droplets', 4),
  ('Ana Arı Yetiştiriciliği', 'ana-ari', 'Ana arı yetiştirme, seçim ve bakım', 'Crown', 5),
  ('Ekipman ve Teknoloji', 'ekipman', 'Arıcılık ekipmanları, kovan tipleri, yeni teknolojiler', 'Wrench', 6),
  ('Arı Ürünleri', 'ari-urunleri', 'Propolis, arı sütü, balmumu ve diğer ürünler', 'Package', 7),
  ('Pazar ve Ticaret', 'pazar', 'Alım satım, fiyatlar, pazar haberleri', 'ShoppingCart', 8),
  ('Yeni Başlayanlar', 'yeni-baslayanlar', 'Arıcılığa yeni başlayanlar için rehber ve sorular', 'BookOpen', 9),
  ('Bölgesel Gruplar', 'bolgesel', 'Bölgenize göre arıcılık deneyimleri', 'Map', 10);
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
