import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if accessing dashboard
  if (pathname.startsWith('/dashboard')) {
    // In a client-side only app, we'll handle auth check on the client
    // This middleware ensures the route exists but actual auth is handled in the page component
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
