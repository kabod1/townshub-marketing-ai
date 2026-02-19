import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const PLAN_LIMITS: Record<string, number> = {
  starter: 50,
  pro: 200,
  business: 99999,
}

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan

    if (userId && plan && session.subscription) {
      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any

      await supabaseAdmin.from('profiles').update({
        plan,
        stripe_customer_id: session.customer as string,
        generations_limit: PLAN_LIMITS[plan] ?? 50,
      }).eq('id', userId)

      await supabaseAdmin.from('subscriptions').upsert({
        user_id: userId,
        provider: 'stripe',
        subscription_id: subscriptionId,
        plan,
        status: 'active',
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
      }, { onConflict: 'user_id' })
    }
  }

  if (event.type === 'customer.subscription.updated') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = event.data.object as any
    const userId = subscription.metadata?.user_id
    const plan = subscription.metadata?.plan

    if (userId) {
      await supabaseAdmin.from('subscriptions').update({
        status: subscription.status,
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        ...(plan ? { plan } : {}),
      }).eq('subscription_id', subscription.id)

      if (plan) {
        await supabaseAdmin.from('profiles').update({
          plan,
          generations_limit: PLAN_LIMITS[plan] ?? 50,
        }).eq('id', userId)
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = event.data.object as any
    const userId = subscription.metadata?.user_id

    if (userId) {
      await supabaseAdmin.from('profiles').update({
        plan: 'free',
        generations_limit: 5,
      }).eq('id', userId)

      await supabaseAdmin.from('subscriptions').update({
        status: 'cancelled',
      }).eq('subscription_id', subscription.id)
    }
  }

  return NextResponse.json({ received: true })
}
