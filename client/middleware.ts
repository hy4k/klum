import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/api/:path*', '/admin/:path*']
}

export async function middleware(request: NextRequest) {
  // Your existing middleware logic
  return NextResponse.next()
}