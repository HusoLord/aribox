# 🐝 ARIBox — Akıllı Arıcılık Platformu

## Proje Özeti

ARIBox, arıcılık sektörüne yönelik yapay zeka destekli, kapsamlı bir dijital platformdur. Arıcıların kovan yönetiminden hastalık teşhisine, bal satışından topluluk etkileşimine kadar tüm ihtiyaçlarını tek bir çatı altında karşılamayı hedefler. Platform; yapay zeka asistanı, haber bülteni, forum, marketplace, kovan takip defteri, nektar haritası ve ürün izlenebilirlik sistemi gibi modüller içerir.

**Hedef Kitle:** Hobi arıcıları, profesyonel arıcılar, bal üreticileri, arıcılık ekipman satıcıları, arı ürünleri tüketicileri

**Platform:** Responsive web uygulaması (Mobile-first tasarım)

---

## 1. Teknik Altyapı ve Teknoloji Seçimleri

| Katman | Teknoloji | Gerekçe |
|--------|-----------|---------|
| Frontend | Next.js 14+ (App Router) | SSR, SEO, performans |
| UI Kit | shadcn/ui + Tailwind CSS | Hızlı geliştirme, tutarlı tasarım |
| Backend / DB | Supabase (PostgreSQL + Realtime + Storage) | Auth, DB, dosya depolama, realtime tek çatıda |
| Kimlik Doğrulama | Supabase Auth | Sosyal giriş, e-posta, rol bazlı yetkilendirme |
| Ödeme | Stripe | Abonelik yönetimi, güvenli ödeme |
| E-posta | Resend | Transaksiyonel e-postalar, bildirimler |
| Yapay Zeka | Anthropic Claude API | Uzman asistan, içerik üretimi, görsel analiz |
| Deploy | Vercel | Next.js ile native entegrasyon, edge network |
| Analitik | PostHog | Kullanıcı davranış analizi, A/B test |
| Hata Takibi | Sentry | Gerçek zamanlı hata izleme |
| Görev Takibi | Linear | Sprint planlama, bug tracking |
| Hava Durumu | OpenWeatherMap API | Konum bazlı hava verisi |
| Harita | Mapbox veya Google Maps API | Nektar haritası, konum servisleri |
| Push Bildirimi | Firebase Cloud Messaging (FCM) | Mobil ve web bildirimleri |
| Önbellek | Supabase Edge Functions + Vercel KV | Performans optimizasyonu |
| Görsel İşleme | Claude Vision API | Hastalık teşhisi için fotoğraf analizi |

---

## 2. Kullanıcı Rolleri ve Yetkilendirme

### 2.1 Ücretsiz Kullanıcı (Misafir / Free)

- Yapay zeka asistanına erişim (günlük 10 soru hakkı)
- Haber bültenini okuyabilir (sınırlı — son 3 haber)
- Forum'u görüntüleyebilir (yazamaz)
- Marketplace'i görüntüleyebilir (satın alamaz)
- Kayıt ve giriş yapabilir
- Kovan defteri, nektar haritası, hastalık teşhisi gibi özelliklere erişemez

### 2.2 Premium Üye (Aylık 50₺ / Yıllık 500₺)

- Yapay zeka asistanına sınırsız erişim
- Tüm haber bültenlerine erişim
- Forum'da yazabilir, fotoğraf/video yükleyebilir
- Marketplace'den alışveriş yapabilir
- Kovan takip defteri (sınırsız kovan)
- Hava durumu entegrasyonu ve uyarılar
- Görsel hastalık teşhisi (fotoğraf yükleme)
- Nektar haritasına katkıda bulunma
- Push bildirimleri
- Çevrimdışı mod (kovan defteri + sohbet geçmişi)
- Analitik dashboard (kovan performans grafikleri)

### 2.3 Üretici (Producer)

Premium üyenin tüm haklarına ek olarak:

- Üretici profili oluşturma (sosyal medya benzeri)
- Marketplace'de ürün listeleme ve satış
- QR kod ile ürün izlenebilirlik sistemi
- Satış analitik dashboard'u
- Sipariş yönetimi paneli
- Müşteri mesajlaşma sistemi

### 2.4 Admin

- Tüm içerik moderasyonu
- Üretici başvuru onaylama/reddetme
- Kullanıcı yönetimi
- Haber bülteni yayınlama
- Platform analitikleri
- Raporlama ve istatistikler

---

## 3. Üretici Kayıt ve Doğrulama Protokolü

Üretici girişi güvenilirliği sağlamak için aşağıdaki sıkı doğrulama sürecinden geçmelidir:

### Başvuru Aşaması
1. Premium üyelik aktif olmalı
2. Kimlik doğrulama (TC Kimlik No veya Vergi No)
3. İşletme belgesi yükleme (varsa)
4. Arıcılık tescil belgesi / Arı konaklama belgesi yükleme
5. Gıda üretim izni veya muafiyet belgesi (bal satışı için)
6. Banka hesap bilgileri (IBAN — ödeme alabilmek için)
7. İletişim bilgileri ve adres doğrulama
8. Profil fotoğrafı ve arılık fotoğrafları (min. 3 adet)

### Doğrulama Aşaması
1. Admin tarafından manuel belge kontrolü
2. Telefon numarası doğrulama (SMS OTP)
3. E-posta doğrulama
4. Adres doğrulama
5. Başvuru durumu: Beklemede → Onaylandı / Reddedildi
6. Onay süresi: Maks. 48 saat (iş günü)

