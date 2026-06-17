import { describe, it, expect, vi, beforeEach } from 'vitest'

const { createClient, revalidatePath, ops } = vi.hoisted(() => {
  const ops: { table?: string; method?: string } = {}
  const builder: Record<string, unknown> = {}
  builder['insert'] = () => { ops.method = 'insert'; return { error: null } }
  builder['update'] = () => { ops.method = 'update'; return builder }
  builder['delete'] = () => { ops.method = 'delete'; return builder }
  builder['eq'] = () => builder
  builder['select'] = () => builder
  builder['order'] = () => builder
  builder['limit'] = () => builder
  builder['maybeSingle'] = () => Promise.resolve({ data: { orden: 1 } })
  builder['then'] = (r: (v: { error: null }) => unknown) => r({ error: null })
  const supabase = { from: (t: string) => { ops.table = t; return builder } }
  return { createClient: vi.fn(async () => supabase), revalidatePath: vi.fn(), ops }
})
vi.mock('@/lib/supabase/server', () => ({ createClient }))
vi.mock('next/cache', () => ({ revalidatePath }))

describe('actions ejes', () => {
  beforeEach(() => revalidatePath.mockClear())

  it('crearEje valida e inserta', async () => {
    const { crearEje } = await import('./ejes')
    await crearEje({ nombre: 'Gobernanza', color_hex: '#3B82F6' })
    expect(ops.table).toBe('ejes_transversales')
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('crearEje rechaza color inválido', async () => {
    const { crearEje } = await import('./ejes')
    await expect(crearEje({ nombre: 'x', color_hex: 'nope' })).rejects.toThrow()
  })

  it('asignarEjeProyecto inserta en proyecto_ejes', async () => {
    const { asignarEjeProyecto } = await import('./ejes')
    await asignarEjeProyecto('p1', 'e1')
    expect(ops.table).toBe('proyecto_ejes')
  })
})
