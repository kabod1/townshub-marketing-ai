import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch {
    // If Supabase middleware fails, allow the request through rather than 500ing
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Only run middleware on routes that need auth.
     * Exclude: static files, images, API routes, OG image, icons, service worker.
     */
    '/(dashboard|account|admin|login|register)(.*)',
  ],
}