### Sürekli Denetim
- Yıllık belge yenileme zorunluluğu
- Kullanıcı şikayeti sistemi (3 onaylı şikayet → hesap askıya alma)
- Ürün kalite puanlama sistemi (kullanıcı yorumları)
- Düzenli rastgele denetim (admin tarafından)

---

## 4. Modül Detayları

### 4.1 Yapay Zeka Asistanı — "ARI"

**Teknoloji:** Anthropic Claude API (claude-sonnet-4-20250514 veya üstü)

**Uzmanlık Alanları:**

| Kategori | Kapsam |
|----------|--------|
| Kovan Bakımı | Kontrol listeleri, bakım takvimi, kovan düzeni, çerçeve yönetimi |
| Ana Arı | Ana arı yetiştirme, değiştirme, işaretleme, kalite değerlendirme |
| Bal Hasadı | Hasat zamanlaması, süzme teknikleri, depolama, nem ölçümü |
| Arı Hastalıkları | Varroa, nosema, Amerikan yavru çürüklüğü, tedavi protokolleri |
| Çiçek ve Bitki | Nektar kaynakları, çiçeklenme takvimleri, bölgesel flora |
| Arı Ürünleri | Propolis, arı sütü, polen, bal mumu, apiterapi |
| Mevsimsel Yönetim | İlkbahar açılışı, yaz yönetimi, sonbahar hazırlığı, kışlama |
| Ekipman | Kovan tipleri, koruyucu ekipman, hasat araçları |
| Mevzuat ve Hukuk | Arıcılık yönetmeliği, gıda mevzuatı, desteklemeler, sigorta |

**Özellikler:**
- Bağlam farkındalığı (kullanıcının kovanları, konumu, mevsim)
- Türkçe doğal dil desteği
- Fotoğraf analizi ile hastalık teşhisi (Claude Vision API)
- Kovan defteri verilerine dayalı kişiselleştirilmiş öneriler
- Sesli komut desteği (Web Speech API)
- Sohbet geçmişi kaydetme
- Kaynakça ve referans gösterme yeteneği

**Soru Hakkı Yönetimi:**
- Ücretsiz kullanıcılar: Günlük 10 soru (gece yarısı sıfırlanır)
- Premium kullanıcılar: Sınırsız
- Rate limiting: Dakikada maks. 5 soru (spam önleme)

### 4.2 Haber Bülteni

**İçerik Kaynakları:**
- Tarım ve Orman Bakanlığı duyuruları
- Arıcılık federasyonları ve birlikleri haberleri
- Bilimsel araştırmalar ve akademik yayınlar
- Uluslararası arıcılık haberleri
- Mevzuat değişiklikleri ve destekleme programları
- Etkinlik ve fuar duyuruları

**Yapay Zeka Entegrasyonu:**
- Otomatik haber toplama ve özetleme (web scraping + AI)
- Kategorizasyon ve etiketleme
- Kişiselleştirilmiş haber akışı (kullanıcı ilgi alanlarına göre)
- Haftalık bülten e-postası (Resend ile otomatik gönderim)

**Özellikler:**
- Kategori bazlı filtreleme
- Arama fonksiyonu
- Kaydet / Yer imi
- Paylaşım butonları (sosyal medya)
- Yorum yapabilme (premium)
- Push bildirim ile son dakika haberleri

### 4.3 Forum

**Kategoriler:**
- Genel Arıcılık Sohbetleri
- Kovan Bakımı ve Yönetim
- Hastalık ve Tedavi
- Bal Hasadı ve İşleme
- Ana Arı Yetiştiriciliği
- Ekipman ve Teknoloji
- Arı Ürünleri
- Pazar ve Ticaret
- Yeni Başlayanlar
- Bölgesel Gruplar

**Özellikler:**
- Konu açma, yanıtlama, alıntılama
- Fotoğraf yükleme (maks. 10MB/adet, JPG/PNG/WebP)
- Video yükleme (maks. 100MB/adet, MP4/WebM) — Supabase Storage
- Beğeni ve oylama sistemi
- Uzman rozeti (AI tarafından onaylanmış doğru cevaplar)
- Bildirim sistemi (yanıt, beğeni, etiketleme)
- Arama ve filtreleme
- Moderasyon araçları (raporlama, engelleme)
- Markdown desteği
- Etiket (tag) sistemi
- "En İyi Cevap" işaretleme
- Kullanıcı itibar puanı

### 4.4 Marketplace

**Ürün Kategorileri:**
- Bal (çiçek, çam, kestane, yayla vs.)
- Arı ürünleri (polen, propolis, arı sütü, bal mumu)
- Arıcılık ekipmanları
- Kovan ve malzemeleri
- Ana arı ve koloni satışı
- Arıcılık kitap ve eğitim materyalleri

**Satıcı (Üretici) Özellikleri:**
- Ürün listeleme (çoklu fotoğraf, video, detaylı açıklama)
- Stok yönetimi
- Fiyatlandırma (normal fiyat, indirimli fiyat)
- Kargo bilgileri (ücretsiz kargo seçeneği)
- Sipariş yönetim paneli
- Satış raporları ve analitikler
- Müşteri mesajlaşma
- QR kod oluşturma (ürün izlenebilirlik)

**Alıcı (Premium Üye) Özellikleri:**
- Ürün arama ve filtreleme (kategori, fiyat, konum, puan)
- Ürün karşılaştırma
- Sepet yönetimi
- Güvenli ödeme (Stripe)
- Sipariş takibi
- Ürün değerlendirme ve yorum (fotoğraflı)
- Favori ürünler listesi
- Satıcıya mesaj gönderme

