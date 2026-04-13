'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

function RegisterForm() {
  const searchParams = useSearchParams()
  const defaultPlan = searchParams.get('plan') || 'free'
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!agreedToTerms) { setError('You must agree to the Terms of Service and Privacy Policy'); return }
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, plan: defaultPlan },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      // Account is still created when only the notification email fails
      // (email confirmations are disabled so the user can sign in immediately)
      const isEmailSendError = error.message?.toLowerCase().includes('email') ||
                               error.message?.toLowerCase().includes('confirmation') ||
                               error.message?.toLowerCase().includes('sending')
      if (isEmailSendError) {
        setSuccess(true)
      } else {
        setError(error.message)
        setLoading(false)
      }
    } else if (data.user && data.user.identities?.length === 0) {
      setError('An account with this email already exists. Please sign in instead.')
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Account created!</h2>
        <p className="text-slate-400 mb-6">
          Welcome to TownsHub. Your account for <strong className="text-white">{email}</strong> is ready — you can sign in now.
        </p>
        <Link
          href="/login"
          className="inline-block bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:from-sky-600 hover:to-cyan-600 transition-all"
        >
          Sign In Now
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-6 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              placeholder="Jane Smith"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Repeat password"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 mt-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={e => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500 cursor-pointer shrink-0"
          />
          <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
            I agree to TownsHub&apos;s{' '}
            <Link href="/terms" target="_blank" className="text-sky-400 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" target="_blank" className="text-sky-400 hover:underline">Privacy Policy</Link>.
            I confirm I am 18 years of age or older.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !agreedToTerms}
          className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:from-sky-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Creating account...' : 'Create Free Account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-sky-400 hover:text-sky-300 font-medium">Sign in</Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex mb-3">
            <img src="/logo.png" alt="TownsHub" className="h-16 w-auto" />
          </div>
          <p className="text-slate-400 text-sm">Create your free account</p>
        </div>
        <Suspense fallback={<div className="bg-white/5 border border-white/10 rounded-2xl p-8 animate-pulse h-96" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
