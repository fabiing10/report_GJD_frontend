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
  proyecto_plazo_id: 'pl1',
  texto: 'Criterio',
  descripcion: null,
  peso: 1,
  estado: 'pendiente' as const,
}

describe('criterios actions', () => {
  beforeEach(() => {
    createClient.mockReset()
    revalidatePath.mockReset()
  })

  it('crearCriterio inserta con orden = max+1', async () => {
    const { supabase, captured } = makeSupabase({ maxOrden: 2 })
    createClient.mockResolvedValue(supabase)
    const { crearCriterio } = await import('./criterios')
    await crearCriterio(baseInput)
    expect((captured.insert as { orden: number }).orden).toBe(3)
    expect((captured.insert as { texto: string }).texto).toBe('Criterio')
  })

  it('actualizarCriterio cambia estado a cumplido', async () => {
    const { supabase, captured } = makeSupabase({})
    createClient.mockResolvedValue(supabase)
    const { actualizarCriterio } = await import('./criterios')
    await actualizarCriterio('cr1', { ...baseInput, estado: 'cumplido' })
    expect(captured.updates[0]!.id).toBe('cr1')
    expect((captured.updates[0]!.data as { estado: string }).estado).toBe('cumplido')
  })

  it('eliminarCriterio borra por id', async () => {
    const { supabase, captured } = makeSupabase({})
    createClient.mockResolvedValue(supabase)
    const { eliminarCriterio } = await import('./criterios')
    await eliminarCriterio('cr9')
    expect(captured.deletedId).toBe('cr9')
  })

  it('reordenarCriterios actualiza orden de cada id', async () => {
    const { supabase, captured } = makeSupabase({})
    createClient.mockResolvedValue(supabase)
    const { reordenarCriterios } = await import('./criterios')
    await reordenarCriterios('pl1', ['x', 'y'])
    expect(captured.updates.map((u) => u.id)).toEqual(['x', 'y'])
    expect((captured.updates[1]!.data as { orden: number }).orden).toBe(1)
  })
})
