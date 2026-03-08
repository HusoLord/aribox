import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { plan } = await request.json()
  const priceId = plan === 'yearly' ? STRIPE_PLANS.premium_yearly : STRIPE_PLANS.premium_monthly

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { user_id: user.id, plan },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/subscription?canceled=true`,
    subscription_data: {
      metadata: { user_id: user.id, name: profile?.full_name || '' },
    },
  })

  return NextResponse.json({ url: session.url })
}
