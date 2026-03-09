export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, MessageSquare, Pin, Lock, ThumbsUp } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: topic } = await supabase
    .from('forum_topics')
    .select(`
      *,
      users(id, full_name, avatar_url, role),
      forum_categories(name, slug),
      forum_replies(
        id, content, is_best_answer, like_count, parent_reply_id, created_at,
        users(id, full_name, avatar_url, role)
      )
    `)
    .eq('id', id)
    .single()

  if (!topic) notFound()

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPremium = profile?.role !== 'free'
  const authorUser = topic.users as { id: string; full_name: string; role: string }
  const category = topic.forum_categories as { name: string; slug: string }
  const replies = (topic.forum_replies as Array<{
    id: string; content: string; is_best_answer: boolean; like_count: number;
    created_at: string; users: { full_name: string; role: string }
  }>).sort((a, b) => {
    if (a.is_best_answer && !b.is_best_answer) return -1
    if (!a.is_best_answer && b.is_best_answer) return 1
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  return (
    <div className="container max-w-3xl mx-auto p-4 space-y-4">
      <Link href="/app/forum" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Foruma Dön
      </Link>

      {/* Konu */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-2 mb-3">
            {topic.is_pinned && <Pin className="h-4 w-4 text-amber-500 shrink-0 mt-1" />}
            {topic.is_locked && <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
            <div>
              <h1 className="text-xl font-bold">{topic.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{category?.name}</Badge>
                {topic.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4">{topic.content}</p>

          <div className="flex items-center gap-3 pt-4 border-t text-xs text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                {authorUser?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <span>{authorUser?.full_name}</span>
            <span>•</span>
            <span>{formatRelativeTime(topic.created_at)}</span>
            <span className="ml-auto flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {topic.reply_count} yanıt
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Yanıtlar */}
      <div className="space-y-3">
        <h2 className="font-semibold">Yanıtlar ({replies.length})</h2>
        {replies.map(reply => {
          const replyUser = reply.users as { full_name: string; role: string }
          return (
            <Card
              key={reply.id}
              className={reply.is_best_answer ? 'border-green-300 bg-green-50' : ''}
            >
              <CardContent className="p-4">
                {reply.is_best_answer && (
                  <Badge className="bg-green-500 text-white text-xs mb-2">En İyi Yanıt</Badge>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">{reply.content}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                      {replyUser?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{replyUser?.full_name}</span>
                  <span>•</span>
                  <span>{formatRelativeTime(reply.created_at)}</span>
                  <span className="ml-auto flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {reply.like_count}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {replies.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Henüz yanıt yok</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Yanıt formu */}
      {isPremium && !topic.is_locked && (
        <ReplyForm topicId={id} />
      )}

      {!isPremium && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center justify-between">
            <p className="text-sm text-amber-800">Yanıt vermek için premium üyelik gereklidir.</p>
            <Link href="/app/subscription" className="text-sm font-medium text-amber-600 hover:underline">
              Premium ol
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ReplyForm({ topicId }: { topicId: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <form action={`/api/forum/topics/${topicId}`} method="POST">
          <label className="block text-sm font-medium mb-2">Yanıtınız</label>
          <textarea
            name="content"
            rows={4}
            placeholder="Yanıtınızı yazın..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 h-8 text-sm font-medium transition-colors"
            >
              Yanıtla
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
