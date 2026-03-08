import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, MessageSquare } from 'lucide-react'
import FollowButton from '@/components/FollowButton'

const ROLE_LABELS: Record<string, string> = {
  free: 'Ücretsiz',
  premium: 'Premium',
  producer: 'Üretici',
  admin: 'Admin',
}

const ROLE_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  premium: 'bg-amber-100 text-amber-700',
  producer: 'bg-green-100 text-green-700',
  admin: 'bg-red-100 text-red-700',
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { count: hiveCount },
    { count: forumCount },
    { data: recentTopics },
    { count: followerCount },
    { count: followingCount },
    { data: followData },
  ] = await Promise.all([
    supabase.from('users').select('id, full_name, avatar_url, cover_photo_url, bio, username, city, role, created_at').eq('id', id).single(),
    supabase.from('hives').select('*', { count: 'exact', head: true }).eq('user_id', id).eq('status', 'active'),
    supabase.from('forum_topics').select('*', { count: 'exact', head: true }).eq('user_id', id),
    supabase.from('forum_topics').select('id, title, reply_count, created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(5),
    supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('following_id', id),
    supabase.from('user_follows').select('*', { count: 'exact', head: true }).eq('follower_id', id),
    supabase.from('user_follows').select('id').eq('follower_id', user.id).eq('following_id', id).maybeSingle(),
  ])

  if (!profile) notFound()

  const isOwnProfile = user.id === id
  const isFollowing = !!followData
  const initials = profile.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Kapak + Avatar */}
      <div className="relative">
        <div className="h-48 rounded-xl overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 relative">
          {profile.cover_photo_url && (
            <Image src={profile.cover_photo_url} alt="Kapak" fill className="object-cover" />
          )}
        </div>
        <div className="absolute -bottom-10 left-4">
          <div className="relative h-20 w-20 rounded-full border-4 border-background overflow-hidden bg-amber-100">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.full_name || ''} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-amber-700 font-bold text-xl">{initials}</div>
            )}
          </div>
        </div>
      </div>

      {/* Profil Başlığı */}
      <div className="pt-10 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{profile.full_name || 'İsimsiz Kullanıcı'}</h1>
          {profile.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
          {profile.city && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {profile.city}
            </p>
          )}
          <div className="mt-1 flex items-center gap-2">
            <Badge className={ROLE_COLORS[profile.role]}>{ROLE_LABELS[profile.role]}</Badge>
          </div>
          {/* Takipçi sayıları */}
          <div className="flex gap-4 mt-2 text-sm">
            <span><strong>{followerCount || 0}</strong> <span className="text-muted-foreground">takipçi</span></span>
            <span><strong>{followingCount || 0}</strong> <span className="text-muted-foreground">takip</span></span>
          </div>
          {profile.bio && <p className="text-sm text-muted-foreground mt-2 max-w-sm">{profile.bio}</p>}
        </div>
        <div className="flex flex-col gap-2 items-end">
          {isOwnProfile ? (
            <Link href="/app/profile" className="text-sm border rounded-lg px-3 h-8 flex items-center hover:bg-muted transition-colors">
              Düzenle
            </Link>
          ) : (
            <>
              <FollowButton targetUserId={id} initialFollowing={isFollowing} />
              <Link href={`/app/messages?to=${id}`} className="flex items-center gap-1.5 text-sm border rounded-lg px-3 h-8 hover:bg-muted transition-colors">
                <MessageSquare className="h-3.5 w-3.5" /> Mesaj
              </Link>
            </>
          )}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{hiveCount || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Aktif Kovan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{forumCount || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Forum Konusu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{new Date(profile.created_at).getFullYear()}</p>
            <p className="text-xs text-muted-foreground mt-1">Üyelik Yılı</p>
          </CardContent>
        </Card>
      </div>

      {/* Son Forum Konuları */}
      {recentTopics && recentTopics.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Son Forum Konuları</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentTopics.map(topic => (
              <Link key={topic.id} href={`/app/forum/topic/${topic.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                <span className="text-sm line-clamp-1">{topic.title}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 ml-2">
                  <MessageSquare className="h-3 w-3" /> {topic.reply_count}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
