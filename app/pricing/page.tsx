'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, Star, Rocket, Building2, ArrowRight, Loader2 } from 'lucide-react'

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    monthlyPrice: 44,
    yearlyMonthly: 28,   // per month when billed yearly
    yearlyTotal: 336,    // billed annually
    icon: Star,
    color: 'from-slate-400 to-slate-500',
    border: 'border-white/10',
    badge: null,
    description: 'Perfect for individuals and small businesses getting started.',
    generations: 50,
    formats: 8,
    features: [
      '50 content generations/month',
      '8 content formats',
      'Article & Blog posts',
      'Social media posts (4 platforms)',
      'Basic analytics dashboard',
      'Email support',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    monthlyPrice: 119,
    yearlyMonthly: 75,
    yearlyTotal: 900,
    icon: Rocket,
    color: 'from-sky-400 to-cyan-500',
    border: 'border-sky-500/50',
    badge: 'Most Popular',
    description: 'For growing businesses that need more content at scale.',
    generations: 200,
    formats: 16,
    features: [
      '200 content generations/month',
      'All 16 content formats',
      'Podcast scripts & Video scripts',
      'Press releases',
      'Newsletter campaigns',
      'Advanced analytics',
      'Priority support',
    ],
  },
  {
    key: 'business',
    name: 'Business',
    monthlyPrice: 299,
    yearlyMonthly: 188,
    yearlyTotal: 2256,
    icon: Building2,
    color: 'from-violet-400 to-purple-500',
    border: 'border-violet-500/50',
    badge: 'Best Value',
    description: 'Unlimited content for enterprises and agencies.',
    generations: -1,
    formats: 16,
    features: [
      'Unlimited content generations',
      'All 16 content formats',
      'API access',
      'White-label reports',
      'Custom brand voice training',
      'Dedicated account manager',
      'SLA support',
    ],
  },
]

const YEARLY_SAVINGS_PCT = 37

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')

  async function handleGetStarted(planKey: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/register?plan=${planKey}&billing=${billing}`)
      return
    }

    setLoading(planKey)

    if (paymentMethod === 'stripe') {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, interval: billing === 'yearly' ? 'year' : 'month' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setLoading(null)
    } else {
      const res = await fetch('/api/payments/create-paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (data.approvalUrl) window.location.href = data.approvalUrl
      else setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="TownsHub" className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Sign In</Link>
          <Link href="/register" className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:from-sky-600 hover:to-cyan-600 transition-all">
            Get Started Free
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Generate content that gets your business seen everywhere. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium transition-colors ${billing === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none ${billing === 'yearly' ? 'bg-sky-500' : 'bg-white/20'}`}
              aria-label="Toggle billing period"
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${billing === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${billing === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
              Annual
            </span>
            {billing === 'yearly' && (
              <span className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Save up to {YEARLY_SAVINGS_PCT}%
              </span>
            )}
          </div>
        </div>

        {/* Payment method toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 inline-flex gap-1">
            <button
              onClick={() => setPaymentMethod('stripe')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${paymentMethod === 'stripe' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Pay with Card
            </button>
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${paymentMethod === 'paypal' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Pay with PayPal
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const displayPrice = billing === 'yearly' ? plan.yearlyMonthly : plan.monthlyPrice
            const savings = Math.round(((plan.monthlyPrice - plan.yearlyMonthly) / plan.monthlyPrice) * 100)

            return (
              <div
                key={plan.key}
                className={`relative bg-white/5 backdrop-blur-xl border ${plan.border} rounded-2xl p-8 flex flex-col ${plan.badge === 'Most Popular' ? 'ring-2 ring-sky-500/50 scale-105' : ''}`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r ${plan.color} text-white text-xs font-bold px-4 py-1 rounded-full`}>
                    {plan.badge}
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                <div className="mb-2">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">${displayPrice}</span>
                    <span className="text-slate-400 text-sm mb-1">/month</span>
                    {billing === 'yearly' && (
                      <span className="mb-1 text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-full px-2 py-0.5">
                        -{savings}%
                      </span>
                    )}
                  </div>
                  {billing === 'yearly' ? (
                    <p className="text-slate-500 text-xs mt-1">
                      Billed ${plan.yearlyTotal.toLocaleString()}/yr &nbsp;·&nbsp;
                      <span className="line-through text-slate-600">${plan.monthlyPrice}/mo</span>
                    </p>
                  ) : (
                    <p className="text-slate-500 text-xs mt-1">
                      Or{' '}
                      <button
                        onClick={() => setBilling('yearly')}
                        className="text-sky-400 hover:text-sky-300 font-medium underline-offset-2 hover:underline"
                      >
                        ${plan.yearlyMonthly}/mo billed annually
                      </button>
                      {' '}— save {YEARLY_SAVINGS_PCT}%
                    </p>
                  )}
                </div>

                <div className="text-xs text-slate-500 mt-4 mb-6 pb-6 border-b border-white/10">
                  {plan.generations === -1 ? 'Unlimited generations' : `${plan.generations} content generations/mo`} · {plan.formats} formats
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleGetStarted(plan.key)}
                  disabled={loading === plan.key}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 ${
                    plan.badge === 'Most Popular'
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-600 hover:to-cyan-600'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {loading === plan.key ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Get Started <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Free plan note */}
        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm">
            Not ready to commit?{' '}
            <Link href="/" className="text-sky-400 hover:text-sky-300">
              Try the free plan — 5 generations included.
            </Link>
          </p>
        </div>

        {/* Trust section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { title: 'No contracts', desc: 'Cancel or change plans anytime. No questions asked.' },
            { title: 'Secure payments', desc: 'Powered by Stripe and PayPal — industry-leading security.' },
            { title: '14-day guarantee', desc: 'Not satisfied? Get a full refund within 14 days.' },
          ].map((item) => (
            <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-2">{item.title}</h4>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
