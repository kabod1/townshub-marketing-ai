import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

  const body = await request.json()
  const eventType = body.event_type

  if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
    const sub = body.resource
    const customId: string = sub.custom_id ?? ''
    const [userId, plan] = customId.split('|')

    if (userId && plan) {
      await supabaseAdmin.from('profiles').update({
        plan,
        paypal_subscription_id: sub.id,
        generations_limit: PLAN_LIMITS[plan] ?? 50,
      }).eq('id', userId)

      await supabaseAdmin.from('subscriptions').upsert({
        user_id: userId,
        provider: 'paypal',
        subscription_id: sub.id,
        plan,
        status: 'active',
        current_period_end: sub.billing_info?.next_billing_time ?? null,
      }, { onConflict: 'user_id' })
    }
  }

  if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED' || eventType === 'BILLING.SUBSCRIPTION.SUSPENDED') {
    const sub = body.resource
    const customId: string = sub.custom_id ?? ''
    const [userId] = customId.split('|')

    if (userId) {
      await supabaseAdmin.from('profiles').update({
        plan: 'free',
        generations_limit: 5,
        paypal_subscription_id: null,
      }).eq('id', userId)

      await supabaseAdmin.from('subscriptions').update({
        status: 'cancelled',
      }).eq('subscription_id', sub.id)
    }
  }

  return NextResponse.json({ received: true })
}
