import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ALLOWED_EMAILS = (process.env['ADMIN_ALLOWED_EMAILS'] ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) return NextResponse.next()
  if (pathname.startsWith('/admin/login')) return NextResponse.next()

  const sessionEmail = request.cookies.get('admin_session')?.value

  if (!sessionEmail) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(sessionEmail.toLowerCase())) {
    const response = NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
    response.cookies.delete('admin_session')
    return response
  }

  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
