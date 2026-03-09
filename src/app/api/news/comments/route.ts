import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const articleId = searchParams.get('articleId')
  if (!articleId) return NextResponse.json({ error: 'articleId gerekli' }, { status: 400 })

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('news_comments')
    .select('id, content, created_at, user_id, users(full_name)')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json([], { status: 200 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { articleId, content } = await request.json()
  if (!articleId || !content?.trim()) {
    return NextResponse.json({ error: 'articleId ve content gerekli' }, { status: 400 })
  }
  if (content.trim().length > 1000) {
    return NextResponse.json({ error: 'Yorum en fazla 1000 karakter olabilir' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('news_comments')
    .insert({ article_id: articleId, user_id: user.id, content: content.trim() })
    .select('id, content, created_at, user_id, users(full_name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 })

  const { error } = await supabase
    .from('news_comments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
