import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isPremium = profile?.role !== 'free'

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = isPremium ? 20 : 3

  let query = supabase
    .from('news_articles')
    .select('id, title, slug, summary, category, tags, image_url, is_breaking, published_at')
    .order('published_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (search) query = query.ilike('title', `%${search}%`)

  if (!isPremium) {
    // Ücretsiz kullanıcı sadece son 3 haberi görebilir
    query = query.limit(3)
  } else {
    query = query.range((page - 1) * limit, page * limit - 1)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ articles: data, is_limited: !isPremium })
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

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const body = await request.json()
  const { title, content, category, tags, source_url, image_url, is_breaking, summary } = body

  const slug = title.toLowerCase()
    .replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u').replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i').replace(/[ö]/g, 'o').replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')

  const { data, error } = await supabase
    .from('news_articles')
    .insert({ title, content, category, tags: tags || [], source_url, image_url, is_breaking: is_breaking || false, summary, slug, published_at: new Date().toISOString() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
