import { describe, it, expect, vi, beforeEach } from 'vitest'

const createBrowserClient = vi.fn(() => ({ __client: true }))
vi.mock('@supabase/ssr', () => ({ createBrowserClient }))

describe('createClient (browser)', () => {
  beforeEach(() => {
    createBrowserClient.mockClear()
    process.env['NEXT_PUBLIC_SUPABASE_URL'] = 'https://x.supabase.co'
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = 'anon-key'
  })

  it('crea el cliente con url y anon key de entorno', async () => {
    const { createClient } = await import('./client')
    const client = createClient()
    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://x.supabase.co',
      'anon-key'
    )
    expect(client).toEqual({ __client: true })
  })
})
