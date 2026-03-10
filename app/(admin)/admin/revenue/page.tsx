import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react'

const PLANS = {
  starter: { name: 'Starter', price: 44, yearlyPrice: 28, color: 'bg-blue-500', textColor: 'text-blue-400', border: 'border-blue-500/30' },
  pro: { name: 'Pro', price: 119, yearlyPrice: 75, color: 'bg-sky-500', textColor: 'text-sky-400', border: 'border-sky-500/30' },
  business: { name: 'Business', price: 299, yearlyPrice: 188, color: 'bg-violet-500', textColor: 'text-violet-400', border: 'border-violet-500/30' },
}

// Simple LTV assumptions
const CHURN_RATE = 0.05 // 5% monthly estimated

function formatCurrency(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
  return `$${n}`
}

function ARRProjection({ mrr }: { mrr: number }) {
  const scenarios = [
    { label: '0% growth', value: mrr * 12, color: 'text-slate-400' },
    { label: '5% MoM', value: mrr * ((Math.pow(1.05, 12) - 1) / 0.05), color: 'text-sky-400' },
    { label: '10% MoM', value: mrr * ((Math.pow(1.10, 12) - 1) / 0.10), color: 'text-green-400' },
    { label: '20% MoM', value: mrr * ((Math.pow(1.20, 12) - 1) / 0.20), color: 'text-yellow-400' },
  ]
  const max = Math.max(1, ...scenarios.map((s) => s.value))
  return (
    <div className="space-y-4">
      {scenarios.map((s) => (
        <div key={s.label}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">{s.label}</span>
            <span className={`font-semibold ${s.color}`}>{formatCurrency(Math.round(s.value))}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className={`${s.color.replace('text-', 'bg-')} h-2 rounded-full`}
              style={{ width: `${Math.round((s.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function AdminRevenuePage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (myProfile?.role !== 'admin') redirect('/dashboard')

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profiles } = await adminSupabase
    .from('profiles')
    .select('id, full_name, plan, created_at, stripe_customer_id')

  const allUsers = profiles ?? []

  // Plan breakdown
  const planCounts: Record<string, number> = { free: 0, starter: 0, pro: 0, business: 0 }
  allUsers.forEach((u: { plan: string }) => { planCounts[u.plan] = (planCounts[u.plan] ?? 0) + 1 })

  const totalUsers = allUsers.length
  const activeSubs = allUsers.filter((u: { plan: string }) => u.plan !== 'free').length
  const mrr = (planCounts.starter * 44) + (planCounts.pro * 119) + (planCounts.business * 299)
  const arr = mrr * 12
  const arpu = activeSubs > 0 ? Math.round(mrr / activeSubs) : 0
  const arpuAll = totalUsers > 0 ? Math.round(mrr / totalUsers) : 0
  const ltv = CHURN_RATE > 0 ? Math.round(arpu / CHURN_RATE) : 0
  const conversionRate = totalUsers > 0 ? ((activeSubs / totalUsers) * 100).toFixed(1) : '0'

  // Stripe connected count
  const stripeConnected = allUsers.filter((u: { stripe_customer_id: string | null }) => u.stripe_customer_id).length

  // Revenue by plan details
  const planRevenue = Object.entries(PLANS).map(([key, plan]) => {
    const count = planCounts[key] ?? 0
    const planMrr = count * plan.price
    const pct = mrr > 0 ? Math.round((planMrr / mrr) * 100) : 0
    return { key, ...plan, count, planMrr, pct }
  })

  // Business plan users (highest value)
  const businessUsers = allUsers
    .filter((u: { plan: string }) => u.plan === 'business')
    .slice(0, 10)

  // Cohort: monthly signup & revenue contribution
  const now = new Date()
  const cohorts = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const nextD = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1)
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const cohortUsers = allUsers.filter((u: { created_at: string; plan: string }) => {
      const created = new Date(u.created_at)
      return created >= d && created < nextD
    })
    const cohortMrr = cohortUsers.reduce((s: number, u: { plan: string }) => {
      const priceMap: Record<string, number> = { free: 0, starter: 44, pro: 119, business: 299 }
      const price = (k: string) => priceMap[k] ?? 0
      return s + price(u.plan)
    }, 0)
    return { label, total: cohortUsers.length, paid: cohortUsers.filter((u: { plan: string }) => u.plan !== 'free').length, mrr: cohortMrr }
  })
  const maxCohortTotal = Math.max(1, ...cohorts.map((c) => c.total))

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue</h1>
          <p className="text-slate-400 text-sm">MRR, ARR, and subscriber analytics</p>
        </div>
      </div>

      {/* Primary Revenue KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Monthly MRR', value: `$${mrr.toLocaleString()}`, sub: 'recurring revenue', icon: DollarSign, color: 'text-violet-400' },
          { label: 'Annual ARR', value: formatCurrency(arr), sub: 'annualised run rate', icon: TrendingUp, color: 'text-green-400' },
          { label: 'Subscribers', value: activeSubs.toLocaleString(), sub: `${conversionRate}% conversion`, icon: Users, color: 'text-sky-400' },
          { label: 'ARPU (paying)', value: `$${arpu}/mo`, sub: 'avg rev per subscriber', icon: Target, color: 'text-yellow-400' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                {s.label}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
              <p className="text-slate-500 text-xs">{s.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'ARPU (all users)', value: `$${arpuAll}/mo`, sub: 'incl. free tier' },
          { label: 'Est. LTV', value: `$${ltv.toLocaleString()}`, sub: `@${Math.round(CHURN_RATE * 100)}% est. churn` },
          { label: 'Stripe Connected', value: stripeConnected.toLocaleString(), sub: `of ${activeSubs} subscribers` },
          { label: 'Free Users', value: (planCounts.free ?? 0).toLocaleString(), sub: 'no revenue generated' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-slate-500 text-xs mb-1">{s.label}</p>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-slate-600 text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Plan */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-6">Revenue by Plan</h2>
          <div className="space-y-6">
            {planRevenue.map((p) => (
              <div key={p.key} className={`rounded-xl border ${p.border} p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                    <span className={`font-semibold text-sm ${p.textColor}`}>{p.name}</span>
                  </div>
                  <span className="text-white font-bold">${p.planMrr.toLocaleString()}<span className="text-slate-500 font-normal text-xs">/mo</span></span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-slate-500 mb-0.5">Subscribers</p>
                    <p className="text-white font-semibold">{p.count}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Unit price</p>
                    <p className="text-white font-semibold">${p.price}/mo</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">% of MRR</p>
                    <p className="text-white font-semibold">{p.pct}%</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-white/10 rounded-full h-1.5">
                  <div className={`${p.color} h-1.5 rounded-full`} style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ARR Projections */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-2">12-Month ARR Projections</h2>
          <p className="text-slate-500 text-xs mb-6">Based on current MRR of ${mrr.toLocaleString()}/mo</p>
          <ARRProjection mrr={mrr} />

          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">Revenue Summary</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Current MRR', value: `$${mrr.toLocaleString()}` },
                { label: 'Current ARR', value: `$${arr.toLocaleString()}` },
                { label: 'Est. LTV (avg subscriber)', value: `$${ltv.toLocaleString()}` },
                { label: 'Break-even per subscriber (est.)', value: `~3 months` },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{s.label}</span>
                  <span className="text-white font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Cohorts */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-white mb-6">Monthly Signup Cohorts (last 6 months)</h2>
        <div className="grid grid-cols-6 gap-3">
          {cohorts.map((c) => (
            <div key={c.label} className="text-center">
              <div className="bg-white/5 rounded-xl p-3 mb-2">
                <div className="text-white font-bold text-lg">{c.total}</div>
                <div className="text-slate-500 text-xs">signups</div>
                <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${Math.round((c.total / maxCohortTotal) * 100)}%` }} />
                </div>
              </div>
              <div className="text-sky-400 text-xs font-medium">{c.paid} paid</div>
              {c.mrr > 0 && <div className="text-green-400 text-xs">${c.mrr}/mo</div>}
              <div className="text-slate-500 text-xs mt-1">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Revenue Users */}
      {businessUsers.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Business Plan Subscribers</h2>
            <p className="text-slate-500 text-xs mt-0.5">Highest value accounts — $299/mo each</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-white/10">
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-right px-6 py-3 font-medium">MRR Contribution</th>
                <th className="text-right px-6 py-3 font-medium">Est. Annual Value</th>
                <th className="text-right px-6 py-3 font-medium">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {businessUsers.map((u: { id: string; full_name: string | null; created_at: string }) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(u.full_name || '?')[0].toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{u.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className="text-violet-400 font-semibold text-sm">$299/mo</span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className="text-green-400 text-sm font-medium">$3,588</span>
                  </td>
                  <td className="px-6 py-3 text-right text-slate-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
