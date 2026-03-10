import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { Users, TrendingUp, DollarSign, Zap, Shield } from 'lucide-react'

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

export default async function AdminPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (myProfile?.role !== 'admin') redirect('/dashboard')

  // Use service role key to bypass RLS
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [usersRes, recentUsersRes, usageRes] = await Promise.all([
    adminSupabase.from('profiles').select('id, full_name, plan, generations_used, created_at, role'),
    adminSupabase.from('profiles').select('id, full_name, plan, created_at').order('created_at', { ascending: false }).limit(20),
    adminSupabase.from('usage_events').select('event_type, created_at').gte('created_at', new Date(Date.now() - 86400000).toISOString()),
  ])

  const allUsers = usersRes.data ?? []
  const recentUsers = recentUsersRes.data ?? []
  const todayEvents = usageRes.data ?? []

  const totalUsers = allUsers.length
  const activeSubs = allUsers.filter((u: { plan: string }) => u.plan !== 'free').length
  const mrr = allUsers.reduce((sum: number, u: { plan: string }) => sum + (PLAN_PRICES[u.plan] ?? 0), 0)
  const genToday = todayEvents.filter((e: { event_type: string }) => e.event_type === 'generate').length

  // Plan breakdown
  const planCounts: Record<string, number> = { free: 0, starter: 0, pro: 0, business: 0 }
  allUsers.forEach((u: { plan: string }) => { planCounts[u.plan] = (planCounts[u.plan] ?? 0) + 1 })
  const maxPlanCount = Math.max(1, ...Object.values(planCounts))

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Platform overview and user management</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: totalUsers.toLocaleString(), icon: Users, color: 'text-sky-400' },
          { label: 'Active Subscribers', value: activeSubs.toLocaleString(), icon: TrendingUp, color: 'text-green-400' },
          { label: 'Est. MRR', value: `$${mrr.toLocaleString()}`, icon: DollarSign, color: 'text-violet-400' },
          { label: 'Generations Today', value: genToday.toLocaleString(), icon: Zap, color: 'text-yellow-400' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                {stat.label}
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Plan breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Users by Plan</h2>
          <div className="space-y-4">
            {Object.entries(planCounts).map(([plan, count]) => (
              <div key={plan}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 capitalize font-medium">{plan}</span>
                  <span className="text-slate-400">{count} users</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`${PLAN_COLORS[plan]} h-2 rounded-full`}
                    style={{ width: `${Math.round((count / maxPlanCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Conversion rate</span>
              <span className="text-white font-medium">
                {totalUsers > 0 ? Math.round((activeSubs / totalUsers) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Revenue breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Revenue Breakdown</h2>
          <div className="space-y-3">
            {[
              { plan: 'starter', label: 'Starter ($44)', count: planCounts.starter },
              { plan: 'pro', label: 'Pro ($119)', count: planCounts.pro },
              { plan: 'business', label: 'Business ($299)', count: planCounts.business },
            ].map(({ plan, label, count }) => (
              <div key={plan} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${PLAN_COLORS[plan]}`} />
                  <span className="text-slate-400 text-xs">{label}</span>
                </div>
                <div className="text-right">
                  <span className="text-white text-xs font-medium">${(count * PLAN_PRICES[plan]).toLocaleString()}/mo</span>
                  <span className="text-slate-500 text-xs ml-2">({count})</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">Total MRR</span>
              <span className="text-violet-400 font-bold">${mrr.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-slate-500 text-xs">Est. ARR</span>
              <span className="text-slate-300 text-xs font-medium">${(mrr * 12).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">Platform Stats</h2>
          <div className="space-y-4">
            {[
              {
                label: 'Total Generations',
                value: allUsers.reduce((s: number, u: { generations_used: number }) => s + (u.generations_used ?? 0), 0).toLocaleString(),
              },
              {
                label: 'Avg. Generations/User',
                value: totalUsers > 0
                  ? Math.round(allUsers.reduce((s: number, u: { generations_used: number }) => s + (u.generations_used ?? 0), 0) / totalUsers).toLocaleString()
                  : '0',
              },
              {
                label: 'Admin Users',
                value: allUsers.filter((u: { role: string }) => u.role === 'admin').length.toString(),
              },
              {
                label: 'New Today',
                value: allUsers.filter((u: { created_at: string }) =>
                  u.created_at?.slice(0, 10) === new Date().toISOString().slice(0, 10)
                ).length.toString(),
              },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">{s.label}</span>
                <span className="text-white text-sm font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent signups table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Recent Signups</h2>
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
                      {new Date(u.created_at).toLocaleDateString()}
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
