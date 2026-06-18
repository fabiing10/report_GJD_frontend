import { createClient } from '@/lib/supabase/server'
import type { RoleEnum } from '@/types/domain'

/** Devuelve el id y rol del usuario actual, o null si no hay sesión. */
export async function getCurrentUserRole(): Promise<{ userId: string; role: RoleEnum } | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  const role = (data as { role?: RoleEnum } | null)?.role
  return role ? { userId: user.id, role } : null
}

/** True si el usuario actual es admin. Para UI condicional en el frontoffice. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const current = await getCurrentUserRole()
  return current?.role === 'admin'
}

/** Garantiza que el caller es admin. Lanza si no. Para actions con service-role. */
export async function requireAdmin(): Promise<{ userId: string }> {
  const current = await getCurrentUserRole()
  if (!current || current.role !== 'admin') {
    throw new Error('No autorizado')
  }
  return { userId: current.userId }
}
