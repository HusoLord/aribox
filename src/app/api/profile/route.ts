import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const body = await request.json()
  const { full_name, bio, username, phone, city, cover_photo_url } = body

  // Username unique kontrolü
  if (username) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .single()
    if (existing) {
      return NextResponse.json({ error: 'Bu kullanıcı adı zaten alınmış' }, { status: 409 })
    }
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (full_name !== undefined) updates.full_name = full_name
  if (bio !== undefined) updates.bio = bio
  if (username !== undefined) updates.username = username || null
  if (phone !== undefined) updates.phone = phone
  if (city !== undefined) updates.city = city
  if (cover_photo_url !== undefined) updates.cover_photo_url = cover_photo_url

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
