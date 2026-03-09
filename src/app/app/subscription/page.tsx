export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Mail } from 'lucide-react'

export const metadata = { title: 'Abonelik' }

const features = [
  'Sınırsız AI sorusu',
  'Tüm haberlere erişim',
  "Forum'da yazabilme",
  "Marketplace'den alışveriş",
  'Sınırsız kovan defteri',
  'Görsel hastalık teşhisi',
  'Nektar haritası',
  'Hava durumu uyarıları',
  'Analitik dashboard',
  'Üretici başvuru hakkı',
]

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const isPremium = profile?.role === 'premium' || profile?.role === 'producer' || profile?.role === 'admin'

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Abonelik</h1>

      {isPremium ? (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-6 text-center space-y-3">
            <Crown className="h-12 w-12 text-amber-500 mx-auto" />
            <Badge className="bg-amber-500 text-white text-base px-4 py-1">
              {profile?.role === 'admin' ? 'Admin' :
               profile?.role === 'producer' ? 'Üretici' : 'Premium Üye'}
            </Badge>
            <p className="text-amber-800">Tüm premium özelliklere erişiminiz aktif.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground">Premium plana geçerek tüm özelliklerin kilidini açın.</p>

          <Card className="border-amber-400">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Premium Plan</CardTitle>
                <Badge className="bg-amber-500">Önerilen</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">50₺</span>
                <span className="text-muted-foreground">/ay</span>
                <span className="text-sm text-muted-foreground">veya 500₺/yıl</span>
              </div>

              <ul className="space-y-2">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-2">
                <p className="text-sm font-medium text-amber-800">Ödeme sistemi yakında aktif olacak</p>
                <p className="text-xs text-amber-700">
                  Premium üyelik için şu an iletişime geçin:
                </p>
                <a
                  href="mailto:destek@aribox.com"
                  className="flex items-center gap-2 text-sm text-amber-600 hover:underline font-medium"
                >
                  <Mail className="h-4 w-4" />
                  destek@aribox.com
                </a>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                İlk 7 gün ücretsiz deneme • İstediğiniz zaman iptal
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
