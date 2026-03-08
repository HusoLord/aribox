import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Pin, Lock, ArrowLeft } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export default async function ForumCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: category } = await supabase
    .from('forum_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const { data: topics } = await supabase
    .from('forum_topics')
    .select(`
      id, title, is_pinned, is_locked, reply_count, like_count, last_reply_at, created_at,
      users(full_name)
    `)
    .eq('category_id', category.id)
    .order('is_pinned', { ascending: false })
    .order('last_reply_at', { ascending: false, nullsFirst: false })

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/app/forum"
          className="inline-flex items-center justify-center rounded-lg h-8 w-8 text-muted-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-sm text-muted-foreground">{category.description}</p>
          )}
        </div>
      </div>

      {topics && topics.length > 0 ? (
        <div className="space-y-2">
          {topics.map(topic => (
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
            <p className="text-sm text-muted-foreground">Bu kategoride henüz konu yok</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
