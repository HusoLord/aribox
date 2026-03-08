import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 12
  const offset = (page - 1) * limit

  let query = supabase
    .from('products')
    .select(`
      id, name, description, price, unit, stock_quantity, images, category, is_organic, rating, review_count,
      producer_profiles(farm_name, location, is_verified, users(full_name))
    `, { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) query = query.ilike('name', `%${search}%`)
  if (category) query = query.eq('category', category)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data, total: count, page, limit })
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

  if (!profile || !['producer', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Sadece üreticiler ürün ekleyebilir' }, { status: 403 })
  }

  const { data: producerProfile } = await supabase
    .from('producer_profiles')
    .select('id, is_verified')
    .eq('user_id', user.id)
    .single()

  if (!producerProfile?.is_verified) {
    return NextResponse.json({ error: 'Doğrulanmış üretici profili gereklidir' }, { status: 403 })
  }

  const body = await request.json()
  const { name, description, price, unit, stock_quantity, images, category, is_organic } = body

  if (!name || !price || !category) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      producer_id: producerProfile.id,
      name,
      description,
      price,
      unit: unit || 'kg',
      stock_quantity: stock_quantity || 0,
      images: images || [],
      category,
      is_organic: is_organic || false,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
