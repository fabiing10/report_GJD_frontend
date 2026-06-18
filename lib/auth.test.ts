import { describe, it, expect, vi, beforeEach } from 'vitest'

const getUser = vi.fn()
const maybeSingle = vi.fn()
const supabase = {
  auth: { getUser },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
}
const createClient = vi.fn(async () => supabase)
vi.mock('@/lib/supabase/server', () => ({ createClient }))

describe('requireAdmin / getCurrentUserRole', () => {
  beforeEach(() => {
    getUser.mockReset()
    maybeSingle.mockReset()
  })

  it('lanza si no hay sesión', async () => {
    getUser.mockResolvedValue({ data: { user: null } })
    const { requireAdmin } = await import('./auth')
    await expect(requireAdmin()).rejects.toThrow()
  })

  it('lanza si el rol no es admin', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    maybeSingle.mockResolvedValue({ data: { role: 'usuario' } })
    const { requireAdmin } = await import('./auth')
    await expect(requireAdmin()).rejects.toThrow()
  })

  it('devuelve userId si es admin', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    maybeSingle.mockResolvedValue({ data: { role: 'admin' } })
    const { requireAdmin } = await import('./auth')
    await expect(requireAdmin()).resolves.toEqual({ userId: 'u1' })
  })

  it('isCurrentUserAdmin: true solo para admin', async () => {
    const { isCurrentUserAdmin } = await import('./auth')

    getUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    maybeSingle.mockResolvedValue({ data: { role: 'admin' } })
    await expect(isCurrentUserAdmin()).resolves.toBe(true)

    maybeSingle.mockResolvedValue({ data: { role: 'usuario' } })
    await expect(isCurrentUserAdmin()).resolves.toBe(false)

    getUser.mockResolvedValue({ data: { user: null } })
    await expect(isCurrentUserAdmin()).resolves.toBe(false)
  })
})
