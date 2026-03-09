# ARIBox Kapsamlı Hata Ayıklama Raporu (V2)

Claude'un yaptığı "düzeltmeler" sonrasında yerel ortamda (localhost:3000) gerçekleştirilen ikinci, detaylı tarayıcı testinin sonuçlarına göre sistemde hala **kritik eksikler ve hatalar** bulunmaktadır. Aşağıdaki rapor, Claude'un sıfırdan ve eksiksiz olarak çözmesi gereken güncel hataları içermektedir.

---

## 🚨 ÇÖZÜLMEMİŞ VEYA YARIM KALMIŞ KRİTİK HATALAR (High Priority)

### 1. Üretici Başvurusu (POST 500 Error) Devam Ediyor
- **Mevcut Durum:** `/app/producer/apply` sayfasındaki form (İşletme Adı, Konum, Tanıtım, Bal Çeşitleri, Telefon, Web Sitesi) eksiksiz doldurulup **Başvuru Yap** butonuna basıldığında, arka planda `/api/producer/apply` endpoint'i **500 Internal Server Error** veriyor. Başvuru veritabanına kaydedilemiyor.
- **Claude'dan İstenen Çözüm:** 
  - `src/app/api/producer/apply/route.ts` (veya ilgili API) dosyası incelenmeli.
  - Veritabanındaki `producer_profiles` tablosunun beklediği zorunlu sütunlar (Örn: `id`, `user_id`, `business_name`) kontrol edilmeli.
  - API katmanında dönen Supabase hata logu (`console.error(error)`) ele alınıp SQL/veri eşleştirme sorunu kesin olarak çözülmeli.

### 2. Haber Detayında Yorum Alanı Yok (Missing Component)
- **Mevcut Durum:** `/app/news/[slug]` veya benzeri haber detay sayfalarına girildiğinde, metnin ve etiketlerin (tags) altında **hiçbir yorum yapma kutusu veya yorum listesi (NewsComments bileşeni) görünmüyor.** 
- **Claude'dan İstenen Çözüm:**
  - `src/app/app/news/[slug]/page.tsx` dosyasına bakılıp `NewsComments` bileşeninin çağrılıp çağrılmadığı kontrol edilmeli.
  - Eğer bileşen sayfa kodunda varsa bile render olmasını engelleyen bir koşul (örn: `if(commentsEnabled)`) varsa kaldırılmalı veya düzeltilmeli. Ekranda görünür ve çalışır hale getirilmeli.

### 3. Haber Kategori Filtreleri Eksik (Missing UI)
- **Mevcut Durum:** `/app/news` sayfasında haberler listeleniyor, her haberde kategori kartları var ancak sayfanın üst kısmında haberleri filtrelemeye yarayan tıklanabilir kategori butonları (Tümü, Eğitim, İnovasyon vb.) **bulunmuyor.**
- **Claude'dan İstenen Çözüm:**
  - `src/app/app/news/page.tsx` sayfasına haberleri filtreleyecek butonlar (`NewsCategoryFilter` gibi bir bileşenle) eklenmeli ve URL parametresi (`?category=egitim`) ile haberleri süzmesi sağlanmalı.

---

## 🛠️ YENİ TESPİT EDİLEN / DİKKAT EDİLMESİ GEREKENLER

### 4. Admin Paneli Erişim Engeli
- **Mevcut Durum:** Test hesabının menüsünde "Admin" yazmasına rağmen `/admin` sayfasına girilmek istendiğinde sistem otomatik olarak Ana Sayfaya yönlendiriyor veya rota korumasına takılıyor.
- **Claude'dan İstenen Çözüm:** 
  - Admin rota koruması (middleware veya sayfa içi Layout yetki kontrolü) sadece veritabanında rolü 'admin' olanları geçirecek şekilde kodlanmış olmalı. Bu kodun sorunsuz çalıştığından emin olunmalı, gerekiyorsa yetkilendirme mantığı (Supabase RLS veya `role` sütunu) check edilmeli.

### 5. Boş Kayıt (Empty State) UI'ları Kontrolü
- **Mevcut Durum:** Pazar yerinde (`/app/marketplace`) ürün yokken çıkan boş ekranın fena görünmediği tespit edildi. Ancak bu durum diğer bölümlerde (`/app/users` Arıcıları Keşfet veya Boş Sosyal Akış) tam test edilemedi.
- **Claude'dan İstenen Çözüm:** Bütün listeleme sayfalarında data dizisi boşsa kullanıcıyı bilgilendirecek şık bir "Kayıt Bulunamadı" tasarımı (placeholder) olduğundan emin olunmalı.

---
**Özet: Claude'a Verilecek Görev:** "Yukarıdaki raporda belirtilen özellikle ilk 3 maddeyi (500 Hatası, Eksik Yorum Bloğu ve Eksik Filtreleri) kesin çalışacak şekilde kodla. Hiçbir bileşeni eksik veya yorum satırı olarak (`// TODO` gibi) bırakma, tamir et."
