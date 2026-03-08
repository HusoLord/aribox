import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const replySchema = z.object({
  content: z.string().min(1, 'Yanıt boş olamaz'),
  parent_reply_id: z.string().uuid().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  // Görüntülenme sayısını artır
  await supabase
    .from('forum_topics')
    .update({ view_count: supabase.rpc('increment', { x: 1 }) as unknown as number })
    .eq('id', id)

  const { data: topic, error } = await supabase
    .from('forum_topics')
    .select(`
      *,
      users(id, full_name, avatar_url, role),
      forum_categories(name, slug),
      forum_replies(
        id, content, media_urls, is_best_answer, like_count, parent_reply_id, created_at,
        users(id, full_name, avatar_url, role)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !topic) return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 })
  return NextResponse.json(topic)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'free') {
    return NextResponse.json({ error: 'Forum yanıtı premium özelliktir' }, { status: 403 })
  }

  const body = await request.json()
  const result = replySchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 })

  const { data, error } = await supabase
    .from('forum_replies')
    .insert({ ...result.data, topic_id: id, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
