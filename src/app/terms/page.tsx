import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Kullanım Koşulları — ARIBox' }

export default function TermsPage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Ana Sayfaya Dön
      </Link>

      <h1 className="text-3xl font-bold">Kullanım Koşulları</h1>
      <p className="text-sm text-muted-foreground">Son güncelleme: Mart 2025</p>

      <div className="prose prose-sm max-w-none space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Hizmet Tanımı</h2>
          <p className="text-muted-foreground">
            ARIBox, arıcılara yönelik dijital platform hizmetleri sunar. Bu hizmetler; kovan yönetimi,
            pazar yeri, forum, haber ve yapay zeka asistanı özelliklerini kapsar.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. Üyelik Koşulları</h2>
          <p className="text-muted-foreground">
            Platforma kayıt olabilmek için 18 yaşını doldurmuş olmanız gerekmektedir.
            Kayıt sırasında verilen bilgilerin doğru ve güncel olması kullanıcının sorumluluğundadır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. Abonelik ve Ödeme</h2>
          <p className="text-muted-foreground">
            Premium üyelik aylık veya yıllık olarak sunulabilir. Abonelikler otomatik yenilenebilir.
            İptal işlemleri bir sonraki fatura döneminden önce yapılmalıdır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. İçerik Kuralları</h2>
          <p className="text-muted-foreground">
            Forum ve pazar yeri alanlarında yanıltıcı, zararlı veya yasadışı içerik paylaşmak yasaktır.
            Platform yönetimi kural ihlali tespit ettiğinde hesabı askıya alma veya silme hakkını saklı tutar.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Sorumluluk Sınırı</h2>
          <p className="text-muted-foreground">
            ARIBox platformu yapay zeka asistanı aracılığıyla verilen bilgilerin doğruluğunu garanti etmez.
            Veteriner veya tarım uzmanı tavsiyesinin yerini tutmaz.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Değişiklik Hakkı</h2>
          <p className="text-muted-foreground">
            ARIBox bu kullanım koşullarını önceden bildirmeksizin değiştirme hakkını saklı tutar.
            Güncel koşullar her zaman bu sayfada yayımlanır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. İletişim</h2>
          <p className="text-muted-foreground">
            Kullanım koşulları hakkında sorularınız için: <strong>destek@aribox.com.tr</strong>
          </p>
        </section>
      </div>
    </div>
  )
}
