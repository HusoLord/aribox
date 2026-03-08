# ARIBox — 10 Aşamalı Geliştirme Planı

## Kurallar
- Her aşama tamamlanmadan bir sonrakine geçilmez
- Her aşama sonunda ilerleme kaydedilir
- Paket yöneticisi: pnpm
- Proje klasörü: `/Users/huseyincebi/Desktop/ArıcılıkAI/aribox`

---

## Aşama 1 — Proje Kurulumu `[TAMAMLANDI]`
**Hedef:** Çalışır durumda bir Next.js 14 projesi
- Next.js 14 App Router kurulumu
- Tailwind CSS konfigürasyonu
- shadcn/ui kurulumu ve temel bileşenler
- ESLint + Prettier konfigürasyonu
- Klasör yapısı oluşturma
- Environment variables yapısı (.env.example)
- pnpm workspace konfigürasyonu

---

## Aşama 2 — Supabase + Veritabanı Şeması `[TAMAMLANDI]`
**Hedef:** Tüm tablolar ve RLS politikaları hazır
- Supabase projesi bağlantısı
- Tüm tablo migration'ları (17+ tablo)
- Row Level Security politikaları
- Supabase client konfigürasyonu (server + client)
- TypeScript tipleri (database.types.ts)
- Supabase Storage bucket'ları

---

## Aşama 3 — Auth Sistemi `[TAMAMLANDI]`
**Hedef:** Tam çalışan kayıt/giriş/rol sistemi
- Supabase Auth entegrasyonu
- Kayıt sayfası (e-posta + sosyal giriş)
- Giriş/çıkış sayfaları
- Middleware (route protection, rol kontrolü)
- Profil kurulum akışı
- Stripe abonelik entegrasyonu (planlar)
- E-posta doğrulama (Resend)

---

## Aşama 4 — Temel UI/Layout `[TAMAMLANDI]`
**Hedef:** Tüm sayfaların iskelet yapısı hazır
- Marka renkleri ve font sistemi (Tailwind config)
- Ana layout bileşenleri (header, sidebar, footer)
- Mobil bottom navigation (5 sekme)
- Landing page (/)
- Pricing sayfası (/pricing)
- Dashboard iskelet (/app)
- Dark mode desteği
- Loading/skeleton state bileşenleri

---

## Aşama 5 — AI Asistanı `[TAMAMLANDI]`
**Hedef:** Tam çalışan AI sohbet modülü
- Claude API entegrasyonu (claude-sonnet-4-20250514)
- Streaming response desteği
- Sohbet arayüzü (/app/ai)
- Günlük soru hakkı yönetimi (free: 10, premium: sınırsız)
- Rate limiting (5 soru/dakika)
- Sohbet geçmişi kaydetme (Supabase)
- Bağlam farkındalığı (kullanıcı profili + kovan verileri)
- Sesli komut desteği (Web Speech API)

---

## Aşama 6 — Kovan Takip Defteri + Hava Durumu `[TAMAMLANDI]`
**Hedef:** Kovan yönetimi ve hava entegrasyonu çalışır
- Kovan CRUD (/app/hives)
- Kontrol kaydı ekleme/listeleme
- GPS konum entegrasyonu
- OpenWeatherMap API entegrasyonu
- Arıcılık-spesifik hava uyarıları
- AI destekli hatırlatmalar
- Kovan raporlama (Recharts grafikleri)

---

## Aşama 7 — Haber Bülteni + Forum `[TAMAMLANDI]`
**Hedef:** İçerik ve topluluk modülleri çalışır
- Haber bülteni CRUD + kategori sistemi
- AI ile haber özetleme
- Haftalık bülten e-postası (Resend)
- Forum kategorileri ve konular
- Yanıt, beğeni, alıntılama sistemi
- Medya yükleme (Supabase Storage)
- Moderasyon araçları
- Bildirim sistemi

---

## Aşama 8 — Marketplace + Üretici + Stripe `[TAMAMLANDI]`
**Hedef:** E-ticaret altyapısı çalışır
- Üretici başvuru ve doğrulama sistemi
- Üretici profil sayfası (sosyal özellikler)
- Ürün listeleme/arama/filtreleme
- Sepet ve Stripe Checkout
- Stripe Connect (satıcı onboarding)
- Sipariş yönetimi paneli
- Mesajlaşma sistemi
- QR kod / izlenebilirlik sistemi

---

## Aşama 9 — Gelişmiş Özellikler `[TAMAMLANDI]`
**Hedef:** Fark yaratan özellikler aktif
- Görsel hastalık teşhisi (Claude Vision API)
- Nektar haritası (Mapbox entegrasyonu)
- Firebase Push Bildirimleri (FCM)
- PWA konfigürasyonu (Service Worker + offline mod)
- IndexedDB ile yerel veri depolama
- Background Sync

---

## Aşama 10 — Dashboard + SEO + Deploy `[TAMAMLANDI]`
**Hedef:** Production'a hazır, deploy edilmiş uygulama
- Arıcı ve üretici analitik dashboard'ları (Recharts)
- PostHog analitik entegrasyonu
- Sentry hata takibi
- SEO (metadata, sitemap, robots.txt, OG tags)
- Lighthouse 90+ optimizasyonu
- Admin paneli
- Vercel deploy + environment konfigürasyonu
- Son test ve bug fix turu

---

## İlerleme Durumu
| Aşama | Durum | Tarih |
|-------|-------|-------|
| 1 — Proje Kurulumu | TAMAMLANDI | Mart 2026 |
| 2 — Supabase + DB | TAMAMLANDI | Mart 2026 |
| 3 — Auth Sistemi | TAMAMLANDI | Mart 2026 |
| 4 — Temel UI/Layout | TAMAMLANDI | Mart 2026 |
| 5 — AI Asistanı | TAMAMLANDI | Mart 2026 |
| 6 — Kovan + Hava | TAMAMLANDI | Mart 2026 |
| 7 — Haber + Forum | TAMAMLANDI | Mart 2026 |
| 8 — Marketplace + Stripe | TAMAMLANDI | Mart 2026 |
| 9 — Gelişmiş Özellikler | TAMAMLANDI | Mart 2026 |
| 10 — Dashboard + Deploy | TAMAMLANDI | Mart 2026 |
