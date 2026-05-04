import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ALLOWED_EMAILS = (process.env['ADMIN_ALLOWED_EMAILS'] ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export async function POST(req: NextRequest) {
  const body = await req.json() as { email?: string }
  const email = body.email?.toLowerCase() ?? ''

  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
  }

  if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(email)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_session', email, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('admin_session')
  return response
}
