import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const { articleId, action } = await request.json()

  if (!articleId) {
    return NextResponse.json({ error: 'articleId zorunludur' }, { status: 400 })
  }

  if (action === 'remove') {
    const { error } = await supabase
      .from('news_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('article_id', articleId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bookmarked: false })
  }

  const { error } = await supabase
    .from('news_bookmarks')
    .insert({ user_id: user.id, article_id: articleId })
    .select()
    .single()

  // Eğer zaten varsa UNIQUE hatası gelebilir; bu durumda da bookmarked=true döndür.
  if (error && !error.message.includes('duplicate key value')) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bookmarked: true })
}

