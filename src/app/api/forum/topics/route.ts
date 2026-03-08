import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const topicSchema = z.object({
  category_id: z.string().uuid(),
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır'),
  content: z.string().min(10, 'İçerik en az 10 karakter olmalıdır'),
  tags: z.array(z.string()).optional().default([]),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  let query = supabase
    .from('forum_topics')
    .select(`
      id, title, tags, is_pinned, is_locked, view_count, reply_count, like_count, last_reply_at, created_at,
      users(full_name, avatar_url),
      forum_categories(name, slug)
    `)
    .order('is_pinned', { ascending: false })
    .order('last_reply_at', { ascending: false, nullsFirst: false })
    .range((page - 1) * limit, page * limit - 1)

  if (category) query = query.eq('forum_categories.slug', category)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'free') {
    return NextResponse.json({ error: 'Forum yazısı premium özelliktir' }, { status: 403 })
  }

  const body = await request.json()
  const result = topicSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 })

  const { data, error } = await supabase
    .from('forum_topics')
    .insert({ ...result.data, user_id: user.id })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Kategori konu sayısını artır
  try { await supabase.rpc('increment_category_post_count', { cat_id: result.data.category_id }) } catch { }

  return NextResponse.json(data, { status: 201 })
}
