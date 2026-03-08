# ARIBox Geliştirme Planı ve Yol Haritası

Bu doküman, ARIBox platformunu bir arıcılık yönetim aracından Türkiye'nin en büyük Arıcı Sosyal Ağı ve Yapay Zeka platformuna dönüştürmek için planlanan özellikleri içerir.

---

## DURUM TABLOSU

| Aşama | Konu | Durum |
|-------|------|-------|
| Aşama 1 | Gelişmiş Kullanıcı Profilleri | ✅ TAMAMLANDI |
| Aşama 2 | Takip / Bağlantı Sistemi | ✅ TAMAMLANDI |
| Aşama 3 | Kategori Bazlı AI Asistan | Bekliyor |
| Aşama 4 | İçerik / Haber + Admin CMS | Bekliyor |
| Aşama 5 | Marketplace Sosyalleştirme | Bekliyor |

---

## Aşama 1: Gelişmiş Kullanıcı Profilleri ✅ TAMAMLANDI

> Tamamlanma tarihi: 2026-03-09

### Yapılanlar
- [x] **Kapak + Avatar Fotoğrafı:** Profil sayfasında kapak (banner) ve avatar yükleme, tıklayınca değiştirme.
- [x] **Biyografi & Kullanıcı Adı:** Kullanıcılar bio ve @kullaniciadi ekleyebilir.
- [x] **Profil Düzenleme Formu:** Ad soyad, biyografi, kullanıcı adı, telefon, şehir alanları düzenlenebilir.
- [x] **Kovan İstatistikleri Vitrini:** Aktif kovan sayısı, forum konu sayısı, üyelik yılı profilde gösterilir.
- [x] **Public Profil Sayfası:** `/app/users/[id]` — herhangi bir kullanıcının profili görüntülenebilir.
- [x] **Mesaj Gönder Butonu:** Public profilde başka kullanıcıya mesaj gönderme linki.

### Teknik Detaylar
- `supabase/migrations/005_profile_extensions.sql` — `bio`, `cover_photo_url`, `username` kolonları
- `src/app/api/profile/route.ts` — PATCH: profil güncelleme API
- `src/app/api/profile/avatar/route.ts` — POST: avatar/kapak yükleme (avatars + covers bucket)
- `src/app/app/profile/page.tsx` — client component, tam düzenlenebilir profil
- `src/app/app/users/[id]/page.tsx` — server component, public profil görünümü

---

## Aşama 2: Takip / Bağlantı Sistemi ✅ TAMAMLANDI

> Tamamlanma tarihi: 2026-03-09

### Yapılanlar
- [x] **Takip Et / Bırak:** Profil sayfasından tek tıkla takip, anlık güncelleme.
- [x] **Takipçi / Takip Sayıları:** Public profil sayfasında takipçi ve takip edilen sayıları.
- [x] **Arıcıları Keşfet:** `/app/users` — ad/kullanıcı adı ile arama, anlık filtre, takip butonu.
- [x] **Sosyal Akış:** `/app/feed` — takip edilenlerin yeni forum konuları.
- [x] **Navigasyon:** Sidebar ve BottomNav'a Sosyal Akış + Arıcılar linkleri eklendi.

### Teknik Detaylar
- `supabase/migrations/006_follow_system.sql` — user_follows tablosu + RLS
- `src/app/api/follow/route.ts` — POST (takip et) / DELETE (bırak)
- `src/components/FollowButton.tsx` — yeniden kullanılabilir takip butonu
- `src/app/app/users/page.tsx` — arıcı arama sayfası
- `src/app/app/feed/page.tsx` — sosyal akış sayfası

---

## Aşama 3: Kategori Bazlı AI Asistan

### Planlanacaklar
- [ ] **Yeni AI Arayüzü:** 9 kategorili kart seçimi + kategoriye özel sohbet.
- [ ] **Uzmanlık Kategorileri:**
  - Kovan Bakımı ve Düzeni
  - Ana Arı Yetiştiriciliği
  - Bal Hasadı ve İşleme
  - Arı Hastalıkları ve Zararlıları
  - Çiçek, Bitki ve Nektar Takvimi
  - Arı Ürünleri (Propolis, Polen vd.)
  - Mevsimsel Yönetim
  - Ekipman ve Teknolojiler
  - Mevzuat, Hukuk ve Devlet Destekleri
- [ ] **Kategoriye Özel System Prompt:** Her kategori için uzman AI tonu.

---

## Aşama 4: İçerik / Haber + Admin CMS

### Planlanacaklar
- [ ] **Dinamik İçerik Yönetimi (CMS):** Admin panelinden haber ekleme/düzenleme/silme.
- [ ] **Kategorize Edilmiş Haberler:** Filtreli haber listeleme.
- [ ] **Yorum ve Etkileşim:** Haberlere yorum yapabilme.
- [ ] **Admin Paneli:** `/admin` altında kullanıcı ve içerik yönetimi.

---

## Aşama 5: Marketplace Sosyalleştirme

### Planlanacaklar
- [ ] **Satıcı Profilleri:** Ürün sayfasında satıcının public profil linki.
- [ ] **Güven Skoru / Değerlendirme Puanı:** Satıcı puanlaması ve profilde gösterim.
- [ ] **Takip Edilenlerin İlanları:** Sosyal akışta takip edilen satıcıların yeni ilanları.