**Ödeme Akışı:**
- Alıcı → Stripe → Platform komisyonu kesintisi → Satıcı IBAN'ına transfer
- Platform komisyon oranı: %8 (tartışılabilir)
- Stripe Connect kullanımı (satıcı onboarding)
- İade politikası ve anlaşmazlık çözüm mekanizması

**Güvenlik:**
- SSL ile şifreli ödeme
- Stripe PCI DSS uyumluluğu
- Sahte ürün raporlama sistemi
- Satıcı doğrulama rozeti (onaylı üretici)

### 4.5 Üretici Profili

Üretici profili, bir sosyal medya profili gibi çalışır:

**Profil Bileşenleri:**
- Kapak fotoğrafı ve profil fotoğrafı
- İşletme adı ve açıklaması
- Konum (harita üzerinde)
- Arıcılık deneyimi (yıl)
- Kovan sayısı
- Üretim kapasitesi
- Sertifika ve belgeler (doğrulanmış rozet)
- İletişim bilgileri
- Sosyal medya linkleri

**İçerik Paylaşımı:**
- Fotoğraf gönderileri (galeri formatında)
- Video paylaşımı
- Hikaye (story) benzeri paylaşımlar (24 saat)
- Ürün tanıtım yazıları
- Arıcılık günlüğü paylaşımları

**Etkileşim:**
- Takip etme sistemi
- Beğeni ve yorum
- Mesajlaşma
- Profil paylaşma
- Değerlendirme puanı (5 üzerinden)
- Satış istatistikleri (toplam satış, müşteri memnuniyeti)

### 4.6 Kovan Takip Defteri

**Kovan Kaydı:**
- Kovan numarası / adı
- Kovan tipi (Langstroth, Dadant, yerel vb.)
- Konum (GPS koordinatları ile harita üzerinde)
- Ana arı bilgisi (yaş, ırk, işaretleme rengi)
- Koloni gücü (zayıf/orta/güçlü)
- Fotoğraf ekleme

**Kontrol Kayıtları:**
- Kontrol tarihi ve saati
- Hava durumu (otomatik çekilir)
- Ana arı görüldü mü?
- Yavru durumu (açık/kapalı yavru)
- Besin durumu (bal/polen stoğu)
- Hastalık belirtisi var mı?
- Yapılan işlemler (besleme, ilaçlama, çerçeve ekleme vb.)
- Notlar ve fotoğraflar

**Yapay Zeka Entegrasyonu:**
- "3 numaralı kovanınızda son kontrolden 28 gün geçti" hatırlatmaları
- Kontrol verilerine dayalı trend analizi
- Hastalık riski uyarıları (veri paternlerine göre)
- Hasat zamanlaması önerileri
- Mevsimsel bakım hatırlatmaları (kullanıcının konumuna göre)

**Raporlama:**
- Kovan bazlı performans raporu
- Yıllık üretim özeti
- Koloni kayıp analizi
- Grafikler ve trendler (Recharts)

### 4.7 Hava Durumu Entegrasyonu

**Veri Kaynağı:** OpenWeatherMap API

**Özellikler:**
- Kullanıcı konumuna göre anlık hava durumu
- 7 günlük tahmin
- Arıcılık-spesifik uyarılar:
  - Ani sıcaklık düşüşü → "Kovanlarınızı kontrol edin"
  - Yağış tahmini → "Bugün kovan kontrolü için uygun değil"
  - Rüzgar hızı yüksek → "Arılar uçuş yapamayabilir"
  - İdeal sıcaklık → "Bugün kovan kontrolü için ideal"
- Çiçeklenme takvimi ile entegrasyon
- Push bildirim ile acil hava uyarıları

### 4.8 Görsel Hastalık Teşhisi

**Teknoloji:** Claude Vision API

**Akış:**
1. Kullanıcı arı, petek veya kovan fotoğrafı çeker/yükler
2. Fotoğraf Supabase Storage'a yüklenir
3. Claude Vision API'ye gönderilir
4. AI analiz sonucunu döndürür:
   - Olası hastalık/zararlı tanımlaması
   - Güven skoru (%)
   - Önerilen tedavi yöntemleri
   - Aciliyet derecesi (düşük/orta/yüksek/acil)
   - Veterinere başvuru önerisi (gerekirse)

**Tanınabilecek Durumlar:**
- Varroa destructor belirtileri
- Amerikan yavru çürüklüğü
- Avrupa yavru çürüklüğü
- Nosema belirtileri
- Kireç hastalığı
- Taş hastalığı
- Balmumu güvesi zararı
- Normal/sağlıklı durum onayı

**Uyarı:** Her zaman "Bu bir ön değerlendirmedir, kesin teşhis için veteriner hekim ile görüşün" uyarısı gösterilmelidir.

### 4.9 Nektar Haritası

**Özellikler:**
- Harita üzerinde çiçeklenme bölgelerini gösterme
- Kullanıcı katkılı veri girişi (topluluk destekli):
  - Bitki/çiçek türü
  - Çiçeklenme başlangıç/bitiş tarihi
  - Nektar kalitesi (düşük/orta/yüksek)
  - Fotoğraf
  - GPS konumu
- Bölgesel çiçeklenme takvimi
- Filtreler: bitki türü, mevsim, nektar kalitesi
- AI destekli çiçeklenme tahmini (hava durumu + geçmiş veri)
- En iyi kovan konumlandırma önerileri

