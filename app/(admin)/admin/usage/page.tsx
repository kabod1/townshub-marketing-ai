import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { Activity, Zap, TrendingUp, Users, BarChart3 } from 'lucide-react'

function buildDayMap(days: number): Record<string, number> {
  const map: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    map[d.toISOString().slice(0, 10)] = 0
  }
  return map
}

function BarChart({
  data,
  labels,
  color = 'bg-violet-500',
  showEvery = 5,
}: {
  data: number[]
  labels: string[]
  color?: string
  showEvery?: number
}) {
  const max = Math.max(1, ...data)
  return (
    <div>
      <div className="flex items-end gap-px h-24">
        {data.map((v, i) => (
          <div
            key={i}
            className={`flex-1 ${color} rounded-sm opacity-75 hover:opacity-100 transition-opacity min-h-[2px]`}
            style={{ height: `${Math.max(2, Math.round((v / max) * 100))}%` }}
            title={`${labels[i]}: ${v}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        {labels.map((l, i) => (
          <span
            key={i}
            className={`text-slate-600 text-[9px] ${i % showEvery !== 0 ? 'invisible' : ''}`}
          >
            {l.slice(5)} {/* MM-DD */}
          </span>
        ))}
      </div>
    </div>
  )
}

type UsageEvent = { user_id: string; event_type: string; created_at: string; metadata?: Record<string, unknown> | null }
type Profile = { id: string; full_name: string | null; plan: string; generations_used: number }

export default async function AdminUsagePage() {
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
  const today = new Date().toISOString().slice(0, 10)
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [eventsRes, profilesRes, historyRes] = await Promise.all([
    adminSupabase
      .from('usage_events')
      .select('user_id, event_type, created_at, metadata')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true }),
    adminSupabase
      .from('profiles')
      .select('id, full_name, plan, generations_used')
      .order('generations_used', { ascending: false }),
    adminSupabase
      .from('content_history')
      .select('user_id, topic, created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const events30: UsageEvent[] = eventsRes.data ?? []
  const profiles: Profile[] = profilesRes.data ?? []
  const recentHistory = historyRes.data ?? []

  // KPIs
  const allTimeGenerations = profiles.reduce((s, p) => s + (p.generations_used ?? 0), 0)
  const genToday = events30.filter((e) => e.created_at?.slice(0, 10) === today && e.event_type === 'generate').length
  const gen7d = events30.filter((e) => e.created_at >= sevenDaysAgo && e.event_type === 'generate').length
  const genThisMonth = events30.filter((e) => e.created_at >= thisMonthStart && e.event_type === 'generate').length
  const activeUsersThisMonth = new Set(events30.filter((e) => e.created_at >= thisMonthStart).map((e) => e.user_id)).size
  const totalUsers = profiles.length
  const usersWithActivity = profiles.filter((p) => p.generations_used > 0).length
  const activationRate = totalUsers > 0 ? Math.round((usersWithActivity / totalUsers) * 100) : 0

  // 30-day daily generations chart
  const genMap = buildDayMap(30)
  events30.forEach((e) => {
    const day = e.created_at?.slice(0, 10)
    if (day && genMap[day] !== undefined && e.event_type === 'generate') genMap[day]++
  })
  const genLabels = Object.keys(genMap)
  const genData = Object.values(genMap)

  // Event type breakdown
  const eventTypes: Record<string, number> = {}
  events30.forEach((e) => {
    eventTypes[e.event_type] = (eventTypes[e.event_type] ?? 0) + 1
  })
  const totalEvents = Object.values(eventTypes).reduce((s, v) => s + v, 0)

  // Top 10 power users
  const topUsers = profiles.slice(0, 10)

  // Usage by plan
  const usageByPlan: Record<string, { count: number; totalGens: number }> = {}
  profiles.forEach((p) => {
    if (!usageByPlan[p.plan]) usageByPlan[p.plan] = { count: 0, totalGens: 0 }
    usageByPlan[p.plan].count++
    usageByPlan[p.plan].totalGens += p.generations_used ?? 0
  })

  // Daily active users (unique users per day last 7 days)
  const dauMap = buildDayMap(7)
  const dauSets: Record<string, Set<string>> = {}
  Object.keys(dauMap).forEach((d) => { dauSets[d] = new Set() })
  events30.forEach((e) => {
    const day = e.created_at?.slice(0, 10)
    if (day && dauSets[day]) dauSets[day].add(e.user_id)
  })
  const dauData = Object.entries(dauSets).map(([day, set]) => ({ day, count: set.size }))

  const EVENT_TYPE_LABELS: Record<string, string> = {
    generate: 'Content Generation',
    distribute: 'Distribution',
    podcast: 'Podcast',
    pr: 'Press Release',
  }
  const EVENT_COLORS: Record<string, string> = {
    generate: 'bg-violet-500',
    distribute: 'bg-sky-500',
    podcast: 'bg-green-500',
    pr: 'bg-yellow-500',
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Usage</h1>
          <p className="text-slate-400 text-sm">Generation activity and feature engagement</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'All-Time Generations', value: allTimeGenerations.toLocaleString(), icon: Zap, color: 'text-yellow-400' },
          { label: 'Generations Today', value: genToday.toLocaleString(), icon: TrendingUp, color: 'text-sky-400' },
          { label: 'Generations This Month', value: genThisMonth.toLocaleString(), icon: BarChart3, color: 'text-violet-400' },
          { label: 'Active Users (30d)', value: activeUsersThisMonth.toLocaleString(), icon: Users, color: 'text-green-400' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                {s.label}
              </div>
              <div className="text-3xl font-bold text-white">{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Generations (7d)', value: gen7d.toLocaleString(), sub: 'last 7 days' },
          { label: 'Activation Rate', value: `${activationRate}%`, sub: 'users with ≥1 generation' },
          { label: 'Avg. Gens/Active User', value: usersWithActivity > 0 ? Math.round(allTimeGenerations / usersWithActivity).toLocaleString() : '0', sub: 'all time' },
          { label: 'Total Events (30d)', value: totalEvents.toLocaleString(), sub: 'all event types' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-slate-500 text-xs mb-1">{s.label}</p>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-slate-600 text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* 30-day generation chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Daily Generations — last 30 days</h2>
          <span className="text-slate-500 text-xs">Hover bars for count</span>
        </div>
        <BarChart data={genData} labels={genLabels} color="bg-violet-500" showEvery={5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Event Type Breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Feature Usage (30d)</h2>
          {totalEvents === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No events tracked</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(eventTypes)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => {
                  const pct = Math.round((count / totalEvents) * 100)
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-300">{EVENT_TYPE_LABELS[type] ?? type}</span>
                        <span className="text-slate-400">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={`${EVENT_COLORS[type] ?? 'bg-slate-500'} h-2 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* DAU Last 7 days */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Daily Active Users (7d)</h2>
          <div className="space-y-3">
            {dauData.map(({ day, count }) => (
              <div key={day}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">{new Date(day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="bg-sky-500 h-1.5 rounded-full"
                    style={{ width: `${count > 0 ? Math.max(4, Math.round((count / Math.max(1, ...dauData.map((d) => d.count))) * 100)) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage by Plan */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Generations by Plan</h2>
          <div className="space-y-4">
            {['free', 'starter', 'pro', 'business'].map((plan) => {
              const d = usageByPlan[plan] ?? { count: 0, totalGens: 0 }
              const avg = d.count > 0 ? Math.round(d.totalGens / d.count) : 0
              const maxGens = Math.max(1, ...Object.values(usageByPlan).map((v) => v.totalGens))
              const COLORS: Record<string, string> = { free: 'bg-slate-500', starter: 'bg-blue-500', pro: 'bg-sky-500', business: 'bg-violet-500' }
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 capitalize font-medium">{plan}</span>
                    <span className="text-slate-400">{d.totalGens.toLocaleString()} total · {avg} avg</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`${COLORS[plan]} h-2 rounded-full`}
                      style={{ width: `${Math.round((d.totalGens / maxGens) * 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top Power Users */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Top 10 Power Users</h2>
          <p className="text-slate-500 text-xs mt-0.5">Ranked by all-time generations</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-xs border-b border-white/10">
              <th className="text-left px-6 py-3 font-medium">Rank</th>
              <th className="text-left px-6 py-3 font-medium">User</th>
              <th className="text-left px-6 py-3 font-medium">Plan</th>
              <th className="text-right px-6 py-3 font-medium">Generations</th>
              <th className="text-right px-6 py-3 font-medium">Usage Bar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {topUsers.map((u, idx) => {
              const maxGens = topUsers[0]?.generations_used ?? 1
              const pct = Math.round((u.generations_used / Math.max(1, maxGens)) * 100)
              const PLAN_BADGE: Record<string, string> = {
                free: 'bg-slate-500/20 text-slate-400',
                starter: 'bg-blue-500/20 text-blue-400',
                pro: 'bg-sky-500/20 text-sky-400',
                business: 'bg-violet-500/20 text-violet-400',
              }
              return (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3">
                    <span className={`text-sm font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-400' : 'text-slate-500'}`}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(u.full_name || '?')[0].toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{u.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PLAN_BADGE[u.plan] ?? PLAN_BADGE.free}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className="text-white font-semibold">{u.generations_used.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 bg-white/10 rounded-full h-2">
                        <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Recent Content Activity (30d)</h2>
          <p className="text-slate-500 text-xs mt-0.5">Latest topics generated across all users</p>
        </div>
        {recentHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No content history yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs border-b border-white/10">
                <th className="text-left px-6 py-3 font-medium">Topic</th>
                <th className="text-right px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentHistory.map((h: { user_id: string; topic: string; created_at: string }, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                      <span className="text-white text-sm truncate max-w-[400px]">{h.topic || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-xs text-right whitespace-nowrap">
                    {new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
