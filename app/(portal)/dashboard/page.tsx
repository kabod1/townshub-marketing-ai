import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Zap, TrendingUp, FileText, Share2, ArrowUpRight, Rocket, CheckCircle } from 'lucide-react'

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    free: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    starter: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pro: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    business: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${colors[plan] ?? colors.free}`}>
      {plan}
    </span>
  )
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [profileRes, historyRes, subRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('content_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
  ])

  const profile = profileRes.data
  const history = historyRes.data ?? []
  const subscription = subRes.data

  const used = profile?.generations_used ?? 0
  const limit = profile?.generations_limit ?? 5
  const plan = profile?.plan ?? 'free'
  const usagePct = limit >= 99999 ? 100 : Math.min(100, Math.round((used / limit) * 100))

  // Build a simple 14-day usage array from content_history
  const now = new Date()
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (13 - i))
    return d.toISOString().slice(0, 10)
  })

  const countsByDay: Record<string, number> = {}
  history.forEach((h: { created_at: string }) => {
    const day = h.created_at.slice(0, 10)
    countsByDay[day] = (countsByDay[day] ?? 0) + 1
  })

  const maxCount = Math.max(1, ...days.map(d => countsByDay[d] ?? 0))

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Track your content generation activity</p>
        </div>
        <div className="flex items-center gap-3">
          <PlanBadge plan={plan} />
          <Link
            href="/"
            className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:from-sky-600 hover:to-cyan-600 transition-all"
          >
            <Zap className="w-4 h-4" /> Generate Content
          </Link>
        </div>
      </div>

      {/* Upgrade banner */}
      {subscription?.status !== 'active' && plan === 'free' && used >= limit - 1 && (
        <div className="bg-gradient-to-r from-sky-500/20 to-cyan-500/20 border border-sky-500/30 rounded-2xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="w-5 h-5 text-sky-400 flex-shrink-0" />
            <div>
              <p className="text-white text-sm font-semibold">Running low on generations</p>
              <p className="text-slate-400 text-xs">Upgrade to Starter for 50 generations/month starting at $29.</p>
            </div>
          </div>
          <Link href="/pricing" className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors flex-shrink-0">
            Upgrade
          </Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Usage */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> Generations Used
          </div>
          <div className="text-3xl font-bold text-white mb-2">{used}</div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{limit >= 99999 ? 'Unlimited' : `of ${limit}`}</span>
            <span>{limit >= 99999 ? '∞' : `${usagePct}%`}</span>
          </div>
          {limit < 99999 && (
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${usagePct > 80 ? 'bg-red-400' : 'bg-sky-400'}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          )}
        </div>

        {/* Content pieces */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
            <FileText className="w-3.5 h-3.5" /> Content Pieces
          </div>
          <div className="text-3xl font-bold text-white">{history.length}</div>
          <p className="text-slate-500 text-xs mt-1">Last 10 shown</p>
        </div>

        {/* Words generated */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
            <Share2 className="w-3.5 h-3.5" /> Words Generated
          </div>
          <div className="text-3xl font-bold text-white">
            {history.reduce((sum: number, h: { total_words?: number }) => sum + (h.total_words ?? 0), 0).toLocaleString()}
          </div>
          <p className="text-slate-500 text-xs mt-1">Total across all content</p>
        </div>

        {/* Plan */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
            <CheckCircle className="w-3.5 h-3.5" /> Current Plan
          </div>
          <div className="text-2xl font-bold text-white capitalize mb-1">{plan}</div>
          {plan !== 'business' ? (
            <Link href="/pricing" className="text-sky-400 hover:text-sky-300 text-xs flex items-center gap-1">
              Upgrade <ArrowUpRight className="w-3 h-3" />
            </Link>
          ) : (
            <span className="text-violet-400 text-xs">Top tier</span>
          )}
        </div>
      </div>

      {/* Usage chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-white mb-6">Daily Generations — Last 14 Days</h2>
        <div className="flex items-end gap-2 h-24">
          {days.map((day) => {
            const count = countsByDay[day] ?? 0
            const height = count === 0 ? 4 : Math.max(8, Math.round((count / maxCount) * 96))
            const isToday = day === now.toISOString().slice(0, 10)
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className={`w-full rounded-t-sm transition-all ${isToday ? 'bg-sky-400' : count > 0 ? 'bg-sky-500/60' : 'bg-white/10'}`}
                  style={{ height: `${height}px` }}
                  title={`${day}: ${count} generation${count !== 1 ? 's' : ''}`}
                />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-slate-600 text-xs mt-2">
          <span>14 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Recent content table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Recent Content</h2>
          <Link href="/" className="text-sky-400 hover:text-sky-300 text-xs flex items-center gap-1">
            Generate new <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        {history.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No content generated yet.</p>
            <Link href="/" className="text-sky-400 hover:text-sky-300 text-sm mt-2 inline-block">
              Generate your first piece
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-white/10">
                  <th className="text-left px-6 py-3 font-medium">Topic</th>
                  <th className="text-right px-6 py-3 font-medium">Formats</th>
                  <th className="text-right px-6 py-3 font-medium">Words</th>
                  <th className="text-right px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((h: { id: string; topic: string; formats_count?: number; total_words?: number; created_at: string }) => (
                  <tr key={h.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-white font-medium truncate max-w-xs">{h.topic}</td>
                    <td className="px-6 py-3 text-slate-400 text-right">{h.formats_count ?? 16}</td>
                    <td className="px-6 py-3 text-slate-400 text-right">{(h.total_words ?? 0).toLocaleString()}</td>
                    <td className="px-6 py-3 text-slate-500 text-right text-xs">
                      {new Date(h.created_at).toLocaleDateString()}
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
