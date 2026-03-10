import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-01-28.clover',
    })
  }
  return _stripe
}

// Keep named export for backwards compat - lazily accessed
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 4400,           // $44/mo
    yearlyPrice: 33600,    // $336/yr ($28/mo billed annually)
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? '',
    yearlyPriceId: process.env.STRIPE_STARTER_PRICE_ID_YEARLY ?? '',
    generations: 50,
    limit: 50,
    formats: 8,
  },
  pro: {
    name: 'Pro',
    price: 11900,          // $119/mo
    yearlyPrice: 90000,    // $900/yr ($75/mo billed annually)
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
    yearlyPriceId: process.env.STRIPE_PRO_PRICE_ID_YEARLY ?? '',
    generations: 200,
    limit: 200,
    formats: 16,
  },
  business: {
    name: 'Business',
    price: 29900,          // $299/mo
    yearlyPrice: 225600,   // $2,256/yr ($188/mo billed annually)
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? '',
    yearlyPriceId: process.env.STRIPE_BUSINESS_PRICE_ID_YEARLY ?? '',
    generations: -1,       // unlimited
    limit: 99999,
    formats: 16,
  },
} as const

export type PlanKey = keyof typeof PLANS
