import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = { title: 'Profil Ayarları' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Profil Ayarları</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hesap Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ad Soyad</span>
            <span className="font-medium">{profile?.full_name || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">E-posta</span>
            <span className="font-medium">{profile?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Telefon</span>
            <span className="font-medium">{profile?.phone || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Şehir</span>
            <span className="font-medium">{profile?.city || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Üyelik</span>
            <Badge className="bg-amber-500">
              {profile?.role === 'free' ? 'Ücretsiz' :
               profile?.role === 'premium' ? 'Premium' :
               profile?.role === 'producer' ? 'Üretici' : 'Admin'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Üyelik Tarihi</span>
            <span className="font-medium">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('tr-TR')
                : '—'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
