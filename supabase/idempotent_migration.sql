-- ARIBox İdempotent Migration
-- Supabase SQL Editor'a yapıştırıp çalıştırın.
-- Zaten var olan şeyleri atlar, eksik olanları oluşturur.

-- ============================================
-- UZANTILAR
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- postgis zaten etkin değilse ekle (opsiyonel, hata verse de devam eder)
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS "postgis";
EXCEPTION WHEN OTHERS THEN null; END $$;

-- ============================================
-- ENUM TİPLERİ (idempotent)
-- ============================================
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('free', 'premium', 'producer', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE hive_type AS ENUM ('langstroth', 'dadant', 'local', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE colony_strength AS ENUM ('weak', 'medium', 'strong');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE hive_status AS ENUM ('active', 'inactive', 'dead', 'sold');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE nectar_quality AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE diagnosis_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'canceled', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE subscription_plan AS ENUM ('monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE post_type AS ENUM ('photo', 'video', 'story', 'article');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- verification_status (eski migration uyumluluğu için oluştur, ama kullanmayacağız)
DO $$ BEGIN CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
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
-- PRODUCER PROFILES (uygulama koduna uygun şema)
-- ============================================
CREATE TABLE IF NOT EXISTS public.producer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  honey_types JSONB DEFAULT '[]',
  hive_count INT,
  experience_years INT,
  contact_phone TEXT,
  website_url TEXT,
  cover_photo_url TEXT,
  certificates JSONB DEFAULT '[]',
  social_links JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  follower_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Eğer tablo zaten eski şemayla oluşturulduysa eksik kolonları ekle
DO $$ BEGIN ALTER TABLE public.producer_profiles ADD COLUMN farm_name TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN ALTER TABLE public.producer_profiles ADD COLUMN location TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN ALTER TABLE public.producer_profiles ADD COLUMN honey_types JSONB DEFAULT '[]';
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN ALTER TABLE public.producer_profiles ADD COLUMN contact_phone TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN ALTER TABLE public.producer_profiles ADD COLUMN website_url TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN ALTER TABLE public.producer_profiles ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN ALTER TABLE public.producer_profiles ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- ============================================
-- PRODUCER POSTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.producer_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producer_id UUID NOT NULL REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]',
  post_type post_type DEFAULT 'photo' NOT NULL,
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- PRODUCER FOLLOWERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.producer_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producer_id UUID NOT NULL REFERENCES public.producer_profiles(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(producer_id, follower_id)
);

-- ============================================
-- HIVES
-- ============================================
CREATE TABLE IF NOT EXISTS public.hives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hive_number INT NOT NULL,
  hive_type hive_type DEFAULT 'langstroth' NOT NULL,
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
-- HIVE INSPECTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.hive_inspections (
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
CREATE TABLE IF NOT EXISTS public.ai_conversations (
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
CREATE TABLE IF NOT EXISTS public.ai_disease_diagnoses (
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
-- NEWS ARTICLES (is_premium ve author_id dahil)
-- ============================================
CREATE TABLE IF NOT EXISTS public.news_articles (
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
  is_premium BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Eğer tablo zaten oluşturulduysa eksik kolonları ekle
DO $$ BEGIN ALTER TABLE public.news_articles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN ALTER TABLE public.news_articles ADD COLUMN author_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN ALTER TABLE public.news_articles ADD COLUMN source_url TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- ============================================
-- FORUM CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.forum_categories (
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
CREATE TABLE IF NOT EXISTS public.forum_topics (
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
CREATE TABLE IF NOT EXISTS public.forum_replies (
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
CREATE TABLE IF NOT EXISTS public.products (
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
CREATE TABLE IF NOT EXISTS public.orders (
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
CREATE TABLE IF NOT EXISTS public.product_reviews (
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
CREATE TABLE IF NOT EXISTS public.nectar_map_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plant_name TEXT NOT NULL,
  plant_type TEXT,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
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
CREATE TABLE IF NOT EXISTS public.notifications (
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
CREATE TABLE IF NOT EXISTS public.subscriptions (
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
-- MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
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
-- REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
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
CREATE TABLE IF NOT EXISTS public.news_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, article_id)
);

-- ============================================
-- FORUM LIKES
-- ============================================
CREATE TABLE IF NOT EXISTS public.forum_likes (
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
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_hives_user_id ON public.hives(user_id);
CREATE INDEX IF NOT EXISTS idx_hive_inspections_hive_id ON public.hive_inspections(hive_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_slug ON public.news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON public.forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON public.forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_topic_id ON public.forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_products_producer_id ON public.products(producer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);

-- ============================================
-- RLS ETKİNLEŞTİRME
-- ============================================
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
-- RLS POLİTİKALARI (önce sil, sonra oluştur)
-- ============================================

-- USERS
DROP POLICY IF EXISTS "Kullanıcılar kendi profilini görebilir" ON public.users;
CREATE POLICY "Kullanıcılar kendi profilini görebilir"
  ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Kullanıcılar kendi profilini güncelleyebilir" ON public.users;
CREATE POLICY "Kullanıcılar kendi profilini güncelleyebilir"
  ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin tüm kullanıcıları görebilir" ON public.users;
CREATE POLICY "Admin tüm kullanıcıları görebilir"
  ON public.users FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- PRODUCER PROFILES
DROP POLICY IF EXISTS "Üretici profilleri herkese açık" ON public.producer_profiles;
CREATE POLICY "Üretici profilleri herkese açık"
  ON public.producer_profiles FOR SELECT TO authenticated
  USING (is_verified = true);

DROP POLICY IF EXISTS "Üretici kendi profilini görebilir" ON public.producer_profiles;
CREATE POLICY "Üretici kendi profilini görebilir"
  ON public.producer_profiles FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Üretici kendi profilini güncelleyebilir" ON public.producer_profiles;
CREATE POLICY "Üretici kendi profilini güncelleyebilir"
  ON public.producer_profiles FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Üretici profili oluşturabilir" ON public.producer_profiles;
CREATE POLICY "Üretici profili oluşturabilir"
  ON public.producer_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin tüm üretici profillerini yönetebilir" ON public.producer_profiles;
CREATE POLICY "Admin tüm üretici profillerini yönetebilir"
  ON public.producer_profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- HIVES
DROP POLICY IF EXISTS "Kullanıcı kendi kovanlarını görebilir" ON public.hives;
CREATE POLICY "Kullanıcı kendi kovanlarını görebilir"
  ON public.hives FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Kullanıcı kendi kovanlarını ekleyebilir" ON public.hives;
CREATE POLICY "Kullanıcı kendi kovanlarını ekleyebilir"
  ON public.hives FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Kullanıcı kendi kovanlarını güncelleyebilir" ON public.hives;
CREATE POLICY "Kullanıcı kendi kovanlarını güncelleyebilir"
  ON public.hives FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Kullanıcı kendi kovanlarını silebilir" ON public.hives;
CREATE POLICY "Kullanıcı kendi kovanlarını silebilir"
  ON public.hives FOR DELETE USING (user_id = auth.uid());

-- HIVE INSPECTIONS
DROP POLICY IF EXISTS "Kullanıcı kendi kontrol kayıtlarını görebilir" ON public.hive_inspections;
CREATE POLICY "Kullanıcı kendi kontrol kayıtlarını görebilir"
  ON public.hive_inspections FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Kullanıcı kontrol kaydı ekleyebilir" ON public.hive_inspections;
CREATE POLICY "Kullanıcı kontrol kaydı ekleyebilir"
  ON public.hive_inspections FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Kullanıcı kontrol kaydını güncelleyebilir" ON public.hive_inspections;
CREATE POLICY "Kullanıcı kontrol kaydını güncelleyebilir"
  ON public.hive_inspections FOR UPDATE USING (user_id = auth.uid());

-- AI CONVERSATIONS
DROP POLICY IF EXISTS "Kullanıcı kendi sohbetlerini görebilir" ON public.ai_conversations;
CREATE POLICY "Kullanıcı kendi sohbetlerini görebilir"
  ON public.ai_conversations FOR ALL USING (user_id = auth.uid());

-- AI DISEASE DIAGNOSES
DROP POLICY IF EXISTS "Kullanıcı kendi teşhislerini görebilir" ON public.ai_disease_diagnoses;
CREATE POLICY "Kullanıcı kendi teşhislerini görebilir"
  ON public.ai_disease_diagnoses FOR ALL USING (user_id = auth.uid());

-- NEWS ARTICLES
DROP POLICY IF EXISTS "Haberler herkese açık" ON public.news_articles;
CREATE POLICY "Haberler herkese açık"
  ON public.news_articles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin haber yönetebilir" ON public.news_articles;
CREATE POLICY "Admin haber yönetebilir"
  ON public.news_articles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- FORUM CATEGORIES
DROP POLICY IF EXISTS "Forum kategorileri herkese açık" ON public.forum_categories;
CREATE POLICY "Forum kategorileri herkese açık"
  ON public.forum_categories FOR SELECT TO authenticated USING (true);

-- FORUM TOPICS
DROP POLICY IF EXISTS "Forum konuları premium üyelere açık" ON public.forum_topics;
CREATE POLICY "Forum konuları premium üyelere açık"
  ON public.forum_topics FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Premium üyeler konu açabilir" ON public.forum_topics;
CREATE POLICY "Premium üyeler konu açabilir"
  ON public.forum_topics FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('premium', 'producer', 'admin')));

DROP POLICY IF EXISTS "Kullanıcı kendi konularını güncelleyebilir" ON public.forum_topics;
CREATE POLICY "Kullanıcı kendi konularını güncelleyebilir"
  ON public.forum_topics FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin forum yönetebilir" ON public.forum_topics;
CREATE POLICY "Admin forum yönetebilir"
  ON public.forum_topics FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- FORUM REPLIES
DROP POLICY IF EXISTS "Forum yanıtları herkese açık" ON public.forum_replies;
CREATE POLICY "Forum yanıtları herkese açık"
  ON public.forum_replies FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Premium üyeler yanıt verebilir" ON public.forum_replies;
CREATE POLICY "Premium üyeler yanıt verebilir"
  ON public.forum_replies FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('premium', 'producer', 'admin')));

DROP POLICY IF EXISTS "Kullanıcı kendi yanıtlarını güncelleyebilir" ON public.forum_replies;
CREATE POLICY "Kullanıcı kendi yanıtlarını güncelleyebilir"
  ON public.forum_replies FOR UPDATE USING (user_id = auth.uid());

-- PRODUCTS
DROP POLICY IF EXISTS "Ürünler herkese açık" ON public.products;
CREATE POLICY "Ürünler herkese açık"
  ON public.products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Üretici kendi ürünlerini görebilir" ON public.products;
CREATE POLICY "Üretici kendi ürünlerini görebilir"
  ON public.products FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.producer_profiles WHERE id = producer_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Üretici ürün ekleyebilir" ON public.products;
CREATE POLICY "Üretici ürün ekleyebilir"
  ON public.products FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.producer_profiles WHERE id = producer_id AND user_id = auth.uid() AND is_verified = true));

DROP POLICY IF EXISTS "Üretici kendi ürünlerini güncelleyebilir" ON public.products;
CREATE POLICY "Üretici kendi ürünlerini güncelleyebilir"
  ON public.products FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.producer_profiles WHERE id = producer_id AND user_id = auth.uid()));

-- ORDERS
DROP POLICY IF EXISTS "Alıcı kendi siparişlerini görebilir" ON public.orders;
CREATE POLICY "Alıcı kendi siparişlerini görebilir"
  ON public.orders FOR SELECT USING (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Satıcı kendi siparişlerini görebilir" ON public.orders;
CREATE POLICY "Satıcı kendi siparişlerini görebilir"
  ON public.orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.producer_profiles WHERE id = seller_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Kullanıcı sipariş oluşturabilir" ON public.orders;
CREATE POLICY "Kullanıcı sipariş oluşturabilir"
  ON public.orders FOR INSERT WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Satıcı sipariş durumunu güncelleyebilir" ON public.orders;
CREATE POLICY "Satıcı sipariş durumunu güncelleyebilir"
  ON public.orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.producer_profiles WHERE id = seller_id AND user_id = auth.uid()));

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Kullanıcı kendi bildirimlerini görebilir" ON public.notifications;
CREATE POLICY "Kullanıcı kendi bildirimlerini görebilir"
  ON public.notifications FOR ALL USING (user_id = auth.uid());

-- MESSAGES
DROP POLICY IF EXISTS "Kullanıcı kendi mesajlarını görebilir" ON public.messages;
CREATE POLICY "Kullanıcı kendi mesajlarını görebilir"
  ON public.messages FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "Kullanıcı mesaj gönderebilir" ON public.messages;
CREATE POLICY "Kullanıcı mesaj gönderebilir"
  ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Kullanıcı kendi aboneliğini görebilir" ON public.subscriptions;
CREATE POLICY "Kullanıcı kendi aboneliğini görebilir"
  ON public.subscriptions FOR SELECT USING (user_id = auth.uid());

-- NEWS BOOKMARKS
DROP POLICY IF EXISTS "Kullanıcı kendi yer imlerini yönetebilir" ON public.news_bookmarks;
CREATE POLICY "Kullanıcı kendi yer imlerini yönetebilir"
  ON public.news_bookmarks FOR ALL USING (user_id = auth.uid());

-- FORUM LIKES
DROP POLICY IF EXISTS "Kullanıcı kendi beğenilerini yönetebilir" ON public.forum_likes;
CREATE POLICY "Kullanıcı kendi beğenilerini yönetebilir"
  ON public.forum_likes FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Beğeniler herkese açık" ON public.forum_likes;
CREATE POLICY "Beğeniler herkese açık"
  ON public.forum_likes FOR SELECT TO authenticated USING (true);

-- REPORTS
DROP POLICY IF EXISTS "Kullanıcı şikayet gönderebilir" ON public.reports;
CREATE POLICY "Kullanıcı şikayet gönderebilir"
  ON public.reports FOR INSERT WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Admin şikayetleri yönetebilir" ON public.reports;
CREATE POLICY "Admin şikayetleri yönetebilir"
  ON public.reports FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- PRODUCT REVIEWS
DROP POLICY IF EXISTS "Ürün yorumları herkese açık" ON public.product_reviews;
CREATE POLICY "Ürün yorumları herkese açık"
  ON public.product_reviews FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Kullanıcı yorum yapabilir" ON public.product_reviews;
CREATE POLICY "Kullanıcı yorum yapabilir"
  ON public.product_reviews FOR INSERT WITH CHECK (user_id = auth.uid());

-- NECTAR MAP ENTRIES
DROP POLICY IF EXISTS "Nektar haritası premium üyelere açık" ON public.nectar_map_entries;
CREATE POLICY "Nektar haritası premium üyelere açık"
  ON public.nectar_map_entries FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Premium üyeler nektar ekleyebilir" ON public.nectar_map_entries;
CREATE POLICY "Premium üyeler nektar ekleyebilir"
  ON public.nectar_map_entries FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('premium', 'producer', 'admin')));

DROP POLICY IF EXISTS "Kullanıcı kendi nektar girdisini güncelleyebilir" ON public.nectar_map_entries;
CREATE POLICY "Kullanıcı kendi nektar girdisini güncelleyebilir"
  ON public.nectar_map_entries FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- FONKSİYONLAR VE TRİGGER'LAR
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at trigger'ları
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_producer_profiles_updated_at ON public.producer_profiles;
  CREATE TRIGGER update_producer_profiles_updated_at BEFORE UPDATE ON public.producer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_producer_posts_updated_at ON public.producer_posts;
  CREATE TRIGGER update_producer_posts_updated_at BEFORE UPDATE ON public.producer_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_hives_updated_at ON public.hives;
  CREATE TRIGGER update_hives_updated_at BEFORE UPDATE ON public.hives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_hive_inspections_updated_at ON public.hive_inspections;
  CREATE TRIGGER update_hive_inspections_updated_at BEFORE UPDATE ON public.hive_inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON public.ai_conversations;
  CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_news_articles_updated_at ON public.news_articles;
  CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_forum_topics_updated_at ON public.forum_topics;
  CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON public.forum_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_forum_replies_updated_at ON public.forum_replies;
  CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON public.forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
  CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
  CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON public.product_reviews;
  CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
  CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
  CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END $$;

-- Yeni kullanıcı trigger'ı
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END $$;

-- Forum reply sayacı
CREATE OR REPLACE FUNCTION update_topic_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics SET reply_count = reply_count + 1, last_reply_at = NOW() WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_topics SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = OLD.topic_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_topic_reply_count_trigger ON public.forum_replies;
  CREATE TRIGGER update_topic_reply_count_trigger
    AFTER INSERT OR DELETE ON public.forum_replies
    FOR EACH ROW EXECUTE FUNCTION update_topic_reply_count();
END $$;

-- Ürün ortalama puanı
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

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_product_rating_trigger ON public.product_reviews;
  CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE ON public.product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();
END $$;

-- Üretici ortalama puanı
CREATE OR REPLACE FUNCTION update_producer_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_producer_id UUID;
BEGIN
  SELECT producer_id INTO v_producer_id FROM public.products WHERE id = NEW.product_id;
  UPDATE public.producer_profiles
  SET
    rating = (
      SELECT AVG(pr.rating) FROM public.product_reviews pr
      JOIN public.products p ON p.id = pr.product_id
      WHERE p.producer_id = v_producer_id
    ),
    rating_count = (
      SELECT COUNT(pr.id) FROM public.product_reviews pr
      JOIN public.products p ON p.id = pr.product_id
      WHERE p.producer_id = v_producer_id
    )
  WHERE id = v_producer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_producer_rating_trigger ON public.product_reviews;
  CREATE TRIGGER update_producer_rating_trigger
    AFTER INSERT OR UPDATE ON public.product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_producer_rating();
END $$;

-- Takipçi sayacı
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

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_follower_count_trigger ON public.producer_followers;
  CREATE TRIGGER update_follower_count_trigger
    AFTER INSERT OR DELETE ON public.producer_followers
    FOR EACH ROW EXECUTE FUNCTION update_follower_count();
END $$;

-- Günlük soru sayacı sıfırlama
CREATE OR REPLACE FUNCTION reset_daily_question_counts()
RETURNS void AS $$
BEGIN
  UPDATE public.users SET daily_question_count = 0, daily_question_reset_at = NOW() WHERE role = 'free';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STORAGE BUCKETS (çakışma olursa atla)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hive-photos', 'hive-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('forum-media', 'forum-media', true, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('diagnosis-photos', 'diagnosis-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('verification-docs', 'verification-docs', false, 20971520, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('producer-media', 'producer-media', true, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

-- Storage Politikaları
DROP POLICY IF EXISTS "Avatar herkes görebilir" ON storage.objects;
CREATE POLICY "Avatar herkes görebilir" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Kullanıcı kendi avatarını yükleyebilir" ON storage.objects;
CREATE POLICY "Kullanıcı kendi avatarını yükleyebilir" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Kovan fotoğrafları sadece sahibe açık" ON storage.objects;
CREATE POLICY "Kovan fotoğrafları sadece sahibe açık" ON storage.objects FOR SELECT
  USING (bucket_id = 'hive-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Kullanıcı kovan fotoğrafı yükleyebilir" ON storage.objects;
CREATE POLICY "Kullanıcı kovan fotoğrafı yükleyebilir" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'hive-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Forum medyası herkese açık" ON storage.objects;
CREATE POLICY "Forum medyası herkese açık" ON storage.objects FOR SELECT USING (bucket_id = 'forum-media');

DROP POLICY IF EXISTS "Premium üyeler forum medyası yükleyebilir" ON storage.objects;
CREATE POLICY "Premium üyeler forum medyası yükleyebilir" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'forum-media' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('premium', 'producer', 'admin')));

DROP POLICY IF EXISTS "Ürün görselleri herkese açık" ON storage.objects;
CREATE POLICY "Ürün görselleri herkese açık" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Üretici ürün görseli yükleyebilir" ON storage.objects;
CREATE POLICY "Üretici ürün görseli yükleyebilir" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('producer', 'admin')));

DROP POLICY IF EXISTS "Teşhis fotoğrafları sadece sahibe açık" ON storage.objects;
CREATE POLICY "Teşhis fotoğrafları sadece sahibe açık" ON storage.objects FOR ALL
  USING (bucket_id = 'diagnosis-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Doğrulama belgeleri sadece admin görebilir" ON storage.objects;
CREATE POLICY "Doğrulama belgeleri sadece admin görebilir" ON storage.objects FOR SELECT
  USING (bucket_id = 'verification-docs' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Üretici doğrulama belgesi yükleyebilir" ON storage.objects;
CREATE POLICY "Üretici doğrulama belgesi yükleyebilir" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Üretici medyası herkese açık" ON storage.objects;
CREATE POLICY "Üretici medyası herkese açık" ON storage.objects FOR SELECT USING (bucket_id = 'producer-media');

DROP POLICY IF EXISTS "Üretici kendi medyasını yükleyebilir" ON storage.objects;
CREATE POLICY "Üretici kendi medyasını yükleyebilir" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'producer-media' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('producer', 'admin')));

-- ============================================
-- FORUM KATEGORİLERİ SEED DATA
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
  ('Bölgesel Gruplar', 'bolgesel', 'Bölgenize göre arıcılık deneyimleri', 'Map', 10)
ON CONFLICT (slug) DO NOTHING;
