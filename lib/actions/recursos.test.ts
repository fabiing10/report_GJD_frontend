import { describe, it, expect, vi, beforeEach } from 'vitest'

const createClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({ createClient }))
const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath }))

function makeSupabase(opts: { maxOrden?: number | null }) {
  const captured: { insert?: unknown; updates: Array<{ id: string; data: unknown }>; deletedId?: string } = { updates: [] }
  const supabase = {
    from() {
      const b: Record<string, unknown> = {}
      const chain = () => b
      b.select = chain
      b.eq = chain
      b.order = chain
      b.limit = chain
      b.maybeSingle = () => Promise.resolve({ data: { orden: opts.maxOrden ?? null }, error: null })
      b.insert = (payload: unknown) => {
        captured.insert = payload
        return Promise.resolve({ error: null })
      }
      b.update = (payload: unknown) => ({
        eq: (_c: string, id: string) => {
          captured.updates.push({ id, data: payload })
          return Promise.resolve({ error: null })
        },
      })
      b.delete = () => ({
        eq: (_c: string, id: string) => {
          captured.deletedId = id
          return Promise.resolve({ error: null })
        },
      })
      return b
    },
  }
  return { supabase, captured }
}

const baseInput = {
  proyecto_id: 'p1',
  tipo: 'link' as const,
  titulo: 'Doc',
  url: 'https://x.test',
  thumbnail_url: null,
  duracion_segundos: null,
}

describe('recursos actions', () => {
  beforeEach(() => {
    createClient.mockReset()
    revalidatePath.mockReset()
  })

  it('crearRecurso inserta con orden = max+1', async () => {
    const { supabase, captured } = makeSupabase({ maxOrden: 0 })
    createClient.mockResolvedValue(supabase)
    const { crearRecurso } = await import('./recursos')
    await crearRecurso(baseInput)
    expect((captured.insert as { orden: number }).orden).toBe(1)
    expect((captured.insert as { url: string }).url).toBe('https://x.test')
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('actualizarRecurso actualiza por id', async () => {
    const { supabase, captured } = makeSupabase({})
    createClient.mockResolvedValue(supabase)
    const { actualizarRecurso } = await import('./recursos')
    await actualizarRecurso('r1', baseInput)
    expect(captured.updates[0]!.id).toBe('r1')
  })

  it('eliminarRecurso borra por id', async () => {
    const { supabase, captured } = makeSupabase({})
    createClient.mockResolvedValue(supabase)
    const { eliminarRecurso } = await import('./recursos')
    await eliminarRecurso('r9')
    expect(captured.deletedId).toBe('r9')
  })
})
