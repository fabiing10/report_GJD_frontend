import { describe, it, expect, vi, beforeEach } from 'vitest'

const createSupabaseClient = vi.fn(() => ({ __admin: true }))
vi.mock('@supabase/supabase-js', () => ({ createClient: createSupabaseClient }))

describe('createAdminClient (service role)', () => {
  beforeEach(() => {
    createSupabaseClient.mockClear()
    process.env['NEXT_PUBLIC_SUPABASE_URL'] = 'https://x.supabase.co'
    process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'service-key'
  })

  it('usa la service role key y desactiva la persistencia de sesión', async () => {
    const { createAdminClient } = await import('./admin')
    createAdminClient()
    expect(createSupabaseClient).toHaveBeenCalledWith(
      'https://x.supabase.co',
      'service-key',
      { auth: { persistSession: false, autoRefreshToken: false } }
    )
  })
})
