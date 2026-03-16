import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/update-password`)
  }

  // Check user's plan — free users go straight to the generator
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle()
      if (!profile || profile.plan === 'free') {
        return NextResponse.redirect(`${origin}/`)
      }
    }
  } catch (_) {}

  return NextResponse.redirect(`${origin}/dashboard`)
}