### 4.10 Ürün İzlenebilirlik Sistemi (QR Kod)

**Akış:**
1. Üretici, ürünü marketplace'e ekler
2. Sistem otomatik QR kod oluşturur
3. Üretici QR kodu yazdırıp ürüne yapıştırır
4. Tüketici QR kodu tarar
5. Açılan sayfada:
   - Üretici bilgileri ve profili
   - Üretim yeri (harita üzerinde)
   - Hasat tarihi
   - Bal türü ve özellikleri
   - Analiz sonuçları (varsa)
   - Üretici sertifikaları
   - Değerlendirme puanı

**Teknik:**
- QR kod oluşturma: `qrcode` kütüphanesi
- Dinamik URL: `aribox.com/trace/{product_id}`
- Herkese açık sayfa (uygulama üyeliği gerektirmez)

### 4.11 Push Bildirimler

**Bildirim Türleri:**
- Mevsimsel bakım hatırlatmaları
- Kovan kontrol hatırlatmaları
- Hava durumu uyarıları
- Forum yanıtları ve beğenileri
- Marketplace sipariş güncellemeleri
- Yeni haber bülteni yayınları
- Üretici için: yeni sipariş, stok uyarısı
- Sistem duyuruları

**Teknoloji:** Firebase Cloud Messaging
**Tercihler:** Kullanıcı bildirim türlerini açıp kapatabilir

### 4.12 Çevrimdışı Mod

**Çevrimdışı Erişilebilir Veriler:**
- Kovan takip defteri (son senkronizasyon verisi)
- AI sohbet geçmişi (kayıtlı konuşmalar)
- Kayıtlı haberler
- Kişisel notlar
- Offline kontrol kaydı girişi (sonra senkronize)

**Teknoloji:**
- Service Worker + PWA
- IndexedDB ile yerel depolama
- Background Sync API ile otomatik senkronizasyon

### 4.13 Analitik Dashboard

**Arıcı Dashboard'u:**
- Kovan sayısı ve durum özeti
- Aylık/yıllık bal üretim grafiği
- Koloni kayıp oranı
- Kontrol sıklığı takvimi
- Hava durumu trendi
- AI önerileri özeti

**Üretici Dashboard'u:**
- Toplam satış (günlük/haftalık/aylık)
- En çok satan ürünler
- Müşteri memnuniyet puanı
- Sipariş durumu özeti
- Gelir grafiği
- Stok durumu
- Müşteri demografikleri

---

## 5. Ödeme Planları

### 5.1 Plan Yapısı

| Özellik | Ücretsiz | Premium Aylık | Premium Yıllık |
|---------|----------|---------------|----------------|
| Fiyat | 0₺ | 50₺/ay | 500₺/yıl (%17 tasarruf) |
| AI Asistan | 10 soru/gün | Sınırsız | Sınırsız |
| Haber Bülteni | Son 3 haber | Tam erişim | Tam erişim |
| Forum | Sadece okuma | Tam erişim | Tam erişim |
| Marketplace | Sadece görüntüleme | Alışveriş yapabilir | Alışveriş yapabilir |
| Kovan Defteri | ✗ | Sınırsız | Sınırsız |
| Hastalık Teşhisi | ✗ | ✓ | ✓ |
| Nektar Haritası | ✗ | ✓ | ✓ |
| Hava Durumu | ✗ | ✓ | ✓ |
| Çevrimdışı Mod | ✗ | ✓ | ✓ |
| Dashboard | ✗ | ✓ | ✓ |
| Push Bildirimler | ✗ | ✓ | ✓ |

### 5.2 Stripe Entegrasyonu

- Stripe Checkout ile güvenli ödeme sayfası
- Stripe Billing ile abonelik yönetimi
- Otomatik yenileme ve fatura oluşturma
- Plan yükseltme/düşürme desteği
- Deneme süresi: İlk 7 gün ücretsiz (opsiyonel)
- İptal politikası: Her zaman iptal edilebilir, dönem sonuna kadar erişim devam eder

### 5.3 Marketplace Komisyon Yapısı

- Satış komisyonu: %8 (Stripe ücretleri dahil)
- Stripe Connect ile satıcı onboarding
- Haftalık otomatik ödeme (satıcı hesabına)
- Minimum çekim tutarı: 100₺

---

## 6. Veritabanı Şeması (Supabase / PostgreSQL)

### Temel Tablolar

