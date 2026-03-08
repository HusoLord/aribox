import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus, Pin, Lock } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export const metadata = { title: 'Forum' }

export default async function ForumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPremium = profile?.role !== 'free'

  const [{ data: categories }, { data: recentTopics }] = await Promise.all([
    supabase
      .from('forum_categories')
      .select('*')
      .order('sort_order'),
    supabase
      .from('forum_topics')
      .select(`
        id, title, is_pinned, is_locked, reply_count, like_count, last_reply_at, created_at,
        users(full_name),
        forum_categories(name, slug)
      `)
      .order('last_reply_at', { ascending: false, nullsFirst: false })
      .limit(10),
  ])

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Forum</h1>
        {isPremium && (
          <Link
            href="/app/forum/new"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 h-9 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Yeni Konu
          </Link>
        )}
      </div>

      {!isPremium && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-sm text-amber-800">Forum yazmak için premium üyelik gereklidir.</p>
            <Link href="/app/subscription" className="text-sm font-medium text-amber-600 hover:underline">
              Premium ol
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Kategoriler */}
        <div className="md:col-span-1">
          <h2 className="font-semibold mb-3">Kategoriler</h2>
          <div className="space-y-1">
            {categories?.map(cat => (
              <Link
                key={cat.id}
                href={`/app/forum/category/${cat.slug}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-sm">{cat.name}</span>
                <Badge variant="secondary" className="text-xs">{cat.post_count}</Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Son Konular */}
        <div className="md:col-span-2">
          <h2 className="font-semibold mb-3">Son Konular</h2>
          {recentTopics && recentTopics.length > 0 ? (
            <div className="space-y-2">
              {recentTopics.map(topic => (
                <Link key={topic.id} href={`/app/forum/topic/${topic.id}`}>
                  <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2 mb-2">
                        {topic.is_pinned && <Pin className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />}
                        {topic.is_locked && <Lock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />}
                        <h3 className="font-medium text-sm line-clamp-2">{topic.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{(topic.users as unknown as { full_name: string })?.full_name}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {(topic.forum_categories as unknown as { name: string })?.name}
                        </Badge>
                        <span className="ml-auto flex items-center gap-2">
                          <MessageSquare className="h-3 w-3" />
                          {topic.reply_count}
                          <span>{topic.last_reply_at ? formatRelativeTime(topic.last_reply_at) : formatRelativeTime(topic.created_at)}</span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Henüz konu açılmamış</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
