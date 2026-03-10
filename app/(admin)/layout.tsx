import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, Users, LogOut, Shield, DollarSign, BarChart3, Activity } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Admin'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="TownsHub" className="h-10 w-auto" />
            <span className="ml-2 text-xs text-violet-400 font-medium">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest px-3 pb-1 pt-2">Analytics</p>
          {[
            { href: '/admin', label: 'Overview', icon: LayoutDashboard },
            { href: '/admin/users', label: 'Users', icon: Users },
            { href: '/admin/revenue', label: 'Revenue', icon: DollarSign },
            { href: '/admin/usage', label: 'Usage', icon: Activity },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm font-medium group"
              >
                <Icon className="w-4 h-4 group-hover:text-violet-400 transition-colors" />
                {item.label}
              </Link>
            )
          })}
          <div className="pt-3">
            <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest px-3 pb-1">App</p>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm font-medium group"
            >
              <BarChart3 className="w-4 h-4 group-hover:text-violet-400 transition-colors" />
              User Dashboard
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{displayName}</p>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-violet-400" />
                <p className="text-violet-400 text-xs">Admin</p>
              </div>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-slate-400 hover:text-red-400 text-xs rounded-lg hover:bg-white/5 transition-all"
            >
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