```
users
├── id (uuid, PK)
├── email (text, unique)
├── full_name (text)
├── avatar_url (text)
├── phone (text)
├── location (geography)
├── city (text)
├── role (enum: free, premium, producer, admin)
├── subscription_status (enum: active, canceled, expired)
├── stripe_customer_id (text)
├── daily_question_count (int, default 0)
├── daily_question_reset_at (timestamp)
├── created_at (timestamp)
└── updated_at (timestamp)

producer_profiles
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── business_name (text)
├── description (text)
├── cover_photo_url (text)
├── experience_years (int)
├── hive_count (int)
├── production_capacity (text)
├── certificates (jsonb)
├── social_links (jsonb)
├── verification_status (enum: pending, approved, rejected, suspended)
├── verification_documents (jsonb)
├── tax_id (text, encrypted)
├── iban (text, encrypted)
├── stripe_connect_id (text)
├── rating_avg (decimal)
├── rating_count (int)
├── follower_count (int)
├── created_at (timestamp)
└── updated_at (timestamp)

producer_posts (Üretici sosyal paylaşımları)
├── id (uuid, PK)
├── producer_id (uuid, FK → producer_profiles)
├── content (text)
├── media_urls (jsonb) — fotoğraf ve video URL'leri
├── post_type (enum: photo, video, story, article)
├── like_count (int)
├── comment_count (int)
├── expires_at (timestamp, nullable — story için 24 saat)
├── created_at (timestamp)
└── updated_at (timestamp)

producer_followers
├── id (uuid, PK)
├── producer_id (uuid, FK → producer_profiles)
├── follower_id (uuid, FK → users)
├── created_at (timestamp)
└── UNIQUE(producer_id, follower_id)

hives (Kovan Defteri)
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── name (text)
├── hive_number (int)
├── hive_type (enum: langstroth, dadant, local, other)
├── location (geography)
├── location_name (text)
├── queen_age (date)
├── queen_breed (text)
├── queen_marking_color (text)
├── colony_strength (enum: weak, medium, strong)
├── status (enum: active, inactive, dead, sold)
├── photo_url (text)
├── notes (text)
├── created_at (timestamp)
└── updated_at (timestamp)

hive_inspections (Kontrol Kayıtları)
├── id (uuid, PK)
├── hive_id (uuid, FK → hives)
├── user_id (uuid, FK → users)
├── inspection_date (timestamp)
├── weather_temp (decimal) — otomatik çekilir
├── weather_condition (text) — otomatik çekilir
├── queen_seen (boolean)
├── brood_status (jsonb) — açık/kapalı yavru durumu
├── food_status (jsonb) — bal ve polen stoğu
├── disease_signs (boolean)
├── disease_notes (text)
├── actions_taken (text[]) — besleme, ilaçlama vb.
├── notes (text)
├── photos (text[])
├── created_at (timestamp)
└── updated_at (timestamp)

ai_conversations
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── title (text)
├── category (text)
├── messages (jsonb)
├── created_at (timestamp)
└── updated_at (timestamp)

ai_disease_diagnoses
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── hive_id (uuid, FK → hives, nullable)
├── photo_url (text)
├── diagnosis (jsonb) — hastalık adı, güven skoru, öneriler
├── severity (enum: low, medium, high, critical)
├── created_at (timestamp)
└── updated_at (timestamp)

news_articles
├── id (uuid, PK)
├── title (text)
├── slug (text, unique)
├── content (text)
├── summary (text) — AI tarafından oluşturulur
├── category (text)
├── tags (text[])
├── source_url (text)
├── image_url (text)
├── is_breaking (boolean)
├── published_at (timestamp)
├── created_at (timestamp)
└── updated_at (timestamp)

forum_categories
├── id (uuid, PK)
├── name (text)
├── slug (text, unique)
├── description (text)
├── icon (text)
├── post_count (int)
└── sort_order (int)

forum_topics
├── id (uuid, PK)
├── category_id (uuid, FK → forum_categories)
├── user_id (uuid, FK → users)
├── title (text)
├── content (text)
├── tags (text[])
├── is_pinned (boolean)
├── is_locked (boolean)
├── view_count (int)
├── reply_count (int)
├── like_count (int)
├── last_reply_at (timestamp)
├── created_at (timestamp)
└── updated_at (timestamp)

forum_replies
├── id (uuid, PK)
├── topic_id (uuid, FK → forum_topics)
├── user_id (uuid, FK → users)
├── content (text)
├── media_urls (jsonb)
├── is_best_answer (boolean)
├── like_count (int)
├── parent_reply_id (uuid, FK → forum_replies, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

products
├── id (uuid, PK)
├── producer_id (uuid, FK → producer_profiles)
├── name (text)
├── slug (text, unique)
├── description (text)
├── category (text)
├── price (decimal)
├── sale_price (decimal, nullable)
├── currency (text, default 'TRY')
├── stock_quantity (int)
├── images (text[])
├── video_url (text, nullable)
├── weight (decimal)
├── weight_unit (text)
├── harvest_date (date, nullable)
├── harvest_location (text, nullable)
├── origin_region (text)
├── qr_code_url (text) — otomatik oluşturulur
├── is_active (boolean)
├── is_featured (boolean)
├── rating_avg (decimal)
├── rating_count (int)
├── sales_count (int)
├── shipping_info (jsonb)
├── created_at (timestamp)
└── updated_at (timestamp)

orders
├── id (uuid, PK)
├── order_number (text, unique)
├── buyer_id (uuid, FK → users)
├── seller_id (uuid, FK → producer_profiles)
├── items (jsonb) — ürün detayları
├── subtotal (decimal)
├── commission_amount (decimal)
├── shipping_cost (decimal)
├── total (decimal)
├── status (enum: pending, confirmed, shipped, delivered, canceled, refunded)
├── shipping_address (jsonb)
├── tracking_number (text)
├── stripe_payment_id (text)
├── notes (text)
├── created_at (timestamp)
└── updated_at (timestamp)

product_reviews
├── id (uuid, PK)
├── product_id (uuid, FK → products)
├── user_id (uuid, FK → users)
├── order_id (uuid, FK → orders)
├── rating (int, 1-5)
├── comment (text)
├── photos (text[])
├── is_verified_purchase (boolean)
├── created_at (timestamp)
└── updated_at (timestamp)

nectar_map_entries
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── plant_name (text)
├── plant_type (text)
├── location (geography)
├── bloom_start (date)
├── bloom_end (date)
├── nectar_quality (enum: low, medium, high)
├── photo_url (text)
├── notes (text)
├── is_verified (boolean)
├── created_at (timestamp)
└── updated_at (timestamp)

notifications
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── type (text)
├── title (text)
├── body (text)
├── data (jsonb)
├── is_read (boolean)
├── created_at (timestamp)
└── updated_at (timestamp)

subscriptions
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── stripe_subscription_id (text)
├── plan (enum: monthly, yearly)
├── status (enum: active, canceled, past_due, expired)
├── current_period_start (timestamp)
├── current_period_end (timestamp)
├── created_at (timestamp)
└── updated_at (timestamp)

messages (Satıcı-Alıcı Mesajlaşma)
├── id (uuid, PK)
├── sender_id (uuid, FK → users)
├── receiver_id (uuid, FK → users)
├── product_id (uuid, FK → products, nullable)
├── order_id (uuid, FK → orders, nullable)
├── content (text)
├── is_read (boolean)
├── created_at (timestamp)
└── updated_at (timestamp)

reports (Şikayet/Raporlama)
├── id (uuid, PK)
├── reporter_id (uuid, FK → users)
├── reported_user_id (uuid, FK → users, nullable)
├── reported_product_id (uuid, FK → products, nullable)
├── reported_topic_id (uuid, FK → forum_topics, nullable)
├── reason (text)
├── description (text)
├── status (enum: pending, reviewed, resolved, dismissed)
├── admin_notes (text)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Row Level Security (RLS) Politikaları

- Kullanıcılar yalnızca kendi verilerini görebilir/düzenleyebilir
- Üretici profilleri herkes tarafından görüntülenebilir
- Forum içerikleri tüm premium üyelere açık
- Marketplace ürünleri herkese açık (görüntüleme)
- Sipariş bilgileri yalnızca alıcı, satıcı ve admin tarafından erişilebilir
- Admin tüm verilere erişebilir

---

## 7. API Endpoint Yapısı

### Auth

```
POST   /api/auth/register          — Kayıt
POST   /api/auth/login             — Giriş
POST   /api/auth/logout            — Çıkış
POST   /api/auth/forgot-password   — Şifre sıfırlama
POST   /api/auth/verify-email      — E-posta doğrulama
POST   /api/auth/verify-phone      — Telefon doğrulama (OTP)
```

### AI Asistan

```
POST   /api/ai/chat                — Soru gönder
POST   /api/ai/diagnose            — Fotoğraf ile hastalık teşhisi
GET    /api/ai/conversations       — Sohbet geçmişi
GET    /api/ai/conversations/:id   — Tekil sohbet
DELETE /api/ai/conversations/:id   — Sohbet silme
GET    /api/ai/quota               — Günlük soru hakkı durumu
```

### Haber Bülteni

```
GET    /api/news                   — Haber listesi (sayfalama, filtreleme)
GET    /api/news/:slug             — Tekil haber
GET    /api/news/categories        — Kategoriler
POST   /api/news/:id/bookmark      — Yer imine ekle
```

### Forum

```
GET    /api/forum/categories       — Kategoriler
GET    /api/forum/topics           — Konular (sayfalama, filtreleme)
POST   /api/forum/topics           — Konu aç
GET    /api/forum/topics/:id       — Konu detayı + yanıtlar
POST   /api/forum/topics/:id/reply — Yanıtla
POST   /api/forum/topics/:id/like  — Beğen
POST   /api/forum/replies/:id/best — En iyi cevap işaretle
POST   /api/forum/report           — Raporla
```

### Marketplace

```
GET    /api/products               — Ürün listesi
GET    /api/products/:slug         — Ürün detayı
POST   /api/products               — Ürün ekle (üretici)
PUT    /api/products/:id           — Ürün güncelle
DELETE /api/products/:id           — Ürün kaldır
POST   /api/products/:id/review    — Değerlendirme yap
GET    /api/products/:id/reviews   — Değerlendirmeler
```

### Siparişler

```
POST   /api/orders                 — Sipariş oluştur
GET    /api/orders                 — Siparişlerim
GET    /api/orders/:id             — Sipariş detayı
PUT    /api/orders/:id/status      — Durum güncelle (üretici)
POST   /api/orders/:id/cancel      — İptal
```

### Kovan Defteri

```
GET    /api/hives                  — Kovanlarım
POST   /api/hives                  — Kovan ekle
PUT    /api/hives/:id              — Kovan güncelle
DELETE /api/hives/:id              — Kovan sil
POST   /api/hives/:id/inspect      — Kontrol kaydı ekle
GET    /api/hives/:id/inspections  — Kontrol geçmişi
GET    /api/hives/dashboard        — Kovan özet dashboard
```

### Üretici Profili

```
GET    /api/producers              — Üretici listesi
GET    /api/producers/:id          — Üretici profili
POST   /api/producers/apply        — Üretici başvurusu
PUT    /api/producers/profile      — Profil güncelle
POST   /api/producers/posts        — Paylaşım yap
GET    /api/producers/:id/posts    — Paylaşımlar
POST   /api/producers/:id/follow   — Takip et
```

### Nektar Haritası

```
GET    /api/nectar-map             — Harita verileri
POST   /api/nectar-map             — Giriş ekle
GET    /api/nectar-map/calendar    — Çiçeklenme takvimi
```

### Hava Durumu

```
GET    /api/weather                — Anlık hava (konum bazlı)
GET    /api/weather/forecast       — 7 günlük tahmin
GET    /api/weather/alerts         — Arıcılık uyarıları
```

### Bildirimler

```
GET    /api/notifications          — Bildirimler
PUT    /api/notifications/:id/read — Okundu işaretle
PUT    /api/notifications/read-all — Tümünü okundu işaretle
PUT    /api/notifications/settings — Bildirim tercihleri
```

### QR / İzlenebilirlik

```
GET    /api/trace/:product_id      — Ürün izlenebilirlik sayfası (public)
GET    /api/products/:id/qr        — QR kod oluştur/indir
```

### Ödeme

```
POST   /api/payments/checkout      — Stripe checkout session
POST   /api/payments/webhook       — Stripe webhook
GET    /api/payments/subscription  — Abonelik durumu
POST   /api/payments/cancel        — Abonelik iptali
POST   /api/payments/portal        — Stripe müşteri portalı
```

### Admin

```
GET    /api/admin/users            — Kullanıcı listesi
GET    /api/admin/producers/pending — Bekleyen üretici başvuruları
PUT    /api/admin/producers/:id/verify — Üretici onaylama/reddetme
GET    /api/admin/reports           — Raporlar
PUT    /api/admin/reports/:id       — Rapor işleme
GET    /api/admin/analytics         — Platform istatistikleri
POST   /api/admin/news              — Haber yayınla
```

---

## 8. Sayfa Yapısı ve Navigasyon

### Genel Sayfalar (Herkese Açık)
- `/` — Ana sayfa (landing page)
- `/login` — Giriş
- `/register` — Kayıt
- `/pricing` — Fiyatlandırma
- `/about` — Hakkında
- `/contact` — İletişim
- `/trace/:product_id` — Ürün izlenebilirlik (QR sonrası)
- `/privacy` — Gizlilik politikası
- `/terms` — Kullanım şartları

### Uygulama Sayfaları (Giriş Yapılmış)
- `/app` — Dashboard (ana panel)
- `/app/ai` — AI Asistan (sohbet arayüzü)
- `/app/ai/diagnose` — Hastalık teşhisi
- `/app/news` — Haber bülteni
- `/app/news/:slug` — Haber detay
- `/app/forum` — Forum ana sayfa
- `/app/forum/:category` — Kategori sayfası
- `/app/forum/topic/:id` — Konu detay
- `/app/forum/new` — Yeni konu aç
- `/app/marketplace` — Marketplace ana sayfa
- `/app/marketplace/:slug` — Ürün detay
- `/app/marketplace/cart` — Sepet
- `/app/marketplace/checkout` — Ödeme
- `/app/hives` — Kovan defteri
- `/app/hives/:id` — Kovan detay
- `/app/hives/:id/inspect` — Yeni kontrol kaydı
- `/app/nectar-map` — Nektar haritası
- `/app/weather` — Hava durumu
- `/app/messages` — Mesajlar
- `/app/notifications` — Bildirimler
- `/app/profile` — Profil ayarları
- `/app/subscription` — Abonelik yönetimi

### Üretici Sayfaları
- `/app/producer/dashboard` — Üretici dashboard
- `/app/producer/products` — Ürün yönetimi
- `/app/producer/products/new` — Yeni ürün ekle
- `/app/producer/orders` — Sipariş yönetimi
- `/app/producer/analytics` — Satış analitikleri
- `/app/producer/profile` — Üretici profili düzenleme
- `/producer/:id` — Üretici public profili (herkes görebilir)

### Admin Sayfaları
- `/admin` — Admin dashboard
- `/admin/users` — Kullanıcı yönetimi
- `/admin/producers` — Üretici başvuruları
- `/admin/news` — Haber yönetimi
- `/admin/reports` — Raporlar ve şikayetler
- `/admin/analytics` — Platform analitikleri

---

## 9. UI/UX Tasarım Rehberi

### Marka Kimliği
- **Ana Renk:** Amber/Bal tonu — `#F59E0B` (amber-500)
- **İkincil Renk:** Doğal yeşil — `#22C55E` (green-500)
- **Arka Plan:** Krem/sıcak beyaz — `#FFFBEB` (amber-50)
- **Koyu Tema:** Koyu kahverengi — `#451A03` (amber-950)
- **Vurgu:** Sıcak turuncu — `#EA580C` (orange-600)
- **Font:** Genel için modern sans-serif, başlıklar için distinctive display font
- **İkon Seti:** Lucide Icons + özel arıcılık ikonları (petek deseni, arı, kovan)

