import { type NextRequest, NextResponse } from 'next/server'

// Minimal middleware — no Supabase import (avoids Edge Runtime crashes).
// Auth is verified inside each protected layout using server components.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Detect any Supabase session cookie (sb-<ref>-auth-token)
  const hasSession = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))

  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/account') || pathname.startsWith('/admin')
  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthPage && hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/(dashboard|account|admin|login|register)(.*)'],
}
