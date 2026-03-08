import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      products(name, images, unit, producer_profiles(farm_name))
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(orders || [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { product_id, quantity, shipping_address } = await request.json()

  if (!product_id || !quantity || !shipping_address) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
  }

  const { data: product } = await supabase
    .from('products')
    .select('id, name, price, stock_quantity, producer_profiles(user_id)')
    .eq('id', product_id)
    .eq('is_active', true)
    .single()

  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })
  if (product.stock_quantity < quantity) {
    return NextResponse.json({ error: 'Yetersiz stok' }, { status: 400 })
  }

  const total_price = product.price * quantity

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{
      price_data: {
        currency: 'try',
        product_data: { name: product.name },
        unit_amount: Math.round(product.price * 100),
      },
      quantity,
    }],
    metadata: {
      user_id: user.id,
      product_id,
      quantity: String(quantity),
      shipping_address: JSON.stringify(shipping_address),
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/marketplace/orders?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/marketplace/product/${product_id}`,
  })

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      buyer_id: user.id,
      product_id,
      quantity,
      unit_price: product.price,
      total_price,
      shipping_address,
      status: 'pending',
      stripe_payment_intent_id: session.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ order, checkout_url: session.url }, { status: 201 })
}