### Tasarım İlkeleri
- Mobile-first responsive tasarım
- Doğal ve organik his (arıcılık temasına uygun)
- Petek (honeycomb) deseni UI elementlerinde subtle kullanım
- Kolay ve sezgisel navigasyon
- Accessibility (WCAG 2.1 AA uyumlu)
- Dark mode desteği
- Haptic feedback (mobilde)
- Skeleton loading states
- Empty states tasarımları
- Micro-animations (subtle geçişler)

### Mobil Navigasyon
Alt tab bar ile 5 ana sekme:
1. Ana Sayfa (Dashboard)
2. AI Asistan
3. Forum
4. Marketplace
5. Profil

---

## 10. Güvenlik Gereksinimleri

- HTTPS zorunlu (tüm trafik)
- Supabase RLS politikaları (satır seviyesi güvenlik)
- Rate limiting (API istekleri)
- Input validation ve sanitization
- XSS ve CSRF koruması
- SQL injection koruması (Supabase ORM)
- Dosya yükleme validasyonu (tip, boyut, içerik kontrolü)
- Hassas verilerin şifrelenmesi (IBAN, TC Kimlik)
- JWT token yönetimi (Supabase Auth)
- 2FA desteği (opsiyonel, üretici hesapları için önerilen)
- Stripe PCI DSS uyumluluğu
- KVKK uyumluluğu (kişisel veri işleme)
- Düzenli güvenlik denetimleri
- Sentry ile hata ve güvenlik olayı izleme

