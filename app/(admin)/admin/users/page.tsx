import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { Users, Search, Crown, Zap } from 'lucide-react'

const PLAN_PRICES: Record<string, number> = { free: 0, starter: 44, pro: 119, business: 299 }

const PLAN_BADGE: Record<string, string> = {
  free: 'bg-slate-500/20 text-slate-400',
  starter: 'bg-blue-500/20 text-blue-400',
  pro: 'bg-sky-500/20 text-sky-400',
  business: 'bg-violet-500/20 text-violet-400',
}

type Profile = {
  id: string
  full_name: string | null
  plan: string
  generations_used: number
  generations_limit: number
  created_at: string
  role: string
  email?: string | null
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { plan?: string; page?: string }
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (myProfile?.role !== 'admin') redirect('/dashboard')

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const planFilter = searchParams.plan || 'all'
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const pageSize = 50

  // Fetch profiles
  let query = adminSupabase
    .from('profiles')
    .select('id, full_name, plan, generations_used, generations_limit, created_at, role', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (planFilter !== 'all') query = query.eq('plan', planFilter)

  const { data: profiles, count } = await query

  // Fetch auth users for emails (batch by IDs)
  let emailMap: Record<string, string> = {}
  try {
    const { data: authUsers } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 })
    if (authUsers?.users) {
      authUsers.users.forEach((u: { id: string; email?: string }) => {
        if (u.email) emailMap[u.id] = u.email
      })
    }
  } catch (_) {}

  const users: Profile[] = (profiles ?? []).map((p) => ({
    ...p,
    email: emailMap[p.id] ?? null,
  }))

  // Plan counts for filter tabs
  const { data: allProfiles } = await adminSupabase
    .from('profiles')
    .select('plan')

  const planCounts: Record<string, number> = { all: 0, free: 0, starter: 0, pro: 0, business: 0 }
  ;(allProfiles ?? []).forEach((p: { plan: string }) => {
    planCounts.all = (planCounts.all ?? 0) + 1
    planCounts[p.plan] = (planCounts[p.plan] ?? 0) + 1
  })

  const totalPages = Math.ceil((count ?? 0) / pageSize)
  const activeSubs = planCounts.all - (planCounts.free ?? 0)
  const mrr = (allProfiles ?? []).reduce((s: number, p: { plan: string }) => s + (PLAN_PRICES[p.plan] ?? 0), 0)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center">
          <Users className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm">All registered accounts</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: planCounts.all.toLocaleString() },
          { label: 'Paying Subscribers', value: activeSubs.toLocaleString() },
          { label: 'Free Users', value: (planCounts.free ?? 0).toLocaleString() },
          { label: 'Est. MRR', value: `$${mrr.toLocaleString()}` },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-slate-500 text-xs mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Plan filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'free', label: 'Free' },
          { key: 'starter', label: 'Starter' },
          { key: 'pro', label: 'Pro' },
          { key: 'business', label: 'Business' },
        ].map((tab) => (
          <a
            key={tab.key}
            href={`/admin/users?plan=${tab.key}`}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              planFilter === tab.key
                ? 'bg-white/15 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-slate-500">({planCounts[tab.key] ?? 0})</span>
          </a>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            {planFilter === 'all' ? 'All Users' : `${planFilter.charAt(0).toUpperCase() + planFilter.slice(1)} Plan`}
            <span className="ml-2 text-slate-500 font-normal text-xs">({count ?? 0} total)</span>
          </h2>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Search className="w-3 h-3" />
            <span>Page {page} of {Math.max(1, totalPages)}</span>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-white/10">
                  <th className="text-left px-6 py-3 font-medium">User</th>
                  <th className="text-left px-6 py-3 font-medium">Email</th>
                  <th className="text-left px-6 py-3 font-medium">Plan</th>
                  <th className="text-right px-6 py-3 font-medium">Usage</th>
                  <th className="text-right px-6 py-3 font-medium">MRR</th>
                  <th className="text-right px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => {
                  const usagePct = u.generations_limit > 0 && u.generations_limit < 99999
                    ? Math.min(100, Math.round((u.generations_used / u.generations_limit) * 100))
                    : null
                  const isHighUsage = usagePct !== null && usagePct >= 80
                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                            u.plan === 'business' ? 'bg-gradient-to-br from-violet-400 to-purple-600' :
                            u.plan === 'pro' ? 'bg-gradient-to-br from-sky-400 to-cyan-600' :
                            u.plan === 'starter' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                            'bg-gradient-to-br from-slate-500 to-slate-700'
                          }`}>
                            {(u.full_name || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-white font-medium text-sm">{u.full_name || 'Unknown'}</span>
                              {u.role === 'admin' && <Crown className="w-3 h-3 text-yellow-400" />}
                            </div>
                            <span className="text-slate-600 text-xs font-mono">{u.id.slice(0, 8)}…</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-slate-400 text-xs">{u.email ?? '—'}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PLAN_BADGE[u.plan] ?? PLAN_BADGE.free}`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            {isHighUsage && <Zap className="w-3 h-3 text-yellow-400" />}
                            <span className={`text-xs font-medium ${isHighUsage ? 'text-yellow-400' : 'text-white'}`}>
                              {u.generations_used.toLocaleString()}
                              {u.generations_limit < 99999 && (
                                <span className="text-slate-500 font-normal"> / {u.generations_limit}</span>
                              )}
                            </span>
                          </div>
                          {usagePct !== null && (
                            <div className="w-16 bg-white/10 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full ${isHighUsage ? 'bg-yellow-500' : 'bg-sky-500'}`}
                                style={{ width: `${usagePct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className={`text-xs font-medium ${PLAN_PRICES[u.plan] > 0 ? 'text-green-400' : 'text-slate-600'}`}>
                          {PLAN_PRICES[u.plan] > 0 ? `$${PLAN_PRICES[u.plan]}/mo` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs text-right whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-slate-500 text-xs">
              Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, count ?? 0)} of {count ?? 0}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <a href={`/admin/users?plan=${planFilter}&page=${page - 1}`} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs rounded-lg transition-colors">
                  ← Prev
                </a>
              )}
              {page < totalPages && (
                <a href={`/admin/users?plan=${planFilter}&page=${page + 1}`} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs rounded-lg transition-colors">
                  Next →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
