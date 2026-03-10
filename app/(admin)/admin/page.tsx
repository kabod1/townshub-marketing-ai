import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { Users, TrendingUp, DollarSign, Zap, Shield, ArrowUpRight, ArrowDownRight, BarChart2, ExternalLink } from 'lucide-react'

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  starter: 44,
  pro: 119,
  business: 299,
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-slate-500',
  starter: 'bg-blue-500',
  pro: 'bg-sky-500',
  business: 'bg-violet-500',
}

function buildDayMap(days: number): Record<string, number> {
  const map: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    map[d.toISOString().slice(0, 10)] = 0
  }
  return map
}

function BarChart({ data, color = 'bg-sky-500' }: { data: number[]; color?: string }) {
  const max = Math.max(1, ...data)
  return (
    <div className="flex items-end gap-px h-16">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 ${color} rounded-sm opacity-80 hover:opacity-100 transition-opacity min-h-[2px]`}
          style={{ height: `${Math.max(2, Math.round((v / max) * 100))}%` }}
          title={String(v)}
        />
      ))}
    </div>
  )
}

function Trend({ current, previous, label }: { current: number; previous: number; label: string }) {
  if (previous === 0 && current === 0) return <span className="text-slate-500 text-xs">{label}</span>
  const pct = previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100)
  const up = pct >= 0
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? 'text-green-400' : 'text-red-400'}`}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(pct)}% {label}
    </span>
  )
}

