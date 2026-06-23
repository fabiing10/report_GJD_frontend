import { describe, it, expect, vi, beforeEach } from 'vitest'

const { createClient, revalidatePath, ops } = vi.hoisted(() => {
  const ops: { table?: string; payload?: unknown; method?: string } = {}
  const builder: Record<string, unknown> = {}
  builder['insert'] = (p: unknown) => { ops.method = 'insert'; ops.payload = p; return { error: null } }
  builder['update'] = (p: unknown) => { ops.method = 'update'; ops.payload = p; return builder }
  builder['delete'] = () => { ops.method = 'delete'; return builder }
  builder['eq'] = () => builder
  builder['select'] = () => builder
  builder['order'] = () => builder
  builder['limit'] = () => builder
  builder['maybeSingle'] = () => Promise.resolve({ data: { orden: 2 } })
  // awaitable: las escrituras (update/delete + .eq) resuelven a {error:null}
  builder['then'] = (resolve: (v: { error: null }) => unknown) => resolve({ error: null })
  const supabase = { from: (t: string) => { ops.table = t; return builder } }
  return { createClient: vi.fn(async () => supabase), revalidatePath: vi.fn(), ops }
})
vi.mock('@/lib/supabase/server', () => ({ createClient }))
vi.mock('next/cache', () => ({ revalidatePath }))

const base = { proyecto_id: 'p1', titulo: 'HU-1', descripcion: null, tipo: 'hu', plazo: 'corto', estado: 'pendiente', peso: 1 }

describe('actions objetivos', () => {
  beforeEach(() => { revalidatePath.mockClear() })

  it('crearObjetivo valida e inserta con orden=max+1', async () => {
    const { crearObjetivo } = await import('./objetivos')
    await crearObjetivo(base)
    expect(ops.table).toBe('objetivos')
    expect((ops.payload as { orden: number }).orden).toBe(3)
    // fecha_limite es opcional: ausente → null
    expect((ops.payload as { fecha_limite: string | null }).fecha_limite).toBeNull()
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('crearObjetivo conserva fecha_limite cuando se provee', async () => {
    const { crearObjetivo } = await import('./objetivos')
    await crearObjetivo({ ...base, fecha_limite: '2027-12-15' })
    expect((ops.payload as { fecha_limite: string | null }).fecha_limite).toBe('2027-12-15')
  })

  it('cambiarPlazoObjetivo actualiza solo el plazo (validado)', async () => {
    const { cambiarPlazoObjetivo } = await import('./objetivos')
    await cambiarPlazoObjetivo('obj-1', 'mediano')
    expect(ops.table).toBe('objetivos')
    expect(ops.method).toBe('update')
    expect(ops.payload).toEqual({ plazo: 'mediano' })
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('cambiarPlazoObjetivo rechaza plazo inválido (Zod)', async () => {
    const { cambiarPlazoObjetivo } = await import('./objetivos')
    // @ts-expect-error plazo inválido a propósito
    await expect(cambiarPlazoObjetivo('obj-1', 'xxx')).rejects.toThrow()
  })

  it('crearObjetivo rechaza tipo inválido (Zod)', async () => {
    const { crearObjetivo } = await import('./objetivos')
    await expect(crearObjetivo({ ...base, tipo: 'xxx' })).rejects.toThrow()
  })

  it('reordenarObjetivos actualiza orden', async () => {
    const { reordenarObjetivos } = await import('./objetivos')
    await reordenarObjetivos('p1', ['a', 'b'])
    expect(revalidatePath).toHaveBeenCalled()
  })
})
