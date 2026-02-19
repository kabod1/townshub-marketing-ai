import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PAYPAL_PLAN_IDS: Record<string, string> = {
  starter: process.env.PAYPAL_STARTER_PLAN_ID ?? '',
  pro: process.env.PAYPAL_PRO_PLAN_ID ?? '',
  business: process.env.PAYPAL_BUSINESS_PLAN_ID ?? '',
}

async function getPayPalAccessToken(): Promise<string> {
  const res = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { plan } = await request.json() as { plan: string }
  const planId = PAYPAL_PLAN_IDS[plan]

  if (!planId) {
    return NextResponse.json({ error: 'Invalid plan or PayPal not configured' }, { status: 400 })
  }

  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? ''
  const token = await getPayPalAccessToken()

  const res = await fetch('https://api-m.paypal.com/v1/billing/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: `${user.id}|${plan}`,
      application_context: {
        brand_name: 'TownsHub',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${origin}/dashboard?upgraded=1`,
        cancel_url: `${origin}/pricing`,
      },
    }),
  })

  const subscription = await res.json()

  if (!res.ok) {
    return NextResponse.json({ error: subscription.message ?? 'PayPal error' }, { status: 400 })
  }

  const approvalLink = subscription.links?.find((l: { rel: string; href: string }) => l.rel === 'approve')?.href

  return NextResponse.json({ approvalUrl: approvalLink, subscriptionId: subscription.id })
}
