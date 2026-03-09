export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, Home, Newspaper, ShoppingBag, Cloud } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: hives } = await supabase
    .from('hives')
    .select('id, name, status, colony_strength')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(5)

  const quickActions = [
    { href: '/app/ai', icon: Bot, label: 'AI Asistanı Aç', color: 'bg-amber-50 text-amber-700' },
    { href: '/app/hives', icon: Home, label: 'Kovan Defteri', color: 'bg-green-50 text-green-700' },
    { href: '/app/ai/diagnose', icon: Bot, label: 'Hastalık Teşhisi', color: 'bg-orange-50 text-orange-700' },
    { href: '/app/nectar-map', icon: Cloud, label: 'Nektar Haritası', color: 'bg-blue-50 text-blue-700' },
    { href: '/app/news', icon: Newspaper, label: 'Haberler', color: 'bg-purple-50 text-purple-700' },
    { href: '/app/marketplace', icon: ShoppingBag, label: 'Marketplace', color: 'bg-pink-50 text-pink-700' },
  ]

  const isPremium = profile?.role === 'premium' || profile?.role === 'producer' || profile?.role === 'admin'

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Karşılama */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Merhaba, {profile?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            ARIBox platformuna hoş geldiniz
          </p>
        </div>
        <Badge variant={isPremium ? 'default' : 'secondary'} className={isPremium ? 'bg-amber-500' : ''}>
          {profile?.role === 'free' ? 'Ücretsiz Plan' :
           profile?.role === 'premium' ? 'Premium' :
           profile?.role === 'producer' ? 'Üretici' : 'Admin'}
        </Badge>
      </div>

      {/* Premium uyarısı */}
      {!isPremium && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-amber-800">Premium&apos;a Geç</p>
              <p className="text-sm text-amber-700">
                Sınırsız AI sorusu, kovan defteri ve daha fazlası için.
              </p>
            </div>
            <Link
              href="/app/subscription"
              className="text-sm font-medium bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Yükselt — 50₺/ay
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Hızlı Erişim */}
      <div>
        <h2 className="font-semibold mb-3">Hızlı Erişim</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Kovanlarım */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Aktif Kovanlarım</h2>
          <Link href="/app/hives" className="text-sm text-amber-600 hover:underline">
            Tümünü Gör
          </Link>
        </div>
        {hives && hives.length > 0 ? (
          <div className="grid gap-2">
            {hives.map(hive => (
              <Link key={hive.id} href={`/app/hives/${hive.id}`}>
                <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Home className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="font-medium text-sm">{hive.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {hive.colony_strength === 'weak' ? 'Zayıf' :
                       hive.colony_strength === 'medium' ? 'Orta' :
                       hive.colony_strength === 'strong' ? 'Güçlü' : 'Bilinmiyor'}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
              <Home className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Henüz kovan eklemediniz</p>
              <Link
                href="/app/hives"
                className="text-sm text-amber-600 hover:underline font-medium"
              >
                {isPremium ? 'Kovan Ekle' : 'Premium ol, kovan ekle'}
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
