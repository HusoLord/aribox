import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      producer_profiles(user_id, farm_name, location, description, is_verified, rating_avg, rating_count, users(id, full_name, avatar_url)),
      product_reviews(id, rating, comment, created_at, users(full_name))
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: product } = await supabase
    .from('products')
    .select('producer_id, producer_profiles(user_id)')
    .eq('id', id)
    .single()

  const producerUserId = (product?.producer_profiles as unknown as { user_id: string } | null)?.user_id
  if (producerUserId !== user.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  const body = await request.json()
  const { data, error } = await supabase
    .from('products')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
