import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-02-25.clover',
})

export const STRIPE_PLANS = {
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_mock_monthly',
  premium_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_mock_yearly',
}
