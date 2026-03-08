import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, Home, Map, ShoppingBag, Newspaper, MessageSquare, Check } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: 'AI Asistan — ARI',
    description: 'Arıcılık uzmanı yapay zeka asistanınız. Kovan yönetiminden hastalık teşhisine her sorunda yanınızda.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Home,
    title: 'Kovan Takip Defteri',
    description: 'Tüm kovanlarınızı dijital ortamda takip edin. Kontrol kayıtları, AI önerileri ve raporlar.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Map,
    title: 'Nektar Haritası',
    description: 'Topluluk destekli çiçeklenme haritası. En iyi nektar bölgelerini keşfedin.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: ShoppingBag,
    title: 'Marketplace',
    description: 'Doğrudan üreticilerden güvenilir arı ürünleri satın alın. QR kod ile izlenebilirlik.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Newspaper,
    title: 'Haber Bülteni',
    description: 'Arıcılık dünyasından son haberler, mevzuat değişiklikleri ve akademik araştırmalar.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: MessageSquare,
    title: 'Arıcı Forumu',
    description: 'Binlerce arıcıyla deneyim paylaşın, soru sorun, uzman rozeti kazanın.',
    color: 'bg-pink-50 text-pink-600',
  },
]

const plans = [
  {
    name: 'Ücretsiz',
    price: '0₺',
    period: 'sonsuza dek',
    features: [
      'Günlük 10 AI sorusu',
      'Son 3 haberi okuma',
      'Forumu görüntüleme',
      'Marketplace\'i görüntüleme',
    ],
    cta: 'Ücretsiz Başla',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '50₺',
    period: '/ay',
    yearlyPrice: '500₺/yıl',
    features: [
      'Sınırsız AI sorusu',
      'Tüm haberlere erişim',
      'Forum\'da yazabilme',
      'Marketplace\'den alışveriş',
      'Sınırsız kovan defteri',
      'Görsel hastalık teşhisi',
      'Nektar haritası',
      'Hava durumu uyarıları',
      'Push bildirimler',
      'Çevrimdışı mod',
    ],
    cta: 'Premium Başla',
    href: '/register?plan=premium',
    highlighted: true,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 px-4 max-w-6xl mx-auto">
          <span className="text-xl font-bold text-amber-600">ARIBox</span>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#features" className="text-muted-foreground hover:text-foreground">Özellikler</Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground">Fiyatlar</Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">Giriş</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex items-center rounded-lg px-3 h-7 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Giriş Yap</Link>
            <Link href="/register" className="inline-flex items-center rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-3 h-7 text-sm font-medium transition-colors">Kayıt Ol</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container max-w-6xl mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 bg-amber-100 text-amber-700 hover:bg-amber-100">
          Yapay Zeka Destekli Arıcılık
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Arıcılığın Geleceği
          <br />
          <span className="text-amber-500">ARIBox&apos;ta</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Yapay zeka asistanı, kovan takip defteri, hastalık teşhisi, marketplace ve daha fazlası
          tek bir platformda.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="inline-flex items-center rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-8 h-10 text-base font-medium transition-colors">Ücretsiz Başla</Link>
          <Link href="/login" className="inline-flex items-center rounded-lg border border-border bg-background hover:bg-muted px-8 h-10 text-base font-medium transition-colors">Giriş Yap</Link>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Kredi kartı gerektirmez • Ücretsiz plan sonsuza kadar ücretsiz
        </p>
      </section>

      {/* Features */}
      <section id="features" className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Her Arıcı İçin Her Şey</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Hobi arıcısından profesyonel üreticiye kadar ihtiyacınız olan tüm araçlar.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, color }) => (
            <Card key={title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Şeffaf Fiyatlandırma</h2>
          <p className="text-muted-foreground">İhtiyacınıza göre plan seçin</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map(plan => (
            <Card
              key={plan.name}
              className={plan.highlighted ? 'border-amber-400 shadow-lg relative' : ''}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-amber-500 text-white">En Popüler</Badge>
                </div>
              )}
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  {'yearlyPrice' in plan && plan.yearlyPrice && (
                    <p className="text-sm text-muted-foreground mt-1">veya {plan.yearlyPrice} (%17 tasarruf)</p>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`flex items-center justify-center w-full rounded-lg h-9 text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'border border-border bg-background hover:bg-muted'
                  }`}
                >
                  {plan.cta}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-lg font-bold text-amber-600">ARIBox</span>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">Gizlilik</Link>
              <Link href="/terms" className="hover:text-foreground">Kullanım Şartları</Link>
              <Link href="/contact" className="hover:text-foreground">İletişim</Link>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 ARIBox. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
