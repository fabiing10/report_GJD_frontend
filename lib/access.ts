import type { RoleEnum } from '@/types/domain'

/** Rutas accesibles sin sesión. */
const PUBLIC_PREFIXES = ['/login', '/auth']

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

/**
 * Decide a dónde redirigir según sesión y rol. Pura.
 * Devuelve la ruta destino, o null si se permite continuar.
 */
export function decideRedirect(
  pathname: string,
  isAuthenticated: boolean,
  role: RoleEnum | null
): string | null {
  if (isPublic(pathname)) {
    // Ya autenticado y entrando al login → al reporte.
    if (isAuthenticated && pathname.startsWith('/login')) return '/'
    return null
  }

  if (!isAuthenticated) return '/login'

  // Zona admin: solo rol admin.
  if (pathname.startsWith('/admin') && role !== 'admin') return '/'

  return null
}
