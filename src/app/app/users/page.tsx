'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import FollowButton from '@/components/FollowButton'

const ROLE_LABELS: Record<string, string> = {
  free: 'Ücretsiz', premium: 'Premium', producer: 'Üretici', admin: 'Admin',
}

interface UserResult {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  city: string | null
  role: string
  isFollowing: boolean
}

export default function UsersPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserResult[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
    })
  }, [])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, username, avatar_url, city, role')
      .or(`full_name.ilike.%${q}%,username.ilike.%${q}%`)
      .neq('id', user?.id ?? '')
      .limit(20)

    if (!users) { setLoading(false); return }

    // Takip durumunu kontrol et
    const userIds = users.map(u => u.id)
    const { data: follows } = user ? await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', user.id)
      .in('following_id', userIds) : { data: [] }

    const followingSet = new Set((follows || []).map(f => f.following_id))

    setResults(users.map(u => ({ ...u, isFollowing: followingSet.has(u.id) })))
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Arıcıları Keşfet</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Ad, soyad veya kullanıcı adı ile ara..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-2">
          {results.map(user => {
            const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
            return (
              <Card key={user.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Link href={`/app/users/${user.id}`} className="shrink-0">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-amber-100">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt={user.full_name || ''} fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-amber-700 font-semibold text-sm">{initials}</div>
                      )}
                    </div>
                  </Link>
                  <Link href={`/app/users/${user.id}`} className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.full_name || 'İsimsiz'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {user.username && <span className="text-xs text-muted-foreground">@{user.username}</span>}
                      {user.city && (
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />{user.city}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">{ROLE_LABELS[user.role] || user.role}</Badge>
                    {currentUserId && currentUserId !== user.id && (
                      <FollowButton targetUserId={user.id} initialFollowing={user.isFollowing} />
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">Sonuç bulunamadı.</p>
      )}

      {!query && (
        <p className="text-center text-muted-foreground text-sm py-8">
          Ad, soyad veya kullanıcı adı ile arama yapın.
        </p>
      )}
    </div>
  )
}
