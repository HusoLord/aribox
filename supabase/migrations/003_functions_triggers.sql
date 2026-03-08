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
