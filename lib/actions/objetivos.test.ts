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
    expect(revalidatePath).toHaveBeenCalled()
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
