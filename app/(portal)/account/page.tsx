'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User, Lock, CreditCard, Trash2, Loader2, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react'

interface Profile {
  full_name: string
  plan: string
  generations_used: number
  generations_limit: number
  stripe_customer_id: string | null
  paypal_subscription_id: string | null
}

export default function AccountPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setFullName(data.full_name ?? '')
      }
    }
    load()
  }, [])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    if (error) setMessage({ type: 'error', text: error.message })
    else { setMessage({ type: 'success', text: 'Profile updated.' }); setProfile(p => p ? { ...p, full_name: fullName } : p) }
    setSaving(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setMessage({ type: 'error', text: 'Passwords do not match.' }); return }
    if (newPassword.length < 8) { setMessage({ type: 'error', text: 'Password must be at least 8 characters.' }); return }
    setSavingPassword(true)
    setMessage(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setMessage({ type: 'error', text: error.message })
    else { setMessage({ type: 'success', text: 'Password updated successfully.' }); setNewPassword(''); setConfirmPassword('') }
    setSavingPassword(false)
  }

  async function handleManageBilling() {
    setPortalLoading(true)
    const res = await fetch('/api/payments/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { setMessage({ type: 'error', text: data.error ?? 'Could not open billing portal.' }); setPortalLoading(false) }
  }

  const used = profile?.generations_used ?? 0
  const limit = profile?.generations_limit ?? 5
  const plan = profile?.plan ?? 'free'
  const usagePct = limit >= 99999 ? 0 : Math.min(100, Math.round((used / limit) * 100))

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your profile, password, and billing.</p>
      </div>

      {message && (
        <div className={`flex items-center gap-2 rounded-xl p-3 mb-6 text-sm ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {message.text}
        </div>
      )}

      {/* Profile */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-white">Profile</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-white/5 border border-white/10 text-slate-500 rounded-xl py-2.5 px-3 text-sm cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Profile
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-white">Change Password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword || !newPassword}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {savingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>

      {/* Billing */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-white">Plan & Billing</h2>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-semibold capitalize">{plan} Plan</p>
            <p className="text-slate-400 text-xs mt-0.5">
              {limit >= 99999 ? 'Unlimited generations' : `${used} / ${limit} generations used`}
            </p>
          </div>
          {plan !== 'business' && (
            <Link href="/pricing" className="text-sky-400 hover:text-sky-300 text-sm flex items-center gap-1">
              Upgrade <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {limit < 99999 && (
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-4">
            <div
              className={`h-1.5 rounded-full ${usagePct > 80 ? 'bg-red-400' : 'bg-sky-400'}`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
        )}

        {profile?.stripe_customer_id && (
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-white/10 disabled:opacity-50"
          >
            {portalLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Manage Billing
          </button>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Deleting your account is permanent. All your data, content history, and subscription will be removed.
        </p>
        <button
          onClick={() => {
            if (confirm('Are you sure? This cannot be undone.')) {
              // Account deletion handled via Supabase admin function
              alert('Please contact support@townshub.com to delete your account.')
            }
          }}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-red-500/30"
        >
          Delete Account
        </button>
      </div>
    </div>
  )
}
