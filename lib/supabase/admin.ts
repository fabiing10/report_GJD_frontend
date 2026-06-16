import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase con service-role: ignora RLS.
 * SOLO para scripts de servidor (seed/migración). Nunca exponer al cliente.
 */
export function createAdminClient() {
  return createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
