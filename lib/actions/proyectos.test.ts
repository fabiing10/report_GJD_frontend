import { describe, it, expect, vi, beforeEach } from 'vitest'

const createClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({ createClient }))
const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath }))

interface Captured {
  insert?: unknown
  update?: unknown
  deletedId?: string
  updates: Array<{ id: string; data: unknown }>
}

function makeSupabase(opts: {
  maxOrden?: number | null
  rows?: Record<string, unknown[]>
}) {
  const captured: Captured = { updates: [] }
  const tables = opts.rows ?? {}
  const supabase = {
    from(table: string) {
      const rows = tables[table] ?? []
      const b: Record<string, unknown> = {}
      const chain = () => b
      b.select = chain
      b.eq = (col: string, val: string) => {
        b._eqCol = col
        b._eqVal = val
        return b
      }
      b.order = chain
      b.limit = chain
      b.maybeSingle = () =>
        Promise.resolve({ data: { orden: opts.maxOrden ?? null }, error: null })
      b.insert = (payload: unknown) => {
        captured.insert = payload
        return { select: () => ({ single: () => Promise.resolve({ data: { id: 'new-id' }, error: null }) }) }
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
      b.then = (res: (r: { data: unknown[]; error: null }) => void) =>
        res({ data: rows, error: null })
      return b
    },
  }
  return { supabase, captured }
}

const baseInput = {
  componente_id: 'c1',
  slug: 'p',
  codigo: null,
  nombre: 'Proyecto',
  descripcion_corta: null,
  descripcion_larga: null,
  estado: 'no_iniciado' as const,
  responsable: null,
  fecha_inicio: null,
  fecha_fin: null,
  avance_override: null,
}

describe('proyectos actions', () => {
  beforeEach(() => {
    createClient.mockReset()
    revalidatePath.mockReset()
  })

  it('crearProyecto inserta con orden = max+1', async () => {
    const { supabase, captured } = makeSupabase({ maxOrden: 4 })
    createClient.mockResolvedValue(supabase)
    const { crearProyecto } = await import('./proyectos')
    await crearProyecto(baseInput)
    expect((captured.insert as { orden: number }).orden).toBe(5)
    expect((captured.insert as { nombre: string }).nombre).toBe('Proyecto')
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('crearProyecto usa orden 0 cuando no hay previos', async () => {
    const { supabase, captured } = makeSupabase({ maxOrden: null })
    createClient.mockResolvedValue(supabase)
    const { crearProyecto } = await import('./proyectos')
    await crearProyecto(baseInput)
    expect((captured.insert as { orden: number }).orden).toBe(0)
  })

  it('actualizarProyecto actualiza por id', async () => {
    const { supabase, captured } = makeSupabase({})
    createClient.mockResolvedValue(supabase)
    const { actualizarProyecto } = await import('./proyectos')
    await actualizarProyecto('p1', baseInput)
    expect(captured.updates[0]!.id).toBe('p1')
  })

  it('eliminarProyecto borra por id', async () => {
    const { supabase, captured } = makeSupabase({})
    createClient.mockResolvedValue(supabase)
    const { eliminarProyecto } = await import('./proyectos')
    await eliminarProyecto('p9')
    expect(captured.deletedId).toBe('p9')
  })

  it('reordenarProyectos actualiza el orden de cada id', async () => {
    const { supabase, captured } = makeSupabase({})
    createClient.mockResolvedValue(supabase)
    const { reordenarProyectos } = await import('./proyectos')
    await reordenarProyectos('c1', ['a', 'b', 'c'])
    expect(captured.updates.map((u) => u.id)).toEqual(['a', 'b', 'c'])
    expect((captured.updates[2]!.data as { orden: number }).orden).toBe(2)
  })

  it('crearProyecto rechaza input inválido', async () => {
    const { supabase } = makeSupabase({ maxOrden: 0 })
    createClient.mockResolvedValue(supabase)
    const { crearProyecto } = await import('./proyectos')
    await expect(
      crearProyecto({ ...baseInput, nombre: '' })
    ).rejects.toThrow()
  })
})