---

## 11. Performans Gereksinimleri

- Lighthouse skoru: 90+ (tüm kategoriler)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Core Web Vitals uyumlu
- Görsel optimizasyonu (WebP/AVIF, lazy loading)
- API yanıt süreleri: < 500ms (ortalama)
- AI yanıt süresi: < 5s (streaming response)
- Veritabanı sorgu optimizasyonu (indexler)
- CDN kullanımı (Vercel Edge Network)
- Service Worker ile caching stratejisi

---

## 12. SEO Gereksinimleri

- Server-side rendering (Next.js SSR/SSG)
- Meta tag yönetimi (her sayfa için)
- Open Graph ve Twitter Card desteği
- Sitemap.xml otomatik oluşturma
- Robots.txt konfigürasyonu
- Yapılandırılmış veri (Schema.org — Product, Organization)
- Canonical URL yönetimi
- Hızlı sayfa yüklenme (Core Web Vitals)
- Semantic HTML kullanımı
- Alt text zorunluluğu (tüm görseller)

---

## 13. E-posta Şablonları (Resend)

- Hoş geldiniz e-postası
- E-posta doğrulama
- Şifre sıfırlama
- Abonelik onayı / iptali / yenileme
- Sipariş onayı (alıcı + satıcı)
- Sipariş durumu güncelleme
- Kargo bildirimi
- Üretici başvurusu onay/red
- Haftalık haber bülteni
- Kovan kontrol hatırlatması
- Fatura / makbuz

