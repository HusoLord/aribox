import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { MessageSquare, Users } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export const metadata = { title: 'Sosyal Akış' }

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Takip edilenlerin ID listesi
  const { data: follows } = await supabase
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', user.id)

  const followingIds = (follows || []).map(f => f.following_id)

  if (followingIds.length === 0) {
    return (
      <div className="container max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Sosyal Akış</h1>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground" />
            <p className="font-medium">Henüz kimseyi takip etmiyorsunuz.</p>
            <p className="text-sm text-muted-foreground">Arıcıları takip ederek onların forum konularını ve aktivitelerini burada görün.</p>
            <Link
              href="/app/users"
              className="mt-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-5 py-2 text-sm font-medium"
            >
              Arıcıları Keşfet
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Takip edilenlerin son forum konuları
  const { data: topics } = await supabase
    .from('forum_topics')
    .select(`
      id, title, reply_count, like_count, created_at,
      users(id, full_name, avatar_url, username),
      forum_categories(name, slug)
    `)
    .in('user_id', followingIds)
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sosyal Akış</h1>
        <Link href="/app/users" className="text-sm text-amber-600 hover:underline">
          Daha fazla keşfet
        </Link>
      </div>

      {topics && topics.length > 0 ? (
        <div className="space-y-3">
          {topics.map(topic => {
            const author = topic.users as unknown as { id: string; full_name: string | null; avatar_url: string | null; username: string | null }
            const category = topic.forum_categories as unknown as { name: string; slug: string }
            const initials = author?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

            return (
              <Card key={topic.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  {/* Yazar satırı */}
                  <div className="flex items-center gap-2 mb-3">
                    <Link href={`/app/users/${author?.id}`} className="shrink-0">
                      <div className="relative h-8 w-8 rounded-full overflow-hidden bg-amber-100">
                        {author?.avatar_url ? (
                          <Image src={author.avatar_url} alt={author.full_name || ''} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-amber-700 font-semibold text-xs">{initials}</div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/app/users/${author?.id}`} className="font-medium text-sm hover:underline">
                        {author?.full_name || 'İsimsiz'}
                      </Link>
                      <span className="text-xs text-muted-foreground ml-1">yeni konu açtı</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(topic.created_at)}</span>
                  </div>

                  {/* Konu */}
                  <Link href={`/app/forum/topic/${topic.id}`}>
                    <p className="font-medium text-sm hover:text-amber-600 transition-colors line-clamp-2 mb-2">{topic.title}</p>
                  </Link>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {category && (
                      <Badge variant="outline" className="text-xs">{category.name}</Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {topic.reply_count}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Takip ettiklerinizden henüz yeni konu yok.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
