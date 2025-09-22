import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // Ensure /auth/callback route is handled even if providers append fragments
  // No heavy logic; just pass-through. This file exists to make the route edge-aware.
  return NextResponse.next()
}

export const config = {
  matcher: ['/auth/:path*'],
}
