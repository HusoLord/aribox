import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  if (profile?.role === 'free') {
    return NextResponse.json({ error: 'Premium üyelik gereklidir' }, { status: 403 })
  }

  const { data } = await supabase
    .from('nectar_map_entries')
    .select(`
      id, latitude, longitude, plant_name, bloom_start, bloom_end, nectar_quality, notes,
      users(full_name)
    `)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  if (profile?.role === 'free') {
    return NextResponse.json({ error: 'Premium üyelik gereklidir' }, { status: 403 })
  }

  const body = await request.json()
  const { latitude, longitude, plant_name, bloom_start, bloom_end, nectar_quality, notes } = body

  if (!latitude || !longitude || !plant_name) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('nectar_map_entries')
    .insert({ user_id: user.id, latitude, longitude, plant_name, bloom_start, bloom_end, nectar_quality, notes })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
