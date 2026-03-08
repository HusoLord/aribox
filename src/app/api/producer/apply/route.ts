import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const body = await request.json()
  const { farm_name, location, description, honey_types, contact_phone, website_url } = body

  if (!farm_name || !location || !description) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('producer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Zaten üretici başvurunuz var' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('producer_profiles')
    .insert({
      user_id: user.id,
      farm_name,
      location,
      description,
      honey_types: honey_types || [],
      contact_phone,
      website_url,
      is_verified: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data } = await supabase
    .from('producer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json(data)
}