---

## 14. Geliştirme Fazları ve Yol Haritası

### Faz 1 — Temel Altyapı (Hafta 1-3)
- Proje kurulumu (Next.js + Supabase + Tailwind + shadcn/ui)
- Veritabanı şeması ve migration'lar
- Kimlik doğrulama sistemi (kayıt, giriş, rol yönetimi)
- Temel sayfa yapıları ve navigasyon
- Stripe entegrasyonu (abonelik planları)
- Responsive layout ve temel UI bileşenleri

### Faz 2 — Çekirdek Özellikler (Hafta 4-7)
- AI Asistan modülü (Claude API entegrasyonu)
- Soru hakkı yönetimi
- Kovan takip defteri
- Haber bülteni modülü
- Forum (konu açma, yanıtlama, medya yükleme)
- Push bildirim altyapısı

### Faz 3 — Marketplace ve Üretici (Hafta 8-11)
- Üretici başvuru ve doğrulama sistemi
- Üretici profil sistemi (sosyal özellikler)
- Marketplace (ürün listeleme, arama, filtreleme)
- Sepet ve ödeme akışı (Stripe Connect)
- Sipariş yönetimi
- Mesajlaşma sistemi
- QR kod / izlenebilirlik sistemi

### Faz 4 — Gelişmiş Özellikler (Hafta 12-14)
- Görsel hastalık teşhisi (Claude Vision)
- Nektar haritası (harita entegrasyonu)
- Hava durumu entegrasyonu ve uyarılar
- Analitik dashboard'lar
- Çevrimdışı mod (PWA + Service Worker)
- Dark mode

### Faz 5 — Polish ve Launch (Hafta 15-16)
- Kapsamlı test (unit, integration, e2e)
- Performans optimizasyonu
- SEO optimizasyonu
- Güvenlik denetimi
- Beta test (seçili arıcılarla)
- Bug fix ve iyileştirmeler
- Production deploy
- App Store / Play Store (PWA wrapper — opsiyonel)

---

## 15. Başarı Metrikleri (KPI)

| Metrik | Hedef (İlk 6 Ay) |
|--------|-------------------|
| Kayıtlı kullanıcı | 5,000+ |
| Premium abone | 500+ |
| Onaylı üretici | 50+ |
| Marketplace ürün | 200+ |
| Günlük aktif kullanıcı (DAU) | 500+ |
| AI soru/gün | 2,000+ |
| Forum konu/ay | 300+ |
| NPS skoru | 40+ |
| Churn oranı | < %5/ay |
| Marketplace GMV | 100,000₺+/ay |

---

## 16. Ek Notlar

- Tüm metinler Türkçe olacak (i18n altyapısı kurulacak, gelecekte İngilizce desteği için)
- KVKK uyumluluğu için aydınlatma metni ve açık rıza mekanizması
- Üretici sözleşmeleri (kullanım şartları, komisyon oranları)
- İade ve iade politikası dökümanı
- Topluluk kuralları (forum ve marketplace)
- Veri yedekleme stratejisi (Supabase otomatik backup + ek)
- Felaket kurtarma planı
- Ölçeklendirme stratejisi (kullanıcı artışına göre)

---

*Bu döküman ARIBox projesinin kapsamlı teknik ve fonksiyonel spesifikasyonudur. Antigravity ekibi ile birlikte geliştirme sürecinde referans döküman olarak kullanılacaktır.*

**Son Güncelleme:** Mart 2026
**Versiyon:** 1.0