export default async function AdminPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (myProfile?.role !== 'admin') redirect('/dashboard')

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString()
  const today = new Date().toISOString().slice(0, 10)

  const [usersRes, events30Res, recentUsersRes] = await Promise.all([
    adminSupabase.from('profiles').select('id, full_name, plan, generations_used, created_at, role'),
    adminSupabase.from('usage_events').select('event_type, created_at, user_id').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: true }),
    adminSupabase.from('profiles').select('id, full_name, plan, created_at').order('created_at', { ascending: false }).limit(10),
  ])

  const allUsers = usersRes.data ?? []
  const events30 = events30Res.data ?? []
  const recentUsers = recentUsersRes.data ?? []

  // KPIs
  const totalUsers = allUsers.length
  const activeSubs = allUsers.filter((u: { plan: string }) => u.plan !== 'free').length
  const mrr = allUsers.reduce((sum: number, u: { plan: string }) => sum + (PLAN_PRICES[u.plan] ?? 0), 0)
  const totalGenerations = allUsers.reduce((s: number, u: { generations_used: number }) => s + (u.generations_used ?? 0), 0)
  const todayEvents = events30.filter((e: { created_at: string }) => e.created_at?.slice(0, 10) === today)
  const genToday = todayEvents.filter((e: { event_type: string }) => e.event_type === 'generate').length

  // Trend: new signups last 7 vs previous 7 days
  const newLast7 = allUsers.filter((u: { created_at: string }) => u.created_at >= sevenDaysAgo).length
  const newPrev7 = allUsers.filter((u: { created_at: string }) => u.created_at >= fourteenDaysAgo && u.created_at < sevenDaysAgo).length

  // Trend: generations last 7 vs previous 7
  const gen7 = events30.filter((e: { created_at: string; event_type: string }) => e.created_at >= sevenDaysAgo && e.event_type === 'generate').length
  const genPrev7 = events30.filter((e: { created_at: string; event_type: string }) => e.created_at >= fourteenDaysAgo && e.created_at < sevenDaysAgo && e.event_type === 'generate').length

  // 30-day chart data
  const signupMap = buildDayMap(30)
  allUsers.forEach((u: { created_at: string }) => {
    const day = u.created_at?.slice(0, 10)
    if (day && signupMap[day] !== undefined) signupMap[day]++
  })
  const signupData = Object.values(signupMap)

  const genMap = buildDayMap(30)
  events30.forEach((e: { created_at: string; event_type: string }) => {
    const day = e.created_at?.slice(0, 10)
    if (day && genMap[day] !== undefined && e.event_type === 'generate') genMap[day]++
  })
  const genData = Object.values(genMap)

  // Plan breakdown
  const planCounts: Record<string, number> = { free: 0, starter: 0, pro: 0, business: 0 }
  allUsers.forEach((u: { plan: string }) => { planCounts[u.plan] = (planCounts[u.plan] ?? 0) + 1 })
  const maxPlanCount = Math.max(1, ...Object.values(planCounts))

  const arr = mrr * 12
  const arpu = activeSubs > 0 ? Math.round(mrr / activeSubs) : 0
  const conversionRate = totalUsers > 0 ? Math.round((activeSubs / totalUsers) * 100) : 0

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Overview</h1>
            <p className="text-slate-400 text-sm">Platform health at a glance</p>
          </div>
        </div>
        <div className="text-slate-500 text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Users',
            value: totalUsers.toLocaleString(),
            icon: Users,
            color: 'text-sky-400',
            trend: <Trend current={newLast7} previous={newPrev7} label="vs prev 7d" />,
          },
          {
            label: 'Active Subscribers',
            value: activeSubs.toLocaleString(),
            icon: TrendingUp,
            color: 'text-green-400',
            trend: <span className="text-slate-500 text-xs">{conversionRate}% conversion</span>,
          },
          {
            label: 'Monthly MRR',
            value: `$${mrr.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-violet-400',
            trend: <span className="text-slate-500 text-xs">ARR ${arr.toLocaleString()}</span>,
          },
          {
            label: 'Generations Today',
            value: genToday.toLocaleString(),
            icon: Zap,
            color: 'text-yellow-400',
            trend: <Trend current={gen7} previous={genPrev7} label="vs prev 7d" />,
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                {stat.label}
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              {stat.trend}
            </div>
          )
        })}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Est. ARR', value: `$${arr.toLocaleString()}`, sub: 'annualised' },
          { label: 'ARPU (paying)', value: `$${arpu}`, sub: 'per subscriber/mo' },
          { label: 'New (7d)', value: newLast7.toLocaleString(), sub: 'signups this week' },
          { label: 'All-time Gens', value: totalGenerations.toLocaleString(), sub: 'across all users' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-slate-500 text-xs mb-1">{s.label}</p>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-slate-600 text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* 30-day charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">New Signups — 30 days</h2>
            <span className="text-slate-500 text-xs">{newLast7} this week</span>
          </div>
          <BarChart data={signupData} color="bg-sky-500" />
          <div className="flex justify-between mt-2">
            <span className="text-slate-600 text-xs">30d ago</span>
            <span className="text-slate-600 text-xs">Today</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Generations — 30 days</h2>
            <span className="text-slate-500 text-xs">{gen7} this week</span>
          </div>
          <BarChart data={genData} color="bg-violet-500" />
          <div className="flex justify-between mt-2">
            <span className="text-slate-600 text-xs">30d ago</span>
            <span className="text-slate-600 text-xs">Today</span>
          </div>
        </div>
      </div>

      {/* Plan breakdown + Revenue + Platform stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Users by Plan */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Users by Plan</h2>
          <div className="space-y-4">
            {Object.entries(planCounts).map(([plan, count]) => (
              <div key={plan}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 capitalize font-medium">{plan}</span>
                  <span className="text-slate-400">{count} users ({totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`${PLAN_COLORS[plan]} h-2 rounded-full transition-all`}
                    style={{ width: `${Math.round((count / maxPlanCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Free → Paid conversion</span>
              <span className="text-white font-medium">{conversionRate}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Paid users</span>
              <span className="text-white font-medium">{activeSubs}</span>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Revenue Breakdown</h2>
          <div className="space-y-3">
            {[
              { plan: 'starter', label: 'Starter ($44/mo)', count: planCounts.starter },
              { plan: 'pro', label: 'Pro ($119/mo)', count: planCounts.pro },
              { plan: 'business', label: 'Business ($299/mo)', count: planCounts.business },
            ].map(({ plan, label, count }) => {
              const planMrr = count * PLAN_PRICES[plan]
              const pct = mrr > 0 ? Math.round((planMrr / mrr) * 100) : 0
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${PLAN_COLORS[plan]}`} />
                      <span className="text-slate-400 text-xs">{label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white text-xs font-medium">${planMrr.toLocaleString()}</span>
                      <span className="text-slate-500 text-xs ml-1">({count})</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div className={`${PLAN_COLORS[plan]} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-5 pt-5 border-t border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">Total MRR</span>
              <span className="text-violet-400 font-bold">${mrr.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">Est. ARR</span>
              <span className="text-slate-300 text-xs font-medium">${arr.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">ARPU (paying)</span>
              <span className="text-slate-300 text-xs font-medium">${arpu}/mo</span>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Platform Stats</h2>
          <div className="space-y-4">
            {[
              { label: 'Total Generations (all-time)', value: totalGenerations.toLocaleString() },
              { label: 'Avg. Generations / User', value: totalUsers > 0 ? Math.round(totalGenerations / totalUsers).toLocaleString() : '0' },
              { label: 'Avg. Generations / Subscriber', value: activeSubs > 0 ? Math.round(totalGenerations / activeSubs).toLocaleString() : '0' },
              { label: 'New Signups (7d)', value: newLast7.toString() },
              { label: 'Generations (7d)', value: gen7.toLocaleString() },
              { label: 'Admin Users', value: allUsers.filter((u: { role: string }) => u.role === 'admin').length.toString() },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">{s.label}</span>
                <span className="text-white text-sm font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Google Analytics Panel */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Web Analytics (Google Analytics 4)</h2>
              <p className="text-slate-500 text-xs">Page views, sessions, and traffic sources</p>
            </div>
          </div>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 text-xs font-medium rounded-xl transition-colors"
          >
            Open GA4 Dashboard <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {process.env.NEXT_PUBLIC_GA_ID ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Measurement ID', value: process.env.NEXT_PUBLIC_GA_ID, sub: 'Tracking active ✓' },
              { label: 'View Full Report', value: 'GA4 →', sub: 'Sessions, bounce rate, sources' },
              { label: 'Real-time', value: 'Live', sub: 'See active users now' },
              { label: 'Conversions', value: 'Goals', sub: 'Set up in GA4 dashboard' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3">
                <p className="text-slate-500 text-xs mb-1">{s.label}</p>
                <p className="text-white font-semibold text-sm">{s.value}</p>
                <p className="text-slate-600 text-xs mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
            <p className="text-orange-300 text-sm font-medium mb-1">GA4 not configured</p>
            <p className="text-slate-400 text-xs mb-3">
              Add your Google Analytics 4 Measurement ID to start tracking page views and traffic.
            </p>
            <ol className="text-slate-400 text-xs space-y-1.5 list-decimal list-inside">
              <li>Go to <span className="text-orange-400">analytics.google.com</span> → create a GA4 property for TownsHub</li>
              <li>Copy your <strong className="text-white">Measurement ID</strong> (format: <code className="bg-white/10 px-1 rounded">G-XXXXXXXXXX</code>)</li>
              <li>Add to Vercel: <strong className="text-white">NEXT_PUBLIC_GA_ID = G-XXXXXXXXXX</strong></li>
              <li>Add to your <code className="bg-white/10 px-1 rounded">.env.local</code> file for local dev</li>
            </ol>
          </div>
        )}
      </div>

      {/* Recent Signups */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Signups</h2>
          <a href="/admin/users" className="text-xs text-sky-400 hover:text-sky-300 transition-colors">View all →</a>
        </div>
        {recentUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No users yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-white/10">
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-6 py-3 font-medium">Plan</th>
                  <th className="text-right px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentUsers.map((u: { id: string; full_name: string; plan: string; created_at: string }) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(u.full_name || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{u.full_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        u.plan === 'business' ? 'bg-violet-500/20 text-violet-400' :
                        u.plan === 'pro' ? 'bg-sky-500/20 text-sky-400' :
                        u.plan === 'starter' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs text-right">
                      {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
