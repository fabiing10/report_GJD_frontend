import { describe, it, expect, vi, beforeEach } from 'vitest'

function makeSupabase(tables) {
  return {
    from(table) {
      const rows = tables[table] ?? []
      const b = {}
      const chain = () => b
      b.select = chain
      b.eq = chain
      b.in = chain
      b.order = chain
      b.maybeSingle = () => Promise.resolve({ data: rows[0] ?? null })
      b.then = (res) => res({ data: rows })
      return b
    },
  }
}
const createClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({ createClient }))

describe('admin-queries', () => {
  beforeEach(() => createClient.mockReset())

  it('getAllInformes devuelve la lista', async () => {
    createClient.mockResolvedValue(
      makeSupabase({ v_informes_con_avance: [{ id: 'i1', titulo: 'T' }] })
    )
    const { getAllInformes } = await import('./admin-queries')
    const r = await getAllInformes()
    expect(r.map((x) => x.id)).toEqual(['i1'])
  })

  it('getProyectoEditable ensambla plazos y criterios', async () => {
    createClient.mockResolvedValue(
      makeSupabase({
        v_proyectos_con_avance: [{ id: 'p1', nombre: 'P', componente_id: 'c1' }],
        v_plazos_con_avance: [{ id: 'pl1', proyecto_id: 'p1', plazo: 'corto', orden: 0 }],
        criterios: [{ id: 'cr1', proyecto_plazo_id: 'pl1', orden: 0 }],
        proyecto_recursos: [],
        actividades: [],
      })
    )
    const { getProyectoEditable } = await import('./admin-queries')
    const p = await getProyectoEditable('p1')
    expect(p?.plazos[0]?.criterios[0]?.id).toBe('cr1')
  })
})
