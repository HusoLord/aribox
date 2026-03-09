import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Gizlilik Politikası — ARIBox' }

export default function PrivacyPage() {
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Ana Sayfaya Dön
      </Link>

      <h1 className="text-3xl font-bold">Gizlilik Politikası</h1>
      <p className="text-sm text-muted-foreground">Son güncelleme: Mart 2025</p>

      <div className="prose prose-sm max-w-none space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Toplanan Veriler</h2>
          <p className="text-muted-foreground">
            ARIBox platformu olarak kullanıcılarımızdan ad-soyad, e-posta adresi ve platform kullanım verileri toplayabiliriz.
            Bu veriler yalnızca hizmetlerimizi sunmak amacıyla kullanılır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. Verilerin Kullanımı</h2>
          <p className="text-muted-foreground">
            Toplanan veriler; hesap yönetimi, hizmet iyileştirme ve kullanıcı deneyimini kişiselleştirme amacıyla kullanılır.
            Verileriniz üçüncü taraflarla pazarlama amacıyla paylaşılmaz.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. Çerezler</h2>
          <p className="text-muted-foreground">
            Platformumuz oturum yönetimi ve kullanıcı tercihlerini kaydetmek için çerezler kullanır.
            Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. Veri Güvenliği</h2>
          <p className="text-muted-foreground">
            Verileriniz Supabase altyapısı üzerinde güvenli şekilde saklanır. SSL/TLS şifrelemesi ve
            endüstri standardı güvenlik önlemleri uygulanmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Haklarınız</h2>
          <p className="text-muted-foreground">
            KVKK kapsamında verilerinize erişme, düzeltme, silme ve taşıma haklarına sahipsiniz.
            Bu haklarınızı kullanmak için bizimle iletişime geçebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. İletişim</h2>
          <p className="text-muted-foreground">
            Gizlilik politikamız hakkında sorularınız için: <strong>destek@aribox.com.tr</strong>
          </p>
        </section>
      </div>
    </div>
  )
}
