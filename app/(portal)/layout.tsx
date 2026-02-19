import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Zap, LayoutDashboard, Wand2, User, CreditCard, LogOut, Rocket } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/', label: 'Generate Content', icon: Wand2 },
  { href: '/account', label: 'Account', icon: User },
]

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan, avatar_url')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const plan = profile?.plan || 'free'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TownsHub</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm font-medium group"
              >
                <Icon className="w-4 h-4 group-hover:text-sky-400 transition-colors" />
                {item.label}
              </Link>
            )
          })}

          {plan !== 'business' && (
            <div className="pt-4">
              <Link
                href="/pricing"
                className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 border border-sky-500/30 text-sky-400 hover:text-sky-300 rounded-xl transition-all text-sm font-medium"
              >
                <Rocket className="w-4 h-4" />
                Upgrade Plan
              </Link>
            </div>
          )}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{displayName}</p>
              <p className="text-slate-400 text-xs capitalize">{plan} plan</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/account"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-slate-400 hover:text-white text-xs rounded-lg hover:bg-white/5 transition-all"
            >
              <CreditCard className="w-3 h-3" /> Billing
            </Link>
            <form action="/api/auth/signout" method="POST" className="flex-1">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-slate-400 hover:text-red-400 text-xs rounded-lg hover:bg-white/5 transition-all"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
