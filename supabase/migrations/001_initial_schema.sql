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
