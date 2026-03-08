import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST: takip et
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { following_id } = await request.json()
  if (!following_id) return NextResponse.json({ error: 'following_id gerekli' }, { status: 400 })
  if (following_id === user.id) return NextResponse.json({ error: 'Kendinizi takip edemezsiniz' }, { status: 400 })

  const { error } = await supabase
    .from('user_follows')
    .insert({ follower_id: user.id, following_id })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Zaten takip ediyorsunuz' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ following: true })
}

// DELETE: takibi bırak
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { following_id } = await request.json()
  if (!following_id) return NextResponse.json({ error: 'following_id gerekli' }, { status: 400 })

  await supabase
    .from('user_follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', following_id)

  return NextResponse.json({ following: false })
}
